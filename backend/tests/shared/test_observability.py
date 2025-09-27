from __future__ import annotations

from io import StringIO

import asyncio
from unittest.mock import patch

from django.core.management import call_command
from django.http import HttpResponse
from django.test import RequestFactory, SimpleTestCase, TestCase

from config.celery import (
    instrument_task_failure,
    instrument_task_postrun,
    instrument_task_prerun,
)
from shared.middleware.database_optimization import CacheOptimizationMiddleware
from shared.middleware.enhanced_middleware import RequestLoggingMiddleware
from shared.middleware.performance_middleware import APIPerformanceMiddleware
from shared.observability import observability
from shared.monitoring import monitoring_engine


class ObservabilityInstrumentationTests(SimpleTestCase):
    """Validate the lightweight observability client and middleware integrations."""

    def setUp(self):
        super().setUp()
        observability.reset()
        monitoring_engine.clear_observability_streams()
        monitoring_engine.alert_manager.active_alerts.clear()
        monitoring_engine.alert_manager.alert_history.clear()
        self.factory = RequestFactory()

    def test_span_context_manager_records_tags(self):
        with observability.span("unit.test", tags={"component": "tests"}) as span:
            span.add_tag("phase", "6")
            span.set_status("ok")

        spans = observability.get_completed_spans("unit.test")
        self.assertEqual(len(spans), 1)
        self.assertEqual(spans[0].tags["component"], "tests")
        self.assertEqual(spans[0].tags["phase"], "6")
        self.assertEqual(spans[0].status, "ok")

    def test_request_logging_middleware_creates_span(self):
        def get_response(request):
            return HttpResponse("ok", status=200)

        middleware = RequestLoggingMiddleware(get_response)
        request = self.factory.get("/healthz")
        response = middleware(request)

        self.assertEqual(response.status_code, 200)
        spans = observability.get_completed_spans("http.request")
        self.assertEqual(len(spans), 1)
        self.assertEqual(spans[0].tags["status_code"], "200")

    def test_api_performance_middleware_records_metric(self):
        def get_response(request):
            return HttpResponse("perf", status=204)

        middleware = APIPerformanceMiddleware(get_response)
        request = self.factory.get("/metrics")
        response = middleware(request)

        self.assertEqual(response.status_code, 204)
        metrics = observability.get_metrics("http.response_time_ms")
        self.assertEqual(len(metrics), 1)
        self.assertEqual(metrics[0].tags["method"], "GET")
        self.assertEqual(metrics[0].tags["status"], "204")

    def test_cache_middleware_records_backend_metric(self):
        def get_response(request):
            return HttpResponse("cache")

        middleware = CacheOptimizationMiddleware(get_response)
        request = self.factory.get("/cache-check")
        response = middleware(request)

        self.assertIsInstance(response, HttpResponse)
        metrics = observability.get_metrics("cache.backend.attached")
        self.assertTrue(metrics)
        self.assertIn("backend", metrics[0].tags)

    def test_celery_signal_records_runtime_metric(self):
        class DummyTask:
            name = "dummy.task"

        observability.reset()
        instrument_task_prerun(sender=DummyTask, task_id="abc123")
        instrument_task_postrun(sender=DummyTask, task_id="abc123", state="SUCCESS", retval="ok")

        spans = observability.get_completed_spans("celery.task")
        self.assertEqual(len(spans), 1)
        self.assertEqual(spans[0].tags["task_name"], "dummy.task")

        metrics = observability.get_metrics("celery.task.runtime_ms")
        self.assertEqual(len(metrics), 1)
        self.assertEqual(metrics[0].tags["status"], "success")

    def test_celery_failure_records_event(self):
        class DummyTask:
            name = "dummy.failure"

        observability.reset()
        instrument_task_prerun(sender=DummyTask, task_id="fail-task")
        instrument_task_failure(sender=DummyTask, task_id="fail-task", exception=RuntimeError("boom"))

        spans = observability.get_completed_spans("celery.task")
        self.assertEqual(len(spans), 1)
        self.assertEqual(spans[0].status, "failure")

        events = observability.get_events("celery.task.failed")
        self.assertEqual(len(events), 1)
        self.assertIn("boom", events[0].tags["error"])

    def test_monitoring_engine_receives_forwarded_payloads(self):
        observability.reset()
        monitoring_engine.clear_observability_streams()

        observability.record_metric("test.metric", 1.0, tags={"component": "tests"})
        observability.record_event(
            "test.event",
            "integration",
            severity="info",
            tags={"component": "tests"},
        )
        with observability.span("test.span", tags={"component": "tests"}):
            pass

        payload = monitoring_engine.get_recent_observability_payload()
        self.assertEqual(len(payload['metrics']), 1)
        self.assertEqual(payload['metrics'][0]['name'], "test.metric")
        self.assertEqual(len(payload['events']), 1)
        self.assertEqual(payload['events'][0]['name'], "test.event")
        self.assertEqual(len(payload['spans']), 1)
        summary = payload['summary']
        self.assertGreaterEqual(summary.get('metrics_total', 0), 1.0)

    def test_observability_summary_exposed_in_monitoring_metrics(self):
        observability.reset()
        monitoring_engine.clear_observability_streams()
        monitoring_engine.alert_manager.active_alerts.clear()
        monitoring_engine.alert_manager.alert_history.clear()

        observability.record_event(
            "monitoring.alert.test",
            "failure",
            severity="error",
            tags={"component": "tests"},
        )

        summary = monitoring_engine.get_observability_summary()
        self.assertGreaterEqual(summary.get('events_total', 0), 1.0)
        self.assertGreaterEqual(summary.get('event_errors', 0), 1.0)
        self.assertTrue(monitoring_engine.alert_manager.active_alerts)

        with patch.object(monitoring_engine.system_collector, 'get_cpu_metrics', return_value={}):
            with patch.object(monitoring_engine.system_collector, 'get_memory_metrics', return_value={}):
                with patch.object(monitoring_engine.system_collector, 'get_disk_metrics', return_value={}):
                    with patch.object(monitoring_engine.system_collector, 'get_network_metrics', return_value={}):
                        with patch.object(monitoring_engine.system_collector, 'get_process_metrics', return_value={}):
                            with patch.object(monitoring_engine.database_collector, 'get_connection_metrics', return_value={}):
                                with patch.object(monitoring_engine.database_collector, 'get_query_performance_metrics', return_value={}):
                                    with patch.object(monitoring_engine.app_collector, 'get_user_activity_metrics', return_value={}):
                                        with patch.object(monitoring_engine.app_collector, 'get_api_metrics', return_value={}):
                                            metrics = asyncio.run(monitoring_engine.collect_all_metrics())
        self.assertIn('observability', metrics)


class ObservabilityManagementCommandTests(TestCase):
    """Ensure the verification command exercises cache and Celery plumbing."""

    def setUp(self):
        super().setUp()
        observability.reset()

    def test_verify_observability_command_reports_metrics(self):
        stdout = StringIO()
        call_command("verify_observability", stdout=stdout)
        output = stdout.getvalue()

        self.assertIn("Celery test task completed", output)
        self.assertTrue(observability.get_metrics("cache.roundtrip"))
        self.assertTrue(observability.get_completed_spans("celery.task"))
        self.assertTrue(observability.get_events("observability.check"))

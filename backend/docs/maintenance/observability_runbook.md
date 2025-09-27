# Observability & Operations Runbook

This runbook documents how to validate the Watch Party backend's operational plumbing once the core feature remediation is complete. It focuses on three pillars:

1. **Celery background workers** – confirm task execution, runtime metrics, and error signalling.
2. **Caching layers** – ensure the configured cache backend accepts read/write traffic and exposes instrumentation data.
3. **Application observability** – surface request, database, and task telemetry through the shared observability collector introduced in Phase 6.

The steps below assume you have completed database migrations and can run Django management commands from the project root.

---

## 1. Quick verification checklist

1. Activate the testing or staging settings profile:
   ```bash
   export DJANGO_SETTINGS_MODULE=config.settings.testing
   ```
2. Prime cache and Celery instrumentation in a single pass:
   ```bash
   python manage.py verify_observability
   ```
   The command performs a cache round-trip, executes the built-in `config.celery.test_task`, and prints a summary of recorded spans, metrics, and events.
3. Inspect the logs in `logs/performance.log` and `logs/django.log` for correlated entries. Each recorded span/metric also emits a structured log entry via the `watchparty.observability` logger.

If the command reports non-zero spans and metrics, the instrumentation hooks wired into middleware and Celery are functioning correctly.

---

## 2. Celery worker validation

1. Start a worker locally using the testing settings (the broker URL defaults to the in-memory backend when Redis is not available):
   ```bash
   celery -A config.celery worker -l info
   ```
2. In another shell, enqueue a real task:
   ```bash
   python manage.py shell -c "from config.tasks import cleanup_expired_sessions; cleanup_expired_sessions.delay()"
   ```
3. Watch the worker logs – the Phase 6 hooks record a `celery.task.started` event when the task begins and a `celery.task.completed` or `celery.task.failed` event when it exits. The `celery.task.runtime_ms` metric captures the execution duration with tags for the task name and completion status.
4. To inspect captured spans after the run, start a Django shell and query the observability client:
   ```python
   >>> from shared.observability import observability
   >>> observability.get_completed_spans("celery.task")
   [SpanRecord(span_id='…', name='celery.task', status='success', duration_ms=42.7, ...)]
   ```

If spans are not recorded, confirm that the worker imports `config.celery` (the `-A config.celery` flag is required) so the signal handlers are registered.

---

## 3. Cache tier validation

1. Identify the configured backend:
   ```python
   >>> from django.core.cache import caches
   >>> caches['default']
   <django.core.cache.backends.locmem.LocMemCache object at ...>
   ```
2. Use the observability client to review recent cache instrumentation emitted by the middleware and verification command:
   ```python
   >>> observability.get_metrics("cache.backend.attached")
   [MetricRecord(name='cache.backend.attached', value=1.0, tags={'backend': 'LocMemCache', 'path': '/api/...'}, ...)]
   >>> observability.get_metrics("cache.roundtrip")
   [MetricRecord(name='cache.roundtrip', value=1.0, tags={'backend': 'LocMemCache', 'result': 'hit'}, ...)]
   ```
3. For production deployments swap in Redis/Memcached credentials via environment variables, re-run `verify_observability`, and confirm the backend tag reflects the correct implementation.

---

## 4. HTTP & database observability

The middleware stack now records telemetry for critical web performance signals:

* `shared.middleware.enhanced_middleware.RequestLoggingMiddleware` opens a trace span for each request, tags it with the HTTP status code, and marks 5xx responses with an error status.
* `shared.middleware.performance_middleware.APIPerformanceMiddleware` captures response latency and raises a `http.request.slow` warning event when requests exceed `SLOW_REQUEST_WARNING_MS` (default 1500 ms).
* `shared.middleware.database_optimization.QueryOptimizationMiddleware` emits a `database.slow_query` event and logs the offending SQL when a query crosses the configured `SLOW_QUERY_THRESHOLD_MS`.
* `shared.middleware.database_optimization.QueryCountLimitMiddleware` records both a metric and an event when a request breaches `MAX_QUERIES_PER_REQUEST`, mirroring the value on the `X-Query-Count` response header.

To audit a specific endpoint:

```python
>>> observability.reset()
>>> from django.test import Client
>>> client = Client()
>>> client.get('/api/analytics/dashboard/')
>>> observability.get_metrics("http.response_time_ms")
[MetricRecord(...)]
>>> observability.get_completed_spans("http.request")
[SpanRecord(...)]
```

The above approach is useful for profiling new endpoints before shipping them to production.

---

## 5. Monitoring dashboard integration

The observability client now forwards every metric, event, and span into the shared
`MonitoringEngine` so the admin dashboards and alerting surfaces can consume the
same telemetry stream.

1. Open a Django shell and inspect the most recent payload forwarded to the monitoring engine:
   ```python
   >>> from shared.monitoring import monitoring_engine
   >>> monitoring_engine.get_recent_observability_payload()
   {
       'summary': {'metrics_total': 6.0, 'events_total': 2.0, 'spans_total': 3.0, ...},
       'metrics': [{'name': 'notifications.analytics.sent', 'value': 42.0, ...}, ...],
       'events': [{'name': 'analytics.pipeline.batch_processed', 'severity': 'info', ...}],
       'spans': [{'name': 'notifications.analytics.process', 'status': 'ok', ...}],
   }
   ```
   The payload is also cached under the `monitoring:observability_snapshot` key for the
   admin panel to render.
2. Collect the monitoring metrics and confirm an `observability` component is present:
   ```python
   >>> metrics = asyncio.run(monitoring_engine.collect_all_metrics())
   >>> metrics['observability']
   {'metrics_total': 6.0, 'event_errors': 1.0, 'span_error_rate': 0.0, ...}
   ```
3. Error-severity observability events now register alerts through the monitoring engine’s
   `AlertManager`. Review `monitoring_engine.alert_manager.active_alerts` after running
   failure scenarios to ensure notifications are queued for delivery.

## 6. Alerting & follow-up actions

* Forward the structured logs produced by `watchparty.observability` to your logging stack (e.g. ELK, Grafana Loki) and build dashboards using the metric/event names referenced above.
* Configure alert thresholds around:
  * Missing cache hits (`cache.roundtrip` metrics with `result=miss`).
  * Repeated `celery.task.failed` events for critical jobs.
  * Sustained `http.request.slow` warnings or frequent `database.query_budget_exceeded` events.
* Extend `verify_observability` with project-specific smoke checks (e.g. verifying Stripe webhooks, notification queues) as those systems are restored.

### Integration-specific smoke checks

The notification and analytics Celery workers now emit task-specific metrics and spans.
Run the following ad-hoc checks to confirm telemetry is flowing end-to-end:

1. **Notification analytics pipeline**
   ```bash
   python manage.py shell -c "from shared.background_tasks import process_notification_analytics; process_notification_analytics(date_str=None)"
   ```
   Inspect the monitoring snapshot for the `notifications.analytics.*` metrics and the
   `notifications.analytics.processed` event.
2. **Search analytics refresh**
   ```bash
   python manage.py shell -c "from shared.background_tasks import process_search_analytics; process_search_analytics()"
   ```
   Confirm `analytics.search.processed` and `analytics.search.trending_updated` appear in the
   exported events with the expected counts.
3. **Analytics pipelines**
   ```bash
   python manage.py shell -c "from apps.analytics.tasks import process_analytics_events; process_analytics_events()"
   ```
   Use `monitoring_engine.get_observability_summary()` to verify the
   `analytics.pipeline.events_processed` metric increments and that any failures register
   `analytics.pipeline.event_error` alerts.

By following this runbook after each deployment you ensure the final remediation phase (Phase 6) remains enforceable and measurable, catching regressions in background job processing, caching, or request performance before they impact end-users.

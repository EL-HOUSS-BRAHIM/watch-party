from __future__ import annotations

from io import StringIO

from django.core.cache import caches
from django.core.management.base import BaseCommand

from config.celery import test_task
from shared.observability import observability


class Command(BaseCommand):
    """Validate caching, Celery, and observability instrumentation in one pass."""

    help = (
        "Runs a lightweight verification of the cache backend, Celery wiring, "
        "and observability collectors."
    )

    def handle(self, *args, **options):
        observability.reset()

        self.stdout.write("Checking cache backend roundtrip …")
        cache = caches["default"]
        key = "observability:verification"
        cache.set(key, "ok", timeout=30)
        cache_hit = cache.get(key) == "ok"
        result_tag = "hit" if cache_hit else "miss"
        observability.record_metric(
            "cache.roundtrip",
            1,
            tags={"backend": cache.__class__.__name__, "result": result_tag},
        )
        if cache_hit:
            self.stdout.write(self.style.SUCCESS(f"Cache roundtrip succeeded using {cache.__class__.__name__}"))
        else:
            self.stdout.write(self.style.WARNING(f"Cache roundtrip failed using {cache.__class__.__name__}"))

        self.stdout.write("Executing Celery test task via in-process runner …")
        result = test_task.apply().get()
        self.stdout.write(self.style.SUCCESS(f"Celery test task completed with result: {result}"))

        observability.record_event(
            "observability.check",
            "Observability verification completed",
            tags={
                "metrics": str(len(observability.get_metrics())),
                "spans": str(len(observability.get_completed_spans())),
            },
        )

        spans = observability.get_completed_spans()
        metrics = observability.get_metrics()
        events = observability.get_events()

        summary = StringIO()
        summary.write("\nCaptured instrumentation summary:\n")
        summary.write(f"  • {len(spans)} spans\n")
        summary.write(f"  • {len(metrics)} metrics\n")
        summary.write(f"  • {len(events)} events\n")
        for span in spans:
            task_name = span.tags.get("task_name", span.name)
            summary.write(
                f"    - span={task_name} status={span.status} duration={span.duration_ms:.2f}ms\n"
            )
        self.stdout.write(summary.getvalue())

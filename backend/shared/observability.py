from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass, field
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, List, Optional
from uuid import uuid4

logger = logging.getLogger("watchparty.observability")


@dataclass(frozen=True)
class MetricRecord:
    """Structured representation of a recorded metric datapoint."""

    name: str
    value: float
    tags: Dict[str, str] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class EventRecord:
    """Structured representation of a discrete observability event."""

    name: str
    message: str
    severity: str = "info"
    tags: Dict[str, str] = field(default_factory=dict)
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))


@dataclass(frozen=True)
class SpanRecord:
    """Completed span details for tracing-style instrumentation."""

    span_id: str
    name: str
    status: str
    duration_ms: float
    start_time: datetime
    end_time: datetime
    tags: Dict[str, str] = field(default_factory=dict)
    error: Optional[str] = None


class _ActiveSpan:
    """Internal representation of an active span."""

    __slots__ = ("span_id", "name", "start_time", "start_perf", "tags", "status", "error")

    def __init__(self, span_id: str, name: str, tags: Optional[Dict[str, str]] = None):
        self.span_id = span_id
        self.name = name
        self.start_time = datetime.now(timezone.utc)
        self.start_perf = time.perf_counter()
        self.tags: Dict[str, str] = dict(tags or {})
        self.status = "in_progress"
        self.error: Optional[str] = None


class SpanHandle:
    """Context manager returned by :meth:`ObservabilityClient.span`."""

    def __init__(self, client: "ObservabilityClient", span_id: str):
        self._client = client
        self.span_id = span_id

    def __enter__(self) -> "SpanHandle":
        return self

    def add_tag(self, key: str, value: Any) -> None:
        """Attach an additional tag to the in-flight span."""

        self._client.add_span_tag(self.span_id, key, value)

    def set_status(self, status: str) -> None:
        """Override the span status before completion."""

        self._client.set_span_status(self.span_id, status)

    def __exit__(self, exc_type, exc, tb) -> bool:
        if exc is not None:
            self._client.complete_span(self.span_id, status="error", error=str(exc))
            return False

        status = self._client.get_span_status(self.span_id) or "ok"
        self._client.complete_span(self.span_id, status=status)
        return False


class ObservabilityClient:
    """Lightweight in-process observability collector used for tests and local runs."""

    def __init__(self) -> None:
        self._lock = threading.RLock()
        self._metrics: List[MetricRecord] = []
        self._events: List[EventRecord] = []
        self._completed_spans: List[SpanRecord] = []
        self._active_spans: Dict[str, _ActiveSpan] = {}
        self._task_spans: Dict[str, str] = {}
        self._exporters: List[Any] = []

    # ------------------------------------------------------------------
    # Metric helpers
    # ------------------------------------------------------------------
    def record_metric(self, name: str, value: Any, tags: Optional[Dict[str, Any]] = None) -> MetricRecord:
        """Record a numeric metric."""

        metric_value = self._coerce_numeric(value)
        metric_tags = self._stringify_tags(tags)
        record = MetricRecord(name=name, value=metric_value, tags=metric_tags)

        with self._lock:
            self._metrics.append(record)

        logger.debug(
            "Metric recorded",
            extra={"metric_name": name, "metric_value": metric_value, "metric_tags": metric_tags},
        )
        self._notify_exporters("export_metric", record)
        return record

    def get_metrics(self, name: Optional[str] = None) -> List[MetricRecord]:
        with self._lock:
            metrics = list(self._metrics)

        if name is not None:
            metrics = [metric for metric in metrics if metric.name == name]
        return metrics

    # ------------------------------------------------------------------
    # Event helpers
    # ------------------------------------------------------------------
    def record_event(
        self,
        name: str,
        message: str,
        *,
        severity: str = "info",
        tags: Optional[Dict[str, Any]] = None,
    ) -> EventRecord:
        """Record a structured event."""

        event_tags = self._stringify_tags(tags)
        record = EventRecord(name=name, message=message, severity=severity, tags=event_tags)

        with self._lock:
            self._events.append(record)

        log_fn = logger.error if severity.lower() in {"error", "critical"} else logger.info
        log_fn(
            "Observability event",
            extra={"event_name": name, "event_severity": severity, "event_tags": event_tags},
        )
        self._notify_exporters("export_event", record)
        return record

    def get_events(self, name: Optional[str] = None) -> List[EventRecord]:
        with self._lock:
            events = list(self._events)

        if name is not None:
            events = [event for event in events if event.name == name]
        return events

    # ------------------------------------------------------------------
    # Span helpers
    # ------------------------------------------------------------------
    def span(self, name: str, tags: Optional[Dict[str, Any]] = None) -> SpanHandle:
        span_id = self.start_span(name, tags=tags)
        return SpanHandle(self, span_id)

    def start_span(self, name: str, tags: Optional[Dict[str, Any]] = None) -> str:
        span_id = uuid4().hex
        active = _ActiveSpan(span_id, name, tags)
        with self._lock:
            self._active_spans[span_id] = active
        logger.debug(
            "Span started",
            extra={"span_name": name, "span_id": span_id, "span_tags": active.tags},
        )
        return span_id

    def complete_span(self, span_id: str, status: Optional[str] = None, error: Optional[str] = None) -> Optional[SpanRecord]:
        record = self._finish_span(span_id, status=status, error=error)
        return record

    def _finish_span(
        self, span_id: str, *, status: Optional[str] = None, error: Optional[str] = None
    ) -> Optional[SpanRecord]:
        with self._lock:
            active = self._active_spans.pop(span_id, None)

        if not active:
            return None

        end_time = datetime.now(timezone.utc)
        duration_ms = (time.perf_counter() - active.start_perf) * 1000
        active_status = status or active.status or "ok"
        active_status = active_status.lower()
        active_error = error or active.error

        record = SpanRecord(
            span_id=span_id,
            name=active.name,
            status=active_status,
            duration_ms=duration_ms,
            start_time=active.start_time,
            end_time=end_time,
            tags=dict(active.tags),
            error=active_error,
        )

        with self._lock:
            self._completed_spans.append(record)

        log_extra = {
            "span_id": span_id,
            "span_name": active.name,
            "span_status": active_status,
            "span_duration_ms": f"{duration_ms:.2f}",
            "span_tags": active.tags,
        }
        if active_error:
            log_extra["error"] = active_error
            logger.error("Span completed with error", extra=log_extra)
        else:
            logger.debug("Span completed", extra=log_extra)
        self._notify_exporters("export_span", record)
        return record

    def add_span_tag(self, span_id: str, key: str, value: Any) -> None:
        with self._lock:
            span = self._active_spans.get(span_id)
            if span:
                span.tags[str(key)] = str(value)

    def set_span_status(self, span_id: str, status: str) -> None:
        with self._lock:
            span = self._active_spans.get(span_id)
            if span:
                span.status = status.lower()

    def get_span_status(self, span_id: str) -> Optional[str]:
        with self._lock:
            span = self._active_spans.get(span_id)
            return span.status if span else None

    def get_completed_spans(self, name: Optional[str] = None) -> List[SpanRecord]:
        with self._lock:
            spans = list(self._completed_spans)

        if name is not None:
            spans = [span for span in spans if span.name == name]
        return spans

    # ------------------------------------------------------------------
    # Celery helpers
    # ------------------------------------------------------------------
    def begin_task(self, task_id: Optional[str], task_name: str, queue: Optional[str] = None) -> str:
        task_identifier = task_id or uuid4().hex
        tags = {"task_name": task_name}
        if queue:
            tags["queue"] = queue
        span_id = self.start_span("celery.task", tags=tags)
        with self._lock:
            self._task_spans[task_identifier] = span_id
        self.record_event(
            "celery.task.started",
            f"Task {task_name} started",
            tags={"task_id": task_identifier},
        )
        return span_id

    def complete_task(
        self,
        task_id: Optional[str],
        *,
        status: str = "success",
        result: Optional[Any] = None,
        error: Optional[str] = None,
    ) -> Optional[SpanRecord]:
        task_identifier = task_id or "unknown"
        status_normalized = status.lower()
        with self._lock:
            span_id = self._task_spans.pop(task_identifier, None)

        if not span_id:
            return None

        if result is not None:
            self.add_span_tag(span_id, "result", result)
        self.set_span_status(span_id, status_normalized)
        record = self.complete_span(span_id, status=status_normalized, error=error)

        if record:
            self.record_metric(
                "celery.task.runtime_ms",
                record.duration_ms,
                tags={
                    "task_name": record.tags.get("task_name", "unknown"),
                    "status": status_normalized,
                },
            )
            if error:
                self.record_event(
                    "celery.task.failed",
                    f"Task {record.tags.get('task_name', 'unknown')} failed",
                    severity="error",
                    tags={"task_id": task_identifier, "error": error},
                )
            else:
                self.record_event(
                    "celery.task.completed",
                    f"Task {record.tags.get('task_name', 'unknown')} completed",
                    tags={"task_id": task_identifier, "status": status_normalized},
                )
        return record

    def fail_task(self, task_id: Optional[str], exception: Exception) -> Optional[SpanRecord]:
        return self.complete_task(task_id, status="failure", error=str(exception))

    # ------------------------------------------------------------------
    # Utilities
    # ------------------------------------------------------------------
    def reset(self) -> None:
        with self._lock:
            self._metrics.clear()
            self._events.clear()
            self._completed_spans.clear()
            self._active_spans.clear()
            self._task_spans.clear()

    def register_exporter(self, exporter: Any) -> None:
        """Attach an exporter that forwards observability payloads to external sinks."""

        if exporter is None:
            return

        with self._lock:
            if exporter in self._exporters:
                return
            self._exporters.append(exporter)

    def clear_exporters(self) -> None:
        """Remove all registered exporters.

        Primarily useful for tests that need to isolate the observability client from
        side-effects emitted by exporters.
        """

        with self._lock:
            self._exporters.clear()

    def _notify_exporters(self, method_name: str, payload: Any) -> None:
        with self._lock:
            exporters = list(self._exporters)

        for exporter in exporters:
            method = getattr(exporter, method_name, None)
            if not callable(method):
                continue
            try:
                method(payload)
            except Exception:
                logger.exception(
                    "Observability exporter %r failed while handling %s", exporter, method_name
                )

    @staticmethod
    def _coerce_numeric(value: Any) -> float:
        if isinstance(value, bool):
            return 1.0 if value else 0.0
        if isinstance(value, (int, float)):
            return float(value)
        if isinstance(value, Decimal):
            return float(value)
        raise TypeError(f"Metric value must be numeric, got {type(value)!r}")

    @staticmethod
    def _stringify_tags(tags: Optional[Dict[str, Any]]) -> Dict[str, str]:
        if not tags:
            return {}
        return {str(key): str(value) for key, value in tags.items()}


observability = ObservabilityClient()

try:
    from .observability_exporters import register_default_exporters
except Exception:  # pragma: no cover - optional dependency wiring
    register_default_exporters = None

if register_default_exporters is not None:
    try:
        register_default_exporters(observability)
    except Exception:  # pragma: no cover - defensive logging
        logger.exception("Failed to register default observability exporters")

__all__ = [
    "observability",
    "ObservabilityClient",
    "SpanHandle",
    "SpanRecord",
    "MetricRecord",
    "EventRecord",
]

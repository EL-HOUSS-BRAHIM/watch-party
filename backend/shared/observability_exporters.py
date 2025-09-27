"""Default exporters that forward observability payloads to shared monitoring backends."""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from .monitoring import monitoring_engine

if TYPE_CHECKING:  # pragma: no cover
    from .observability import EventRecord, MetricRecord, ObservabilityClient, SpanRecord

logger = logging.getLogger("watchparty.observability.exporters")


class MonitoringObservabilityExporter:
    """Forward observability payloads to the shared monitoring engine."""

    def __init__(self, engine=monitoring_engine) -> None:
        self.engine = engine

    def export_metric(self, metric: "MetricRecord") -> None:
        try:
            self.engine.ingest_observability_metric(metric)
        except Exception:  # pragma: no cover - defensive guard
            logger.exception("Failed to forward metric to monitoring engine")

    def export_event(self, event: "EventRecord") -> None:
        try:
            self.engine.ingest_observability_event(event)
        except Exception:  # pragma: no cover - defensive guard
            logger.exception("Failed to forward event to monitoring engine")

    def export_span(self, span: "SpanRecord") -> None:
        try:
            self.engine.ingest_observability_span(span)
        except Exception:  # pragma: no cover - defensive guard
            logger.exception("Failed to forward span to monitoring engine")


_default_registered = False


def register_default_exporters(client: "ObservabilityClient") -> None:
    """Register the default monitoring exporter against the provided client."""

    global _default_registered

    if _default_registered:
        return

    client.register_exporter(MonitoringObservabilityExporter())
    _default_registered = True


__all__ = [
    "MonitoringObservabilityExporter",
    "register_default_exporters",
]

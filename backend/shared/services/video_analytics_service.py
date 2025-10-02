"""Video analytics service for tracking video metrics."""

import logging
import math
from collections import defaultdict
from datetime import timedelta
from typing import Any, Dict, List

from django.db.models import Avg, Count, Q, Sum
from django.db.models.functions import TruncDate
from django.utils import timezone

from apps.videos.models import Video, VideoView

logger = logging.getLogger(__name__)


def _duration_to_seconds(value: Any) -> float:
    """Convert a ``timedelta`` (or ``None``) into seconds."""

    if value is None:
        return 0.0

    if isinstance(value, timedelta):
        return float(value.total_seconds())

    # Some databases may already return the duration in seconds
    try:
        return float(value)
    except (TypeError, ValueError):  # pragma: no cover - defensive
        return 0.0


class VideoAnalyticsService:
    """Service for video analytics and metrics."""

    DEFAULT_HEATMAP_SEGMENTS = 10

    def track_view(self, video_id: str, user_id: str = None) -> Dict[str, Any]:
        """Track a video view."""
        logger.info("Tracking view for video %s", video_id)
        return {"tracked": True}

    def track_interaction(self, video_id: str, action: str, user_id: str = None) -> Dict[str, Any]:
        """Track video interactions (play, pause, seek, etc)."""
        logger.info("Tracking %s for video %s", action, video_id)
        return {"tracked": True}

    # ------------------------------------------------------------------
    # Analytics helpers consumed by the API views
    # ------------------------------------------------------------------
    def get_video_analytics(self, video: Video, days: int = 30) -> Dict[str, Any]:
        """Return aggregated analytics for a video over the requested window."""

        end = timezone.now()
        start = end - timedelta(days=days)

        views_qs = VideoView.objects.filter(video=video, created_at__gte=start)

        total_views = views_qs.count()

        unique_users = views_qs.filter(user__isnull=False).values_list("user", flat=True).distinct().count()
        unique_ips = views_qs.filter(user__isnull=True).values_list("ip_address", flat=True).distinct().count()
        unique_viewers = unique_users + unique_ips

        aggregated = views_qs.aggregate(
            total_watch_time=Sum("watch_duration"),
            average_completion=Avg("completion_percentage"),
        )

        total_watch_seconds = _duration_to_seconds(aggregated["total_watch_time"])
        average_watch_time = total_watch_seconds / total_views if total_views else 0.0
        completion_rate = aggregated["average_completion"] or 0.0

        # Views grouped by day for the requested period
        daily_views = (
            views_qs.annotate(day=TruncDate("created_at"))
            .values("day")
            .annotate(count=Count("id"))
            .order_by("day")
        )
        views_by_day = [
            {"date": entry["day"].isoformat(), "views": entry["count"]}
            for entry in daily_views
        ]

        completion_distribution = self._build_completion_distribution(views_qs)

        return {
            "video_id": str(video.id),
            "period": {
                "start": start.date().isoformat(),
                "end": end.date().isoformat(),
                "days": days,
            },
            "metrics": {
                "total_views": total_views,
                "unique_viewers": unique_viewers,
                "total_watch_time": total_watch_seconds,
                "average_watch_time": average_watch_time,
                "completion_rate": completion_rate,
            },
            "daily_views": views_by_day,
            "engagement": {
                "watch_time_distribution": completion_distribution,
            },
        }

    def get_engagement_heatmap(self, video: Video) -> List[Dict[str, Any]]:
        """Return a heatmap across the video timeline showing segment engagement."""

        duration = video.duration
        duration_seconds = _duration_to_seconds(duration)
        if duration_seconds <= 0:
            return []

        segments = self.DEFAULT_HEATMAP_SEGMENTS
        segment_length = max(duration_seconds / segments, 1)

        heatmap = [
            {
                "segment": index,
                "start": index * segment_length,
                "end": min((index + 1) * segment_length, duration_seconds),
                "views": 0,
            }
            for index in range(segments)
        ]

        views = VideoView.objects.filter(video=video).values(
            "watch_duration",
            "completion_percentage",
        )

        for view in views:
            watch_seconds = _duration_to_seconds(view["watch_duration"])
            if watch_seconds == 0 and view["completion_percentage"] and duration_seconds:
                watch_seconds = duration_seconds * (view["completion_percentage"] / 100.0)

            if watch_seconds <= 0:
                continue

            segments_watched = min(
                segments,
                int(math.ceil(watch_seconds / segment_length)),
            )

            for index in range(segments_watched):
                heatmap[index]["views"] += 1

        return heatmap

    def get_retention_curve(self, video: Video) -> List[Dict[str, Any]]:
        """Return retention percentages across the video lifecycle."""

        views_qs = VideoView.objects.filter(video=video)
        total_views = views_qs.count()
        if total_views == 0:
            return [
                {"percentage": point, "retention_rate": 0.0}
                for point in (0, 25, 50, 75, 100)
            ]

        retention_points: List[Dict[str, Any]] = []
        for point in (0, 25, 50, 75, 100):
            viewers = views_qs.filter(completion_percentage__gte=point).count()
            retention_rate = (viewers / total_views) * 100.0 if total_views else 0.0
            retention_points.append({
                "percentage": point,
                "retention_rate": retention_rate,
            })

        return retention_points

    def get_viewer_journey_analysis(self, video: Video) -> Dict[str, Any]:
        """Provide insight into how viewers engage over multiple sessions."""

        views_qs = VideoView.objects.filter(video=video)
        total_views = views_qs.count()

        unique_users = views_qs.filter(user__isnull=False).values("user").annotate(count=Count("id"))
        unique_ips = views_qs.filter(user__isnull=True).values("ip_address").annotate(count=Count("id"))

        new_users = sum(1 for entry in unique_users if entry["count"] == 1)
        returning_users = sum(1 for entry in unique_users if entry["count"] > 1)

        new_ips = sum(1 for entry in unique_ips if entry["count"] == 1)
        returning_ips = sum(1 for entry in unique_ips if entry["count"] > 1)

        unique_viewers = len(unique_users) + len(unique_ips)

        aggregates = views_qs.aggregate(
            total_watch_time=Sum("watch_duration"),
            average_completion=Avg("completion_percentage"),
        )
        total_watch_seconds = _duration_to_seconds(aggregates["total_watch_time"])
        average_watch_time = total_watch_seconds / total_views if total_views else 0.0
        completion_rate = aggregates["average_completion"] or 0.0

        completion_distribution = self._build_completion_distribution(views_qs)

        first_view = views_qs.order_by("created_at").values_list("created_at", flat=True).first()
        last_view = views_qs.order_by("-created_at").values_list("created_at", flat=True).first()

        return {
            "total_views": total_views,
            "unique_viewers": unique_viewers,
            "new_vs_returning": {
                "new": new_users + new_ips,
                "returning": returning_users + returning_ips,
            },
            "average_watch_time": average_watch_time,
            "average_completion_rate": completion_rate,
            "completion_distribution": completion_distribution,
            "viewer_sessions": {
                "multiple_sessions": returning_users + returning_ips,
                "single_session": new_users + new_ips,
            },
            "first_viewed_at": first_view.isoformat() if first_view else None,
            "last_viewed_at": last_view.isoformat() if last_view else None,
        }

    def get_comparative_analytics(self, video: Video) -> Dict[str, Any]:
        """Compare a video's performance to channel and platform averages."""

        video_views_qs = VideoView.objects.filter(video=video)
        channel_videos = Video.objects.filter(uploader=video.uploader)
        channel_views_qs = VideoView.objects.filter(video__in=channel_videos)
        platform_views_qs = VideoView.objects.all()

        video_metrics = self._build_basic_metrics(video_views_qs)

        channel_metrics = self._build_average_metrics(channel_views_qs, channel_videos.count())
        platform_metrics = self._build_average_metrics(
            platform_views_qs,
            Video.objects.count(),
        )

        relative = {
            "vs_channel_views": self._relative_performance(
                video_metrics["total_views"], channel_metrics["average_views"]
            ),
            "vs_platform_views": self._relative_performance(
                video_metrics["total_views"], platform_metrics["average_views"]
            ),
            "vs_channel_completion": self._relative_performance(
                video_metrics["completion_rate"], channel_metrics["average_completion_rate"]
            ),
            "vs_platform_completion": self._relative_performance(
                video_metrics["completion_rate"], platform_metrics["average_completion_rate"]
            ),
        }

        return {
            "video": video_metrics,
            "channel_average": channel_metrics,
            "platform_average": platform_metrics,
            "relative_performance": relative,
        }

    def get_trending_analysis(self, days: int = 7) -> List[Dict[str, Any]]:
        """Return the top performing videos for the requested window."""

        start = timezone.now() - timedelta(days=days)
        recent_views = VideoView.objects.filter(created_at__gte=start)

        aggregated = (
            recent_views.values("video")
            .annotate(
                views=Count("id"),
                watch_time=Sum("watch_duration"),
                avg_completion=Avg("completion_percentage"),
                unique_users=Count("user", distinct=True),
                anonymous_viewers=Count("ip_address", distinct=True, filter=Q(user__isnull=True)),
            )
            .order_by("-views", "-watch_time")[:10]
        )

        video_map = {
            video.id: video
            for video in Video.objects.filter(id__in=[entry["video"] for entry in aggregated])
        }

        trending: List[Dict[str, Any]] = []
        for entry in aggregated:
            video_obj = video_map.get(entry["video"])
            if not video_obj:
                continue

            watch_seconds = _duration_to_seconds(entry["watch_time"])
            unique_viewers = entry["unique_users"] + entry["anonymous_viewers"]

            trending.append({
                "video_id": str(video_obj.id),
                "title": video_obj.title,
                "uploader_id": str(video_obj.uploader_id),
                "views": entry["views"],
                "unique_viewers": unique_viewers,
                "total_watch_time": watch_seconds,
                "average_completion": entry["avg_completion"] or 0.0,
                "created_at": video_obj.created_at.isoformat() if video_obj.created_at else None,
            })

        return trending

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _build_completion_distribution(self, views_qs) -> Dict[str, int]:
        """Return a distribution bucketed by completion percentage."""

        buckets = defaultdict(int)
        for completion in views_qs.values_list("completion_percentage", flat=True):
            if completion is None:
                buckets["unknown"] += 1
            elif completion < 25:
                buckets["0_25"] += 1
            elif completion < 50:
                buckets["25_50"] += 1
            elif completion < 75:
                buckets["50_75"] += 1
            else:
                buckets["75_100"] += 1

        return dict(buckets)

    def _build_basic_metrics(self, views_qs) -> Dict[str, Any]:
        """Construct absolute metrics for a video."""

        total_views = views_qs.count()
        aggregates = views_qs.aggregate(
            total_watch_time=Sum("watch_duration"),
            completion=Avg("completion_percentage"),
        )
        total_watch_seconds = _duration_to_seconds(aggregates["total_watch_time"])
        average_watch_time = total_watch_seconds / total_views if total_views else 0.0

        unique_users = views_qs.filter(user__isnull=False).values_list("user", flat=True).distinct().count()
        unique_ips = views_qs.filter(user__isnull=True).values_list("ip_address", flat=True).distinct().count()

        return {
            "total_views": total_views,
            "unique_viewers": unique_users + unique_ips,
            "total_watch_time": total_watch_seconds,
            "average_watch_time": average_watch_time,
            "completion_rate": aggregates["completion"] or 0.0,
        }

    def _build_average_metrics(self, views_qs, video_count: int) -> Dict[str, Any]:
        """Construct average metrics for a collection of videos."""

        total_views = views_qs.count()
        aggregates = views_qs.aggregate(
            total_watch_time=Sum("watch_duration"),
            completion=Avg("completion_percentage"),
        )
        total_watch_seconds = _duration_to_seconds(aggregates["total_watch_time"])

        average_views = total_views / video_count if video_count else 0.0
        average_watch_time = (
            (total_watch_seconds / total_views) if total_views else 0.0
        )

        return {
            "average_views": average_views,
            "average_watch_time": average_watch_time,
            "average_completion_rate": aggregates["completion"] or 0.0,
        }

    def _relative_performance(self, value: float, baseline: float) -> float:
        """Calculate relative performance as a percentage difference."""

        if not baseline:
            return 0.0
        return (value / baseline) * 100.0


# Global service instance
video_analytics_service = VideoAnalyticsService()
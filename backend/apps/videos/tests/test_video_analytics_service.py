from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from apps.authentication.models import User
from apps.videos.models import Video, VideoView
from shared.services.video_analytics_service import video_analytics_service


class VideoAnalyticsServiceTests(TestCase):
    """Unit tests for the analytics helper functions."""

    def setUp(self):
        self.uploader = User.objects.create_user(
            email="owner@example.com",
            password="TestPass123!",
            first_name="Video",
            last_name="Owner",
        )
        self.other_user = User.objects.create_user(
            email="viewer@example.com",
            password="TestPass123!",
            first_name="Video",
            last_name="Viewer",
        )
        self.third_user = User.objects.create_user(
            email="return@example.com",
            password="TestPass123!",
            first_name="Repeat",
            last_name="Viewer",
        )

        self.video = Video.objects.create(
            title="Insightful Talk",
            description="Analytics deep dive",
            uploader=self.uploader,
            duration=timedelta(minutes=10),
            visibility="public",
            status="ready",
        )
        self.other_video = Video.objects.create(
            title="Short Clip",
            description="Auxiliary video",
            uploader=self.uploader,
            duration=timedelta(minutes=5),
            visibility="public",
            status="ready",
        )
        self.external_video = Video.objects.create(
            title="External Creator",
            description="Different channel",
            uploader=self.other_user,
            duration=timedelta(minutes=8),
            visibility="public",
            status="ready",
        )

        now = timezone.now()
        self._create_view(self.video, self.uploader, "10.0.0.1", 300, 70, now - timedelta(days=1))
        self._create_view(self.video, self.other_user, "10.0.0.2", 200, 50, now - timedelta(days=2))
        self._create_view(self.video, None, "10.0.0.3", 120, 20, now - timedelta(days=3))
        self._create_view(self.video, self.third_user, "10.0.0.4", 600, 100, now - timedelta(days=4))
        self._create_view(self.video, self.third_user, "10.0.0.4", 620, 100, now - timedelta(days=5))

        self._create_view(self.other_video, self.uploader, "10.0.0.5", 60, 30, now - timedelta(days=1))
        self._create_view(self.external_video, self.other_user, "10.0.0.6", 180, 60, now - timedelta(days=1))
        self._create_view(self.external_video, None, "10.0.0.7", 240, 75, now - timedelta(days=1))

    def _create_view(
        self,
        video,
        user,
        ip_address,
        watch_seconds,
        completion,
        created_at,
    ):
        view = VideoView.objects.create(
            video=video,
            user=user,
            ip_address=ip_address,
            watch_duration=timedelta(seconds=watch_seconds),
            completion_percentage=completion,
        )
        VideoView.objects.filter(id=view.id).update(created_at=created_at)

    def test_get_video_analytics_returns_expected_metrics(self):
        analytics = video_analytics_service.get_video_analytics(self.video, days=7)

        self.assertEqual(analytics["metrics"]["total_views"], 5)
        self.assertEqual(analytics["metrics"]["unique_viewers"], 4)
        self.assertGreater(analytics["metrics"]["total_watch_time"], 0)
        self.assertAlmostEqual(analytics["metrics"]["completion_rate"], 67, delta=5)
        distribution = analytics["engagement"]["watch_time_distribution"]
        self.assertEqual(distribution["75_100"], 2)

    def test_get_engagement_heatmap_bucket_counts(self):
        heatmap = video_analytics_service.get_engagement_heatmap(self.video)

        self.assertEqual(len(heatmap), video_analytics_service.DEFAULT_HEATMAP_SEGMENTS)
        self.assertGreaterEqual(heatmap[0]["views"], heatmap[-1]["views"])
        self.assertEqual(heatmap[-1]["views"], 2)  # fully completed views

    def test_get_retention_curve_returns_retention_points(self):
        curve = video_analytics_service.get_retention_curve(self.video)

        self.assertEqual(len(curve), 5)
        self.assertAlmostEqual(curve[0]["retention_rate"], 100.0)
        fifty_point = next(point for point in curve if point["percentage"] == 50)
        self.assertAlmostEqual(fifty_point["retention_rate"], 80.0, delta=5)

    def test_get_viewer_journey_analysis_distinguishes_new_and_returning(self):
        journey = video_analytics_service.get_viewer_journey_analysis(self.video)

        self.assertEqual(journey["total_views"], 5)
        self.assertEqual(journey["unique_viewers"], 4)
        self.assertEqual(journey["new_vs_returning"], {"new": 3, "returning": 1})
        self.assertEqual(journey["viewer_sessions"]["multiple_sessions"], 1)

    def test_get_comparative_analytics_returns_channel_and_platform_metrics(self):
        comparative = video_analytics_service.get_comparative_analytics(self.video)

        self.assertEqual(comparative["video"]["total_views"], 5)
        self.assertAlmostEqual(comparative["channel_average"]["average_views"], 3.0)
        self.assertGreater(comparative["relative_performance"]["vs_channel_views"], 100)

    def test_get_trending_analysis_orders_videos_by_views(self):
        trending = video_analytics_service.get_trending_analysis(days=7)

        self.assertTrue(trending)
        self.assertEqual(trending[0]["video_id"], str(self.video.id))
        self.assertGreaterEqual(trending[0]["views"], trending[1]["views"])

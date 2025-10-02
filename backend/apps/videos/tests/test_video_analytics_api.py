from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.authentication.models import User
from apps.videos.models import Video, VideoView
from shared.services.video_analytics_service import video_analytics_service


class VideoAnalyticsAPITests(TestCase):
    """Integration tests covering the analytics API endpoints."""

    client_class = APIClient

    def setUp(self):
        self.uploader = User.objects.create_user(
            email="owner@example.com",
            password="TestPass123!",
            first_name="Video",
            last_name="Owner",
        )
        self.viewer = User.objects.create_user(
            email="viewer@example.com",
            password="TestPass123!",
            first_name="Video",
            last_name="Viewer",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            password="TestPass123!",
            first_name="Admin",
            last_name="User",
            is_staff=True,
        )

        self.video = Video.objects.create(
            title="Product Launch",
            description="Behind the scenes",
            uploader=self.uploader,
            duration=timedelta(minutes=12),
            visibility="public",
            status="ready",
        )
        self.other_video = Video.objects.create(
            title="Teaser",
            description="Sneak peek",
            uploader=self.uploader,
            duration=timedelta(minutes=6),
            visibility="public",
            status="ready",
        )

        now = timezone.now()
        self._create_view(self.video, self.uploader, "10.0.0.1", 400, 80, now - timedelta(days=1))
        self._create_view(self.video, self.viewer, "10.0.0.2", 360, 60, now - timedelta(days=2))
        self._create_view(self.video, None, "10.0.0.3", 120, 25, now - timedelta(days=3))
        self._create_view(self.other_video, self.viewer, "10.0.0.4", 180, 70, now - timedelta(days=2))

        self.client.force_authenticate(self.uploader)

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

    def test_video_analytics_endpoint_matches_service_output(self):
        url = f"/api/videos/{self.video.id}/analytics/detailed/"
        response = self.client.get(url, {"days": 7})

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        expected = video_analytics_service.get_video_analytics(self.video, 7)
        self.assertEqual(response.data["metrics"], expected["metrics"])

    def test_engagement_heatmap_endpoint_returns_heatmap(self):
        url = f"/api/videos/{self.video.id}/analytics/heatmap/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("heatmap", response.data)
        self.assertTrue(response.data["heatmap"])  # segments populated

    def test_retention_curve_endpoint_returns_curve(self):
        url = f"/api/videos/{self.video.id}/analytics/retention/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data["retention_curve"]), 5)

    def test_viewer_journey_endpoint_returns_segments(self):
        url = f"/api/videos/{self.video.id}/analytics/journey/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("viewer_journey", response.data)
        self.assertEqual(response.data["viewer_journey"]["total_views"], 3)

    def test_comparative_analytics_endpoint_includes_relative_metrics(self):
        url = f"/api/videos/{self.video.id}/analytics/comparative/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("relative_performance", response.data["comparative_analytics"])

    def test_trending_analytics_endpoint_returns_ranked_videos(self):
        url = "/api/videos/analytics/trending/"

        # Trending analytics requires admin access
        self.client.force_authenticate(self.admin)

        response = self.client.get(url, {"days": 7})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data["trending_videos"])
        self.assertEqual(response.data["trending_videos"][0]["video_id"], str(self.video.id))

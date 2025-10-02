"""Unit tests for shared video services."""

import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.testing")

import django

django.setup()

from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.test import TestCase, override_settings

from apps.videos.models import Video
from shared.exceptions import VideoError
from shared.services.video_service import (
    video_processing_service,
    video_storage_service,
    video_streaming_service,
)


class VideoStorageServiceTests(TestCase):
    """Tests for the video storage helpers."""

    @override_settings(AWS_STORAGE_BUCKET_NAME="test-bucket", AWS_S3_REGION_NAME="us-east-1")
    @patch("shared.services.video_service.boto3.client")
    def test_generate_upload_url_success(self, mock_boto_client):
        client_instance = MagicMock()
        client_instance.generate_presigned_post.return_value = {
            "url": "https://s3.amazonaws.com/upload",
            "fields": {"key": "uploads/uuid-video.mp4", "Content-Type": "video/mp4"},
        }
        mock_boto_client.return_value = client_instance

        payload = video_storage_service.generate_upload_url(
            filename="video.mp4",
            content_type="video/mp4",
            file_size=2048,
        )

        self.assertEqual(payload["url"], "https://s3.amazonaws.com/upload")
        self.assertIn("expires_at", payload)
        self.assertEqual(payload["fields"]["Content-Type"], "video/mp4")
        client_instance.generate_presigned_post.assert_called_once()
        conditions = client_instance.generate_presigned_post.call_args.kwargs["Conditions"]
        self.assertIn(["content-length-range", 1, 2048], conditions)

    @override_settings(AWS_STORAGE_BUCKET_NAME="", VIDEO_STORAGE_BUCKET="")
    def test_generate_upload_url_without_bucket_fails(self):
        with self.assertRaises(VideoError):
            video_storage_service.generate_upload_url(
                filename="video.mp4",
                content_type="video/mp4",
            )


class VideoProcessingServiceTests(TestCase):
    """Tests for thumbnail generation helper."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="processor@example.com",
            password="strong-pass",
            first_name="Process",
            last_name="Tester",
        )
        self.video = Video.objects.create(
            title="Processing Video",
            uploader=self.user,
            source_type="url",
            source_url="https://cdn.example.com/video.mp4",
            status="ready",
        )

    def test_generate_thumbnails_success(self):
        payload = video_processing_service.generate_thumbnails(
            self.video,
            timestamps=[0, 5, 10],
        )

        self.assertEqual(payload["status"], "queued")
        self.assertEqual(payload["requested_timestamps"], [0, 5, 10])

        processing_record = self.video.processing
        self.assertEqual(processing_record.status, "processing")
        self.assertTrue(processing_record.generate_thumbnail)

    def test_generate_thumbnails_without_source_fails(self):
        video = Video.objects.create(
            title="No Source",
            uploader=self.user,
        )

        with self.assertRaises(VideoError):
            video_processing_service.generate_thumbnails(video)


class VideoStreamingServiceTests(TestCase):
    """Tests for streaming helpers."""

    def setUp(self):
        User = get_user_model()
        self.user = User.objects.create_user(
            email="streamer@example.com",
            password="stream-pass",
            first_name="Stream",
            last_name="Tester",
        )

    def test_generate_streaming_url_for_external_source(self):
        video = Video.objects.create(
            title="External Video",
            uploader=self.user,
            source_type="url",
            source_url="https://cdn.example.com/stream.m3u8",
            status="ready",
        )

        payload = video_streaming_service.generate_streaming_url(
            video=video,
            user=self.user,
            resolution="720p",
            ip_address=None,
            user_agent="pytest",
        )

        self.assertEqual(payload["url"], "https://cdn.example.com/stream.m3u8")
        self.assertIn("expires_at", payload)

        streaming_record = video.streaming_urls.get()
        self.assertEqual(streaming_record.resolution, "720p")
        self.assertEqual(streaming_record.ip_address, "0.0.0.0")
        self.assertEqual(streaming_record.user_agent, "pytest")

    def test_generate_streaming_url_without_source_fails(self):
        video = Video.objects.create(
            title="Missing Source",
            uploader=self.user,
        )

        with self.assertRaises(VideoError):
            video_streaming_service.generate_streaming_url(video=video, user=self.user)

    def test_validate_external_video_url_youtube(self):
        payload = video_streaming_service.validate_external_video_url(
            "https://youtu.be/abc123"
        )

        self.assertEqual(payload["provider"], "youtube")
        self.assertFalse(payload["is_direct_video"])

    def test_validate_external_video_url_direct_file(self):
        payload = video_streaming_service.validate_external_video_url(
            "https://cdn.example.com/video.mp4"
        )

        self.assertEqual(payload["provider"], "unknown")
        self.assertTrue(payload["is_direct_video"])

    def test_validate_external_video_url_invalid(self):
        with self.assertRaises(VideoError):
            video_streaming_service.validate_external_video_url("ftp://example.com/video.mp4")

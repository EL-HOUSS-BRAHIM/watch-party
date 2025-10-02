"""Video processing and storage services."""

import logging
import uuid
from datetime import timedelta
from typing import Any, Dict, Optional
from urllib.parse import urlparse

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from django.conf import settings
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import URLValidator
from django.utils import timezone

from shared.exceptions import VideoError

logger = logging.getLogger(__name__)


class VideoStorageService:
    """Service for video storage operations."""

    def upload_video(self, file_data: Any, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Upload a video file."""
        logger.info("Uploading video file")
        return {"upload_id": "placeholder", "status": "uploaded"}

    def delete_video(self, video_id: str) -> bool:
        """Delete a video file."""
        logger.info(f"Deleting video {video_id}")
        return True

    def get_video_url(self, video_id: str) -> Optional[str]:
        """Get video streaming URL."""
        logger.info(f"Getting URL for video {video_id}")
        return f"https://example.com/video/{video_id}"

    def generate_upload_url(
        self,
        filename: str,
        content_type: str,
        file_size: Optional[int] = None,
        expires_in: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Return presigned payload used by the API for direct uploads."""

        if not filename:
            raise VideoError("Filename is required for upload URL generation.")
        if not content_type:
            raise VideoError("Content type is required for upload URL generation.")

        bucket = getattr(settings, "VIDEO_STORAGE_BUCKET", "") or getattr(
            settings, "AWS_STORAGE_BUCKET_NAME", ""
        )
        if not bucket:
            logger.error("Video storage bucket is not configured")
            raise VideoError("Video storage bucket is not configured.")

        expires_in = expires_in or getattr(settings, "VIDEO_UPLOAD_URL_EXPIRATION", 900)
        key_prefix = getattr(settings, "VIDEO_UPLOAD_PREFIX", "uploads/")
        object_key = f"{key_prefix}{uuid.uuid4()}-{filename}"

        s3_client = boto3.client(
            "s3",
            region_name=getattr(settings, "AWS_S3_REGION_NAME", None),
        )

        conditions = [
            {"bucket": bucket},
            ["eq", "$Content-Type", content_type],
        ]
        if file_size:
            try:
                max_size = int(file_size)
            except (TypeError, ValueError) as exc:
                logger.warning("Invalid file size provided for %s: %s", filename, exc)
                raise VideoError("Invalid file size provided.") from exc
            if max_size <= 0:
                raise VideoError("File size must be a positive integer.")
            conditions.append(["content-length-range", 1, max_size])

        try:
            presigned_post = s3_client.generate_presigned_post(
                Bucket=bucket,
                Key=object_key,
                Fields={"Content-Type": content_type},
                Conditions=conditions,
                ExpiresIn=expires_in,
            )
        except (ClientError, BotoCoreError) as exc:
            logger.exception("Failed to generate presigned upload URL for %s", filename)
            raise VideoError("Unable to generate upload URL.") from exc

        expires_at = timezone.now() + timedelta(seconds=expires_in)

        return {
            "url": presigned_post["url"],
            "fields": presigned_post["fields"],
            "bucket": bucket,
            "key": object_key,
            "expires_in": expires_in,
            "expires_at": expires_at.isoformat(),
        }


class VideoProcessingService:
    """Service for video processing operations."""

    def process_video(self, video_id: str) -> Dict[str, Any]:
        """Process a video (encoding, thumbnails, etc)."""
        logger.info(f"Processing video {video_id}")
        return {"status": "processing", "job_id": "placeholder"}

    def get_processing_status(self, job_id: str) -> Dict[str, Any]:
        """Get video processing status."""
        logger.info(f"Getting processing status for job {job_id}")
        return {"status": "completed", "progress": 100}

    def generate_thumbnail(self, video_id: str, timestamp: float = 0) -> Dict[str, Any]:
        """Generate video thumbnail."""
        logger.info(f"Generating thumbnail for video {video_id}")
        return {"thumbnail_url": f"https://example.com/thumb/{video_id}"}

    def generate_thumbnails(self, video: Any, timestamps: Optional[list] = None) -> Dict[str, Any]:
        """Queue thumbnail generation for a video and return the status payload."""

        if video is None:
            raise VideoError("Video instance is required for thumbnail generation.")

        has_file = bool(getattr(getattr(video, "file", None), "name", ""))
        has_source_url = bool(getattr(video, "source_url", ""))
        if not (has_file or has_source_url):
            logger.error("Video %s has no source available for thumbnails", getattr(video, "id", "unknown"))
            raise VideoError("Video has no source available for thumbnails.")

        timestamps = timestamps or [0]

        try:
            from apps.videos.models import VideoProcessing

            processing_record, _ = VideoProcessing.objects.get_or_create(video=video)
            processing_record.status = "processing"
            processing_record.generate_thumbnail = True
            processing_record.thumbnail_generated = False
            processing_record.save()
        except Exception as exc:
            logger.exception("Failed to persist thumbnail processing state for video %s", getattr(video, "id", "unknown"))
            raise VideoError("Unable to start thumbnail generation.") from exc

        logger.info("Queued thumbnail generation for video %s", getattr(video, "id", "unknown"))

        return {
            "status": "queued",
            "message": "Thumbnail generation has been queued.",
            "requested_timestamps": timestamps,
        }


class VideoStreamingService:
    """Service for video streaming operations."""

    def get_streaming_url(self, video_id: str, quality: str = "auto") -> Optional[str]:
        """Get streaming URL for video."""
        logger.info(f"Getting streaming URL for video {video_id}")
        return f"https://example.com/stream/{video_id}"

    def get_adaptive_manifest(self, video_id: str) -> Dict[str, Any]:
        """Get adaptive streaming manifest."""
        logger.info(f"Getting adaptive manifest for video {video_id}")
        return {"manifest_url": f"https://example.com/manifest/{video_id}"}

    def generate_streaming_url(
        self,
        video: Any,
        user: Any,
        resolution: str = "original",
        ip_address: Optional[str] = None,
        user_agent: str = "",
        expires_in: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Create a temporary streaming URL for the provided video."""

        if video is None:
            raise VideoError("Video instance is required for streaming URL generation.")
        if user is None:
            raise VideoError("Requesting user is required for streaming URL generation.")

        expires_in = expires_in or getattr(settings, "VIDEO_STREAMING_URL_EXPIRATION", 900)
        expires_at = timezone.now() + timedelta(seconds=expires_in)

        streaming_url: Optional[str] = None

        has_file = bool(getattr(getattr(video, "file", None), "name", ""))
        if has_file:
            key = video.file.name
            storage = getattr(video.file, "storage", None)
            bucket = getattr(storage, "bucket_name", None) or getattr(
                settings, "VIDEO_STORAGE_BUCKET", ""
            ) or getattr(settings, "AWS_STORAGE_BUCKET_NAME", "")

            if bucket:
                try:
                    s3_client = boto3.client(
                        "s3",
                        region_name=getattr(settings, "AWS_S3_REGION_NAME", None),
                    )
                    streaming_url = s3_client.generate_presigned_url(
                        "get_object",
                        Params={"Bucket": bucket, "Key": key},
                        ExpiresIn=expires_in,
                    )
                except (ClientError, BotoCoreError) as exc:
                    logger.warning(
                        "Falling back to storage URL for video %s due to presign error: %s",
                        getattr(video, "id", "unknown"),
                        exc,
                    )

            if streaming_url is None:
                try:
                    if storage is not None:
                        streaming_url = storage.url(key)
                    else:
                        streaming_url = video.file.url
                except Exception as exc:
                    logger.exception("Unable to build streaming URL from storage for video %s", getattr(video, "id", "unknown"))
                    raise VideoError("Unable to generate streaming URL.") from exc

        if streaming_url is None and getattr(video, "source_url", ""):
            streaming_url = video.source_url

        if streaming_url is None:
            logger.error("Video %s has no accessible source for streaming", getattr(video, "id", "unknown"))
            raise VideoError("Video has no accessible source for streaming.")

        try:
            from apps.videos.models import VideoStreamingUrl

            record = VideoStreamingUrl.objects.create(
                video=video,
                resolution=resolution or "original",
                url=streaming_url,
                expires_at=expires_at,
                requested_by=user,
                ip_address=ip_address or "0.0.0.0",
                user_agent=user_agent or "",
            )
        except Exception as exc:
            logger.exception("Failed to persist streaming URL record for video %s", getattr(video, "id", "unknown"))
            raise VideoError("Unable to persist streaming URL.") from exc

        logger.info("Generated streaming URL for video %s", getattr(video, "id", "unknown"))

        return {
            "url": record.url,
            "expires_at": record.expires_at.isoformat(),
        }

    def validate_external_video_url(self, url: str) -> Dict[str, Any]:
        """Validate an external video URL and return provider metadata."""

        if not url:
            raise VideoError("URL is required for validation.")

        validator = URLValidator(schemes=["http", "https"])
        try:
            validator(url)
        except DjangoValidationError as exc:
            logger.warning("Invalid video URL provided: %s", url)
            raise VideoError("Invalid video URL provided.") from exc

        parsed = urlparse(url)
        hostname = parsed.netloc.lower()

        provider = "unknown"
        if any(domain in hostname for domain in ("youtube.com", "youtu.be")):
            provider = "youtube"
        elif "vimeo.com" in hostname:
            provider = "vimeo"
        elif "dailymotion.com" in hostname:
            provider = "dailymotion"

        path = parsed.path.lower()
        direct_extensions = (".mp4", ".mov", ".m4v", ".webm", ".mkv", ".m3u8")

        if provider == "unknown" and not path.endswith(direct_extensions):
            logger.error("Unsupported video provider for URL: %s", url)
            raise VideoError("Unsupported video provider.")

        return {
            "provider": provider,
            "url": url,
            "is_direct_video": path.endswith(direct_extensions),
            "source_type": "external" if provider == "unknown" else provider,
        }


# Global service instances
video_storage_service = VideoStorageService()
video_processing_service = VideoProcessingService()
video_streaming_service = VideoStreamingService()
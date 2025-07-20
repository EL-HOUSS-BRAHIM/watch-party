"""
Video processing background tasks
"""

from celery import shared_task
from django.utils import timezone
from django.conf import settings
from PIL import Image
import os
import logging

from .models import Video

logger = logging.getLogger(__name__)


@shared_task
def process_pending_videos():
    """Process pending video uploads"""
    try:
        pending_videos = Video.objects.filter(
            status='processing',
            uploaded_at__lte=timezone.now()
        )[:10]  # Process up to 10 at a time
        
        processed_count = 0
        for video in pending_videos:
            success = process_single_video(video)
            if success:
                processed_count += 1
        
        logger.info(f"Processed {processed_count} pending videos")
        return f"Processed {processed_count} videos"
        
    except Exception as e:
        logger.error(f"Failed to process videos: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def generate_video_thumbnail(video_id):
    """Generate thumbnail for a video"""
    try:
        video = Video.objects.get(id=video_id)
        
        if video.file:
            # This is a simplified thumbnail generation
            # In production, you'd use ffmpeg or similar tools
            thumbnail_path = generate_thumbnail_from_video(video.file.path)
            
            if thumbnail_path:
                video.thumbnail = thumbnail_path
                video.save()
                
                logger.info(f"Generated thumbnail for video {video_id}")
                return f"Thumbnail generated for {video.title}"
        
        return "No file to process"
        
    except Video.DoesNotExist:
        logger.error(f"Video {video_id} not found")
        return f"Video not found"
    except Exception as e:
        logger.error(f"Failed to generate thumbnail: {str(e)}")
        return f"Error: {str(e)}"


def process_single_video(video):
    """Process a single video file"""
    try:
        if not video.file:
            video.status = 'failed'
            video.save()
            return False
        
        # Basic validation
        file_path = video.file.path
        if not os.path.exists(file_path):
            video.status = 'failed'
            video.save()
            return False
        
        # Get file size and duration (simplified)
        file_size = os.path.getsize(file_path)
        video.file_size = file_size
        
        # Mark as ready
        video.status = 'ready'
        video.processed_at = timezone.now()
        video.save()
        
        # Generate thumbnail asynchronously
        generate_video_thumbnail.delay(video.id)
        
        return True
        
    except Exception as e:
        logger.error(f"Failed to process video {video.id}: {str(e)}")
        video.status = 'failed'
        video.save()
        return False


def generate_thumbnail_from_video(video_path):
    """Generate thumbnail from video file (placeholder)"""
    try:
        # This is a placeholder implementation
        # In production, you'd use ffmpeg:
        # ffmpeg -i input.mp4 -ss 00:00:10 -vframes 1 thumbnail.jpg
        
        # For now, return None to indicate no thumbnail generated
        return None
        
    except Exception as e:
        logger.error(f"Failed to generate thumbnail: {str(e)}")
        return None

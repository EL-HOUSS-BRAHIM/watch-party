"""
Video processing tasks for Watch Party Backend
"""

from celery import shared_task
from django.utils import timezone
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
import os
import subprocess
import tempfile
import logging
import json
from typing import Optional, Dict, Any
from botocore.exceptions import ClientError

from shared.aws import get_boto3_session

from .models import Video
from apps.analytics.models import AnalyticsEvent

logger = logging.getLogger(__name__)


@shared_task
def process_video_upload(video_id):
    """Process uploaded video for thumbnails and metadata"""
    try:
        video = Video.objects.get(id=video_id)
        
        if not video.video_url:
            logger.error(f"Video {video_id} has no video URL")
            return f"Error: No video URL for video {video_id}"
        
        # Extract metadata
        metadata = extract_video_metadata(video.video_url)
        if metadata:
            video.duration = metadata.get('duration', 0)
            video.file_size = metadata.get('file_size', 0)
            
            # Update video metadata
            if 'width' in metadata and 'height' in metadata:
                video.metadata = {
                    'width': metadata['width'],
                    'height': metadata['height'],
                    'codec': metadata.get('codec', ''),
                    'bitrate': metadata.get('bitrate', 0),
                    'fps': metadata.get('fps', 0)
                }
        
        # Generate thumbnail
        thumbnail_url = generate_video_thumbnail(video.video_url)
        if thumbnail_url:
            video.thumbnail = thumbnail_url
        
        # Update status
        video.status = 'ready'
        video.processed_at = timezone.now()
        video.save()
        
        # Log analytics event
        AnalyticsEvent.objects.create(
            user=video.uploader,
            event_type='video_upload',
            event_data={
                'video_id': str(video.id),
                'duration': video.duration,
                'file_size': video.file_size
            }
        )
        
        logger.info(f"Successfully processed video {video_id}")
        return f"Successfully processed video {video.title}"
        
    except Video.DoesNotExist:
        logger.error(f"Video {video_id} not found")
        return f"Error: Video {video_id} not found"
    except Exception as e:
        logger.error(f"Error processing video {video_id}: {str(e)}")
        # Update video status to failed
        try:
            video = Video.objects.get(id=video_id)
            video.status = 'failed'
            video.save()
        except:
            pass
        return f"Error: {str(e)}"


def extract_video_metadata(video_url: str) -> Optional[Dict[str, Any]]:
    """Extract metadata from video file using ffprobe"""
    try:
        # Download video to temporary file if it's a URL
        temp_file = None
        if video_url.startswith('http'):
            temp_file = download_video_temp(video_url)
            if not temp_file:
                return None
            video_path = temp_file
        else:
            video_path = video_url
        
        # Use ffprobe to extract metadata
        cmd = [
            'ffprobe',
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            video_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            logger.error(f"ffprobe failed for {video_url}: {result.stderr}")
            return None
        
        metadata = json.loads(result.stdout)
        
        # Extract relevant information
        format_info = metadata.get('format', {})
        video_stream = None
        
        for stream in metadata.get('streams', []):
            if stream.get('codec_type') == 'video':
                video_stream = stream
                break
        
        if not video_stream:
            logger.error(f"No video stream found in {video_url}")
            return None
        
        extracted_metadata = {
            'duration': int(float(format_info.get('duration', 0))),
            'file_size': int(format_info.get('size', 0)),
            'width': video_stream.get('width', 0),
            'height': video_stream.get('height', 0),
            'codec': video_stream.get('codec_name', ''),
            'bitrate': int(video_stream.get('bit_rate', 0)),
            'fps': eval(video_stream.get('r_frame_rate', '0/1'))
        }
        
        # Clean up temporary file
        if temp_file and os.path.exists(temp_file):
            os.unlink(temp_file)
        
        return extracted_metadata
        
    except subprocess.TimeoutExpired:
        logger.error(f"ffprobe timeout for {video_url}")
        return None
    except Exception as e:
        logger.error(f"Error extracting metadata from {video_url}: {str(e)}")
        return None


def generate_video_thumbnail(video_url: str) -> Optional[str]:
    """Generate thumbnail from video file"""
    try:
        # Download video to temporary file if it's a URL
        temp_file = None
        if video_url.startswith('http'):
            temp_file = download_video_temp(video_url)
            if not temp_file:
                return None
            video_path = temp_file
        else:
            video_path = video_url
        
        # Create temporary thumbnail file
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as thumb_file:
            thumbnail_path = thumb_file.name
        
        # Use ffmpeg to generate thumbnail at 10 second mark
        cmd = [
            'ffmpeg',
            '-i', video_path,
            '-ss', '00:00:10',
            '-vframes', '1',
            '-vf', 'scale=320:240',
            '-y',
            thumbnail_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        
        if result.returncode != 0:
            logger.error(f"ffmpeg thumbnail generation failed for {video_url}: {result.stderr}")
            return None
        
        # Upload thumbnail to storage
        thumbnail_url = upload_thumbnail_to_storage(thumbnail_path)
        
        # Clean up temporary files
        if os.path.exists(thumbnail_path):
            os.unlink(thumbnail_path)
        if temp_file and os.path.exists(temp_file):
            os.unlink(temp_file)
        
        return thumbnail_url
        
    except subprocess.TimeoutExpired:
        logger.error(f"ffmpeg timeout for {video_url}")
        return None
    except Exception as e:
        logger.error(f"Error generating thumbnail for {video_url}: {str(e)}")
        return None


def download_video_temp(video_url: str) -> Optional[str]:
    """Download video to temporary file for processing"""
    try:
        import requests
        
        response = requests.get(video_url, stream=True, timeout=60)
        response.raise_for_status()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.mp4') as temp_file:
            for chunk in response.iter_content(chunk_size=8192):
                temp_file.write(chunk)
            return temp_file.name
            
    except Exception as e:
        logger.error(f"Error downloading video {video_url}: {str(e)}")
        return None


def upload_thumbnail_to_storage(thumbnail_path: str) -> Optional[str]:
    """Upload thumbnail to configured storage"""
    try:
        # Generate unique filename
        filename = f"thumbnails/{timezone.now().strftime('%Y/%m/%d')}/{os.path.basename(thumbnail_path)}"
        
        # Upload to storage (S3 or local)
        if hasattr(settings, 'AWS_STORAGE_BUCKET_NAME') and settings.AWS_STORAGE_BUCKET_NAME:
            return upload_to_s3(thumbnail_path, filename)
        else:
            return upload_to_local_storage(thumbnail_path, filename)
            
    except Exception as e:
        logger.error(f"Error uploading thumbnail: {str(e)}")
        return None


def upload_to_s3(file_path: str, s3_key: str) -> Optional[str]:
    """Upload file to AWS S3"""
    try:
        s3_client = get_boto3_session().client(
            's3',
            region_name=settings.AWS_S3_REGION_NAME
        )
        
        bucket_name = settings.AWS_STORAGE_BUCKET_NAME
        
        # Upload file
        with open(file_path, 'rb') as file_obj:
            s3_client.upload_fileobj(
                file_obj,
                bucket_name,
                s3_key,
                ExtraArgs={'ContentType': 'image/jpeg'}
            )
        
        # Return public URL
        if hasattr(settings, 'AWS_S3_CUSTOM_DOMAIN') and settings.AWS_S3_CUSTOM_DOMAIN:
            return f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/{s3_key}"
        else:
            return f"https://{bucket_name}.s3.{settings.AWS_S3_REGION_NAME}.amazonaws.com/{s3_key}"
            
    except ClientError as e:
        logger.error(f"AWS S3 upload error: {str(e)}")
        return None


def upload_to_local_storage(file_path: str, filename: str) -> Optional[str]:
    """Upload file to local storage"""
    try:
        with open(file_path, 'rb') as file_obj:
            uploaded_file = default_storage.save(filename, ContentFile(file_obj.read()))
            return default_storage.url(uploaded_file)
            
    except Exception as e:
        logger.error(f"Local storage upload error: {str(e)}")
        return None


@shared_task
def cleanup_failed_uploads():
    """Clean up failed video uploads"""
    try:
        # Find videos that have been in processing state for too long
        timeout_date = timezone.now() - timezone.timedelta(hours=2)
        
        failed_videos = Video.objects.filter(
            status='processing',
            created_at__lt=timeout_date
        )
        
        count = 0
        for video in failed_videos:
            video.status = 'failed'
            video.save()
            count += 1
        
        logger.info(f"Marked {count} videos as failed due to timeout")
        return f"Cleaned up {count} failed uploads"
        
    except Exception as e:
        logger.error(f"Error cleaning up failed uploads: {str(e)}")
        return f"Error: {str(e)}"


@shared_task
def optimize_video_quality():
    """Optimize video quality and create multiple resolutions"""
    try:
        # Find videos that need optimization
        videos_to_optimize = Video.objects.filter(
            status='ready',
            optimized=False
        )[:5]  # Process 5 at a time
        
        optimized_count = 0
        for video in videos_to_optimize:
            if create_video_variants(video):
                video.optimized = True
                video.save()
                optimized_count += 1
        
        logger.info(f"Optimized {optimized_count} videos")
        return f"Optimized {optimized_count} videos"
        
    except Exception as e:
        logger.error(f"Error optimizing videos: {str(e)}")
        return f"Error: {str(e)}"


def create_video_variants(video: Video) -> bool:
    """Create multiple resolution variants of a video"""
    try:
        if not video.video_url:
            return False
        
        # Download original video
        temp_file = download_video_temp(video.video_url)
        if not temp_file:
            return False
        
        # Create different quality variants
        variants = {
            '720p': {'width': 1280, 'height': 720, 'bitrate': '2000k'},
            '480p': {'width': 854, 'height': 480, 'bitrate': '1000k'},
            '360p': {'width': 640, 'height': 360, 'bitrate': '500k'}
        }
        
        variant_urls = {}
        
        for quality, settings in variants.items():
            variant_url = create_video_variant(
                temp_file, 
                quality, 
                settings['width'], 
                settings['height'], 
                settings['bitrate']
            )
            if variant_url:
                variant_urls[quality] = variant_url
        
        # Update video with variants
        if variant_urls:
            if not video.metadata:
                video.metadata = {}
            video.metadata['variants'] = variant_urls
            video.save()
        
        # Clean up
        if os.path.exists(temp_file):
            os.unlink(temp_file)
        
        return len(variant_urls) > 0
        
    except Exception as e:
        logger.error(f"Error creating video variants for {video.id}: {str(e)}")
        return False


def create_video_variant(input_path: str, quality: str, width: int, height: int, bitrate: str) -> Optional[str]:
    """Create a single video variant"""
    try:
        with tempfile.NamedTemporaryFile(suffix=f'_{quality}.mp4', delete=False) as output_file:
            output_path = output_file.name
        
        # Use ffmpeg to create variant
        cmd = [
            'ffmpeg',
            '-i', input_path,
            '-vf', f'scale={width}:{height}',
            '-b:v', bitrate,
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '23',
            '-c:a', 'aac',
            '-b:a', '128k',
            '-y',
            output_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)  # 5 minute timeout
        
        if result.returncode != 0:
            logger.error(f"ffmpeg variant creation failed for {quality}: {result.stderr}")
            return None
        
        # Upload variant to storage
        filename = f"videos/variants/{timezone.now().strftime('%Y/%m/%d')}/{quality}_{os.path.basename(output_path)}"
        variant_url = upload_to_storage_backend(output_path, filename)
        
        # Clean up
        if os.path.exists(output_path):
            os.unlink(output_path)
        
        return variant_url
        
    except subprocess.TimeoutExpired:
        logger.error(f"ffmpeg timeout for variant {quality}")
        return None
    except Exception as e:
        logger.error(f"Error creating variant {quality}: {str(e)}")
        return None


def upload_to_storage_backend(file_path: str, filename: str) -> Optional[str]:
    """Upload file to configured storage backend"""
    try:
        if hasattr(settings, 'AWS_STORAGE_BUCKET_NAME') and settings.AWS_STORAGE_BUCKET_NAME:
            return upload_to_s3(file_path, filename)
        else:
            return upload_to_local_storage(file_path, filename)
    except Exception as e:
        logger.error(f"Error uploading to storage: {str(e)}")
        return None


@shared_task
def generate_video_preview():
    """Generate video preview clips"""
    try:
        # Find videos that need preview generation
        videos = Video.objects.filter(
            status='ready',
            preview_url__isnull=True
        )[:3]  # Process 3 at a time
        
        generated_count = 0
        for video in videos:
            preview_url = create_video_preview(video.video_url)
            if preview_url:
                video.preview_url = preview_url
                video.save()
                generated_count += 1
        
        logger.info(f"Generated {generated_count} video previews")
        return f"Generated {generated_count} previews"
        
    except Exception as e:
        logger.error(f"Error generating video previews: {str(e)}")
        return f"Error: {str(e)}"


def create_video_preview(video_url: str) -> Optional[str]:
    """Create a short preview clip from video"""
    try:
        # Download original video
        temp_file = download_video_temp(video_url)
        if not temp_file:
            return None
        
        with tempfile.NamedTemporaryFile(suffix='_preview.mp4', delete=False) as preview_file:
            preview_path = preview_file.name
        
        # Create 30-second preview starting from 10% of video duration
        cmd = [
            'ffmpeg',
            '-i', temp_file,
            '-ss', '10%',
            '-t', '30',
            '-vf', 'scale=640:360',
            '-c:v', 'libx264',
            '-preset', 'fast',
            '-crf', '28',
            '-c:a', 'aac',
            '-b:a', '64k',
            '-y',
            preview_path
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
        
        if result.returncode != 0:
            logger.error(f"ffmpeg preview creation failed: {result.stderr}")
            return None
        
        # Upload preview
        filename = f"videos/previews/{timezone.now().strftime('%Y/%m/%d')}/preview_{os.path.basename(preview_path)}"
        preview_url = upload_to_storage_backend(preview_path, filename)
        
        # Clean up
        if os.path.exists(preview_path):
            os.unlink(preview_path)
        if os.path.exists(temp_file):
            os.unlink(temp_file)
        
        return preview_url
        
    except subprocess.TimeoutExpired:
        logger.error("ffmpeg timeout for preview creation")
        return None
    except Exception as e:
        logger.error(f"Error creating video preview: {str(e)}")
        return None


@shared_task
def cleanup_temporary_files():
    """Clean up temporary video processing files"""
    try:
        # Clean up any leftover temporary files
        temp_dir = tempfile.gettempdir()
        count = 0
        
        for filename in os.listdir(temp_dir):
            if filename.endswith(('.mp4', '.avi', '.mov', '.mkv', '.jpg', '.png')) and filename.startswith('tmp'):
                file_path = os.path.join(temp_dir, filename)
                try:
                    # Delete files older than 1 hour
                    if os.path.getmtime(file_path) < (timezone.now().timestamp() - 3600):
                        os.unlink(file_path)
                        count += 1
                except Exception:
                    pass
        
        logger.info(f"Cleaned up {count} temporary files")
        return f"Cleaned up {count} temporary files"
        
    except Exception as e:
        logger.error(f"Error cleaning up temporary files: {str(e)}")
        return f"Error: {str(e)}"

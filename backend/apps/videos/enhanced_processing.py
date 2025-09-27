"""
Enhanced video processing and streaming features
"""

import os
import json
import subprocess
from django.core.files.storage import default_storage
from django.conf import settings
from celery import shared_task
from datetime import timedelta

from apps.videos.models import Video, VideoProcessing, VideoStreamingUrl
from apps.analytics.models import AnalyticsEvent
from shared.error_handling import ErrorTracker


class VideoProcessor:
    """Enhanced video processing with multiple quality levels and formats"""
    
    QUALITY_PRESETS = {
        '144p': {'width': 256, 'height': 144, 'bitrate': '400k'},
        '240p': {'width': 426, 'height': 240, 'bitrate': '700k'},
        '360p': {'width': 640, 'height': 360, 'bitrate': '1000k'},
        '480p': {'width': 854, 'height': 480, 'bitrate': '1500k'},
        '720p': {'width': 1280, 'height': 720, 'bitrate': '2500k'},
        '1080p': {'width': 1920, 'height': 1080, 'bitrate': '4000k'},
    }
    
    def __init__(self, video_id):
        self.video = Video.objects.get(id=video_id)
        self.processing_record = None
    
    def start_processing(self):
        """Start video processing pipeline"""
        try:
            # Create processing record
            self.processing_record = VideoProcessing.objects.create(
                video=self.video,
                status='processing',
                progress=0
            )
            
            # Update video status
            self.video.status = 'processing'
            self.video.save()
            
            # Start processing pipeline
            self.process_video()
            
        except Exception as e:
            self.handle_processing_error(e)
    
    def process_video(self):
        """Main video processing pipeline"""
        try:
            # Step 1: Validate video file
            self.update_progress(10, "Validating video file")
            if not self.validate_video():
                raise Exception("Invalid video file")
            
            # Step 2: Extract metadata
            self.update_progress(20, "Extracting metadata")
            self.extract_metadata()
            
            # Step 3: Generate thumbnail
            self.update_progress(30, "Generating thumbnail")
            self.generate_thumbnails()
            
            # Step 4: Process multiple quality levels
            self.update_progress(40, "Processing video qualities")
            self.process_multiple_qualities()
            
            # Step 5: Generate streaming URLs
            self.update_progress(80, "Generating streaming URLs")
            self.generate_streaming_urls()
            
            # Step 6: Create preview clips
            self.update_progress(90, "Creating preview clips")
            self.create_preview_clips()
            
            # Step 7: Finalize
            self.update_progress(100, "Processing complete")
            self.finalize_processing()
            
        except Exception as e:
            self.handle_processing_error(e)
    
    def validate_video(self):
        """Validate video file format and integrity"""
        try:
            if not self.video.file:
                return False
            
            # Check file exists
            if not default_storage.exists(self.video.file.name):
                return False
            
            # Get video info using ffprobe
            video_info = self.get_video_info()
            if not video_info:
                return False
            
            # Check if file has video stream
            has_video = any(stream.get('codec_type') == 'video' for stream in video_info.get('streams', []))
            
            return has_video
            
        except Exception as e:
            ErrorTracker.log_error('video_validation_error', e, extra_data={'video_id': self.video.id})
            return False
    
    def extract_metadata(self):
        """Extract comprehensive video metadata"""
        try:
            video_info = self.get_video_info()
            if not video_info:
                return None
            
            # Extract video stream info
            video_stream = next(
                (stream for stream in video_info['streams'] if stream['codec_type'] == 'video'),
                None
            )
            
            # Extract audio stream info
            audio_stream = next(
                (stream for stream in video_info['streams'] if stream['codec_type'] == 'audio'),
                None
            )
            
            if video_stream:
                # Update video metadata
                self.video.width = video_stream.get('width', 0)
                self.video.height = video_stream.get('height', 0)
                self.video.frame_rate = self.parse_frame_rate(video_stream.get('r_frame_rate', ''))
                self.video.codec = video_stream.get('codec_name', '')
                
                # Parse duration
                duration = video_info.get('format', {}).get('duration')
                if duration:
                    self.video.duration = timedelta(seconds=float(duration))
                
                # File size
                file_size = video_info.get('format', {}).get('size')
                if file_size:
                    self.video.file_size = int(file_size)
                
                self.video.save()
            
            return {
                'video_stream': video_stream,
                'audio_stream': audio_stream,
                'format': video_info.get('format', {})
            }
            
        except Exception as e:
            ErrorTracker.log_error('metadata_extraction_error', e, extra_data={'video_id': self.video.id})
            return None
    
    def generate_thumbnails(self):
        """Generate multiple thumbnails from video"""
        try:
            if not self.video.file:
                return False
            
            # Generate thumbnail at 10% of video duration
            duration = self.video.duration.total_seconds() if self.video.duration else 10
            timestamp = duration * 0.1
            
            # Create thumbnail filename
            filename_base = os.path.splitext(os.path.basename(self.video.file.name))[0]
            thumbnail_filename = f"thumbnails/{filename_base}_thumb.jpg"
            
            # Generate thumbnail using ffmpeg
            input_path = self.video.file.path if hasattr(self.video.file, 'path') else self.video.file.url
            output_path = os.path.join(settings.MEDIA_ROOT, thumbnail_filename)
            
            # Ensure thumbnail directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-ss', str(timestamp),
                '-vframes', '1',
                '-vf', 'scale=640:360',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0 and os.path.exists(output_path):
                # Save thumbnail to video model
                self.video.thumbnail = thumbnail_filename
                self.video.save()
                
                # Generate additional preview thumbnails
                self.generate_preview_thumbnails()
                
                return True
            else:
                ErrorTracker.log_error(
                    'thumbnail_generation_error',
                    Exception(f"FFmpeg error: {result.stderr}"),
                    extra_data={'video_id': self.video.id}
                )
                return False
                
        except Exception as e:
            ErrorTracker.log_error('thumbnail_generation_error', e, extra_data={'video_id': self.video.id})
            return False
    
    def generate_preview_thumbnails(self):
        """Generate preview thumbnails at various timestamps"""
        try:
            if not self.video.duration:
                return
            
            duration = self.video.duration.total_seconds()
            preview_count = min(10, int(duration // 10))  # One preview every 10 seconds, max 10
            
            previews = []
            for i in range(preview_count):
                timestamp = (duration / preview_count) * i
                preview_filename = f"previews/{os.path.splitext(os.path.basename(self.video.file.name))[0]}_preview_{i}.jpg"
                
                # Generate preview thumbnail
                if self.generate_single_thumbnail(timestamp, preview_filename):
                    previews.append({
                        'timestamp': timestamp,
                        'filename': preview_filename
                    })
            
            # Save preview data
            self.video.preview_thumbnails = previews
            self.video.save()
            
        except Exception as e:
            ErrorTracker.log_error('preview_thumbnails_error', e, extra_data={'video_id': self.video.id})
    
    def process_multiple_qualities(self):
        """Process video in multiple quality levels"""
        try:
            self.video.width or 1920
            original_height = self.video.height or 1080
            
            processed_qualities = []
            
            for quality, preset in self.QUALITY_PRESETS.items():
                # Skip if quality is higher than original
                if preset['height'] > original_height:
                    continue
                
                self.update_progress(
                    40 + (len(processed_qualities) * 8),  # Progress from 40-80%
                    f"Processing {quality} quality"
                )
                
                if self.process_quality_level(quality, preset):
                    processed_qualities.append(quality)
            
            # Update video with available qualities
            self.video.available_qualities = processed_qualities
            self.video.save()
            
        except Exception as e:
            ErrorTracker.log_error('quality_processing_error', e, extra_data={'video_id': self.video.id})
    
    def process_quality_level(self, quality, preset):
        """Process video for specific quality level"""
        try:
            filename_base = os.path.splitext(os.path.basename(self.video.file.name))[0]
            output_filename = f"processed/{filename_base}_{quality}.mp4"
            
            input_path = self.video.file.path if hasattr(self.video.file, 'path') else self.video.file.url
            output_path = os.path.join(settings.MEDIA_ROOT, output_filename)
            
            # Ensure output directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-vf', f"scale={preset['width']}:{preset['height']}",
                '-b:v', preset['bitrate'],
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-c:a', 'aac',
                '-b:a', '128k',
                '-movflags', '+faststart',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0 and os.path.exists(output_path):
                # Save processed file info
                self.save_processed_quality(quality, output_filename, preset)
                return True
            else:
                ErrorTracker.log_error(
                    'quality_processing_error',
                    Exception(f"FFmpeg error for {quality}: {result.stderr}"),
                    extra_data={'video_id': self.video.id, 'quality': quality}
                )
                return False
                
        except Exception as e:
            ErrorTracker.log_error('quality_processing_error', e, extra_data={'video_id': self.video.id, 'quality': quality})
            return False
    
    def generate_streaming_urls(self):
        """Generate streaming URLs for different qualities"""
        try:
            # Clear existing streaming URLs
            VideoStreamingUrl.objects.filter(video=self.video).delete()
            
            # Create streaming URLs for each quality
            for quality in self.video.available_qualities or []:
                VideoStreamingUrl.objects.create(
                    video=self.video,
                    quality=quality,
                    url=self.get_streaming_url(quality),
                    format='mp4'
                )
            
        except Exception as e:
            ErrorTracker.log_error('streaming_url_error', e, extra_data={'video_id': self.video.id})
    
    def create_preview_clips(self):
        """Create short preview clips for the video"""
        try:
            if not self.video.duration:
                return
            
            duration = self.video.duration.total_seconds()
            if duration < 30:  # Too short for preview
                return
            
            # Create 30-second preview from the middle of the video
            start_time = max(0, (duration / 2) - 15)
            preview_filename = f"previews/{os.path.splitext(os.path.basename(self.video.file.name))[0]}_preview.mp4"
            
            input_path = self.video.file.path if hasattr(self.video.file, 'path') else self.video.file.url
            output_path = os.path.join(settings.MEDIA_ROOT, preview_filename)
            
            # Ensure preview directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-ss', str(start_time),
                '-t', '30',
                '-vf', 'scale=640:360',
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0 and os.path.exists(output_path):
                self.video.preview_url = preview_filename
                self.video.save()
                
        except Exception as e:
            ErrorTracker.log_error('preview_clip_error', e, extra_data={'video_id': self.video.id})
    
    def finalize_processing(self):
        """Finalize video processing"""
        try:
            # Update video status
            self.video.status = 'ready'
            self.video.save()
            
            # Update processing record
            if self.processing_record:
                self.processing_record.status = 'completed'
                self.processing_record.progress = 100
                self.processing_record.completed_at = timezone.now()
                self.processing_record.save()
            
            # Create analytics event
            AnalyticsEvent.objects.create(
                user=self.video.uploaded_by,
                event_type='video_processing_completed',
                video=self.video,
                event_data={
                    'processing_time': (timezone.now() - self.processing_record.started_at).total_seconds(),
                    'qualities_processed': len(self.video.available_qualities or [])
                }
            )
            
        except Exception as e:
            ErrorTracker.log_error('processing_finalization_error', e, extra_data={'video_id': self.video.id})
    
    def handle_processing_error(self, error):
        """Handle processing errors"""
        try:
            # Update video status
            self.video.status = 'failed'
            self.video.save()
            
            # Update processing record
            if self.processing_record:
                self.processing_record.status = 'failed'
                self.processing_record.error_message = str(error)
                self.processing_record.save()
            
            # Log error
            ErrorTracker.log_error('video_processing_error', error, extra_data={'video_id': self.video.id})
            
        except Exception as e:
            ErrorTracker.log_error('error_handling_error', e, extra_data={'video_id': self.video.id})
    
    def update_progress(self, progress, status):
        """Update processing progress"""
        try:
            if self.processing_record:
                self.processing_record.progress = progress
                self.processing_record.current_step = status
                self.processing_record.save()
                
        except Exception as e:
            ErrorTracker.log_error('progress_update_error', e, extra_data={'video_id': self.video.id})
    
    # Helper methods
    def get_video_info(self):
        """Get video information using ffprobe"""
        try:
            input_path = self.video.file.path if hasattr(self.video.file, 'path') else self.video.file.url
            
            cmd = [
                'ffprobe',
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                input_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return json.loads(result.stdout)
            else:
                return None
                
        except Exception:
            return None
    
    def parse_frame_rate(self, frame_rate_str):
        """Parse frame rate string to float"""
        try:
            if '/' in frame_rate_str:
                numerator, denominator = frame_rate_str.split('/')
                return float(numerator) / float(denominator)
            else:
                return float(frame_rate_str)
        except (ValueError, ZeroDivisionError):
            return 0.0
    
    def generate_single_thumbnail(self, timestamp, filename):
        """Generate a single thumbnail at specific timestamp"""
        try:
            input_path = self.video.file.path if hasattr(self.video.file, 'path') else self.video.file.url
            output_path = os.path.join(settings.MEDIA_ROOT, filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            
            cmd = [
                'ffmpeg',
                '-i', input_path,
                '-ss', str(timestamp),
                '-vframes', '1',
                '-vf', 'scale=320:180',
                '-y',
                output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            return result.returncode == 0 and os.path.exists(output_path)
            
        except Exception:
            return False
    
    def save_processed_quality(self, quality, filename, preset):
        """Save processed quality information"""
        try:
            # This would typically save to a separate model for tracking processed files
            # For now, we'll add it to the video metadata
            processed_files = getattr(self.video, 'processed_files', {})
            processed_files[quality] = {
                'filename': filename,
                'width': preset['width'],
                'height': preset['height'],
                'bitrate': preset['bitrate']
            }
            self.video.processed_files = processed_files
            self.video.save()
            
        except Exception as e:
            ErrorTracker.log_error('save_quality_error', e, extra_data={'video_id': self.video.id, 'quality': quality})
    
    def get_streaming_url(self, quality):
        """Get streaming URL for specific quality"""
        try:
            # This would typically generate signed URLs for secure streaming
            # For now, return a simple media URL
            processed_files = getattr(self.video, 'processed_files', {})
            if quality in processed_files:
                filename = processed_files[quality]['filename']
                return f"{settings.MEDIA_URL}{filename}"
            return None
            
        except Exception:
            return None


# Celery task for async video processing
@shared_task(bind=True, max_retries=3)
def process_video_async(self, video_id):
    """Asynchronous video processing task"""
    try:
        processor = VideoProcessor(video_id)
        processor.start_processing()
        
    except Exception as e:
        # Retry the task
        raise self.retry(exc=e, countdown=60)  # Retry after 1 minute

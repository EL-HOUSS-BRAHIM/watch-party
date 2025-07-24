"""
Video service for Watch Party Backend
Handles video processing, storage, and streaming operations
"""

import os
import boto3
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.cache import cache
from core.exceptions import VideoError, StorageError
from core.utils import (
    extract_google_drive_file_id, 
    extract_youtube_video_id,
    generate_secure_token,
    create_cache_key,
    sanitize_filename,
    format_file_size
)


class VideoStorageService:
    """Service for handling video storage operations"""
    
    def __init__(self):
        self.s3_client = None
        self.bucket_name = getattr(settings, 'AWS_S3_BUCKET_NAME', None)
        
        if self.bucket_name:
            self.s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
    
    def generate_upload_url(self, filename, content_type, file_size=None):
        """Generate presigned URL for direct S3 upload"""
        if not self.s3_client:
            raise StorageError("S3 not configured")
        
        try:
            # Validate inputs
            if not filename or not content_type:
                raise VideoError("Filename and content type are required")
            
            # Validate file size
            max_file_size = getattr(settings, 'MAX_VIDEO_FILE_SIZE', 2 * 1024 * 1024 * 1024)  # 2GB default
            if file_size and file_size > max_file_size:
                raise VideoError(f"File size exceeds maximum allowed size of {format_file_size(max_file_size)}")
            
            # Validate content type
            allowed_types = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv', 'video/webm']
            if content_type not in allowed_types:
                raise VideoError(f"Unsupported content type: {content_type}")
            
            # Generate unique key
            sanitized_name = sanitize_filename(filename)
            unique_key = f"videos/{generate_secure_token(16)}/{sanitized_name}"
            
            # Prepare conditions
            conditions = [
                {"bucket": self.bucket_name},
                {"key": unique_key},
                {"Content-Type": content_type},
            ]
            
            if file_size:
                # Allow up to 500MB by default
                max_size = getattr(settings, 'MAX_VIDEO_UPLOAD_SIZE', 500 * 1024 * 1024)
                conditions.append(["content-length-range", 1, min(file_size, max_size)])
            
            # Generate presigned POST
            response = self.s3_client.generate_presigned_post(
                Bucket=self.bucket_name,
                Key=unique_key,
                Fields={"Content-Type": content_type},
                Conditions=conditions,
                ExpiresIn=3600  # 1 hour
            )
            
            return {
                'upload_url': response['url'],
                'fields': response['fields'],
                'key': unique_key,
                'expires_in': 3600
            }
        except Exception as e:
            raise StorageError(f"Failed to generate upload URL: {str(e)}")
    
    def get_video_url(self, key, expires_in=3600):
        """Generate presigned URL for video access"""
        if not self.s3_client:
            raise StorageError("S3 not configured")
        
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': key},
                ExpiresIn=expires_in
            )
            return url
        except Exception as e:
            raise StorageError(f"Failed to generate video URL: {str(e)}")
    
    def get_video_metadata(self, key):
        """Get video metadata from S3"""
        if not self.s3_client:
            raise StorageError("S3 not configured")
        
        try:
            response = self.s3_client.head_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return {
                'content_length': response.get('ContentLength'),
                'content_type': response.get('ContentType'),
                'last_modified': response.get('LastModified'),
                'metadata': response.get('Metadata', {})
            }
        except Exception as e:
            raise StorageError(f"Failed to get video metadata: {str(e)}")
    
    def delete_video(self, key):
        """Delete video from S3"""
        if not self.s3_client:
            raise StorageError("S3 not configured")
        
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except Exception as e:
            raise StorageError(f"Failed to delete video: {str(e)}")


class GoogleDriveService:
    """Service for Google Drive video integration"""
    
    def __init__(self, user_credentials=None):
        self.credentials = None
        if user_credentials:
            self.credentials = Credentials.from_authorized_user_info(user_credentials)
        
        if self.credentials:
            self.service = build('drive', 'v3', credentials=self.credentials)
        else:
            self.service = None
    
    def get_file_info(self, file_id):
        """Get file information from Google Drive"""
        if not self.service:
            raise VideoError("Google Drive not configured")
        
        try:
            file_info = self.service.files().get(
                fileId=file_id,
                fields='id,name,size,mimeType,videoMediaMetadata,webViewLink,webContentLink'
            ).execute()
            
            return {
                'id': file_info.get('id'),
                'name': file_info.get('name'),
                'size': int(file_info.get('size', 0)),
                'mime_type': file_info.get('mimeType'),
                'duration': file_info.get('videoMediaMetadata', {}).get('durationMillis'),
                'width': file_info.get('videoMediaMetadata', {}).get('width'),
                'height': file_info.get('videoMediaMetadata', {}).get('height'),
                'view_link': file_info.get('webViewLink'),
                'download_link': file_info.get('webContentLink'),
            }
        except Exception as e:
            raise VideoError(f"Failed to get Google Drive file info: {str(e)}")
    
    def validate_video_file(self, file_id):
        """Validate that Google Drive file is a video and accessible"""
        file_info = self.get_file_info(file_id)
        
        # Check if it's a video file
        mime_type = file_info.get('mime_type', '')
        if not mime_type.startswith('video/'):
            raise VideoError("File is not a video")
        
        # Check if file has size (indicates it's accessible)
        if not file_info.get('size'):
            raise VideoError("Video file is not accessible or empty")
        
        return file_info
    
    def get_streaming_url(self, file_id):
        """Get streaming URL for Google Drive video"""
        # For Google Drive videos, we typically use the file ID
        # The frontend will handle the actual streaming through Google Drive API
        return f"https://drive.google.com/file/d/{file_id}/preview"


class YouTubeService:
    """Service for YouTube video integration"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'YOUTUBE_API_KEY', None)
    
    def get_video_info(self, video_id):
        """Get video information from YouTube"""
        if not self.api_key:
            raise VideoError("YouTube API not configured")
        
        try:
            import requests
            
            url = "https://www.googleapis.com/youtube/v3/videos"
            params = {
                'id': video_id,
                'key': self.api_key,
                'part': 'snippet,contentDetails,statistics'
            }
            
            response = requests.get(url, params=params)
            response.raise_for_status()
            
            data = response.json()
            
            if not data.get('items'):
                raise VideoError("YouTube video not found")
            
            video_data = data['items'][0]
            snippet = video_data.get('snippet', {})
            content_details = video_data.get('contentDetails', {})
            statistics = video_data.get('statistics', {})
            
            return {
                'id': video_id,
                'title': snippet.get('title'),
                'description': snippet.get('description'),
                'thumbnail': snippet.get('thumbnails', {}).get('high', {}).get('url'),
                'duration': content_details.get('duration'),
                'view_count': statistics.get('viewCount'),
                'published_at': snippet.get('publishedAt'),
                'channel_title': snippet.get('channelTitle'),
            }
        except Exception as e:
            raise VideoError(f"Failed to get YouTube video info: {str(e)}")
    
    def validate_video(self, video_id):
        """Validate YouTube video availability"""
        video_info = self.get_video_info(video_id)
        
        # Check if video is embeddable (this would require additional API call)
        # For now, we'll assume it's embeddable if we can get the info
        
        return video_info


class VideoProcessingService:
    """Service for video processing operations"""
    
    def __init__(self):
        self.storage_service = VideoStorageService()
    
    def extract_video_metadata(self, video_path_or_url):
        """Extract metadata from video file"""
        try:
            # This would use FFmpeg or similar tool to extract metadata
            # For now, returning placeholder data
            return {
                'duration': 0,
                'width': 1920,
                'height': 1080,
                'frame_rate': 30,
                'bitrate': 5000000,
                'codec': 'h264'
            }
        except Exception as e:
            raise VideoError(f"Failed to extract video metadata: {str(e)}")
    
    def generate_thumbnail(self, video_path_or_url, timestamp=10):
        """Generate thumbnail from video at specified timestamp"""
        try:
            # This would use FFmpeg to generate thumbnail
            # For now, returning placeholder
            return None
        except Exception as e:
            raise VideoError(f"Failed to generate thumbnail: {str(e)}")
    
    def validate_video_format(self, filename):
        """Validate video file format"""
        allowed_formats = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
        file_ext = os.path.splitext(filename)[1].lower()
        
        if file_ext not in allowed_formats:
            raise VideoError(f"Unsupported video format: {file_ext}")
        
        return True
    
    def get_video_duration_from_file(self, video_file):
        """Get video duration from uploaded file"""
        try:
            # This would use FFmpeg or similar to get duration
            # For now, returning 0
            return 0
        except Exception as e:
            raise VideoError(f"Failed to get video duration: {str(e)}")


class VideoStreamingService:
    """Service for video streaming operations"""
    
    def __init__(self):
        self.storage_service = VideoStorageService()
        self.gdrive_service = GoogleDriveService()
        self.youtube_service = YouTubeService()
    
    def get_streaming_url(self, video_source_type, video_source_id, user_credentials=None):
        """Get streaming URL based on video source type"""
        try:
            if video_source_type == 's3':
                return self.storage_service.get_video_url(video_source_id)
            
            elif video_source_type == 'gdrive':
                if user_credentials:
                    gdrive_service = GoogleDriveService(user_credentials)
                    return gdrive_service.get_streaming_url(video_source_id)
                else:
                    return self.gdrive_service.get_streaming_url(video_source_id)
            
            elif video_source_type == 'youtube':
                # For YouTube, return embed URL
                return f"https://www.youtube.com/embed/{video_source_id}"
            
            else:
                raise VideoError(f"Unsupported video source type: {video_source_type}")
                
        except Exception as e:
            raise VideoError(f"Failed to get streaming URL: {str(e)}")
    
    def cache_video_metadata(self, video_id, metadata):
        """Cache video metadata for faster access"""
        cache_key = create_cache_key('video_metadata', video_id)
        cache.set(cache_key, metadata, timeout=3600)  # Cache for 1 hour
    
    def get_cached_video_metadata(self, video_id):
        """Get cached video metadata"""
        cache_key = create_cache_key('video_metadata', video_id)
        return cache.get(cache_key)


class VideoValidationService:
    """Service for video validation operations"""
    
    def __init__(self):
        self.gdrive_service = GoogleDriveService()
        self.youtube_service = YouTubeService()
    
    def validate_video_url(self, url):
        """Validate video URL and extract metadata"""
        # Check if it's a Google Drive URL
        gdrive_file_id = extract_google_drive_file_id(url)
        if gdrive_file_id:
            try:
                file_info = self.gdrive_service.validate_video_file(gdrive_file_id)
                return {
                    'source_type': 'gdrive',
                    'source_id': gdrive_file_id,
                    'metadata': file_info
                }
            except Exception as e:
                raise VideoError(f"Invalid Google Drive video: {str(e)}")
        
        # Check if it's a YouTube URL
        youtube_video_id = extract_youtube_video_id(url)
        if youtube_video_id:
            try:
                video_info = self.youtube_service.validate_video(youtube_video_id)
                return {
                    'source_type': 'youtube',
                    'source_id': youtube_video_id,
                    'metadata': video_info
                }
            except Exception as e:
                raise VideoError(f"Invalid YouTube video: {str(e)}")
        
        raise VideoError("Unsupported video URL format")
    
    def validate_uploaded_video(self, video_file):
        """Validate uploaded video file"""
        try:
            # Check file size
            max_size = getattr(settings, 'MAX_VIDEO_UPLOAD_SIZE', 500 * 1024 * 1024)
            if video_file.size > max_size:
                raise VideoError(f"File size exceeds maximum allowed size ({format_file_size(max_size)})")
            
            # Check file format
            processing_service = VideoProcessingService()
            processing_service.validate_video_format(video_file.name)
            
            return True
            
        except Exception as e:
            raise VideoError(f"Video validation failed: {str(e)}")


class VideoProcessingService:
    """Service for video processing operations"""
    
    def __init__(self):
        self.supported_formats = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'wmv', 'flv']
        self.supported_mime_types = [
            'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
            'video/x-matroska', 'video/webm', 'video/x-ms-wmv', 'video/x-flv'
        ]
    
    def validate_video_format(self, filename):
        """Validate video file format"""
        if not filename:
            raise VideoError("Filename is required")
        
        extension = filename.lower().split('.')[-1] if '.' in filename else ''
        if extension not in self.supported_formats:
            raise VideoError(f"Unsupported video format: {extension}")
        
        return True
    
    def validate_file_size(self, file_size):
        """Validate video file size"""
        max_size = getattr(settings, 'MAX_VIDEO_FILE_SIZE', 2 * 1024 * 1024 * 1024)  # 2GB
        if file_size > max_size:
            raise VideoError(f"File size {format_file_size(file_size)} exceeds maximum allowed size {format_file_size(max_size)}")
        
        return True
    
    def validate_content_type(self, content_type):
        """Validate video content type"""
        if content_type not in self.supported_mime_types:
            raise VideoError(f"Unsupported content type: {content_type}")
        
        return True
    
    def generate_thumbnails(self, video):
        """Generate thumbnails for video (placeholder for actual implementation)"""
        # This would typically use FFmpeg or similar tool
        # For now, return a placeholder implementation
        try:
            cache_key = create_cache_key('thumbnail_generation', video.id)
            cache.set(cache_key, 'processing', timeout=3600)
            
            # Simulate thumbnail generation
            # In real implementation, this would:
            # 1. Extract frames from video at specific intervals
            # 2. Generate thumbnails of different sizes
            # 3. Upload thumbnails to storage
            # 4. Update video model with thumbnail paths
            
            return {
                'status': 'queued',
                'message': 'Thumbnail generation queued'
            }
        except Exception as e:
            raise VideoError(f"Failed to generate thumbnails: {str(e)}")
    
    def transcode_video(self, video, resolutions=None):
        """Transcode video to different resolutions (placeholder)"""
        if not resolutions:
            resolutions = ['480p', '720p', '1080p']
        
        try:
            # In real implementation, this would use FFmpeg to:
            # 1. Transcode video to different resolutions
            # 2. Optimize for streaming
            # 3. Generate adaptive bitrate streams
            # 4. Store transcoded versions
            
            cache_key = create_cache_key('video_transcoding', video.id)
            cache.set(cache_key, {
                'status': 'processing',
                'resolutions': resolutions,
                'progress': 0
            }, timeout=3600)
            
            return {
                'status': 'queued',
                'resolutions': resolutions,
                'message': 'Video transcoding queued'
            }
        except Exception as e:
            raise VideoError(f"Failed to transcode video: {str(e)}")
    
    def extract_metadata(self, video_file):
        """Extract metadata from video file (placeholder)"""
        try:
            # In real implementation, this would use FFprobe or similar tool
            # to extract detailed video metadata
            
            return {
                'duration': None,
                'resolution': None,
                'codec': None,
                'bitrate': None,
                'fps': None,
                'metadata_extracted': True
            }
        except Exception as e:
            raise VideoError(f"Failed to extract metadata: {str(e)}")
    
    def cleanup_temp_files(self, video):
        """Clean up temporary processing files"""
        try:
            # Clean up any temporary files created during processing
            cache_key = create_cache_key('temp_files', video.id)
            cache.delete(cache_key)
            return True
        except Exception as e:
            raise VideoError(f"Failed to cleanup temp files: {str(e)}")


# Singleton instances
video_storage_service = VideoStorageService()
video_processing_service = VideoProcessingService()
video_streaming_service = VideoStreamingService()
video_validation_service = VideoValidationService()

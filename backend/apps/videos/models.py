"""
Video models for Watch Party Backend
"""

import uuid
from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.validators import FileExtensionValidator

User = get_user_model()


class Video(models.Model):
    """Video model for storing video information"""
    
    SOURCE_CHOICES = [
        ('upload', 'Direct Upload'),
        ('gdrive', 'Google Drive'),
        ('s3', 'Amazon S3'),
        ('youtube', 'YouTube'),
        ('url', 'External URL'),
    ]
    
    VISIBILITY_CHOICES = [
        ('public', 'Public'),
        ('friends', 'Friends Only'),
        ('private', 'Private'),
    ]
    
    STATUS_CHOICES = [
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('ready', 'Ready'),
        ('failed', 'Failed'),
        ('deleted', 'Deleted'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200, verbose_name='Title')
    description = models.TextField(blank=True, verbose_name='Description')
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_videos')
    
    # File information
    file = models.FileField(
        upload_to='videos/%Y/%m/%d/',
        null=True, blank=True,
        validators=[FileExtensionValidator(allowed_extensions=['mp4', 'avi', 'mov', 'mkv', 'webm'])],
        verbose_name='Video File'
    )
    thumbnail = models.ImageField(upload_to='thumbnails/%Y/%m/%d/', null=True, blank=True)
    duration = models.DurationField(null=True, blank=True, verbose_name='Duration')
    file_size = models.BigIntegerField(null=True, blank=True, verbose_name='File Size (bytes)')
    
    # Source information
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES, default='upload')
    source_url = models.URLField(blank=True, verbose_name='Source URL')
    source_id = models.CharField(max_length=255, blank=True, verbose_name='External Source ID')
    
    # Google Drive specific fields
    gdrive_file_id = models.CharField(max_length=255, blank=True, verbose_name='Google Drive File ID')
    gdrive_download_url = models.URLField(blank=True, verbose_name='Google Drive Download URL')
    gdrive_mime_type = models.CharField(max_length=100, blank=True, verbose_name='Google Drive MIME Type')
    
    # Metadata
    resolution = models.CharField(max_length=20, blank=True, verbose_name='Resolution')
    codec = models.CharField(max_length=50, blank=True, verbose_name='Video Codec')
    bitrate = models.IntegerField(null=True, blank=True, verbose_name='Bitrate (kbps)')
    fps = models.FloatField(null=True, blank=True, verbose_name='Frame Rate')
    
    # Settings
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='private')
    allow_download = models.BooleanField(default=False, verbose_name='Allow Download')
    require_premium = models.BooleanField(default=False, verbose_name='Premium Required')
    
    # Status and analytics
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='uploading')
    view_count = models.PositiveIntegerField(default=0, verbose_name='View Count')
    like_count = models.PositiveIntegerField(default=0, verbose_name='Like Count')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'videos'
        ordering = ['-created_at']
        verbose_name = 'Video'
        verbose_name_plural = 'Videos'
        
    def __str__(self):
        return self.title


class VideoLike(models.Model):
    """Video likes/dislikes"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='likes')
    is_like = models.BooleanField(default=True)  # True for like, False for dislike
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'video_likes'
        unique_together = [['user', 'video']]
        verbose_name = 'Video Like'
        verbose_name_plural = 'Video Likes'


class VideoComment(models.Model):
    """Video comments"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField(verbose_name='Comment')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    is_edited = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'video_comments'
        ordering = ['-created_at']
        verbose_name = 'Video Comment'
        verbose_name_plural = 'Video Comments'
        
    def __str__(self):
        return f"Comment by {self.user.full_name} on {self.video.title}"


class VideoView(models.Model):
    """Track video views for analytics"""
    
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='video_views')
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    watch_duration = models.DurationField(null=True, blank=True)
    completion_percentage = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'video_views'
        verbose_name = 'Video View'
        verbose_name_plural = 'Video Views'


class VideoUpload(models.Model):
    """Track video upload progress"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('uploading', 'Uploading'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploads')
    video = models.ForeignKey(Video, null=True, blank=True, on_delete=models.CASCADE)
    
    # Upload details
    filename = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    upload_url = models.URLField(blank=True)
    
    # Progress tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress_percentage = models.FloatField(default=0.0)
    error_message = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'video_uploads'
        ordering = ['-created_at']
        verbose_name = 'Video Upload'
        verbose_name_plural = 'Video Uploads'
        
    def __str__(self):
        return f"Upload: {self.filename} ({self.status})"

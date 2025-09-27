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
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['uploader', 'visibility']),
            models.Index(fields=['source_type', 'status']),
            models.Index(fields=['visibility', 'created_at']),
        ]
        
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
        indexes = [
            models.Index(fields=['video', 'created_at']),
            models.Index(fields=['user', 'created_at']),
            models.Index(fields=['video', 'user']),
        ]


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
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['video', 'status']),
        ]
        
    def __str__(self):
        return f"Upload: {self.filename} ({self.status})"


class VideoProcessing(models.Model):
    """Video processing status and progress tracking"""
    
    STATUS_CHOICES = [
        ('queued', 'Queued'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    video = models.OneToOneField(Video, on_delete=models.CASCADE, related_name='processing')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='queued')
    progress_percentage = models.FloatField(default=0.0, verbose_name='Progress %')
    processing_started_at = models.DateTimeField(null=True, blank=True)
    processing_completed_at = models.DateTimeField(null=True, blank=True)
    error_message = models.TextField(blank=True, verbose_name='Error Message')
    
    # Processing results
    resolutions_generated = models.JSONField(default=list, verbose_name='Generated Resolutions')
    thumbnail_generated = models.BooleanField(default=False, verbose_name='Thumbnail Generated')
    metadata_extracted = models.BooleanField(default=False, verbose_name='Metadata Extracted')
    
    # Processing configuration
    target_resolutions = models.JSONField(default=list, verbose_name='Target Resolutions')
    generate_thumbnail = models.BooleanField(default=True, verbose_name='Generate Thumbnail')
    extract_metadata = models.BooleanField(default=True, verbose_name='Extract Metadata')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'video_processing'
        verbose_name = 'Video Processing'
        verbose_name_plural = 'Video Processing'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['processing_started_at']),
        ]
        
    def __str__(self):
        return f"Processing: {self.video.title} ({self.status})"


class VideoStreamingUrl(models.Model):
    """Temporary streaming URLs for videos"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    video = models.ForeignKey(Video, on_delete=models.CASCADE, related_name='streaming_urls')
    resolution = models.CharField(max_length=20, default='original', verbose_name='Resolution')  # 480p, 720p, 1080p, original
    url = models.URLField(verbose_name='Streaming URL')
    expires_at = models.DateTimeField(verbose_name='Expires At')
    access_count = models.PositiveIntegerField(default=0, verbose_name='Access Count')
    max_access_count = models.PositiveIntegerField(null=True, blank=True, verbose_name='Max Access Count')
    
    # Requesting user info for access control
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_urls')
    ip_address = models.GenericIPAddressField(verbose_name='IP Address')
    user_agent = models.TextField(blank=True, verbose_name='User Agent')
    
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'video_streaming_urls'
        verbose_name = 'Video Streaming URL'
        verbose_name_plural = 'Video Streaming URLs'
        indexes = [
            models.Index(fields=['video', 'resolution']),
            models.Index(fields=['expires_at']),
            models.Index(fields=['requested_by', 'created_at']),
        ]
        
    def __str__(self):
        return f"Streaming URL for {self.video.title} ({self.resolution})"
    
    @property
    def is_expired(self):
        return timezone.now() > self.expires_at
    
    @property
    def can_access(self):
        if self.is_expired:
            return False
        if self.max_access_count and self.access_count >= self.max_access_count:
            return False
        return True

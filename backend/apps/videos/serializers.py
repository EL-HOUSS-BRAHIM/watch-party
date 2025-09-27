"""
Video serializers for Watch Party Backend
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from django.contrib.auth import get_user_model
from .models import Video, VideoLike, VideoComment, VideoUpload

User = get_user_model()


class VideoSerializer(serializers.ModelSerializer):
    """Basic video serializer"""
    
    uploader = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    file_size_formatted = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'uploader', 'thumbnail', 'duration',
            'duration_formatted', 'file_size', 'file_size_formatted', 'source_type',
            'resolution', 'visibility', 'status', 'view_count', 'like_count',
            'is_liked', 'can_edit', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'uploader', 'created_at', 'updated_at', 'view_count', 'like_count']
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_uploader(self, obj):
        return {
            'id': str(obj.uploader.id),
            'name': obj.uploader.full_name,
            'avatar': obj.uploader.avatar.url if obj.uploader.avatar else None,
            'is_premium': obj.uploader.is_premium
        }
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_duration_formatted(self, obj):
        if obj.duration:
            total_seconds = int(obj.duration.total_seconds())
            hours = total_seconds // 3600
            minutes = (total_seconds % 3600) // 60
            seconds = total_seconds % 60
            
            if hours > 0:
                return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
            return f"{minutes:02d}:{seconds:02d}"
        return None
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_file_size_formatted(self, obj):
        if obj.file_size:
            for unit in ['B', 'KB', 'MB', 'GB']:
                if obj.file_size < 1024.0:
                    return f"{obj.file_size:.1f} {unit}"
                obj.file_size /= 1024.0
            return f"{obj.file_size:.1f} TB"
        return None
    
    @extend_schema_field(OpenApiTypes.BOOL)

    
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return VideoLike.objects.filter(user=request.user, video=obj, is_like=True).exists()
        return False
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.uploader == request.user
        return False


class VideoDetailSerializer(VideoSerializer):
    """Detailed video serializer with additional information"""
    
    comments_count = serializers.SerializerMethodField()
    can_download = serializers.SerializerMethodField()
    
    class Meta(VideoSerializer.Meta):
        fields = VideoSerializer.Meta.fields + [
            'source_url', 'codec', 'bitrate', 'fps', 'allow_download', 
            'require_premium', 'comments_count', 'can_download'
        ]
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_comments_count(self, obj):
        return obj.comments.count()
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_can_download(self, obj):
        if not obj.allow_download:
            return False
        
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Owner can always download
        if obj.uploader == request.user:
            return True
        
        # Check if premium required
        if obj.require_premium and not request.user.is_subscription_active:
            return False
        
        return True


class VideoCreateSerializer(serializers.ModelSerializer):
    """Video creation serializer"""
    
    class Meta:
        model = Video
        fields = [
            'title', 'description', 'source_type', 'source_url', 'source_id',
            'visibility', 'allow_download', 'require_premium'
        ]
    
    def create(self, validated_data):
        validated_data['uploader'] = self.context['request'].user
        return super().create(validated_data)


class VideoUpdateSerializer(serializers.ModelSerializer):
    """Video update serializer"""
    
    class Meta:
        model = Video
        fields = [
            'title', 'description', 'visibility', 'allow_download', 'require_premium'
        ]


class VideoCommentSerializer(serializers.ModelSerializer):
    """Video comment serializer"""
    
    user = serializers.SerializerMethodField()
    replies = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    video_id = serializers.UUIDField(write_only=True, required=False)
    parent_id = serializers.UUIDField(write_only=True, required=False)
    
    class Meta:
        model = VideoComment
        fields = [
            'id', 'content', 'user', 'parent', 'is_edited',
            'replies', 'can_edit', 'created_at', 'updated_at',
            'video_id', 'parent_id'
        ]
        read_only_fields = ['id', 'user', 'is_edited', 'created_at', 'updated_at', 'parent']
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_user(self, obj):
        return {
            'id': str(obj.user.id),
            'name': obj.user.full_name,
            'avatar': obj.user.avatar.url if obj.user.avatar else None,
            'is_premium': obj.user.is_premium
        }
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_replies(self, obj):
        if obj.replies.exists():
            return VideoCommentSerializer(obj.replies.all(), many=True, context=self.context).data
        return []
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.user == request.user
        return False


class VideoLikeSerializer(serializers.ModelSerializer):
    """Video like serializer"""
    
    class Meta:
        model = VideoLike
        fields = ['is_like']


class VideoUploadSerializer(serializers.ModelSerializer):
    """Video upload progress serializer"""
    
    class Meta:
        model = VideoUpload
        fields = [
            'id', 'filename', 'file_size', 'status', 'progress_percentage',
            'error_message', 'created_at', 'updated_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'completed_at']


class VideoUploadCreateSerializer(serializers.Serializer):
    """Video upload initiation serializer"""
    
    filename = serializers.CharField(max_length=255)
    file_size = serializers.IntegerField(min_value=1)
    content_type = serializers.CharField(max_length=100)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True)
    visibility = serializers.ChoiceField(choices=Video.VISIBILITY_CHOICES, default='private')


class VideoSearchSerializer(serializers.Serializer):
    """Video search serializer"""
    
    query = serializers.CharField(required=False, allow_blank=True)
    uploader = serializers.UUIDField(required=False)
    source_type = serializers.ChoiceField(choices=Video.SOURCE_CHOICES, required=False)
    visibility = serializers.ChoiceField(choices=Video.VISIBILITY_CHOICES, required=False)
    require_premium = serializers.BooleanField(required=False)
    order_by = serializers.ChoiceField(
        choices=['created_at', '-created_at', 'title', '-title', 'view_count', '-view_count'],
        default='-created_at'
    )

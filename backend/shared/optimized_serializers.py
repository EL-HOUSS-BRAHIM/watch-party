"""
Optimized serializers for better API performance
"""

from rest_framework import serializers
from django.core.cache import cache
from django.db.models import Count, Q
from django.apps import apps
import hashlib
import json

class OptimizedModelSerializer(serializers.ModelSerializer):
    """
    Base serializer with performance optimizations
    """
    
    def __init__(self, *args, **kwargs):
        # Extract optimization parameters
        self.use_cache = kwargs.pop('use_cache', False)
        self.cache_timeout = kwargs.pop('cache_timeout', 300)
        self.optimize_queries = kwargs.pop('optimize_queries', True)
        super().__init__(*args, **kwargs)
    
    def to_representation(self, instance):
        """Optimized representation with caching"""
        if self.use_cache:
            cache_key = self.get_cache_key(instance)
            cached_data = cache.get(cache_key)
            if cached_data:
                return cached_data
        
        data = super().to_representation(instance)
        
        if self.use_cache:
            cache.set(cache_key, data, timeout=self.cache_timeout)
        
        return data
    
    def get_cache_key(self, instance):
        """Generate cache key for instance"""
        model_name = instance._meta.label_lower
        instance_id = instance.pk
        # Include fields that might affect serialization
        fields_hash = hashlib.md5(
            json.dumps(sorted(self.fields.keys())).encode()
        ).hexdigest()[:8]
        return f"serializer:{model_name}:{instance_id}:{fields_hash}"
    
    @classmethod
    def optimize_queryset(cls, queryset):
        """Apply common query optimizations"""
        # This should be overridden in child classes
        return queryset


class OptimizedUserSerializer(OptimizedModelSerializer):
    """Optimized user serializer"""
    
    followers_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    videos_count = serializers.SerializerMethodField()
    
    class Meta:
        model = apps.get_model('authentication', 'User')
        fields = [
            'id', 'email', 'first_name', 'last_name',
            'profile_picture', 'is_online', 'date_joined',
            'followers_count', 'following_count', 'videos_count'
        ]
        read_only_fields = ['id', 'date_joined', 'is_online']
    
    @classmethod
    def optimize_queryset(cls, queryset):
        """Optimize user queryset"""
        return queryset.select_related().prefetch_related(
            'followers', 'following', 'videos'
        ).annotate(
            followers_count=Count('followers', distinct=True),
            following_count=Count('following', distinct=True),
            videos_count=Count('videos', filter=Q(videos__is_active=True), distinct=True)
        )
    
    def get_followers_count(self, obj):
        return getattr(obj, 'followers_count', obj.followers.count())
    
    def get_following_count(self, obj):
        return getattr(obj, 'following_count', obj.following.count())
    
    def get_videos_count(self, obj):
        return getattr(obj, 'videos_count', obj.videos.filter(is_active=True).count())


class OptimizedVideoSerializer(OptimizedModelSerializer):
    """Optimized video serializer"""
    
    uploaded_by = serializers.SerializerMethodField()
    likes_count = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = apps.get_model('videos', 'Video')
        fields = [
            'id', 'title', 'description', 'thumbnail', 'duration',
            'created_at', 'view_count', 'uploaded_by', 'likes_count',
            'comments_count', 'is_liked', 'tags', 'category'
        ]
        read_only_fields = ['id', 'created_at', 'view_count']
    
    @classmethod
    def optimize_queryset(cls, queryset, user=None):
        """Optimize video queryset"""
        queryset = queryset.select_related('uploaded_by').prefetch_related('tags')
        
        # Add aggregations
        queryset = queryset.annotate(
            likes_count=Count('likes', distinct=True),
            comments_count=Count('comments', distinct=True)
        )
        
        # Add user-specific annotations if user provided
        if user and user.is_authenticated:
            queryset = queryset.annotate(
                is_liked=Count('likes', filter=Q(likes__user=user), distinct=True)
            )
        
        return queryset
    
    def get_uploaded_by(self, obj):
        """Get optimized uploader data"""
        uploader = obj.uploaded_by
        return {
            'id': uploader.id,
            'email': uploader.email,
            'name': uploader.get_full_name(),
            'profile_picture': uploader.profile_picture.url if uploader.profile_picture else None,
        }
    
    def get_likes_count(self, obj):
        return getattr(obj, 'likes_count', 0)
    
    def get_comments_count(self, obj):
        return getattr(obj, 'comments_count', 0)
    
    def get_is_liked(self, obj):
        user = self.context.get('request', {}).user
        if user and user.is_authenticated:
            return getattr(obj, 'is_liked', 0) > 0
        return False


class OptimizedWatchPartySerializer(OptimizedModelSerializer):
    """Optimized watch party serializer"""
    
    host = serializers.SerializerMethodField()
    participants_count = serializers.SerializerMethodField()
    current_video = serializers.SerializerMethodField()
    
    class Meta:
        model = apps.get_model('parties', 'WatchParty')
        fields = [
            'id', 'title', 'description', 'is_active', 'is_public',
            'created_at', 'host', 'participants_count', 'current_video',
            'max_participants', 'scheduled_start'
        ]
        read_only_fields = ['id', 'created_at']
    
    @classmethod
    def optimize_queryset(cls, queryset):
        """Optimize watch party queryset"""
        return queryset.select_related('host', 'current_video').prefetch_related(
            'participants'
        ).annotate(
            participants_count=Count('participants', filter=Q(participants__is_active=True))
        )
    
    def get_host(self, obj):
        """Get optimized host data"""
        host = obj.host
        return {
            'id': host.id,
            'email': host.email,
            'name': host.get_full_name(),
            'profile_picture': host.profile_picture.url if host.profile_picture else None,
        }
    
    def get_participants_count(self, obj):
        return getattr(obj, 'participants_count', obj.participants.filter(is_active=True).count())
    
    def get_current_video(self, obj):
        """Get optimized current video data"""
        if not obj.current_video:
            return None
        
        video = obj.current_video
        return {
            'id': video.id,
            'title': video.title,
            'thumbnail': video.thumbnail.url if video.thumbnail else None,
            'duration': video.duration,
        }


class OptimizedNotificationSerializer(OptimizedModelSerializer):
    """Optimized notification serializer"""
    
    related_party = serializers.SerializerMethodField()
    related_video = serializers.SerializerMethodField()
    related_user = serializers.SerializerMethodField()
    
    class Meta:
        model = apps.get_model('notifications', 'Notification')
        fields = [
            'id', 'title', 'content', 'icon', 'color', 'priority',
            'is_read', 'requires_action', 'action_url', 'action_text',
            'created_at', 'read_at', 'related_party', 'related_video',
            'related_user'
        ]
        read_only_fields = ['id', 'created_at', 'read_at']
    
    @classmethod
    def optimize_queryset(cls, queryset):
        """Optimize notification queryset"""
        return queryset.select_related(
            'party', 'video', 'related_user', 'template'
        )
    
    def get_related_party(self, obj):
        """Get optimized party data"""
        if not obj.party:
            return None
        
        party = obj.party
        return {
            'id': party.id,
            'title': party.title,
        }
    
    def get_related_video(self, obj):
        """Get optimized video data"""
        if not obj.video:
            return None
        
        video = obj.video
        return {
            'id': video.id,
            'title': video.title,
            'thumbnail': video.thumbnail.url if video.thumbnail else None,
        }
    
    def get_related_user(self, obj):
        """Get optimized user data"""
        if not obj.related_user:
            return None
        
        user = obj.related_user
        return {
            'id': user.id,
            'email': user.email,
            'name': user.get_full_name(),
            'profile_picture': user.profile_picture.url if user.profile_picture else None,
        }


class BulkCreateSerializer(serializers.Serializer):
    """
    Serializer for bulk create operations
    """
    
    def create(self, validated_data):
        """Bulk create implementation"""
        model_class = self.Meta.model
        instances = []
        
        for item_data in validated_data:
            instances.append(model_class(**item_data))
        
        # Use bulk_create for better performance
        created_instances = model_class.objects.bulk_create(
            instances,
            batch_size=100,  # Process in batches
            ignore_conflicts=True
        )
        
        return created_instances


class PaginatedResponseSerializer(serializers.Serializer):
    """
    Standardized paginated response serializer
    """
    
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = serializers.ListField()
    
    # Additional metadata
    page_size = serializers.IntegerField(required=False)
    page_number = serializers.IntegerField(required=False)
    total_pages = serializers.IntegerField(required=False)


# Performance optimization utilities
def optimize_serializer_context(serializer_class, queryset, request=None):
    """
    Optimize serializer context and queryset
    """
    context = {'request': request} if request else {}
    
    # Apply queryset optimizations if available
    if hasattr(serializer_class, 'optimize_queryset'):
        if request and hasattr(request, 'user'):
            queryset = serializer_class.optimize_queryset(queryset, user=request.user)
        else:
            queryset = serializer_class.optimize_queryset(queryset)
    
    return queryset, context


def serialize_with_cache(serializer_class, instance_or_queryset, cache_key_prefix=None, 
                        cache_timeout=300, **serializer_kwargs):
    """
    Serialize with caching support
    """
    if cache_key_prefix:
        # Generate cache key
        if hasattr(instance_or_queryset, '__iter__') and not isinstance(instance_or_queryset, (str, bytes)):
            # It's a queryset or list
            ids = [str(obj.pk) for obj in instance_or_queryset]
            cache_key = f"{cache_key_prefix}:bulk:{hashlib.md5(','.join(ids).encode()).hexdigest()}"
        else:
            # Single instance
            cache_key = f"{cache_key_prefix}:{instance_or_queryset.pk}"
        
        # Check cache
        cached_data = cache.get(cache_key)
        if cached_data:
            return cached_data
    
    # Serialize data
    serializer = serializer_class(instance_or_queryset, **serializer_kwargs)
    data = serializer.data
    
    # Cache the result
    if cache_key_prefix:
        cache.set(cache_key, data, timeout=cache_timeout)
    
    return data


class LazyLoadingSerializer(serializers.ModelSerializer):
    """
    Serializer that supports lazy loading of related fields
    """
    
    def __init__(self, *args, **kwargs):
        self.lazy_fields = kwargs.pop('lazy_fields', [])
        super().__init__(*args, **kwargs)
    
    def to_representation(self, instance):
        """Lazy load specified fields only when needed"""
        data = super().to_representation(instance)
        
        # Remove lazy fields from initial representation
        for field_name in self.lazy_fields:
            if field_name in data:
                # Replace with a URL or identifier for lazy loading
                data[f"{field_name}_url"] = f"/api/{instance._meta.label_lower}/{instance.pk}/{field_name}/"
                del data[field_name]
        
        return data

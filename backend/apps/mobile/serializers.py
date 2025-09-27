"""
Mobile app serializers
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from .models import MobileDevice, MobileSyncData, MobileAppCrash, MobileAnalytics


class MobileDeviceSerializer(serializers.ModelSerializer):
    """Serializer for mobile device"""
    
    class Meta:
        model = MobileDevice
        fields = [
            'id', 'device_id', 'platform', 'model', 'os_version', 
            'app_version', 'push_enabled', 'last_sync', 'last_active',
            'is_active', 'settings', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_sync', 'last_active']


class MobileSyncDataSerializer(serializers.ModelSerializer):
    """Serializer for mobile sync data"""
    
    class Meta:
        model = MobileSyncData
        fields = [
            'id', 'sync_type', 'sync_status', 'data_types', 'data_size_bytes',
            'records_count', 'started_at', 'completed_at', 'duration_seconds',
            'error_message', 'retry_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class MobileAppCrashSerializer(serializers.ModelSerializer):
    """Serializer for mobile app crash reports"""
    
    class Meta:
        model = MobileAppCrash
        fields = [
            'id', 'crash_id', 'stack_trace', 'exception_type', 'exception_message',
            'screen_name', 'user_action', 'memory_usage_mb', 'battery_level',
            'is_resolved', 'crashed_at', 'reported_at'
        ]
        read_only_fields = ['id', 'reported_at']


class MobileAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for mobile analytics"""
    
    class Meta:
        model = MobileAnalytics
        fields = [
            'id', 'event_type', 'event_name', 'event_data', 'session_id',
            'screen_name', 'load_time_ms', 'memory_usage_mb', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class MobileConfigSerializer(serializers.Serializer):
    """Serializer for mobile app configuration"""
    
    app_info = serializers.DictField()
    features = serializers.DictField()
    limits = serializers.DictField()
    media_settings = serializers.DictField()
    sync_settings = serializers.DictField()
    ui_settings = serializers.DictField()
    notification_settings = serializers.DictField()


class MobileHomeDataSerializer(serializers.Serializer):
    """Serializer for mobile home screen data"""
    
    user_info = serializers.DictField()
    quick_stats = serializers.DictField()
    active_parties = serializers.ListField()
    recent_videos = serializers.ListField()
    friend_activities = serializers.ListField()
    trending = serializers.DictField()
    recommendations = serializers.ListField()
    last_updated = serializers.DateTimeField()


class MobileSyncRequestSerializer(serializers.Serializer):
    """Serializer for sync request"""
    
    device_id = serializers.CharField(max_length=255)
    sync_type = serializers.ChoiceField(
        choices=['full', 'incremental', 'emergency'],
        default='incremental'
    )
    last_sync = serializers.DateTimeField(required=False, allow_null=True)
    data_types = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        default=['parties', 'videos', 'notifications']
    )


class MobileSyncResponseSerializer(serializers.Serializer):
    """Serializer for sync response"""
    
    sync_id = serializers.UUIDField()
    data = serializers.DictField()
    sync_timestamp = serializers.DateTimeField()
    has_more = serializers.BooleanField(default=False)


class DeviceRegistrationSerializer(serializers.Serializer):
    """Serializer for device registration"""
    
    device_id = serializers.CharField(max_length=255)
    platform = serializers.ChoiceField(
        choices=['ios', 'android', 'web', 'unknown'],
        default='unknown'
    )
    model = serializers.CharField(max_length=100, required=False, allow_blank=True)
    os_version = serializers.CharField(max_length=50, required=False, allow_blank=True)
    app_version = serializers.CharField(max_length=20, required=False, allow_blank=True)
    push_token = serializers.CharField(max_length=500, required=False, allow_blank=True)


class AnalyticsEventSerializer(serializers.Serializer):
    """Serializer for analytics events"""
    
    event_type = serializers.ChoiceField(choices=[
        'app_open', 'app_close', 'screen_view', 'button_tap',
        'video_play', 'video_pause', 'party_join', 'party_leave',
        'chat_message', 'feature_use'
    ])
    event_name = serializers.CharField(max_length=100)
    event_data = serializers.DictField(required=False, default=dict)
    session_id = serializers.CharField(max_length=255)
    screen_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    load_time_ms = serializers.IntegerField(required=False, allow_null=True)
    memory_usage_mb = serializers.IntegerField(required=False, allow_null=True)


class CrashReportSerializer(serializers.Serializer):
    """Serializer for crash reports"""
    
    device_id = serializers.CharField(max_length=255)
    crash_data = serializers.DictField()
    
    def validate_crash_data(self, value):
        """Validate crash data structure"""
        required_fields = ['crash_id', 'exception_type', 'stack_trace']
        for field in required_fields:
            if field not in value:
                raise serializers.ValidationError(f"Missing required field: {field}")
        return value


class PushTokenUpdateSerializer(serializers.Serializer):
    """Serializer for push token updates"""
    
    token = serializers.CharField(max_length=500)
    device_type = serializers.ChoiceField(choices=['ios', 'android'])
    
    
class AppInfoSerializer(serializers.Serializer):
    """Serializer for app information"""
    
    current_version = serializers.CharField()
    latest_version = serializers.CharField()
    needs_update = serializers.BooleanField()
    force_update = serializers.BooleanField()
    update_url = serializers.URLField(required=False, allow_null=True)
    changelog = serializers.ListField(child=serializers.CharField())
    maintenance_mode = serializers.BooleanField()
    maintenance_message = serializers.CharField(required=False, allow_null=True)

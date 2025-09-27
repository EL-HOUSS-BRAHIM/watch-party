"""
Missing serializers for analytics views
"""

from rest_framework import serializers

class PlatformOverviewSerializer(serializers.Serializer):
    """Serializer for platform overview analytics"""
    days = serializers.IntegerField(required=False, default=30, min_value=1, max_value=365)

class UserBehaviorSerializer(serializers.Serializer):
    """Serializer for user behavior analytics"""
    days = serializers.IntegerField(required=False, default=30, min_value=1, max_value=365)

class ContentPerformanceRequestSerializer(serializers.Serializer):
    """Serializer for content performance analytics"""
    days = serializers.IntegerField(required=False, default=30, min_value=1, max_value=365)

class RevenueAnalyticsSerializer(serializers.Serializer):
    """Serializer for revenue analytics"""
    days = serializers.IntegerField(required=False, default=30, min_value=1, max_value=365)

class UserPersonalAnalyticsSerializer(serializers.Serializer):
    """Serializer for user personal analytics"""
    days = serializers.IntegerField(required=False, default=30, min_value=1, max_value=365)

class RealTimeAnalyticsSerializer(serializers.Serializer):
    """Serializer for real-time analytics - no input parameters needed"""
    pass

class VideoDetailedAnalyticsSerializer(serializers.Serializer):
    """Serializer for video detailed analytics"""
    pass  # Uses video_id from URL

class UserBehaviorDetailedSerializer(serializers.Serializer):
    """Serializer for detailed user behavior"""
    days = serializers.IntegerField(required=False, default=30, min_value=1, max_value=365)

class PredictiveAnalyticsRequestSerializer(serializers.Serializer):
    """Serializer for predictive analytics"""
    forecast_days = serializers.IntegerField(required=False, default=7, min_value=1, max_value=30)

class ComparativeAnalyticsSerializer(serializers.Serializer):
    """Serializer for comparative analytics"""
    current_days = serializers.IntegerField(required=False, default=7, min_value=1, max_value=365)
    compare_days = serializers.IntegerField(required=False, default=7, min_value=1, max_value=365)

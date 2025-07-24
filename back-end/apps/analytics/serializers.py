"""
Analytics serializers for Watch Party Backend
"""

from rest_framework import serializers
from .models import UserAnalytics, PartyAnalytics, VideoAnalytics, AnalyticsEvent, SystemAnalytics


class UserAnalyticsSerializer(serializers.ModelSerializer):
    """User analytics serializer"""
    
    total_watch_time_hours = serializers.ReadOnlyField()
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    
    class Meta:
        model = UserAnalytics
        fields = [
            'id', 'user', 'user_name', 
            'total_watch_time_minutes', 'total_watch_time_hours',
            'this_week_watch_time_minutes', 'this_month_watch_time_minutes',
            'total_parties_joined', 'total_parties_hosted',
            'this_week_parties_joined', 'this_month_parties_joined',
            'total_messages_sent', 'this_week_messages_sent', 'this_month_messages_sent',
            'videos_uploaded', 'reactions_sent', 'friends_added',
            'average_session_duration_minutes', 'favorite_genre', 'most_active_hour',
            'last_updated', 'created_at'
        ]
        read_only_fields = ['id', 'user', 'last_updated', 'created_at']


class PartyAnalyticsSerializer(serializers.ModelSerializer):
    """Party analytics serializer"""
    
    engagement_score = serializers.ReadOnlyField()
    average_session_duration = serializers.ReadOnlyField()
    party_title = serializers.CharField(source='party.title', read_only=True)
    
    class Meta:
        model = PartyAnalytics
        fields = [
            'id', 'party', 'party_title',
            'total_participants', 'peak_concurrent_participants', 'avg_session_duration',
            'total_messages', 'total_reactions',
            'sync_issues', 'buffering_events',
            'created_at', 'updated_at',
            'engagement_score'
        ]
        read_only_fields = ['id', 'party', 'created_at', 'updated_at']


class VideoAnalyticsSerializer(serializers.ModelSerializer):
    """Video analytics serializer"""
    
    popularity_score = serializers.ReadOnlyField()
    engagement_rate = serializers.ReadOnlyField()
    video_title = serializers.CharField(source='video.title', read_only=True)
    
    class Meta:
        model = VideoAnalytics
        fields = [
            'id', 'video', 'video_title',
            'total_views', 'unique_viewers', 'this_week_views', 'this_month_views',
            'total_watch_time_minutes', 'average_watch_duration', 'completion_rate',
            'total_parties_created', 'total_reactions', 'total_comments',
            'common_skip_start_seconds', 'common_skip_end_seconds',
            'most_rewatched_start_seconds', 'most_rewatched_end_seconds',
            'average_quality_selected', 'buffering_rate', 'loading_time_seconds',
            'average_rating', 'total_ratings', 'thumbs_up', 'thumbs_down',
            'popularity_score', 'engagement_rate',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'video', 'created_at', 'updated_at']


class AnalyticsEventSerializer(serializers.ModelSerializer):
    """Analytics event serializer"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    party_title = serializers.CharField(source='party.title', read_only=True)
    video_title = serializers.CharField(source='video.title', read_only=True)
    
    class Meta:
        model = AnalyticsEvent
        fields = [
            'id', 'user', 'user_name', 'party', 'party_title', 
            'video', 'video_title', 'event_type', 'event_data',
            'session_id', 'ip_address', 'user_agent',
            'timestamp', 'duration'
        ]
        read_only_fields = ['id', 'timestamp']


class SystemAnalyticsSerializer(serializers.ModelSerializer):
    """System analytics serializer"""
    
    class Meta:
        model = SystemAnalytics
        fields = [
            'id', 'date',
            'total_registered_users', 'active_users_today', 'new_users_today', 'premium_users',
            'total_videos', 'videos_uploaded_today', 'total_parties', 'parties_created_today',
            'total_watch_time_hours', 'total_chat_messages', 'total_reactions',
            'average_load_time_seconds', 'error_count', 'uptime_percentage',
            'total_storage_gb', 'bandwidth_used_gb',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AnalyticsSummarySerializer(serializers.Serializer):
    """Summary analytics serializer for dashboard widgets"""
    
    total_watch_time = serializers.IntegerField()
    total_parties = serializers.IntegerField()
    total_messages = serializers.IntegerField()
    total_users = serializers.IntegerField()
    growth_rate = serializers.FloatField()
    engagement_rate = serializers.FloatField()


class TrendingContentSerializer(serializers.Serializer):
    """Trending content serializer"""
    
    id = serializers.UUIDField()
    title = serializers.CharField()
    view_count = serializers.IntegerField()
    engagement_score = serializers.FloatField()
    trend_direction = serializers.CharField()  # 'up', 'down', 'stable'
    period = serializers.CharField()  # 'daily', 'weekly', 'monthly'


class UserEngagementSerializer(serializers.Serializer):
    """User engagement metrics serializer"""
    
    user_id = serializers.UUIDField()
    username = serializers.CharField()
    total_sessions = serializers.IntegerField()
    average_session_duration = serializers.FloatField()
    last_active = serializers.DateTimeField()
    engagement_score = serializers.FloatField()


class ContentPerformanceSerializer(serializers.Serializer):
    """Content performance metrics serializer"""
    
    content_id = serializers.UUIDField()
    content_type = serializers.CharField()  # 'video', 'party'
    title = serializers.CharField()
    views = serializers.IntegerField()
    engagement_rate = serializers.FloatField()
    completion_rate = serializers.FloatField()
    average_rating = serializers.FloatField()


class PlatformHealthSerializer(serializers.Serializer):
    """Platform health metrics serializer"""
    
    uptime_percentage = serializers.FloatField()
    average_response_time = serializers.FloatField()
    error_rate = serializers.FloatField()
    active_connections = serializers.IntegerField()
    server_load = serializers.FloatField()
    database_performance = serializers.FloatField()


class RealtimeMetricsSerializer(serializers.Serializer):
    """Real-time metrics serializer"""
    
    timestamp = serializers.DateTimeField()
    active_users = serializers.IntegerField()
    active_parties = serializers.IntegerField()
    messages_per_minute = serializers.IntegerField()
    bandwidth_usage = serializers.FloatField()
    server_status = serializers.CharField()


class AnalyticsExportSerializer(serializers.Serializer):
    """Analytics export configuration serializer"""
    
    export_type = serializers.ChoiceField(choices=['csv', 'json', 'excel'])
    date_range = serializers.IntegerField(min_value=1, max_value=365)
    metrics = serializers.ListField(child=serializers.CharField())
    filters = serializers.DictField(required=False)
    include_raw_events = serializers.BooleanField(default=False)


# Chart data serializers for frontend visualization
class ChartDataPointSerializer(serializers.Serializer):
    """Single data point for charts"""
    
    x = serializers.CharField()  # Usually date/time
    y = serializers.FloatField()  # Value
    label = serializers.CharField(required=False)
    color = serializers.CharField(required=False)


class TimeSeriesDataSerializer(serializers.Serializer):
    """Time series data for line charts"""
    
    series_name = serializers.CharField()
    data_points = ChartDataPointSerializer(many=True)
    color = serializers.CharField(required=False)
    chart_type = serializers.CharField(default='line')


class PieChartDataSerializer(serializers.Serializer):
    """Data for pie charts"""
    
    label = serializers.CharField()
    value = serializers.FloatField()
    percentage = serializers.FloatField()
    color = serializers.CharField(required=False)


class BarChartDataSerializer(serializers.Serializer):
    """Data for bar charts"""
    
    category = serializers.CharField()
    value = serializers.FloatField()
    label = serializers.CharField(required=False)
    color = serializers.CharField(required=False)


# Phase 2 Advanced Analytics Serializers

class RealTimeDashboardSerializer(serializers.Serializer):
    """Real-time dashboard data serializer"""
    
    overview = serializers.DictField()
    active_users = serializers.ListField()
    party_metrics = serializers.DictField()
    video_metrics = serializers.DictField()
    engagement_trends = serializers.DictField()
    geographical_data = serializers.ListField()
    device_breakdown = serializers.DictField()
    real_time_events = serializers.ListField()
    performance_metrics = serializers.DictField()
    time_range = serializers.CharField()
    generated_at = serializers.DateTimeField()


class AdvancedAnalyticsQuerySerializer(serializers.Serializer):
    """Advanced analytics query configuration serializer"""
    
    metric = serializers.ChoiceField(choices=[
        'user_engagement', 'party_performance', 'video_analytics',
        'revenue_analysis', 'retention_rates', 'feature_usage'
    ])
    time_range = serializers.DictField()
    filters = serializers.DictField(required=False)
    group_by = serializers.CharField(required=False)
    aggregation = serializers.ChoiceField(
        choices=['sum', 'avg', 'count', 'max', 'min'],
        default='count'
    )
    

class A_BTestResultSerializer(serializers.Serializer):
    """A/B test results serializer"""
    
    test_id = serializers.CharField()
    name = serializers.CharField()
    status = serializers.ChoiceField(choices=['running', 'completed', 'paused'])
    participants = serializers.IntegerField()
    variants = serializers.ListField()
    statistical_significance = serializers.BooleanField()
    winning_variant = serializers.CharField(required=False)
    improvement = serializers.FloatField(required=False)


class PredictiveAnalyticsSerializer(serializers.Serializer):
    """Predictive analytics results serializer"""
    
    prediction_type = serializers.CharField()
    confidence_score = serializers.FloatField()
    data = serializers.DictField()
    generated_at = serializers.DateTimeField()
    model_version = serializers.CharField(default='v1.0')


class UserChurnPredictionSerializer(serializers.Serializer):
    """User churn prediction serializer"""
    
    user_id = serializers.UUIDField()
    username = serializers.CharField()
    churn_probability = serializers.FloatField()
    risk_level = serializers.ChoiceField(choices=['low', 'medium', 'high'])
    key_factors = serializers.ListField()
    recommended_actions = serializers.ListField()


class ContentRecommendationSerializer(serializers.Serializer):
    """Content recommendation serializer"""
    
    content_type = serializers.CharField()
    recommended_categories = serializers.ListField()
    optimal_length = serializers.DictField()
    best_upload_times = serializers.ListField()
    seasonal_factors = serializers.DictField()


class GrowthForecastSerializer(serializers.Serializer):
    """Growth forecast serializer"""
    
    metric = serializers.CharField()
    current_value = serializers.FloatField()
    predicted_value = serializers.FloatField()
    growth_rate = serializers.FloatField()
    confidence_interval = serializers.ListField()
    forecast_period = serializers.CharField()


# Add to the end of the existing file

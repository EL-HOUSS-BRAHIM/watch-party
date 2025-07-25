"""
Content reporting serializers for Watch Party Backend
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import ContentReport, ReportAction

User = get_user_model()


class ContentReportSerializer(serializers.ModelSerializer):
    """Serializer for content reports"""
    
    reported_by_name = serializers.CharField(source='reported_by.full_name', read_only=True)
    reported_by_email = serializers.CharField(source='reported_by.email', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    report_type_display = serializers.CharField(source='get_report_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    
    class Meta:
        model = ContentReport
        fields = [
            'id', 'reported_by', 'reported_by_name', 'reported_by_email',
            'report_type', 'report_type_display',
            'content_type', 'content_type_display', 'content_id',
            'reported_video', 'reported_party', 'reported_user',
            'description', 'evidence_url',
            'status', 'status_display', 'priority', 'priority_display',
            'assigned_to', 'assigned_to_name',
            'resolution_notes', 'action_taken',
            'created_at', 'updated_at', 'resolved_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'resolved_at']
    
    def validate(self, data):
        """Validate that content_id matches the correct foreign key"""
        content_type = data.get('content_type')
        content_id = data.get('content_id')
        
        if content_type == 'video' and data.get('reported_video'):
            if str(data['reported_video'].id) != str(content_id):
                raise serializers.ValidationError("Content ID doesn't match reported video")
        elif content_type == 'party' and data.get('reported_party'):
            if str(data['reported_party'].id) != str(content_id):
                raise serializers.ValidationError("Content ID doesn't match reported party")
        elif content_type == 'user_profile' and data.get('reported_user'):
            if str(data['reported_user'].id) != str(content_id):
                raise serializers.ValidationError("Content ID doesn't match reported user")
        
        return data


class ContentReportCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating content reports"""
    
    class Meta:
        model = ContentReport
        fields = [
            'report_type', 'content_type', 'content_id',
            'reported_video', 'reported_party', 'reported_user',
            'description', 'evidence_url'
        ]
    
    def create(self, validated_data):
        """Create a new content report"""
        validated_data['reported_by'] = self.context['request'].user
        
        # Auto-assign priority based on report type
        priority_mapping = {
            'harassment': 'high',
            'hate_speech': 'critical',
            'violence': 'critical',
            'copyright': 'medium',
            'spam': 'low',
            'inappropriate': 'medium',
            'misinformation': 'medium',
            'other': 'low',
        }
        
        validated_data['priority'] = priority_mapping.get(
            validated_data['report_type'], 'medium'
        )
        
        return super().create(validated_data)


class ReportActionSerializer(serializers.ModelSerializer):
    """Serializer for report actions"""
    
    moderator_name = serializers.CharField(source='moderator.full_name', read_only=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    
    class Meta:
        model = ReportAction
        fields = [
            'id', 'report', 'action_type', 'action_type_display',
            'moderator', 'moderator_name', 'description',
            'duration_days', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReportResolutionSerializer(serializers.Serializer):
    """Serializer for resolving content reports"""
    
    action_type = serializers.ChoiceField(choices=ReportAction.ACTION_TYPES)
    description = serializers.CharField(max_length=1000)
    duration_days = serializers.IntegerField(required=False, min_value=1, max_value=365)
    resolution_notes = serializers.CharField(max_length=1000, required=False)
    
    def validate(self, data):
        """Validate that duration_days is provided for temporary actions"""
        action_type = data.get('action_type')
        duration_days = data.get('duration_days')
        
        if action_type == 'user_suspended' and not duration_days:
            raise serializers.ValidationError(
                "duration_days is required for user suspension"
            )
        
        return data


class ContentReportStatsSerializer(serializers.Serializer):
    """Serializer for content report statistics"""
    
    total_reports = serializers.IntegerField()
    pending_reports = serializers.IntegerField()
    resolved_reports = serializers.IntegerField()
    dismissed_reports = serializers.IntegerField()
    high_priority_reports = serializers.IntegerField()
    reports_by_type = serializers.DictField()
    reports_by_content_type = serializers.DictField()
    average_resolution_time = serializers.FloatField()


class ModerationQueueSerializer(serializers.ModelSerializer):
    """Serializer for moderation queue display"""
    
    reported_by_username = serializers.CharField(source='reported_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    content_title = serializers.SerializerMethodField()
    content_url = serializers.SerializerMethodField()
    age_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = ContentReport
        fields = [
            'id', 'report_type', 'content_type', 'status', 'priority',
            'description', 'reported_by_username', 'assigned_to_username',
            'content_title', 'content_url', 'age_hours', 'created_at'
        ]
    
    def get_content_title(self, obj):
        """Get title/name of the reported content"""
        if obj.reported_video:
            return obj.reported_video.title
        elif obj.reported_party:
            return obj.reported_party.title
        elif obj.reported_user:
            return f"User: {obj.reported_user.username}"
        return "Unknown Content"
    
    def get_content_url(self, obj):
        """Get URL of the reported content"""
        if obj.reported_video:
            return f"/videos/{obj.reported_video.id}"
        elif obj.reported_party:
            return f"/parties/{obj.reported_party.id}"
        elif obj.reported_user:
            return f"/users/{obj.reported_user.id}"
        return None
    
    def get_age_hours(self, obj):
        """Get age of report in hours"""
        from django.utils import timezone
        age = timezone.now() - obj.created_at
        return round(age.total_seconds() / 3600, 1)

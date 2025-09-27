"""
Support System Serializers for Watch Party Backend
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes
from .models import (
    FAQCategory, FAQ, SupportTicket, SupportTicketMessage, 
    UserFeedback, FeedbackVote
)


class FAQSerializer(serializers.ModelSerializer):
    """FAQ serializer"""
    
    category_name = serializers.CharField(source='category.name', read_only=True)
    helpfulness_ratio = serializers.ReadOnlyField()
    
    class Meta:
        model = FAQ
        fields = [
            'id', 'question', 'answer', 'category_name', 'keywords',
            'is_featured', 'view_count', 'helpful_votes', 'unhelpful_votes',
            'helpfulness_ratio', 'created_at', 'updated_at'
        ]


class FAQCategorySerializer(serializers.ModelSerializer):
    """FAQ Category serializer"""
    
    faqs = FAQSerializer(many=True, read_only=True)
    faq_count = serializers.SerializerMethodField()
    
    class Meta:
        model = FAQCategory
        fields = [
            'name', 'slug', 'description', 'icon', 'order',
            'faq_count', 'faqs'
        ]
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_faq_count(self, obj):
        return obj.faqs.filter(is_active=True).count()


class SupportTicketMessageSerializer(serializers.ModelSerializer):
    """Support Ticket Message serializer"""
    
    author_name = serializers.CharField(source='author.full_name', read_only=True)
    
    class Meta:
        model = SupportTicketMessage
        fields = [
            'id', 'message', 'author_name', 'is_internal',
            'attachment_url', 'attachment_name', 'created_at'
        ]


class SupportTicketSerializer(serializers.ModelSerializer):
    """Support Ticket serializer"""
    
    messages = SupportTicketMessageSerializer(many=True, read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.full_name', read_only=True)
    
    class Meta:
        model = SupportTicket
        fields = [
            'id', 'ticket_number', 'subject', 'description', 'category',
            'priority', 'status', 'user_name', 'assigned_to_name',
            'resolution_notes', 'messages', 'created_at', 'updated_at',
            'resolved_at', 'closed_at'
        ]
        read_only_fields = ['ticket_number', 'user_name', 'assigned_to_name']


class UserFeedbackSerializer(serializers.ModelSerializer):
    """User Feedback serializer"""
    
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    vote_score = serializers.ReadOnlyField()
    user_vote = serializers.SerializerMethodField()
    
    class Meta:
        model = UserFeedback
        fields = [
            'id', 'title', 'description', 'feedback_type', 'status',
            'upvotes', 'downvotes', 'vote_score', 'user_vote',
            'admin_response', 'user_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['upvotes', 'downvotes', 'user_name']
    
    @extend_schema_field(OpenApiTypes.STR)

    
    def get_user_vote(self, obj):
        """Get current user's vote on this feedback"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = FeedbackVote.objects.filter(
                feedback=obj, 
                user=request.user
            ).first()
            return vote.vote if vote else None
        return None

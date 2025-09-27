"""
Enhanced Party Views for Watch Party Backend
"""

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Count, F
from django.shortcuts import get_object_or_404
from datetime import timedelta

from shared.responses import StandardResponse
from .models import WatchParty, PartyEngagementAnalytics, PartyParticipant
from .serializers import WatchPartySerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_party_invite_code(request, party_id):
    """Generate or regenerate invite code for party"""
    try:
        party = get_object_or_404(WatchParty, id=party_id)
        
        # Check if user is host or moderator
        if party.host != request.user:
            participant = party.participants.filter(
                user=request.user, 
                role__in=['host', 'moderator']
            ).first()
            if not participant:
                return StandardResponse.error(
                    "Only party host or moderators can generate invite codes",
                    status_code=status.HTTP_403_FORBIDDEN
                )
        
        # Generate new invite code
        party.invite_code = party.generate_invite_code()
        
        # Set expiry based on request data
        expiry_hours = request.data.get('expiry_hours', 24)
        party.invite_code_expires_at = timezone.now() + timedelta(hours=expiry_hours)
        
        party.save()
        
        return StandardResponse.success({
            'invite_code': party.invite_code,
            'expires_at': party.invite_code_expires_at,
            'invite_url': f"/invite/party/{party.invite_code}"
        }, "Invite code generated successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error generating invite code: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def join_by_invite_code(request):
    """Join party using invite code"""
    try:
        invite_code = request.data.get('invite_code')
        if not invite_code:
            return StandardResponse.validation_error({'invite_code': ['Invite code is required']})
        
        party = get_object_or_404(WatchParty, invite_code=invite_code)
        
        # Check if invite code is valid
        if not party.is_invite_code_valid:
            return StandardResponse.error(
                "Invite code has expired",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if party is joinable
        if party.status in ['ended', 'cancelled']:
            return StandardResponse.error(
                "This party has ended or been cancelled",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        if party.is_full:
            return StandardResponse.error(
                "Party is full",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user is already a participant
        existing_participant = party.participants.filter(user=request.user).first()
        if existing_participant:
            if existing_participant.status == 'approved' and existing_participant.is_active:
                return StandardResponse.error(
                    "You are already in this party",
                    status_code=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Reactivate if previously left
                existing_participant.status = 'approved'
                existing_participant.is_active = True
                existing_participant.joined_at = timezone.now()
                existing_participant.save()
        else:
            # Create new participant
            status_choice = 'pending' if party.require_approval else 'approved'
            PartyParticipant.objects.create(
                party=party,
                user=request.user,
                status=status_choice
            )
        
        # Update analytics
        analytics, created = PartyEngagementAnalytics.objects.get_or_create(party=party)
        party.total_viewers = F('total_viewers') + 1
        party.save(update_fields=['total_viewers'])
        
        serializer = WatchPartySerializer(party, context={'request': request})
        return StandardResponse.success(
            serializer.data, 
            "Successfully joined party" if not party.require_approval else "Join request sent for approval"
        )
        
    except Exception as e:
        return StandardResponse.error(f"Error joining party: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def party_analytics(request, party_id):
    """Get detailed analytics for party (host only)"""
    try:
        party = get_object_or_404(WatchParty, id=party_id)
        
        # Check if user is host
        if party.host != request.user:
            return StandardResponse.error(
                "Only party host can view analytics",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        analytics, created = PartyEngagementAnalytics.objects.get_or_create(party=party)
        
        # Calculate real-time metrics
        participants = party.participants.filter(status='approved')
        
        # Participant metrics
        participant_data = {
            'total_participants': participants.count(),
            'active_participants': participants.filter(is_active=True).count(),
            'pending_approval': party.participants.filter(status='pending').count(),
            'peak_concurrent': party.peak_concurrent_viewers,
        }
        
        # Engagement metrics
        engagement_data = {
            'total_reactions': party.total_reactions,
            'total_chat_messages': party.total_chat_messages,
            'average_watch_time': analytics.average_watch_time,
            'engagement_score': analytics.engagement_score,
            'bounce_rate': analytics.bounce_rate,
        }
        
        # Content performance
        content_data = {
            'most_rewound_timestamp': analytics.most_rewound_timestamp,
            'most_paused_timestamp': analytics.most_paused_timestamp,
            'reaction_hotspots': analytics.reaction_hotspots,
        }
        
        # Social metrics
        social_data = {
            'chat_activity_score': analytics.chat_activity_score,
            'user_retention_rate': analytics.user_retention_rate,
            'invitation_conversion_rate': analytics.invitation_conversion_rate,
        }
        
        return StandardResponse.success({
            'party_id': str(party.id),
            'party_title': party.title,
            'participants': participant_data,
            'engagement': engagement_data,
            'content_performance': content_data,
            'social_metrics': social_data,
            'analytics_updated_at': analytics.updated_at,
        }, "Analytics retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def trending_parties(request):
    """Get trending public parties based on activity"""
    try:
        # Get public parties with high activity in last 24 hours
        cutoff_time = timezone.now() - timedelta(hours=24)
        
        trending = WatchParty.objects.filter(
            visibility='public',
            status__in=['live', 'scheduled'],
            allow_public_search=True,
            created_at__gte=cutoff_time
        ).annotate(
            activity_score=F('total_reactions') + F('total_chat_messages') + F('total_viewers')
        ).order_by('-activity_score', '-peak_concurrent_viewers')[:20]
        
        serializer = WatchPartySerializer(trending, many=True, context={'request': request})
        
        return StandardResponse.success({
            'trending_parties': serializer.data,
            'generated_at': timezone.now(),
        }, "Trending parties retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error retrieving trending parties: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_party_analytics(request, party_id):
    """Update party analytics (for real-time tracking)"""
    try:
        party = get_object_or_404(WatchParty, id=party_id)
        
        # Verify user is participant
        participant = party.participants.filter(
            user=request.user, 
            status='approved',
            is_active=True
        ).first()
        
        if not participant:
            return StandardResponse.error(
                "You must be an active participant to update analytics",
                status_code=status.HTTP_403_FORBIDDEN
            )
        
        analytics, created = PartyEngagementAnalytics.objects.get_or_create(party=party)
        
        # Update current concurrent viewers
        current_active = party.participants.filter(
            is_active=True,
            last_seen__gte=timezone.now() - timedelta(minutes=5)
        ).count()
        
        if current_active > party.peak_concurrent_viewers:
            party.peak_concurrent_viewers = current_active
            party.save(update_fields=['peak_concurrent_viewers'])
        
        # Update participant's last seen
        participant.last_seen = timezone.now()
        participant.save(update_fields=['last_seen'])
        
        return StandardResponse.success({
            'current_active_participants': current_active,
            'peak_concurrent': party.peak_concurrent_viewers,
        }, "Analytics updated successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error updating analytics: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def party_recommendations(request):
    """Get personalized party recommendations for user"""
    try:
        user = request.user
        
        # Get user's party history for recommendations
        user_parties = WatchParty.objects.filter(
            participants__user=user,
            participants__status='approved'
        ).values_list('id', flat=True)
        
        # Get parties from users who attended same parties (collaborative filtering)
        similar_users = PartyParticipant.objects.filter(
            party_id__in=user_parties,
            status='approved'
        ).exclude(user=user).values_list('user_id', flat=True)
        
        recommended_parties = WatchParty.objects.filter(
            participants__user_id__in=similar_users,
            visibility='public',
            status__in=['live', 'scheduled'],
            allow_public_search=True
        ).exclude(
            id__in=user_parties
        ).annotate(
            recommendation_score=Count('participants')
        ).order_by('-recommendation_score')[:10]
        
        serializer = WatchPartySerializer(recommended_parties, many=True, context={'request': request})
        
        return StandardResponse.success({
            'recommended_parties': serializer.data,
            'recommendation_basis': 'collaborative_filtering',
        }, "Party recommendations retrieved successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Error getting recommendations: {str(e)}")

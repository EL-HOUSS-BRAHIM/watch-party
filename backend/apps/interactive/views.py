import logging
from datetime import timedelta
from typing import Dict, List

from django.contrib.auth import get_user_model
from django.db.models import Count, Avg, Q
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .models import (
    LiveReaction, VoiceChatRoom, VoiceChatParticipant, ScreenShare,
    InteractivePoll, PollResponse, InteractiveAnnotation, InteractiveSession
)
from .serializers import (
    LiveReactionSerializer, VoiceChatRoomSerializer, VoiceChatParticipantSerializer,
    ScreenShareSerializer, InteractivePollSerializer, PollResponseSerializer,
    InteractiveAnnotationSerializer, InteractiveSessionSerializer
)

User = get_user_model()
logger = logging.getLogger(__name__)


# ============================================================================
# LIVE REACTIONS API
# ============================================================================

@extend_schema(
    summary="Get live reactions for a party",
    description="Retrieve recent live reactions for a specific party",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH),
        OpenApiParameter('since', OpenApiTypes.DATETIME, description="Get reactions since this timestamp"),
        OpenApiParameter('video_timestamp', OpenApiTypes.FLOAT, description="Get reactions around this video time"),
    ],
    responses={
        200: OpenApiResponse(description="Live reactions retrieved successfully"),
        404: OpenApiResponse(description="Party not found")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_live_reactions(request, party_id):
    """Get live reactions for a party"""
    try:
        # Base query
        reactions = LiveReaction.objects.filter(
            party_id=party_id,
            is_active=True
        ).select_related('user')
        
        # Filter by timestamp if provided
        since = request.GET.get('since')
        if since:
            reactions = reactions.filter(created_at__gte=since)
        
        # Filter by video timestamp if provided
        video_timestamp = request.GET.get('video_timestamp')
        if video_timestamp:
            video_time = float(video_timestamp)
            # Get reactions within 30 seconds of the video timestamp
            reactions = reactions.filter(
                video_timestamp__gte=video_time - 15,
                video_timestamp__lte=video_time + 15
            )
        
        # Limit to recent reactions (last hour by default)
        if not since:
            one_hour_ago = timezone.now() - timedelta(hours=1)
            reactions = reactions.filter(created_at__gte=one_hour_ago)
        
        reactions = reactions.order_by('-created_at')[:100]
        
        serializer = LiveReactionSerializer(reactions, many=True)
        return Response({
            'reactions': serializer.data,
            'total_count': reactions.count()
        })
        
    except Exception as e:
        logger.error(f"Error getting live reactions: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Create live reaction",
    description="Create a new live reaction on video",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH)
    ],
    request=LiveReactionSerializer,
    responses={
        201: OpenApiResponse(description="Reaction created successfully"),
        400: OpenApiResponse(description="Invalid reaction data")
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_live_reaction(request, party_id):
    """Create a new live reaction"""
    try:
        from apps.parties.models import WatchParty
        
        party = WatchParty.objects.get(id=party_id)
        
        # Check if user is in the party
        if not party.participants.filter(user=request.user).exists():
            return Response(
                {'error': 'You are not a member of this party'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = LiveReactionSerializer(data=request.data)
        if serializer.is_valid():
            reaction = serializer.save(
                party=party,
                user=request.user
            )
            
            return Response(
                LiveReactionSerializer(reaction).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except WatchParty.DoesNotExist:
        return Response(
            {'error': 'Party not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error creating live reaction: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# VOICE CHAT API
# ============================================================================

@extend_schema(
    summary="Get voice chat room info",
    description="Get voice chat room information and participants",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH)
    ],
    responses={
        200: OpenApiResponse(description="Voice chat info retrieved"),
        404: OpenApiResponse(description="Voice chat room not found")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_voice_chat_room(request, party_id):
    """Get voice chat room information"""
    try:
        room = VoiceChatRoom.objects.get(party_id=party_id)
        
        # Get active participants
        participants = VoiceChatParticipant.objects.filter(
            room=room,
            is_connected=True
        ).select_related('user')
        
        return Response({
            'room': VoiceChatRoomSerializer(room).data,
            'participants': VoiceChatParticipantSerializer(participants, many=True).data,
            'participant_count': participants.count()
        })
        
    except VoiceChatRoom.DoesNotExist:
        return Response(
            {'error': 'Voice chat room not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting voice chat room: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Create or update voice chat room",
    description="Create or update voice chat room settings",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH)
    ],
    request=VoiceChatRoomSerializer,
    responses={
        200: OpenApiResponse(description="Voice chat room updated"),
        201: OpenApiResponse(description="Voice chat room created")
    }
)
@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def manage_voice_chat_room(request, party_id):
    """Create or update voice chat room"""
    try:
        from apps.parties.models import WatchParty
        
        party = WatchParty.objects.get(id=party_id)
        
        # Check if user is party host
        if party.host != request.user:
            return Response(
                {'error': 'Only party host can manage voice chat'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        room, created = VoiceChatRoom.objects.get_or_create(
            party=party,
            defaults={
                'max_participants': request.data.get('max_participants', 50),
                'require_permission': request.data.get('require_permission', False),
                'audio_quality': request.data.get('audio_quality', 'medium'),
                'noise_cancellation': request.data.get('noise_cancellation', True),
                'echo_cancellation': request.data.get('echo_cancellation', True),
                'ice_servers': request.data.get('ice_servers', [])
            }
        )
        
        if not created:
            # Update existing room
            for field in ['max_participants', 'require_permission', 'audio_quality', 
                         'noise_cancellation', 'echo_cancellation', 'ice_servers']:
                if field in request.data:
                    setattr(room, field, request.data[field])
            room.save()
        
        return Response(
            VoiceChatRoomSerializer(room).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )
        
    except WatchParty.DoesNotExist:
        return Response(
            {'error': 'Party not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error managing voice chat room: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# SCREEN SHARING API
# ============================================================================

@extend_schema(
    summary="Get active screen shares",
    description="Get currently active screen sharing sessions for a party",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH)
    ],
    responses={
        200: OpenApiResponse(description="Screen shares retrieved"),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_active_screen_shares(request, party_id):
    """Get active screen sharing sessions"""
    try:
        screen_shares = ScreenShare.objects.filter(
            party_id=party_id,
            is_active=True
        ).select_related('user')
        
        return Response({
            'screen_shares': ScreenShareSerializer(screen_shares, many=True).data,
            'total_count': screen_shares.count()
        })
        
    except Exception as e:
        logger.error(f"Error getting screen shares: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Update screen share",
    description="Update screen sharing session settings",
    parameters=[
        OpenApiParameter('share_id', OpenApiTypes.UUID, OpenApiParameter.PATH)
    ],
    request=ScreenShareSerializer,
    responses={
        200: OpenApiResponse(description="Screen share updated"),
        404: OpenApiResponse(description="Screen share not found")
    }
)
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_screen_share(request, share_id):
    """Update screen sharing session"""
    try:
        screen_share = ScreenShare.objects.get(
            share_id=share_id,
            user=request.user,
            is_active=True
        )
        
        # Update allowed fields
        for field in ['viewers_can_annotate', 'allow_remote_control', 'is_recording']:
            if field in request.data:
                setattr(screen_share, field, request.data[field])
        
        screen_share.save()
        
        return Response(ScreenShareSerializer(screen_share).data)
        
    except ScreenShare.DoesNotExist:
        return Response(
            {'error': 'Screen share not found or you do not have permission'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error updating screen share: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# INTERACTIVE POLLS API
# ============================================================================

@extend_schema(
    summary="Get party polls",
    description="Get interactive polls for a party",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH),
        OpenApiParameter('active_only', OpenApiTypes.BOOL, description="Get only active polls")
    ],
    responses={
        200: OpenApiResponse(description="Polls retrieved successfully")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_party_polls(request, party_id):
    """Get interactive polls for a party"""
    try:
        polls = InteractivePoll.objects.filter(party_id=party_id)
        
        if request.GET.get('active_only', 'false').lower() == 'true':
            polls = polls.filter(
                is_published=True,
                expires_at__gt=timezone.now()
            )
        
        polls = polls.order_by('-created_at')
        
        # Include response counts and user's response
        poll_data = []
        for poll in polls:
            poll_serializer = InteractivePollSerializer(poll)
            data = poll_serializer.data
            
            # Add response statistics
            if poll.show_results_live or poll.is_expired():
                responses = poll.responses.all()
                if poll.poll_type == 'multiple_choice':
                    option_counts = {}
                    for i, option in enumerate(poll.options):
                        count = responses.filter(selected_option=i).count()
                        option_counts[str(i)] = count
                    data['response_counts'] = option_counts
                elif poll.poll_type == 'rating':
                    avg_rating = responses.aggregate(avg=Avg('rating_value'))['avg']
                    data['average_rating'] = avg_rating
                
                data['total_responses'] = responses.count()
            
            # Add user's response if exists
            user_response = responses.filter(user=request.user).first()
            if user_response:
                data['user_response'] = PollResponseSerializer(user_response).data
            
            poll_data.append(data)
        
        return Response({
            'polls': poll_data,
            'total_count': len(poll_data)
        })
        
    except Exception as e:
        logger.error(f"Error getting party polls: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Create interactive poll",
    description="Create a new interactive poll for a party",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH)
    ],
    request=InteractivePollSerializer,
    responses={
        201: OpenApiResponse(description="Poll created successfully"),
        400: OpenApiResponse(description="Invalid poll data")
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_poll(request, party_id):
    """Create a new interactive poll"""
    try:
        from apps.parties.models import WatchParty
        
        party = WatchParty.objects.get(id=party_id)
        
        # Check if user is party host or has permission
        if party.host != request.user:
            return Response(
                {'error': 'Only party host can create polls'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = InteractivePollSerializer(data=request.data)
        if serializer.is_valid():
            poll = serializer.save(
                party=party,
                creator=request.user
            )
            
            # Auto-publish if requested
            if request.data.get('publish_immediately', False):
                poll.publish()
            
            return Response(
                InteractivePollSerializer(poll).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except WatchParty.DoesNotExist:
        return Response(
            {'error': 'Party not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error creating poll: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Publish poll",
    description="Publish an interactive poll to make it active",
    parameters=[
        OpenApiParameter('poll_id', OpenApiTypes.UUID, OpenApiParameter.PATH)
    ],
    responses={
        200: OpenApiResponse(description="Poll published successfully"),
        404: OpenApiResponse(description="Poll not found")
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def publish_poll(request, poll_id):
    """Publish an interactive poll"""
    try:
        poll = InteractivePoll.objects.get(
            poll_id=poll_id,
            creator=request.user
        )
        
        if poll.is_published:
            return Response(
                {'error': 'Poll is already published'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        poll.publish()
        
        return Response({
            'message': 'Poll published successfully',
            'poll': InteractivePollSerializer(poll).data
        })
        
    except InteractivePoll.DoesNotExist:
        return Response(
            {'error': 'Poll not found or you do not have permission'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error publishing poll: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Submit poll response",
    description="Submit response to an interactive poll",
    parameters=[
        OpenApiParameter('poll_id', OpenApiTypes.UUID, OpenApiParameter.PATH)
    ],
    request=PollResponseSerializer,
    responses={
        201: OpenApiResponse(description="Response submitted successfully"),
        400: OpenApiResponse(description="Invalid response or poll expired")
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_poll_response(request, poll_id):
    """Submit response to interactive poll"""
    try:
        poll = InteractivePoll.objects.get(
            poll_id=poll_id,
            is_published=True
        )
        
        if poll.is_expired():
            return Response(
                {'error': 'Poll has expired'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if user already responded
        existing_response = PollResponse.objects.filter(
            poll=poll,
            user=request.user
        ).first()
        
        if existing_response:
            return Response(
                {'error': 'You have already responded to this poll'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PollResponseSerializer(data=request.data)
        if serializer.is_valid():
            response = serializer.save(
                poll=poll,
                user=request.user
            )
            
            # Update poll total responses
            poll.total_responses += 1
            poll.save()
            
            return Response(
                PollResponseSerializer(response).data,
                status=status.HTTP_201_CREATED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except InteractivePoll.DoesNotExist:
        return Response(
            {'error': 'Poll not found or not published'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error submitting poll response: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# ANNOTATIONS API (for screen sharing)
# ============================================================================

@extend_schema(
    summary="Get screen share annotations",
    description="Get annotations for a screen sharing session",
    parameters=[
        OpenApiParameter('share_id', OpenApiTypes.UUID, OpenApiParameter.PATH)
    ],
    responses={
        200: OpenApiResponse(description="Annotations retrieved successfully")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_screen_annotations(request, share_id):
    """Get annotations for screen share"""
    try:
        annotations = InteractiveAnnotation.objects.filter(
            screen_share__share_id=share_id,
            is_visible=True,
            expires_at__gt=timezone.now()
        ).select_related('user')
        
        return Response({
            'annotations': InteractiveAnnotationSerializer(annotations, many=True).data,
            'total_count': annotations.count()
        })
        
    except Exception as e:
        logger.error(f"Error getting screen annotations: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# ANALYTICS AND STATISTICS
# ============================================================================

@extend_schema(
    summary="Get interactive features analytics",
    description="Get analytics for interactive features usage in a party",
    parameters=[
        OpenApiParameter('party_id', OpenApiTypes.INT, OpenApiParameter.PATH)
    ],
    responses={
        200: OpenApiResponse(description="Analytics retrieved successfully")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_interactive_analytics(request, party_id):
    """Get interactive features analytics"""
    try:
        from apps.parties.models import WatchParty
        
        party = WatchParty.objects.get(id=party_id)
        
        # Check permissions
        if party.host != request.user and not request.user.is_staff:
            return Response(
                {'error': 'Permission denied'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Gather statistics
        analytics = {
            'party_id': party_id,
            'party_name': party.name,
            'generated_at': timezone.now(),
            
            # Live Reactions Stats
            'live_reactions': {
                'total_reactions': LiveReaction.objects.filter(party_id=party_id).count(),
                'unique_reactors': LiveReaction.objects.filter(party_id=party_id).values('user').distinct().count(),
                'most_popular_reactions': list(
                    LiveReaction.objects.filter(party_id=party_id)
                    .values('reaction')
                    .annotate(count=Count('id'))
                    .order_by('-count')[:5]
                )
            },
            
            # Voice Chat Stats
            'voice_chat': {
                'total_participants': VoiceChatParticipant.objects.filter(room__party_id=party_id).count(),
                'active_participants': VoiceChatParticipant.objects.filter(
                    room__party_id=party_id, is_connected=True
                ).count(),
                'average_session_duration': VoiceChatParticipant.objects.filter(
                    room__party_id=party_id, left_at__isnull=False
                ).aggregate(
                    avg_duration=Avg(
                        timezone.now() - timezone.F('joined_at')
                    )
                )['avg_duration']
            },
            
            # Screen Sharing Stats
            'screen_sharing': {
                'total_sessions': ScreenShare.objects.filter(party_id=party_id).count(),
                'active_sessions': ScreenShare.objects.filter(party_id=party_id, is_active=True).count(),
                'total_viewers': ScreenShare.objects.filter(party_id=party_id).aggregate(
                    total=Count('viewer_count')
                )['total'] or 0
            },
            
            # Polls Stats
            'polls': {
                'total_polls': InteractivePoll.objects.filter(party_id=party_id).count(),
                'active_polls': InteractivePoll.objects.filter(
                    party_id=party_id, 
                    is_published=True,
                    expires_at__gt=timezone.now()
                ).count(),
                'total_responses': PollResponse.objects.filter(poll__party_id=party_id).count(),
                'average_response_rate': InteractivePoll.objects.filter(party_id=party_id).aggregate(
                    avg_responses=Avg('total_responses')
                )['avg_responses'] or 0
            },
            
            # Overall Engagement
            'engagement': {
                'total_interactive_sessions': InteractiveSession.objects.filter(party_id=party_id).count(),
                'average_reactions_per_user': InteractiveSession.objects.filter(party_id=party_id).aggregate(
                    avg=Avg('reactions_sent')
                )['avg'] or 0,
                'average_polls_per_user': InteractiveSession.objects.filter(party_id=party_id).aggregate(
                    avg=Avg('polls_participated')
                )['avg'] or 0
            }
        }
        
        return Response(analytics)
        
    except WatchParty.DoesNotExist:
        return Response(
            {'error': 'Party not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error getting interactive analytics: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

"""
Party views for Watch Party Backend
"""

from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, F, Count
from django.shortcuts import get_object_or_404
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from django_filters.rest_framework import DjangoFilterBackend

from .models import WatchParty, PartyParticipant, PartyReaction, PartyInvitation, PartyReport
from apps.chat.models import ChatMessage
from .serializers import (
    WatchPartySerializer, WatchPartyDetailSerializer, WatchPartyCreateSerializer,
    WatchPartyUpdateSerializer, ChatMessageSerializer, PartyReactionSerializer,
    PartyInvitationSerializer, PartyInvitationCreateSerializer, PartyJoinSerializer,
    VideoControlSerializer, PartyReportSerializer, PartySearchSerializer,
    PartyParticipantSerializer
)
from utils.permissions import IsHostOrReadOnly


class WatchPartyViewSet(ModelViewSet):
    """Watch Party CRUD operations"""
    
    queryset = WatchParty.objects.all()
    serializer_class = WatchPartySerializer
    permission_classes = [permissions.IsAuthenticated, IsHostOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'visibility', 'host']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'scheduled_start']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return WatchPartyDetailSerializer
        elif self.action == 'create':
            return WatchPartyCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return WatchPartyUpdateSerializer
        return WatchPartySerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        # Get user's friends
        from apps.users.models import Friendship
        friend_ids = Friendship.objects.filter(
            Q(from_user=user, status='accepted') | Q(to_user=user, status='accepted')
        ).values_list(
            'to_user', 'from_user'
        )
        
        # Extract friend user IDs
        friend_user_ids = set()
        for from_id, to_id in friend_ids:
            if from_id == user.id:
                friend_user_ids.add(to_id)
            else:
                friend_user_ids.add(from_id)
        
        # Filter based on visibility and user relationships
        return queryset.filter(
            Q(visibility='public') |
            Q(host=user) |
            Q(participants__user=user, participants__is_active=True) |
            Q(visibility='friends', host__id__in=friend_user_ids)
        ).distinct()
    
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Join a watch party"""
        party = self.get_object()
        user = request.user
        
        # Check if user can join
        if party.is_full:
            return Response({'error': 'Party is full'}, status=status.HTTP_400_BAD_REQUEST)
        
        if party.status not in ['scheduled', 'live', 'paused']:
            return Response({'error': 'Party is not available to join'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if already a participant
        participant, created = PartyParticipant.objects.get_or_create(
            party=party,
            user=user,
            defaults={'is_active': True}
        )
        
        if not created:
            if participant.is_active:
                return Response({'error': 'Already joined this party'}, status=status.HTTP_400_BAD_REQUEST)
            else:
                participant.is_active = True
                participant.status = 'pending' if party.require_approval else 'approved'
                participant.save()
        
        # Set status based on party settings
        if party.require_approval and user != party.host:
            participant.status = 'pending'
            participant.save()
            return Response({'message': 'Join request sent for approval'})
        
        return Response({'message': 'Successfully joined party'})
    
    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Leave a watch party"""
        party = self.get_object()
        user = request.user
        
        try:
            participant = PartyParticipant.objects.get(party=party, user=user, is_active=True)
            participant.is_active = False
            participant.status = 'left'
            participant.left_at = timezone.now()
            participant.save()
            
            return Response({'message': 'Successfully left party'})
        
        except PartyParticipant.DoesNotExist:
            return Response({'error': 'Not a participant of this party'}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def start(self, request, pk=None):
        """Start the watch party (host only)"""
        party = self.get_object()
        
        if party.host != request.user:
            return Response({'error': 'Only host can start the party'}, status=status.HTTP_403_FORBIDDEN)
        
        if party.status != 'scheduled':
            return Response({'error': 'Party cannot be started'}, status=status.HTTP_400_BAD_REQUEST)
        
        party.status = 'live'
        party.started_at = timezone.now()
        party.is_playing = True
        party.save()
        
        # TODO: Send WebSocket notification to all participants
        
        return Response({'message': 'Party started successfully'})
    
    @action(detail=True, methods=['post'])
    def control(self, request, pk=None):
        """Control video playback (host and moderators only)"""
        party = self.get_object()
        user = request.user
        
        # Check if user can control
        if party.host != user:
            participant = party.participants.filter(user=user, is_active=True).first()
            if not participant or participant.role not in ['host', 'moderator']:
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = VideoControlSerializer(data=request.data)
        if serializer.is_valid():
            action = serializer.validated_data['action']
            timestamp = serializer.validated_data.get('timestamp')
            
            if action == 'play':
                party.is_playing = True
            elif action == 'pause':
                party.is_playing = False
            elif action == 'seek':
                party.current_timestamp = timestamp
            
            party.last_sync_at = timezone.now()
            party.save()
            
            # TODO: Send WebSocket notification to all participants
            
            return Response({'message': f'Video {action} successful'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def chat(self, request, pk=None):
        """Get chat messages or send a new message"""
        party = self.get_object()
        user = request.user
        
        # Check if user is participant
        if not party.participants.filter(user=user, is_active=True).exists() and party.host != user:
            return Response({'error': 'Must be a participant to access chat'}, status=status.HTTP_403_FORBIDDEN)
        
        if not party.allow_chat:
            return Response({'error': 'Chat is disabled for this party'}, status=status.HTTP_403_FORBIDDEN)
        
        if request.method == 'GET':
            # Get recent messages (last 50)
            if hasattr(party, 'chat_room'):
                messages = party.chat_room.messages.filter(moderation_status='active').order_by('-created_at')[:50]
                messages = reversed(messages)  # Reverse to show oldest first
                serializer = ChatMessageSerializer(messages, many=True, context={'request': request})
                return Response(serializer.data)
            else:
                return Response([])  # No chat room yet
        
        else:  # POST
            serializer = ChatMessageSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                # Get or create chat room for the party
                from apps.chat.models import ChatRoom
                chat_room, created = ChatRoom.objects.get_or_create(
                    party=party,
                    defaults={
                        'name': f"Chat for {party.title}",
                        'max_users': party.max_participants
                    }
                )
                
                message = serializer.save(room=chat_room, user=user)
                
                # TODO: Send WebSocket notification to all participants
                
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def react(self, request, pk=None):
        """Add a reaction to the party"""
        party = self.get_object()
        user = request.user
        
        # Check if user is participant
        if not party.participants.filter(user=user, is_active=True).exists() and party.host != user:
            return Response({'error': 'Must be a participant to react'}, status=status.HTTP_403_FORBIDDEN)
        
        if not party.allow_reactions:
            return Response({'error': 'Reactions are disabled for this party'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PartyReactionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            reaction = serializer.save(party=party, user=user)
            
            # TODO: Send WebSocket notification to all participants
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def participants(self, request, pk=None):
        """Get party participants"""
        party = self.get_object()
        participants = party.participants.filter(is_active=True)
        serializer = PartyParticipantSerializer(participants, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def invite(self, request, pk=None):
        """Invite users to the party"""
        party = self.get_object()
        user = request.user
        
        # Only host can invite
        if party.host != user:
            return Response({'error': 'Only host can send invitations'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = PartyInvitationCreateSerializer(data=request.data)
        if serializer.is_valid():
            invitee_id = serializer.validated_data['invitee_id']
            message = serializer.validated_data.get('message', '')
            
            # Check if already invited
            if PartyInvitation.objects.filter(party=party, invitee_id=invitee_id, status='pending').exists():
                return Response({'error': 'User already invited'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create invitation
            invitation = PartyInvitation.objects.create(
                party=party,
                inviter=user,
                invitee_id=invitee_id,
                message=message,
                expires_at=timezone.now() + timedelta(days=7)
            )
            
            # TODO: Send notification to invitee
            
            serializer = PartyInvitationSerializer(invitation, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JoinByCodeView(APIView):
    """Join party by room code"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = PartyJoinSerializer(data=request.data)
        if serializer.is_valid():
            room_code = serializer.validated_data['room_code']
            
            try:
                party = WatchParty.objects.get(room_code=room_code)
            except WatchParty.DoesNotExist:
                return Response({'error': 'Invalid room code'}, status=status.HTTP_404_NOT_FOUND)
            
            # Use the join method from the viewset
            party_viewset = WatchPartyViewSet()
            party_viewset.request = request
            party_viewset.kwargs = {'pk': party.id}
            
            return party_viewset.join(request, pk=party.id)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PartySearchView(APIView):
    """Advanced party search"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = PartySearchSerializer(data=request.query_params)
        if serializer.is_valid():
            queryset = WatchParty.objects.all()
            
            # Apply filters
            query = serializer.validated_data.get('query')
            if query:
                queryset = queryset.filter(
                    Q(title__icontains=query) | Q(description__icontains=query)
                )
            
            host = serializer.validated_data.get('host')
            if host:
                queryset = queryset.filter(host=host)
            
            status_filter = serializer.validated_data.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            visibility = serializer.validated_data.get('visibility')
            if visibility:
                queryset = queryset.filter(visibility=visibility)
            
            has_space = serializer.validated_data.get('has_space')
            if has_space is not None:
                if has_space:
                    queryset = queryset.annotate(
                        current_participants=Count('participants', filter=Q(participants__is_active=True))
                    ).filter(current_participants__lt=F('max_participants'))
                else:
                    queryset = queryset.annotate(
                        current_participants=Count('participants', filter=Q(participants__is_active=True))
                    ).filter(current_participants__gte=F('max_participants'))
            
            # Apply visibility filters
            user = request.user
            
            # Get user's friends
            from apps.users.models import Friendship
            friend_ids = Friendship.objects.filter(
                Q(from_user=user, status='accepted') | Q(to_user=user, status='accepted')
            ).values_list(
                'to_user', 'from_user'
            )
            
            # Extract friend user IDs
            friend_user_ids = set()
            for from_id, to_id in friend_ids:
                if from_id == user.id:
                    friend_user_ids.add(to_id)
                else:
                    friend_user_ids.add(from_id)
            
            queryset = queryset.filter(
                Q(visibility='public') |
                Q(host=user) |
                Q(participants__user=user, participants__is_active=True) |
                Q(visibility='friends', host__id__in=friend_user_ids)
            ).distinct()
            
            # Apply ordering
            order_by = serializer.validated_data.get('order_by', '-created_at')
            queryset = queryset.order_by(order_by)
            
            # Paginate results
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            page = int(request.query_params.get('page', 1))
            
            start = (page - 1) * page_size
            end = start + page_size
            
            parties = queryset[start:end]
            serializer = WatchPartySerializer(parties, many=True, context={'request': request})
            
            return Response({
                'count': queryset.count(),
                'results': serializer.data,
                'page': page,
                'page_size': page_size
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PartyInvitationViewSet(ModelViewSet):
    """Party invitation management"""
    
    queryset = PartyInvitation.objects.all()
    serializer_class = PartyInvitationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return super().get_queryset().filter(invitee=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept party invitation"""
        invitation = self.get_object()
        
        if invitation.status != 'pending':
            return Response({'error': 'Invitation not pending'}, status=status.HTTP_400_BAD_REQUEST)
        
        if invitation.is_expired:
            invitation.status = 'expired'
            invitation.save()
            return Response({'error': 'Invitation expired'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Accept invitation
        invitation.status = 'accepted'
        invitation.responded_at = timezone.now()
        invitation.save()
        
        # Join the party
        PartyParticipant.objects.get_or_create(
            party=invitation.party,
            user=invitation.invitee,
            defaults={'is_active': True, 'status': 'approved'}
        )
        
        return Response({'message': 'Invitation accepted'})
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline party invitation"""
        invitation = self.get_object()
        
        if invitation.status != 'pending':
            return Response({'error': 'Invitation not pending'}, status=status.HTTP_400_BAD_REQUEST)
        
        invitation.status = 'declined'
        invitation.responded_at = timezone.now()
        invitation.save()
        
        return Response({'message': 'Invitation declined'})


class PartyReportView(generics.CreateAPIView):
    """Create party reports"""
    
    queryset = PartyReport.objects.all()
    serializer_class = PartyReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

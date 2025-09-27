from rest_framework import generics, status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Q
from django.utils import timezone
from django.db import transaction
from drf_spectacular.utils import extend_schema

from .models import Event, EventAttendee, EventInvitation
from .serializers import (
    EventListSerializer, EventDetailSerializer, EventCreateUpdateSerializer,
    EventRSVPSerializer, EventAttendeeSerializer, EventInvitationSerializer,
    EventSearchSerializer
)

User = get_user_model()


class EventPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class EventListCreateView(generics.ListCreateAPIView):
    """
    List all events or create a new event
    """
    serializer_class = serializers.Serializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = EventPagination
    
    def get_queryset(self):
        # Handle schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Event.objects.none()
        
        # Handle anonymous users
        if not self.request.user.is_authenticated:
            return Event.objects.none()
        
        queryset = Event.objects.select_related('organizer').prefetch_related('attendees')
        
        # Filter by privacy - only show public events and user's own events
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(privacy='public') | Q(organizer=self.request.user)
            )
        
        # Apply search filters
        search_query = self.request.query_params.get('q')
        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(category__icontains=search_query)
            )
        
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__iexact=category)
        
        location = self.request.query_params.get('location')
        if location:
            queryset = queryset.filter(location__icontains=location)
        
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        privacy_filter = self.request.query_params.get('privacy')
        if privacy_filter:
            queryset = queryset.filter(privacy=privacy_filter)
        
        # Date filters
        start_date = self.request.query_params.get('start_date')
        if start_date:
            queryset = queryset.filter(start_time__gte=start_date)
        
        end_date = self.request.query_params.get('end_date')
        if end_date:
            queryset = queryset.filter(end_time__lte=end_date)
        
        # Tags filter
        tags = self.request.query_params.getlist('tags')
        if tags:
            for tag in tags:
                queryset = queryset.filter(tags__contains=[tag])
        
        return queryset.order_by('-start_time')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return EventCreateUpdateSerializer
        return EventListSerializer


class EventDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete an event
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Event.objects.select_related('organizer').prefetch_related(
            'attendees__user', 'invitations__inviter', 'invitations__invitee', 'reminders'
        )
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return EventCreateUpdateSerializer
        return EventDetailSerializer
    
    def get_object(self):
        event = get_object_or_404(Event, pk=self.kwargs['pk'])
        
        # Check permissions - only organizer can edit/delete
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if event.organizer != self.request.user and not self.request.user.is_staff:
                self.permission_denied(
                    self.request,
                    message="Only the event organizer can modify this event."
                )
        
        # Check view permissions for private events
        if event.privacy == 'private' and event.organizer != self.request.user:
            # Check if user is invited or attending
            is_invited = EventInvitation.objects.filter(
                event=event, invitee=self.request.user
            ).exists()
            is_attending = EventAttendee.objects.filter(
                event=event, user=self.request.user
            ).exists()
            
            if not (is_invited or is_attending or self.request.user.is_staff):
                self.permission_denied(
                    self.request,
                    message="You don't have permission to view this private event."
                )
        
        return event


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def join_event(request, pk):
    """
    Join an event
    """
    event = get_object_or_404(Event, pk=pk)
    
    # Check if event is full
    if event.is_full:
        return Response(
            {'error': 'Event is full'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if user is already attending
    existing_attendance = EventAttendee.objects.filter(
        event=event, user=request.user
    ).first()
    
    if existing_attendance:
        if existing_attendance.status == 'attending':
            return Response(
                {'error': 'You are already attending this event'},
                status=status.HTTP_400_BAD_REQUEST
            )
        else:
            # Update existing attendance
            existing_attendance.status = 'pending' if event.require_approval else 'attending'
            existing_attendance.save()
    else:
        # Create new attendance
        EventAttendee.objects.create(
            event=event,
            user=request.user,
            status='pending' if event.require_approval else 'attending',
            notes=request.data.get('notes', '')
        )
    
    return Response({
        'success': True,
        'message': 'Successfully joined event' if not event.require_approval 
                  else 'Join request sent for approval',
        'requires_approval': event.require_approval
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def leave_event(request, pk):
    """
    Leave an event
    """
    event = get_object_or_404(Event, pk=pk)
    
    try:
        attendance = EventAttendee.objects.get(event=event, user=request.user)
        attendance.delete()
        return Response({
            'success': True,
            'message': 'Successfully left event'
        })
    except EventAttendee.DoesNotExist:
        return Response(
            {'error': 'You are not attending this event'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def rsvp_event(request, pk):
    """
    RSVP to an event
    """
    event = get_object_or_404(Event, pk=pk)
    serializer = EventRSVPSerializer(data=request.data)
    
    if serializer.is_valid():
        rsvp_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        
        # Check if event is full for 'attending' status
        if rsvp_status == 'attending' and event.is_full:
            return Response(
                {'error': 'Event is full'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        attendance, created = EventAttendee.objects.get_or_create(
            event=event,
            user=request.user,
            defaults={'status': rsvp_status, 'notes': notes}
        )
        
        if not created:
            attendance.status = rsvp_status
            attendance.notes = notes
            attendance.save()
        
        return Response({
            'success': True,
            'status': rsvp_status,
            'message': f'RSVP updated to {rsvp_status}'
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventAttendeesView(generics.ListAPIView):
    """
    List event attendees
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventAttendeeSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        # Handle schema generation
        if getattr(self, 'swagger_fake_view', False):
            return EventAttendee.objects.none()
        
        # Handle missing pk parameter
        event_pk = self.kwargs.get('pk')
        if not event_pk:
            return EventAttendee.objects.none()
        
        event = get_object_or_404(Event, pk=event_pk)
        return event.attendees.select_related('user').order_by('-rsvp_date')


class UpcomingEventsView(generics.ListAPIView):
    """
    List upcoming events for the authenticated user
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventListSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        # Handle schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Event.objects.none()
        
        # Handle anonymous users
        if not self.request.user.is_authenticated:
            return Event.objects.none()
        
        return Event.objects.filter(
            start_time__gt=timezone.now(),
            status='upcoming'
        ).select_related('organizer').prefetch_related('attendees').order_by('start_time')


class MyEventsView(generics.ListAPIView):
    """
    List events created by the authenticated user
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventListSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        # Handle schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Event.objects.none()
        
        # Handle anonymous users
        if not self.request.user.is_authenticated:
            return Event.objects.none()
        
        return Event.objects.filter(
            organizer=self.request.user
        ).select_related('organizer').prefetch_related('attendees').order_by('-start_time')


class MyAttendingEventsView(generics.ListAPIView):
    """
    List events the authenticated user is attending
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventListSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        # Handle schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Event.objects.none()
        
        # Handle anonymous users
        if not self.request.user.is_authenticated:
            return Event.objects.none()
        
        attending_event_ids = EventAttendee.objects.filter(
            user=self.request.user,
            status='attending'
        ).values_list('event_id', flat=True)
        
        return Event.objects.filter(
            id__in=attending_event_ids
        ).select_related('organizer').prefetch_related('attendees').order_by('start_time')


class EventSearchView(generics.ListAPIView):
    """
    Advanced event search
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventListSerializer
    pagination_class = EventPagination
    
    def get_queryset(self):
        # Handle schema generation
        if getattr(self, 'swagger_fake_view', False):
            return Event.objects.none()
        
        # Handle anonymous users
        if not self.request.user.is_authenticated:
            return Event.objects.none()
        
        queryset = Event.objects.select_related('organizer').prefetch_related('attendees')
        
        # Apply search filters using the search serializer
        search_serializer = EventSearchSerializer(data=self.request.query_params)
        if search_serializer.is_valid():
            filters = search_serializer.validated_data
            
            if filters.get('q'):
                queryset = queryset.filter(
                    Q(title__icontains=filters['q']) |
                    Q(description__icontains=filters['q']) |
                    Q(category__icontains=filters['q'])
                )
            
            if filters.get('category'):
                queryset = queryset.filter(category__iexact=filters['category'])
            
            if filters.get('location'):
                queryset = queryset.filter(location__icontains=filters['location'])
            
            if filters.get('start_date'):
                queryset = queryset.filter(start_time__gte=filters['start_date'])
            
            if filters.get('end_date'):
                queryset = queryset.filter(end_time__lte=filters['end_date'])
            
            if filters.get('privacy'):
                queryset = queryset.filter(privacy=filters['privacy'])
            
            if filters.get('status'):
                queryset = queryset.filter(status=filters['status'])
            
            if filters.get('tags'):
                for tag in filters['tags']:
                    queryset = queryset.filter(tags__contains=[tag])
        
        # Filter by privacy
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(privacy='public') | Q(organizer=self.request.user)
            )
        
        return queryset.order_by('-start_time')


# Event Invitation Views
class EventInvitationListCreateView(generics.ListCreateAPIView):
    """
    List and create event invitations
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = EventInvitationSerializer
    
    def get_queryset(self):
        # Handle schema generation
        if getattr(self, 'swagger_fake_view', False):
            return EventInvitation.objects.none()
        
        # Handle missing pk parameter
        event_pk = self.kwargs.get('pk')
        if not event_pk:
            return EventInvitation.objects.none()
        
        event = get_object_or_404(Event, pk=event_pk)
        
        # Only event organizer can view all invitations
        if event.organizer != self.request.user and not self.request.user.is_staff:
            return EventInvitation.objects.none()
        
        return event.invitations.select_related('inviter', 'invitee')
    
    def perform_create(self, serializer):
        event = get_object_or_404(Event, pk=self.kwargs['pk'])
        
        # Only event organizer can send invitations
        if event.organizer != self.request.user and not self.request.user.is_staff:
            self.permission_denied(
                self.request,
                message="Only the event organizer can send invitations."
            )
        
        serializer.save(event=event)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def respond_to_invitation(request, pk, invitation_id):
    """
    Respond to an event invitation
    """
    invitation = get_object_or_404(
        EventInvitation, 
        pk=invitation_id, 
        event_id=pk, 
        invitee=request.user
    )
    
    response_status = request.data.get('status')
    if response_status not in ['accepted', 'declined']:
        return Response(
            {'error': 'Status must be either "accepted" or "declined"'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    with transaction.atomic():
        invitation.status = response_status
        invitation.responded_at = timezone.now()
        invitation.save()
        
        # If accepted, create attendance record
        if response_status == 'accepted':
            EventAttendee.objects.get_or_create(
                event=invitation.event,
                user=request.user,
                defaults={
                    'status': 'pending' if invitation.event.require_approval else 'attending'
                }
            )
    
    return Response({
        'success': True,
        'message': f'Invitation {response_status}',
        'status': response_status
    })

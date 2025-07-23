"""
Watch Party Backend URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, Count
from django.http import JsonResponse


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root endpoint"""
    return Response({
        'message': 'Watch Party API',
        'version': '1.0',
        'endpoints': {
            'authentication': '/api/auth/',
            'users': '/api/users/',
            'videos': '/api/videos/',
            'parties': '/api/parties/',
            'chat': '/api/chat/',
            'billing': '/api/billing/',
            'analytics': '/api/analytics/',
            'notifications': '/api/notifications/',
            'integrations': '/api/integrations/',
            'interactive': '/api/interactive/',
            'documentation': '/api/docs/',
            'schema': '/api/schema/',
        }
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def test_endpoint(request):
    """Test endpoint to verify server is working"""
    return Response({
        'message': 'Server is working!',
        'authenticated': request.user.is_authenticated,
        'user_id': request.user.id if request.user.is_authenticated else None,
        'timestamp': timezone.now().isoformat()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    """Dashboard statistics endpoint"""
    from apps.parties.models import WatchParty
    from apps.videos.models import Video
    from apps.analytics.models import AnalyticsEvent
    
    user = request.user
    thirty_days_ago = timezone.now() - timedelta(days=30)
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    # Get user's stats
    user_parties = WatchParty.objects.filter(
        Q(host=user) | Q(participants__user=user, participants__is_active=True)
    ).distinct()
    
    recent_parties = user_parties.filter(created_at__gte=thirty_days_ago).count()
    total_parties = user_parties.count()
    
    user_videos = Video.objects.filter(uploaded_by=user)
    recent_videos = user_videos.filter(created_at__gte=thirty_days_ago).count()
    total_videos = user_videos.count()
    
    # Get watch time this week
    watch_events = AnalyticsEvent.objects.filter(
        user=user,
        event_type='view_end',
        timestamp__gte=seven_days_ago
    ).aggregate(total_duration=Count('duration'))
    
    return Response({
        'user': {
            'id': user.id,
            'name': user.get_full_name(),
            'email': user.email,
        },
        'stats': {
            'total_parties': total_parties,
            'recent_parties': recent_parties,
            'total_videos': total_videos,
            'recent_videos': recent_videos,
            'watch_time_minutes': 0,  # Will be calculated from analytics
        },
        'timestamp': timezone.now().isoformat()
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def activities_recent(request):
    """Recent activities endpoint"""
    from apps.analytics.models import AnalyticsEvent
    
    user = request.user
    seven_days_ago = timezone.now() - timedelta(days=7)
    
    recent_events = AnalyticsEvent.objects.filter(
        user=user,
        timestamp__gte=seven_days_ago
    ).order_by('-timestamp')[:20]
    
    activities = []
    for event in recent_events:
        activity = {
            'id': event.id,
            'type': event.event_type,
            'timestamp': event.timestamp.isoformat(),
            'data': event.event_data
        }
        
        if event.party:
            activity['party'] = {
                'id': event.party.id,
                'title': event.party.title
            }
        
        if event.video:
            activity['video'] = {
                'id': event.video.id,
                'title': event.video.title
            }
        
        activities.append(activity)
    
    return Response({
        'activities': activities,
        'total': len(activities)
    })


def redirect_to_api(request, endpoint_name, correct_path):
    """Redirect old endpoint calls to correct API paths"""
    return JsonResponse({
        'error': f'Please use {correct_path} instead of /{endpoint_name}/',
        'correct_url': correct_path,
        'message': 'This endpoint has moved to the /api/ prefix'
    }, status=301)

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug toolbar
    if 'debug_toolbar' in settings.INSTALLED_APPS:
        import debug_toolbar
        urlpatterns = [
            path('__debug__/', include(debug_toolbar.urls)),
        ] + urlpatterns

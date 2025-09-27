"""
Watch Party Backend URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import redirect
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework import generics
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from drf_spectacular.utils import extend_schema
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, Count
from django.http import JsonResponse
from shared.serializers import (
    APIRootResponseSerializer, 
    HealthCheckResponseSerializer,
    DashboardStatsResponseSerializer,
    ActivitiesResponseSerializer,
    DataResponseSerializer
)


@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request, format=None):
    """API root endpoint"""
    return Response({
        'message': 'Welcome to Watch Party API',
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
            'moderation': '/api/moderation/',
            'events': '/api/events/',
            'social': '/api/social/',
            'support': '/api/support/',
            'mobile': '/api/mobile/',
            'documentation': '/api/docs/',
            'schema': '/api/schema/',
        }
    })


class HealthCheckView(generics.GenericAPIView):
    """Health check endpoint"""
    permission_classes = [AllowAny]
    serializer_class = HealthCheckResponseSerializer
    
    @extend_schema(
        summary="Health Check",
        description="Check service health status",
        responses={200: HealthCheckResponseSerializer}
    )
    def get(self, request):
        return Response({
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'version': '1.0'
        })


class TestEndpointView(generics.GenericAPIView):
    """Test endpoint"""
    permission_classes = [AllowAny]
    serializer_class = DataResponseSerializer
    
    @extend_schema(
        summary="Test Endpoint",
        description="Test endpoint to verify server is working",
        responses={200: DataResponseSerializer}
    )
    def get(self, request):
        return Response({
            'message': 'Server is working!',
            'authenticated': request.user.is_authenticated,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'timestamp': timezone.now().isoformat()
        })


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0'
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


class DashboardStatsView(generics.GenericAPIView):
    """Dashboard statistics endpoint"""
    permission_classes = [IsAuthenticated]
    serializer_class = DashboardStatsResponseSerializer
    
    @extend_schema(
        summary="Dashboard Statistics",
        description="Get dashboard statistics for authenticated user",
        responses={200: DashboardStatsResponseSerializer}
    )
    def get(self, request):
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


class ActivitiesRecentView(generics.GenericAPIView):
    """Recent activities endpoint"""
    permission_classes = [IsAuthenticated]
    serializer_class = ActivitiesResponseSerializer
    
    @extend_schema(
        summary="Recent Activities",
        description="Get recent activities for authenticated user",
        responses={200: ActivitiesResponseSerializer}
    )
    def get(self, request):
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


# Main URL patterns
urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Root
    path('api/', api_root, name='api_root'),
    path('', api_root, name='root'),  # Redirect root to API
    
    # Health check
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('api/health/', HealthCheckView.as_view(), name='api_health_check'),
    
    # Test endpoint
    path('api/test/', TestEndpointView.as_view(), name='test_endpoint'),
    
    # API Schema - Direct JSON format without UI
    path('api/schema.json', SpectacularAPIView.as_view(), name='schema-json'),
    path('api/schema-ui/', lambda request: redirect('/api/docs/')),
    
    # Dashboard API
    path('api/dashboard/stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('api/dashboard/activities/', ActivitiesRecentView.as_view(), name='activities_recent'),
    
    # Authentication endpoints
    path('api/auth/', include('apps.authentication.urls')),
    
    # App endpoints
    path('api/users/', include('apps.users.urls')),
    path('api/videos/', include('apps.videos.urls')),
    path('api/parties/', include('apps.parties.urls')),
    path('api/chat/', include('apps.chat.urls')),
    # path('api/billing/', include('apps.billing.urls')),  # Temporarily disabled due to Stripe compatibility issue
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/integrations/', include('apps.integrations.urls')),
    path('api/interactive/', include('apps.interactive.urls')),
    path('api/moderation/', include('apps.moderation.urls')),
    path('api/store/', include('apps.store.urls')),
    path('api/search/', include('apps.search.urls')),
    path('api/social/', include('apps.social.urls')),
    path('api/messaging/', include('apps.messaging.urls')),
    path('api/support/', include('apps.support.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/mobile/', include('apps.mobile.urls')),
    
    # Admin Panel API
    path('api/admin/', include('apps.admin_panel.urls')),
    
    # API Documentation - Enhanced Swagger Setup
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Redirect /docs to /api/docs for convenience
    path('docs/', lambda request: redirect('/api/docs/')),
    path('swagger/', lambda request: redirect('/api/docs/')),
    
    # Legacy redirects (for backward compatibility)
    path('auth/<path:remaining>', lambda r, remaining: redirect_to_api(r, 'auth', '/api/auth/')),
    path('users/<path:remaining>', lambda r, remaining: redirect_to_api(r, 'users', '/api/users/')),
    path('videos/<path:remaining>', lambda r, remaining: redirect_to_api(r, 'videos', '/api/videos/')),
    path('parties/<path:remaining>', lambda r, remaining: redirect_to_api(r, 'parties', '/api/parties/')),
]

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

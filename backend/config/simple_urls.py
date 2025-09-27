"""
Simple URL configuration for testing
"""

from django.contrib import admin
from django.urls import include, path

from apps.analytics.dashboard_views import dashboard_stats, track_event
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint"""
    return Response({'status': 'healthy', 'message': 'Watch Party Backend is running'})

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    """API root endpoint"""
    return Response({
        'message': 'Watch Party API',
        'version': '2.0.0',
        'endpoints': {
            'health': '/api/health/',
            'admin': '/admin/',
        }
    })

analytics_patterns = ([
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
    path('events/', track_event, name='track-event'),
], 'analytics')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root, name='api-root'),
    path('api/health/', health_check, name='health-check'),
    path(
        'api/auth/',
        include(('apps.authentication.urls', 'authentication'), namespace='authentication'),
    ),
    path('api/analytics/', include(analytics_patterns)),
    path('health/', health_check, name='health'),
]

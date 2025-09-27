"""
Mobile app specific URL patterns
"""

from django.urls import path
from . import views

app_name = 'mobile'

urlpatterns = [
    # Mobile app configuration
    path('config/', views.MobileAppConfigView.as_view(), name='mobile-config'),
    
    # Mobile home screen data
    path('home/', views.MobileHomeView.as_view(), name='mobile-home'),
    
    # Data synchronization
    path('sync/', views.MobileSyncView.as_view(), name='mobile-sync'),
    path('sync/offline/', views.MobileOfflineSyncView.as_view(), name='mobile-offline-sync'),
    
    # Device management
    path('device/register/', views.register_device, name='register-device'),
    
    # Push notifications
    path('push-token/', views.update_push_token, name='update-push-token'),
    
    # Analytics and tracking
    path('analytics/track/', views.track_analytics, name='track-analytics'),
    path('crash/report/', views.report_crash, name='report-crash'),
    
    # App info
    path('app-info/', views.mobile_app_info, name='mobile-app-info'),
]

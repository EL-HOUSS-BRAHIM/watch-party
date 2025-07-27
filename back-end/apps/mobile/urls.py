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
    
    # Offline sync
    path('sync/', views.MobileOfflineSyncView.as_view(), name='mobile-sync'),
    
    # Push notifications
    path('push-token/', views.update_push_token, name='update-push-token'),
    
    # App info
    path('app-info/', views.mobile_app_info, name='mobile-app-info'),
]

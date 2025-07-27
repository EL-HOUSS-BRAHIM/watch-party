from django.urls import path
from . import views
from .advanced_views import (
    RealTimeDashboardView, AdvancedAnalyticsView, 
    A_BTestingView, PredictiveAnalyticsView
)
from . import dashboard_views
from .views_advanced import (
    platform_overview_analytics, user_behavior_analytics, 
    content_performance_analytics, revenue_analytics,
    user_personal_analytics, real_time_analytics
)

app_name = 'analytics'

urlpatterns = [
    # Standard analytics endpoints
    path('', views.AdminAnalyticsView.as_view(), name='analytics'),  # Default analytics endpoint
    path('user-stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('party-stats/<uuid:party_id>/', views.PartyStatsView.as_view(), name='party-stats'),
    path('admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('export/', views.ExportAnalyticsView.as_view(), name='export-analytics'),
    
    # Enhanced Dashboard Analytics
    path('dashboard/', dashboard_views.dashboard_stats, name='dashboard-stats'),
    path('user/', dashboard_views.user_analytics, name='user-analytics'),
    path('video/<uuid:video_id>/', dashboard_views.video_analytics, name='video-analytics'),
    path('party/<uuid:party_id>/', dashboard_views.party_analytics, name='party-analytics'),
    path('system/', dashboard_views.system_analytics, name='system-analytics'),
    path('system/performance/', views.system_performance_analytics, name='system-performance'),
    path('revenue/', views.revenue_analytics, name='revenue-analytics'),
    path('retention/', views.user_retention_analytics, name='retention-analytics'),
    path('content/', views.content_analytics, name='content-analytics'),
    path('events/', dashboard_views.track_event, name='track-event'),
    
    # Phase 2 Advanced Analytics
    path('dashboard/realtime/', RealTimeDashboardView.as_view(), name='realtime-dashboard'),
    path('advanced/query/', AdvancedAnalyticsView.as_view(), name='advanced-analytics'),
    path('ab-testing/', A_BTestingView.as_view(), name='ab-testing'),
    path('predictive/', PredictiveAnalyticsView.as_view(), name='predictive-analytics'),
    
    # Latest Advanced Analytics Endpoints
    path('platform-overview/', platform_overview_analytics, name='platform_overview'),
    path('user-behavior/', user_behavior_analytics, name='user_behavior'),
    path('content-performance/', content_performance_analytics, name='content_performance'),
    path('revenue-advanced/', revenue_analytics, name='revenue_analytics_advanced'),
    path('personal/', user_personal_analytics, name='personal_analytics'),
    path('real-time/', real_time_analytics, name='real_time_analytics'),
]

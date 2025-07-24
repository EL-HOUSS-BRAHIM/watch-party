from django.urls import path
from . import views
from .advanced_views import (
    RealTimeDashboardView, AdvancedAnalyticsView, 
    A_BTestingView, PredictiveAnalyticsView
)

app_name = 'analytics'

urlpatterns = [
    # Standard analytics endpoints
    path('', views.AdminAnalyticsView.as_view(), name='analytics'),  # Default analytics endpoint
    path('user-stats/', views.UserStatsView.as_view(), name='user-stats'),
    path('party-stats/<uuid:party_id>/', views.PartyStatsView.as_view(), name='party-stats'),
    path('admin/analytics/', views.AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('export/', views.ExportAnalyticsView.as_view(), name='export-analytics'),
    
    # Phase 2 Advanced Analytics
    path('dashboard/realtime/', RealTimeDashboardView.as_view(), name='realtime-dashboard'),
    path('advanced/query/', AdvancedAnalyticsView.as_view(), name='advanced-analytics'),
    path('ab-testing/', A_BTestingView.as_view(), name='ab-testing'),
    path('predictive/', PredictiveAnalyticsView.as_view(), name='predictive-analytics'),
]

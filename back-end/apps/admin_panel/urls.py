"""
Admin panel URL configuration
"""

from django.urls import path
from . import views
from .health_views import HealthCheckView, DetailedStatusView, MetricsView

app_name = 'admin_panel'

urlpatterns = [
    # Admin Dashboard
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('analytics/', views.admin_analytics_overview, name='admin_analytics_overview'),
    
    # User Management
    path('users/', views.admin_users_list, name='admin_users_list'),
    path('users/<uuid:user_id>/suspend/', views.admin_suspend_user, name='admin_suspend_user'),
    path('users/<uuid:user_id>/unsuspend/', views.admin_unsuspend_user, name='admin_unsuspend_user'),
    path('users/bulk-action/', views.admin_bulk_user_action, name='admin_bulk_user_action'),
    path('users/export/', views.admin_export_users, name='admin_export_users'),
    path('users/<uuid:user_id>/actions/', views.admin_user_action_history, name='admin_user_action_history'),
    
    # Party Management
    path('parties/', views.admin_parties_list, name='admin_parties_list'),
    path('parties/<uuid:party_id>/delete/', views.admin_delete_party, name='admin_delete_party'),
    
    # Video Management
    path('videos/', views.admin_video_management, name='admin_video_management'),
    path('videos/<uuid:video_id>/delete/', views.admin_delete_video, name='admin_delete_video'),
    
    # Content Moderation and Reports
    path('reports/', views.admin_content_reports, name='admin_content_reports'),
    path('reports/<uuid:report_id>/resolve/', views.admin_resolve_report, name='admin_resolve_report'),
    
    # System Management
    path('logs/', views.admin_system_logs, name='admin_system_logs'),
    path('system-health/', views.admin_system_health, name='admin_system_health'),
    path('maintenance/', views.admin_system_maintenance, name='admin_system_maintenance'),
    
    # Communication
    path('broadcast/', views.admin_broadcast_message, name='admin_broadcast_message'),
    path('notifications/send/', views.admin_send_notification, name='admin_send_notification'),
    
    # Settings
    path('settings/', views.admin_system_settings, name='admin_system_settings'),
    path('settings/update/', views.admin_update_system_settings, name='admin_update_system_settings'),
    
    # Health and monitoring endpoints (Enhanced)
    path('health/check/', HealthCheckView.as_view(), name='health_check'),
    path('health/status/', DetailedStatusView.as_view(), name='detailed_status'),
    path('health/metrics/', MetricsView.as_view(), name='metrics'),
]

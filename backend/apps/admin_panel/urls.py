"""
Admin panel URL configuration
"""

from django.urls import path
from . import views
from .health_views import HealthCheckView, DetailedStatusView, MetricsView

app_name = 'admin_panel'

urlpatterns = [
    # Admin Dashboard
    path('dashboard/', views.AdminDashboardView.as_view(), name='admin_dashboard'),
    path('analytics/', views.admin_analytics_overview, name='admin_analytics_overview'),
    
    # User Management (Enhanced)
    path('users/', views.AdminUsersListView.as_view(), name='admin_users_list'),
    path('users/<uuid:user_id>/suspend/', views.AdminSuspendUserView.as_view(), name='admin_suspend_user'),
    path('users/<uuid:user_id>/unsuspend/', views.AdminUnsuspendUserView.as_view(), name='admin_unsuspend_user'),
    path('users/bulk-actions/', views.admin_bulk_user_actions, name='admin_bulk_user_actions'),
    path('users/export/', views.admin_export_users, name='admin_export_users'),
    
    # Party Management
    path('parties/', views.AdminPartiesListView.as_view(), name='admin_parties_list'),
    path('parties/<uuid:party_id>/delete/', views.AdminDeletePartyView.as_view(), name='admin_delete_party'),
    
    # Content Moderation (Enhanced)
    path('moderation/', views.admin_content_moderation, name='admin_content_moderation'),
    path('reports/', views.AdminContentReportsView.as_view(), name='admin_content_reports'),
    
    # System Management (Enhanced)
    path('system/health/', views.admin_system_health, name='admin_system_health'),
    path('system/logs/', views.AdminSystemLogsView.as_view(), name='admin_system_logs'),
    
    # Communication (Enhanced)
    path('broadcast/', views.AdminBroadcastMessageView.as_view(), name='admin_broadcast_message'),
    path('notifications/send/', views.admin_send_notification, name='admin_send_notification'),
    
    # Health and monitoring endpoints
    path('health/check/', HealthCheckView.as_view(), name='health_check'),
    path('health/status/', DetailedStatusView.as_view(), name='detailed_status'),
    path('health/metrics/', MetricsView.as_view(), name='metrics'),
]

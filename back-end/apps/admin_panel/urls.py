"""
Admin panel URL configuration
"""

from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    # Admin Dashboard
    path('dashboard/', views.admin_dashboard, name='admin_dashboard'),
    
    # User Management
    path('users/', views.admin_users_list, name='admin_users_list'),
    path('users/<uuid:user_id>/suspend/', views.admin_suspend_user, name='admin_suspend_user'),
    path('users/<uuid:user_id>/unsuspend/', views.admin_unsuspend_user, name='admin_unsuspend_user'),
    
    # Party Management
    path('parties/', views.admin_parties_list, name='admin_parties_list'),
    path('parties/<uuid:party_id>/delete/', views.admin_delete_party, name='admin_delete_party'),
    
    # Video Management
    path('videos/', views.admin_video_management, name='admin_video_management'),
    path('videos/<uuid:video_id>/delete/', views.admin_delete_video, name='admin_delete_video'),
    
    # Content Moderation
    path('reports/', views.admin_content_reports, name='admin_content_reports'),
    path('reports/<uuid:report_id>/resolve/', views.admin_resolve_report, name='admin_resolve_report'),
    
    # System Management
    path('logs/', views.admin_system_logs, name='admin_system_logs'),
    path('broadcast/', views.admin_broadcast_message, name='admin_broadcast_message'),
]

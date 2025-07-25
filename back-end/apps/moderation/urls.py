"""
Content reporting URL patterns for Watch Party Backend
"""

from django.urls import path
from . import views

app_name = 'moderation'

urlpatterns = [
    # Content Report Management
    path('reports/', views.ContentReportListCreateView.as_view(), name='reports-list-create'),
    path('reports/<uuid:pk>/', views.ContentReportDetailView.as_view(), name='report-detail'),
    
    # Admin Moderation Interface
    path('admin/queue/', views.ModerationQueueView.as_view(), name='moderation-queue'),
    path('admin/stats/', views.moderation_stats, name='moderation-stats'),
    path('admin/dashboard/', views.moderation_dashboard, name='moderation-dashboard'),
    
    # Report Actions
    path('admin/reports/<uuid:report_id>/assign/', views.assign_report, name='assign-report'),
    path('admin/reports/<uuid:report_id>/resolve/', views.resolve_report, name='resolve-report'),
    path('admin/reports/<uuid:report_id>/dismiss/', views.dismiss_report, name='dismiss-report'),
    path('admin/reports/<uuid:report_id>/actions/', views.ReportActionListView.as_view(), name='report-actions'),
    
    # Bulk Operations
    path('admin/reports/bulk-action/', views.bulk_report_action, name='bulk-report-action'),
    
    # Utility Endpoints
    path('report-types/', views.report_types, name='report-types'),
    path('content-types/', views.content_types, name='content-types'),
]

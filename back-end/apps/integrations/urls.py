from django.urls import path, include

from . import views

app_name = 'integrations'

# Google Drive Integration URLs
google_drive_patterns = [
    path('auth-url/', views.google_drive_auth_url, name='google_drive_auth_url'),
    path('oauth-callback/', views.google_drive_oauth_callback, name='google_drive_oauth_callback'),
    path('files/', views.google_drive_list_files, name='google_drive_list_files'),
    path('files/<str:file_id>/streaming-url/', views.google_drive_streaming_url, name='google_drive_streaming_url'),
]

# AWS S3 Integration URLs
s3_patterns = [
    path('presigned-upload/', views.s3_presigned_upload_url, name='s3_presigned_upload_url'),
    path('upload/', views.s3_upload_file, name='s3_upload_file'),
    path('files/<path:file_key>/streaming-url/', views.s3_streaming_url, name='s3_streaming_url'),
]

# Social OAuth URLs
social_oauth_patterns = [
    path('<str:provider>/auth-url/', views.social_oauth_auth_url, name='social_oauth_auth_url'),
    path('<str:provider>/callback/', views.social_oauth_callback, name='social_oauth_callback'),
]

urlpatterns = [
    # Public endpoints (no auth required)
    path('health/', views.integration_health, name='integration_health'),
    
    # Admin integration endpoints
    path('status/', views.IntegrationStatusView.as_view(), name='integration_status'),
    path('management/', views.IntegrationManagementView.as_view(), name='integration_management'),
    path('test/', views.test_integration, name='test_integration'),
    path('types/', views.integration_types, name='integration_types'),
    
    # General integration endpoints
    path('connections/', views.list_user_connections, name='list_user_connections'),
    path('connections/<int:connection_id>/disconnect/', views.disconnect_service, name='disconnect_service'),
    
    # Service-specific endpoints
    path('google-drive/', include(google_drive_patterns)),
    path('s3/', include(s3_patterns)),
    path('oauth/', include(social_oauth_patterns)),
]

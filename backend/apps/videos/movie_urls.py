"""
Movie management URLs
"""

from django.urls import path
from .movie_views import (
    MovieListView,
    MovieDetailView,
    MovieUploadView,
    MovieDeleteView,
    MovieStreamView,
    MovieProxyView,
    connect_google_drive,
    disconnect_google_drive,
    google_drive_status
)

app_name = 'movies'

urlpatterns = [
    # Google Drive connection management
    path('drive/connect/', connect_google_drive, name='connect_google_drive'),
    path('drive/disconnect/', disconnect_google_drive, name='disconnect_google_drive'),
    path('drive/status/', google_drive_status, name='google_drive_status'),
    
    # Movie management
    path('', MovieListView.as_view(), name='movie_list'),
    path('<str:file_id>/', MovieDetailView.as_view(), name='movie_detail'),
    path('upload/', MovieUploadView.as_view(), name='movie_upload'),
    path('<str:file_id>/delete/', MovieDeleteView.as_view(), name='movie_delete'),
    path('<str:file_id>/stream/', MovieStreamView.as_view(), name='movie_stream'),
    path('<str:file_id>/proxy/', MovieProxyView.as_view(), name='movie_proxy'),
]

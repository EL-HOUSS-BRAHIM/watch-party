"""
Video URLs for Watch Party Backend
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VideoViewSet, VideoUploadView, VideoUploadCompleteView, VideoUploadStatusView, VideoSearchView

app_name = 'videos'

# Create router for ViewSet
router = DefaultRouter()
router.register(r'', VideoViewSet, basename='video')

urlpatterns = [
    # Video CRUD operations (handled by ViewSet)
    path('', include(router.urls)),
    
    # Upload endpoints
    path('upload/', VideoUploadView.as_view(), name='upload'),
    path('upload/<uuid:upload_id>/complete/', VideoUploadCompleteView.as_view(), name='upload_complete'),
    path('upload/<uuid:upload_id>/status/', VideoUploadStatusView.as_view(), name='upload_status'),
    
    # Search
    path('search/', VideoSearchView.as_view(), name='search'),
]

# ViewSet generates these URLs:
# GET    /api/videos/                     - List videos
# POST   /api/videos/                     - Create video
# GET    /api/videos/{id}/                - Get video details
# PUT    /api/videos/{id}/                - Update video
# PATCH  /api/videos/{id}/                - Partial update video
# DELETE /api/videos/{id}/                - Delete video
# POST   /api/videos/{id}/like/           - Like/unlike video
# GET    /api/videos/{id}/comments/       - Get video comments
# POST   /api/videos/{id}/comments/       - Add video comment
# GET    /api/videos/{id}/stream/         - Stream video
# GET    /api/videos/{id}/download/       - Download video

"""
Video URLs for Watch Party Backend
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VideoViewSet, 
    VideoUploadView, 
    VideoUploadCompleteView, 
    VideoUploadStatusView, 
    VideoSearchView,
    GoogleDriveMoviesView,
    GoogleDriveMovieUploadView,
    GoogleDriveMovieDeleteView,
    GoogleDriveMovieStreamView,
    VideoProxyView,
    VideoProcessingStatusView,
    VideoQualityVariantsView,
    RegenerateThumbnailView,
    VideoShareView,
    VideoSearchEnhancedView,
    # Analytics views
    video_analytics,
    video_engagement_heatmap,
    video_retention_curve,
    video_viewer_journey,
    video_comparative_analytics,
    trending_videos_analytics,
    channel_analytics_dashboard
)
from .enhanced_views import (
    S3VideoUploadView,
    VideoStreamingUrlView,
    VideoThumbnailView,
    VideoAnalyticsView,
    validate_video_url
)

app_name = 'videos'

# Create router for ViewSet
router = DefaultRouter()
router.register(r'', VideoViewSet, basename='video')

urlpatterns = [
    # Video CRUD operations (handled by ViewSet)
    path('', include(router.urls)),
    
    # Upload endpoints
    path('upload/', VideoUploadView.as_view(), name='upload'),
    path('upload/s3/', S3VideoUploadView.as_view(), name='s3_upload'),
    path('upload/<uuid:upload_id>/complete/', VideoUploadCompleteView.as_view(), name='upload_complete'),
    path('upload/<uuid:upload_id>/status/', VideoUploadStatusView.as_view(), name='upload_status'),
    
    # Video processing and streaming
    path('<uuid:video_id>/stream/', VideoStreamingUrlView.as_view(), name='streaming_url'),
    path('<uuid:video_id>/thumbnail/', VideoThumbnailView.as_view(), name='thumbnail'),
    path('<uuid:video_id>/analytics/', VideoAnalyticsView.as_view(), name='analytics'),
    
    # Enhanced video management
    path('<uuid:video_id>/processing-status/', VideoProcessingStatusView.as_view(), name='processing_status'),
    path('<uuid:video_id>/quality-variants/', VideoQualityVariantsView.as_view(), name='quality_variants'),
    path('<uuid:video_id>/regenerate-thumbnail/', RegenerateThumbnailView.as_view(), name='regenerate_thumbnail'),
    path('<uuid:video_id>/share/', VideoShareView.as_view(), name='share_video'),
    
    # Advanced Video Analytics
    path('<uuid:video_id>/analytics/detailed/', video_analytics, name='detailed_analytics'),
    path('<uuid:video_id>/analytics/heatmap/', video_engagement_heatmap, name='engagement_heatmap'),
    path('<uuid:video_id>/analytics/retention/', video_retention_curve, name='retention_curve'),
    path('<uuid:video_id>/analytics/journey/', video_viewer_journey, name='viewer_journey'),
    path('<uuid:video_id>/analytics/comparative/', video_comparative_analytics, name='comparative_analytics'),
    
    # Channel Analytics
    path('analytics/channel/', channel_analytics_dashboard, name='channel_analytics'),
    path('analytics/trending/', trending_videos_analytics, name='trending_analytics'),
    
    # Video validation
    path('validate-url/', validate_video_url, name='validate_url'),
    
    # Search
    path('search/', VideoSearchView.as_view(), name='search'),
    path('search/advanced/', VideoSearchEnhancedView.as_view(), name='advanced_search'),
    
    # Google Drive movie management
    path('gdrive/', GoogleDriveMoviesView.as_view(), name='gdrive_movies'),
    path('gdrive/upload/', GoogleDriveMovieUploadView.as_view(), name='gdrive_upload'),
    path('gdrive/<uuid:video_id>/delete/', GoogleDriveMovieDeleteView.as_view(), name='gdrive_delete'),
    path('gdrive/<uuid:video_id>/stream/', GoogleDriveMovieStreamView.as_view(), name='gdrive_stream'),
    
    # Video proxy for streaming
    path('<uuid:video_id>/proxy/', VideoProxyView.as_view(), name='video_proxy'),
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

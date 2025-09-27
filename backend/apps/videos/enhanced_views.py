"""
Additional video views for enhanced functionality
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import extend_schema
from shared.services.video_service import video_storage_service, video_processing_service, video_streaming_service
from .models import Video
from shared.exceptions import VideoError


class S3VideoUploadView(APIView):
    """Generate S3 presigned URL for video upload"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="S3VideoUploadView POST")
    def post(self, request):
        """Generate presigned URL for S3 upload"""
        try:
            filename = request.data.get('filename')
            content_type = request.data.get('content_type')
            file_size = request.data.get('file_size')
            
            if not filename or not content_type:
                return Response({
                    'error': 'Filename and content_type are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Generate presigned URL
            upload_data = video_storage_service.generate_upload_url(
                filename=filename,
                content_type=content_type,
                file_size=file_size
            )
            
            return Response({
                'success': True,
                'upload_data': upload_data
            }, status=status.HTTP_200_OK)
            
        except VideoError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({
                'error': 'Failed to generate upload URL'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VideoStreamingUrlView(APIView):
    """Generate streaming URL for video"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="VideoStreamingUrlView GET")
    def get(self, request, video_id):
        """Get streaming URL for video"""
        try:
            video = get_object_or_404(Video, id=video_id)
            user = request.user
            resolution = request.GET.get('resolution', 'original')
            
            # Check permissions
            if not self._can_access_video(user, video):
                return Response({
                    'error': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate streaming URL
            streaming_url = video_streaming_service.generate_streaming_url(
                video=video,
                user=user,
                resolution=resolution,
                ip_address=request.META.get('REMOTE_ADDR'),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            return Response({
                'success': True,
                'streaming_url': streaming_url['url'],
                'expires_at': streaming_url['expires_at']
            }, status=status.HTTP_200_OK)
            
        except VideoError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({
                'error': 'Failed to generate streaming URL'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def _can_access_video(self, user, video):
        """Check if user can access video"""
        if video.uploader == user:
            return True
        
        if video.visibility == 'public':
            return True
        
        if video.visibility == 'friends':
            # Check if user is friend with uploader
            return user in video.uploader.friends.all()
        
        return False


class VideoThumbnailView(APIView):
    """Generate or get video thumbnail"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="VideoThumbnailView POST")
    def post(self, request, video_id):
        """Generate thumbnail for video"""
        try:
            video = get_object_or_404(Video, id=video_id)
            user = request.user
            
            # Check permissions (only uploader can generate thumbnails)
            if video.uploader != user:
                return Response({
                    'error': 'Only video uploader can generate thumbnails'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Generate thumbnail
            result = video_processing_service.generate_thumbnails(video)
            
            return Response({
                'success': True,
                'message': result['message'],
                'status': result['status']
            }, status=status.HTTP_200_OK)
            
        except VideoError as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response({
                'error': 'Failed to generate thumbnail'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VideoAnalyticsView(APIView):
    """Get video analytics"""
    
    permission_classes = [IsAuthenticated]
    
    @extend_schema(summary="VideoAnalyticsView GET")
    def get(self, request, video_id):
        """Get analytics for video"""
        try:
            video = get_object_or_404(Video, id=video_id)
            user = request.user
            
            # Check permissions (only uploader can view analytics)
            if video.uploader != user:
                return Response({
                    'error': 'Only video uploader can view analytics'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Get analytics data
            from apps.analytics.models import VideoView
            
            total_views = VideoView.objects.filter(video=video).count()
            unique_viewers = VideoView.objects.filter(video=video).values('user').distinct().count()
            
            # Get recent views (last 30 days)
            thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
            recent_views = VideoView.objects.filter(
                video=video,
                created_at__gte=thirty_days_ago
            ).count()
            
            return Response({
                'video_id': str(video.id),
                'total_views': total_views,
                'unique_viewers': unique_viewers,
                'recent_views': recent_views,
                'like_count': video.like_count,
                'created_at': video.created_at,
                'status': video.status
            }, status=status.HTTP_200_OK)
            
        except Exception:
            return Response({
                'error': 'Failed to get video analytics'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def validate_video_url(request):
    """Validate external video URL"""
    try:
        url = request.data.get('url')
        if not url:
            return Response({
                'error': 'URL is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate URL using video service
        validation_result = video_streaming_service.validate_external_video_url(url)
        
        return Response({
            'success': True,
            'valid': True,
            'video_info': validation_result
        }, status=status.HTTP_200_OK)
        
    except VideoError as e:
        return Response({
            'success': True,
            'valid': False,
            'error': str(e)
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({
            'error': 'Failed to validate URL'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

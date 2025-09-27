"""
Video views for Watch Party Backend
"""

from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, F
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import ValidationError
from django_filters.rest_framework import DjangoFilterBackend
from drf_spectacular.utils import extend_schema

from apps.integrations.services.google_drive import get_drive_service

from .models import Video, VideoLike, VideoComment, VideoView, VideoUpload
from .serializers import (
    VideoSerializer, VideoDetailSerializer, VideoCreateSerializer,
    VideoUpdateSerializer, VideoCommentSerializer, VideoUploadSerializer,
    VideoUploadCreateSerializer, VideoSearchSerializer
)
from shared.permissions import IsOwnerOrReadOnly, IsAdminUser


class VideoViewSet(ModelViewSet):
    """Video CRUD operations"""
    
    queryset = Video.objects.filter(status='ready')
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_type', 'visibility', 'uploader', 'require_premium']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'view_count', 'like_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return VideoDetailSerializer
        elif self.action == 'create':
            return VideoCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VideoUpdateSerializer
        return VideoSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        
        if not user.is_authenticated:
            return queryset.filter(visibility='public')
        
        # Users can see their own videos and public videos
        # Plus friends videos if visibility is 'friends'
        return queryset.filter(
            Q(visibility='public') |
            Q(uploader=user) |
            Q(visibility='friends', uploader__in=user.friends.all())
        ).distinct()
    
    def retrieve(self, request, *args, **kwargs):
        """Get video details and record view"""
        instance = self.get_object()
        
        # Check premium requirement
        if instance.require_premium and not request.user.is_subscription_active:
            return Response(
                {'error': 'Premium subscription required'}, 
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
        
        # Record view
        if request.user.is_authenticated:
            VideoView.objects.create(
                video=instance,
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            # Update view count
            Video.objects.filter(id=instance.id).update(view_count=F('view_count') + 1)
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def like(self, request, pk=None):
        """Like or unlike a video"""
        video = self.get_object()
        is_like = request.data.get('is_like', True)
        
        like_obj, created = VideoLike.objects.get_or_create(
            user=request.user, 
            video=video,
            defaults={'is_like': is_like}
        )
        
        if not created:
            if like_obj.is_like == is_like:
                # Remove like/dislike if clicking same action
                like_obj.delete()
            else:
                # Update like/dislike
                like_obj.is_like = is_like
                like_obj.save()
        else:
            pass
        
        # Update like count
        like_count = video.likes.filter(is_like=True).count()
        Video.objects.filter(id=video.id).update(like_count=like_count)
        
        # Check if user still has like record
        current_like = VideoLike.objects.filter(user=request.user, video=video).first()
        
        # Return response in expected format
        return Response({
            'success': True,
            'is_liked': current_like.is_like if current_like else False,
            'like_count': like_count
        })
    
    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def comments(self, request, pk=None):
        """Get or add comments for a video"""
        video = self.get_object()
        
        if request.method == 'GET':
            comments = video.comments.filter(parent=None)  # Only root comments
            serializer = VideoCommentSerializer(comments, many=True, context={'request': request})
            return Response(serializer.data)
        
        else:  # POST
            serializer = VideoCommentSerializer(data=request.data, context={'request': request})
            if serializer.is_valid():
                serializer.save(user=request.user, video=video)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def stream(self, request, pk=None):
        """Stream video file"""
        video = self.get_object()
        
        # Check premium requirement
        if video.require_premium and not request.user.is_subscription_active:
            return Response(
                {'error': 'Premium subscription required'}, 
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
        
        if not video.file:
            return Response({'error': 'Video file not available'}, status=status.HTTP_404_NOT_FOUND)
        
        # Return file response for streaming
        response = FileResponse(
            video.file.open(), 
            content_type='video/mp4',
            as_attachment=False
        )
        response['Accept-Ranges'] = 'bytes'
        return response
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def download(self, request, pk=None):
        """Download video file"""
        video = self.get_object()
        
        if not video.allow_download:
            return Response({'error': 'Download not allowed'}, status=status.HTTP_403_FORBIDDEN)
        
        # Check premium requirement
        if video.require_premium and not request.user.is_subscription_active:
            return Response(
                {'error': 'Premium subscription required'}, 
                status=status.HTTP_402_PAYMENT_REQUIRED
            )
        
        if not video.file:
            return Response({'error': 'Video file not available'}, status=status.HTTP_404_NOT_FOUND)
        
        response = FileResponse(
            video.file.open(),
            content_type='application/octet-stream',
            as_attachment=True,
            filename=f"{video.title}.mp4"
        )
        return response
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class VideoCommentViewSet(ModelViewSet):
    """Video comment CRUD operations"""
    
    queryset = VideoComment.objects.all()
    serializer_class = VideoCommentSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrReadOnly]
    
    def get_queryset(self):
        """Filter comments by video if video_id is provided"""
        queryset = super().get_queryset()
        video_id = self.request.query_params.get('video_id')
        if video_id:
            queryset = queryset.filter(video__id=video_id)
        return queryset.select_related('user', 'video').prefetch_related('replies')
    
    def perform_create(self, serializer):
        """Set the user when creating a comment"""
        video_id = self.request.data.get('video_id')
        parent_id = self.request.data.get('parent_id')
        
        try:
            video = Video.objects.get(id=video_id)
        except Video.DoesNotExist:
            raise ValidationError({'video_id': 'Invalid video ID'})
        
        parent = None
        if parent_id:
            try:
                parent = VideoComment.objects.get(id=parent_id, video=video)
            except VideoComment.DoesNotExist:
                raise ValidationError({'parent_id': 'Invalid parent comment ID'})
        
        serializer.save(user=self.request.user, video=video, parent=parent)
    
    def perform_update(self, serializer):
        """Mark comment as edited when updated"""
        serializer.save(is_edited=True)


class VideoUploadView(generics.GenericAPIView):
    """Handle video upload initiation"""
    
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    serializer_class = VideoUploadCreateSerializer
    
    @extend_schema(
        summary="Video Upload",
        description="Initiate video upload",
        responses={200: VideoUploadCreateSerializer}
    )
    def post(self, request):
        """Initiate video upload"""
        serializer = VideoUploadCreateSerializer(data=request.data)
        if serializer.is_valid():
            # Create upload record
            upload = VideoUpload.objects.create(
                user=request.user,
                filename=serializer.validated_data['filename'],
                file_size=serializer.validated_data['file_size'],
                status='pending'
            )
            
            # Create video record
            video = Video.objects.create(
                title=serializer.validated_data['title'],
                description=serializer.validated_data.get('description', ''),
                uploader=request.user,
                visibility=serializer.validated_data.get('visibility', 'private'),
                source_type='upload',
                status='uploading'
            )
            
            upload.video = video
            upload.save()
            
            return Response({
                'success': True,
                'upload_id': upload.id,
                'video_id': video.id,
                'message': 'Video upload initiated successfully',
                'status': 'ready_for_upload'
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class VideoUploadCompleteView(APIView):
    """Mark video upload as complete"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="VideoUploadCompleteView POST")
    def post(self, request, upload_id):
        """Complete video upload"""
        upload = get_object_or_404(VideoUpload, id=upload_id, user=request.user)
        
        if upload.status != 'uploading':
            return Response({'error': 'Upload not in progress'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Mark as completed
        upload.status = 'completed'
        upload.progress_percentage = 100.0
        upload.completed_at = timezone.now()
        upload.save()
        
        # Update video status
        if upload.video:
            upload.video.status = 'processing'
            upload.video.save()
        
        return Response({'status': 'completed'})


class VideoUploadStatusView(generics.RetrieveAPIView):
    """Get upload status"""
    
    queryset = VideoUpload.objects.all()
    serializer_class = VideoUploadSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)


class VideoSearchView(generics.GenericAPIView):
    """Advanced video search"""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = VideoSearchSerializer
    
    @extend_schema(
        summary="Video Search",
        description="Search videos with advanced filters",
        responses={200: VideoSearchSerializer}
    )
    def get(self, request):
        """Search videos with advanced filters"""
        serializer = VideoSearchSerializer(data=request.query_params)
        if serializer.is_valid():
            queryset = Video.objects.filter(status='ready')
            
            # Apply filters
            query = serializer.validated_data.get('query')
            if query:
                queryset = queryset.filter(
                    Q(title__icontains=query) | Q(description__icontains=query)
                )
            
            uploader = serializer.validated_data.get('uploader')
            if uploader:
                queryset = queryset.filter(uploader=uploader)
            
            source_type = serializer.validated_data.get('source_type')
            if source_type:
                queryset = queryset.filter(source_type=source_type)
            
            visibility = serializer.validated_data.get('visibility')
            if visibility:
                queryset = queryset.filter(visibility=visibility)
            
            require_premium = serializer.validated_data.get('require_premium')
            if require_premium is not None:
                queryset = queryset.filter(require_premium=require_premium)
            
            # Apply ordering
            order_by = serializer.validated_data.get('order_by', '-created_at')
            queryset = queryset.order_by(order_by)
            
            # Apply visibility filters
            user = request.user
            if not user.is_authenticated:
                queryset = queryset.filter(visibility='public')
            else:
                queryset = queryset.filter(
                    Q(visibility='public') |
                    Q(uploader=user) |
                    Q(visibility='friends', uploader__in=user.friends.all())
                ).distinct()
            
            # Paginate results
            page_size = min(int(request.query_params.get('page_size', 20)), 100)
            page = int(request.query_params.get('page', 1))
            
            start = (page - 1) * page_size
            end = start + page_size
            
            videos = queryset[start:end]
            serializer = VideoSerializer(videos, many=True, context={'request': request})
            
            return Response({
                'count': queryset.count(),
                'results': serializer.data,
                'page': page,
                'page_size': page_size
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleDriveMoviesView(APIView):
    """Manage movies from Google Drive"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="GoogleDriveMoviesView GET")
    def get(self, request):
        """List movies from user's Google Drive"""
        try:
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return Response({
                    'success': False,
                    'message': 'Google Drive not connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get Drive service
            drive_service = get_drive_service(request.user)
            
            # Get folder ID
            folder_id = request.user.profile.google_drive_folder_id
            
            # List videos from Google Drive
            videos = drive_service.list_videos(folder_id=folder_id)
            
            # Convert to our video format and check if already in database
            movies = []
            for video_data in videos:
                # Check if video already exists in our database
                existing_video = Video.objects.filter(
                    gdrive_file_id=video_data['id'],
                    uploader=request.user
                ).first()
                
                movie_data = {
                    'gdrive_file_id': video_data['id'],
                    'title': video_data['name'],
                    'size': video_data['size'],
                    'mime_type': video_data['mime_type'],
                    'thumbnail_url': video_data['thumbnail_url'],
                    'duration': video_data.get('duration'),
                    'resolution': video_data.get('resolution'),
                    'created_time': video_data['created_time'],
                    'modified_time': video_data['modified_time'],
                    'in_database': existing_video is not None,
                    'video_id': str(existing_video.id) if existing_video else None
                }
                movies.append(movie_data)
            
            return Response({
                'success': True,
                'movies': movies,
                'count': len(movies)
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to list movies: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @extend_schema(summary="GoogleDriveMoviesView POST")
    def post(self, request):
        """Add a Google Drive movie to our database"""
        try:
            gdrive_file_id = request.data.get('gdrive_file_id')
            title = request.data.get('title')
            visibility = request.data.get('visibility', 'private')
            
            if not gdrive_file_id:
                return Response({
                    'success': False,
                    'message': 'Google Drive file ID is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if video already exists
            if Video.objects.filter(gdrive_file_id=gdrive_file_id, uploader=request.user).exists():
                return Response({
                    'success': False,
                    'message': 'Movie already added to your library'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get Drive service
            drive_service = get_drive_service(request.user)
            
            # Get file info from Google Drive
            file_info = drive_service.get_file_info(gdrive_file_id)
            
            # Create video record
            video = Video.objects.create(
                title=title or file_info['name'],
                uploader=request.user,
                source_type='gdrive',
                gdrive_file_id=gdrive_file_id,
                gdrive_download_url=file_info.get('download_url', ''),
                gdrive_mime_type=file_info['mime_type'],
                file_size=file_info['size'],
                visibility=visibility,
                status='ready'
            )
            
            # Extract video metadata if available
            if 'video_metadata' in file_info and file_info['video_metadata']:
                metadata = file_info['video_metadata']
                if 'durationMillis' in metadata:
                    duration_ms = int(metadata['durationMillis'])
                    video.duration = timedelta(milliseconds=duration_ms)
                
                if 'width' in metadata and 'height' in metadata:
                    video.resolution = f"{metadata['width']}x{metadata['height']}"
                
                video.save()
            
            serializer = VideoSerializer(video, context={'request': request})
            
            return Response({
                'success': True,
                'message': 'Movie added successfully',
                'video': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to add movie: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleDriveMovieUploadView(APIView):
    """Upload movies to Google Drive"""
    
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    @extend_schema(summary="GoogleDriveMovieUploadView POST")
    def post(self, request):
        """Upload a movie to Google Drive"""
        try:
            import tempfile
            import os
            
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return Response({
                    'success': False,
                    'message': 'Google Drive not connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            uploaded_file = request.FILES.get('file')
            title = request.data.get('title')
            visibility = request.data.get('visibility', 'private')
            
            if not uploaded_file:
                return Response({
                    'success': False,
                    'message': 'No file provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=f'_{uploaded_file.name}') as temp_file:
                for chunk in uploaded_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            try:
                # Get Drive service
                drive_service = get_drive_service(request.user)
                
                # Get folder ID
                folder_id = request.user.profile.google_drive_folder_id
                
                # Upload to Google Drive
                upload_result = drive_service.upload_file(
                    file_path=temp_file_path,
                    name=title or uploaded_file.name,
                    folder_id=folder_id
                )
                
                # Create video record
                video = Video.objects.create(
                    title=title or uploaded_file.name,
                    uploader=request.user,
                    source_type='gdrive',
                    gdrive_file_id=upload_result['id'],
                    gdrive_mime_type=upload_result['mime_type'],
                    file_size=upload_result['size'],
                    visibility=visibility,
                    status='ready'
                )
                
                serializer = VideoSerializer(video, context={'request': request})
                
                return Response({
                    'success': True,
                    'message': 'Movie uploaded successfully',
                    'video': serializer.data
                }, status=status.HTTP_201_CREATED)
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to upload movie: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleDriveMovieDeleteView(APIView):
    """Delete movies from Google Drive"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="GoogleDriveMovieDeleteView DELETE")
    def delete(self, request, video_id):
        """Delete a movie from Google Drive and our database"""
        try:
            # Get video
            video = get_object_or_404(Video, id=video_id, uploader=request.user, source_type='gdrive')
            
            # Get Drive service
            drive_service = get_drive_service(request.user)
            
            # Delete from Google Drive
            if video.gdrive_file_id:
                success = drive_service.delete_file(video.gdrive_file_id)
                if not success:
                    return Response({
                        'success': False,
                        'message': 'Failed to delete from Google Drive'
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Delete from our database
            video.delete()
            
            return Response({
                'success': True,
                'message': 'Movie deleted successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to delete movie: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleDriveMovieStreamView(APIView):
    """Stream movies from Google Drive"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="GoogleDriveMovieStreamView GET")
    def get(self, request, video_id):
        """Get streaming URL for a Google Drive movie"""
        try:
            # Get video
            video = get_object_or_404(Video, id=video_id, source_type='gdrive')
            
            # Check permissions
            if video.visibility == 'private' and video.uploader != request.user:
                return Response({
                    'success': False,
                    'message': 'Access denied'
                }, status=status.HTTP_403_FORBIDDEN)
            elif video.visibility == 'friends':
                if video.uploader != request.user and not video.uploader.friends.filter(id=request.user.id).exists():
                    return Response({
                        'success': False,
                        'message': 'Access denied'
                    }, status=status.HTTP_403_FORBIDDEN)
            
            # Check premium requirement
            if video.require_premium and not request.user.is_subscription_active:
                return Response({
                    'success': False,
                    'message': 'Premium subscription required'
                }, status=status.HTTP_402_PAYMENT_REQUIRED)
            
            # Get Drive service
            drive_service = get_drive_service(video.uploader)
            
            # Get streaming URL
            streaming_url = drive_service.generate_streaming_url(video.gdrive_file_id)
            
            # Record view
            VideoView.objects.create(
                video=video,
                user=request.user,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')
            )
            
            # Update view count
            Video.objects.filter(id=video.id).update(view_count=F('view_count') + 1)
            
            return Response({
                'success': True,
                'streaming_url': streaming_url,
                'video': VideoDetailSerializer(video, context={'request': request}).data
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to get streaming URL: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR')


class VideoProxyView(APIView):
    """Proxy video requests to avoid CORS issues"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="VideoProxyView GET")
    def get(self, request, video_id):
        """Proxy video stream from Google Drive"""
        try:
            import requests
            from django.http import StreamingHttpResponse
            
            # Get video
            video = get_object_or_404(Video, id=video_id, source_type='gdrive')
            
            # Check permissions (same as streaming view)
            if video.visibility == 'private' and video.uploader != request.user:
                return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            elif video.visibility == 'friends':
                if video.uploader != request.user and not video.uploader.friends.filter(id=request.user.id).exists():
                    return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
            
            # Check premium requirement
            if video.require_premium and not request.user.is_subscription_active:
                return Response({'error': 'Premium subscription required'}, status=status.HTTP_402_PAYMENT_REQUIRED)
            
            # Get Drive service
            drive_service = get_drive_service(video.uploader)
            
            # Get download URL
            download_url = drive_service.get_download_url(video.gdrive_file_id)
            
            # Set up headers for range requests
            headers = {}
            if 'Range' in request.headers:
                headers['Range'] = request.headers['Range']
            
            # Make request to Google Drive
            response = requests.get(download_url, headers=headers, stream=True)
            
            # Create streaming response
            def generate():
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        yield chunk
            
            streaming_response = StreamingHttpResponse(
                generate(),
                content_type=response.headers.get('Content-Type', 'video/mp4'),
                status=response.status_code
            )
            
            # Copy relevant headers
            for header in ['Content-Length', 'Content-Range', 'Accept-Ranges']:
                if header in response.headers:
                    streaming_response[header] = response.headers[header]
            
            return streaming_response
            
        except Exception as e:
            return Response({
                'error': f'Failed to proxy video: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Advanced Video Analytics Endpoints

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def video_analytics(request, video_id):
    """Get comprehensive analytics for a video"""
    video = get_object_or_404(Video, id=video_id)
    
    # Check permissions - only owner or admin can view analytics
    if video.uploader != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from shared.services.video_analytics_service import video_analytics_service
        
        days = int(request.query_params.get('days', 30))
        analytics_data = video_analytics_service.get_video_analytics(video, days)
        
        return Response(analytics_data)
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def video_engagement_heatmap(request, video_id):
    """Get engagement heatmap for video timeline"""
    video = get_object_or_404(Video, id=video_id)
    
    # Check permissions
    if video.uploader != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from shared.services.video_analytics_service import video_analytics_service
        
        heatmap_data = video_analytics_service.get_engagement_heatmap(video)
        
        return Response({
            'video_id': str(video.id),
            'duration': video.duration,
            'heatmap': heatmap_data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get heatmap: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def video_retention_curve(request, video_id):
    """Get viewer retention curve for video"""
    video = get_object_or_404(Video, id=video_id)
    
    # Check permissions
    if video.uploader != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from shared.services.video_analytics_service import video_analytics_service
        
        retention_data = video_analytics_service.get_retention_curve(video)
        
        return Response({
            'video_id': str(video.id),
            'retention_curve': retention_data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get retention curve: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def video_viewer_journey(request, video_id):
    """Get viewer journey analysis for video"""
    video = get_object_or_404(Video, id=video_id)
    
    # Check permissions
    if video.uploader != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from shared.services.video_analytics_service import video_analytics_service
        
        journey_data = video_analytics_service.get_viewer_journey_analysis(video)
        
        return Response({
            'video_id': str(video.id),
            'viewer_journey': journey_data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get viewer journey: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def video_comparative_analytics(request, video_id):
    """Get comparative analytics for video vs channel/platform averages"""
    video = get_object_or_404(Video, id=video_id)
    
    # Check permissions
    if video.uploader != request.user and not request.user.is_staff:
        return Response(
            {'error': 'Permission denied'}, 
            status=status.HTTP_403_FORBIDDEN
        )
    
    try:
        from shared.services.video_analytics_service import video_analytics_service
        
        comparative_data = video_analytics_service.get_comparative_analytics(video)
        
        return Response({
            'video_id': str(video.id),
            'comparative_analytics': comparative_data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get comparative analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAdminUser])
def trending_videos_analytics(request):
    """Get trending videos analysis (admin only)"""
    try:
        from shared.services.video_analytics_service import video_analytics_service
        
        days = int(request.query_params.get('days', 7))
        trending_data = video_analytics_service.get_trending_analysis(days)
        
        return Response({
            'period_days': days,
            'trending_videos': trending_data
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get trending analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def channel_analytics_dashboard(request):
    """Get analytics dashboard for user's channel"""
    user = request.user
    
    try:
        from shared.services.video_analytics_service import video_analytics_service
        from django.db.models import Count, Sum
        
        # Get user's videos
        user_videos = Video.objects.filter(uploader=user)
        
        if not user_videos.exists():
            return Response({
                'message': 'No videos found for this channel',
                'channel_stats': {
                    'total_videos': 0,
                    'total_views': 0,
                    'total_watch_time': 0,
                    'avg_completion_rate': 0
                }
            })
        
        # Calculate channel stats
        channel_stats = {
            'total_videos': user_videos.count(),
            'total_views': VideoView.objects.filter(video__uploader=user).count(),
            'total_watch_time': VideoView.objects.filter(
                video__uploader=user
            ).aggregate(total=Sum('watch_duration'))['total'] or 0,
            'avg_completion_rate': 0  # Calculate based on video durations
        }
        
        # Get top performing videos
        top_videos = user_videos.annotate(
            view_count=Count('videoview')
        ).order_by('-view_count')[:5]
        
        top_videos_data = []
        for video in top_videos:
            video_analytics = video_analytics_service.get_video_analytics(video, 30)
            top_videos_data.append({
                'id': str(video.id),
                'title': video.title,
                'views': video_analytics['metrics']['total_views'],
                'completion_rate': video_analytics['metrics']['completion_rate'],
                'created_at': video.created_at
            })
        
        # Recent performance (last 30 days)
        recent_stats = VideoView.objects.filter(
            video__uploader=user,
            created_at__gte=timezone.now() - timedelta(days=30)
        ).aggregate(
            recent_views=Count('id'),
            recent_watch_time=Sum('watch_duration')
        )
        
        return Response({
            'channel_stats': channel_stats,
            'recent_stats': recent_stats,
            'top_videos': top_videos_data,
            'period': 'last_30_days'
        })
        
    except Exception as e:
        return Response(
            {'error': f'Failed to get channel analytics: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class VideoProcessingStatusView(APIView):
    """Get video processing status"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="VideoProcessingStatusView GET")
    def get(self, request, video_id):
        try:
            video = get_object_or_404(Video, id=video_id)
            
            # Check if user owns the video or is admin
            if video.uploader != request.user and not request.user.is_staff:
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            return Response({
                'video_id': str(video.id),
                'status': video.status,
                'processing_progress': getattr(video, 'processing_progress', 0),
                'processing_stage': getattr(video, 'processing_stage', 'queued'),
                'error_message': getattr(video, 'error_message', None),
                'estimated_completion': getattr(video, 'estimated_completion', None),
                'quality_variants_ready': video.quality_variants.count() if hasattr(video, 'quality_variants') else 0
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to get processing status: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VideoQualityVariantsView(APIView):
    """Get available quality variants for a video"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @extend_schema(summary="VideoQualityVariantsView GET")
    def get(self, request, video_id):
        try:
            video = get_object_or_404(Video, id=video_id)
            
            # Check if user has access to the video
            if video.visibility == 'private' and video.uploader != request.user:
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Return available quality variants
            quality_variants = [
                {
                    'quality': '360p',
                    'url': f'/api/videos/{video_id}/stream/?quality=360p',
                    'available': True  # In a real implementation, check if this quality exists
                },
                {
                    'quality': '480p',
                    'url': f'/api/videos/{video_id}/stream/?quality=480p',
                    'available': True
                },
                {
                    'quality': '720p',
                    'url': f'/api/videos/{video_id}/stream/?quality=720p',
                    'available': True
                },
                {
                    'quality': '1080p',
                    'url': f'/api/videos/{video_id}/stream/?quality=1080p',
                    'available': video.resolution and 'HD' in str(video.resolution)
                }
            ]
            
            return Response({
                'video_id': str(video.id),
                'original_quality': getattr(video, 'resolution', 'Unknown'),
                'quality_variants': quality_variants
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to get quality variants: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RegenerateThumbnailView(APIView):
    """Regenerate video thumbnail"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="RegenerateThumbnailView POST")
    def post(self, request, video_id):
        try:
            video = get_object_or_404(Video, id=video_id)
            
            # Check if user owns the video
            if video.uploader != request.user and not request.user.is_staff:
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            # Trigger thumbnail regeneration
            # In a real implementation, this would queue a task for video processing
            video.thumbnail_generated = False
            video.save()
            
            return Response({
                'message': 'Thumbnail regeneration queued',
                'video_id': str(video.id),
                'status': 'processing'
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to regenerate thumbnail: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VideoShareView(APIView):
    """Generate shareable links for videos"""
    permission_classes = [permissions.IsAuthenticated]
    
    @extend_schema(summary="VideoShareView POST")
    def post(self, request, video_id):
        try:
            video = get_object_or_404(Video, id=video_id)
            
            # Check if user has access to the video
            if video.visibility == 'private' and video.uploader != request.user:
                return Response({
                    'error': 'Permission denied'
                }, status=status.HTTP_403_FORBIDDEN)
            
            share_type = request.data.get('type', 'public')
            expires_in_hours = request.data.get('expires_in_hours', 24)
            
            # Generate share token
            import secrets
            share_token = secrets.token_urlsafe(32)
            
            # In a real implementation, store this in a VideoShare model
            expires_at = timezone.now() + timedelta(hours=expires_in_hours)
            
            share_url = f"{request.build_absolute_uri('/')}share/video/{share_token}"
            
            return Response({
                'share_url': share_url,
                'share_token': share_token,
                'expires_at': expires_at.isoformat(),
                'type': share_type,
                'video_id': str(video.id)
            })
            
        except Exception as e:
            return Response({
                'error': f'Failed to generate share link: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VideoSearchEnhancedView(APIView):
    """Advanced video search with filters"""
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    @extend_schema(summary="VideoSearchEnhancedView GET")
    def get(self, request):
        try:
            query = request.GET.get('q', '')
            category = request.GET.get('category', '')
            duration_min = request.GET.get('duration_min', 0)
            duration_max = request.GET.get('duration_max', 7200)  # 2 hours max
            request.GET.get('quality', '')
            date_from = request.GET.get('date_from', '')
            date_to = request.GET.get('date_to', '')
            sort_by = request.GET.get('sort_by', 'relevance')
            
            # Start with base queryset
            videos = Video.objects.filter(status='ready', visibility='public')
            
            # Apply filters
            if query:
                videos = videos.filter(
                    Q(title__icontains=query) | 
                    Q(description__icontains=query) |
                    Q(uploader__first_name__icontains=query) |
                    Q(uploader__last_name__icontains=query)
                )
            
            if category:
                videos = videos.filter(category=category)
            
            # Duration filter (assuming duration is stored in seconds)
            if duration_min:
                videos = videos.filter(duration__gte=int(duration_min))
            if duration_max:
                videos = videos.filter(duration__lte=int(duration_max))
            
            # Date filters
            if date_from:
                from datetime import datetime
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                videos = videos.filter(created_at__gte=date_from_obj)
            
            if date_to:
                from datetime import datetime
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                videos = videos.filter(created_at__lte=date_to_obj)
            
            # Sorting
            if sort_by == 'newest':
                videos = videos.order_by('-created_at')
            elif sort_by == 'oldest':
                videos = videos.order_by('created_at')
            elif sort_by == 'most_viewed':
                videos = videos.order_by('-view_count')
            elif sort_by == 'most_liked':
                videos = videos.order_by('-like_count')
            elif sort_by == 'duration_short':
                videos = videos.order_by('duration')
            elif sort_by == 'duration_long':
                videos = videos.order_by('-duration')
            else:  # relevance (default)
                if query:
                    # Simple relevance scoring based on title/description matches
                    from django.db.models import Case, When, IntegerField
                    videos = videos.annotate(
                        relevance_score=Case(
                            When(title__icontains=query, then=3),
                            When(description__icontains=query, then=2),
                            default=1,
                            output_field=IntegerField(),
                        )
                    ).order_by('-relevance_score', '-created_at')
            
            # Pagination
            page_size = min(int(request.GET.get('page_size', 20)), 50)  # Max 50 per page
            page = int(request.GET.get('page', 1))
            start = (page - 1) * page_size
            end = start + page_size
            
            total_count = videos.count()
            videos_page = videos[start:end]
            
            # Serialize results
            serializer = VideoSerializer(videos_page, many=True, context={'request': request})
            
            return Response({
                'results': serializer.data,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total_count': total_count,
                    'total_pages': (total_count + page_size - 1) // page_size,
                    'has_next': end < total_count,
                    'has_previous': page > 1
                },
                'filters_applied': {
                    'query': query,
                    'category': category,
                    'duration_range': [duration_min, duration_max],
                    'sort_by': sort_by
                }
            })
            
        except Exception as e:
            return Response({
                'error': f'Search failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

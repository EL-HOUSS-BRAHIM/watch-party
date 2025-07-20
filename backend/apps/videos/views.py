"""
Video views for Watch Party Backend
"""

import uuid
from datetime import timedelta
from django.utils import timezone
from django.db.models import Q, F
from django.http import Http404, FileResponse, HttpResponse
from django.shortcuts import get_object_or_404
from rest_framework import status, generics, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Video, VideoLike, VideoComment, VideoView, VideoUpload
from .serializers import (
    VideoSerializer, VideoDetailSerializer, VideoCreateSerializer,
    VideoUpdateSerializer, VideoCommentSerializer, VideoLikeSerializer,
    VideoUploadSerializer, VideoUploadCreateSerializer, VideoSearchSerializer
)
from utils.permissions import IsOwnerOrReadOnly, IsPremiumUserForPremiumContent


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
                return Response({'liked': False, 'disliked': False})
            else:
                # Update like/dislike
                like_obj.is_like = is_like
                like_obj.save()
        
        # Update like count
        like_count = video.likes.filter(is_like=True).count()
        Video.objects.filter(id=video.id).update(like_count=like_count)
        
        return Response({
            'liked': is_like,
            'disliked': not is_like,
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


class VideoUploadView(APIView):
    """Handle video upload initiation"""
    
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
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
                'upload_id': upload.id,
                'video_id': video.id,
                'status': 'ready_for_upload'
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VideoUploadCompleteView(APIView):
    """Mark video upload as complete"""
    
    permission_classes = [permissions.IsAuthenticated]
    
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


class VideoSearchView(APIView):
    """Advanced video search"""
    
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
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

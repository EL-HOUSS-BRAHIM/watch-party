"""
Movie management views for Google Drive integration
"""

import logging
from typing import Dict, Any
from django.http import JsonResponse, HttpResponse, StreamingHttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from utils.google_drive_service import get_drive_service, GoogleDriveService
from .models import Video
from .serializers import VideoSerializer
import requests
import json

logger = logging.getLogger(__name__)


class MovieListView(APIView):
    """List movies from connected Google Drive"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return Response({
                    'error': 'Google Drive not connected',
                    'message': 'Please connect your Google Drive account first'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get Google Drive service
            drive_service = get_drive_service(request.user)
            
            # Get query parameters
            folder_id = request.GET.get('folder_id', request.user.profile.google_drive_folder_id)
            page_size = min(int(request.GET.get('page_size', 50)), 100)
            
            # List videos from Google Drive
            videos = drive_service.list_videos(folder_id=folder_id, page_size=page_size)
            
            return Response({
                'movies': videos,
                'count': len(videos),
                'folder_id': folder_id
            })
            
        except Exception as e:
            logger.error(f"Error listing movies for user {request.user.id}: {str(e)}")
            return Response({
                'error': 'Failed to fetch movies',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MovieDetailView(APIView):
    """Get detailed information about a specific movie"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, file_id):
        try:
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return Response({
                    'error': 'Google Drive not connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get Google Drive service
            drive_service = get_drive_service(request.user)
            
            # Get file information
            file_info = drive_service.get_file_info(file_id)
            
            return Response({
                'movie': file_info
            })
            
        except Exception as e:
            logger.error(f"Error getting movie details for file {file_id}: {str(e)}")
            return Response({
                'error': 'Failed to fetch movie details',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MovieUploadView(APIView):
    """Upload movie to Google Drive"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return Response({
                    'error': 'Google Drive not connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get uploaded file
            if 'file' not in request.FILES:
                return Response({
                    'error': 'No file provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            uploaded_file = request.FILES['file']
            
            # Validate file type
            allowed_extensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.quicktime']
            if not any(uploaded_file.name.lower().endswith(ext) for ext in allowed_extensions):
                return Response({
                    'error': 'Invalid file type',
                    'message': 'Only video files are allowed'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get Google Drive service
            drive_service = get_drive_service(request.user)
            
            # Get or create Watch Party folder
            folder_id = drive_service.get_or_create_watch_party_folder()
            
            # Save file temporarily
            import tempfile
            import os
            
            with tempfile.NamedTemporaryFile(delete=False, suffix=uploaded_file.name) as temp_file:
                for chunk in uploaded_file.chunks():
                    temp_file.write(chunk)
                temp_file_path = temp_file.name
            
            try:
                # Upload to Google Drive
                result = drive_service.upload_file(
                    file_path=temp_file_path,
                    name=uploaded_file.name,
                    folder_id=folder_id
                )
                
                # Create video record in database
                video = Video.objects.create(
                    title=uploaded_file.name.rsplit('.', 1)[0],
                    uploader=request.user,
                    source_type='gdrive',
                    gdrive_file_id=result['id'],
                    file_size=result['size'],
                    gdrive_mime_type=result['mime_type'],
                    status='ready'
                )
                
                # Update user's folder ID if not set
                if not request.user.profile.google_drive_folder_id:
                    request.user.profile.google_drive_folder_id = folder_id
                    request.user.profile.save()
                
                return Response({
                    'message': 'Movie uploaded successfully',
                    'movie': {
                        'id': result['id'],
                        'name': result['name'],
                        'size': result['size'],
                        'mime_type': result['mime_type']
                    },
                    'video_id': str(video.id)
                })
                
            finally:
                # Clean up temporary file
                if os.path.exists(temp_file_path):
                    os.unlink(temp_file_path)
                    
        except Exception as e:
            logger.error(f"Error uploading movie for user {request.user.id}: {str(e)}")
            return Response({
                'error': 'Failed to upload movie',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MovieDeleteView(APIView):
    """Delete movie from Google Drive"""
    permission_classes = [IsAuthenticated]
    
    def delete(self, request, file_id):
        try:
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return Response({
                    'error': 'Google Drive not connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get Google Drive service
            drive_service = get_drive_service(request.user)
            
            # Delete file from Google Drive
            success = drive_service.delete_file(file_id)
            
            if success:
                # Also delete from local database if exists
                Video.objects.filter(
                    gdrive_file_id=file_id,
                    uploader=request.user
                ).delete()
                
                return Response({
                    'message': 'Movie deleted successfully'
                })
            else:
                return Response({
                    'error': 'Failed to delete movie'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except Exception as e:
            logger.error(f"Error deleting movie {file_id} for user {request.user.id}: {str(e)}")
            return Response({
                'error': 'Failed to delete movie',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MovieStreamView(APIView):
    """Stream movie content with proxy to avoid backend resource usage"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, file_id):
        try:
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return Response({
                    'error': 'Google Drive not connected'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Get Google Drive service
            drive_service = get_drive_service(request.user)
            
            # Get streaming URL
            streaming_url = drive_service.generate_streaming_url(file_id)
            
            # For development, return the URL for client-side streaming
            # In production, you might want to proxy the content
            return Response({
                'streaming_url': streaming_url,
                'file_id': file_id
            })
            
        except Exception as e:
            logger.error(f"Error getting streaming URL for file {file_id}: {str(e)}")
            return Response({
                'error': 'Failed to get streaming URL',
                'message': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MovieProxyView(APIView):
    """Proxy movie stream to minimize backend resource usage"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request, file_id):
        try:
            # Check if user has Google Drive connected
            if not hasattr(request.user, 'profile') or not request.user.profile.google_drive_connected:
                return HttpResponse("Unauthorized", status=401)
            
            # Get Google Drive service
            drive_service = get_drive_service(request.user)
            
            # Get download URL
            download_url = drive_service.get_download_url(file_id)
            
            # Handle range requests for video streaming
            range_header = request.META.get('HTTP_RANGE')
            
            if range_header:
                # Parse range header
                range_match = re.match(r'bytes=(\d+)-(\d*)', range_header)
                if range_match:
                    start_byte = int(range_match.group(1))
                    end_byte = range_match.group(2)
                    end_byte = int(end_byte) if end_byte else None
                    
                    headers = {'Range': f'bytes={start_byte}-{end_byte or ""}'}
                else:
                    headers = {}
            else:
                headers = {}
            
            # Make request to Google Drive
            response = requests.get(download_url, headers=headers, stream=True)
            
            # Create streaming response
            def generate():
                for chunk in response.iter_content(chunk_size=8192):
                    if chunk:
                        yield chunk
            
            # Create HTTP response
            http_response = StreamingHttpResponse(
                generate(),
                content_type=response.headers.get('Content-Type', 'video/mp4')
            )
            
            # Copy relevant headers
            if 'Content-Length' in response.headers:
                http_response['Content-Length'] = response.headers['Content-Length']
            if 'Content-Range' in response.headers:
                http_response['Content-Range'] = response.headers['Content-Range']
            if range_header:
                http_response.status_code = 206  # Partial Content
            
            # Add CORS headers
            http_response['Access-Control-Allow-Origin'] = '*'
            http_response['Access-Control-Allow-Headers'] = 'Range'
            
            return http_response
            
        except Exception as e:
            logger.error(f"Error proxying movie {file_id}: {str(e)}")
            return HttpResponse("Internal Server Error", status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def connect_google_drive(request):
    """Connect user's Google Drive account"""
    try:
        data = request.data
        access_token = data.get('access_token')
        refresh_token = data.get('refresh_token')
        
        if not access_token:
            return Response({
                'error': 'Access token required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Test the connection
        try:
            drive_service = GoogleDriveService(access_token, refresh_token)
            # Try to create/get the Watch Party folder
            folder_id = drive_service.get_or_create_watch_party_folder()
        except Exception as e:
            return Response({
                'error': 'Failed to connect to Google Drive',
                'message': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Update user profile
        profile = request.user.profile
        profile.google_drive_token = access_token
        profile.google_drive_refresh_token = refresh_token or ''
        profile.google_drive_connected = True
        profile.google_drive_folder_id = folder_id
        profile.save()
        
        return Response({
            'message': 'Google Drive connected successfully',
            'folder_id': folder_id
        })
        
    except Exception as e:
        logger.error(f"Error connecting Google Drive for user {request.user.id}: {str(e)}")
        return Response({
            'error': 'Failed to connect Google Drive',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def disconnect_google_drive(request):
    """Disconnect user's Google Drive account"""
    try:
        # Update user profile
        profile = request.user.profile
        profile.google_drive_token = ''
        profile.google_drive_refresh_token = ''
        profile.google_drive_connected = False
        profile.google_drive_folder_id = ''
        profile.save()
        
        return Response({
            'message': 'Google Drive disconnected successfully'
        })
        
    except Exception as e:
        logger.error(f"Error disconnecting Google Drive for user {request.user.id}: {str(e)}")
        return Response({
            'error': 'Failed to disconnect Google Drive',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_status(request):
    """Get Google Drive connection status"""
    try:
        profile = getattr(request.user, 'profile', None)
        
        if not profile:
            return Response({
                'connected': False,
                'folder_id': None
            })
        
        return Response({
            'connected': profile.google_drive_connected,
            'folder_id': profile.google_drive_folder_id
        })
        
    except Exception as e:
        logger.error(f"Error getting Google Drive status for user {request.user.id}: {str(e)}")
        return Response({
            'error': 'Failed to get Google Drive status',
            'message': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

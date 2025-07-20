import logging
from datetime import timedelta
from typing import Dict

from django.conf import settings
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.utils import timezone
from django.urls import reverse
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiResponse
from drf_spectacular.types import OpenApiTypes

from .models import (
    ExternalService, UserServiceConnection, GoogleDriveFile,
    AWSS3Configuration, SocialOAuthProvider
)
from .services.google_drive import GoogleDriveService
from .services.aws_s3 import AWSS3Service
from .services.social_oauth import SocialOAuthService

User = get_user_model()
logger = logging.getLogger(__name__)


# ============================================================================
# GOOGLE DRIVE INTEGRATION VIEWS
# ============================================================================

@extend_schema(
    summary="Get Google Drive authorization URL",
    description="Generate OAuth2 authorization URL for Google Drive integration",
    parameters=[
        OpenApiParameter(
            name="redirect_uri",
            type=OpenApiTypes.URI,
            location=OpenApiParameter.QUERY,
            description="Redirect URI after authorization"
        )
    ],
    responses={
        200: OpenApiResponse(description="Authorization URL generated successfully"),
        400: OpenApiResponse(description="Invalid request parameters")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_auth_url(request):
    """Get Google Drive OAuth authorization URL"""
    try:
        redirect_uri = request.GET.get('redirect_uri')
        if not redirect_uri:
            return Response(
                {'error': 'redirect_uri parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate state for security
        state = f"user_{request.user.id}_{timezone.now().timestamp()}"
        
        drive_service = GoogleDriveService()
        auth_url = drive_service.get_oauth_url(redirect_uri, state)
        
        return Response({
            'auth_url': auth_url,
            'state': state
        })
        
    except Exception as e:
        logger.error(f"Error generating Google Drive auth URL: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Complete Google Drive OAuth",
    description="Exchange authorization code for access tokens and create connection",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'code': {'type': 'string'},
                'redirect_uri': {'type': 'string'},
                'state': {'type': 'string'}
            },
            'required': ['code', 'redirect_uri']
        }
    },
    responses={
        200: OpenApiResponse(description="Connection created successfully"),
        400: OpenApiResponse(description="Invalid authorization code or parameters"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def google_drive_oauth_callback(request):
    """Handle Google Drive OAuth callback"""
    try:
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        state = request.data.get('state')
        
        if not code or not redirect_uri:
            return Response(
                {'error': 'code and redirect_uri are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify state if provided
        if state and not state.startswith(f"user_{request.user.id}_"):
            return Response(
                {'error': 'Invalid state parameter'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Exchange code for tokens
        drive_service = GoogleDriveService()
        token_data = drive_service.exchange_code_for_tokens(code, redirect_uri)
        
        # Get user info
        user_service = GoogleDriveService(None)
        user_service.service = drive_service.service
        user_info = user_service.get_user_info()
        
        # Get or create external service
        service, _ = ExternalService.objects.get_or_create(
            name='google_drive',
            defaults={'is_active': True}
        )
        
        # Create or update connection
        connection, created = UserServiceConnection.objects.get_or_create(
            user=request.user,
            service=service,
            defaults={
                'access_token': token_data.get('access_token'),
                'refresh_token': token_data.get('refresh_token'),
                'external_user_id': user_info.get('id'),
                'external_username': user_info.get('name', ''),
                'external_email': user_info.get('email', ''),
                'is_connected': True,
                'is_active': True,
            }
        )
        
        if not created:
            # Update existing connection
            connection.access_token = token_data.get('access_token')
            connection.refresh_token = token_data.get('refresh_token')
            connection.is_connected = True
            connection.last_sync_at = timezone.now()
        
        # Set token expiration
        if token_data.get('expires_in'):
            expires_in = int(token_data['expires_in'])
            connection.token_expires_at = timezone.now() + timedelta(seconds=expires_in)
        
        connection.metadata = {
            'user_info': user_info,
            'token_type': token_data.get('token_type', 'Bearer')
        }
        connection.save()
        
        return Response({
            'success': True,
            'connection_id': connection.id,
            'user_info': user_info,
            'created': created
        })
        
    except Exception as e:
        logger.error(f"Error in Google Drive OAuth callback: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="List Google Drive files",
    description="List video files from user's Google Drive",
    parameters=[
        OpenApiParameter('page_size', OpenApiTypes.INT, description="Number of files per page"),
        OpenApiParameter('page_token', OpenApiTypes.STR, description="Next page token"),
        OpenApiParameter('query', OpenApiTypes.STR, description="Search query")
    ],
    responses={
        200: OpenApiResponse(description="Files listed successfully"),
        404: OpenApiResponse(description="Google Drive connection not found"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_list_files(request):
    """List files from Google Drive"""
    try:
        # Get user's Google Drive connection
        try:
            service = ExternalService.objects.get(name='google_drive')
            connection = UserServiceConnection.objects.get(
                user=request.user,
                service=service,
                is_connected=True
            )
        except (ExternalService.DoesNotExist, UserServiceConnection.DoesNotExist):
            return Response(
                {'error': 'Google Drive not connected'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Initialize service
        drive_service = GoogleDriveService(connection)
        
        # Get parameters
        page_size = int(request.GET.get('page_size', 50))
        page_token = request.GET.get('page_token')
        query = request.GET.get('query')
        
        # List files
        result = drive_service.list_files(
            page_size=page_size,
            page_token=page_token,
            query=query
        )
        
        return Response(result)
        
    except Exception as e:
        logger.error(f"Error listing Google Drive files: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Get Google Drive file streaming URL",
    description="Get streaming URL for a specific Google Drive file",
    parameters=[
        OpenApiParameter('file_id', OpenApiTypes.STR, OpenApiParameter.PATH),
        OpenApiParameter('force_refresh', OpenApiTypes.BOOL, description="Force refresh cached URL")
    ],
    responses={
        200: OpenApiResponse(description="Streaming URL generated successfully"),
        404: OpenApiResponse(description="File or connection not found"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_streaming_url(request, file_id):
    """Get streaming URL for Google Drive file"""
    try:
        # Get connection
        try:
            service = ExternalService.objects.get(name='google_drive')
            connection = UserServiceConnection.objects.get(
                user=request.user,
                service=service,
                is_connected=True
            )
        except (ExternalService.DoesNotExist, UserServiceConnection.DoesNotExist):
            return Response(
                {'error': 'Google Drive not connected'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        drive_service = GoogleDriveService(connection)
        force_refresh = request.GET.get('force_refresh', 'false').lower() == 'true'
        
        streaming_url = drive_service.get_streaming_url(file_id, force_refresh)
        file_info = drive_service.get_file_info(file_id)
        
        return Response({
            'streaming_url': streaming_url,
            'file_info': file_info
        })
        
    except Exception as e:
        logger.error(f"Error getting streaming URL: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# AWS S3 INTEGRATION VIEWS
# ============================================================================

@extend_schema(
    summary="Generate S3 presigned upload URL",
    description="Generate presigned URL for direct file upload to S3",
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'file_name': {'type': 'string'},
                'content_type': {'type': 'string'},
                'folder': {'type': 'string'},
                'max_file_size': {'type': 'integer'}
            },
            'required': ['file_name', 'content_type']
        }
    },
    responses={
        200: OpenApiResponse(description="Upload URL generated successfully"),
        400: OpenApiResponse(description="Invalid request parameters"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def s3_presigned_upload_url(request):
    """Generate presigned upload URL for S3"""
    try:
        file_name = request.data.get('file_name')
        content_type = request.data.get('content_type')
        folder = request.data.get('folder', f'user_{request.user.id}')
        max_file_size = request.data.get('max_file_size')
        
        if not file_name or not content_type:
            return Response(
                {'error': 'file_name and content_type are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize S3 service
        s3_service = AWSS3Service()
        
        # Generate presigned URL
        result = s3_service.generate_presigned_upload_url(
            file_name=file_name,
            content_type=content_type,
            folder=folder,
            max_file_size=max_file_size
        )
        
        return Response(result)
        
    except Exception as e:
        logger.error(f"Error generating S3 upload URL: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Upload file to S3",
    description="Upload file directly to S3 storage",
    request={'multipart/form-data': {'type': 'object'}},
    responses={
        200: OpenApiResponse(description="File uploaded successfully"),
        400: OpenApiResponse(description="Invalid file or parameters"),
        500: OpenApiResponse(description="Upload failed")
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def s3_upload_file(request):
    """Upload file to S3"""
    try:
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response(
                {'error': 'No file provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        folder = request.data.get('folder', f'user_{request.user.id}')
        make_public = request.data.get('make_public', 'false').lower() == 'true'
        
        # Initialize S3 service
        s3_service = AWSS3Service()
        
        # Upload file
        result = s3_service.upload_file(
            file_obj=file_obj,
            file_name=file_obj.name,
            content_type=file_obj.content_type,
            folder=folder,
            make_public=make_public
        )
        
        return Response(result)
        
    except Exception as e:
        logger.error(f"Error uploading file to S3: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Generate S3 streaming URL",
    description="Generate presigned URL for streaming file from S3",
    parameters=[
        OpenApiParameter('file_key', OpenApiTypes.STR, OpenApiParameter.PATH),
        OpenApiParameter('expiration', OpenApiTypes.INT, description="URL expiration in seconds")
    ],
    responses={
        200: OpenApiResponse(description="Streaming URL generated successfully"),
        404: OpenApiResponse(description="File not found"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def s3_streaming_url(request, file_key):
    """Generate streaming URL for S3 file"""
    try:
        expiration = int(request.GET.get('expiration', 3600))
        
        # Initialize S3 service
        s3_service = AWSS3Service()
        
        # Check if file exists
        file_info = s3_service.get_file_info(file_key)
        if not file_info:
            return Response(
                {'error': 'File not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Generate streaming URL
        streaming_url = s3_service.generate_streaming_url(
            file_key=file_key,
            expiration=expiration
        )
        
        return Response({
            'streaming_url': streaming_url,
            'file_info': file_info,
            'expires_in': expiration
        })
        
    except Exception as e:
        logger.error(f"Error generating S3 streaming URL: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# SOCIAL OAUTH INTEGRATION VIEWS
# ============================================================================

@extend_schema(
    summary="Get social OAuth authorization URL",
    description="Generate authorization URL for social login providers",
    parameters=[
        OpenApiParameter('provider', OpenApiTypes.STR, OpenApiParameter.PATH,
                        description="OAuth provider (google, discord, github)"),
        OpenApiParameter('redirect_uri', OpenApiTypes.URI, OpenApiParameter.QUERY),
        OpenApiParameter('state', OpenApiTypes.STR, OpenApiParameter.QUERY)
    ],
    responses={
        200: OpenApiResponse(description="Authorization URL generated"),
        400: OpenApiResponse(description="Invalid provider or parameters"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['GET'])
def social_oauth_auth_url(request, provider):
    """Get social OAuth authorization URL"""
    try:
        redirect_uri = request.GET.get('redirect_uri')
        if not redirect_uri:
            return Response(
                {'error': 'redirect_uri parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        state = request.GET.get('state') or f"provider_{provider}_{timezone.now().timestamp()}"
        
        # Initialize OAuth service
        oauth_service = SocialOAuthService(provider)
        auth_url = oauth_service.get_authorization_url(redirect_uri, state)
        
        return Response({
            'auth_url': auth_url,
            'provider': provider,
            'state': state
        })
        
    except ValueError as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        logger.error(f"Error generating social OAuth URL: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Complete social OAuth",
    description="Exchange authorization code for tokens and create/login user",
    parameters=[
        OpenApiParameter('provider', OpenApiTypes.STR, OpenApiParameter.PATH)
    ],
    request={
        'application/json': {
            'type': 'object',
            'properties': {
                'code': {'type': 'string'},
                'redirect_uri': {'type': 'string'},
                'state': {'type': 'string'}
            },
            'required': ['code', 'redirect_uri']
        }
    },
    responses={
        200: OpenApiResponse(description="OAuth completed successfully"),
        400: OpenApiResponse(description="Invalid code or parameters"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['POST'])
def social_oauth_callback(request, provider):
    """Handle social OAuth callback"""
    try:
        code = request.data.get('code')
        redirect_uri = request.data.get('redirect_uri')
        
        if not code or not redirect_uri:
            return Response(
                {'error': 'code and redirect_uri are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Initialize OAuth service
        oauth_service = SocialOAuthService(provider)
        
        # Exchange code for tokens
        token_data = oauth_service.exchange_code_for_tokens(code, redirect_uri)
        
        # Get user information
        user_data = oauth_service.get_user_info(token_data['access_token'])
        
        # Create or get user (simplified - you might want more sophisticated user matching)
        user = None
        if request.user.is_authenticated:
            # Connecting to existing account
            user = request.user
        else:
            # Try to find existing user by email
            email = user_data.get('email')
            if email:
                try:
                    user = User.objects.get(email=email)
                except User.DoesNotExist:
                    # Create new user
                    user = User.objects.create_user(
                        username=user_data.get('username') or user_data.get('email'),
                        email=email,
                        first_name=user_data.get('first_name', ''),
                        last_name=user_data.get('last_name', '')
                    )
        
        if not user:
            return Response(
                {'error': 'Unable to create or find user'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create service connection
        connection = SocialOAuthService.create_connection(
            user=user,
            provider=provider,
            token_data=token_data,
            user_data=user_data
        )
        
        # Generate JWT tokens for the user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'success': True,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            },
            'connection_id': connection.id,
            'provider': provider,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        })
        
    except Exception as e:
        logger.error(f"Error in social OAuth callback: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# GENERAL INTEGRATION VIEWS
# ============================================================================

@extend_schema(
    summary="List user's service connections",
    description="Get all external service connections for the current user",
    responses={
        200: OpenApiResponse(description="Connections listed successfully"),
        401: OpenApiResponse(description="Authentication required")
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_connections(request):
    """List user's external service connections"""
    try:
        connections = UserServiceConnection.objects.filter(
            user=request.user,
            is_active=True
        ).select_related('service')
        
        connections_data = []
        for conn in connections:
            connections_data.append({
                'id': conn.id,
                'service': conn.service.name,
                'service_display': conn.service.get_name_display(),
                'is_connected': conn.is_connected,
                'external_username': conn.external_username,
                'external_email': conn.external_email,
                'last_sync_at': conn.last_sync_at,
                'created_at': conn.created_at
            })
        
        return Response({'connections': connections_data})
        
    except Exception as e:
        logger.error(f"Error listing user connections: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@extend_schema(
    summary="Disconnect external service",
    description="Disconnect and revoke access to an external service",
    parameters=[
        OpenApiParameter('connection_id', OpenApiTypes.INT, OpenApiParameter.PATH)
    ],
    responses={
        200: OpenApiResponse(description="Service disconnected successfully"),
        404: OpenApiResponse(description="Connection not found"),
        500: OpenApiResponse(description="Internal server error")
    }
)
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disconnect_service(request, connection_id):
    """Disconnect external service"""
    try:
        connection = UserServiceConnection.objects.get(
            id=connection_id,
            user=request.user
        )
        
        # Try to revoke tokens if it's an OAuth connection
        service_name = connection.service.name
        
        if 'oauth' in service_name and connection.access_token:
            try:
                if 'google' in service_name:
                    oauth_service = SocialOAuthService('google')
                    oauth_service.revoke_access_token(connection.access_token)
                elif 'discord' in service_name:
                    oauth_service = SocialOAuthService('discord')
                    oauth_service.revoke_access_token(connection.access_token)
                elif 'github' in service_name:
                    oauth_service = SocialOAuthService('github')
                    oauth_service.revoke_access_token(connection.access_token)
            except Exception as e:
                logger.warning(f"Failed to revoke token: {str(e)}")
        
        # Mark as disconnected
        connection.is_connected = False
        connection.access_token = ''
        connection.refresh_token = ''
        connection.token_expires_at = None
        connection.save()
        
        return Response({'success': True})
        
    except UserServiceConnection.DoesNotExist:
        return Response(
            {'error': 'Connection not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error disconnecting service: {str(e)}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

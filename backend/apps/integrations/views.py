"""
Integration management views for admin panel
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from rest_framework import serializers, status
from django.urls import reverse
from django.utils import timezone
from drf_spectacular.utils import extend_schema
import asyncio

from shared.responses import StandardResponse
from shared.api_documentation import api_response_documentation
from shared.integrations import integration_manager, IntegrationType
from apps.authentication.views import GoogleDriveAuthView
from apps.integrations.services import GoogleDriveService, get_drive_service_for_user
from .serializers import IntegrationStatusResponseSerializer, IntegrationManagementResponseSerializer


@api_view(['GET'])
@permission_classes([AllowAny])
def integration_health(request):
    """Public health check endpoint for integrations"""
    return StandardResponse.success({
        'status': 'healthy',
        'service': 'integrations',
        'timestamp': timezone.now().isoformat()
    }, "Integration service is healthy")


class IntegrationStatusView(APIView):
    """
    View to check status of all integrations
    """
    serializer_class = serializers.Serializer
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary="IntegrationStatusView GET",
        responses={200: IntegrationStatusResponseSerializer}
    )
    def get(self, request):
        """Get status of all integrations"""
        
        async def get_status():
            """Async function to get integration status"""
            # Test all integrations
            test_results = await integration_manager.test_all_integrations()
            
            # Get capabilities
            capabilities = await integration_manager.get_integration_capabilities()
            
            return test_results, capabilities
        
        try:
            # Run async function
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            test_results, capabilities = loop.run_until_complete(get_status())
            loop.close()
            
            # Organize results
            integrations_status = []
            for name, config in integration_manager.configs.items():
                status = {
                    'name': name,
                    'type': config.type.value,
                    'enabled': config.enabled,
                    'healthy': test_results.get(name, False),
                    'rate_limit': config.rate_limit,
                    'base_url': config.base_url,
                    'capabilities': capabilities.get(name, []),
                    'last_checked': timezone.now().isoformat()
                }
                integrations_status.append(status)
            
            # Summary statistics
            total_integrations = len(integrations_status)
            healthy_integrations = sum(1 for status in integrations_status if status['healthy'])
            enabled_integrations = sum(1 for status in integrations_status if status['enabled'])
            
            summary = {
                'total': total_integrations,
                'healthy': healthy_integrations,
                'enabled': enabled_integrations,
                'health_percentage': (healthy_integrations / total_integrations * 100) if total_integrations > 0 else 0
            }
            
            response_data = {
                'summary': summary,
                'integrations': integrations_status,
                'types_available': [t.value for t in IntegrationType],
                'last_updated': timezone.now().isoformat()
            }
            
            return StandardResponse.success(response_data, "Integration status retrieved")
            
        except Exception as e:
            return StandardResponse.error(f"Failed to get integration status: {str(e)}")


class IntegrationManagementView(APIView):
    """
    View to manage integrations (enable/disable, configure)
    """
    serializer_class = serializers.Serializer
    permission_classes = [IsAdminUser]
    
    @extend_schema(
        summary="IntegrationManagementView POST",
        responses={200: IntegrationManagementResponseSerializer}
    )
    def post(self, request):
        """Update integration configuration"""
        integration_name = request.data.get('integration_name')
        action = request.data.get('action')  # enable, disable, configure
        config_updates = request.data.get('config', {})
        
        if not integration_name or not action:
            return StandardResponse.error("integration_name and action are required")
        
        if integration_name not in integration_manager.configs:
            return StandardResponse.error(f"Integration {integration_name} not found")
        
        try:
            config = integration_manager.configs[integration_name]
            
            if action == 'enable':
                config.enabled = True
                message = f"Integration {integration_name} enabled"
            
            elif action == 'disable':
                config.enabled = False
                message = f"Integration {integration_name} disabled"
            
            elif action == 'configure':
                # Update configuration
                if 'rate_limit' in config_updates:
                    config.rate_limit = config_updates['rate_limit']
                if 'timeout' in config_updates:
                    config.timeout = config_updates['timeout']
                if 'base_url' in config_updates:
                    config.base_url = config_updates['base_url']
                
                message = f"Integration {integration_name} configuration updated"
            
            else:
                return StandardResponse.error(f"Unknown action: {action}")
            
            # Update the integration in the manager
            integration_manager.configs[integration_name] = config
            
            return StandardResponse.success({
                'integration_name': integration_name,
                'action': action,
                'config': {
                    'enabled': config.enabled,
                    'rate_limit': config.rate_limit,
                    'timeout': config.timeout
                }
            }, message)
            
        except Exception as e:
            return StandardResponse.error(f"Failed to update integration: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAdminUser])
def test_integration(request):
    """Test a specific integration"""
    integration_name = request.data.get('integration_name')
    
    if not integration_name:
        return StandardResponse.error("integration_name is required")
    
    if integration_name not in integration_manager.integrations:
        return StandardResponse.error(f"Integration {integration_name} not found")
    
    async def test_connection():
        """Test the integration connection"""
        integration = integration_manager.integrations[integration_name]
        async with integration:
            return await integration.test_connection()
    
    try:
        # Run async test
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(test_connection())
        loop.close()
        
        return StandardResponse.success({
            'integration_name': integration_name,
            'healthy': result,
            'tested_at': timezone.now().isoformat()
        }, f"Integration {integration_name} test completed")
        
    except Exception as e:
        return StandardResponse.error(f"Integration test failed: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def integration_types(request):
    """Get available integration types"""
    types = [
        {
            'value': t.value,
            'name': t.name,
            'description': {
                'streaming': 'Video streaming and content platforms',
                'social': 'Social media platforms',
                'payment': 'Payment processing services',
                'analytics': 'Analytics and tracking services',
                'content': 'Content management and CDN services',
                'notification': 'Push notification and messaging services'
            }.get(t.value, 'Unknown integration type')
        }
        for t in IntegrationType
    ]
    
    return StandardResponse.success({
        'types': types,
        'total_types': len(types)
    }, "Integration types retrieved")


# Google Drive Integration Views
GOOGLE_DRIVE_SCOPES = [
    'https://www.googleapis.com/auth/drive.readonly',
    'https://www.googleapis.com/auth/drive.file'
]


def _build_drive_flow(request):
    """Create an OAuth flow configured for the integrations callback."""
    from google_auth_oauthlib.flow import Flow  # Imported lazily for easier testing

    client_config = GoogleDriveAuthView._build_client_config()
    flow = Flow.from_client_config(client_config, scopes=GOOGLE_DRIVE_SCOPES)
    redirect_uri = request.build_absolute_uri(
        reverse('integrations:google_drive_oauth_callback')
    )
    flow.redirect_uri = redirect_uri
    return flow, redirect_uri


def _persist_profile_credentials(profile, credentials, folder_id=None):
    """Persist credential details and folder information on the user profile."""
    profile.google_drive_token = getattr(credentials, 'token', '') or ''
    refresh_token = getattr(credentials, 'refresh_token', None)
    if refresh_token:
        profile.google_drive_refresh_token = refresh_token

    expiry = getattr(credentials, 'expiry', None)
    if expiry and timezone.is_naive(expiry):
        expiry = timezone.make_aware(expiry)
    profile.google_drive_token_expires_at = expiry

    if folder_id is not None:
        profile.google_drive_folder_id = folder_id or ''

    profile.google_drive_connected = True
    profile.save()


def _get_or_create_profile(user):
    """Ensure the authenticated user has an associated profile."""
    profile = getattr(user, 'profile', None)
    if profile is None:
        from apps.authentication.models import UserProfile

        profile = UserProfile.objects.create(user=user)
    return profile


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_auth_url(request):
    """Get Google Drive OAuth authorization URL"""
    try:
        flow, redirect_uri = _build_drive_flow(request)

        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )

        request.session['google_drive_oauth_state'] = state

        connected = False
        folder_id = None
        if hasattr(request.user, 'profile'):
            connected = request.user.profile.google_drive_connected
            folder_id = request.user.profile.google_drive_folder_id

        data = {
            'authorization_url': authorization_url,
            'state': state,
            'redirect_uri': redirect_uri,
            'connected': connected,
            'folder_id': folder_id,
        }

        return StandardResponse.success(
            data,
            "Google Drive authorization URL generated"
        )
    except ValueError as exc:
        return StandardResponse.error(
            message=str(exc),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as exc:
        return StandardResponse.error(
            message=f"Failed to generate authorization URL: {exc}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_oauth_callback(request):
    """Handle Google Drive OAuth callback"""
    try:
        code = request.query_params.get('code')
        state = request.query_params.get('state')

        if not code:
            return StandardResponse.error(
                message='Authorization code is required',
                status_code=status.HTTP_400_BAD_REQUEST
            )

        stored_state = request.session.get('google_drive_oauth_state')
        if not stored_state or stored_state != state:
            return StandardResponse.error(
                message='Invalid state parameter',
                status_code=status.HTTP_400_BAD_REQUEST
            )

        flow, _ = _build_drive_flow(request)
        flow.fetch_token(code=code)

        credentials = flow.credentials

        profile = _get_or_create_profile(request.user)

        def _update_credentials(updated_credentials):
            _persist_profile_credentials(profile, updated_credentials)

        drive_service = GoogleDriveService(
            access_token=getattr(credentials, 'token', None),
            refresh_token=getattr(credentials, 'refresh_token', None),
            token_expiry=getattr(credentials, 'expiry', None),
            on_credentials_updated=_update_credentials
        )

        folder_id = drive_service.get_or_create_watch_party_folder()

        _persist_profile_credentials(profile, credentials, folder_id=folder_id)

        if 'google_drive_oauth_state' in request.session:
            del request.session['google_drive_oauth_state']

        data = {
            'connected': profile.google_drive_connected,
            'folder_id': profile.google_drive_folder_id,
            'token_expires_at': (
                profile.google_drive_token_expires_at.isoformat()
                if profile.google_drive_token_expires_at
                else None
            ),
        }

        return StandardResponse.success(
            data,
            "Google Drive connected successfully"
        )
    except ValueError as exc:
        return StandardResponse.error(
            message=str(exc),
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as exc:
        return StandardResponse.error(
            message=f"Failed to connect Google Drive: {exc}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_list_files(request):
    """List files from Google Drive"""
    folder_id = request.query_params.get('folder_id')
    mime_type = request.query_params.get('mime_type')

    if not folder_id and hasattr(request.user, 'profile'):
        folder_id = request.user.profile.google_drive_folder_id or None

    try:
        drive_service = get_drive_service_for_user(request.user)
    except ValueError as exc:
        return StandardResponse.error(
            message=str(exc),
            status_code=status.HTTP_400_BAD_REQUEST
        )
    except Exception as exc:
        return StandardResponse.error(
            message=f"Failed to load Google Drive credentials: {exc}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        results = drive_service.list_files(folder_id=folder_id, mime_type=mime_type)
        files = results.get('files', [])
        if folder_id and hasattr(request.user, 'profile'):
            profile = request.user.profile
            if profile.google_drive_folder_id != folder_id:
                profile.google_drive_folder_id = folder_id
                profile.save(update_fields=['google_drive_folder_id'])
        data = {
            'files': files,
            'total': len(files),
            'folder_id': folder_id,
        }
        return StandardResponse.success(
            data,
            "Google Drive files retrieved"
        )
    except Exception as exc:
        return StandardResponse.error(
            message=f"Failed to list Google Drive files: {exc}",
            status_code=status.HTTP_502_BAD_GATEWAY
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def google_drive_streaming_url(request, file_id):
    """Get streaming URL for Google Drive file"""
    try:
        drive_service = get_drive_service_for_user(request.user)
    except ValueError as exc:
        return StandardResponse.error(
            message=str(exc),
            status_code=status.HTTP_400_BAD_REQUEST
        )
    except Exception as exc:
        return StandardResponse.error(
            message=f"Failed to load Google Drive credentials: {exc}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    try:
        streaming_url = drive_service.get_streaming_url(file_id)
        download_url = drive_service.get_download_url(file_id)
        data = {
            'file_id': file_id,
            'streaming_url': streaming_url,
            'download_url': download_url,
        }
        return StandardResponse.success(
            data,
            "Google Drive streaming URL generated"
        )
    except Exception as exc:
        return StandardResponse.error(
            message=f"Failed to generate streaming URL: {exc}",
            status_code=status.HTTP_502_BAD_GATEWAY
        )


# AWS S3 Integration Views
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def s3_presigned_upload_url(request):
    """Get presigned URL for S3 upload"""
    # TODO: Implement S3 presigned URL generation
    return StandardResponse.error("S3 integration not implemented yet", status_code=501)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def s3_upload_file(request):
    """Upload file to S3"""
    # TODO: Implement S3 file upload
    return StandardResponse.error("S3 integration not implemented yet", status_code=501)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def s3_streaming_url(request, file_key):
    """Get streaming URL for S3 file"""
    # TODO: Implement S3 streaming URL generation
    return StandardResponse.error("S3 integration not implemented yet", status_code=501)


# Social OAuth Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def social_oauth_auth_url(request, provider):
    """Get OAuth authorization URL for social provider"""
    # TODO: Implement social OAuth authorization URL generation
    return StandardResponse.error(f"{provider} integration not implemented yet", status_code=501)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def social_oauth_callback(request, provider):
    """Handle OAuth callback for social provider"""
    # TODO: Implement social OAuth callback handling
    return StandardResponse.error(f"{provider} integration not implemented yet", status_code=501)


# User Connection Management Views
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_user_connections(request):
    """List user's integration connections"""
    # TODO: Implement user connections listing
    return StandardResponse.success({
        'connections': [],
        'total': 0
    }, "User connections retrieved")


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def disconnect_service(request, connection_id):
    """Disconnect a service integration"""
    # TODO: Implement service disconnection
    return StandardResponse.success({
        'disconnected': True,
        'connection_id': connection_id
    }, "Service disconnected successfully")

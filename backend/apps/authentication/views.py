"""
Authentication views for Watch Party Backend
"""

from rest_framework import status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import login
from django.utils import timezone
from django.conf import settings
from datetime import timedelta
import secrets
import urllib.parse

from .models import User, EmailVerification, PasswordReset
from .serializers import (
    UserRegistrationSerializer,
    UserLoginSerializer,
    UserProfileSerializer,
    UserProfileDetailSerializer,
    PasswordChangeSerializer,
    PasswordResetRequestSerializer,
    PasswordResetSerializer,
    EmailVerificationSerializer
)
from utils.mixins import RateLimitMixin


class RegisterView(RateLimitMixin, APIView):
    """User registration endpoint"""
    
    permission_classes = [AllowAny]
    rate_limit_key = 'auth'
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'message': 'Registration successful. Please verify your email.',
                'user': UserProfileSerializer(user).data,
                'access_token': str(access_token),
                'refresh_token': str(refresh),
                'verification_sent': True
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LoginView(RateLimitMixin, TokenObtainPairView):
    """User login endpoint"""
    
    permission_classes = [AllowAny]
    rate_limit_key = 'auth'
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            
            # Generate tokens
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'success': True,
                'access_token': str(access_token),
                'refresh_token': str(refresh),
                'user': UserProfileSerializer(user).data
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """User logout endpoint"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            return Response({
                'success': True,
                'message': 'Successfully logged out.'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'success': False,
                'message': 'Error during logout.'
            }, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User profile view"""
    
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileDetailSerializer
    
    def get_object(self):
        return self.request.user


class PasswordChangeView(APIView):
    """Password change endpoint"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = PasswordChangeSerializer(
            data=request.data,
            context={'request': request}
        )
        if serializer.is_valid():
            user = request.user
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            return Response({
                'success': True,
                'message': 'Password changed successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(RateLimitMixin, APIView):
    """Forgot password endpoint"""
    
    permission_classes = [AllowAny]
    rate_limit_key = 'auth'
    
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            
            try:
                user = User.objects.get(email=email, is_active=True)
                
                # Create password reset token
                token = secrets.token_urlsafe(32)
                PasswordReset.objects.create(
                    user=user,
                    token=token,
                    expires_at=timezone.now() + timedelta(hours=1)
                )
                
                # TODO: Send password reset email
                # send_password_reset_email.delay(user.id, token)
                
            except User.DoesNotExist:
                # Don't reveal whether user exists
                pass
            
            return Response({
                'success': True,
                'message': 'If an account with that email exists, a password reset link has been sent.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(RateLimitMixin, APIView):
    """Reset password endpoint"""
    
    permission_classes = [AllowAny]
    rate_limit_key = 'auth'
    
    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            reset = serializer.validated_data['reset']
            new_password = serializer.validated_data['new_password']
            
            # Update password
            user = reset.user
            user.set_password(new_password)
            user.save()
            
            # Mark reset token as used
            reset.is_used = True
            reset.save()
            
            return Response({
                'success': True,
                'message': 'Password has been reset successfully.'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(APIView):
    """Email verification endpoint"""
    
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            
            try:
                verification = EmailVerification.objects.get(
                    token=token,
                    is_used=False
                )
                
                if verification.is_expired:
                    return Response({
                        'success': False,
                        'message': 'Verification token has expired.'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Mark email as verified
                user = verification.user
                user.is_email_verified = True
                user.save()
                
                # Mark verification as used
                verification.is_used = True
                verification.save()
                
                return Response({
                    'success': True,
                    'message': 'Email verified successfully.'
                }, status=status.HTTP_200_OK)
                
            except EmailVerification.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Invalid verification token.'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationView(RateLimitMixin, APIView):
    """Resend verification email endpoint"""
    
    permission_classes = [IsAuthenticated]
    rate_limit_key = 'auth'
    
    def post(self, request):
        user = request.user
        
        if user.is_email_verified:
            return Response({
                'success': False,
                'message': 'Email is already verified.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create new verification token
        token = secrets.token_urlsafe(32)
        EmailVerification.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=24)
        )
        
        # TODO: Send verification email
        # send_verification_email.delay(user.id, token)
        
        return Response({
            'success': True,
            'message': 'Verification email sent successfully.'
        }, status=status.HTTP_200_OK)


class GoogleDriveAuthView(APIView):
    """Google Drive OAuth2 authorization endpoint"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get Google OAuth2 authorization URL"""
        try:
            from google_auth_oauthlib.flow import Flow
            
            # OAuth2 configuration
            client_config = {
                "web": {
                    "client_id": getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', ''),
                    "client_secret": getattr(settings, 'GOOGLE_OAUTH2_CLIENT_SECRET', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            }
            
            flow = Flow.from_client_config(
                client_config,
                scopes=[
                    'https://www.googleapis.com/auth/drive.readonly',
                    'https://www.googleapis.com/auth/drive.file'
                ]
            )
            
            # Set redirect URI (should match your frontend callback)
            redirect_uri = request.build_absolute_uri('/api/auth/google-drive/callback/')
            flow.redirect_uri = redirect_uri
            
            # Generate authorization URL
            authorization_url, state = flow.authorization_url(
                access_type='offline',
                include_granted_scopes='true',
                prompt='consent'
            )
            
            # Store state in session for verification
            request.session['google_oauth_state'] = state
            
            return Response({
                'success': True,
                'authorization_url': authorization_url,
                'state': state
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to generate authorization URL: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def post(self, request):
        """Handle Google OAuth2 callback"""
        try:
            from google_auth_oauthlib.flow import Flow
            from utils.google_drive_service import GoogleDriveService
            
            code = request.data.get('code')
            state = request.data.get('state')
            
            if not code:
                return Response({
                    'success': False,
                    'message': 'Authorization code is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Verify state parameter
            stored_state = request.session.get('google_oauth_state')
            if state != stored_state:
                return Response({
                    'success': False,
                    'message': 'Invalid state parameter'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # OAuth2 configuration
            client_config = {
                "web": {
                    "client_id": getattr(settings, 'GOOGLE_OAUTH2_CLIENT_ID', ''),
                    "client_secret": getattr(settings, 'GOOGLE_OAUTH2_CLIENT_SECRET', ''),
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token"
                }
            }
            
            flow = Flow.from_client_config(
                client_config,
                scopes=[
                    'https://www.googleapis.com/auth/drive.readonly',
                    'https://www.googleapis.com/auth/drive.file'
                ]
            )
            
            redirect_uri = request.build_absolute_uri('/api/auth/google-drive/callback/')
            flow.redirect_uri = redirect_uri
            
            # Exchange authorization code for tokens
            flow.fetch_token(code=code)
            
            credentials = flow.credentials
            
            # Initialize Drive service to get or create Watch Party folder
            drive_service = GoogleDriveService(
                access_token=credentials.token,
                refresh_token=credentials.refresh_token
            )
            
            folder_id = drive_service.get_or_create_watch_party_folder()
            
            # Update user profile with Drive credentials
            user = request.user
            profile, created = user.profile if hasattr(user, 'profile') else (None, True)
            
            if not profile:
                from .models import UserProfile
                profile = UserProfile.objects.create(user=user)
            
            profile.google_drive_token = credentials.token
            profile.google_drive_refresh_token = credentials.refresh_token
            profile.google_drive_connected = True
            profile.google_drive_folder_id = folder_id
            profile.save()
            
            # Clean up session
            if 'google_oauth_state' in request.session:
                del request.session['google_oauth_state']
            
            return Response({
                'success': True,
                'message': 'Google Drive connected successfully',
                'folder_id': folder_id
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to connect Google Drive: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleDriveDisconnectView(APIView):
    """Disconnect Google Drive"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Disconnect user's Google Drive"""
        try:
            user = request.user
            
            if hasattr(user, 'profile'):
                profile = user.profile
                profile.google_drive_token = ''
                profile.google_drive_refresh_token = ''
                profile.google_drive_connected = False
                profile.google_drive_folder_id = ''
                profile.save()
            
            return Response({
                'success': True,
                'message': 'Google Drive disconnected successfully'
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to disconnect Google Drive: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GoogleDriveStatusView(APIView):
    """Check Google Drive connection status"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get Google Drive connection status"""
        user = request.user
        
        connected = False
        folder_id = None
        
        if hasattr(user, 'profile'):
            profile = user.profile
            connected = profile.google_drive_connected
            folder_id = profile.google_drive_folder_id
        
        return Response({
            'success': True,
            'connected': connected,
            'folder_id': folder_id
        }, status=status.HTTP_200_OK)

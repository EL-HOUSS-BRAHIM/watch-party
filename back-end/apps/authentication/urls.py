"""
URL patterns for authentication endpoints
"""

from django.urls import path

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    PasswordChangeView,
    ForgotPasswordView,
    ResetPasswordView,
    VerifyEmailView,
    ResendVerificationView,
    GoogleDriveAuthView,
    GoogleDriveDisconnectView,
    GoogleDriveStatusView,
    TwoFactorSetupView,
    TwoFactorVerifyView,
    TwoFactorDisableView,
    UserSessionsView,
    GoogleAuthView,
    GitHubAuthView,
    SocialAuthRedirectView,
    CustomTokenRefreshView
)

app_name = 'authentication'

urlpatterns = [
    # User Registration & Login
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    
    # Social Authentication
    path('social/<str:provider>/', SocialAuthRedirectView.as_view(), name='social_auth_redirect'),
    path('social/google/', GoogleAuthView.as_view(), name='google_auth'),
    path('social/github/', GitHubAuthView.as_view(), name='github_auth'),
    
    # Password Management
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
    
    # Account Verification
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    
    # Google Drive Integration
    path('google-drive/auth/', GoogleDriveAuthView.as_view(), name='google_drive_auth'),
    path('google-drive/disconnect/', GoogleDriveDisconnectView.as_view(), name='google_drive_disconnect'),
    path('google-drive/status/', GoogleDriveStatusView.as_view(), name='google_drive_status'),
    
    # Two-Factor Authentication
    path('2fa/setup/', TwoFactorSetupView.as_view(), name='2fa_setup'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa_verify'),
    path('2fa/disable/', TwoFactorDisableView.as_view(), name='2fa_disable'),
    
    # Session Management
    path('sessions/', UserSessionsView.as_view(), name='user_sessions'),
    path('sessions/<uuid:session_id>/', UserSessionsView.as_view(), name='revoke_session'),
]

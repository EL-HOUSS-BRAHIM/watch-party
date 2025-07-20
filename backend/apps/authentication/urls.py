"""
URL patterns for authentication endpoints
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    LogoutView,
    UserProfileView,
    PasswordChangeView,
    ForgotPasswordView,
    ResetPasswordView,
    VerifyEmailView,
    ResendVerificationView
)

app_name = 'authentication'

urlpatterns = [
    # User Registration & Login
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Password Management
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/', PasswordChangeView.as_view(), name='change_password'),
    
    # Account Verification
    path('verify-email/', VerifyEmailView.as_view(), name='verify_email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='resend_verification'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='user_profile'),
]

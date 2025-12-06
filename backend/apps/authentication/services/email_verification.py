"""
Email verification service using OTP
"""
import random
import string
import logging
from datetime import timedelta
from typing import Optional, Tuple
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.core.cache import cache

from apps.authentication.models import User, EmailVerificationOTP

logger = logging.getLogger(__name__)

# Constants
OTP_LENGTH = 6
OTP_EXPIRATION_MINUTES = 15
MAX_OTP_REQUESTS_PER_HOUR = 3
MAX_VERIFICATION_ATTEMPTS = 5
VERIFICATION_LOCK_HOURS = 24


def generate_otp() -> str:
    """
    Generate a secure 6-digit OTP code.
    
    Returns:
        str: 6-digit numeric OTP
    """
    return ''.join(random.choices(string.digits, k=OTP_LENGTH))


def create_otp_for_user(user: User, ip_address: Optional[str] = None) -> Tuple[EmailVerificationOTP, str]:
    """
    Create a new OTP for email verification.
    
    Args:
        user: User instance to create OTP for
        ip_address: IP address of the requester
        
    Returns:
        Tuple of (EmailVerificationOTP instance, OTP code)
        
    Raises:
        ValueError: If rate limit exceeded or user already verified
    """
    # Check if user is already verified
    if user.is_email_verified:
        raise ValueError("Email is already verified")
    
    # Check rate limiting
    rate_limit_key = f"otp_requests:{user.id}"
    request_count = cache.get(rate_limit_key, 0)
    
    if request_count >= MAX_OTP_REQUESTS_PER_HOUR:
        raise ValueError(f"Too many OTP requests. Please try again in an hour.")
    
    # Invalidate any existing unused OTPs for this user
    EmailVerificationOTP.objects.filter(
        user=user,
        is_used=False,
        expires_at__gt=timezone.now()
    ).update(is_used=True)
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = timezone.now() + timedelta(minutes=OTP_EXPIRATION_MINUTES)
    
    # Create OTP record
    otp_instance = EmailVerificationOTP.objects.create(
        user=user,
        otp_code=otp_code,
        expires_at=expires_at,
        ip_address=ip_address
    )
    
    # Update rate limit counter
    cache.set(rate_limit_key, request_count + 1, 3600)  # 1 hour
    
    logger.info(f"Created OTP for user {user.email} (ID: {otp_instance.id})")
    
    return otp_instance, otp_code


def send_verification_email(user: User, otp_code: str) -> bool:
    """
    Send verification email with OTP code.
    
    Args:
        user: User to send email to
        otp_code: OTP code to include in email
        
    Returns:
        bool: True if email sent successfully, False otherwise
    """
    try:
        # Prepare email context
        context = {
            'user': user,
            'otp_code': otp_code,
            'expiration_minutes': OTP_EXPIRATION_MINUTES,
            'support_email': getattr(settings, 'SUPPORT_EMAIL', 'support@brahim-elhouss.me'),
            'frontend_url': getattr(settings, 'FRONTEND_URL', 'https://watch-party.brahim-elhouss.me'),
        }
        
        # Render email templates
        html_message = render_to_string('emails/verification_otp.html', context)
        plain_message = render_to_string('emails/verification_otp.txt', context)
        
        # Send email
        send_mail(
            subject='Verify Your Watch Party Email',
            message=plain_message,
            from_email=f"{getattr(settings, 'EMAIL_FROM_NAME', 'Watch Party')} <{settings.DEFAULT_FROM_EMAIL}>",
            recipient_list=[user.email],
            html_message=html_message,
            fail_silently=False,
        )
        
        logger.info(f"Sent verification email to {user.email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send verification email to {user.email}: {e}", exc_info=True)
        return False


def verify_otp(user: User, otp_code: str, ip_address: Optional[str] = None) -> Tuple[bool, str]:
    """
    Verify an OTP code for a user.
    
    Args:
        user: User attempting to verify
        otp_code: OTP code provided by user
        ip_address: IP address of the requester
        
    Returns:
        Tuple of (success: bool, message: str)
    """
    # Check if user is already verified
    if user.is_email_verified:
        return True, "Email is already verified"
    
    # Check verification lock
    lock_key = f"verification_lock:{user.id}"
    if cache.get(lock_key):
        return False, "Account temporarily locked due to too many failed attempts. Please try again later."
    
    # Find the most recent valid OTP
    try:
        otp_instance = EmailVerificationOTP.objects.filter(
            user=user,
            otp_code=otp_code,
            is_used=False,
            expires_at__gt=timezone.now()
        ).latest('created_at')
    except EmailVerificationOTP.DoesNotExist:
        # Track failed attempts
        attempts_key = f"verification_attempts:{user.id}"
        attempts = cache.get(attempts_key, 0) + 1
        cache.set(attempts_key, attempts, 86400)  # 24 hours
        
        # Lock account after 10 failed attempts
        if attempts >= 10:
            cache.set(lock_key, True, VERIFICATION_LOCK_HOURS * 3600)
            logger.warning(f"User {user.email} locked due to too many failed verification attempts")
            return False, "Account temporarily locked due to too many failed attempts. Please contact support."
        
        return False, "Invalid or expired OTP code"
    
    # Check if OTP has been attempted too many times
    if otp_instance.attempts >= MAX_VERIFICATION_ATTEMPTS:
        otp_instance.is_used = True
        otp_instance.save()
        return False, "This OTP has expired due to too many failed attempts. Please request a new one."
    
    # Increment attempts
    otp_instance.increment_attempts()
    
    # Check if code matches
    if otp_instance.otp_code != otp_code:
        return False, "Invalid OTP code"
    
    # Mark OTP as used
    otp_instance.is_used = True
    otp_instance.verified_at = timezone.now()
    otp_instance.save()
    
    # Verify user's email
    user.is_email_verified = True
    user.save(update_fields=['is_email_verified'])
    
    # Clear failed attempts
    attempts_key = f"verification_attempts:{user.id}"
    cache.delete(attempts_key)
    
    logger.info(f"User {user.email} successfully verified their email")
    
    return True, "Email verified successfully"


def resend_verification_otp(user: User, ip_address: Optional[str] = None) -> Tuple[bool, str]:
    """
    Resend verification OTP to user.
    
    Args:
        user: User to resend OTP to
        ip_address: IP address of the requester
        
    Returns:
        Tuple of (success: bool, message: str)
    """
    try:
        # Create new OTP
        otp_instance, otp_code = create_otp_for_user(user, ip_address)
        
        # Send email
        if send_verification_email(user, otp_code):
            return True, f"Verification code sent to {user.email}"
        else:
            return False, "Failed to send verification email. Please try again later."
            
    except ValueError as e:
        return False, str(e)
    except Exception as e:
        logger.error(f"Error resending OTP to {user.email}: {e}", exc_info=True)
        return False, "An error occurred. Please try again later."

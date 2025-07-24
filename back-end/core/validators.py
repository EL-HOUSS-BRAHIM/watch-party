"""
Custom validators for Watch Party Backend
"""

import re
from django.core.exceptions import ValidationError
from django.core.validators import BaseValidator
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta


def validate_room_code(value):
    """
    Validate room code format (alphanumeric, 4-10 characters)
    """
    if not re.match(r'^[A-Z0-9]{4,10}$', value):
        raise ValidationError(
            _('Room code must be 4-10 alphanumeric characters in uppercase.'),
            code='invalid_room_code'
        )


def validate_video_file_extension(value):
    """
    Validate video file extension
    """
    allowed_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
    ext = value.name.lower().split('.')[-1]
    if f'.{ext}' not in allowed_extensions:
        raise ValidationError(
            _('Unsupported video format. Allowed formats: %(formats)s') % {
                'formats': ', '.join(allowed_extensions)
            },
            code='invalid_video_format'
        )


def validate_image_file_extension(value):
    """
    Validate image file extension
    """
    allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    ext = value.name.lower().split('.')[-1]
    if f'.{ext}' not in allowed_extensions:
        raise ValidationError(
            _('Unsupported image format. Allowed formats: %(formats)s') % {
                'formats': ', '.join(allowed_extensions)
            },
            code='invalid_image_format'
        )


def validate_file_size(value, max_size_mb=500):
    """
    Validate file size (default max 500MB)
    """
    max_size_bytes = max_size_mb * 1024 * 1024
    if value.size > max_size_bytes:
        raise ValidationError(
            _('File size cannot exceed %(max_size)s MB.') % {
                'max_size': max_size_mb
            },
            code='file_too_large'
        )


def validate_party_title(value):
    """
    Validate party title
    """
    if len(value.strip()) < 3:
        raise ValidationError(
            _('Party title must be at least 3 characters long.'),
            code='title_too_short'
        )
    
    # Check for inappropriate content (basic check)
    inappropriate_words = ['spam', 'test123', 'asdf']  # Add more as needed
    if any(word in value.lower() for word in inappropriate_words):
        raise ValidationError(
            _('Party title contains inappropriate content.'),
            code='inappropriate_title'
        )


def validate_future_datetime(value):
    """
    Validate that datetime is in the future
    """
    if value <= timezone.now():
        raise ValidationError(
            _('Date and time must be in the future.'),
            code='invalid_future_datetime'
        )


def validate_reasonable_future_datetime(value, max_days=365):
    """
    Validate that datetime is in reasonable future (not too far)
    """
    max_future = timezone.now() + timedelta(days=max_days)
    if value > max_future:
        raise ValidationError(
            _('Date cannot be more than %(days)s days in the future.') % {
                'days': max_days
            },
            code='date_too_far_future'
        )


def validate_username(value):
    """
    Validate username format
    """
    if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
        raise ValidationError(
            _('Username can only contain letters, numbers, dots, hyphens, and underscores.'),
            code='invalid_username'
        )
    
    if len(value) < 3:
        raise ValidationError(
            _('Username must be at least 3 characters long.'),
            code='username_too_short'
        )
    
    if len(value) > 30:
        raise ValidationError(
            _('Username cannot exceed 30 characters.'),
            code='username_too_long'
        )


def validate_password_strength(value):
    """
    Validate password strength
    """
    if len(value) < 8:
        raise ValidationError(
            _('Password must be at least 8 characters long.'),
            code='password_too_short'
        )
    
    if not re.search(r'[A-Z]', value):
        raise ValidationError(
            _('Password must contain at least one uppercase letter.'),
            code='password_no_uppercase'
        )
    
    if not re.search(r'[a-z]', value):
        raise ValidationError(
            _('Password must contain at least one lowercase letter.'),
            code='password_no_lowercase'
        )
    
    if not re.search(r'\d', value):
        raise ValidationError(
            _('Password must contain at least one digit.'),
            code='password_no_digit'
        )
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
        raise ValidationError(
            _('Password must contain at least one special character.'),
            code='password_no_special'
        )


def validate_google_drive_url(value):
    """
    Validate Google Drive URL format
    """
    google_drive_pattern = r'https://drive\.google\.com/file/d/([a-zA-Z0-9-_]+)'
    if not re.match(google_drive_pattern, value):
        raise ValidationError(
            _('Invalid Google Drive URL format.'),
            code='invalid_gdrive_url'
        )


def validate_youtube_url(value):
    """
    Validate YouTube URL format
    """
    youtube_patterns = [
        r'https://www\.youtube\.com/watch\?v=([a-zA-Z0-9-_]+)',
        r'https://youtu\.be/([a-zA-Z0-9-_]+)',
    ]
    
    if not any(re.match(pattern, value) for pattern in youtube_patterns):
        raise ValidationError(
            _('Invalid YouTube URL format.'),
            code='invalid_youtube_url'
        )


def validate_phone_number(value):
    """
    Validate phone number format (international)
    """
    phone_pattern = r'^\+?1?\d{9,15}$'
    if not re.match(phone_pattern, value):
        raise ValidationError(
            _('Invalid phone number format. Use international format.'),
            code='invalid_phone_number'
        )


def validate_color_hex(value):
    """
    Validate hex color code
    """
    if not re.match(r'^#[0-9A-Fa-f]{6}$', value):
        raise ValidationError(
            _('Invalid hex color code format.'),
            code='invalid_hex_color'
        )


class MaxParticipantsValidator(BaseValidator):
    """
    Validator for maximum participants in a party
    """
    message = _('Maximum %(limit_value)d participants allowed.')
    code = 'max_participants_exceeded'
    
    def compare(self, a, b):
        return a > b


class MinParticipantsValidator(BaseValidator):
    """
    Validator for minimum participants in a party
    """
    message = _('Minimum %(limit_value)d participants required.')
    code = 'min_participants_required'
    
    def compare(self, a, b):
        return a < b


class ScheduleTimeValidator:
    """
    Validator for party schedule time
    """
    
    def __init__(self, min_advance_minutes=5, max_advance_days=30):
        self.min_advance_minutes = min_advance_minutes
        self.max_advance_days = max_advance_days
    
    def __call__(self, value):
        now = timezone.now()
        
        # Check minimum advance time
        min_time = now + timedelta(minutes=self.min_advance_minutes)
        if value < min_time:
            raise ValidationError(
                _('Party must be scheduled at least %(minutes)d minutes in advance.') % {
                    'minutes': self.min_advance_minutes
                },
                code='schedule_too_soon'
            )
        
        # Check maximum advance time
        max_time = now + timedelta(days=self.max_advance_days)
        if value > max_time:
            raise ValidationError(
                _('Party cannot be scheduled more than %(days)d days in advance.') % {
                    'days': self.max_advance_days
                },
                code='schedule_too_far'
            )


class ChatMessageValidator:
    """
    Validator for chat messages
    """
    
    def __init__(self, max_length=1000, min_length=1):
        self.max_length = max_length
        self.min_length = min_length
    
    def __call__(self, value):
        cleaned_value = value.strip()
        
        if len(cleaned_value) < self.min_length:
            raise ValidationError(
                _('Message cannot be empty.'),
                code='message_empty'
            )
        
        if len(cleaned_value) > self.max_length:
            raise ValidationError(
                _('Message cannot exceed %(max_length)d characters.') % {
                    'max_length': self.max_length
                },
                code='message_too_long'
            )
        
        # Check for spam patterns
        if cleaned_value.count('http') > 2:
            raise ValidationError(
                _('Too many links in message.'),
                code='too_many_links'
            )
        
        # Check for excessive repetition
        if len(set(cleaned_value.split())) < len(cleaned_value.split()) / 3:
            raise ValidationError(
                _('Message contains too much repetition.'),
                code='excessive_repetition'
            )


def validate_subscription_plan(value):
    """
    Validate subscription plan name
    """
    valid_plans = ['basic', 'premium', 'pro', 'enterprise']
    if value.lower() not in valid_plans:
        raise ValidationError(
            _('Invalid subscription plan. Valid plans: %(plans)s') % {
                'plans': ', '.join(valid_plans)
            },
            code='invalid_subscription_plan'
        )


def validate_timezone(value):
    """
    Validate timezone string
    """
    import pytz
    try:
        pytz.timezone(value)
    except pytz.exceptions.UnknownTimeZoneError:
        raise ValidationError(
            _('Invalid timezone.'),
            code='invalid_timezone'
        )


def validate_language_code(value):
    """
    Validate language code (ISO 639-1)
    """
    valid_languages = [
        'en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ja', 'ko', 'zh',
        'ar', 'hi', 'tr', 'pl', 'nl', 'sv', 'da', 'no', 'fi'
    ]
    
    if value.lower() not in valid_languages:
        raise ValidationError(
            _('Invalid language code.'),
            code='invalid_language_code'
        )

"""
Utility functions for Watch Party Backend
"""

import secrets
import string
import hashlib
import uuid
from datetime import datetime, timedelta
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
import jwt
import re


def generate_random_string(length=8, include_digits=True, include_uppercase=True, include_lowercase=True):
    """
    Generate a random string with specified characteristics
    """
    characters = ''
    if include_lowercase:
        characters += string.ascii_lowercase
    if include_uppercase:
        characters += string.ascii_uppercase
    if include_digits:
        characters += string.digits
    
    return ''.join(secrets.choice(characters) for _ in range(length))


def generate_room_code(length=6):
    """
    Generate a unique room code for parties
    """
    return generate_random_string(
        length=length,
        include_digits=True,
        include_uppercase=True,
        include_lowercase=False
    )


def generate_invite_code(length=10):
    """
    Generate an invite code for party invitations
    """
    return generate_random_string(length=length)


def hash_password(password):
    """
    Hash a password using Django's built-in hasher
    """
    from django.contrib.auth.hashers import make_password
    return make_password(password)


def verify_password(password, hashed_password):
    """
    Verify a password against its hash
    """
    from django.contrib.auth.hashers import check_password
    return check_password(password, hashed_password)


def generate_secure_token(length=32):
    """
    Generate a secure random token for various purposes
    """
    return secrets.token_urlsafe(length)


def create_cache_key(*args, prefix='watchparty'):
    """
    Create a standardized cache key
    """
    key_parts = [str(prefix)] + [str(arg) for arg in args]
    return ':'.join(key_parts)


def get_client_ip(request):
    """
    Get client IP address from request
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def get_user_agent(request):
    """
    Get user agent from request
    """
    return request.META.get('HTTP_USER_AGENT', '')


def extract_google_drive_file_id(url):
    """
    Extract file ID from Google Drive URL
    """
    patterns = [
        r'/file/d/([a-zA-Z0-9-_]+)',
        r'id=([a-zA-Z0-9-_]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def extract_youtube_video_id(url):
    """
    Extract video ID from YouTube URL
    """
    patterns = [
        r'youtube\.com/watch\?v=([a-zA-Z0-9-_]+)',
        r'youtu\.be/([a-zA-Z0-9-_]+)',
        r'youtube\.com/embed/([a-zA-Z0-9-_]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def format_duration(seconds):
    """
    Format duration in seconds to human-readable format
    """
    if seconds < 60:
        return f"{seconds}s"
    elif seconds < 3600:
        minutes = seconds // 60
        remaining_seconds = seconds % 60
        return f"{minutes}m {remaining_seconds}s"
    else:
        hours = seconds // 3600
        remaining_minutes = (seconds % 3600) // 60
        remaining_seconds = seconds % 60
        return f"{hours}h {remaining_minutes}m {remaining_seconds}s"


def parse_duration_string(duration_str):
    """
    Parse duration string to seconds
    Supports formats like: "1h 30m", "90m", "5400s", "1:30:00"
    """
    if not duration_str:
        return 0
    
    # Handle HH:MM:SS format
    if ':' in duration_str:
        parts = duration_str.split(':')
        if len(parts) == 3:  # HH:MM:SS
            hours, minutes, seconds = map(int, parts)
            return hours * 3600 + minutes * 60 + seconds
        elif len(parts) == 2:  # MM:SS
            minutes, seconds = map(int, parts)
            return minutes * 60 + seconds
    
    # Handle text format (1h 30m 45s)
    total_seconds = 0
    
    # Extract hours
    hour_match = re.search(r'(\d+)h', duration_str.lower())
    if hour_match:
        total_seconds += int(hour_match.group(1)) * 3600
    
    # Extract minutes
    minute_match = re.search(r'(\d+)m', duration_str.lower())
    if minute_match:
        total_seconds += int(minute_match.group(1)) * 60
    
    # Extract seconds
    second_match = re.search(r'(\d+)s', duration_str.lower())
    if second_match:
        total_seconds += int(second_match.group(1))
    
    return total_seconds


def format_file_size(bytes_size):
    """
    Format file size in bytes to human-readable format
    """
    if bytes_size < 1024:
        return f"{bytes_size} B"
    elif bytes_size < 1024 * 1024:
        return f"{bytes_size / 1024:.1f} KB"
    elif bytes_size < 1024 * 1024 * 1024:
        return f"{bytes_size / (1024 * 1024):.1f} MB"
    else:
        return f"{bytes_size / (1024 * 1024 * 1024):.1f} GB"


def sanitize_filename(filename):
    """
    Sanitize filename for safe storage
    """
    # Remove or replace invalid characters
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Remove extra spaces and dots
    filename = re.sub(r'\s+', ' ', filename)
    filename = re.sub(r'\.+', '.', filename)
    
    # Limit length
    if len(filename) > 255:
        name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
        max_name_length = 255 - len(ext) - 1
        filename = name[:max_name_length] + ('.' + ext if ext else '')
    
    return filename.strip()


def generate_thumbnail_filename(original_filename):
    """
    Generate thumbnail filename from original filename
    """
    name, ext = original_filename.rsplit('.', 1) if '.' in original_filename else (original_filename, '')
    return f"{name}_thumb.jpg"


def time_until(target_datetime):
    """
    Calculate time remaining until target datetime
    """
    if not target_datetime:
        return None
    
    now = timezone.now()
    if target_datetime <= now:
        return timedelta(0)
    
    return target_datetime - now


def time_since(target_datetime):
    """
    Calculate time elapsed since target datetime
    """
    if not target_datetime:
        return None
    
    now = timezone.now()
    if target_datetime >= now:
        return timedelta(0)
    
    return now - target_datetime


def is_recent(target_datetime, minutes=5):
    """
    Check if datetime is within recent minutes
    """
    if not target_datetime:
        return False
    
    return time_since(target_datetime) <= timedelta(minutes=minutes)


def truncate_text(text, max_length=100, suffix='...'):
    """
    Truncate text to specified length with suffix
    """
    if not text or len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix


def clean_text(text):
    """
    Clean text by removing extra whitespace and special characters
    """
    if not text:
        return ''
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    # Remove special characters (keep basic punctuation)
    text = re.sub(r'[^\w\s\-_.,!?;:()\[\]{}"\']', '', text)
    
    return text.strip()


def mask_email(email):
    """
    Mask email address for privacy
    """
    if not email or '@' not in email:
        return email
    
    local, domain = email.split('@', 1)
    if len(local) <= 2:
        masked_local = '*' * len(local)
    else:
        masked_local = local[0] + '*' * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"


def generate_jwt_token(payload, secret_key=None, algorithm='HS256', expires_in=3600):
    """
    Generate JWT token with payload
    """
    if secret_key is None:
        secret_key = settings.SECRET_KEY
    
    payload['exp'] = datetime.utcnow() + timedelta(seconds=expires_in)
    payload['iat'] = datetime.utcnow()
    
    return jwt.encode(payload, secret_key, algorithm=algorithm)


def decode_jwt_token(token, secret_key=None, algorithm='HS256'):
    """
    Decode JWT token and return payload
    """
    if secret_key is None:
        secret_key = settings.SECRET_KEY
    
    try:
        payload = jwt.decode(token, secret_key, algorithms=[algorithm])
        return payload
    except jwt.ExpiredSignatureError:
        raise Exception('Token has expired')
    except jwt.InvalidTokenError:
        raise Exception('Invalid token')


def paginate_queryset(queryset, page=1, page_size=20):
    """
    Paginate queryset and return page info
    """
    from django.core.paginator import Paginator
    
    paginator = Paginator(queryset, page_size)
    page_obj = paginator.get_page(page)
    
    return {
        'objects': page_obj.object_list,
        'page': page_obj.number,
        'page_size': page_size,
        'total_pages': paginator.num_pages,
        'total_count': paginator.count,
        'has_next': page_obj.has_next(),
        'has_previous': page_obj.has_previous(),
        'next_page': page_obj.next_page_number() if page_obj.has_next() else None,
        'previous_page': page_obj.previous_page_number() if page_obj.has_previous() else None,
    }


def batch_process(items, batch_size=100, process_func=None):
    """
    Process items in batches
    """
    if not process_func:
        return items
    
    results = []
    for i in range(0, len(items), batch_size):
        batch = items[i:i + batch_size]
        batch_results = process_func(batch)
        results.extend(batch_results)
    
    return results


def retry_on_failure(func, max_retries=3, delay=1):
    """
    Retry function on failure with exponential backoff
    """
    import time
    
    for attempt in range(max_retries + 1):
        try:
            return func()
        except Exception as e:
            if attempt == max_retries:
                raise e
            time.sleep(delay * (2 ** attempt))


def validate_url(url):
    """
    Validate if string is a valid URL
    """
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    return url_pattern.match(url) is not None


def get_file_extension(filename):
    """
    Get file extension from filename
    """
    return filename.split('.')[-1].lower() if '.' in filename else ''


def is_video_file(filename):
    """
    Check if file is a video based on extension
    """
    video_extensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v']
    return get_file_extension(filename) in video_extensions


def is_image_file(filename):
    """
    Check if file is an image based on extension
    """
    image_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff']
    return get_file_extension(filename) in image_extensions

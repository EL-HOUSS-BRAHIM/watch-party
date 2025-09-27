"""
Enhanced security utilities for Watch Party Backend
"""

import re
import html
import bleach
from django.core.exceptions import ValidationError
from django.utils.translation import gettext_lazy as _
from django.core.validators import URLValidator
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

# Security configuration
ALLOWED_HTML_TAGS = ['b', 'i', 'u', 'em', 'strong', 'br', 'p']
ALLOWED_HTML_ATTRIBUTES = {}
MAX_TEXT_LENGTH = 5000
MAX_USERNAME_LENGTH = 50
MAX_EMAIL_LENGTH = 254

# Dangerous patterns to detect
DANGEROUS_PATTERNS = [
    r'<script[^>]*>.*?</script>',  # Script tags
    r'javascript:',  # JavaScript URLs
    r'on\w+\s*=',  # Event handlers
    r'data:',  # Data URLs
    r'vbscript:',  # VBScript URLs
    r'@import',  # CSS imports
    r'expression\s*\(',  # CSS expressions
]

class InputSanitizer:
    """Comprehensive input sanitization utility"""
    
    @staticmethod
    def sanitize_html(text, allowed_tags=None, allowed_attributes=None):
        """
        Sanitize HTML content to prevent XSS attacks
        """
        if not text:
            return text
            
        allowed_tags = allowed_tags or ALLOWED_HTML_TAGS
        allowed_attributes = allowed_attributes or ALLOWED_HTML_ATTRIBUTES
        
        # Use bleach to clean HTML
        cleaned = bleach.clean(
            text,
            tags=allowed_tags,
            attributes=allowed_attributes,
            strip=True
        )
        
        return cleaned
    
    @staticmethod
    def sanitize_text(text, max_length=None):
        """
        Sanitize plain text input
        """
        if not text:
            return text
            
        # Remove dangerous patterns
        for pattern in DANGEROUS_PATTERNS:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        # HTML escape
        text = html.escape(text)
        
        # Trim length if specified
        if max_length and len(text) > max_length:
            text = text[:max_length]
            
        return text.strip()
    
    @staticmethod
    def sanitize_filename(filename):
        """
        Sanitize filename to prevent directory traversal
        """
        if not filename:
            return filename
            
        # Remove path separators and dangerous characters
        filename = re.sub(r'[^\w\s\-_\.]', '', filename)
        filename = re.sub(r'\.\.+', '.', filename)  # Remove multiple dots
        filename = filename.strip('.')  # Remove leading/trailing dots
        
        return filename[:255]  # Limit length


class InputValidator:
    """Enhanced input validation"""
    
    @staticmethod
    def validate_email(email):
        """
        Enhanced email validation
        """
        if not email:
            raise ValidationError(_('Email is required.'))
            
        if len(email) > MAX_EMAIL_LENGTH:
            raise ValidationError(_('Email is too long.'))
            
        # Basic format check
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, email):
            raise ValidationError(_('Invalid email format.'))
            
        # Check for dangerous patterns
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, email, re.IGNORECASE):
                raise ValidationError(_('Email contains invalid characters.'))
                
        return email.lower().strip()
    
    @staticmethod
    def validate_username(username):
        """
        Enhanced username validation
        """
        if not username:
            raise ValidationError(_('Username is required.'))
            
        if len(username) > MAX_USERNAME_LENGTH:
            raise ValidationError(_('Username is too long.'))
            
        if len(username) < 3:
            raise ValidationError(_('Username must be at least 3 characters.'))
            
        # Only allow alphanumeric and certain special characters
        if not re.match(r'^[a-zA-Z0-9_.-]+$', username):
            raise ValidationError(_('Username can only contain letters, numbers, dots, hyphens, and underscores.'))
            
        # Check for reserved words
        reserved_words = ['admin', 'root', 'system', 'api', 'www', 'mail', 'ftp']
        if username.lower() in reserved_words:
            raise ValidationError(_('This username is reserved.'))
            
        return username.strip()
    
    @staticmethod
    def validate_url(url, allowed_schemes=None):
        """
        Enhanced URL validation
        """
        if not url:
            return url
            
        allowed_schemes = allowed_schemes or ['http', 'https']
        
        try:
            validator = URLValidator(schemes=allowed_schemes)
            validator(url)
        except ValidationError:
            raise ValidationError(_('Invalid URL format.'))
            
        # Parse URL to check components
        parsed = urlparse(url)
        
        # Check for dangerous patterns in URL
        full_url = url.lower()
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, full_url, re.IGNORECASE):
                raise ValidationError(_('URL contains dangerous content.'))
                
        # Check for local/private IP addresses
        if parsed.hostname:
            hostname = parsed.hostname.lower()
            if hostname in ['localhost', '127.0.0.1', '0.0.0.0']:
                raise ValidationError(_('Local URLs are not allowed.'))
                
        return url
    
    @staticmethod
    def validate_content_length(content, min_length=1, max_length=MAX_TEXT_LENGTH):
        """
        Validate content length
        """
        if not content:
            if min_length > 0:
                raise ValidationError(_('Content is required.'))
            return content
            
        content_length = len(content.strip())
        
        if content_length < min_length:
            raise ValidationError(_('Content is too short.'))
            
        if content_length > max_length:
            raise ValidationError(_('Content is too long.'))
            
        return content


class FileSecurityValidator:
    """File upload security validation"""
    
    # Allowed MIME types
    ALLOWED_VIDEO_MIMES = [
        'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
        'video/x-flv', 'video/webm', 'video/x-matroska'
    ]
    
    ALLOWED_IMAGE_MIMES = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp'
    ]
    
    # File signature magic numbers
    FILE_SIGNATURES = {
        # Video signatures
        b'\x00\x00\x00\x18ftypmp4': 'mp4',
        b'\x00\x00\x00\x20ftypM4V': 'm4v',
        b'RIFF': 'avi',  # AVI files start with RIFF
        b'\x1a\x45\xdf\xa3': 'mkv',
        
        # Image signatures
        b'\xff\xd8\xff': 'jpg',
        b'\x89PNG\r\n\x1a\n': 'png',
        b'GIF87a': 'gif',
        b'GIF89a': 'gif',
        b'RIFF': 'webp',  # WebP also uses RIFF
    }
    
    @staticmethod
    def validate_file_type(file, allowed_types='image'):
        """
        Validate file type using both extension and magic numbers
        """
        if not file:
            return
            
        filename = file.name.lower()
        
        # Get allowed MIME types based on file type
        if allowed_types == 'video':
            allowed_mimes = FileSecurityValidator.ALLOWED_VIDEO_MIMES
            allowed_extensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv']
        elif allowed_types == 'image':
            allowed_mimes = FileSecurityValidator.ALLOWED_IMAGE_MIMES
            allowed_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        else:
            raise ValidationError(_('Unknown file type category.'))
        
        # Check file extension
        file_ext = '.' + filename.split('.')[-1] if '.' in filename else ''
        if file_ext not in allowed_extensions:
            raise ValidationError(
                _('File extension not allowed. Allowed: %(extensions)s') % {
                    'extensions': ', '.join(allowed_extensions)
                }
            )
        
        # Check MIME type
        if hasattr(file, 'content_type') and file.content_type not in allowed_mimes:
            raise ValidationError(
                _('File type not allowed. Detected type: %(type)s') % {
                    'type': file.content_type
                }
            )
        
        # Check file signature (magic numbers)
        try:
            file.seek(0)
            file_header = file.read(12)  # Read first 12 bytes
            file.seek(0)  # Reset file pointer
            
            # Check against known signatures
            signature_valid = False
            for signature, file_type in FileSecurityValidator.FILE_SIGNATURES.items():
                if file_header.startswith(signature):
                    signature_valid = True
                    break
                    
            # Special case for RIFF files (AVI and WebP)
            if file_header.startswith(b'RIFF'):
                riff_format = file_header[8:12]
                if allowed_types == 'video' and riff_format == b'AVI ':
                    signature_valid = True
                elif allowed_types == 'image' and riff_format == b'WEBP':
                    signature_valid = True
                    
            if not signature_valid:
                logger.warning(f"File signature validation failed for {filename}")
                # Don't reject entirely, just log for monitoring
                
        except Exception as e:
            logger.error(f"Error reading file signature: {e}")
            # Don't reject the file for signature reading errors
    
    @staticmethod
    def validate_file_size(file, max_size_mb=500):
        """
        Validate file size with security considerations
        """
        if not file:
            return
            
        max_size_bytes = max_size_mb * 1024 * 1024
        
        if file.size > max_size_bytes:
            raise ValidationError(
                _('File size too large. Maximum size: %(size)s MB') % {
                    'size': max_size_mb
                }
            )
        
        # Check for zero-byte files
        if file.size == 0:
            raise ValidationError(_('Empty files are not allowed.'))
    
    @staticmethod
    def sanitize_filename(filename):
        """
        Sanitize uploaded filename
        """
        if not filename:
            return 'unnamed_file'
            
        # Remove path components
        filename = filename.split('/')[-1].split('\\')[-1]
        
        # Remove dangerous characters
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:250 - len(ext)] + ('.' + ext if ext else '')
            
        return filename or 'unnamed_file'


class CSRFProtectionMixin:
    """
    Mixin to add CSRF protection to views
    """
    
    def dispatch(self, request, *args, **kwargs):
        """
        Add CSRF protection for state-changing operations
        """
        from django.middleware.csrf import get_token
        from django.views.decorators.csrf import csrf_protect
        
        # Ensure CSRF token is available
        get_token(request)
        
        # Apply CSRF protection for POST, PUT, PATCH, DELETE
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            # Use Django's CSRF protection
            protected_view = csrf_protect(super().dispatch)
            return protected_view(request, *args, **kwargs)
        
        return super().dispatch(request, *args, **kwargs)


class SecurityHeaders:
    """
    Security headers management
    """
    
    @staticmethod
    def add_security_headers(response):
        """
        Add comprehensive security headers
        """
        # Prevent XSS attacks
        response['X-XSS-Protection'] = '1; mode=block'
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        
        # Prevent MIME type sniffing
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self' wss: https:; "
            "media-src 'self' https:; "
            "object-src 'none'; "
            "base-uri 'self'; "
            "form-action 'self'"
        )
        
        # Add referrer policy
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        
        # Add permissions policy
        response['Permissions-Policy'] = (
            'geolocation=(), '
            'microphone=(), '
            'camera=(), '
            'magnetometer=(), '
            'gyroscope=(), '
            'payment=()'
        )
        
        return response


def rate_limit_key(request):
    """
    Generate rate limit key based on user or IP
    """
    if request.user.is_authenticated:
        return f"user:{request.user.id}"
    return f"ip:{get_client_ip(request)}"


def get_client_ip(request):
    """
    Get client IP address considering proxies
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

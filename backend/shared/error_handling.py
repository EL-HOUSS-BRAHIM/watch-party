"""
Enhanced error handling and logging utilities
"""

import logging
import traceback
import uuid
from datetime import datetime
from django.http import JsonResponse
from django.core.exceptions import ValidationError
from rest_framework.views import exception_handler

logger = logging.getLogger('watchparty.errors')


class ErrorTracker:
    """Track and log errors with unique IDs for better debugging"""
    
    @staticmethod
    def generate_error_id():
        """Generate unique error ID"""
        return str(uuid.uuid4())[:8]
    
    @staticmethod
    def log_error(error_id, error, request=None, extra_data=None):
        """Log error with detailed information"""
        error_data = {
            'error_id': error_id,
            'error_type': type(error).__name__,
            'error_message': str(error),
            'timestamp': datetime.now().isoformat(),
        }
        
        if request:
            error_data.update({
                'path': request.path,
                'method': request.method,
                'user': request.user.id if hasattr(request, 'user') and request.user.is_authenticated else None,
                'user_agent': request.META.get('HTTP_USER_AGENT', ''),
                'ip_address': request.META.get('REMOTE_ADDR', ''),
            })
        
        if extra_data:
            error_data['extra'] = extra_data
        
        # Log full traceback for debugging
        error_data['traceback'] = traceback.format_exc()
        
        logger.error(f"Error {error_id}: {error_data}")
        
        return error_id


def enhanced_exception_handler(exc, context):
    """Enhanced exception handler with error tracking"""
    
    # Generate unique error ID
    error_id = ErrorTracker.generate_error_id()
    
    # Get request from context
    request = context.get('request')
    
    # Log the error
    ErrorTracker.log_error(error_id, exc, request)
    
    # Call default handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Enhance the response with error ID and better formatting
        error_data = {
            'success': False,
            'error_id': error_id,
            'message': 'An error occurred',
            'timestamp': datetime.now().isoformat()
        }
        
        # Handle different types of exceptions
        if isinstance(exc, ValidationError):
            error_data['message'] = 'Validation failed'
            error_data['details'] = exc.message_dict if hasattr(exc, 'message_dict') else str(exc)
        elif hasattr(exc, 'detail'):
            if isinstance(exc.detail, dict):
                error_data['details'] = exc.detail
            else:
                error_data['message'] = str(exc.detail)
        else:
            error_data['message'] = str(exc)
        
        # Don't expose internal error details in production
        if hasattr(request, 'user') and request.user.is_staff:
            error_data['debug_info'] = {
                'exception_type': type(exc).__name__,
                'traceback': traceback.format_exc().split('\n')
            }
        
        response.data = error_data
        
        return response
    
    # Handle unhandled exceptions
    error_data = {
        'success': False,
        'error_id': error_id,
        'message': 'Internal server error',
        'timestamp': datetime.now().isoformat()
    }
    
    return JsonResponse(error_data, status=500)


class APIHealthMonitor:
    """Monitor API health and track metrics"""
    
    @staticmethod
    def get_health_status():
        """Get current API health status"""
        try:
            from django.db import connection
            from django.core.cache import cache
            
            health_data = {
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'services': {}
            }
            
            # Check database
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                health_data['services']['database'] = 'healthy'
            except Exception as e:
                health_data['services']['database'] = f'unhealthy: {str(e)}'
                health_data['status'] = 'degraded'
            
            # Check cache
            try:
                cache.set('health_check', 'ok', 10)
                if cache.get('health_check') == 'ok':
                    health_data['services']['cache'] = 'healthy'
                else:
                    health_data['services']['cache'] = 'unhealthy: cache not working'
                    health_data['status'] = 'degraded'
            except Exception as e:
                health_data['services']['cache'] = f'unhealthy: {str(e)}'
                health_data['status'] = 'degraded'
            
            # Check app status
            try:
                from apps.authentication.models import User
                user_count = User.objects.count()
                health_data['services']['app'] = f'healthy ({user_count} users)'
            except Exception as e:
                health_data['services']['app'] = f'unhealthy: {str(e)}'
                health_data['status'] = 'unhealthy'
            
            return health_data
            
        except Exception as e:
            return {
                'status': 'unhealthy',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }


class SecurityEventLogger:
    """Log security-related events"""
    
    @staticmethod
    def log_failed_login(request, username):
        """Log failed login attempt"""
        logger.warning(f"Failed login attempt for user '{username}' from {request.META.get('REMOTE_ADDR', 'unknown')}")
    
    @staticmethod
    def log_suspicious_activity(request, activity_type, details):
        """Log suspicious activity"""
        logger.warning(f"Suspicious activity: {activity_type} from {request.META.get('REMOTE_ADDR', 'unknown')} - {details}")
    
    @staticmethod
    def log_permission_denied(request, resource):
        """Log unauthorized access attempts"""
        user = request.user.username if hasattr(request, 'user') and request.user.is_authenticated else 'anonymous'
        logger.warning(f"Permission denied for user '{user}' accessing {resource}")


# Custom exception classes
class APIException(Exception):
    """Base API exception"""
    def __init__(self, message, status_code=400, error_code=None):
        self.message = message
        self.status_code = status_code
        self.error_code = error_code
        super().__init__(self.message)


class ValidationException(APIException):
    """Validation error exception"""
    def __init__(self, errors, message="Validation failed"):
        self.errors = errors
        super().__init__(message, status_code=400, error_code='VALIDATION_ERROR')


class PermissionException(APIException):
    """Permission denied exception"""
    def __init__(self, message="Permission denied"):
        super().__init__(message, status_code=403, error_code='PERMISSION_DENIED')


class ResourceNotFoundException(APIException):
    """Resource not found exception"""
    def __init__(self, resource="Resource", message=None):
        if not message:
            message = f"{resource} not found"
        super().__init__(message, status_code=404, error_code='RESOURCE_NOT_FOUND')


class RateLimitException(APIException):
    """Rate limit exceeded exception"""
    def __init__(self, message="Rate limit exceeded"):
        super().__init__(message, status_code=429, error_code='RATE_LIMIT_EXCEEDED')

"""
Custom exceptions for Watch Party Backend
"""

from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    """
    Custom exception handler that adds 'success' field to all error responses
    """
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Add success field to all error responses
        custom_response_data = {
            'success': False,
        }
        
        # Handle different error response formats
        if isinstance(response.data, dict):
            if 'detail' in response.data:
                custom_response_data['message'] = response.data['detail']
                if len(response.data) > 1:
                    custom_response_data['errors'] = {k: v for k, v in response.data.items() if k != 'detail'}
            else:
                custom_response_data['errors'] = response.data
        else:
            custom_response_data['errors'] = response.data
        
        response.data = custom_response_data
    
    return response


class WatchPartyBaseException(APIException):
    """Base exception for all Watch Party specific errors"""
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'A Watch Party error occurred.'
    default_code = 'watch_party_error'


class AuthenticationError(WatchPartyBaseException):
    """Authentication related errors"""
    status_code = status.HTTP_401_UNAUTHORIZED
    default_detail = 'Authentication failed.'
    default_code = 'authentication_error'


class PermissionError(WatchPartyBaseException):
    """Permission related errors"""
    status_code = status.HTTP_403_FORBIDDEN
    default_detail = 'Permission denied.'
    default_code = 'permission_error'


class VideoError(WatchPartyBaseException):
    """Video related errors"""
    default_detail = 'Video operation failed.'
    default_code = 'video_error'


class PartyError(WatchPartyBaseException):
    """Party related errors"""
    default_detail = 'Party operation failed.'
    default_code = 'party_error'


class PartyFullError(PartyError):
    """Party is at maximum capacity"""
    default_detail = 'This party has reached its maximum capacity.'
    default_code = 'party_full'


class PartyNotFoundError(PartyError):
    """Party not found"""
    status_code = status.HTTP_404_NOT_FOUND
    default_detail = 'Party not found.'
    default_code = 'party_not_found'


class BillingError(WatchPartyBaseException):
    """Billing and subscription related errors"""
    default_detail = 'Billing operation failed.'
    default_code = 'billing_error'


class SubscriptionRequiredError(BillingError):
    """Premium subscription required"""
    status_code = status.HTTP_402_PAYMENT_REQUIRED
    default_detail = 'Premium subscription required for this feature.'
    default_code = 'subscription_required'


class RateLimitError(WatchPartyBaseException):
    """Rate limiting errors"""
    status_code = status.HTTP_429_TOO_MANY_REQUESTS
    default_detail = 'Rate limit exceeded. Please try again later.'
    default_code = 'rate_limit_exceeded'


class StorageError(WatchPartyBaseException):
    """File storage related errors"""
    default_detail = 'Storage operation failed.'
    default_code = 'storage_error'


class IntegrationError(WatchPartyBaseException):
    """External integration errors"""
    default_detail = 'External service integration failed.'
    default_code = 'integration_error'


class ValidationError(WatchPartyBaseException):
    """Custom validation errors"""
    default_detail = 'Validation failed.'
    default_code = 'validation_error'

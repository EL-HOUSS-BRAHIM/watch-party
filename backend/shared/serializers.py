"""
Standardized Response Serializers (Task 12)
Provides consistent serialization for all API responses
"""

from rest_framework import serializers
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes


class StandardResponseSerializer(serializers.Serializer):
    """Base serializer for standardized responses"""
    
    success = serializers.BooleanField()
    status = serializers.CharField()
    message = serializers.CharField()
    timestamp = serializers.DateTimeField()
    request_id = serializers.CharField(required=False)
    
    
class SuccessResponseSerializer(StandardResponseSerializer):
    """Serializer for success responses"""
    
    data = serializers.JSONField(required=False, allow_null=True)
    metadata = serializers.DictField(required=False, allow_null=True)


class ErrorResponseSerializer(StandardResponseSerializer):
    """Serializer for error responses"""
    
    details = serializers.JSONField(required=False, allow_null=True)
    errors = serializers.DictField(required=False, allow_null=True)
    error_code = serializers.CharField(required=False, allow_null=True)


class ValidationErrorResponseSerializer(ErrorResponseSerializer):
    """Serializer for validation error responses"""
    
    field_errors = serializers.DictField(
        child=serializers.ListField(child=serializers.CharField()),
        required=False,
        help_text="Field-specific validation errors"
    )
    

class PaginationMetadataSerializer(serializers.Serializer):
    """Serializer for pagination metadata"""
    
    current_page = serializers.IntegerField()
    page_size = serializers.IntegerField()
    total_pages = serializers.IntegerField()
    total_items = serializers.IntegerField()
    has_next = serializers.BooleanField()
    has_previous = serializers.BooleanField()
    next_page = serializers.IntegerField(required=False, allow_null=True)
    previous_page = serializers.IntegerField(required=False, allow_null=True)


class PaginatedResponseMetadataSerializer(serializers.Serializer):
    """Serializer for paginated response metadata"""
    
    pagination = PaginationMetadataSerializer()
    total_count = serializers.IntegerField(required=False, allow_null=True)


class SecurityResponseSerializer(serializers.Serializer):
    """Serializer for security-related responses"""
    
    action_required = serializers.BooleanField(default=False)
    security_level = serializers.ChoiceField(
        choices=['low', 'medium', 'high', 'critical'],
        default='low'
    )
    expires_at = serializers.DateTimeField(required=False)
    

class PerformanceMetricsSerializer(serializers.Serializer):
    """Serializer for performance metrics"""
    
    response_time_ms = serializers.FloatField()
    query_count = serializers.IntegerField()
    cache_hits = serializers.IntegerField(default=0)
    cache_misses = serializers.IntegerField(default=0)
    filters_applied = serializers.DictField(required=False, allow_null=True)
    response_time_ms = serializers.FloatField(required=False, allow_null=True)
    api_version = serializers.CharField(required=False, allow_null=True)


class PaginatedResponseSerializer(SuccessResponseSerializer):
    """Serializer for paginated responses"""
    
    metadata = PaginatedResponseMetadataSerializer()


class ValidationErrorSerializer(ErrorResponseSerializer):
    """Serializer for validation error responses"""
    
    errors = serializers.DictField()
    error_code = serializers.CharField(default='VALIDATION_ERROR')


class NotFoundErrorSerializer(ErrorResponseSerializer):
    """Serializer for not found error responses"""
    
    error_code = serializers.CharField(default='RESOURCE_NOT_FOUND')
    details = serializers.DictField(required=False, allow_null=True)


class UnauthorizedErrorSerializer(ErrorResponseSerializer):
    """Serializer for unauthorized error responses"""
    
    error_code = serializers.CharField(default='AUTHENTICATION_REQUIRED')
    details = serializers.DictField(required=False, allow_null=True)


class ForbiddenErrorSerializer(ErrorResponseSerializer):
    """Serializer for forbidden error responses"""
    
    error_code = serializers.CharField(default='ACCESS_FORBIDDEN')
    details = serializers.DictField(required=False, allow_null=True)


class CreatedResponseSerializer(SuccessResponseSerializer):
    """Serializer for resource created responses"""
    
    metadata = serializers.DictField(required=False, allow_null=True)


class DeletedResponseSerializer(SuccessResponseSerializer):
    """Serializer for resource deleted responses"""
    
    metadata = serializers.DictField(required=False, allow_null=True)


# Specific response serializers for API views
class HealthCheckResponseSerializer(serializers.Serializer):
    """Serializer for health check responses"""
    status = serializers.CharField()
    timestamp = serializers.DateTimeField()
    services = serializers.JSONField()
    uptime = serializers.CharField(required=False)
    version = serializers.CharField(required=False)


class AnalyticsResponseSerializer(serializers.Serializer):
    """Serializer for analytics responses"""
    period = serializers.CharField()
    metrics = serializers.JSONField()
    charts = serializers.JSONField(required=False)
    summary = serializers.JSONField(required=False)


class DataResponseSerializer(serializers.Serializer):
    """Simple data response serializer"""
    success = serializers.BooleanField(default=True)
    data = serializers.JSONField()


class MessageResponseSerializer(serializers.Serializer):
    """Simple message response serializer"""
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()


class APIRootResponseSerializer(serializers.Serializer):
    """API root response serializer"""
    message = serializers.CharField()
    version = serializers.CharField()
    endpoints = serializers.JSONField()
    documentation = serializers.URLField(required=False)


class DashboardStatsResponseSerializer(serializers.Serializer):
    """Dashboard statistics response serializer"""
    stats = serializers.JSONField()
    period = serializers.CharField(required=False)
    last_updated = serializers.DateTimeField(required=False)


class ActivitiesResponseSerializer(serializers.Serializer):
    """Recent activities response serializer"""
    activities = serializers.JSONField()
    total_count = serializers.IntegerField(required=False)
    last_updated = serializers.DateTimeField(required=False)


class ChatResponseSerializer(serializers.Serializer):
    """Chat-related response serializer"""
    success = serializers.BooleanField(default=True)
    message = serializers.CharField(required=False)
    data = serializers.JSONField(required=False)


class EventResponseSerializer(serializers.Serializer):
    """Event-related response serializer"""
    success = serializers.BooleanField(default=True)
    message = serializers.CharField(required=False)
    event_data = serializers.JSONField(required=False)


class PollResponseSerializer(serializers.Serializer):
    """Poll response serializer"""
    success = serializers.BooleanField(default=True)
    poll_id = serializers.CharField(required=False)
    message = serializers.CharField(required=False)
    results = serializers.JSONField(required=False)


# Admin panel specific serializers
class AdminAnalyticsResponseSerializer(serializers.Serializer):
    """Admin analytics response serializer"""
    overview = serializers.JSONField()
    metrics = serializers.JSONField()
    charts = serializers.JSONField(required=False)
    period = serializers.CharField(required=False)


class AdminActionResponseSerializer(serializers.Serializer):
    """Admin action response serializer"""
    success = serializers.BooleanField(default=True)
    message = serializers.CharField()
    affected_items = serializers.IntegerField(required=False)
    details = serializers.JSONField(required=False)


class SystemHealthResponseSerializer(serializers.Serializer):
    """System health response serializer"""
    status = serializers.CharField()
    services = serializers.JSONField()
    metrics = serializers.JSONField(required=False)
    alerts = serializers.JSONField(required=False)


# API Documentation Examples
class APIResponseExamples:
    """Standard API response examples for documentation"""
    
    SUCCESS_EXAMPLE = {
        "success": True,
        "status": "success", 
        "message": "Data retrieved successfully",
        "timestamp": "2024-01-15T10:30:00Z",
        "request_id": "123e4567-e89b-12d3-a456-426614174000",
        "data": {
            "id": "456e7890-e89b-12d3-a456-426614174001",
            "name": "Example Resource"
        },
        "metadata": {
            "response_time_ms": 45.67,
            "api_version": "1.0"
        }
    }
    
    PAGINATED_EXAMPLE = {
        "success": True,
        "status": "success",
        "message": "Data retrieved successfully", 
        "timestamp": "2024-01-15T10:30:00Z",
        "request_id": "123e4567-e89b-12d3-a456-426614174000",
        "data": [
            {"id": "1", "name": "Item 1"},
            {"id": "2", "name": "Item 2"}
        ],
        "metadata": {
            "pagination": {
                "current_page": 1,
                "page_size": 20,
                "total_pages": 5,
                "total_items": 100,
                "has_next": True,
                "has_previous": False,
                "next_page": 2,
                "previous_page": None
            },
            "total_count": 100,
            "response_time_ms": 67.89,
            "api_version": "1.0"
        }
    }
    
    ERROR_EXAMPLE = {
        "success": False,
        "status": "error",
        "message": "Resource not found",
        "timestamp": "2024-01-15T10:30:00Z", 
        "request_id": "123e4567-e89b-12d3-a456-426614174000",
        "error_code": "RESOURCE_NOT_FOUND",
        "details": {
            "resource_type": "video",
            "resource_id": "456e7890-e89b-12d3-a456-426614174001"
        }
    }
    
    VALIDATION_ERROR_EXAMPLE = {
        "success": False,
        "status": "error",
        "message": "Validation failed",
        "timestamp": "2024-01-15T10:30:00Z",
        "request_id": "123e4567-e89b-12d3-a456-426614174000", 
        "error_code": "VALIDATION_ERROR",
        "errors": {
            "email": ["This field is required."],
            "password": ["Password must be at least 8 characters long."]
        }
    }
    
    CREATED_EXAMPLE = {
        "success": True,
        "status": "success",
        "message": "Resource created successfully",
        "timestamp": "2024-01-15T10:30:00Z",
        "request_id": "123e4567-e89b-12d3-a456-426614174000",
        "data": {
            "id": "456e7890-e89b-12d3-a456-426614174001",
            "name": "New Resource"
        },
        "metadata": {
            "resource_id": "456e7890-e89b-12d3-a456-426614174001",
            "location": "/api/resources/456e7890-e89b-12d3-a456-426614174001/",
            "response_time_ms": 89.12,
            "api_version": "1.0"
        }
    }


class ResponseStatusCodes:
    """Standard HTTP status codes and their meanings"""
    
    # Success codes
    SUCCESS = 200  # Standard success
    CREATED = 201  # Resource created
    ACCEPTED = 202  # Request accepted for processing
    NO_CONTENT = 204  # Success with no content to return
    
    # Client error codes
    BAD_REQUEST = 400  # Invalid request
    UNAUTHORIZED = 401  # Authentication required
    FORBIDDEN = 403  # Access denied
    NOT_FOUND = 404  # Resource not found
    METHOD_NOT_ALLOWED = 405  # HTTP method not allowed
    CONFLICT = 409  # Resource conflict
    VALIDATION_ERROR = 422  # Validation failed
    TOO_MANY_REQUESTS = 429  # Rate limit exceeded
    
    # Server error codes
    INTERNAL_ERROR = 500  # Internal server error
    BAD_GATEWAY = 502  # Bad gateway
    SERVICE_UNAVAILABLE = 503  # Service unavailable
    
    # Descriptions
    STATUS_DESCRIPTIONS = {
        200: "Success",
        201: "Created",
        202: "Accepted", 
        204: "No Content",
        400: "Bad Request",
        401: "Unauthorized",
        403: "Forbidden",
        404: "Not Found",
        405: "Method Not Allowed",
        409: "Conflict",
        422: "Unprocessable Entity",
        429: "Too Many Requests",
        500: "Internal Server Error",
        502: "Bad Gateway",
        503: "Service Unavailable"
    }


class ErrorCodes:
    """Standard application error codes"""
    
    # Authentication & Authorization
    AUTHENTICATION_REQUIRED = "AUTHENTICATION_REQUIRED"
    ACCESS_FORBIDDEN = "ACCESS_FORBIDDEN"
    INVALID_CREDENTIALS = "INVALID_CREDENTIALS"
    TOKEN_EXPIRED = "TOKEN_EXPIRED"
    
    # Validation
    VALIDATION_ERROR = "VALIDATION_ERROR"
    REQUIRED_FIELD_MISSING = "REQUIRED_FIELD_MISSING"
    INVALID_FORMAT = "INVALID_FORMAT"
    VALUE_OUT_OF_RANGE = "VALUE_OUT_OF_RANGE"
    
    # Resources
    RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND"
    RESOURCE_ALREADY_EXISTS = "RESOURCE_ALREADY_EXISTS"
    RESOURCE_CONFLICT = "RESOURCE_CONFLICT"
    RESOURCE_DELETED = "RESOURCE_DELETED"
    
    # Business Logic
    BUSINESS_RULE_VIOLATION = "BUSINESS_RULE_VIOLATION"
    INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
    QUOTA_EXCEEDED = "QUOTA_EXCEEDED"
    FEATURE_DISABLED = "FEATURE_DISABLED"
    
    # System
    INTERNAL_ERROR = "INTERNAL_ERROR"
    DATABASE_ERROR = "DATABASE_ERROR"
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    
    # Mobile specific
    DEVICE_NOT_REGISTERED = "DEVICE_NOT_REGISTERED"
    SYNC_CONFLICT = "SYNC_CONFLICT"
    OFFLINE_MODE_REQUIRED = "OFFLINE_MODE_REQUIRED"

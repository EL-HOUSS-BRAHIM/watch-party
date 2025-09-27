"""
Enhanced API documentation and schema generation
"""

from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.openapi import AutoSchema
from drf_spectacular.types import OpenApiTypes
from drf_spectacular import openapi
from rest_framework import serializers
from django.utils import timezone


class EnhancedAutoSchema(AutoSchema):
    """Enhanced schema generator with additional documentation features"""
    
    def get_operation_id(self):
        """Generate more descriptive operation IDs"""
        operation_id = super().get_operation_id()
        
        # Add version prefix if available
        # Use self.view instead of self.target (compatibility fix for drf-spectacular 0.28+)
        view = getattr(self, 'view', None)
        if view and hasattr(view, 'versioning_class'):
            version = getattr(getattr(self, 'request', None), 'version', 'v2')
            operation_id = f"{version}_{operation_id}"
        
        return operation_id
    
    def get_tags(self):
        """Enhanced tag generation based on app and model"""
        tags = super().get_tags()
        
        # Add additional tags based on view properties
        # Use self.view instead of self.target (compatibility fix for drf-spectacular 0.28+)
        view = getattr(self, 'view', None)
        if view and hasattr(view, 'queryset') and view.queryset is not None:
            model_name = view.queryset.model._meta.verbose_name
            tags.append(model_name.title())
        
        # Add permission-based tags
        if view and hasattr(view, 'permission_classes'):
            for permission_class in view.permission_classes:
                if 'Admin' in permission_class.__name__:
                    tags.append('Admin Only')
                elif 'Premium' in permission_class.__name__:
                    tags.append('Premium Feature')
        
        return tags
    
    def get_operation(self, path, path_regex, path_prefix, method, registry):
        """Enhanced operation documentation"""
        operation = super().get_operation(path, path_regex, path_prefix, method, registry)
        
        # Check if operation is None before modifying it
        if operation is None:
            return None
        
        # Add rate limiting information
        # Use self.view instead of self.target (compatibility fix for drf-spectacular 0.28+)
        view = getattr(self, 'view', None)
        if view and hasattr(view, 'throttle_classes') and view.throttle_classes:
            operation['x-rate-limit'] = {
                'description': 'This endpoint is rate limited',
                'classes': [cls.__name__ for cls in view.throttle_classes]
            }
        
        # Add caching information
        if view and hasattr(view, 'cache_timeout'):
            operation['x-cache'] = {
                'timeout': view.cache_timeout,
                'description': 'Response is cached'
            }
        
        # Add authentication requirements
        if view and hasattr(view, 'authentication_classes'):
            auth_types = [cls.__name__ for cls in view.authentication_classes]
            operation['x-authentication'] = {
                'types': auth_types,
                'required': not any('AllowAny' in perm.__name__ 
                                  for perm in getattr(view, 'permission_classes', []))
            }
        
        return operation


# Custom serializers for documentation
class SearchResponseSerializer(serializers.Serializer):
    """Search response documentation"""
    query = serializers.CharField(help_text="The search query")
    type = serializers.CharField(help_text="Search type filter")
    sort_by = serializers.CharField(help_text="Sort method")
    total_results = serializers.IntegerField(help_text="Total number of results")
    results = serializers.DictField(help_text="Search results by category")


class HealthCheckResponseSerializer(serializers.Serializer):
    """Health check response documentation"""
    status = serializers.CharField(help_text="System health status")
    timestamp = serializers.DateTimeField(help_text="Check timestamp")
    services = serializers.DictField(help_text="Service health status")


class ErrorResponseSerializer(serializers.Serializer):
    """Standard error response documentation"""
    success = serializers.BooleanField(default=False, help_text="Request success status")
    message = serializers.CharField(help_text="Error message")
    error_id = serializers.CharField(help_text="Unique error identifier")
    timestamp = serializers.DateTimeField(help_text="Error timestamp")
    details = serializers.DictField(required=False, help_text="Additional error details")


class SuccessResponseSerializer(serializers.Serializer):
    """Standard success response documentation"""
    success = serializers.BooleanField(default=True, help_text="Request success status")
    message = serializers.CharField(help_text="Success message")
    data = serializers.DictField(required=False, help_text="Response data")


# Common response examples
SUCCESS_EXAMPLE = OpenApiExample(
    'Success Response',
    summary='Successful operation',
    description='Standard successful response format',
    value={
        'success': True,
        'message': 'Operation completed successfully',
        'data': {}
    }
)

ERROR_EXAMPLE = OpenApiExample(
    'Error Response',
    summary='Error response',
    description='Standard error response format',
    value={
        'success': False,
        'error': 'Error message',
        'details': {}
    }
)

VALIDATION_ERROR_EXAMPLE = OpenApiExample(
    'Validation Error',
    summary='Validation error response',
    description='Response when input validation fails',
    value={
        'success': False,
        'error': 'Validation failed',
        'details': {
            'field_name': ['This field is required.']
        }
    }
)

AUTHENTICATION_ERROR_EXAMPLE = OpenApiExample(
    'Authentication Error',
    summary='Authentication required',
    description='Response when authentication is required but not provided',
    value={
        'detail': 'Authentication credentials were not provided.'
    }
)

PERMISSION_ERROR_EXAMPLE = OpenApiExample(
    'Permission Error',
    summary='Permission denied',
    description='Response when user lacks required permissions',
    value={
        'detail': 'You do not have permission to perform this action.'
    }
)

RATE_LIMIT_ERROR_EXAMPLE = OpenApiExample(
    'Rate Limit Error',
    summary='Rate limit exceeded',
    description='Response when rate limit is exceeded',
    value={
        'error': 'Rate limit exceeded',
        'retry_after': 3600
    }
)


# Common parameters
PAGE_PARAMETER = OpenApiParameter(
    name='page',
    type=OpenApiTypes.INT,
    location=OpenApiParameter.QUERY,
    description='Page number for pagination',
    default=1
)

PAGE_SIZE_PARAMETER = OpenApiParameter(
    name='page_size',
    type=OpenApiTypes.INT,
    location=OpenApiParameter.QUERY,
    description='Number of items per page',
    default=20
)

SEARCH_PARAMETER = OpenApiParameter(
    name='search',
    type=OpenApiTypes.STR,
    location=OpenApiParameter.QUERY,
    description='Search term to filter results'
)

ORDERING_PARAMETER = OpenApiParameter(
    name='ordering',
    type=OpenApiTypes.STR,
    location=OpenApiParameter.QUERY,
    description='Field to order results by. Use "-" prefix for descending order.',
    examples=[
        OpenApiExample('Ascending', value='created_at'),
        OpenApiExample('Descending', value='-created_at'),
    ]
)

API_VERSION_PARAMETER = OpenApiParameter(
    name='version',
    type=OpenApiTypes.STR,
    location=OpenApiParameter.QUERY,
    description='API version to use',
    enum=['v1', 'v2'],
    default='v2'
)


# Documentation decorators for common responses
def api_response_documentation(**kwargs):
    """Decorator for consistent API response documentation"""
    default_responses = {
        200: OpenApiExample(
            name='Success Response',
            value={
                'success': True,
                'message': 'Operation completed successfully',
                'data': {}
            }
        ),
        400: OpenApiExample(
            name='Bad Request',
            value={
                'success': False,
                'message': 'Invalid request data',
                'error_id': 'abc12345',
                'timestamp': timezone.now().isoformat()
            }
        ),
        401: OpenApiExample(
            name='Unauthorized',
            value={
                'success': False,
                'message': 'Authentication required',
                'error_id': 'def67890',
                'timestamp': timezone.now().isoformat()
            }
        ),
        403: OpenApiExample(
            name='Forbidden',
            value={
                'success': False,
                'message': 'Permission denied',
                'error_id': 'ghi12345',
                'timestamp': timezone.now().isoformat()
            }
        ),
        500: OpenApiExample(
            name='Internal Server Error',
            value={
                'success': False,
                'message': 'Internal server error',
                'error_id': 'jkl67890',
                'timestamp': timezone.now().isoformat()
            }
        )
    }
    
    # Merge with custom responses
    responses = {**default_responses, **kwargs.get('responses', {})}
    kwargs['responses'] = responses
    
    return extend_schema(**kwargs)


# Reusable schema decorators
def api_endpoint_schema(
    operation_id=None,
    summary=None,
    description=None,
    tags=None,
    examples=None,
    parameters=None,
    responses=None
):
    """Enhanced schema decorator for API endpoints"""
    
    def decorator(func):
        # Build default responses
        default_responses = {
            400: openapi.Response(
                description='Bad Request',
                examples={
                    'application/json': VALIDATION_ERROR_EXAMPLE.value
                }
            ),
            401: openapi.Response(
                description='Authentication Required',
                examples={
                    'application/json': AUTHENTICATION_ERROR_EXAMPLE.value
                }
            ),
            403: openapi.Response(
                description='Permission Denied',
                examples={
                    'application/json': PERMISSION_ERROR_EXAMPLE.value
                }
            ),
            429: openapi.Response(
                description='Rate Limit Exceeded',
                examples={
                    'application/json': RATE_LIMIT_ERROR_EXAMPLE.value
                }
            ),
            500: openapi.Response(
                description='Internal Server Error',
                examples={
                    'application/json': {
                        'error': 'An unexpected error occurred'
                    }
                }
            )
        }
        
        # Merge with custom responses
        if responses:
            default_responses.update(responses)
        
        return extend_schema(
            operation_id=operation_id,
            summary=summary,
            description=description,
            tags=tags,
            examples=examples,
            parameters=parameters,
            responses=default_responses
        )(func)
    
    return decorator


# Common parameters for documentation
SEARCH_PARAMETERS = [
    OpenApiParameter(
        name='q',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Search query string',
        required=True,
        examples=[
            OpenApiExample(name='Movie search', value='avengers'),
            OpenApiExample(name='User search', value='john_doe'),
        ]
    ),
    OpenApiParameter(
        name='type',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Search type filter',
        enum=['all', 'users', 'videos', 'parties', 'groups'],
        default='all'
    ),
    OpenApiParameter(
        name='sort',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Sort method',
        enum=['relevance', 'date', 'popularity', 'alphabetical'],
        default='relevance'
    ),
]

PAGINATION_PARAMETERS = [PAGE_PARAMETER, PAGE_SIZE_PARAMETER]

FILTER_PARAMETERS = [SEARCH_PARAMETER, ORDERING_PARAMETER]


# Schema documentation for major endpoints
GLOBAL_SEARCH_SCHEMA = extend_schema(
    operation_id='global_search',
    summary='Global Search',
    description='''
    Search across all content types including users, videos, watch parties, and social groups.
    
    Supports advanced filtering by date, category, and content type.
    Results are ranked by relevance by default but can be sorted by date, popularity, or alphabetically.
    
    Rate limited to 30 requests per minute per user.
    ''',
    parameters=SEARCH_PARAMETERS,
    responses={
        200: SearchResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        429: ErrorResponseSerializer,
    },
    tags=['Search'],
    examples=[
        OpenApiExample(
            name='Basic search',
            description='Simple search across all content',
            request_only=True,
            value={
                'q': 'avengers',
                'type': 'all'
            }
        ),
        OpenApiExample(
            name='Filtered search',
            description='Search with filters and sorting',
            request_only=True,
            value={
                'q': 'movie night',
                'type': 'parties',
                'sort': 'popularity',
                'date_filter': 'week'
            }
        )
    ]
)

HEALTH_CHECK_SCHEMA = extend_schema(
    operation_id='health_check',
    summary='System Health Check',
    description='''
    Basic health check endpoint for monitoring and load balancers.
    
    Returns system status and basic service availability.
    Public endpoint that doesn't require authentication.
    ''',
    responses={
        200: HealthCheckResponseSerializer,
        503: ErrorResponseSerializer,
    },
    tags=['System'],
)


def websocket_documentation():
    """Generate WebSocket API documentation"""
    
    return {
        'websocket_endpoints': {
            '/ws/party/{party_id}/': {
                'description': 'WebSocket connection for real-time party communication',
                'authentication': 'JWT token in Authorization header',
                'message_types': {
                    'chat_message': {
                        'description': 'Send a chat message',
                        'payload': {
                            'type': 'chat_message',
                            'data': {
                                'message': 'string',
                                'timestamp': 'ISO datetime'
                            }
                        }
                    },
                    'video_control': {
                        'description': 'Control video playback',
                        'payload': {
                            'type': 'video_control',
                            'data': {
                                'action': 'play|pause|seek',
                                'timestamp': 'number (for seek)',
                                'video_time': 'number'
                            }
                        }
                    }
                }
            }
        }
    }


class APIDocumentationMixin:
    """Mixin to add documentation to API views"""
    
    @classmethod
    def add_schema_documentation(cls, **kwargs):
        """Add schema documentation to view"""
        return extend_schema_view(**kwargs)(cls)
    
    def get_schema_operation_description(self):
        """Get operation description for schema"""
        return getattr(self, 'schema_description', self.__doc__ or '')
    
    def get_schema_tags(self):
        """Get tags for schema"""
        return getattr(self, 'schema_tags', [self.__class__.__name__.replace('View', '')])


# Custom schema extensions removed due to compatibility issues
# The functionality will be added back in a future version

class HealthCheckResponseSerializer(serializers.Serializer):
    """Health check response documentation"""
    status = serializers.CharField(help_text="System health status")
    timestamp = serializers.DateTimeField(help_text="Check timestamp")
    services = serializers.DictField(help_text="Service health status")


class ErrorResponseSerializer(serializers.Serializer):
    """Standard error response documentation"""
    success = serializers.BooleanField(default=False, help_text="Request success status")
    message = serializers.CharField(help_text="Error message")
    error_id = serializers.CharField(help_text="Unique error identifier")
    timestamp = serializers.DateTimeField(help_text="Error timestamp")
    details = serializers.DictField(required=False, help_text="Additional error details")


class SuccessResponseSerializer(serializers.Serializer):
    """Standard success response documentation"""
    success = serializers.BooleanField(default=True, help_text="Request success status")
    message = serializers.CharField(help_text="Success message")
    data = serializers.DictField(required=False, help_text="Response data")


# Documentation decorators for common responses
def api_response_documentation(**kwargs):
    """Decorator for consistent API response documentation"""
    default_responses = {
        200: OpenApiExample(
            name='Success Response',
            value={
                'success': True,
                'message': 'Operation completed successfully',
                'data': {}
            }
        ),
        400: OpenApiExample(
            name='Bad Request',
            value={
                'success': False,
                'message': 'Invalid request data',
                'error_id': 'abc12345',
                'timestamp': timezone.now().isoformat()
            }
        ),
        401: OpenApiExample(
            name='Unauthorized',
            value={
                'success': False,
                'message': 'Authentication required',
                'error_id': 'def67890',
                'timestamp': timezone.now().isoformat()
            }
        ),
        403: OpenApiExample(
            name='Forbidden',
            value={
                'success': False,
                'message': 'Permission denied',
                'error_id': 'ghi12345',
                'timestamp': timezone.now().isoformat()
            }
        ),
        500: OpenApiExample(
            name='Internal Server Error',
            value={
                'success': False,
                'message': 'Internal server error',
                'error_id': 'jkl67890',
                'timestamp': timezone.now().isoformat()
            }
        )
    }
    
    # Merge with custom responses
    responses = {**default_responses, **kwargs.get('responses', {})}
    kwargs['responses'] = responses
    
    return extend_schema(**kwargs)


# Common parameters for documentation
SEARCH_PARAMETERS = [
    OpenApiParameter(
        name='q',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Search query string',
        required=True,
        examples=[
            OpenApiExample(name='Movie search', value='avengers'),
            OpenApiExample(name='User search', value='john_doe'),
        ]
    ),
    OpenApiParameter(
        name='type',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Search type filter',
        enum=['all', 'users', 'videos', 'parties', 'groups'],
        default='all'
    ),
    OpenApiParameter(
        name='sort',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Sort method',
        enum=['relevance', 'date', 'popularity', 'alphabetical'],
        default='relevance'
    ),
    OpenApiParameter(
        name='date_filter',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Date range filter',
        enum=['all', 'today', 'week', 'month', 'year'],
        default='all'
    ),
    OpenApiParameter(
        name='category',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Category filter',
        required=False
    ),
    OpenApiParameter(
        name='limit',
        type=OpenApiTypes.INT,
        location=OpenApiParameter.QUERY,
        description='Maximum number of results per category',
        default=10
    ),
]

PAGINATION_PARAMETERS = [
    OpenApiParameter(
        name='page',
        type=OpenApiTypes.INT,
        location=OpenApiParameter.QUERY,
        description='Page number',
        default=1
    ),
    OpenApiParameter(
        name='page_size',
        type=OpenApiTypes.INT,
        location=OpenApiParameter.QUERY,
        description='Number of items per page',
        default=20
    ),
]

FILTER_PARAMETERS = [
    OpenApiParameter(
        name='search',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Search term for filtering results'
    ),
    OpenApiParameter(
        name='ordering',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.QUERY,
        description='Field to order results by (prefix with - for descending)'
    ),
]


# Schema documentation for major endpoints
GLOBAL_SEARCH_SCHEMA = extend_schema(
    operation_id='global_search',
    summary='Global Search',
    description='''
    Search across all content types including users, videos, watch parties, and social groups.
    
    Supports advanced filtering by date, category, and content type.
    Results are ranked by relevance by default but can be sorted by date, popularity, or alphabetically.
    
    Rate limited to 30 requests per minute per user.
    ''',
    parameters=SEARCH_PARAMETERS,
    responses={
        200: SearchResponseSerializer,
        400: ErrorResponseSerializer,
        401: ErrorResponseSerializer,
        429: ErrorResponseSerializer,
    },
    tags=['Search'],
    examples=[
        OpenApiExample(
            name='Basic search',
            description='Simple search across all content',
            request_only=True,
            value={
                'q': 'avengers',
                'type': 'all'
            }
        ),
        OpenApiExample(
            name='Filtered search',
            description='Search with filters and sorting',
            request_only=True,
            value={
                'q': 'movie night',
                'type': 'parties',
                'sort': 'popularity',
                'date_filter': 'week'
            }
        )
    ]
)

HEALTH_CHECK_SCHEMA = extend_schema(
    operation_id='health_check',
    summary='System Health Check',
    description='''
    Basic health check endpoint for monitoring and load balancers.
    
    Returns system status and basic service availability.
    Public endpoint that doesn't require authentication.
    ''',
    responses={
        200: HealthCheckResponseSerializer,
        503: ErrorResponseSerializer,
    },
    tags=['System'],
)

DETAILED_STATUS_SCHEMA = extend_schema(
    operation_id='detailed_status',
    summary='Detailed System Status',
    description='''
    Comprehensive system status for administrators.
    
    Includes detailed information about:
    - System resources (CPU, memory, disk)
    - Database status and statistics
    - Cache performance
    - Application metrics
    
    Requires admin permissions.
    ''',
    responses={
        200: SuccessResponseSerializer,
        401: ErrorResponseSerializer,
        403: ErrorResponseSerializer,
        500: ErrorResponseSerializer,
    },
    tags=['Admin', 'System'],
)


class APIDocumentationMixin:
    """Mixin to add documentation to API views"""
    
    @classmethod
    def add_schema_documentation(cls, **kwargs):
        """Add schema documentation to view"""
        return extend_schema_view(**kwargs)(cls)
    
    def get_schema_operation_description(self):
        """Get operation description for schema"""
        return getattr(self, 'schema_description', self.__doc__ or '')
    
    def get_schema_tags(self):
        """Get tags for schema"""
        return getattr(self, 'schema_tags', [self.__class__.__name__.replace('View', '')])


# Custom schema extensions
def api_version_parameter():
    """API version parameter for all endpoints"""
    return OpenApiParameter(
        name='X-API-Version',
        type=OpenApiTypes.STR,
        location=OpenApiParameter.HEADER,
        description='API version',
        default='1.0',
        required=False
    )


def rate_limit_headers():
    """Rate limit response headers"""
    return {
        'X-RateLimit-Limit': OpenApiTypes.INT,
        'X-RateLimit-Remaining': OpenApiTypes.INT,
        'X-RateLimit-Reset': OpenApiTypes.INT,
    }


def performance_headers():
    """Performance response headers"""
    return {
        'X-Response-Time': OpenApiTypes.STR,
        'X-Request-ID': OpenApiTypes.STR,
    }

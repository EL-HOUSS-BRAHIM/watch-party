"""
Enhanced API documentation and schema generation
"""

from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes
from rest_framework import serializers
from django.utils import timezone


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

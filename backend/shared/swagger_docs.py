"""
Swagger API Documentation Decorators and Examples
This file provides examples of how to enhance your API views with better Swagger documentation
"""

from drf_spectacular.utils import (
    extend_schema, 
    extend_schema_view, 
    OpenApiParameter, 
    OpenApiExample, 
    OpenApiResponse,
    OpenApiTypes
)


# Example decorators for common API patterns

def swagger_auto_schema_list_create():
    """Decorator for list/create ViewSet actions"""
    return extend_schema_view(
        list=extend_schema(
            summary="List items",
            description="Retrieve a paginated list of items",
            parameters=[
                OpenApiParameter(
                    name='page',
                    type=OpenApiTypes.INT,
                    location=OpenApiParameter.QUERY,
                    description='Page number'
                ),
                OpenApiParameter(
                    name='page_size',
                    type=OpenApiTypes.INT,
                    location=OpenApiParameter.QUERY,
                    description='Number of items per page (max 100)'
                ),
                OpenApiParameter(
                    name='search',
                    type=OpenApiTypes.STR,
                    location=OpenApiParameter.QUERY,
                    description='Search query'
                ),
            ],
            responses={
                200: OpenApiResponse(description="List retrieved successfully"),
                401: OpenApiResponse(description="Authentication required"),
            }
        ),
        create=extend_schema(
            summary="Create new item",
            description="Create a new item with the provided data",
            responses={
                201: OpenApiResponse(description="Item created successfully"),
                400: OpenApiResponse(description="Validation error"),
                401: OpenApiResponse(description="Authentication required"),
            }
        )
    )


def swagger_auto_schema_detail():
    """Decorator for detail ViewSet actions"""
    return extend_schema_view(
        retrieve=extend_schema(
            summary="Get item details",
            description="Retrieve details of a specific item",
            responses={
                200: OpenApiResponse(description="Item details retrieved"),
                404: OpenApiResponse(description="Item not found"),
                401: OpenApiResponse(description="Authentication required"),
            }
        ),
        update=extend_schema(
            summary="Update item",
            description="Update an existing item",
            responses={
                200: OpenApiResponse(description="Item updated successfully"),
                400: OpenApiResponse(description="Validation error"),
                404: OpenApiResponse(description="Item not found"),
                401: OpenApiResponse(description="Authentication required"),
                403: OpenApiResponse(description="Permission denied"),
            }
        ),
        partial_update=extend_schema(
            summary="Partially update item",
            description="Partially update an existing item",
            responses={
                200: OpenApiResponse(description="Item updated successfully"),
                400: OpenApiResponse(description="Validation error"),
                404: OpenApiResponse(description="Item not found"),
                401: OpenApiResponse(description="Authentication required"),
                403: OpenApiResponse(description="Permission denied"),
            }
        ),
        destroy=extend_schema(
            summary="Delete item",
            description="Delete an existing item",
            responses={
                204: OpenApiResponse(description="Item deleted successfully"),
                404: OpenApiResponse(description="Item not found"),
                401: OpenApiResponse(description="Authentication required"),
                403: OpenApiResponse(description="Permission denied"),
            }
        )
    )


# Example API view documentation
class ExampleAPIViewDocumentation:
    """
    Example of how to document your API views with drf_spectacular
    """
    
    @extend_schema(
        operation_id="example_list_videos",
        summary="List Videos",
        description="Retrieve a paginated list of videos with filtering options",
        tags=["Videos"],
        parameters=[
            OpenApiParameter(
                name='category',
                type=OpenApiTypes.STR,
                location=OpenApiParameter.QUERY,
                description='Filter by video category',
                enum=['movies', 'tv_shows', 'documentaries', 'music_videos']
            ),
            OpenApiParameter(
                name='uploaded_by',
                type=OpenApiTypes.UUID,
                location=OpenApiParameter.QUERY,
                description='Filter by uploader user ID'
            ),
            OpenApiParameter(
                name='duration_min',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Minimum duration in seconds'
            ),
            OpenApiParameter(
                name='duration_max',
                type=OpenApiTypes.INT,
                location=OpenApiParameter.QUERY,
                description='Maximum duration in seconds'
            ),
        ],
        responses={
            200: OpenApiResponse(
                description="Videos retrieved successfully",
                examples=[
                    OpenApiExample(
                        'Success Response',
                        summary='Successful video list response',
                        description='Example of successful video list retrieval',
                        value={
                            "count": 25,
                            "next": "http://api.example.com/videos/?page=2",
                            "previous": None,
                            "results": [
                                {
                                    "id": "123e4567-e89b-12d3-a456-426614174000",
                                    "title": "Sample Movie",
                                    "description": "A great movie to watch",
                                    "thumbnail": "https://example.com/thumbnail.jpg",
                                    "duration": 7200,
                                    "category": "movies",
                                    "uploaded_by": {
                                        "id": "123e4567-e89b-12d3-a456-426614174001",
                                        "username": "johndoe",
                                        "display_name": "John Doe"
                                    },
                                    "created_at": "2025-08-10T12:00:00Z",
                                    "is_public": True,
                                    "view_count": 150
                                }
                            ]
                        }
                    )
                ]
            ),
            401: OpenApiResponse(description="Authentication required"),
            429: OpenApiResponse(description="Rate limit exceeded"),
        }
    )
    def list_videos(self, request):
        """List videos endpoint"""

    @extend_schema(
        operation_id="example_create_party",
        summary="Create Watch Party",
        description="Create a new watch party for synchronized video viewing",
        tags=["Parties"],
        request={
            'application/json': {
                'type': 'object',
                'properties': {
                    'title': {
                        'type': 'string',
                        'description': 'Party title',
                        'example': 'Friday Movie Night'
                    },
                    'description': {
                        'type': 'string',
                        'description': 'Party description',
                        'example': 'Join us for a fun movie night!'
                    },
                    'video_id': {
                        'type': 'string',
                        'format': 'uuid',
                        'description': 'ID of the video to watch'
                    },
                    'is_public': {
                        'type': 'boolean',
                        'description': 'Whether the party is public',
                        'example': True
                    },
                    'max_participants': {
                        'type': 'integer',
                        'description': 'Maximum number of participants',
                        'example': 10,
                        'minimum': 2,
                        'maximum': 100
                    },
                    'scheduled_for': {
                        'type': 'string',
                        'format': 'date-time',
                        'description': 'Scheduled start time (optional)',
                        'example': '2025-08-10T20:00:00Z'
                    }
                },
                'required': ['title', 'video_id']
            }
        },
        responses={
            201: OpenApiResponse(
                description="Party created successfully",
                examples=[
                    OpenApiExample(
                        'Created Party',
                        summary='Successfully created party',
                        value={
                            "id": "123e4567-e89b-12d3-a456-426614174000",
                            "title": "Friday Movie Night",
                            "description": "Join us for a fun movie night!",
                            "host": {
                                "id": "123e4567-e89b-12d3-a456-426614174001",
                                "username": "johndoe",
                                "display_name": "John Doe"
                            },
                            "video": {
                                "id": "123e4567-e89b-12d3-a456-426614174002",
                                "title": "Sample Movie",
                                "duration": 7200
                            },
                            "is_public": True,
                            "max_participants": 10,
                            "current_participants": 1,
                            "status": "waiting",
                            "invite_code": "ABC123",
                            "created_at": "2025-08-10T12:00:00Z",
                            "scheduled_for": "2025-08-10T20:00:00Z"
                        }
                    )
                ]
            ),
            400: OpenApiResponse(
                description="Validation error",
                examples=[
                    OpenApiExample(
                        'Validation Error',
                        summary='Example validation error',
                        value={
                            "success": False,
                            "errors": {
                                "title": ["This field is required."],
                                "max_participants": ["Ensure this value is less than or equal to 100."]
                            }
                        }
                    )
                ]
            ),
            401: OpenApiResponse(description="Authentication required"),
            404: OpenApiResponse(
                description="Video not found",
                examples=[
                    OpenApiExample(
                        'Video Not Found',
                        summary='Referenced video does not exist',
                        value={
                            "success": False,
                            "error": "video_not_found",
                            "message": "The specified video does not exist or is not accessible."
                        }
                    )
                ]
            )
        }
    )
    def create_party(self, request):
        """Create party endpoint"""


# Authentication examples for Swagger
SWAGGER_AUTH_EXAMPLES = {
    'bearer_token': OpenApiExample(
        'Bearer Token',
        summary='JWT Authentication',
        description='Include your JWT access token in the Authorization header',
        value='Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...'
    )
}

# Common error response examples
COMMON_ERROR_RESPONSES = {
    400: OpenApiResponse(
        description="Bad Request",
        examples=[
            OpenApiExample(
                'Validation Error',
                summary='Field validation failed',
                value={
                    "success": False,
                    "errors": {
                        "field_name": ["This field is required."]
                    },
                    "timestamp": "2025-08-10T12:00:00Z"
                }
            )
        ]
    ),
    401: OpenApiResponse(
        description="Unauthorized",
        examples=[
            OpenApiExample(
                'Authentication Required',
                summary='Valid authentication credentials required',
                value={
                    "success": False,
                    "error": "authentication_required",
                    "message": "Authentication credentials were not provided."
                }
            )
        ]
    ),
    403: OpenApiResponse(
        description="Forbidden",
        examples=[
            OpenApiExample(
                'Permission Denied',
                summary='Insufficient permissions',
                value={
                    "success": False,
                    "error": "permission_denied",
                    "message": "You do not have permission to perform this action."
                }
            )
        ]
    ),
    404: OpenApiResponse(
        description="Not Found",
        examples=[
            OpenApiExample(
                'Resource Not Found',
                summary='Requested resource does not exist',
                value={
                    "success": False,
                    "error": "not_found",
                    "message": "The requested resource was not found."
                }
            )
        ]
    ),
    429: OpenApiResponse(
        description="Too Many Requests",
        examples=[
            OpenApiExample(
                'Rate Limit Exceeded',
                summary='API rate limit exceeded',
                value={
                    "success": False,
                    "error": "rate_limit_exceeded",
                    "message": "Too many requests. Please try again later.",
                    "retry_after": 60
                }
            )
        ]
    ),
    500: OpenApiResponse(
        description="Internal Server Error",
        examples=[
            OpenApiExample(
                'Server Error',
                summary='Internal server error occurred',
                value={
                    "success": False,
                    "error": "internal_server_error",
                    "message": "An internal server error occurred."
                }
            )
        ]
    ),
}


# How to apply these decorators to your ViewSets:
"""
from drf_spectacular.utils import extend_schema_view
from .swagger_docs import swagger_auto_schema_list_create, swagger_auto_schema_detail

@swagger_auto_schema_list_create()
@swagger_auto_schema_detail()
class VideoViewSet(ModelViewSet):
    # Your ViewSet implementation
    pass

# Or for individual methods:
class PartyViewSet(ModelViewSet):
    @extend_schema(
        summary="Join Party",
        description="Join an existing watch party",
        tags=["Parties"],
        request=None,
        responses={
            200: OpenApiResponse(description="Successfully joined party"),
            404: OpenApiResponse(description="Party not found"),
            403: OpenApiResponse(description="Party is full or private"),
        }
    )
    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        # Implementation
        pass
"""

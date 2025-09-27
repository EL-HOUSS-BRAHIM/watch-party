# Enhanced Swagger API Documentation Guide

## Overview

Your Watch Party Backend now has a fully configured Swagger/OpenAPI documentation system using `drf_spectacular`. This provides interactive API documentation that's much more powerful than Django's built-in REST framework documentation.

## Access Your API Documentation

1. **Swagger UI (Interactive)**: `http://localhost:8000/api/docs/`
   - Interactive interface for testing API endpoints
   - Built-in authentication support
   - Try-it-out functionality

2. **ReDoc (Clean Documentation)**: `http://localhost:8000/api/redoc/`
   - Clean, professional documentation view
   - Better for reading and sharing

3. **OpenAPI Schema**: `http://localhost:8000/api/schema/`
   - Raw OpenAPI 3.0 schema in JSON format
   - Can be imported into other tools

4. **Convenience Shortcuts**:
   - `http://localhost:8000/docs/` → redirects to Swagger UI
   - `http://localhost:8000/swagger/` → redirects to Swagger UI

## Enhanced Features Configured

### 1. **Interactive Testing**
- **Try it out** buttons on all endpoints
- **Authentication** persistence across requests
- **Real-time** request/response examples

### 2. **Better Organization**
- **Tags** for grouping related endpoints
- **Alphabetical sorting** of operations
- **Expandable sections** for better navigation

### 3. **Enhanced UI/UX**
- **Deep linking** to specific endpoints
- **Search functionality** across all endpoints
- **Filter** capabilities
- **Request duration** display
- **Custom theme** with brand colors

### 4. **Comprehensive Documentation**
- **Detailed descriptions** for all endpoints
- **Request/response examples** with real data
- **Parameter documentation** with types and constraints
- **Error response examples** for common scenarios

## How to Enhance Your API Views

### 1. **Import Required Decorators**

Add to your view files:

```python
from drf_spectacular.utils import (
    extend_schema, 
    extend_schema_view, 
    OpenApiParameter, 
    OpenApiExample, 
    OpenApiResponse
)
```

### 2. **Enhance ViewSets**

```python
from core.swagger_docs import swagger_auto_schema_list_create, swagger_auto_schema_detail

@swagger_auto_schema_list_create()
@swagger_auto_schema_detail()
class VideoViewSet(ModelViewSet):
    """
    ViewSet for managing videos
    
    This ViewSet provides CRUD operations for video management,
    including upload, streaming, and analytics features.
    """
    # Your existing code
```

### 3. **Enhance Individual Actions**

```python
@extend_schema(
    summary="Join Watch Party",
    description="Join an existing watch party if there's space available",
    tags=["Parties"],
    responses={
        200: OpenApiResponse(description="Successfully joined party"),
        404: OpenApiResponse(description="Party not found"),
        403: OpenApiResponse(description="Party is full or access denied"),
    }
)
@action(detail=True, methods=['post'])
def join(self, request, pk=None):
    # Your implementation
    pass
```

### 4. **Add Parameter Documentation**

```python
@extend_schema(
    parameters=[
        OpenApiParameter(
            name='category',
            type=OpenApiTypes.STR,
            location=OpenApiParameter.QUERY,
            description='Filter by video category',
            enum=['movies', 'tv_shows', 'documentaries']
        ),
        OpenApiParameter(
            name='duration_min',
            type=OpenApiTypes.INT,
            location=OpenApiParameter.QUERY,
            description='Minimum duration in seconds'
        ),
    ]
)
def list(self, request):
    # Your implementation
    pass
```

### 5. **Add Request/Response Examples**

```python
@extend_schema(
    responses={
        201: OpenApiResponse(
            description="Video uploaded successfully",
            examples=[
                OpenApiExample(
                    'Success Example',
                    value={
                        "id": "123e4567-e89b-12d3-a456-426614174000",
                        "title": "My Video",
                        "status": "processing",
                        "upload_progress": 100
                    }
                )
            ]
        )
    }
)
def create(self, request):
    # Your implementation
    pass
```

## Authentication in Swagger

### Setup JWT Authentication
1. Go to `http://localhost:8000/api/docs/`
2. Click the **"Authorize"** button (🔒 icon)
3. Enter your JWT token in the format: `Bearer your_jwt_token`
4. Click **"Authorize"**
5. Now all authenticated endpoints will include your token

### Get JWT Token
1. Use the `/api/auth/login/` endpoint in Swagger
2. Enter your credentials
3. Copy the `access_token` from the response
4. Use it in the Authorization setup

## Testing Your Documentation

Run the test script to verify everything is working:

```bash
./test_swagger_docs.sh
```

This will:
- Check if the server is running
- Test all documentation endpoints
- Show you the access URLs
- Verify the setup is working correctly

## Best Practices

### 1. **Add Meaningful Descriptions**
- Write clear, concise endpoint descriptions
- Explain what each parameter does
- Document expected behavior

### 2. **Use Proper Tags**
- Group related endpoints with tags
- Use consistent tag naming
- Tags configured: Authentication, Users, Videos, Parties, Chat, Billing, Analytics, etc.

### 3. **Document Error Responses**
- Include common error scenarios
- Provide example error responses
- Use appropriate HTTP status codes

### 4. **Add Examples**
- Provide realistic request examples
- Include successful response examples
- Show error response examples

### 5. **Keep It Updated**
- Update documentation when changing APIs
- Review and improve descriptions regularly
- Add new endpoints to appropriate tags

## Advanced Features

### 1. **Custom Schema Processors**
You can add custom schema processing in `settings.py`:

```python
SPECTACULAR_SETTINGS = {
    'POSTPROCESSING_HOOKS': [
        'your_app.hooks.custom_postprocess_schema'
    ],
}
```

### 2. **Custom Authentication Schemes**
Add custom authentication documentation:

```python
@extend_schema(
    auth=['Bearer Token'],
    description="Requires valid JWT authentication"
)
```

### 3. **File Upload Documentation**
For file uploads:

```python
@extend_schema(
    request={
        'multipart/form-data': {
            'type': 'object',
            'properties': {
                'file': {
                    'type': 'string',
                    'format': 'binary'
                },
                'title': {
                    'type': 'string'
                }
            }
        }
    }
)
```

## Troubleshooting

### Common Issues:

1. **Schema Generation Errors**
   - Check for circular imports
   - Ensure all serializers are properly defined
   - Check for missing permissions

2. **Missing Endpoints**
   - Ensure views are properly registered in URLconf
   - Check if views have proper decorators
   - Verify ViewSet actions are defined correctly

3. **Authentication Issues**
   - Check JWT token format
   - Ensure token is not expired
   - Verify authentication settings in DRF

### Debug Mode:
Set `DEBUG = True` in settings and check the console for detailed error messages.

## Migration from Django REST Framework Docs

If you were previously using Django REST framework's built-in documentation:

1. **Remove old settings**:
   ```python
   # Remove from settings.py
   'rest_framework.documentation'
   ```

2. **Update URLs**:
   ```python
   # Replace old documentation URLs
   # path('docs/', include_docs_urls('API Documentation'))
   # With the new Swagger URLs (already configured)
   ```

3. **Update view decorators**:
   ```python
   # Replace @api_view decorators with @extend_schema
   # for better documentation
   ```

## Conclusion

Your Watch Party Backend now has professional-grade API documentation with Swagger/OpenAPI 3.0. The documentation is:

- ✅ **Interactive** - Test endpoints directly in the browser
- ✅ **Comprehensive** - Detailed descriptions and examples
- ✅ **Professional** - Clean, organized, and searchable
- ✅ **Authenticated** - Supports JWT authentication
- ✅ **Extensible** - Easy to enhance with more details

Start enhancing your individual API views with the decorators and examples provided for even better documentation!

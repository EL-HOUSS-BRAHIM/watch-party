"""
Standardized response classes for consistent API responses
"""

from rest_framework.response import Response
from rest_framework import status


class StandardResponse:
    """
    Provides standardized response formats for the API
    All endpoints should use these methods for consistent responses
    """
    
    @staticmethod
    def success(data=None, message="Success", status_code=status.HTTP_200_OK):
        """
        Standard success response format
        
        Args:
            data: Response data (optional)
            message: Success message (default: "Success")
            status_code: HTTP status code (default: 200)
        
        Returns:
            Response object with standardized format
        """
        response_data = {
            "success": True,
            "message": message
        }
        
        if data is not None:
            response_data["data"] = data
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(message="Error", details=None, status_code=status.HTTP_400_BAD_REQUEST, errors=None):
        """
        Standard error response format
        
        Args:
            message: Error message (default: "Error")
            details: Additional error details (optional)
            status_code: HTTP status code (default: 400)
            errors: Field-specific errors (optional)
        
        Returns:
            Response object with standardized error format
        """
        response_data = {
            "success": False,
            "message": message
        }
        
        if details is not None:
            response_data["details"] = details
            
        if errors is not None:
            response_data["errors"] = errors
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def validation_error(errors, message="Validation failed", status_code=status.HTTP_400_BAD_REQUEST):
        """
        Standard validation error response format
        
        Args:
            errors: Validation errors dictionary
            message: Error message (default: "Validation failed")
            status_code: HTTP status code (default: 400)
        
        Returns:
            Response object with standardized validation error format
        """
        return StandardResponse.error(
            message=message,
            errors=errors,
            status_code=status_code
        )
    
    @staticmethod
    def not_found(message="Resource not found", details=None):
        """
        Standard not found response format
        
        Args:
            message: Error message (default: "Resource not found")
            details: Additional details (optional)
        
        Returns:
            Response object with 404 status
        """
        return StandardResponse.error(
            message=message,
            details=details,
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    @staticmethod
    def unauthorized(message="Unauthorized access", details=None):
        """
        Standard unauthorized response format
        
        Args:
            message: Error message (default: "Unauthorized access")
            details: Additional details (optional)
        
        Returns:
            Response object with 401 status
        """
        return StandardResponse.error(
            message=message,
            details=details,
            status_code=status.HTTP_401_UNAUTHORIZED
        )
    
    @staticmethod
    def forbidden(message="Access forbidden", details=None):
        """
        Standard forbidden response format
        
        Args:
            message: Error message (default: "Access forbidden")
            details: Additional details (optional)
        
        Returns:
            Response object with 403 status
        """
        return StandardResponse.error(
            message=message,
            details=details,
            status_code=status.HTTP_403_FORBIDDEN
        )
    
    @staticmethod
    def server_error(message="Internal server error", details=None):
        """
        Standard server error response format
        
        Args:
            message: Error message (default: "Internal server error")
            details: Additional details (optional)
        
        Returns:
            Response object with 500 status
        """
        return StandardResponse.error(
            message=message,
            details=details,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    
    @staticmethod
    def created(data=None, message="Resource created successfully"):
        """
        Standard creation response format
        
        Args:
            data: Created resource data (optional)
            message: Success message (default: "Resource created successfully")
        
        Returns:
            Response object with 201 status
        """
        return StandardResponse.success(
            data=data,
            message=message,
            status_code=status.HTTP_201_CREATED
        )
    
    @staticmethod
    def no_content(message="Operation completed successfully"):
        """
        Standard no content response format
        
        Args:
            message: Success message (default: "Operation completed successfully")
        
        Returns:
            Response object with 204 status
        """
        return Response({
            "success": True,
            "message": message
        }, status=status.HTTP_204_NO_CONTENT)


class PaginatedResponse:
    """
    Standardized paginated response format
    """
    
    @staticmethod
    def paginate(data, page_obj, message="Data retrieved successfully"):
        """
        Create paginated response
        
        Args:
            data: Serialized data list
            page_obj: Paginator page object
            message: Success message
        
        Returns:
            Response with pagination metadata
        """
        return StandardResponse.success(
            data={
                "results": data,
                "pagination": {
                    "current_page": page_obj.number,
                    "total_pages": page_obj.paginator.num_pages,
                    "total_items": page_obj.paginator.count,
                    "page_size": page_obj.paginator.per_page,
                    "has_next": page_obj.has_next(),
                    "has_previous": page_obj.has_previous(),
                    "next_page": page_obj.next_page_number() if page_obj.has_next() else None,
                    "previous_page": page_obj.previous_page_number() if page_obj.has_previous() else None
                }
            },
            message=message
        )


class ListResponse:
    """
    Standardized list response format
    """
    
    @staticmethod
    def list(data, total_count=None, message="Data retrieved successfully"):
        """
        Create list response
        
        Args:
            data: Serialized data list
            total_count: Total number of items (optional)
            message: Success message
        
        Returns:
            Response with list metadata
        """
        response_data = {
            "results": data,
            "count": len(data) if total_count is None else total_count
        }
        
        return StandardResponse.success(
            data=response_data,
            message=message
        )

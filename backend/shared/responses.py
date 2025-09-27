"""
Enhanced Standardized Response System (Task 12)
Provides consistent API response formats across all endpoints
"""

from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
import uuid
from typing import Any, Dict, List


class EnhancedStandardResponse:
    """
    Enhanced standardized response system for consistent API responses
    Includes metadata, request tracking, and comprehensive error handling
    """
    
    @staticmethod
    def success(
        data: Any = None, 
        message: str = "Success", 
        status_code: int = status.HTTP_200_OK,
        metadata: Dict = None,
        request_id: str = None
    ) -> Response:
        """
        Enhanced standard success response format
        
        Args:
            data: Response data (any type)
            message: Success message
            status_code: HTTP status code
            metadata: Additional metadata (pagination, totals, etc.)
            request_id: Unique request identifier
        
        Returns:
            Response object with enhanced standardized format
        """
        response_data = {
            "success": True,
            "status": "success",
            "message": message,
            "timestamp": timezone.now().isoformat(),
            "request_id": request_id or str(uuid.uuid4())
        }
        
        if data is not None:
            response_data["data"] = data
            
        if metadata:
            response_data["metadata"] = metadata
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def error(
        message: str = "Error", 
        details: Any = None, 
        status_code: int = status.HTTP_400_BAD_REQUEST,
        errors: Dict = None,
        error_code: str = None,
        request_id: str = None
    ) -> Response:
        """
        Enhanced standard error response format
        
        Args:
            message: Error message
            details: Additional error details
            status_code: HTTP status code
            errors: Field-specific validation errors
            error_code: Application-specific error code
            request_id: Unique request identifier
        
        Returns:
            Response object with enhanced standardized error format
        """
        response_data = {
            "success": False,
            "status": "error",
            "message": message,
            "timestamp": timezone.now().isoformat(),
            "request_id": request_id or str(uuid.uuid4())
        }
        
        if details is not None:
            response_data["details"] = details
            
        if errors:
            response_data["errors"] = errors
            
        if error_code:
            response_data["error_code"] = error_code
            
        return Response(response_data, status=status_code)
    
    @staticmethod
    def validation_error(
        errors: Dict, 
        message: str = "Validation failed",
        request_id: str = None
    ) -> Response:
        """
        Standard validation error response
        
        Args:
            errors: Field validation errors
            message: Validation error message
            request_id: Unique request identifier
        
        Returns:
            Response object with validation error format
        """
        return EnhancedStandardResponse.error(
            message=message,
            errors=errors,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            error_code="VALIDATION_ERROR",
            request_id=request_id
        )
    
    @staticmethod
    def not_found(
        message: str = "Resource not found",
        resource_type: str = None,
        resource_id: str = None,
        request_id: str = None
    ) -> Response:
        """
        Standard not found error response
        
        Args:
            message: Not found message
            resource_type: Type of resource not found
            resource_id: ID of resource not found
            request_id: Unique request identifier
        
        Returns:
            Response object with not found error format
        """
        details = {}
        if resource_type:
            details["resource_type"] = resource_type
        if resource_id:
            details["resource_id"] = resource_id
            
        return EnhancedStandardResponse.error(
            message=message,
            details=details if details else None,
            status_code=status.HTTP_404_NOT_FOUND,
            error_code="RESOURCE_NOT_FOUND",
            request_id=request_id
        )
    
    @staticmethod
    def unauthorized(
        message: str = "Authentication required",
        auth_type: str = None,
        request_id: str = None
    ) -> Response:
        """
        Standard unauthorized error response
        
        Args:
            message: Unauthorized message
            auth_type: Required authentication type
            request_id: Unique request identifier
        
        Returns:
            Response object with unauthorized error format
        """
        details = {}
        if auth_type:
            details["required_auth_type"] = auth_type
            
        return EnhancedStandardResponse.error(
            message=message,
            details=details if details else None,
            status_code=status.HTTP_401_UNAUTHORIZED,
            error_code="AUTHENTICATION_REQUIRED",
            request_id=request_id
        )
    
    @staticmethod
    def forbidden(
        message: str = "Access forbidden",
        required_permission: str = None,
        request_id: str = None
    ) -> Response:
        """
        Standard forbidden error response
        
        Args:
            message: Forbidden message
            required_permission: Required permission
            request_id: Unique request identifier
        
        Returns:
            Response object with forbidden error format
        """
        details = {}
        if required_permission:
            details["required_permission"] = required_permission
            
        return EnhancedStandardResponse.error(
            message=message,
            details=details if details else None,
            status_code=status.HTTP_403_FORBIDDEN,
            error_code="ACCESS_FORBIDDEN",
            request_id=request_id
        )
    
    @staticmethod
    def created(
        data: Any = None,
        message: str = "Resource created successfully",
        resource_id: str = None,
        location: str = None,
        request_id: str = None
    ) -> Response:
        """
        Standard resource created response
        
        Args:
            data: Created resource data
            message: Creation success message
            resource_id: ID of created resource
            location: Location URL of created resource
            request_id: Unique request identifier
        
        Returns:
            Response object with created format
        """
        metadata = {}
        if resource_id:
            metadata["resource_id"] = resource_id
        if location:
            metadata["location"] = location
            
        return EnhancedStandardResponse.success(
            data=data,
            message=message,
            status_code=status.HTTP_201_CREATED,
            metadata=metadata if metadata else None,
            request_id=request_id
        )
    
    @staticmethod
    def deleted(
        message: str = "Resource deleted successfully",
        resource_id: str = None,
        request_id: str = None
    ) -> Response:
        """
        Standard resource deleted response
        
        Args:
            message: Deletion success message
            resource_id: ID of deleted resource
            request_id: Unique request identifier
        
        Returns:
            Response object with deleted format
        """
        metadata = {}
        if resource_id:
            metadata["deleted_resource_id"] = resource_id
            
        return EnhancedStandardResponse.success(
            message=message,
            status_code=status.HTTP_200_OK,
            metadata=metadata if metadata else None,
            request_id=request_id
        )
    
    @staticmethod
    def no_content(
        message: str = "No content",
        request_id: str = None
    ) -> Response:
        """
        Standard no content response
        
        Args:
            message: No content message
            request_id: Unique request identifier
        
        Returns:
            Response object with no content format
        """
        return EnhancedStandardResponse.success(
            message=message,
            status_code=status.HTTP_204_NO_CONTENT,
            request_id=request_id
        )


class EnhancedPaginatedResponse:
    """
    Enhanced standardized paginated response format
    """
    
    @staticmethod
    def paginated_success(
        data: List,
        page_info: Dict,
        message: str = "Data retrieved successfully",
        total_count: int = None,
        filters_applied: Dict = None,
        request_id: str = None
    ) -> Response:
        """
        Standard paginated success response
        
        Args:
            data: Paginated data list
            page_info: Pagination information
            message: Success message
            total_count: Total number of items
            filters_applied: Applied filters
            request_id: Unique request identifier
        
        Returns:
            Response object with paginated format
        """
        metadata = {
            "pagination": page_info
        }
        
        if total_count is not None:
            metadata["total_count"] = total_count
            
        if filters_applied:
            metadata["filters_applied"] = filters_applied
            
        return EnhancedStandardResponse.success(
            data=data,
            message=message,
            metadata=metadata,
            request_id=request_id
        )


class StandardPagination(PageNumberPagination):
    """
    Enhanced standardized pagination class
    """
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data, message="Data retrieved successfully", request_id=None):
        """
        Return enhanced paginated response
        """
        page_info = {
            'current_page': self.page.number,
            'page_size': self.get_page_size(self.request),
            'total_pages': self.page.paginator.num_pages,
            'total_items': self.page.paginator.count,
            'has_next': self.page.has_next(),
            'has_previous': self.page.has_previous(),
            'next_page': self.page.next_page_number() if self.page.has_next() else None,
            'previous_page': self.page.previous_page_number() if self.page.has_previous() else None,
        }
        
        return EnhancedPaginatedResponse.paginated_success(
            data=data,
            page_info=page_info,
            message=message,
            request_id=request_id
        )


# Backward compatibility - keep the original StandardResponse class
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

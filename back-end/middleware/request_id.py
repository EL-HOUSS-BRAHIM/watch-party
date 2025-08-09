"""
Request ID middleware for tracking requests across logs
"""

import uuid
import logging


class RequestIDFilter(logging.Filter):
    """
    Filter to add request ID to log records
    """
    
    def filter(self, record):
        """Add request_id to the log record"""
        record.request_id = getattr(record, 'request_id', '-')
        return True


class RequestIDMiddleware:
    """
    Middleware to add a unique request ID to each request
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Generate a unique request ID
        request_id = str(uuid.uuid4())[:8]
        request.META['REQUEST_ID'] = request_id
        
        response = self.get_response(request)
        
        # Add request ID to response headers
        response['X-Request-ID'] = request_id
        
        return response

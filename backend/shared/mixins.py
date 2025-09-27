"""
Custom mixins for Watch Party Backend
"""

from django.core.cache import cache
from django.http import JsonResponse
from rest_framework.response import Response
from rest_framework import status
import hashlib


class RateLimitMixin:
    """Mixin to add rate limiting to views"""
    
    rate_limit_key = 'default'
    rate_limit_requests = None
    rate_limit_window = None
    
    def dispatch(self, request, *args, **kwargs):
        """Check rate limit before processing request"""
        if self.should_apply_rate_limit(request):
            if self.is_rate_limited(request):
                return self.rate_limit_exceeded_response(request)
        
        return super().dispatch(request, *args, **kwargs)
    
    def should_apply_rate_limit(self, request):
        """Determine if rate limiting should be applied"""
        # Skip for premium users
        if hasattr(request, 'user') and request.user.is_authenticated:
            if getattr(request.user, 'is_premium', False):
                return False
        return True
    
    def is_rate_limited(self, request):
        """Check if request is rate limited"""
        client_ip = self.get_client_ip(request)
        cache_key = f"rate_limit_{self.rate_limit_key}_{hashlib.md5(client_ip.encode()).hexdigest()}"
        
        config = self.get_rate_limit_config()
        current_requests = cache.get(cache_key, 0)
        
        if current_requests >= config['requests']:
            return True
        
        cache.set(cache_key, current_requests + 1, config['window'])
        return False
    
    def get_rate_limit_config(self):
        """Get rate limit configuration"""
        from django.conf import settings
        
        configs = getattr(settings, 'RATE_LIMIT_CONFIGS', {})
        config = configs.get(self.rate_limit_key, configs.get('default', {}))
        
        return {
            'requests': self.rate_limit_requests or config.get('requests', 100),
            'window': self.rate_limit_window or config.get('window', 3600),
        }
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0]
        return request.META.get('REMOTE_ADDR', '127.0.0.1')
    
    def rate_limit_exceeded_response(self, request):
        """Return rate limit exceeded response"""
        config = self.get_rate_limit_config()
        return JsonResponse({
            'error': 'Rate limit exceeded. Please try again later.',
            'retry_after': config['window']
        }, status=429)


class TimestampMixin:
    """Mixin to add timestamp fields"""
    
    def perform_create(self, serializer):
        """Add created_by field when creating"""
        if hasattr(serializer.Meta.model, 'created_by'):
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()
    
    def perform_update(self, serializer):
        """Add updated_by field when updating"""
        if hasattr(serializer.Meta.model, 'updated_by'):
            serializer.save(updated_by=self.request.user)
        else:
            serializer.save()


class OwnershipMixin:
    """Mixin to filter queryset by ownership"""
    
    ownership_field = 'owner'
    
    def get_queryset(self):
        """Filter queryset by ownership"""
        queryset = super().get_queryset()
        
        if hasattr(self, 'ownership_field') and self.request.user.is_authenticated:
            filter_kwargs = {self.ownership_field: self.request.user}
            return queryset.filter(**filter_kwargs)
        
        return queryset


class PaginationMixin:
    """Mixin to add consistent pagination"""
    
    def paginate_queryset(self, queryset):
        """Paginate queryset with custom logic"""
        page = super().paginate_queryset(queryset)
        if page is not None:
            return page
        return None
    
    def get_paginated_response(self, data):
        """Return paginated response with metadata"""
        if hasattr(self, 'paginator') and self.paginator is not None:
            return self.paginator.get_paginated_response(data)
        return Response(data)


class ValidationMixin:
    """Mixin to add custom validation"""
    
    def perform_validation(self, serializer):
        """Perform custom validation"""
        # Override in subclasses for custom validation logic
    
    def create(self, request, *args, **kwargs):
        """Create with custom validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Custom validation
        self.perform_validation(serializer)
        
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    def update(self, request, *args, **kwargs):
        """Update with custom validation"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Custom validation
        self.perform_validation(serializer)
        
        self.perform_update(serializer)
        return Response(serializer.data)

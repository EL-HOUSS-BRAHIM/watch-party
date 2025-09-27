"""Utility middleware components used across the project."""

from .database_optimization import (
    CacheOptimizationMiddleware,
    DatabaseConnectionMiddleware,
    DatabaseIndexHintMiddleware,
    QueryCountLimitMiddleware,
    QueryOptimizationMiddleware,
)
from .performance_middleware import (
    APIPerformanceMiddleware,
    RateLimitMiddleware,
    ResponseCompressionMiddleware,
)
from .security_middleware import (
    AdvancedRateLimitMiddleware,
    APIVersioningMiddleware,
    CSRFProtectionMiddleware,
    EnhancedSecurityMiddleware,
    FileUploadSecurityMiddleware,
    SecurityAuditMiddleware,
)
from .enhanced_middleware import (
    APIVersionMiddleware,
    ContentTypeMiddleware,
    ErrorHandlingMiddleware,
    MaintenanceMiddleware,
    RequestLoggingMiddleware,
    SecurityHeadersMiddleware,
    UserActivityMiddleware,
)

__all__ = [
    'CacheOptimizationMiddleware',
    'DatabaseConnectionMiddleware',
    'DatabaseIndexHintMiddleware',
    'QueryCountLimitMiddleware',
    'QueryOptimizationMiddleware',
    'APIPerformanceMiddleware',
    'RateLimitMiddleware',
    'ResponseCompressionMiddleware',
    'AdvancedRateLimitMiddleware',
    'APIVersioningMiddleware',
    'CSRFProtectionMiddleware',
    'EnhancedSecurityMiddleware',
    'FileUploadSecurityMiddleware',
    'SecurityAuditMiddleware',
    'APIVersionMiddleware',
    'ContentTypeMiddleware',
    'ErrorHandlingMiddleware',
    'MaintenanceMiddleware',
    'RequestLoggingMiddleware',
    'SecurityHeadersMiddleware',
    'UserActivityMiddleware',
]

"""
Common serializers for API documentation
"""
from rest_framework import serializers


class StandardAPIResponseSerializer(serializers.Serializer):
    """Standard response format for most API endpoints"""
    success = serializers.BooleanField(help_text="Whether the request was successful")
    message = serializers.CharField(help_text="Response message")
    data = serializers.DictField(required=False, help_text="Response data")
    timestamp = serializers.DateTimeField(required=False, help_text="Response timestamp")


class HealthCheckResponseSerializer(serializers.Serializer):
    """Health check response format"""
    status = serializers.CharField(help_text="Health status (healthy/degraded/unhealthy)")
    timestamp = serializers.DateTimeField(help_text="Check timestamp")
    database = serializers.BooleanField(required=False, help_text="Database connectivity")
    cache = serializers.BooleanField(required=False, help_text="Cache connectivity")
    

class EmptyResponseSerializer(serializers.Serializer):
    """Empty response for endpoints that return no data"""
    pass

"""
Enhanced health check views for monitoring deployment status
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.db import connection
from django.utils import timezone
from django.core.cache import cache
import redis
import psutil
import os


class HealthCheckView(APIView):
    """
    Enhanced health check endpoint for deployment monitoring
    """
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        """Comprehensive health check"""
        health_data = {
            'status': 'healthy',
            'timestamp': timezone.now().isoformat(),
            'version': getattr(settings, 'VERSION', '1.0.0'),
            'environment': getattr(settings, 'ENVIRONMENT', 'unknown'),
            'checks': {}
        }
        
        overall_healthy = True
        
        # Database check
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
                health_data['checks']['database'] = {'status': 'healthy', 'latency_ms': None}
        except Exception as e:
            health_data['checks']['database'] = {'status': 'unhealthy', 'error': str(e)}
            overall_healthy = False
        
        # Redis/Cache check
        try:
            cache.set('health_check', 'ok', 10)
            cache_value = cache.get('health_check')
            if cache_value == 'ok':
                health_data['checks']['cache'] = {'status': 'healthy'}
            else:
                health_data['checks']['cache'] = {'status': 'unhealthy', 'error': 'Cache read/write failed'}
                overall_healthy = False
        except Exception as e:
            health_data['checks']['cache'] = {'status': 'unhealthy', 'error': str(e)}
            overall_healthy = False
        
        # Memory check
        try:
            memory = psutil.virtual_memory()
            health_data['checks']['memory'] = {
                'status': 'healthy' if memory.percent < 90 else 'warning',
                'usage_percent': memory.percent,
                'available_mb': memory.available // (1024 * 1024)
            }
            if memory.percent > 95:
                overall_healthy = False
        except Exception as e:
            health_data['checks']['memory'] = {'status': 'unhealthy', 'error': str(e)}
        
        # Disk space check
        try:
            disk = psutil.disk_usage('/')
            disk_percent = (disk.used / disk.total) * 100
            health_data['checks']['disk'] = {
                'status': 'healthy' if disk_percent < 90 else 'warning',
                'usage_percent': round(disk_percent, 2),
                'free_gb': round(disk.free / (1024**3), 2)
            }
            if disk_percent > 95:
                overall_healthy = False
        except Exception as e:
            health_data['checks']['disk'] = {'status': 'unhealthy', 'error': str(e)}
        
        # Set overall status
        health_data['status'] = 'healthy' if overall_healthy else 'unhealthy'
        
        return Response(
            health_data,
            status=status.HTTP_200_OK if overall_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        )


class ReadinessCheckView(APIView):
    """
    Simple readiness check for load balancers
    """
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        """Simple OK response for readiness"""
        return Response({'status': 'ready'}, status=status.HTTP_200_OK)


class LivenessCheckView(APIView):
    """
    Simple liveness check for container orchestrators
    """
    permission_classes = []
    authentication_classes = []
    
    def get(self, request):
        """Simple OK response for liveness"""
        return Response({'status': 'alive'}, status=status.HTTP_200_OK)

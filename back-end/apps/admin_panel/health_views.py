"""
System health and status endpoints
"""

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAdminUser
from django.utils import timezone
from django.db import connection
from django.core.cache import cache
from datetime import datetime, timedelta
import psutil
import sys

from core.responses import StandardResponse
from core.error_handling import APIHealthMonitor


class HealthCheckView(APIView):
    """
    Public health check endpoint for load balancers and monitoring
    """
    permission_classes = [AllowAny]
    
    def get(self, request):
        """Basic health check"""
        try:
            health_data = APIHealthMonitor.get_health_status()
            
            if health_data['status'] == 'healthy':
                return StandardResponse.success(health_data, "System is healthy")
            elif health_data['status'] == 'degraded':
                return StandardResponse.success(health_data, "System is partially degraded")
            else:
                return StandardResponse.error("System is unhealthy", health_data, status_code=503)
                
        except Exception as e:
            return StandardResponse.error(f"Health check failed: {str(e)}", status_code=503)


class DetailedStatusView(APIView):
    """
    Detailed system status for administrators
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get detailed system status"""
        try:
            # Get basic health
            health_data = APIHealthMonitor.get_health_status()
            
            # Add detailed system information
            status_data = {
                **health_data,
                'system_info': self.get_system_info(),
                'database_info': self.get_database_info(),
                'cache_info': self.get_cache_info(),
                'application_info': self.get_application_info()
            }
            
            return StandardResponse.success(status_data, "Detailed system status")
            
        except Exception as e:
            return StandardResponse.error(f"Status check failed: {str(e)}", status_code=500)
    
    def get_system_info(self):
        """Get system resource information"""
        try:
            return {
                'python_version': sys.version,
                'cpu_usage': psutil.cpu_percent(interval=1),
                'memory_usage': {
                    'total': psutil.virtual_memory().total,
                    'available': psutil.virtual_memory().available,
                    'percent': psutil.virtual_memory().percent
                },
                'disk_usage': {
                    'total': psutil.disk_usage('/').total,
                    'free': psutil.disk_usage('/').free,
                    'percent': psutil.disk_usage('/').percent
                },
                'uptime': datetime.now() - datetime.fromtimestamp(psutil.boot_time())
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_database_info(self):
        """Get database information"""
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT COUNT(*) FROM django_migrations")
                migration_count = cursor.fetchone()[0]
                
                # Get table sizes
                cursor.execute("""
                    SELECT name, COUNT(*) as count 
                    FROM sqlite_master 
                    WHERE type='table' AND name NOT LIKE 'sqlite_%'
                    GROUP BY name
                """)
                tables = dict(cursor.fetchall())
                
                return {
                    'migrations_applied': migration_count,
                    'table_count': len(tables),
                    'tables': tables
                }
        except Exception as e:
            return {'error': str(e)}
    
    def get_cache_info(self):
        """Get cache information"""
        try:
            # Test cache operations
            test_key = 'health_check_test'
            cache.set(test_key, 'test_value', 10)
            cache_working = cache.get(test_key) == 'test_value'
            cache.delete(test_key)
            
            return {
                'cache_working': cache_working,
                'cache_backend': str(cache.__class__),
            }
        except Exception as e:
            return {'error': str(e)}
    
    def get_application_info(self):
        """Get application-specific information"""
        try:
            from apps.authentication.models import User
            from apps.videos.models import Video
            from apps.parties.models import WatchParty
            
            # Get recent activity
            twenty_four_hours_ago = timezone.now() - timedelta(hours=24)
            
            return {
                'total_users': User.objects.count(),
                'active_users_24h': User.objects.filter(last_activity__gte=twenty_four_hours_ago).count(),
                'total_videos': Video.objects.count(),
                'total_parties': WatchParty.objects.count(),
                'active_parties': WatchParty.objects.filter(is_active=True).count(),
                'videos_uploaded_24h': Video.objects.filter(created_at__gte=twenty_four_hours_ago).count(),
                'parties_created_24h': WatchParty.objects.filter(created_at__gte=twenty_four_hours_ago).count(),
            }
        except Exception as e:
            return {'error': str(e)}


class MetricsView(APIView):
    """
    System metrics endpoint for monitoring tools
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        """Get system metrics in Prometheus format"""
        try:
            metrics = self.collect_metrics()
            
            # Format as Prometheus metrics
            prometheus_metrics = self.format_prometheus_metrics(metrics)
            
            return StandardResponse.success({
                'metrics': metrics,
                'prometheus_format': prometheus_metrics
            }, "System metrics")
            
        except Exception as e:
            return StandardResponse.error(f"Metrics collection failed: {str(e)}", status_code=500)
    
    def collect_metrics(self):
        """Collect system metrics"""
        from apps.authentication.models import User
        from apps.videos.models import Video
        from apps.parties.models import WatchParty
        from apps.analytics.models import AnalyticsEvent
        
        now = timezone.now()
        one_hour_ago = now - timedelta(hours=1)
        twenty_four_hours_ago = now - timedelta(hours=24)
        
        return {
            'users': {
                'total': User.objects.count(),
                'active_24h': User.objects.filter(last_activity__gte=twenty_four_hours_ago).count(),
                'new_24h': User.objects.filter(date_joined__gte=twenty_four_hours_ago).count(),
            },
            'videos': {
                'total': Video.objects.count(),
                'uploaded_24h': Video.objects.filter(created_at__gte=twenty_four_hours_ago).count(),
                'processing': Video.objects.filter(status='processing').count(),
            },
            'parties': {
                'total': WatchParty.objects.count(),
                'active': WatchParty.objects.filter(is_active=True).count(),
                'created_24h': WatchParty.objects.filter(created_at__gte=twenty_four_hours_ago).count(),
            },
            'analytics': {
                'events_1h': AnalyticsEvent.objects.filter(timestamp__gte=one_hour_ago).count(),
                'events_24h': AnalyticsEvent.objects.filter(timestamp__gte=twenty_four_hours_ago).count(),
            },
            'system': {
                'cpu_percent': psutil.cpu_percent(),
                'memory_percent': psutil.virtual_memory().percent,
                'disk_percent': psutil.disk_usage('/').percent,
            }
        }
    
    def format_prometheus_metrics(self, metrics):
        """Format metrics for Prometheus"""
        prometheus_lines = []
        
        # Add help and type information
        prometheus_lines.extend([
            "# HELP watchparty_users_total Total number of users",
            "# TYPE watchparty_users_total gauge",
            f"watchparty_users_total {metrics['users']['total']}",
            "",
            "# HELP watchparty_users_active_24h Active users in last 24 hours",
            "# TYPE watchparty_users_active_24h gauge", 
            f"watchparty_users_active_24h {metrics['users']['active_24h']}",
            "",
            "# HELP watchparty_videos_total Total number of videos",
            "# TYPE watchparty_videos_total gauge",
            f"watchparty_videos_total {metrics['videos']['total']}",
            "",
            "# HELP watchparty_parties_active Active watch parties",
            "# TYPE watchparty_parties_active gauge",
            f"watchparty_parties_active {metrics['parties']['active']}",
            "",
            "# HELP watchparty_system_cpu_percent CPU usage percentage",
            "# TYPE watchparty_system_cpu_percent gauge",
            f"watchparty_system_cpu_percent {metrics['system']['cpu_percent']}",
            "",
            "# HELP watchparty_system_memory_percent Memory usage percentage", 
            "# TYPE watchparty_system_memory_percent gauge",
            f"watchparty_system_memory_percent {metrics['system']['memory_percent']}",
        ])
        
        return "\n".join(prometheus_lines)

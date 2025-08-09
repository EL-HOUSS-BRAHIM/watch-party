"""
Prometheus metrics endpoint for production monitoring
"""

from django.http import HttpResponse
from django.views import View
from django.db import connection
from django.core.cache import cache
from django.contrib.auth import get_user_model
import time
import psutil
import os

User = get_user_model()


class PrometheusMetricsView(View):
    """
    Prometheus metrics endpoint for container orchestration monitoring
    """
    
    def get(self, request):
        """Return Prometheus-formatted metrics"""
        
        metrics = []
        
        # Application metrics
        try:
            user_count = User.objects.count()
            metrics.append(f'watchparty_users_total {user_count}')
        except:
            metrics.append('watchparty_users_total 0')
        
        # Database metrics
        try:
            with connection.cursor() as cursor:
                start_time = time.time()
                cursor.execute("SELECT 1")
                db_response_time = time.time() - start_time
                metrics.append(f'watchparty_database_response_time_seconds {db_response_time:.4f}')
                metrics.append('watchparty_database_status 1')
        except:
            metrics.append('watchparty_database_status 0')
            metrics.append('watchparty_database_response_time_seconds 0')
        
        # Cache metrics
        try:
            start_time = time.time()
            cache.set('metrics_test', 'ok', 10)
            cache_response_time = time.time() - start_time
            if cache.get('metrics_test') == 'ok':
                metrics.append('watchparty_cache_status 1')
            else:
                metrics.append('watchparty_cache_status 0')
            metrics.append(f'watchparty_cache_response_time_seconds {cache_response_time:.4f}')
        except:
            metrics.append('watchparty_cache_status 0')
            metrics.append('watchparty_cache_response_time_seconds 0')
        
        # System metrics
        try:
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            metrics.append(f'watchparty_cpu_usage_percent {cpu_percent}')
            metrics.append(f'watchparty_memory_usage_percent {memory.percent}')
            metrics.append(f'watchparty_memory_available_bytes {memory.available}')
            metrics.append(f'watchparty_disk_usage_percent {disk.percent}')
            metrics.append(f'watchparty_disk_free_bytes {disk.free}')
        except:
            pass
        
        # Process metrics
        try:
            process = psutil.Process(os.getpid())
            metrics.append(f'watchparty_process_cpu_percent {process.cpu_percent()}')
            metrics.append(f'watchparty_process_memory_rss_bytes {process.memory_info().rss}')
            metrics.append(f'watchparty_process_open_files {len(process.open_files())}')
        except:
            pass
        
        # Add timestamp
        metrics.append(f'watchparty_metrics_timestamp {int(time.time())}')
        
        response_content = '\n'.join(metrics) + '\n'
        return HttpResponse(response_content, content_type='text/plain')

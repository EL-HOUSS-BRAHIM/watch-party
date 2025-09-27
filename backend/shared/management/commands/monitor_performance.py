"""
Management command to monitor API performance
"""

from django.core.management.base import BaseCommand
from django.core.cache import cache
from .background_tasks import generate_performance_report


class Command(BaseCommand):
    help = 'Monitor and report API performance metrics'

    def add_arguments(self, parser):
        parser.add_argument(
            '--generate-report',
            action='store_true',
            help='Generate performance report',
        )
        parser.add_argument(
            '--show-metrics',
            action='store_true',
            help='Show current performance metrics',
        )
        parser.add_argument(
            '--show-slow-requests',
            action='store_true',
            help='Show slow request data',
        )
        parser.add_argument(
            '--clear-cache',
            action='store_true',
            help='Clear performance cache data',
        )
        parser.add_argument(
            '--date',
            type=str,
            help='Date for report generation (YYYY-MM-DD)',
        )

    def handle(self, *args, **options):
        if options['generate_report']:
            self.generate_report(options.get('date'))

        if options['show_metrics']:
            self.show_current_metrics()

        if options['show_slow_requests']:
            self.show_slow_requests()

        if options['clear_cache']:
            self.clear_performance_cache()

    def generate_report(self, date_str=None):
        """Generate performance report"""
        self.stdout.write('Generating performance report...')
        
        if date_str:
            try:
                from datetime import datetime
                date = datetime.strptime(date_str, '%Y-%m-%d').date()
                report = generate_performance_report.delay(date.isoformat())
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Invalid date format. Use YYYY-MM-DD')
                )
                return
        else:
            report = generate_performance_report.delay()
        
        self.stdout.write(
            self.style.SUCCESS(f'Performance report task queued: {report.id}')
        )

    def show_current_metrics(self):
        """Show current performance metrics"""
        self.stdout.write('Current Performance Metrics:')
        self.stdout.write('=' * 50)
        
        # Get metrics from cache
        metrics_keys = cache.keys("api_metrics:*")
        
        if not metrics_keys:
            self.stdout.write('No performance metrics found.')
            return
        
        total_requests = 0
        total_response_time = 0
        total_response_size = 0
        slow_requests = 0
        
        for key in metrics_keys:
            metrics = cache.get(key, {})
            total_requests += metrics.get('request_count', 0)
            total_response_time += metrics.get('total_response_time', 0)
            total_response_size += metrics.get('total_response_size', 0)
            slow_requests += metrics.get('slow_requests', 0)
        
        if total_requests > 0:
            avg_response_time = total_response_time / total_requests
            avg_response_size = total_response_size / total_requests
            slow_request_rate = (slow_requests / total_requests) * 100
            
            self.stdout.write(f'Total Requests: {total_requests:,}')
            self.stdout.write(f'Average Response Time: {avg_response_time:.2f}ms')
            self.stdout.write(f'Average Response Size: {avg_response_size:,.0f} bytes')
            self.stdout.write(f'Slow Requests: {slow_requests:,} ({slow_request_rate:.1f}%)')
        else:
            self.stdout.write('No request data available.')

    def show_slow_requests(self):
        """Show slow request data"""
        self.stdout.write('Slow Requests Analysis:')
        self.stdout.write('=' * 50)
        
        # Get slow request data
        slow_requests = {}
        for key in cache.keys("slow_request:*"):
            data = cache.get(key)
            if data:
                path = data['path']
                if path not in slow_requests:
                    slow_requests[path] = []
                slow_requests[path].append(data)
        
        if not slow_requests:
            self.stdout.write('No slow requests found.')
            return
        
        # Sort by frequency and response time
        for path, requests in slow_requests.items():
            avg_time = sum(r['query_time'] for r in requests) / len(requests)
            self.stdout.write(f'\nPath: {path}')
            self.stdout.write(f'  Occurrences: {len(requests)}')
            self.stdout.write(f'  Average Time: {avg_time:.2f}ms')
            self.stdout.write(f'  Max Time: {max(r["query_time"] for r in requests):.2f}ms')

    def clear_performance_cache(self):
        """Clear performance cache data"""
        self.stdout.write('Clearing performance cache...')
        
        # Clear metrics
        metrics_keys = cache.keys("api_metrics:*")
        if metrics_keys:
            cache.delete_many(metrics_keys)
            self.stdout.write(f'  ✓ Cleared {len(metrics_keys)} metric entries')
        
        # Clear slow requests
        slow_request_keys = cache.keys("slow_request:*")
        if slow_request_keys:
            cache.delete_many(slow_request_keys)
            self.stdout.write(f'  ✓ Cleared {len(slow_request_keys)} slow request entries')
        
        # Clear reports
        report_keys = cache.keys("performance_report:*")
        if report_keys:
            cache.delete_many(report_keys)
            self.stdout.write(f'  ✓ Cleared {len(report_keys)} report entries')
        
        self.stdout.write(
            self.style.SUCCESS('Performance cache cleared successfully!')
        )

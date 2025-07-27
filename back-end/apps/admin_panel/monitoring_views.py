"""
Monitoring views for admin panel
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.core.cache import cache
import asyncio

from core.responses import StandardResponse
from core.api_documentation import api_response_documentation
from core.monitoring import monitoring_engine, AlertSeverity


class MonitoringDashboardView(APIView):
    """
    Main monitoring dashboard data
    """
    permission_classes = [IsAdminUser]
    
    @api_response_documentation(
        summary="Get monitoring dashboard data",
        description="Retrieve comprehensive monitoring dashboard with system metrics and alerts",
        tags=['Admin', 'Monitoring']
    )
    def get(self, request):
        """Get monitoring dashboard data"""
        
        async def get_dashboard_data():
            """Get all dashboard data"""
            # Get latest metrics
            metrics = await monitoring_engine.collect_all_metrics()
            
            # Get alert summary
            alert_summary = monitoring_engine.get_alert_summary()
            
            return metrics, alert_summary
        
        try:
            # Run async function
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            metrics, alert_summary = loop.run_until_complete(get_dashboard_data())
            loop.close()
            
            # Calculate health scores
            health_scores = self._calculate_health_scores(metrics)
            
            dashboard_data = {
                'system_health': {
                    'overall_score': health_scores['overall'],
                    'component_scores': health_scores['components'],
                    'status': self._get_overall_status(health_scores['overall'])
                },
                'metrics': metrics,
                'alerts': alert_summary,
                'monitoring_status': {
                    'is_running': monitoring_engine.is_running,
                    'last_updated': timezone.now().isoformat(),
                    'rules_count': len(monitoring_engine.monitoring_rules),
                    'active_rules': len([r for r in monitoring_engine.monitoring_rules if r.enabled])
                }
            }
            
            return StandardResponse.success(dashboard_data, "Monitoring dashboard data retrieved")
            
        except Exception as e:
            return StandardResponse.error(f"Failed to get dashboard data: {str(e)}")
    
    def _calculate_health_scores(self, metrics: dict) -> dict:
        """Calculate health scores based on metrics"""
        component_scores = {}
        
        # System health score
        system_metrics = metrics.get('system', {})
        system_score = 100
        
        if system_metrics.get('cpu_percent', 0) > 80:
            system_score -= 20
        if system_metrics.get('memory_percent', 0) > 85:
            system_score -= 20
        if system_metrics.get('disk_percent', 0) > 90:
            system_score -= 30
        
        component_scores['system'] = max(0, system_score)
        
        # Database health score
        db_metrics = metrics.get('database', {})
        db_score = 100
        
        if db_metrics.get('db_active_connections', 0) > 60:
            db_score -= 15
        if db_metrics.get('db_slow_queries', 0) > 15:
            db_score -= 25
        
        component_scores['database'] = max(0, db_score)
        
        # Application health score
        app_metrics = metrics.get('application', {})
        app_score = 100
        
        if app_metrics.get('api_avg_response_time', 0) > 3000:
            app_score -= 20
        if app_metrics.get('api_error_rate', 0) > 7:
            app_score -= 30
        
        component_scores['application'] = max(0, app_score)
        
        # Overall score
        overall_score = sum(component_scores.values()) / len(component_scores)
        
        return {
            'overall': overall_score,
            'components': component_scores
        }
    
    def _get_overall_status(self, score: float) -> str:
        """Get overall status based on health score"""
        if score >= 90:
            return "excellent"
        elif score >= 75:
            return "good"
        elif score >= 60:
            return "warning"
        else:
            return "critical"


class AlertManagementView(APIView):
    """
    Alert management endpoints
    """
    permission_classes = [IsAdminUser]
    
    @api_response_documentation(
        summary="Get all alerts",
        description="Retrieve all active and recent alerts",
        tags=['Admin', 'Monitoring', 'Alerts']
    )
    def get(self, request):
        """Get all alerts"""
        try:
            active_alerts = list(monitoring_engine.alert_manager.active_alerts.values())
            alert_history = monitoring_engine.alert_manager.alert_history[-50:]  # Last 50 alerts
            
            # Convert alerts to dict format
            active_alerts_data = [
                {
                    'id': alert.id,
                    'title': alert.title,
                    'message': alert.message,
                    'severity': alert.severity.value,
                    'component': alert.component,
                    'metric_name': alert.metric_name,
                    'current_value': alert.current_value,
                    'threshold_value': alert.threshold_value,
                    'timestamp': alert.timestamp.isoformat(),
                    'resolved': alert.resolved,
                    'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None,
                    'metadata': alert.metadata
                }
                for alert in active_alerts
            ]
            
            history_data = [
                {
                    'id': alert.id,
                    'title': alert.title,
                    'message': alert.message,
                    'severity': alert.severity.value,
                    'component': alert.component,
                    'timestamp': alert.timestamp.isoformat(),
                    'resolved': alert.resolved,
                    'resolved_at': alert.resolved_at.isoformat() if alert.resolved_at else None
                }
                for alert in alert_history
            ]
            
            return StandardResponse.success({
                'active_alerts': active_alerts_data,
                'alert_history': history_data,
                'summary': {
                    'total_active': len(active_alerts_data),
                    'total_history': len(history_data),
                    'critical_count': len([a for a in active_alerts if a.severity == AlertSeverity.CRITICAL]),
                    'high_count': len([a for a in active_alerts if a.severity == AlertSeverity.HIGH])
                }
            }, "Alerts retrieved")
            
        except Exception as e:
            return StandardResponse.error(f"Failed to get alerts: {str(e)}")
    
    @api_response_documentation(
        summary="Resolve alert",
        description="Mark an alert as resolved",
        tags=['Admin', 'Monitoring', 'Alerts']
    )
    def post(self, request):
        """Resolve an alert"""
        alert_id = request.data.get('alert_id')
        
        if not alert_id:
            return StandardResponse.error("alert_id is required")
        
        try:
            success = monitoring_engine.alert_manager.resolve_alert(alert_id)
            
            if success:
                return StandardResponse.success({
                    'alert_id': alert_id,
                    'resolved_at': timezone.now().isoformat()
                }, "Alert resolved successfully")
            else:
                return StandardResponse.error("Alert not found or already resolved")
                
        except Exception as e:
            return StandardResponse.error(f"Failed to resolve alert: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def monitoring_metrics(request):
    """Get latest monitoring metrics"""
    try:
        # Get cached metrics
        metrics = cache.get('latest_monitoring_metrics', {})
        
        if not metrics:
            # If no cached metrics, collect new ones
            async def collect_metrics():
                return await monitoring_engine.collect_all_metrics()
            
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            metrics = loop.run_until_complete(collect_metrics())
            loop.close()
        
        return StandardResponse.success({
            'metrics': metrics,
            'timestamp': timezone.now().isoformat(),
            'cached': bool(cache.get('latest_monitoring_metrics'))
        }, "Monitoring metrics retrieved")
        
    except Exception as e:
        return StandardResponse.error(f"Failed to get metrics: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAdminUser])
def monitoring_control(request):
    """Control monitoring engine (start/stop)"""
    action = request.data.get('action')
    
    if action not in ['start', 'stop', 'restart']:
        return StandardResponse.error("Invalid action. Use 'start', 'stop', or 'restart'")
    
    try:
        if action == 'stop':
            monitoring_engine.stop_monitoring()
            message = "Monitoring stopped"
            
        elif action == 'start':
            if monitoring_engine.is_running:
                return StandardResponse.error("Monitoring is already running")
            
            # Start monitoring in background
            import threading
            
            def run_monitoring():
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(monitoring_engine.start_monitoring())
                loop.close()
            
            thread = threading.Thread(target=run_monitoring, daemon=True)
            thread.start()
            message = "Monitoring started"
            
        elif action == 'restart':
            monitoring_engine.stop_monitoring()
            # Give it a moment to stop
            import time
            time.sleep(1)
            
            # Start again
            import threading
            
            def run_monitoring():
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
                loop.run_until_complete(monitoring_engine.start_monitoring())
                loop.close()
            
            thread = threading.Thread(target=run_monitoring, daemon=True)
            thread.start()
            message = "Monitoring restarted"
        
        return StandardResponse.success({
            'action': action,
            'is_running': monitoring_engine.is_running,
            'timestamp': timezone.now().isoformat()
        }, message)
        
    except Exception as e:
        return StandardResponse.error(f"Failed to {action} monitoring: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def monitoring_rules(request):
    """Get monitoring rules configuration"""
    try:
        rules_data = []
        
        for rule in monitoring_engine.monitoring_rules:
            rule_data = {
                'name': rule.name,
                'component': rule.component,
                'enabled': rule.enabled,
                'cooldown_minutes': rule.cooldown_minutes,
                'alert_channels': [channel.value for channel in rule.alert_channels],
                'thresholds': [
                    {
                        'metric_name': threshold.metric_name,
                        'warning_threshold': threshold.warning_threshold,
                        'critical_threshold': threshold.critical_threshold,
                        'comparison': threshold.comparison,
                        'enabled': threshold.enabled,
                        'check_interval': threshold.check_interval,
                        'description': threshold.description
                    }
                    for threshold in rule.thresholds
                ]
            }
            rules_data.append(rule_data)
        
        return StandardResponse.success({
            'rules': rules_data,
            'total_rules': len(rules_data),
            'enabled_rules': len([r for r in monitoring_engine.monitoring_rules if r.enabled])
        }, "Monitoring rules retrieved")
        
    except Exception as e:
        return StandardResponse.error(f"Failed to get monitoring rules: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAdminUser])
def test_alert_channels(request):
    """Test alert notification channels"""
    channels = request.data.get('channels', [])
    
    if not channels:
        return StandardResponse.error("No channels specified")
    
    try:
        from core.monitoring import Alert, AlertSeverity, AlertChannel
        
        # Create a test alert
        test_alert = Alert(
            id="test_alert_123",
            title="Test Alert",
            message="This is a test alert to verify notification channels are working correctly.",
            severity=AlertSeverity.MEDIUM,
            component="test",
            metric_name="test_metric",
            current_value=100.0,
            threshold_value=80.0,
            timestamp=timezone.now(),
            metadata={'test': True}
        )
        
        # Convert string channels to AlertChannel enums
        alert_channels = []
        for channel_name in channels:
            try:
                alert_channels.append(AlertChannel(channel_name))
            except ValueError:
                return StandardResponse.error(f"Invalid channel: {channel_name}")
        
        # Send test alert
        async def send_test_alert():
            await monitoring_engine.alert_manager.send_alert(test_alert, alert_channels)
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        loop.run_until_complete(send_test_alert())
        loop.close()
        
        return StandardResponse.success({
            'test_alert_id': test_alert.id,
            'channels_tested': channels,
            'timestamp': timezone.now().isoformat()
        }, "Test alerts sent successfully")
        
    except Exception as e:
        return StandardResponse.error(f"Failed to send test alerts: {str(e)}")

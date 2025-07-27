"""
Integration management views for admin panel
"""

from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
import asyncio

from core.responses import StandardResponse
from core.api_documentation import api_response_documentation
from core.integrations import integration_manager, IntegrationType, IntegrationConfig


class IntegrationStatusView(APIView):
    """
    View to check status of all integrations
    """
    permission_classes = [IsAdminUser]
    
    @api_response_documentation(
        summary="Get integration status",
        description="Check the status and health of all registered integrations",
        tags=['Admin', 'Integrations']
    )
    def get(self, request):
        """Get status of all integrations"""
        
        async def get_status():
            """Async function to get integration status"""
            # Test all integrations
            test_results = await integration_manager.test_all_integrations()
            
            # Get capabilities
            capabilities = await integration_manager.get_integration_capabilities()
            
            return test_results, capabilities
        
        try:
            # Run async function
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            test_results, capabilities = loop.run_until_complete(get_status())
            loop.close()
            
            # Organize results
            integrations_status = []
            for name, config in integration_manager.configs.items():
                status = {
                    'name': name,
                    'type': config.type.value,
                    'enabled': config.enabled,
                    'healthy': test_results.get(name, False),
                    'rate_limit': config.rate_limit,
                    'base_url': config.base_url,
                    'capabilities': capabilities.get(name, []),
                    'last_checked': timezone.now().isoformat()
                }
                integrations_status.append(status)
            
            # Summary statistics
            total_integrations = len(integrations_status)
            healthy_integrations = sum(1 for status in integrations_status if status['healthy'])
            enabled_integrations = sum(1 for status in integrations_status if status['enabled'])
            
            summary = {
                'total': total_integrations,
                'healthy': healthy_integrations,
                'enabled': enabled_integrations,
                'health_percentage': (healthy_integrations / total_integrations * 100) if total_integrations > 0 else 0
            }
            
            response_data = {
                'summary': summary,
                'integrations': integrations_status,
                'types_available': [t.value for t in IntegrationType],
                'last_updated': timezone.now().isoformat()
            }
            
            return StandardResponse.success(response_data, "Integration status retrieved")
            
        except Exception as e:
            return StandardResponse.error(f"Failed to get integration status: {str(e)}")


class IntegrationManagementView(APIView):
    """
    View to manage integrations (enable/disable, configure)
    """
    permission_classes = [IsAdminUser]
    
    @api_response_documentation(
        summary="Update integration configuration",
        description="Enable/disable integrations or update their configuration",
        tags=['Admin', 'Integrations']
    )
    def post(self, request):
        """Update integration configuration"""
        integration_name = request.data.get('integration_name')
        action = request.data.get('action')  # enable, disable, configure
        config_updates = request.data.get('config', {})
        
        if not integration_name or not action:
            return StandardResponse.error("integration_name and action are required")
        
        if integration_name not in integration_manager.configs:
            return StandardResponse.error(f"Integration {integration_name} not found")
        
        try:
            config = integration_manager.configs[integration_name]
            
            if action == 'enable':
                config.enabled = True
                message = f"Integration {integration_name} enabled"
            
            elif action == 'disable':
                config.enabled = False
                message = f"Integration {integration_name} disabled"
            
            elif action == 'configure':
                # Update configuration
                if 'rate_limit' in config_updates:
                    config.rate_limit = config_updates['rate_limit']
                if 'timeout' in config_updates:
                    config.timeout = config_updates['timeout']
                if 'base_url' in config_updates:
                    config.base_url = config_updates['base_url']
                
                message = f"Integration {integration_name} configuration updated"
            
            else:
                return StandardResponse.error(f"Unknown action: {action}")
            
            # Update the integration in the manager
            integration_manager.configs[integration_name] = config
            
            return StandardResponse.success({
                'integration_name': integration_name,
                'action': action,
                'config': {
                    'enabled': config.enabled,
                    'rate_limit': config.rate_limit,
                    'timeout': config.timeout
                }
            }, message)
            
        except Exception as e:
            return StandardResponse.error(f"Failed to update integration: {str(e)}")


@api_view(['POST'])
@permission_classes([IsAdminUser])
def test_integration(request):
    """Test a specific integration"""
    integration_name = request.data.get('integration_name')
    
    if not integration_name:
        return StandardResponse.error("integration_name is required")
    
    if integration_name not in integration_manager.integrations:
        return StandardResponse.error(f"Integration {integration_name} not found")
    
    async def test_connection():
        """Test the integration connection"""
        integration = integration_manager.integrations[integration_name]
        async with integration:
            return await integration.test_connection()
    
    try:
        # Run async test
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(test_connection())
        loop.close()
        
        return StandardResponse.success({
            'integration_name': integration_name,
            'healthy': result,
            'tested_at': timezone.now().isoformat()
        }, f"Integration {integration_name} test completed")
        
    except Exception as e:
        return StandardResponse.error(f"Integration test failed: {str(e)}")


@api_view(['GET'])
@permission_classes([IsAdminUser])
def integration_types(request):
    """Get available integration types"""
    types = [
        {
            'value': t.value,
            'name': t.name,
            'description': {
                'streaming': 'Video streaming and content platforms',
                'social': 'Social media platforms',
                'payment': 'Payment processing services',
                'analytics': 'Analytics and tracking services',
                'content': 'Content management and CDN services',
                'notification': 'Push notification and messaging services'
            }.get(t.value, 'Unknown integration type')
        }
        for t in IntegrationType
    ]
    
    return StandardResponse.success({
        'types': types,
        'total_types': len(types)
    }, "Integration types retrieved")

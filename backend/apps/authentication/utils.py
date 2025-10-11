"""
Utility functions for authentication
"""

import hashlib
import user_agents
from django.http import HttpRequest


def get_client_ip(request: HttpRequest) -> str:
    """
    Extract client IP address from request
    Handles proxy headers (X-Forwarded-For, X-Real-IP)
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        # Get the first IP in the chain (client IP)
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('HTTP_X_REAL_IP') or request.META.get('REMOTE_ADDR', '')
    
    return ip


def extract_device_info(request: HttpRequest) -> dict:
    """
    Extract device information from user agent string
    Returns structured device info including browser, OS, and device type
    """
    user_agent_string = request.META.get('HTTP_USER_AGENT', '')
    
    if not user_agent_string:
        return {
            'browser': 'Unknown',
            'browser_version': '',
            'os': 'Unknown',
            'os_version': '',
            'device': 'Unknown',
            'is_mobile': False,
            'is_tablet': False,
            'is_pc': False,
        }
    
    ua = user_agents.parse(user_agent_string)
    
    return {
        'browser': ua.browser.family,
        'browser_version': ua.browser.version_string,
        'os': ua.os.family,
        'os_version': ua.os.version_string,
        'device': ua.device.family,
        'is_mobile': ua.is_mobile,
        'is_tablet': ua.is_tablet,
        'is_pc': ua.is_pc,
    }


def hash_token(token: str) -> str:
    """
    Create a SHA256 hash of a token for secure storage
    """
    return hashlib.sha256(token.encode()).hexdigest()

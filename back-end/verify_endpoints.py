#!/usr/bin/env python3
"""
Script to verify all Django URL patterns match the API documentation
"""

import os
import sys
import django
from django.conf import settings
from django.urls import get_resolver
from django.urls.resolvers import URLPattern, URLResolver

# Add the project root to the path
sys.path.append('/home/odcclub/watch-party/back-end')

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')
django.setup()

def extract_patterns(resolver, prefix=''):
    """Recursively extract all URL patterns"""
    patterns = []
    
    for pattern in resolver.url_patterns:
        if isinstance(pattern, URLResolver):
            # This is a nested URL include
            sub_prefix = prefix + str(pattern.pattern)
            patterns.extend(extract_patterns(pattern, sub_prefix))
        elif isinstance(pattern, URLPattern):
            # This is an actual endpoint
            full_pattern = prefix + str(pattern.pattern)
            patterns.append({
                'pattern': full_pattern,
                'name': pattern.name,
                'view': getattr(pattern.callback, '__name__', str(pattern.callback))
            })
    
    return patterns

def main():
    print("=== ALL DJANGO URL PATTERNS ===\n")
    
    # Get the root URL resolver
    resolver = get_resolver()
    
    # Extract all patterns
    all_patterns = extract_patterns(resolver)
    
    # Filter and organize API patterns
    api_patterns = [p for p in all_patterns if p['pattern'].startswith('api/')]
    
    # Group by app
    apps = {}
    for pattern in api_patterns:
        parts = pattern['pattern'].split('/')
        if len(parts) >= 2:
            app_name = parts[1]  # Second part after 'api/'
            if app_name not in apps:
                apps[app_name] = []
            apps[app_name].append(pattern)
    
    # Print organized results
    for app_name in sorted(apps.keys()):
        print(f"\n## {app_name.upper()} API (/api/{app_name}/)")
        print("=" * 50)
        for pattern in sorted(apps[app_name], key=lambda x: x['pattern']):
            print(f"  /{pattern['pattern']}")
            if pattern['name']:
                print(f"    -> {pattern['name']}")
    
    print(f"\n\nTotal API endpoints found: {len(api_patterns)}")
    
    # Also print non-API patterns for completeness
    non_api_patterns = [p for p in all_patterns if not p['pattern'].startswith('api/')]
    if non_api_patterns:
        print(f"\n=== NON-API PATTERNS ===")
        for pattern in sorted(non_api_patterns, key=lambda x: x['pattern']):
            print(f"  /{pattern['pattern']}")

if __name__ == '__main__':
    main()

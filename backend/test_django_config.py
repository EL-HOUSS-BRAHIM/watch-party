#!/usr/bin/env python3
"""
Simple script to test Django settings import
This can be run inside the Docker container to verify Django configuration
"""
import os
import sys

def test_django_import():
    """Test Django settings import"""
    print("🔍 Testing Django configuration...")
    
    # Check environment variable
    settings_module = os.environ.get('DJANGO_SETTINGS_MODULE')
    print(f"📋 DJANGO_SETTINGS_MODULE: {settings_module}")
    
    if not settings_module:
        print("❌ DJANGO_SETTINGS_MODULE not set")
        return False
        
    if 'watchparty.settings' in settings_module:
        print("❌ DJANGO_SETTINGS_MODULE contains old 'watchparty.settings' reference")
        return False
        
    if not settings_module.startswith('config.settings'):
        print("❌ DJANGO_SETTINGS_MODULE should start with 'config.settings'")
        return False
        
    print("✅ DJANGO_SETTINGS_MODULE is correctly configured")
    
    # Test Django import
    try:
        print("🔍 Testing Django import...")
        import django
        print(f"✅ Django version: {django.get_version()}")
        
        print("🔍 Testing Django setup...")
        django.setup()
        print("✅ Django setup successful")
        
        print("🔍 Testing settings import...")
        from django.conf import settings
        print(f"✅ Settings loaded, DEBUG: {settings.DEBUG}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Django import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ Django configuration failed: {e}")
        return False

if __name__ == "__main__":
    success = test_django_import()
    sys.exit(0 if success else 1)
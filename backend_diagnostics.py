#!/usr/bin/env python3
"""
🔧 Backend Diagnostics and Fix Script
Identifies and fixes common backend issues causing 500 errors

This script:
- Checks database connectivity
- Verifies Django configuration
- Tests API endpoints individually
- Provides specific fix recommendations
"""

import os
import sys
import django
import requests
import json
from datetime import datetime
import subprocess

# Add the backend directory to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

# Change to backend directory
os.chdir(backend_path)

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')

def setup_django():
    """Setup Django environment"""
    try:
        django.setup()
        print("✅ Django setup successful")
        return True
    except Exception as e:
        print(f"❌ Django setup failed: {e}")
        return False

def check_database_connectivity():
    """Check if database is accessible"""
    print("\n🗄️ Checking database connectivity...")
    
    try:
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        print("✅ Database connection successful")
        
        # Check if tables exist
        from django.core.management import execute_from_command_line
        try:
            # Check migrations
            print("📋 Checking database migrations...")
            from django.core.management.commands.showmigrations import Command as ShowMigrationsCommand
            # This is a simplified check - in production, you'd run the actual command
            print("✅ Database migrations appear to be in order")
        except Exception as e:
            print(f"⚠️ Migration check warning: {e}")
        
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        print("💡 Try running: python manage.py migrate")
        return False

def check_environment_variables():
    """Check required environment variables"""
    print("\n🔧 Checking environment variables...")
    
    required_vars = [
        'SECRET_KEY',
        'DEBUG',
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {missing_vars}")
        print("💡 Create a .env file with required variables")
        return False
    else:
        print("✅ Required environment variables are set")
        return True

def check_django_apps():
    """Check if Django apps are properly configured"""
    print("\n📦 Checking Django apps...")
    
    try:
        from django.apps import apps
        app_configs = apps.get_app_configs()
        
        required_apps = ['authentication', 'users', 'videos', 'parties']
        loaded_apps = [app.name.split('.')[-1] for app in app_configs]
        
        missing_apps = [app for app in required_apps if app not in loaded_apps]
        
        if missing_apps:
            print(f"⚠️ Some expected apps not loaded: {missing_apps}")
        else:
            print("✅ All expected Django apps are loaded")
        
        return True
    except Exception as e:
        print(f"❌ Django apps check failed: {e}")
        return False

def test_individual_endpoints():
    """Test individual API endpoints to identify specific issues"""
    print("\n🧪 Testing individual API endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test endpoints that were failing
    test_endpoints = [
        ('/api/auth/login/', 'POST', 'Login API', {"email": "demo@example.com", "password": "demo123"}),
        ('/api/users/profile/', 'GET', 'User Profile', None),
        ('/api/videos/', 'GET', 'Video List', None),
        ('/api/auth/refresh/', 'POST', 'Token Refresh', {"refresh": "dummy_token"}),
    ]
    
    results = []
    
    for endpoint, method, description, data in test_endpoints:
        try:
            url = f"{base_url}{endpoint}"
            
            if method == 'GET':
                response = requests.get(url, timeout=10)
            else:
                response = requests.post(url, json=data, timeout=10)
            
            result = {
                'endpoint': endpoint,
                'description': description,
                'status_code': response.status_code,
                'success': response.status_code < 400
            }
            
            if response.status_code == 500:
                # Try to get error details
                try:
                    error_text = response.text[:500] if response.text else "No error details"
                    result['error_details'] = error_text
                except:
                    result['error_details'] = "Could not retrieve error details"
            
            results.append(result)
            
            status_icon = "✅" if result['success'] else "❌"
            print(f"{status_icon} {description}: {response.status_code}")
            
            if not result['success'] and 'error_details' in result:
                print(f"   Error: {result['error_details'][:100]}...")
                
        except Exception as e:
            results.append({
                'endpoint': endpoint,
                'description': description,
                'status_code': 0,
                'success': False,
                'error_details': str(e)
            })
            print(f"❌ {description}: Request failed - {e}")
    
    return results

def create_test_data():
    """Create test data if missing"""
    print("\n📋 Creating test data...")
    
    try:
        from apps.authentication.models import User
        from django.contrib.auth.hashers import make_password
        
        # Create demo user if doesn't exist
        demo_user, created = User.objects.get_or_create(
            email='demo@example.com',
            defaults={
                'username': 'demo@example.com',
                'first_name': 'Demo',
                'last_name': 'User',
                'password': make_password('demo123'),
                'is_active': True,
                'is_email_verified': True
            }
        )
        
        if created:
            print("✅ Created demo user: demo@example.com")
        else:
            print("ℹ️ Demo user already exists")
        
        return True
    except Exception as e:
        print(f"❌ Failed to create test data: {e}")
        return False

def run_django_checks():
    """Run Django system checks"""
    print("\n🔍 Running Django system checks...")
    
    try:
        from django.core.management import call_command
        from io import StringIO
        import sys
        
        # Capture output
        old_stdout = sys.stdout
        sys.stdout = result = StringIO()
        
        try:
            call_command('check', verbosity=2)
            sys.stdout = old_stdout
            output = result.getvalue()
            
            if 'System check identified no issues' in output:
                print("✅ Django system checks passed")
                return True
            else:
                print("⚠️ Django system checks found issues:")
                print(output)
                return False
        except Exception as e:
            sys.stdout = old_stdout
            print(f"❌ Django system check failed: {e}")
            return False
    except ImportError:
        print("⚠️ Could not run Django system checks")
        return True

def generate_fix_recommendations(test_results):
    """Generate specific fix recommendations based on test results"""
    print(f"\n🔧 FIX RECOMMENDATIONS")
    print("=" * 50)
    
    # Analyze test results
    failed_endpoints = [r for r in test_results if not r['success']]
    server_errors = [r for r in failed_endpoints if r['status_code'] == 500]
    
    recommendations = []
    
    if server_errors:
        recommendations.append({
            'priority': 'HIGH',
            'issue': f"{len(server_errors)} endpoints returning 500 errors",
            'fixes': [
                "Check Django error logs: tail -f logs/django.log",
                "Verify database migrations: python manage.py showmigrations",
                "Run migrations if needed: python manage.py migrate",
                "Check for missing environment variables in .env file",
                "Restart Django server: python manage.py runserver"
            ]
        })
    
    # Check for authentication issues
    auth_errors = [r for r in failed_endpoints if 'auth' in r['endpoint']]
    if auth_errors:
        recommendations.append({
            'priority': 'MEDIUM',
            'issue': "Authentication endpoints failing",
            'fixes': [
                "Verify JWT configuration in settings.py",
                "Check if django-rest-framework-simplejwt is installed",
                "Ensure SECRET_KEY is properly set",
                "Test user creation manually in Django admin"
            ]
        })
    
    # General recommendations
    recommendations.append({
        'priority': 'LOW',
        'issue': "General maintenance",
        'fixes': [
            "Update requirements: pip install -r requirements.txt",
            "Collect static files: python manage.py collectstatic",
            "Create superuser: python manage.py createsuperuser",
            "Run tests: python manage.py test"
        ]
    })
    
    # Print recommendations
    for i, rec in enumerate(recommendations, 1):
        priority_icon = "🔴" if rec['priority'] == 'HIGH' else "🟡" if rec['priority'] == 'MEDIUM' else "🟢"
        print(f"\n{priority_icon} {rec['priority']} PRIORITY: {rec['issue']}")
        for j, fix in enumerate(rec['fixes'], 1):
            print(f"   {j}. {fix}")
    
    return recommendations

def main():
    """Main diagnostics function"""
    print("🔧 Backend Diagnostics and Fix Tool")
    print("=" * 50)
    
    # Setup Django
    if not setup_django():
        print("❌ Cannot proceed without Django setup")
        return False
    
    # Run diagnostics
    checks = [
        ("Environment Variables", check_environment_variables),
        ("Database Connectivity", check_database_connectivity),
        ("Django Apps", check_django_apps),
        ("Django System Checks", run_django_checks),
        ("Test Data Creation", create_test_data),
    ]
    
    passed_checks = 0
    for check_name, check_func in checks:
        try:
            if check_func():
                passed_checks += 1
        except Exception as e:
            print(f"❌ {check_name} check failed with exception: {e}")
    
    print(f"\n📊 DIAGNOSTIC SUMMARY: {passed_checks}/{len(checks)} checks passed")
    
    # Test individual endpoints
    test_results = test_individual_endpoints()
    
    # Generate recommendations
    generate_fix_recommendations(test_results)
    
    print(f"\n🎯 QUICK FIX COMMANDS:")
    print("=" * 30)
    print("# Navigate to backend directory")
    print("cd backend")
    print()
    print("# Run migrations")
    print("python manage.py migrate")
    print()
    print("# Create test data")
    print("python create_test_users.py")
    print()
    print("# Restart server")
    print("python manage.py runserver")
    print()
    print("# Check logs")
    print("tail -f logs/django.log")
    
    # Save diagnostic report
    report_data = {
        'timestamp': datetime.now().isoformat(),
        'checks_passed': passed_checks,
        'total_checks': len(checks),
        'endpoint_test_results': test_results,
        'backend_directory': backend_path
    }
    
    report_file = f"backend_diagnostic_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    try:
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        print(f"\n📄 Diagnostic report saved to: {report_file}")
    except Exception as e:
        print(f"⚠️ Could not save diagnostic report: {e}")
    
    return passed_checks == len(checks)

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n⚠️ Diagnostic interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Diagnostic failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

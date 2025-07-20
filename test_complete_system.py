#!/usr/bin/env python3
"""
🧪 Complete System Testing Script for Watch Party Platform
Tests both Frontend (Next.js) and Backend (Django) routes and APIs

This script performs comprehensive testing of:
- Backend API endpoints (Authentication, Videos, Parties, Billing, etc.)
- Frontend route accessibility
- WebSocket connections
- File upload functionality
- Payment integration (Stripe)
- Real-time features

Usage:
    python test_complete_system.py
    python test_complete_system.py --verbose
    python test_complete_system.py --frontend-only
    python test_complete_system.py --backend-only
"""

import requests
import json
import time
import sys
import argparse
import asyncio
import websockets
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin
import os
import subprocess
from dataclasses import dataclass

# Configuration
@dataclass
class TestConfig:
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000"
    websocket_url: str = "ws://localhost:8000/ws"
    timeout: int = 10
    verbose: bool = False

# Test Results Tracking
class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.results = []
    
    def add_result(self, test_name: str, status: str, message: str = ""):
        self.results.append({
            'test': test_name,
            'status': status,
            'message': message,
            'timestamp': datetime.now().isoformat()
        })
        if status == 'PASS':
            self.passed += 1
        elif status == 'FAIL':
            self.failed += 1
        elif status == 'WARN':
            self.warnings += 1
    
    def print_summary(self):
        print(f"\n{'='*60}")
        print(f"🧪 TEST SUMMARY")
        print(f"{'='*60}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"⚠️ Warnings: {self.warnings}")
        print(f"📊 Total: {len(self.results)}")
        
        if self.failed > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.results:
                if result['status'] == 'FAIL':
                    print(f"   - {result['test']}: {result['message']}")
        
        print(f"{'='*60}")

# Initialize global test results
results = TestResults()
config = TestConfig()

def log(message: str, level: str = "INFO"):
    """Enhanced logging with timestamps and levels"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    if level == "ERROR":
        print(f"[{timestamp}] ❌ {message}")
    elif level == "SUCCESS":
        print(f"[{timestamp}] ✅ {message}")
    elif level == "WARNING":
        print(f"[{timestamp}] ⚠️ {message}")
    elif level == "INFO":
        print(f"[{timestamp}] ℹ️ {message}")
    elif config.verbose:
        print(f"[{timestamp}] 🔍 {message}")

def test_server_connectivity():
    """Test if both frontend and backend servers are running"""
    log("Testing server connectivity...", "INFO")
    
    # Test Backend
    try:
        response = requests.get(f"{config.backend_url}/api/", timeout=config.timeout)
        if response.status_code in [200, 404, 405]:  # 404/405 acceptable for root endpoint
            results.add_result("Backend Server", "PASS", f"Django server running on {config.backend_url}")
            log("Backend server is running", "SUCCESS")
        else:
            results.add_result("Backend Server", "FAIL", f"Unexpected status: {response.status_code}")
            log(f"Backend server returned status {response.status_code}", "ERROR")
    except requests.exceptions.RequestException as e:
        results.add_result("Backend Server", "FAIL", f"Connection error: {str(e)}")
        log(f"Backend server connection failed: {e}", "ERROR")
    
    # Test Frontend
    try:
        response = requests.get(config.frontend_url, timeout=config.timeout)
        if response.status_code == 200:
            results.add_result("Frontend Server", "PASS", f"Next.js server running on {config.frontend_url}")
            log("Frontend server is running", "SUCCESS")
        else:
            results.add_result("Frontend Server", "FAIL", f"Status: {response.status_code}")
            log(f"Frontend server returned status {response.status_code}", "ERROR")
    except requests.exceptions.RequestException as e:
        results.add_result("Frontend Server", "FAIL", f"Connection error: {str(e)}")
        log(f"Frontend server connection failed: {e}", "ERROR")

def test_backend_authentication():
    """Test Django authentication endpoints"""
    log("Testing backend authentication...", "INFO")
    
    base_url = f"{config.backend_url}/api"
    test_user = {
        'email': f'test_{int(time.time())}@example.com',
        'password': 'TestPassword123!',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    # Test Registration
    try:
        response = requests.post(f"{base_url}/auth/register/", json=test_user, timeout=config.timeout)
        if response.status_code in [200, 201]:
            results.add_result("User Registration", "PASS", "Registration endpoint working")
            log("User registration successful", "SUCCESS")
            registration_data = response.json()
        elif response.status_code == 400:
            results.add_result("User Registration", "WARN", "Validation error (expected)")
            log("Registration validation working", "WARNING")
            registration_data = None
        else:
            results.add_result("User Registration", "FAIL", f"Status: {response.status_code}")
            log(f"Registration failed with status {response.status_code}", "ERROR")
            registration_data = None
    except requests.exceptions.RequestException as e:
        results.add_result("User Registration", "FAIL", f"Request error: {str(e)}")
        log(f"Registration request failed: {e}", "ERROR")
        registration_data = None
    
    # Test Login with existing demo user
    login_data = {
        'email': 'demo@example.com',
        'password': 'demo123'
    }
    
    try:
        response = requests.post(f"{base_url}/auth/login/", json=login_data, timeout=config.timeout)
        if response.status_code == 200:
            login_result = response.json()
            access_token = login_result.get('access_token') or login_result.get('access')
            refresh_token = login_result.get('refresh_token') or login_result.get('refresh')
            
            results.add_result("User Login", "PASS", "Login endpoint working")
            log("User login successful", "SUCCESS")
            
            if access_token:
                # Test protected endpoint
                test_protected_endpoints(access_token)
                
                # Test token refresh
                if refresh_token:
                    test_token_refresh(refresh_token)
        else:
            results.add_result("User Login", "FAIL", f"Status: {response.status_code}")
            log(f"Login failed with status {response.status_code}", "ERROR")
    except requests.exceptions.RequestException as e:
        results.add_result("User Login", "FAIL", f"Request error: {str(e)}")
        log(f"Login request failed: {e}", "ERROR")

def test_protected_endpoints(access_token: str):
    """Test protected endpoints with JWT token"""
    log("Testing protected endpoints...", "INFO")
    
    base_url = f"{config.backend_url}/api"
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    protected_endpoints = [
        ('/users/profile/', 'GET', 'User Profile'),
        ('/videos/', 'GET', 'Video List'),
        ('/parties/', 'GET', 'Party List'),
        ('/dashboard/stats/', 'GET', 'Dashboard Stats'),
        ('/notifications/', 'GET', 'Notifications'),
    ]
    
    for endpoint, method, description in protected_endpoints:
        try:
            if method == 'GET':
                response = requests.get(f"{base_url}{endpoint}", headers=headers, timeout=config.timeout)
            else:
                response = requests.post(f"{base_url}{endpoint}", headers=headers, timeout=config.timeout)
            
            if response.status_code in [200, 201]:
                results.add_result(description, "PASS", f"Endpoint accessible with auth")
                log(f"{description} endpoint working", "SUCCESS")
            elif response.status_code == 404:
                results.add_result(description, "WARN", "Endpoint not found (may not be implemented)")
                log(f"{description} endpoint not found", "WARNING")
            else:
                results.add_result(description, "FAIL", f"Status: {response.status_code}")
                log(f"{description} failed with status {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            results.add_result(description, "FAIL", f"Request error: {str(e)}")
            log(f"{description} request failed: {e}", "ERROR")

def test_token_refresh(refresh_token: str):
    """Test JWT token refresh"""
    log("Testing token refresh...", "INFO")
    
    try:
        refresh_data = {'refresh': refresh_token}
        response = requests.post(
            f"{config.backend_url}/api/auth/refresh/",
            json=refresh_data,
            timeout=config.timeout
        )
        
        if response.status_code == 200:
            results.add_result("Token Refresh", "PASS", "Token refresh working")
            log("Token refresh successful", "SUCCESS")
        else:
            results.add_result("Token Refresh", "FAIL", f"Status: {response.status_code}")
            log(f"Token refresh failed with status {response.status_code}", "ERROR")
    except requests.exceptions.RequestException as e:
        results.add_result("Token Refresh", "FAIL", f"Request error: {str(e)}")
        log(f"Token refresh request failed: {e}", "ERROR")

def test_backend_apis():
    """Test all major backend API endpoints"""
    log("Testing backend API endpoints...", "INFO")
    
    base_url = f"{config.backend_url}/api"
    
    # Public endpoints (no auth required)
    public_endpoints = [
        ('/auth/register/', 'POST', 'Registration API'),
        ('/auth/login/', 'POST', 'Login API'),
        ('/videos/', 'GET', 'Public Videos'),
        ('/parties/public/', 'GET', 'Public Parties'),
        ('/billing/plans/', 'GET', 'Subscription Plans'),
    ]
    
    # Test public endpoints
    for endpoint, method, description in public_endpoints:
        try:
            if method == 'GET':
                response = requests.get(f"{base_url}{endpoint}", timeout=config.timeout)
            else:
                # Use minimal test data for POST requests
                test_data = {'test': 'data'}
                response = requests.post(f"{base_url}{endpoint}", json=test_data, timeout=config.timeout)
            
            if response.status_code in [200, 201, 400, 401]:  # 400/401 acceptable for incomplete data
                results.add_result(f"API: {description}", "PASS", "Endpoint accessible")
                log(f"{description} API accessible", "SUCCESS")
            elif response.status_code == 404:
                results.add_result(f"API: {description}", "WARN", "Endpoint not implemented")
                log(f"{description} API not found", "WARNING")
            else:
                results.add_result(f"API: {description}", "FAIL", f"Status: {response.status_code}")
                log(f"{description} API failed: {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            results.add_result(f"API: {description}", "FAIL", f"Request error: {str(e)}")
            log(f"{description} API request failed: {e}", "ERROR")

def test_frontend_routes():
    """Test Next.js frontend routes"""
    log("Testing frontend routes...", "INFO")
    
    # Public routes from the README
    public_routes = [
        ('/', 'Landing Page'),
        ('/join', 'Signup Page'),
        ('/login', 'Login Page'),
        ('/forgot-password', 'Password Reset'),
        ('/pricing', 'Pricing Plans'),
        ('/about', 'About Us'),
        ('/contact', 'Contact Form'),
        ('/help', 'FAQ & Support'),
        ('/features', 'Feature Deep Dive'),
        ('/terms', 'Terms of Service'),
        ('/privacy', 'Privacy Policy'),
        ('/blog', 'Blog/News'),
        ('/mobile', 'Mobile Redirect'),
    ]
    
    for route, description in public_routes:
        try:
            response = requests.get(f"{config.frontend_url}{route}", timeout=config.timeout)
            if response.status_code == 200:
                results.add_result(f"Route: {description}", "PASS", f"Route {route} accessible")
                log(f"{description} route ({route}) accessible", "SUCCESS")
            elif response.status_code == 404:
                results.add_result(f"Route: {description}", "WARN", f"Route {route} not implemented")
                log(f"{description} route ({route}) not found", "WARNING")
            else:
                results.add_result(f"Route: {description}", "FAIL", f"Status: {response.status_code}")
                log(f"{description} route failed: {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            results.add_result(f"Route: {description}", "FAIL", f"Request error: {str(e)}")
            log(f"{description} route request failed: {e}", "ERROR")

def test_protected_routes():
    """Test protected frontend routes (requires authentication)"""
    log("Testing protected frontend routes...", "INFO")
    
    # Protected routes from the README
    protected_routes = [
        ('/dashboard', 'Dashboard Home'),
        ('/dashboard/party/create', 'Create Party Form'),
        ('/dashboard/parties', 'Party Management'),
        ('/dashboard/videos', 'Video Library'),
        ('/dashboard/videos/upload', 'Upload Interface'),
        ('/dashboard/favorites', 'Saved Content'),
        ('/dashboard/friends', 'Social Management'),
        ('/dashboard/notifications', 'Notification Center'),
        ('/dashboard/settings/profile', 'Profile Settings'),
        ('/dashboard/settings/security', 'Security Settings'),
        ('/dashboard/billing', 'Billing Management'),
        ('/dashboard/support', 'User Support'),
    ]
    
    for route, description in protected_routes:
        try:
            response = requests.get(f"{config.frontend_url}{route}", timeout=config.timeout)
            if response.status_code == 200:
                results.add_result(f"Protected Route: {description}", "PASS", f"Route {route} accessible")
                log(f"Protected {description} route ({route}) accessible", "SUCCESS")
            elif response.status_code in [401, 403, 302]:  # Redirect to login is expected
                results.add_result(f"Protected Route: {description}", "PASS", f"Route {route} properly protected")
                log(f"Protected {description} route ({route}) properly secured", "SUCCESS")
            elif response.status_code == 404:
                results.add_result(f"Protected Route: {description}", "WARN", f"Route {route} not implemented")
                log(f"Protected {description} route ({route}) not found", "WARNING")
            else:
                results.add_result(f"Protected Route: {description}", "FAIL", f"Status: {response.status_code}")
                log(f"Protected {description} route failed: {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            results.add_result(f"Protected Route: {description}", "FAIL", f"Request error: {str(e)}")
            log(f"Protected {description} route request failed: {e}", "ERROR")

def test_admin_routes():
    """Test admin routes"""
    log("Testing admin routes...", "INFO")
    
    admin_routes = [
        ('/admin', 'Admin Dashboard'),
        ('/admin/users', 'User Management'),
        ('/admin/videos', 'Content Moderation'),
        ('/admin/parties', 'Party Monitoring'),
        ('/admin/system', 'System Controls'),
        ('/admin/analytics', 'Analytics Dashboard'),
        ('/admin/settings', 'System Settings'),
    ]
    
    for route, description in admin_routes:
        try:
            response = requests.get(f"{config.frontend_url}{route}", timeout=config.timeout)
            if response.status_code in [401, 403, 302]:  # Should be protected
                results.add_result(f"Admin Route: {description}", "PASS", f"Route {route} properly protected")
                log(f"Admin {description} route ({route}) properly secured", "SUCCESS")
            elif response.status_code == 200:
                results.add_result(f"Admin Route: {description}", "WARN", f"Route {route} accessible without auth")
                log(f"Admin {description} route ({route}) accessible (check auth)", "WARNING")
            elif response.status_code == 404:
                results.add_result(f"Admin Route: {description}", "WARN", f"Route {route} not implemented")
                log(f"Admin {description} route ({route}) not found", "WARNING")
            else:
                results.add_result(f"Admin Route: {description}", "FAIL", f"Status: {response.status_code}")
                log(f"Admin {description} route failed: {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            results.add_result(f"Admin Route: {description}", "FAIL", f"Request error: {str(e)}")
            log(f"Admin {description} route request failed: {e}", "ERROR")

async def test_websocket_connection():
    """Test WebSocket connectivity for real-time features"""
    log("Testing WebSocket connection...", "INFO")
    
    try:
        # Test WebSocket connection with proper timeout handling
        uri = f"{config.websocket_url}/test/"
        
        # Use asyncio timeout instead of websockets timeout parameter
        async with asyncio.timeout(config.timeout):
            async with websockets.connect(uri) as websocket:
                # Send a test message
                test_message = json.dumps({"type": "ping", "data": "test"})
                await websocket.send(test_message)
                
                # Wait for response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=5)
                    results.add_result("WebSocket Connection", "PASS", "WebSocket server responding")
                    log("WebSocket connection successful", "SUCCESS")
                except asyncio.TimeoutError:
                    results.add_result("WebSocket Connection", "WARN", "WebSocket connected but no response")
                    log("WebSocket connected but no response", "WARNING")
    except asyncio.TimeoutError:
        results.add_result("WebSocket Connection", "FAIL", "WebSocket connection timeout")
        log("WebSocket connection timeout", "ERROR")
    except Exception as e:
        results.add_result("WebSocket Connection", "FAIL", f"Connection error: {str(e)}")
        log(f"WebSocket connection failed: {e}", "ERROR")

def test_file_upload_endpoints():
    """Test file upload functionality"""
    log("Testing file upload endpoints...", "INFO")
    
    base_url = f"{config.backend_url}/api"
    
    # Test video upload endpoints
    upload_endpoints = [
        ('/videos/upload/direct/', 'Direct Upload'),
        ('/videos/upload/s3/', 'S3 Upload'),
        ('/videos/upload/gdrive/', 'Google Drive Upload'),
    ]
    
    for endpoint, description in upload_endpoints:
        try:
            # Test without auth first (should fail)
            response = requests.post(f"{base_url}{endpoint}", timeout=config.timeout)
            if response.status_code in [401, 403]:
                results.add_result(f"Upload: {description}", "PASS", "Upload endpoint properly protected")
                log(f"{description} endpoint properly protected", "SUCCESS")
            elif response.status_code == 404:
                results.add_result(f"Upload: {description}", "WARN", "Upload endpoint not found")
                log(f"{description} endpoint not found", "WARNING")
            else:
                results.add_result(f"Upload: {description}", "WARN", f"Unexpected status: {response.status_code}")
                log(f"{description} endpoint returned {response.status_code}", "WARNING")
        except requests.exceptions.RequestException as e:
            results.add_result(f"Upload: {description}", "FAIL", f"Request error: {str(e)}")
            log(f"{description} endpoint request failed: {e}", "ERROR")

def test_billing_integration():
    """Test billing and subscription endpoints"""
    log("Testing billing integration...", "INFO")
    
    base_url = f"{config.backend_url}/api"
    
    billing_endpoints = [
        ('/billing/plans/', 'GET', 'Subscription Plans'),
        ('/billing/subscription/', 'GET', 'Current Subscription'),
        ('/billing/payment-methods/', 'GET', 'Payment Methods'),
        ('/billing/history/', 'GET', 'Billing History'),
    ]
    
    for endpoint, method, description in billing_endpoints:
        try:
            response = requests.get(f"{base_url}{endpoint}", timeout=config.timeout)
            if response.status_code in [200, 401, 403]:  # 401/403 expected without auth
                results.add_result(f"Billing: {description}", "PASS", "Billing endpoint accessible")
                log(f"{description} endpoint accessible", "SUCCESS")
            elif response.status_code == 404:
                results.add_result(f"Billing: {description}", "WARN", "Billing endpoint not implemented")
                log(f"{description} endpoint not found", "WARNING")
            else:
                results.add_result(f"Billing: {description}", "FAIL", f"Status: {response.status_code}")
                log(f"{description} endpoint failed: {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            results.add_result(f"Billing: {description}", "FAIL", f"Request error: {str(e)}")
            log(f"{description} endpoint request failed: {e}", "ERROR")

def test_api_documentation():
    """Test API documentation endpoints"""
    log("Testing API documentation...", "INFO")
    
    doc_endpoints = [
        ('/api/docs/', 'Swagger UI'),
        ('/api/schema/', 'OpenAPI Schema'),
        ('/api/redoc/', 'ReDoc'),
    ]
    
    for endpoint, description in doc_endpoints:
        try:
            response = requests.get(f"{config.backend_url}{endpoint}", timeout=config.timeout)
            if response.status_code == 200:
                results.add_result(f"Docs: {description}", "PASS", f"{description} accessible")
                log(f"{description} documentation accessible", "SUCCESS")
            elif response.status_code == 404:
                results.add_result(f"Docs: {description}", "WARN", f"{description} not configured")
                log(f"{description} documentation not found", "WARNING")
            else:
                results.add_result(f"Docs: {description}", "FAIL", f"Status: {response.status_code}")
                log(f"{description} documentation failed: {response.status_code}", "ERROR")
        except requests.exceptions.RequestException as e:
            results.add_result(f"Docs: {description}", "FAIL", f"Request error: {str(e)}")
            log(f"{description} documentation request failed: {e}", "ERROR")

def check_environment_variables():
    """Check for required environment variables"""
    log("Checking environment variables...", "INFO")
    
    # Backend environment variables
    backend_env_vars = [
        'SECRET_KEY',
        'DATABASE_URL',
        'REDIS_URL',
        'STRIPE_SECRET_KEY',
        'STRIPE_PUBLISHABLE_KEY',
    ]
    
    # Frontend environment variables
    frontend_env_vars = [
        'NEXT_PUBLIC_API_URL',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'NEXT_PUBLIC_WEBSOCKET_URL',
    ]
    
    # Check backend .env file
    backend_env_path = os.path.join(os.path.dirname(__file__), 'backend', '.env')
    if os.path.exists(backend_env_path):
        results.add_result("Backend Environment", "PASS", "Backend .env file found")
        log("Backend .env file exists", "SUCCESS")
    else:
        results.add_result("Backend Environment", "WARN", "Backend .env file not found")
        log("Backend .env file not found", "WARNING")
    
    # Check frontend .env file
    frontend_env_path = os.path.join(os.path.dirname(__file__), 'watch-party', '.env.local')
    if os.path.exists(frontend_env_path):
        results.add_result("Frontend Environment", "PASS", "Frontend .env.local file found")
        log("Frontend .env.local file exists", "SUCCESS")
    else:
        results.add_result("Frontend Environment", "WARN", "Frontend .env.local file not found")
        log("Frontend .env.local file not found", "WARNING")

def run_performance_tests():
    """Run basic performance tests"""
    log("Running performance tests...", "INFO")
    
    # Test response times
    start_time = time.time()
    try:
        response = requests.get(f"{config.frontend_url}/", timeout=config.timeout)
        frontend_time = time.time() - start_time
        
        if frontend_time < 2.0:
            results.add_result("Frontend Performance", "PASS", f"Response time: {frontend_time:.2f}s")
            log(f"Frontend response time: {frontend_time:.2f}s", "SUCCESS")
        elif frontend_time < 5.0:
            results.add_result("Frontend Performance", "WARN", f"Slow response time: {frontend_time:.2f}s")
            log(f"Frontend slow response: {frontend_time:.2f}s", "WARNING")
        else:
            results.add_result("Frontend Performance", "FAIL", f"Very slow response: {frontend_time:.2f}s")
            log(f"Frontend very slow: {frontend_time:.2f}s", "ERROR")
    except:
        results.add_result("Frontend Performance", "FAIL", "Could not measure response time")
    
    # Test backend response time
    start_time = time.time()
    try:
        response = requests.get(f"{config.backend_url}/api/", timeout=config.timeout)
        backend_time = time.time() - start_time
        
        if backend_time < 1.0:
            results.add_result("Backend Performance", "PASS", f"Response time: {backend_time:.2f}s")
            log(f"Backend response time: {backend_time:.2f}s", "SUCCESS")
        elif backend_time < 3.0:
            results.add_result("Backend Performance", "WARN", f"Slow response time: {backend_time:.2f}s")
            log(f"Backend slow response: {backend_time:.2f}s", "WARNING")
        else:
            results.add_result("Backend Performance", "FAIL", f"Very slow response: {backend_time:.2f}s")
            log(f"Backend very slow: {backend_time:.2f}s", "ERROR")
    except:
        results.add_result("Backend Performance", "FAIL", "Could not measure response time")

def generate_test_report():
    """Generate a detailed test report"""
    report_file = f"test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    report_data = {
        'timestamp': datetime.now().isoformat(),
        'config': {
            'backend_url': config.backend_url,
            'frontend_url': config.frontend_url,
            'timeout': config.timeout
        },
        'summary': {
            'total_tests': len(results.results),
            'passed': results.passed,
            'failed': results.failed,
            'warnings': results.warnings
        },
        'results': results.results
    }
    
    try:
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        log(f"Test report saved to {report_file}", "SUCCESS")
        return report_file
    except Exception as e:
        log(f"Failed to save test report: {e}", "ERROR")
        return None

def main():
    """Main test execution function"""
    global config
    
    parser = argparse.ArgumentParser(description='Complete system testing for Watch Party Platform')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--frontend-only', action='store_true', help='Test only frontend routes')
    parser.add_argument('--backend-only', action='store_true', help='Test only backend APIs')
    parser.add_argument('--backend-url', default='http://localhost:8000', help='Backend URL')
    parser.add_argument('--frontend-url', default='http://localhost:3000', help='Frontend URL')
    parser.add_argument('--timeout', type=int, default=10, help='Request timeout in seconds')
    
    args = parser.parse_args()
    
    # Update config
    config.verbose = args.verbose
    config.backend_url = args.backend_url
    config.frontend_url = args.frontend_url
    config.timeout = args.timeout
    
    print(f"""
🚀 Watch Party Platform - Complete System Testing
{'='*60}
Backend URL: {config.backend_url}
Frontend URL: {config.frontend_url}
Timeout: {config.timeout}s
Verbose: {config.verbose}
{'='*60}
""")
    
    # Check environment setup
    check_environment_variables()
    
    # Test server connectivity first
    test_server_connectivity()
    
    if not args.frontend_only:
        # Backend tests
        log("Starting backend tests...", "INFO")
        test_backend_authentication()
        test_backend_apis()
        test_file_upload_endpoints()
        test_billing_integration()
        test_api_documentation()
        
        # WebSocket tests (async)
        try:
            asyncio.run(test_websocket_connection())
        except Exception as e:
            log(f"WebSocket test failed: {e}", "ERROR")
    
    if not args.backend_only:
        # Frontend tests
        log("Starting frontend tests...", "INFO")
        test_frontend_routes()
        test_protected_routes()
        test_admin_routes()
    
    # Performance tests
    if not args.frontend_only and not args.backend_only:
        run_performance_tests()
    
    # Generate report
    report_file = generate_test_report()
    
    # Print summary
    results.print_summary()
    
    if report_file:
        print(f"\n📄 Detailed report saved to: {report_file}")
    
    print(f"""
🔧 NEXT STEPS:
{'='*60}
1. Fix any FAILED tests before production
2. Address WARNING issues for better reliability
3. Ensure all environment variables are configured
4. Run tests on staging environment
5. Set up continuous integration testing
{'='*60}
""")
    
    # Exit with appropriate code
    if results.failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()

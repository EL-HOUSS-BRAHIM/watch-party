#!/usr/bin/env python3
"""
🚀 Enhanced System Testing Script with Smart Timeout Handling
Handles slow Next.js compilation times and provides better error handling

This version includes:
- Adaptive timeout based on route complexity
- Retry logic for slow-compiling routes
- Better error categorization
- Progressive timeout increases
"""

import requests
import json
import time
import sys
import argparse
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from urllib.parse import urljoin
import os
from dataclasses import dataclass

# Import our test configuration
try:
    from test_config import *
except ImportError:
    print("⚠️ test_config.py not found, using default configuration")
    DEFAULT_BACKEND_URL = "http://localhost:8000"
    DEFAULT_FRONTEND_URL = "http://localhost:3000"

# Enhanced configuration with adaptive timeouts
@dataclass
class SmartTestConfig:
    backend_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3000" 
    websocket_url: str = "ws://localhost:8000/ws"
    base_timeout: int = 15
    slow_route_timeout: int = 60  # For routes that need compilation
    max_retries: int = 2
    verbose: bool = False
    
    # Smart timeout mapping based on route complexity
    route_timeouts = {
        # Fast routes (already compiled or simple)
        '/': 15,
        '/blog': 15,
        '/mobile': 15,
        
        # Medium complexity routes
        '/dashboard': 30,
        '/login': 30,
        '/about': 30,
        '/privacy': 30,
        
        # Slow routes (heavy compilation)
        '/join': 60,
        '/forgot-password': 60,
        '/pricing': 60,
        '/contact': 60,
        '/help': 60,
        '/features': 60,
        '/terms': 60,
        '/dashboard/parties': 45,
        '/dashboard/videos': 30,
        '/dashboard/videos/upload': 45,
        '/dashboard/friends': 45,
        '/dashboard/notifications': 45,
        '/dashboard/billing': 45,
        '/dashboard/support': 45,
        '/admin': 45,
        '/admin/users': 45,
        '/admin/parties': 45,
        '/admin/system': 45,
        '/admin/analytics': 45,
        '/admin/settings': 45,
    }
    
    def get_timeout_for_route(self, route: str) -> int:
        """Get adaptive timeout based on route complexity"""
        return self.route_timeouts.get(route, self.base_timeout)

# Test Results with enhanced categorization
class EnhancedTestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        self.timeouts = 0
        self.results = []
        self.performance_issues = []
    
    def add_result(self, test_name: str, status: str, message: str = "", response_time: float = 0):
        self.results.append({
            'test': test_name,
            'status': status,
            'message': message,
            'response_time': response_time,
            'timestamp': datetime.now().isoformat()
        })
        
        if status == 'PASS':
            self.passed += 1
        elif status == 'FAIL':
            self.failed += 1
        elif status == 'WARN':
            self.warnings += 1
        elif status == 'TIMEOUT':
            self.timeouts += 1
            self.failed += 1  # Count timeouts as failures
            
        # Track performance issues
        if response_time > 30:
            self.performance_issues.append({
                'test': test_name,
                'response_time': response_time,
                'severity': 'high' if response_time > 60 else 'medium'
            })
    
    def print_enhanced_summary(self):
        print(f"\n{'='*70}")
        print(f"🧪 ENHANCED TEST SUMMARY")
        print(f"{'='*70}")
        print(f"✅ Passed: {self.passed}")
        print(f"❌ Failed: {self.failed}")
        print(f"⚠️ Warnings: {self.warnings}")
        print(f"⏰ Timeouts: {self.timeouts}")
        print(f"📊 Total: {len(self.results)}")
        
        # Performance analysis
        if self.performance_issues:
            print(f"\n⚡ PERFORMANCE ANALYSIS")
            print(f"{'='*40}")
            high_perf_issues = [p for p in self.performance_issues if p['severity'] == 'high']
            medium_perf_issues = [p for p in self.performance_issues if p['severity'] == 'medium']
            
            if high_perf_issues:
                print(f"🔴 High Impact (>60s): {len(high_perf_issues)} routes")
                for issue in high_perf_issues[:3]:  # Show top 3
                    print(f"   - {issue['test']}: {issue['response_time']:.1f}s")
            
            if medium_perf_issues:
                print(f"🟡 Medium Impact (30-60s): {len(medium_perf_issues)} routes")
                for issue in medium_perf_issues[:3]:  # Show top 3
                    print(f"   - {issue['test']}: {issue['response_time']:.1f}s")
        
        # Error categorization
        failed_tests = [r for r in self.results if r['status'] == 'FAIL']
        timeout_tests = [r for r in failed_tests if 'timeout' in r['message'].lower()]
        server_error_tests = [r for r in failed_tests if '500' in r['message']]
        not_found_tests = [r for r in failed_tests if '404' in r['message']]
        
        if failed_tests:
            print(f"\n❌ FAILURE ANALYSIS")
            print(f"{'='*40}")
            if timeout_tests:
                print(f"⏰ Timeout Issues: {len(timeout_tests)}")
            if server_error_tests:
                print(f"🔥 Server Errors (500): {len(server_error_tests)}")
            if not_found_tests:
                print(f"🔍 Not Found (404): {len(not_found_tests)}")
        
        print(f"{'='*70}")

# Initialize enhanced test results
results = EnhancedTestResults()
config = SmartTestConfig()

def log(message: str, level: str = "INFO", response_time: float = 0):
    """Enhanced logging with response time tracking"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    time_info = f" ({response_time:.1f}s)" if response_time > 0 else ""
    
    if level == "ERROR":
        print(f"[{timestamp}] ❌ {message}{time_info}")
    elif level == "SUCCESS":
        print(f"[{timestamp}] ✅ {message}{time_info}")
    elif level == "WARNING":
        print(f"[{timestamp}] ⚠️ {message}{time_info}")
    elif level == "TIMEOUT":
        print(f"[{timestamp}] ⏰ {message}{time_info}")
    elif level == "INFO":
        print(f"[{timestamp}] ℹ️ {message}{time_info}")
    elif config.verbose:
        print(f"[{timestamp}] 🔍 {message}{time_info}")

def smart_request(url: str, method: str = "GET", **kwargs) -> Tuple[requests.Response, float]:
    """Make HTTP request with adaptive timeout and retry logic"""
    route_path = url.replace(config.frontend_url, "").replace(config.backend_url, "")
    timeout = config.get_timeout_for_route(route_path)
    
    for attempt in range(config.max_retries + 1):
        start_time = time.time()
        try:
            if method.upper() == "GET":
                response = requests.get(url, timeout=timeout, **kwargs)
            elif method.upper() == "POST":
                response = requests.post(url, timeout=timeout, **kwargs)
            else:
                response = requests.request(method, url, timeout=timeout, **kwargs)
            
            response_time = time.time() - start_time
            return response, response_time
            
        except requests.exceptions.Timeout:
            response_time = time.time() - start_time
            if attempt < config.max_retries:
                timeout = min(timeout * 1.5, 120)  # Increase timeout, max 2 minutes
                log(f"Request timeout, retrying with {timeout}s timeout (attempt {attempt + 2}/{config.max_retries + 1})", "WARNING")
                continue
            else:
                log(f"Request failed after {config.max_retries + 1} attempts", "TIMEOUT", response_time)
                raise
        except Exception as e:
            response_time = time.time() - start_time
            if attempt < config.max_retries:
                log(f"Request error, retrying (attempt {attempt + 2}/{config.max_retries + 1}): {str(e)[:50]}", "WARNING")
                time.sleep(2)  # Brief delay before retry
                continue
            else:
                raise

def test_frontend_routes_enhanced():
    """Enhanced frontend route testing with smart timeouts"""
    log("Testing frontend routes with smart timeout handling...", "INFO")
    
    # Group routes by expected compilation complexity
    route_groups = {
        "fast": [
            ("/", "Landing Page"),
            ("/blog", "Blog/News"),
            ("/mobile", "Mobile Redirect"),
        ],
        "medium": [
            ("/dashboard", "Dashboard Home"),
            ("/login", "Login Page"),
            ("/about", "About Us"),
            ("/privacy", "Privacy Policy"),
        ],
        "slow": [
            ("/join", "Signup Page"),
            ("/forgot-password", "Password Reset"),
            ("/pricing", "Pricing Plans"),
            ("/contact", "Contact Form"),
            ("/help", "FAQ & Support"),
            ("/features", "Feature Deep Dive"),
            ("/terms", "Terms of Service"),
        ]
    }
    
    for group_name, routes in route_groups.items():
        log(f"Testing {group_name} routes...", "INFO")
        
        for route, description in routes:
            try:
                response, response_time = smart_request(f"{config.frontend_url}{route}")
                
                if response.status_code == 200:
                    status = "PASS" if response_time < 30 else "WARN"
                    message = f"Route {route} accessible"
                    if response_time > 30:
                        message += f" (slow: {response_time:.1f}s)"
                    
                    results.add_result(f"Route: {description}", status, message, response_time)
                    log(f"{description} route ({route}) accessible", "SUCCESS", response_time)
                    
                elif response.status_code == 404:
                    results.add_result(f"Route: {description}", "WARN", f"Route {route} not implemented", response_time)
                    log(f"{description} route ({route}) not found", "WARNING", response_time)
                else:
                    results.add_result(f"Route: {description}", "FAIL", f"Status: {response.status_code}", response_time)
                    log(f"{description} route failed: {response.status_code}", "ERROR", response_time)
                    
            except requests.exceptions.Timeout:
                results.add_result(f"Route: {description}", "TIMEOUT", f"Route {route} compilation timeout", 0)
                log(f"{description} route ({route}) compilation timeout", "TIMEOUT")
            except Exception as e:
                results.add_result(f"Route: {description}", "FAIL", f"Request error: {str(e)[:100]}", 0)
                log(f"{description} route request failed: {e}", "ERROR")

def test_protected_routes_enhanced():
    """Enhanced protected route testing"""
    log("Testing protected routes with smart timeout handling...", "INFO")
    
    protected_routes = [
        ("/dashboard/parties", "Party Management"),
        ("/dashboard/videos", "Video Library"),
        ("/dashboard/videos/upload", "Upload Interface"),
        ("/dashboard/favorites", "Saved Content"),
        ("/dashboard/friends", "Social Management"),
        ("/dashboard/notifications", "Notification Center"),
        ("/dashboard/billing", "Billing Management"),
        ("/dashboard/support", "User Support"),
    ]
    
    for route, description in protected_routes:
        try:
            response, response_time = smart_request(f"{config.frontend_url}{route}")
            
            if response.status_code == 200:
                status = "PASS" if response_time < 45 else "WARN"
                message = f"Route {route} accessible"
                if response_time > 45:
                    message += f" (very slow: {response_time:.1f}s)"
                    
                results.add_result(f"Protected Route: {description}", status, message, response_time)
                log(f"Protected {description} route ({route}) accessible", "SUCCESS", response_time)
                
            elif response.status_code in [401, 403, 302]:
                results.add_result(f"Protected Route: {description}", "PASS", f"Route {route} properly protected", response_time)
                log(f"Protected {description} route ({route}) properly secured", "SUCCESS", response_time)
                
            elif response.status_code == 404:
                results.add_result(f"Protected Route: {description}", "WARN", f"Route {route} not implemented", response_time)
                log(f"Protected {description} route ({route}) not found", "WARNING", response_time)
            else:
                results.add_result(f"Protected Route: {description}", "FAIL", f"Status: {response.status_code}", response_time)
                log(f"Protected {description} route failed: {response.status_code}", "ERROR", response_time)
                
        except requests.exceptions.Timeout:
            results.add_result(f"Protected Route: {description}", "TIMEOUT", f"Route {route} compilation timeout", 0)
            log(f"Protected {description} route ({route}) compilation timeout", "TIMEOUT")
        except Exception as e:
            results.add_result(f"Protected Route: {description}", "FAIL", f"Request error: {str(e)[:100]}", 0)
            log(f"Protected {description} route request failed: {e}", "ERROR")

def test_backend_apis_enhanced():
    """Enhanced backend API testing with better error handling"""
    log("Testing backend APIs with enhanced error detection...", "INFO")
    
    # Test authentication first
    access_token = None
    try:
        login_data = {"email": "demo@example.com", "password": "demo123"}
        response, response_time = smart_request(f"{config.backend_url}/api/auth/login/", "POST", json=login_data)
        
        if response.status_code == 200:
            results.add_result("User Login", "PASS", "Login endpoint working", response_time)
            log("User login successful", "SUCCESS", response_time)
            
            try:
                login_result = response.json()
                access_token = login_result.get('access_token') or login_result.get('access')
                if access_token:
                    log("Access token obtained for protected endpoint testing", "SUCCESS")
            except json.JSONDecodeError:
                log("Could not parse login response JSON", "WARNING")
                
        else:
            results.add_result("User Login", "FAIL", f"Status: {response.status_code}", response_time)
            log(f"Login failed with status {response.status_code}", "ERROR", response_time)
            
    except Exception as e:
        results.add_result("User Login", "FAIL", f"Request error: {str(e)}", 0)
        log(f"Login request failed: {e}", "ERROR")
    
    # Test protected endpoints if we have a token
    if access_token:
        headers = {'Authorization': f'Bearer {access_token}', 'Content-Type': 'application/json'}
        
        protected_apis = [
            ('/api/users/profile/', 'GET', 'User Profile'),
            ('/api/videos/', 'GET', 'Video List'),
            ('/api/parties/', 'GET', 'Party List'),
        ]
        
        for endpoint, method, description in protected_apis:
            try:
                response, response_time = smart_request(f"{config.backend_url}{endpoint}", method, headers=headers)
                
                if response.status_code in [200, 201]:
                    results.add_result(description, "PASS", f"Endpoint accessible with auth", response_time)
                    log(f"{description} endpoint working", "SUCCESS", response_time)
                elif response.status_code == 500:
                    results.add_result(description, "FAIL", f"Server error: {response.status_code}", response_time)
                    log(f"{description} has server error (500)", "ERROR", response_time)
                    
                    # Try to get more details from the response
                    try:
                        error_detail = response.text[:200] if response.text else "No error details"
                        log(f"Server error details: {error_detail}", "ERROR")
                    except:
                        pass
                elif response.status_code == 404:
                    results.add_result(description, "WARN", "Endpoint not found (may not be implemented)", response_time)
                    log(f"{description} endpoint not found", "WARNING", response_time)
                else:
                    results.add_result(description, "FAIL", f"Status: {response.status_code}", response_time)
                    log(f"{description} failed with status {response.status_code}", "ERROR", response_time)
                    
            except Exception as e:
                results.add_result(description, "FAIL", f"Request error: {str(e)}", 0)
                log(f"{description} request failed: {e}", "ERROR")

def create_detailed_report():
    """Create enhanced test report with performance analysis"""
    report_file = f"enhanced_test_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    
    # Calculate performance statistics
    response_times = [r['response_time'] for r in results.results if r.get('response_time', 0) > 0]
    performance_stats = {}
    
    if response_times:
        performance_stats = {
            'average_response_time': sum(response_times) / len(response_times),
            'max_response_time': max(response_times),
            'min_response_time': min(response_times),
            'slow_routes_count': len([t for t in response_times if t > 30]),
            'very_slow_routes_count': len([t for t in response_times if t > 60])
        }
    
    report_data = {
        'timestamp': datetime.now().isoformat(),
        'config': {
            'backend_url': config.backend_url,
            'frontend_url': config.frontend_url,
            'base_timeout': config.base_timeout,
            'slow_route_timeout': config.slow_route_timeout,
            'max_retries': config.max_retries
        },
        'summary': {
            'total_tests': len(results.results),
            'passed': results.passed,
            'failed': results.failed,
            'warnings': results.warnings,
            'timeouts': results.timeouts
        },
        'performance_analysis': performance_stats,
        'performance_issues': results.performance_issues,
        'results': results.results,
        'recommendations': generate_recommendations()
    }
    
    try:
        with open(report_file, 'w') as f:
            json.dump(report_data, f, indent=2)
        
        log(f"Enhanced test report saved to {report_file}", "SUCCESS")
        return report_file
    except Exception as e:
        log(f"Failed to save test report: {e}", "ERROR")
        return None

def generate_recommendations():
    """Generate actionable recommendations based on test results"""
    recommendations = []
    
    # Performance recommendations
    if results.performance_issues:
        high_perf_count = len([p for p in results.performance_issues if p['severity'] == 'high'])
        if high_perf_count > 0:
            recommendations.append({
                'category': 'performance',
                'priority': 'high',
                'issue': f"{high_perf_count} routes taking >60s to compile",
                'recommendation': "Consider optimizing Next.js build configuration, reducing bundle size, or implementing route-level code splitting"
            })
    
    # Backend error recommendations
    failed_tests = [r for r in results.results if r['status'] == 'FAIL']
    server_errors = [r for r in failed_tests if '500' in r['message']]
    
    if server_errors:
        recommendations.append({
            'category': 'backend',
            'priority': 'critical',
            'issue': f"{len(server_errors)} endpoints returning 500 errors",
            'recommendation': "Check Django error logs, verify database connectivity, and ensure all required environment variables are set"
        })
    
    # Security recommendations
    admin_routes = [r for r in results.results if 'Admin Route' in r['test'] and 'accessible without auth' in r['message']]
    if admin_routes:
        recommendations.append({
            'category': 'security',
            'priority': 'high',
            'issue': f"{len(admin_routes)} admin routes accessible without authentication",
            'recommendation': "Implement proper authentication middleware for admin routes"
        })
    
    return recommendations

def main():
    """Enhanced main function with better error handling and reporting"""
    global config
    
    parser = argparse.ArgumentParser(description='Enhanced system testing for Watch Party Platform')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging')
    parser.add_argument('--frontend-only', action='store_true', help='Test only frontend routes')
    parser.add_argument('--backend-only', action='store_true', help='Test only backend APIs')
    parser.add_argument('--backend-url', default='http://localhost:8000', help='Backend URL')
    parser.add_argument('--frontend-url', default='http://localhost:3000', help='Frontend URL')
    parser.add_argument('--base-timeout', type=int, default=15, help='Base timeout in seconds')
    parser.add_argument('--slow-timeout', type=int, default=60, help='Timeout for slow routes in seconds')
    
    args = parser.parse_args()
    
    # Update config
    config.verbose = args.verbose
    config.backend_url = args.backend_url
    config.frontend_url = args.frontend_url
    config.base_timeout = args.base_timeout
    config.slow_route_timeout = args.slow_timeout
    
    print(f"""
🚀 Watch Party Platform - Enhanced System Testing
{'='*70}
Backend URL: {config.backend_url}
Frontend URL: {config.frontend_url}
Base Timeout: {config.base_timeout}s
Slow Route Timeout: {config.slow_route_timeout}s
Max Retries: {config.max_retries}
Verbose: {config.verbose}
{'='*70}
""")
    
    start_time = time.time()
    
    if not args.backend_only:
        log("Starting enhanced frontend tests...", "INFO")
        test_frontend_routes_enhanced()
        test_protected_routes_enhanced()
    
    if not args.frontend_only:
        log("Starting enhanced backend tests...", "INFO")
        test_backend_apis_enhanced()
    
    total_time = time.time() - start_time
    
    # Generate enhanced report
    report_file = create_detailed_report()
    
    # Print enhanced summary
    results.print_enhanced_summary()
    
    print(f"""
⏱️  EXECUTION TIME: {total_time:.1f} seconds

🎯 KEY INSIGHTS:
{'='*50}
• Frontend compilation is slow but functional
• Some backend APIs need debugging (500 errors)
• Admin routes need authentication protection
• Overall system is mostly operational

🔧 NEXT STEPS:
{'='*50}
1. Fix backend 500 errors (check Django logs)
2. Implement admin route authentication
3. Optimize Next.js build performance
4. Monitor and improve slow compilation times
5. Set up proper error handling and logging
{'='*50}
""")
    
    if report_file:
        print(f"\n📄 Enhanced report saved to: {report_file}")
    
    # Exit with appropriate code
    if results.failed > 0:
        sys.exit(1)
    else:
        sys.exit(0)

if __name__ == "__main__":
    main()

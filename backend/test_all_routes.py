#!/usr/bin/env python3
"""
Script to test all API routes and update the JSON file with results
"""

import json
import requests
import sys
from datetime import datetime

# Configuration
JSON_FILE = "api_routes_test.json"
BASE_URL = "https://be-watch-party.brahim-elhouss.me"

# Test user credentials
TEST_USER = {
    "email": "api.tester@watchparty.test",
    "username": "api_tester",
    "password": "TestPassword123!@#",
    "first_name": "API",
    "last_name": "Tester",
    "confirm_password": "TestPassword123!@#"
}

# ANSI color codes for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

def load_routes():
    """Load routes from JSON file"""
    with open(JSON_FILE, 'r') as f:
        return json.load(f)

def save_routes(data):
    """Save routes to JSON file"""
    with open(JSON_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def test_endpoint(endpoint, token=None):
    """Test a single endpoint"""
    url = BASE_URL + endpoint['path']
    method = endpoint['method']
    headers = {}
    
    if token and endpoint.get('auth_required'):
        headers['Authorization'] = f'Bearer {token}'
    
    try:
        if method == 'GET':
            response = requests.get(url, headers=headers, timeout=10)
        elif method == 'POST':
            body = endpoint.get('body', {})
            headers['Content-Type'] = 'application/json'
            response = requests.post(url, json=body, headers=headers, timeout=10)
        elif method == 'PUT':
            body = endpoint.get('body', {})
            headers['Content-Type'] = 'application/json'
            response = requests.put(url, json=body, headers=headers, timeout=10)
        elif method == 'DELETE':
            response = requests.delete(url, headers=headers, timeout=10)
        else:
            return {
                'tested': True,
                'status': 'ERROR',
                'response': f'Unsupported method: {method}'
            }
        
        # Try to parse JSON response
        try:
            response_data = response.json()
        except:
            response_data = response.text[:200]  # First 200 chars if not JSON
        
        return {
            'tested': True,
            'status': response.status_code,
            'response': response_data
        }
    
    except requests.exceptions.ConnectionError:
        return {
            'tested': True,
            'status': 'CONNECTION_ERROR',
            'response': 'Could not connect to server'
        }
    except requests.exceptions.Timeout:
        return {
            'tested': True,
            'status': 'TIMEOUT',
            'response': 'Request timed out'
        }
    except Exception as e:
        return {
            'tested': True,
            'status': 'ERROR',
            'response': str(e)
        }

def print_result(endpoint, result):
    """Print test result with colors"""
    status = result.get('status')
    name = endpoint['name']
    path = endpoint['path']
    
    # Determine color based on status
    if isinstance(status, int):
        if 200 <= status < 300:
            color = Colors.GREEN
            status_text = f"✓ {status}"
        elif 400 <= status < 500:
            color = Colors.YELLOW
            status_text = f"⚠ {status}"
        else:
            color = Colors.RED
            status_text = f"✗ {status}"
    else:
        color = Colors.RED
        status_text = f"✗ {status}"
    
    print(f"{color}{status_text}{Colors.RESET} {Colors.BOLD}{name}{Colors.RESET}")
    print(f"   {Colors.BLUE}{endpoint['method']}{Colors.RESET} {path}")
    
    # Print response preview
    if isinstance(result.get('response'), dict):
        response_preview = json.dumps(result['response'], indent=2)[:200]
    else:
        response_preview = str(result.get('response', ''))[:200]
    
    if response_preview:
        print(f"   Response: {response_preview}...")
    print()

def register_user():
    """Try to register a test user"""
    print(f"{Colors.BOLD}Attempting to register test user...{Colors.RESET}")
    url = BASE_URL + "/api/auth/register/"
    
    try:
        response = requests.post(url, json=TEST_USER, timeout=10)
        if response.status_code == 201:
            print(f"{Colors.GREEN}✓ User registered successfully{Colors.RESET}\n")
            return True
        elif response.status_code == 400:
            data = response.json()
            if 'email' in data.get('errors', {}) or 'username' in data.get('errors', {}):
                print(f"{Colors.YELLOW}⚠ User already exists{Colors.RESET}\n")
                return True
        print(f"{Colors.RED}✗ Registration failed: {response.status_code}{Colors.RESET}")
        print(f"Response: {response.text[:200]}\n")
        return False
    except Exception as e:
        print(f"{Colors.RED}✗ Registration error: {e}{Colors.RESET}\n")
        return False

def login_user():
    """Login and get authentication token"""
    print(f"{Colors.BOLD}Logging in...{Colors.RESET}")
    url = BASE_URL + "/api/auth/login/"
    
    try:
        response = requests.post(url, json={
            "email": TEST_USER["email"],
            "password": TEST_USER["password"]
        }, timeout=10)
        
        if response.status_code == 200:
            # Check for token in cookies (HTTP-only cookie auth)
            if 'access_token' in response.cookies:
                token = response.cookies['access_token']
                print(f"{Colors.GREEN}✓ Login successful (cookie-based auth){Colors.RESET}")
                print(f"   Token: {token[:50]}...{Colors.RESET}\n")
                return token
            
            # Fallback: Check for token in JSON response body
            data = response.json()
            token = (data.get('data', {}).get('access_token') or 
                    data.get('data', {}).get('token') or
                    data.get('access_token') or 
                    data.get('access') or
                    data.get('token'))
            
            if token:
                print(f"{Colors.GREEN}✓ Login successful (token in response){Colors.RESET}")
                print(f"   Token: {token[:50]}...{Colors.RESET}\n")
                return token
            else:
                print(f"{Colors.YELLOW}⚠ Login succeeded but no token found in cookies or response{Colors.RESET}")
                print(f"Cookies: {list(response.cookies.keys())}")
                print(f"Response: {json.dumps(data, indent=2)[:300]}\n")
                return None
        else:
            print(f"{Colors.RED}✗ Login failed: {response.status_code}{Colors.RESET}")
            print(f"Response: {response.text[:200]}\n")
            return None
    except Exception as e:
        print(f"{Colors.RED}✗ Login error: {e}{Colors.RESET}\n")
        return None

def main():
    """Main test function"""
    print(f"\n{Colors.BOLD}=== Watch Party API Route Testing ==={Colors.RESET}\n")
    print(f"Base URL: {Colors.BLUE}{BASE_URL}{Colors.RESET}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Load routes
    data = load_routes()
    
    # Track statistics
    total_tests = 0
    successful_tests = 0
    failed_tests = 0
    
    # Try to register and login to get auth token
    auth_token = None
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}Authentication Setup{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
    
    if register_user():
        auth_token = login_user()
    
    if not auth_token:
        print(f"{Colors.YELLOW}⚠ Continuing without authentication - protected endpoints will return 401{Colors.RESET}\n")
    
    # First, test public endpoints
    print(f"{Colors.BOLD}Testing Public Endpoints (No Auth Required){Colors.RESET}\n")
    
    for category in data['routes']:
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}Category: {category['category']}{Colors.RESET}")
        print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
        
        for endpoint in category['endpoints']:
            # Skip auth-required endpoints for now
            if endpoint.get('auth_required'):
                continue
            
            total_tests += 1
            result = test_endpoint(endpoint, auth_token)
            
            # Update endpoint with results
            endpoint.update(result)
            
            # Print result
            print_result(endpoint, result)
            
            # Track success/failure
            status = result.get('status')
            if isinstance(status, int) and 200 <= status < 400:
                successful_tests += 1
            else:
                failed_tests += 1
    
    # Print summary for public endpoints
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}Public Endpoints Summary{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"Total Tests: {total_tests}")
    print(f"{Colors.GREEN}Successful: {successful_tests}{Colors.RESET}")
    print(f"{Colors.RED}Failed: {failed_tests}{Colors.RESET}")
    
    # Now test auth-required endpoints
    print(f"\n{Colors.BOLD}Testing Protected Endpoints (Auth Required){Colors.RESET}\n")
    if auth_token:
        print(f"{Colors.GREEN}✓ Using authentication token{Colors.RESET}\n")
    else:
        print(f"{Colors.YELLOW}⚠ No authentication token - these will return 401{Colors.RESET}\n")
    
    auth_tests = 0
    auth_successful = 0
    auth_failed = 0
    
    for category in data['routes']:
        has_auth_endpoints = any(e.get('auth_required') for e in category['endpoints'])
        if not has_auth_endpoints:
            continue
        
        print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
        print(f"{Colors.BOLD}Category: {category['category']}{Colors.RESET}")
        print(f"{Colors.BOLD}{'='*60}{Colors.RESET}\n")
        
        for endpoint in category['endpoints']:
            if not endpoint.get('auth_required'):
                continue
            
            auth_tests += 1
            result = test_endpoint(endpoint, auth_token)
            
            # Update endpoint with results
            endpoint.update(result)
            
            # Print result
            print_result(endpoint, result)
            
            # Track success/failure (401 is expected for auth endpoints)
            status = result.get('status')
            if isinstance(status, int) and (200 <= status < 400 or status == 401):
                auth_successful += 1
            else:
                auth_failed += 1
    
    # Save updated results
    save_routes(data)
    
    # Print final summary
    print(f"\n{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"{Colors.BOLD}FINAL SUMMARY{Colors.RESET}")
    print(f"{Colors.BOLD}{'='*60}{Colors.RESET}")
    print(f"Total Endpoints Tested: {total_tests + auth_tests}")
    print(f"  - Public Endpoints: {total_tests}")
    print(f"    {Colors.GREEN}✓ Successful: {successful_tests}{Colors.RESET}")
    print(f"    {Colors.RED}✗ Failed: {failed_tests}{Colors.RESET}")
    print(f"  - Protected Endpoints: {auth_tests}")
    print(f"    {Colors.GREEN}✓ Successful/Expected: {auth_successful}{Colors.RESET}")
    print(f"    {Colors.RED}✗ Failed: {auth_failed}{Colors.RESET}")
    print(f"\nResults saved to: {Colors.BLUE}{JSON_FILE}{Colors.RESET}\n")

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Testing interrupted by user{Colors.RESET}\n")
        sys.exit(1)
    except Exception as e:
        print(f"\n{Colors.RED}Error: {e}{Colors.RESET}\n")
        sys.exit(1)

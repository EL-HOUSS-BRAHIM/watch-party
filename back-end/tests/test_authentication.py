"""
Authentication Testing Script
Test JWT token authentication end-to-end
"""

import requests
import json
import pytest
from datetime import datetime

# Configuration
BASE_URL = 'http://localhost:8000'
TEST_USER = {
    'username': 'user1',
    'email': 'user1@watchparty.dev',
    'password': 'password123'
}
ADMIN_USER = {
    'username': 'admin',
    'email': 'admin@watchparty.dev', 
    'password': 'admin123'
}

import pytest


@pytest.mark.skip(reason="Integration test requires live server")
def test_user_registration():
    """Test user registration endpoint"""
    print("\n🔐 Testing User Registration...")
    
    # Test user registration
    register_data = {
        'username': f'testuser_{datetime.now().timestamp()}',
        'email': f'test_{datetime.now().timestamp()}@watchparty.dev',
        'password': 'testpassword123',
        'password_confirm': 'testpassword123',
        'first_name': 'Test',
        'last_name': 'User'
    }
    
    try:
        response = requests.post(f'{BASE_URL}/api/auth/register/', json=register_data)
        print(f"Registration Status: {response.status_code}")
        
        # Use assertions instead of return statements
        assert response.status_code in [200, 201], f"Registration failed: {response.text}"
        
        result = response.json()
        print("✅ Registration successful!")
        print(f"User ID: {result.get('user', {}).get('id')}")
        assert 'user' in result
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Registration request failed: {str(e)}")
        pytest.fail(f"Registration request failed: {str(e)}")

@pytest.mark.skip(reason="Integration test requires live server")
def test_user_login():
    """Test user login and JWT token generation"""
    print("\n🔑 Testing User Login...")
    
    login_data = {
        'username': TEST_USER['username'],
        'password': TEST_USER['password']
    }
    
    try:
        response = requests.post(f'{BASE_URL}/api/auth/login/', json=login_data)
        print(f"Login Status: {response.status_code}")
        
        # Use assertions instead of return statements
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        result = response.json()
        print("✅ Login successful!")
        print(f"Access Token: {result.get('access', '')[:50]}...")
        print(f"Refresh Token: {result.get('refresh', '')[:50]}...")
        
        assert 'access' in result or 'access_token' in result
        assert 'refresh' in result or 'refresh_token' in result
        
    except requests.exceptions.RequestException as e:
        print(f"❌ Login request failed: {str(e)}")
        pytest.fail(f"Login request failed: {str(e)}")

def _test_protected_endpoint_integration(access_token):
    """Test accessing protected endpoint with JWT token"""
    print("\n🛡️ Testing Protected Endpoint Access...")
    
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Test user profile endpoint
        response = requests.get(f'{BASE_URL}/api/users/profile/', headers=headers)
        print(f"Profile Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Protected endpoint access successful!")
            print(f"User: {result.get('username')} ({result.get('email')})")
            return True
        else:
            print(f"❌ Protected endpoint access failed: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Protected endpoint request failed: {str(e)}")
        return False

def _test_token_refresh_integration(refresh_token):
    """Test JWT token refresh"""
    print("\n🔄 Testing Token Refresh...")
    
    refresh_data = {
        'refresh': refresh_token
    }
    
    try:
        response = requests.post(f'{BASE_URL}/api/auth/token/refresh/', json=refresh_data)
        print(f"Token Refresh Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Token refresh successful!")
            print(f"New Access Token: {result.get('access', '')[:50]}...")
            return result.get('access')
        else:
            print(f"❌ Token refresh failed: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Token refresh request failed: {str(e)}")
        return None

@pytest.mark.skip(reason="Integration test requires live server")
def test_server_status():
    """Test if Django server is running"""
    print("🏠 Testing Server Status...")
    
    try:
        response = requests.get(f'{BASE_URL}/api/', timeout=5)
        print(f"Server Status: {response.status_code}")
        
        # Use assertions instead of return statement
        # Accept both 200 (healthy) and 404 (OK if no root endpoint)
        assert response.status_code in [200, 404], f"Server responded with status: {response.status_code}"
        
        print("✅ Django server is running!")
        return True
    
    except requests.exceptions.RequestException as e:
        print(f"❌ Server connection failed: {str(e)}")
        print("🔧 Please start the Django server with: python manage.py runserver")
        pytest.fail(f"Server connection failed: {str(e)}")

def run_authentication_tests():
    """Run complete authentication test suite"""
    print("🚀 Starting Authentication Tests")
    print("=" * 50)
    
    # Test server status first
    if not test_server_status():
        print("\n❌ Cannot proceed - Django server is not running")
        return False
    
    # Test user registration
    test_user_registration()
    
    # Test user login
    access_token, refresh_token = test_user_login()
    
    if not access_token:
        print("\n❌ Cannot proceed - Login failed")
        return False
    
    # Test protected endpoint access
    test_protected_endpoint(access_token)
    
    # Test token refresh
    if refresh_token:
        new_access_token = test_token_refresh(refresh_token)
        
        # Test new token works
        if new_access_token:
            test_protected_endpoint(new_access_token)
    
    print("\n" + "=" * 50)
    print("🎉 Authentication tests completed!")
    
    return True

if __name__ == '__main__':
    run_authentication_tests()

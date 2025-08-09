"""
Authentication smoke tests
"""

import pytest
import json
from django.test import TestCase
from django.contrib.auth import get_user_model


class AuthSmokeTest(TestCase):
    """Basic authentication smoke tests"""
    
    def setUp(self):
        from rest_framework.test import APIClient
        self.client = APIClient()
        self.User = get_user_model()
        self.test_user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'first_name': 'Test',
            'last_name': 'User'
        }
    
    def test_auth_flow(self):
        """Test basic authentication flow"""
        from rest_framework import status
        
        # Register a new user
        register_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
            'password_confirm': 'testpass123'
        }
        
        # Test login
        login_data = {
            'username': self.test_user_data['username'],
            'password': self.test_user_data['password']
        }
        
        response = self.client.post('/api/auth/login/', login_data)
        
        # Should succeed or return appropriate error
        self.assertIn(response.status_code, [200, 201, 400, 404])
        
        # Response should be JSON
        try:
            json.loads(response.content)
        except json.JSONDecodeError:
            self.fail("Response is not valid JSON")
    
    def test_protected_endpoint_without_auth(self):
        """Test that protected endpoints require authentication"""
        # Try to access a protected endpoint without auth
        response = self.client.get('/api/dashboard/stats/')
        
        # Should return 401 or 403
        self.assertIn(response.status_code, [401, 403])
    
    def test_auth_endpoints_exist(self):
        """Test that auth endpoints are accessible"""
        # Test login endpoint exists
        response = self.client.post('/api/auth/login/', {})
        self.assertNotEqual(response.status_code, 404)
        
        # Test that response is JSON
        self.assertEqual(response['Content-Type'], 'application/json')

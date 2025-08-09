"""
Health endpoint smoke tests
"""

import pytest
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
import json


class HealthEndpointTest(TestCase):
    """Test the health check endpoint"""
    
    def setUp(self):
        self.client = APIClient()
    
    def test_health_endpoint_returns_200(self):
        """Test that health endpoint returns 200 status"""
        response = self.client.get('/health/')
        self.assertEqual(response.status_code, 200)
    
    def test_health_endpoint_returns_json(self):
        """Test that health endpoint returns valid JSON"""
        response = self.client.get('/health/')
        self.assertEqual(response['Content-Type'], 'application/json')
        
        # Parse JSON to ensure it's valid
        data = json.loads(response.content)
        self.assertIn('status', data)
        self.assertIn('timestamp', data)
        self.assertIn('commit', data)
    
    def test_health_endpoint_has_required_fields(self):
        """Test that health response has all required fields"""
        response = self.client.get('/health/')
        data = json.loads(response.content)
        
        required_fields = ['status', 'timestamp', 'commit', 'build_time', 'services']
        for field in required_fields:
            self.assertIn(field, data, f"Missing required field: {field}")
    
    def test_health_endpoint_services_check(self):
        """Test that health endpoint checks services"""
        response = self.client.get('/health/')
        data = json.loads(response.content)
        
        self.assertIn('services', data)
        self.assertIsInstance(data['services'], dict)
        # Should at least check database and cache
        self.assertIn('database', data['services'])
        self.assertIn('cache', data['services'])

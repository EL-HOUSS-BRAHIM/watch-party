#!/usr/bin/env python
"""
Test script to verify backend error fixes
"""
import pytest
import os
import sys
import django
from django.test import TestCase

# Setup Django
sys.path.append('/home/bross/Desktop/watch-party/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.serializers import UserProfileSerializer
from apps.users.models import Friendship
from apps.authentication.models import UserProfile

User = get_user_model()

class BackendFixesTestCase(TestCase):
    """Test case for backend fixes using proper assertions"""
    
    def setUp(self):
        """Set up test data"""
        self.user, created = User.objects.get_or_create(
            email='test@example.com',
            defaults={
                'first_name': 'Test',
                'last_name': 'User',
                'is_active': True
            }
        )
        
        # Create profile if it doesn't exist
        self.profile, created = UserProfile.objects.get_or_create(
            user=self.user,
            defaults={'bio': 'Test bio'}
        )

def test_user_profile_serializer():
    """Test that UserProfileSerializer no longer references missing fields"""
    
    # Create a test user
    user, created = User.objects.get_or_create(
        email='test@example.com',
        defaults={
            'first_name': 'Test',
            'last_name': 'User',
            'is_active': True
        }
    )
    
    # Create profile if it doesn't exist
    profile, created = UserProfile.objects.get_or_create(
        user=user,
        defaults={'bio': 'Test bio'}
    )
    
    # Test serializer - should not raise exception
    serializer = UserProfileSerializer(user)
    data = serializer.data
    
    # Verify serializer works and has expected fields
    assert isinstance(data, dict)
    assert 'id' in data or 'email' in data  # Should have at least some user fields
    print(f"✅ UserProfileSerializer works! Fields: {list(data.keys())}")

def test_user_friends_property():
    """Test that User.friends property works"""
    
    user = User.objects.filter(email='test@example.com').first()
    if not user:
        # Create user if not exists
        user = User.objects.create(
            email='test@example.com',
            first_name='Test',
            last_name='User',
            is_active=True
        )
    
    # Test friends property - should not raise exception
    friends = user.friends
    assert hasattr(friends, 'count')  # Should be a queryset or manager
    friends_count = friends.count()
    assert isinstance(friends_count, int)  # Should return an integer
    print(f"✅ User.friends property works! Found {friends_count} friends")

def test_jwt_blacklist():
    """Test that JWT blacklist app is available"""
    
    # Test JWT blacklist import - should not raise ImportError
    from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
    
    # Verify the model is accessible
    assert hasattr(OutstandingToken, 'objects')
    print("✅ JWT blacklist app loaded successfully!")


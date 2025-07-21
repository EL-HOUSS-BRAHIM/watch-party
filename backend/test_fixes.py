#!/usr/bin/env python
"""
Test script to verify backend error fixes
"""
import os
import sys
import django

# Setup Django
sys.path.append('/home/bross/Desktop/watch-party/backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from apps.users.serializers import UserProfileSerializer
from apps.users.models import Friendship
from apps.authentication.models import UserProfile

User = get_user_model()

def test_user_profile_serializer():
    """Test that UserProfileSerializer no longer references missing fields"""
    print("Testing UserProfileSerializer...")
    
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
    
    # Test serializer
    try:
        serializer = UserProfileSerializer(user)
        data = serializer.data
        print("✅ UserProfileSerializer works!")
        print(f"   Fields: {list(data.keys())}")
        return True
    except Exception as e:
        print(f"❌ UserProfileSerializer failed: {e}")
        return False

def test_user_friends_property():
    """Test that User.friends property works"""
    print("Testing User.friends property...")
    
    user = User.objects.filter(email='test@example.com').first()
    if not user:
        print("❌ Test user not found")
        return False
    
    try:
        friends = user.friends
        print(f"✅ User.friends property works! Found {friends.count()} friends")
        return True
    except Exception as e:
        print(f"❌ User.friends property failed: {e}")
        return False

def test_jwt_blacklist():
    """Test that JWT blacklist app is available"""
    print("Testing JWT blacklist app...")
    
    try:
        from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
        print("✅ JWT blacklist app loaded successfully!")
        return True
    except ImportError as e:
        print(f"❌ JWT blacklist app failed: {e}")
        return False

def run_tests():
    """Run all tests"""
    print("=" * 50)
    print("Backend Error Fixes Test Suite")
    print("=" * 50)
    
    tests = [
        test_user_profile_serializer,
        test_user_friends_property,
        test_jwt_blacklist,
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        try:
            if test():
                passed += 1
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {e}")
        print()
    
    print("=" * 50)
    print(f"Results: {passed}/{total} tests passed")
    print("=" * 50)
    
    return passed == total

if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)

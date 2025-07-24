#!/usr/bin/env python
"""
Integration test script to create sample data for testing frontend integration
"""
import os
import django
import requests
from django.utils import timezone

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'watchparty.settings.development')
django.setup()

from apps.authentication.models import User
from apps.parties.models import WatchParty
from apps.videos.models import Video
from django.contrib.auth.hashers import make_password

def create_test_data():
    """Create test data for frontend integration testing"""
    
    print("🔧 Creating test data...")
    
    # Create test users
    test_user, created = User.objects.get_or_create(
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
        print(f"✅ Created demo user: {test_user.email}")
    else:
        print(f"ℹ️  Demo user already exists: {test_user.email}")
    
    # Create test video
    test_video, created = Video.objects.get_or_create(
        title='Sample Movie',
        defaults={
            'uploader': test_user,
            'description': 'A sample movie for testing watch parties',
            'duration': timezone.timedelta(hours=2),  # 2 hours
            'file_size': 1073741824,  # 1GB
            'codec': 'h264',
            'resolution': '1920x1080',
            'status': 'ready',
            'visibility': 'public'
        }
    )
    
    if created:
        print(f"✅ Created test video: {test_video.title}")
    else:
        print(f"ℹ️  Test video already exists: {test_video.title}")
    
    # Create test watch party
    test_party, created = WatchParty.objects.get_or_create(
        title='Demo Watch Party',
        defaults={
            'host': test_user,
            'description': 'A demo watch party for testing the frontend integration',
            'video': test_video,
            'status': 'scheduled',
            'visibility': 'public',
            'max_participants': 10,
            'allow_chat': True,
            'allow_reactions': True
        }
    )
    
    if created:
        print(f"✅ Created test party: {test_party.title}")
    else:
        print(f"ℹ️  Test party already exists: {test_party.title}")
    
    print("\n🎉 Test data creation complete!")
    print(f"📧 Demo user: demo@example.com / password: demo123")
    print(f"🎬 Test party: {test_party.title} (ID: {test_party.id})")
    
    return {
        'user': test_user,
        'video': test_video,
        'party': test_party
    }

def test_api_endpoints():
    """Test API endpoints with the demo user"""
    
    print("\n🧪 Testing API endpoints...")
    
    # Login and get token
    login_response = requests.post('http://localhost:8000/api/auth/login/', json={
        'email': 'demo@example.com',
        'password': 'demo123'
    })
    
    if login_response.status_code == 200:
        token_data = login_response.json()
        access_token = token_data['access_token']
        print("✅ Login successful")
        
        # Test parties endpoint
        headers = {'Authorization': f'Bearer {access_token}'}
        parties_response = requests.get('http://localhost:8000/api/parties/', headers=headers)
        
        if parties_response.status_code == 200:
            parties = parties_response.json()
            print(f"✅ Parties endpoint working - found {parties['count']} parties")
        else:
            print(f"❌ Parties endpoint failed: {parties_response.status_code}")
        
        # Test profile endpoint
        profile_response = requests.get('http://localhost:8000/api/auth/profile/', headers=headers)
        
        if profile_response.status_code == 200:
            profile = profile_response.json()
            print(f"✅ Profile endpoint working - user: {profile['first_name']} {profile['last_name']}")
        else:
            print(f"❌ Profile endpoint failed: {profile_response.status_code}")
    
    else:
        print(f"❌ Login failed: {login_response.status_code}")
        print(login_response.text)

if __name__ == '__main__':
    try:
        test_data = create_test_data()
        test_api_endpoints()
        
        print("\n🚀 Integration test complete!")
        print("You can now test the frontend with:")
        print("- Email: demo@example.com")
        print("- Password: demo123")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

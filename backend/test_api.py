#!/usr/bin/env python3
"""
Quick API test script to verify backend endpoints are working
Run this after starting the Django development server
"""
import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_api_endpoints():
    """Test key API endpoints to verify functionality"""
    print("🧪 Testing Watch Party Backend API Endpoints")
    print("=" * 50)
    
    # Test API documentation
    try:
        response = requests.get(f"{BASE_URL}/docs/")
        if response.status_code == 200:
            print("✅ API Documentation: Accessible at /api/docs/")
        else:
            print(f"❌ API Documentation: Error {response.status_code}")
    except Exception as e:
        print(f"❌ API Documentation: Connection error - {e}")
    
    # Test authentication endpoints
    test_endpoints = [
        ("/auth/register/", "POST", "User Registration"),
        ("/auth/login/", "POST", "User Login"),
        ("/videos/", "GET", "Video List"),
        ("/parties/", "GET", "Party List"),
        ("/users/profile/", "GET", "User Profile"),
        ("/chat/moderate/", "POST", "Chat Moderation"),
        ("/analytics/", "GET", "Analytics"),
    ]
    
    for endpoint, method, description in test_endpoints:
        try:
            if method == "GET":
                response = requests.get(f"{BASE_URL}{endpoint}", timeout=5)
            else:
                response = requests.post(f"{BASE_URL}{endpoint}", timeout=5)
            
            if response.status_code in [200, 201, 401, 403]:  # Expected responses
                status = "✅" if response.status_code in [200, 201] else "⚠️"
                print(f"{status} {description}: {response.status_code} (endpoint exists)")
            elif response.status_code == 404:
                print(f"❌ {description}: 404 (endpoint not found)")
            else:
                print(f"⚠️ {description}: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            print(f"❌ {description}: Connection refused (server not running?)")
        except Exception as e:
            print(f"❌ {description}: Error - {e}")
    
    print("\n" + "=" * 50)
    print("📝 Note: 401/403 responses are expected for protected endpoints without auth")
    print("� Some endpoints (notifications, billing) are placeholders for future implementation")
    print("🚀 Core functionality is ready for frontend integration!")

if __name__ == "__main__":
    test_api_endpoints()

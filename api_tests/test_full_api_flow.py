import os
import sys
import json
import requests
from dotenv import load_dotenv

# --- Configuration ---
# Load environment variables from the backend/.env file
# This assumes the API is running locally on port 8000 (e.g., via docker-compose.dev.yml)
load_dotenv(dotenv_path='../backend/.env')
BASE_URL = os.getenv("NEXT_PUBLIC_API_URL", "http://localhost:8000")
API_PREFIX = f"{BASE_URL}/api/v2" # Assuming v2 based on api-client.ts

# Test user credentials
TEST_USER = {
    "email": "testuser@example.com",
    "password": "StrongPassword123",
    "first_name": "Test",
    "last_name": "User",
    "confirm_password": "StrongPassword123"
}

# Global state for tokens and IDs
AUTH_HEADERS = {}
USER_ID = None
PARTY_ID = None
VIDEO_ID = None

# --- Helper Functions ---

def print_status(test_name, success, response=None):
    """Prints the result of an API test."""
    status = "✅ SUCCESS" if success else "❌ FAILED"
    print(f"[{status}] {test_name}")
    if not success and response is not None:
        try:
            print(f"  Status Code: {response.status_code}")
            print(f"  Response: {response.json()}")
        except json.JSONDecodeError:
            print(f"  Status Code: {response.status_code}")
            print(f"  Response Text: {response.text[:200]}...")

def test_endpoint(method, url, data=None, headers=None, expected_status=200):
    """Generic function to make an API request."""
    full_url = f"{API_PREFIX}{url}"
    try:
        if method == 'POST':
            response = requests.post(full_url, json=data, headers=headers)
        elif method == 'GET':
            response = requests.get(full_url, headers=headers)
        elif method == 'PUT':
            response = requests.put(full_url, json=data, headers=headers)
        elif method == 'PATCH':
            response = requests.patch(full_url, json=data, headers=headers)
        elif method == 'DELETE':
            response = requests.delete(full_url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")

        success = response.status_code == expected_status
        return success, response
    except requests.exceptions.RequestException as e:
        print(f"  [NETWORK ERROR] Could not connect to API at {full_url}. Is the backend running? Error: {e}")
        return False, None

# --- Test Cases ---

def test_01_user_registration():
    """Test user registration (CREATE)."""
    global USER_ID
    print("\n--- 1. Testing User Registration (CREATE) ---")
    
    # 1. Attempt to register a new user
    success, response = test_endpoint('POST', '/auth/register/', TEST_USER, expected_status=201)
    print_status("Register New User", success, response)

    if success:
        try:
            USER_ID = response.json()['user']['id']
        except (KeyError, TypeError):
            print("  [WARNING] Could not extract USER_ID from registration response.")
            
    # 2. Attempt to register the same user (should fail with 400)
    success_fail, response_fail = test_endpoint('POST', '/auth/register/', TEST_USER, expected_status=400)
    print_status("Register Duplicate User (Expected Failure)", success_fail, response_fail)

    return success and success_fail

def test_02_user_login_and_profile():
    """Test user login and profile retrieval (READ)."""
    global AUTH_HEADERS
    print("\n--- 2. Testing User Login and Profile (READ) ---")

    # 1. Login the newly created user
    login_data = {"email": TEST_USER['email'], "password": TEST_USER['password']}
    success, response = test_endpoint('POST', '/auth/login/', login_data, expected_status=200)
    print_status("User Login", success, response)

    if success:
        try:
            token = response.json()['access_token']
            AUTH_HEADERS = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        except (KeyError, TypeError):
            print("  [WARNING] Could not extract access_token from login response.")
            success = False
            
    # 2. Get user profile
    success_profile, response_profile = test_endpoint('GET', '/auth/profile/', headers=AUTH_HEADERS, expected_status=200)
    print_status("Get User Profile", success_profile, response_profile)

    return success and success_profile

def test_03_user_profile_update():
    """Test user profile update (UPDATE)."""
    print("\n--- 3. Testing User Profile Update (UPDATE) ---")

    update_data = {"first_name": "UpdatedTest", "last_name": "UpdatedUser"}
    success, response = test_endpoint('PATCH', '/auth/profile/', data=update_data, headers=AUTH_HEADERS, expected_status=200)
    print_status("Update User Profile", success, response)
    
    if success:
        try:
            if response.json()['first_name'] != "UpdatedTest":
                print("  [FAILURE] First name in response does not match update data.")
                success = False
        except (KeyError, TypeError):
            print("  [WARNING] Could not verify updated data in response.")
            
    return success

def test_04_create_watch_party():
    """Test creating a watch party (CREATE)."""
    global PARTY_ID
    print("\n--- 4. Testing Watch Party Creation (CREATE) ---")

    party_data = {
        "title": "Test Watch Party",
        "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        "visibility": "public"
    }
    success, response = test_endpoint('POST', '/parties/', data=party_data, headers=AUTH_HEADERS, expected_status=201)
    print_status("Create Watch Party", success, response)

    if success:
        try:
            PARTY_ID = response.json()['id']
            print(f"  Created Party ID: {PARTY_ID}")
        except (KeyError, TypeError):
            print("  [WARNING] Could not extract PARTY_ID from creation response.")
            success = False
            
    return success

def test_05_read_watch_party():
    """Test reading watch party details and list (READ)."""
    print("\n--- 5. Testing Watch Party Read (READ) ---")

    if not PARTY_ID:
        print("  [SKIP] Skipping detail read: PARTY_ID not available.")
        return False
        
    # 1. Read party detail
    success_detail, response_detail = test_endpoint('GET', f'/parties/{PARTY_ID}/', headers=AUTH_HEADERS, expected_status=200)
    print_status("Read Party Detail", success_detail, response_detail)

    # 2. Read party list
    success_list, response_list = test_endpoint('GET', '/parties/', headers=AUTH_HEADERS, expected_status=200)
    print_status("Read Party List", success_list, response_list)
    
    if success_list:
        try:
            if response_list.json()['count'] < 1:
                print("  [FAILURE] Party list count is less than 1.")
                success_list = False
        except (KeyError, TypeError):
            print("  [WARNING] Could not verify party list count.")
            
    return success_detail and success_list

def test_06_update_watch_party():
    """Test updating a watch party (UPDATE)."""
    print("\n--- 6. Testing Watch Party Update (UPDATE) ---")

    if not PARTY_ID:
        print("  [SKIP] Skipping update: PARTY_ID not available.")
        return False

    update_data = {"title": "Updated Test Watch Party", "visibility": "private"}
    success, response = test_endpoint('PATCH', f'/parties/{PARTY_ID}/', data=update_data, headers=AUTH_HEADERS, expected_status=200)
    print_status("Update Watch Party", success, response)
    
    if success:
        try:
            if response.json()['title'] != "Updated Test Watch Party":
                print("  [FAILURE] Title in response does not match update data.")
                success = False
        except (KeyError, TypeError):
            print("  [WARNING] Could not verify updated data in response.")
            
    return success

def test_07_delete_watch_party():
    """Test deleting a watch party (DELETE)."""
    print("\n--- 7. Testing Watch Party Deletion (DELETE) ---")

    if not PARTY_ID:
        print("  [SKIP] Skipping delete: PARTY_ID not available.")
        return False

    # 1. Delete the party
    success, response = test_endpoint('DELETE', f'/parties/{PARTY_ID}/', headers=AUTH_HEADERS, expected_status=204)
    print_status("Delete Watch Party", success, response)

    # 2. Verify deletion (should return 404)
    success_verify, response_verify = test_endpoint('GET', f'/parties/{PARTY_ID}/', headers=AUTH_HEADERS, expected_status=404)
    print_status("Verify Deletion (Expected 404)", success_verify, response_verify)

    return success and success_verify

def test_08_user_logout():
    """Test user logout (DELETE/Session Management)."""
    print("\n--- 8. Testing User Logout ---")

    success, response = test_endpoint('POST', '/auth/logout/', headers=AUTH_HEADERS, expected_status=200)
    print_status("User Logout", success, response)
    
    # 2. Verify logout by attempting to access profile (should fail with 401)
    success_verify, response_verify = test_endpoint('GET', '/auth/profile/', headers=AUTH_HEADERS, expected_status=401)
    print_status("Verify Logout (Expected 401)", success_verify, response_verify)

    return success and success_verify

def run_tests():
    """Runs all API test cases."""
    print(f"Starting API Tests against: {API_PREFIX}")
    print("-" * 50)

    # Check if the API is reachable first
    try:
        requests.get(BASE_URL, timeout=5)
    except requests.exceptions.RequestException:
        print("\n" * 2)
        print("=" * 60)
        print("!!! CRITICAL FAILURE: API is not reachable !!!")
        print(f"Please ensure the backend is running at: {BASE_URL}")
        print("If using Docker, run: `docker-compose -f docker-compose.dev.yml up -d`")
        print("=" * 60)
        sys.exit(1)

    all_tests = [
        test_01_user_registration,
        test_02_user_login_and_profile,
        test_03_user_profile_update,
        test_04_create_watch_party,
        test_05_read_watch_party,
        test_06_update_watch_party,
        test_07_delete_watch_party,
        test_08_user_logout,
    ]

    results = []
    for test_func in all_tests:
        results.append(test_func())

    print("\n" + "=" * 50)
    print("API Test Summary")
    print("-" * 50)
    
    total_passed = sum(results)
    total_failed = len(results) - total_passed
    
    print(f"Total Tests Run: {len(results)}")
    print(f"Total Passed:    {total_passed}")
    print(f"Total Failed:    {total_failed}")
    
    if total_failed > 0:
        print("\n!!! Some tests failed. Please check the logs above. !!!")
        sys.exit(1)
    else:
        print("\nAll core API tests passed successfully.")
        sys.exit(0)

if __name__ == "__main__":
    run_tests()


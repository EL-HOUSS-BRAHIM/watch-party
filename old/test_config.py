# 🧪 Test Configuration for Watch Party Platform
# This file contains all testing configurations and can be imported by test scripts

import os
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class TestEndpoint:
    """Configuration for individual API endpoints"""
    url: str
    method: str
    description: str
    auth_required: bool = False
    expected_status: List[int] = None
    test_data: Dict = None
    
    def __post_init__(self):
        if self.expected_status is None:
            self.expected_status = [200, 201]
        if self.test_data is None:
            self.test_data = {}

# Server Configuration
DEFAULT_BACKEND_URL = "http://localhost:8000"
DEFAULT_FRONTEND_URL = "http://localhost:3000"
DEFAULT_WEBSOCKET_URL = "ws://localhost:8000/ws"

# Test User Data
TEST_USERS = {
    "demo": {
        "email": "demo@example.com",
        "password": "demo123",
        "first_name": "Demo",
        "last_name": "User"
    },
    "test": {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User"
    },
    "admin": {
        "email": "admin@example.com",
        "password": "AdminPass123!",
        "first_name": "Admin",
        "last_name": "User"
    }
}

# Backend API Endpoints Configuration
BACKEND_ENDPOINTS = {
    "authentication": [
        TestEndpoint("/api/auth/register/", "POST", "User Registration", 
                    expected_status=[200, 201, 400],
                    test_data=TEST_USERS["test"]),
        TestEndpoint("/api/auth/login/", "POST", "User Login",
                    expected_status=[200, 400, 401],
                    test_data={"email": "demo@example.com", "password": "demo123"}),
        TestEndpoint("/api/auth/logout/", "POST", "User Logout", auth_required=True),
        TestEndpoint("/api/auth/refresh/", "POST", "Token Refresh",
                    expected_status=[200, 400, 401]),
        TestEndpoint("/api/auth/forgot-password/", "POST", "Password Reset",
                    expected_status=[200, 400]),
        TestEndpoint("/api/auth/2fa/enable/", "POST", "2FA Enable", auth_required=True),
    ],
    
    "user_management": [
        TestEndpoint("/api/users/profile/", "GET", "User Profile", auth_required=True),
        TestEndpoint("/api/users/profile/update/", "PUT", "Update Profile", auth_required=True),
        TestEndpoint("/api/users/friends/", "GET", "Friends List", auth_required=True),
        TestEndpoint("/api/users/search/", "GET", "User Search", auth_required=True),
        TestEndpoint("/api/users/settings/", "GET", "User Settings", auth_required=True),
    ],
    
    "video_management": [
        TestEndpoint("/api/videos/", "GET", "Video List"),
        TestEndpoint("/api/videos/create/", "POST", "Create Video", auth_required=True),
        TestEndpoint("/api/videos/upload/direct/", "POST", "Direct Upload", auth_required=True,
                    expected_status=[200, 201, 400, 401]),
        TestEndpoint("/api/videos/upload/s3/", "POST", "S3 Upload", auth_required=True,
                    expected_status=[200, 201, 400, 401]),
        TestEndpoint("/api/videos/upload/gdrive/", "POST", "Google Drive Upload", auth_required=True,
                    expected_status=[200, 201, 400, 401]),
    ],
    
    "watch_parties": [
        TestEndpoint("/api/parties/", "GET", "Party List"),
        TestEndpoint("/api/parties/create/", "POST", "Create Party", auth_required=True),
        TestEndpoint("/api/parties/public/", "GET", "Public Parties"),
        TestEndpoint("/api/parties/search/", "GET", "Search Parties"),
    ],
    
    "billing": [
        TestEndpoint("/api/billing/plans/", "GET", "Subscription Plans"),
        TestEndpoint("/api/billing/subscription/", "GET", "Current Subscription", auth_required=True,
                    expected_status=[200, 401, 404]),
        TestEndpoint("/api/billing/payment-methods/", "GET", "Payment Methods", auth_required=True,
                    expected_status=[200, 401]),
        TestEndpoint("/api/billing/history/", "GET", "Billing History", auth_required=True,
                    expected_status=[200, 401]),
    ],
    
    "admin": [
        TestEndpoint("/api/admin/users/", "GET", "Admin User Management", auth_required=True,
                    expected_status=[200, 401, 403]),
        TestEndpoint("/api/admin/analytics/", "GET", "Admin Analytics", auth_required=True,
                    expected_status=[200, 401, 403]),
        TestEndpoint("/api/admin/system/", "GET", "System Status", auth_required=True,
                    expected_status=[200, 401, 403]),
    ]
}

# Frontend Routes Configuration
FRONTEND_ROUTES = {
    "public": [
        ("/", "Landing Page"),
        ("/join", "Signup Page"),
        ("/login", "Login Page"),
        ("/forgot-password", "Password Reset"),
        ("/pricing", "Pricing Plans"),
        ("/about", "About Us"),
        ("/contact", "Contact Form"),
        ("/help", "FAQ & Support"),
        ("/features", "Feature Deep Dive"),
        ("/terms", "Terms of Service"),
        ("/privacy", "Privacy Policy"),
        ("/blog", "Blog/News"),
        ("/mobile", "Mobile Redirect"),
    ],
    
    "protected": [
        ("/dashboard", "Dashboard Home"),
        ("/dashboard/party/create", "Create Party Form"),
        ("/dashboard/parties", "Party Management"),
        ("/dashboard/videos", "Video Library"),
        ("/dashboard/videos/upload", "Upload Interface"),
        ("/dashboard/favorites", "Saved Content"),
        ("/dashboard/friends", "Social Management"),
        ("/dashboard/notifications", "Notification Center"),
        ("/dashboard/settings/profile", "Profile Settings"),
        ("/dashboard/settings/accounts", "Connected Accounts"),
        ("/dashboard/settings/security", "Security Settings"),
        ("/dashboard/billing", "Billing Management"),
        ("/dashboard/invite", "Referral Center"),
        ("/dashboard/support", "User Support"),
    ],
    
    "admin": [
        ("/admin", "Admin Dashboard"),
        ("/admin/users", "User Management"),
        ("/admin/videos", "Content Moderation"),
        ("/admin/parties", "Party Monitoring"),
        ("/admin/system", "System Controls"),
        ("/admin/plans", "Subscription Management"),
        ("/admin/coupons", "Promotion Management"),
        ("/admin/analytics", "Analytics Dashboard"),
        ("/admin/logs", "System Logs"),
        ("/admin/reports", "Report Center"),
        ("/admin/settings", "System Settings"),
    ]
}

# WebSocket Test Configuration
WEBSOCKET_TESTS = [
    {
        "endpoint": "/ws/party/test/",
        "description": "Party Room WebSocket",
        "test_messages": [
            {"type": "join_room", "room_id": "test-room"},
            {"type": "chat_message", "message": "Hello World"},
            {"type": "video_sync", "action": "play", "timestamp": 120}
        ]
    },
    {
        "endpoint": "/ws/notifications/",
        "description": "Notifications WebSocket",
        "test_messages": [
            {"type": "subscribe", "user_id": "test-user"}
        ]
    }
]

# Performance Test Configuration
PERFORMANCE_THRESHOLDS = {
    "frontend_load_time": 3.0,  # seconds
    "backend_response_time": 1.0,  # seconds
    "api_response_time": 0.5,  # seconds
    "websocket_connection_time": 2.0,  # seconds
}

# Test Data Templates
TEST_DATA_TEMPLATES = {
    "video_upload": {
        "title": "Test Video Upload",
        "description": "Test video for automated testing",
        "file_name": "test_video.mp4",
        "file_size": 1024000,  # 1MB
        "content_type": "video/mp4"
    },
    "party_creation": {
        "title": "Test Watch Party",
        "description": "Automated test party",
        "max_participants": 10,
        "allow_chat": True,
        "visibility": "private"
    },
    "user_registration": {
        "first_name": "Test",
        "last_name": "User",
        "email": "automated_test@example.com",
        "password": "TestPassword123!"
    }
}

# Environment Variable Checks
REQUIRED_ENV_VARS = {
    "backend": [
        "SECRET_KEY",
        "DATABASE_URL",
        "REDIS_URL",
        "STRIPE_SECRET_KEY",
        "EMAIL_HOST_USER",
    ],
    "frontend": [
        "NEXT_PUBLIC_API_URL",
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
        "NEXT_PUBLIC_WEBSOCKET_URL",
    ]
}

# Expected HTTP Status Codes
HTTP_STATUS_MEANINGS = {
    200: "OK - Request successful",
    201: "Created - Resource created successfully",
    400: "Bad Request - Invalid request data",
    401: "Unauthorized - Authentication required",
    403: "Forbidden - Access denied",
    404: "Not Found - Resource not found",
    405: "Method Not Allowed - HTTP method not allowed",
    500: "Internal Server Error - Server error"
}

# Test Categories and Priorities
TEST_CATEGORIES = {
    "critical": [
        "User Registration",
        "User Login",
        "Frontend Server",
        "Backend Server"
    ],
    "important": [
        "Protected Routes",
        "API Authentication",
        "Video Upload",
        "Party Creation"
    ],
    "optional": [
        "WebSocket Connection",
        "Performance Tests",
        "Admin Routes",
        "Documentation"
    ]
}

# Database Test Data
DATABASE_TEST_QUERIES = [
    {
        "description": "User Count",
        "query": "SELECT COUNT(*) FROM auth_user;",
        "expected_min": 1
    },
    {
        "description": "Video Count",
        "query": "SELECT COUNT(*) FROM videos_video;",
        "expected_min": 0
    },
    {
        "description": "Party Count",
        "query": "SELECT COUNT(*) FROM parties_watchparty;",
        "expected_min": 0
    }
]

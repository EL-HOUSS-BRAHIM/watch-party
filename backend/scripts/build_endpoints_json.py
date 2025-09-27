import json
from copy import deepcopy


def op(method, auth_required, request=None, response=None, notes=None, query=None, path_params=None):
    data = {
        "method": method,
        "auth_required": auth_required,
        "request_example": request,
        "response_example": response
    }
    if notes:
        data["notes"] = notes
    if query:
        data["query_parameters"] = query
    if path_params:
        data["path_parameters"] = path_params
    return data

metadata = {
    "title": "Watch Party Backend API",
    "base_url": "/api/",
    "authentication": {
        "type": "JWT",
        "header": "Authorization: Bearer <access_token>",
        "refresh_endpoint": "/api/auth/refresh/"
    },
    "pagination": {
        "style": "cursor",
        "parameters": ["page", "page_size", "cursor"],
        "response_structure": {
            "results": "Array of resources",
            "pagination": {
                "next": "Cursor for the next page",
                "previous": "Cursor for the previous page",
                "total": "Total count of items",
                "page_size": "Number of items per page"
            }
        }
    },
    "rate_limiting": {
        "authentication_endpoints": "Limited per IP",
        "general_endpoints": "Limited per user",
        "upload_endpoints": "Separate limits for uploads",
        "headers": [
            "X-RateLimit-Limit",
            "X-RateLimit-Remaining",
            "X-RateLimit-Reset"
        ]
    },
    "error_response_format": {
        "success": False,
        "error": "error_code",
        "message": "Human readable error message",
        "details": {
            "field_name": ["Field specific error messages"]
        },
        "timestamp": "2025-08-10T12:00:00Z"
    },
    "websocket_endpoints": [
        "/ws/party/<party_id>/",
        "/ws/chat/<room_id>/",
        "/ws/notifications/"
    ]
}

categories = []

# Base category
categories.append({
    "name": "Base",
    "description": "Service readiness checks and documentation entry points.",
    "endpoints": [
        {
            "name": "API Root",
            "path": "/api/",
            "operations": [
                op(
                    "GET",
                    False,
                    response={
                        "message": "Watch Party API",
                        "version": "1.0",
                        "endpoints": {
                            "authentication": "/api/auth/",
                            "users": "/api/users/",
                            "videos": "/api/videos/",
                            "parties": "/api/parties/",
                            "chat": "/api/chat/",
                            "billing": "/api/billing/",
                            "analytics": "/api/analytics/",
                            "notifications": "/api/notifications/",
                            "integrations": "/api/integrations/",
                            "interactive": "/api/interactive/",
                            "moderation": "/api/moderation/",
                            "store": "/api/store/",
                            "search": "/api/search/",
                            "social": "/api/social/",
                            "messaging": "/api/messaging/",
                            "support": "/api/support/",
                            "mobile": "/api/mobile/",
                            "admin": "/api/admin/",
                            "documentation": "/api/docs/",
                            "schema": "/api/schema/"
                        }
                    }
                )
            ]
        },
        {
            "name": "Server Test",
            "path": "/api/test/",
            "operations": [
                op(
                    "GET",
                    False,
                    response={
                        "message": "Server is working!",
                        "authenticated": True,
                        "user_id": 123,
                        "timestamp": "2025-08-10T12:00:00Z"
                    }
                )
            ]
        },
        {
            "name": "Dashboard Stats",
            "path": "/api/dashboard/stats/",
            "operations": [
                op(
                    "GET",
                    True,
                    response={
                        "user": {
                            "id": 123,
                            "name": "John Doe",
                            "email": "john@example.com"
                        },
                        "stats": {
                            "total_parties": 15,
                            "recent_parties": 3,
                            "total_videos": 8,
                            "recent_videos": 1,
                            "watch_time_minutes": 0
                        },
                        "timestamp": "2025-08-10T12:00:00Z"
                    }
                )
            ]
        },
        {
            "name": "Dashboard Activities",
            "path": "/api/dashboard/activities/",
            "operations": [
                op(
                    "GET",
                    True,
                    response={
                        "activities": [
                            {
                                "id": 456,
                                "type": "party_created",
                                "timestamp": "2025-08-10T12:00:00Z",
                                "data": {},
                                "party": {
                                    "id": 789,
                                    "title": "Movie Night"
                                },
                                "video": {
                                    "id": 101,
                                    "title": "Sample Movie"
                                }
                            }
                        ],
                        "total": 20
                    }
                )
            ]
        },
        {
            "name": "Schema",
            "path": "/api/schema/",
            "operations": [op("GET", False, response="OpenAPI schema document")]
        },
        {
            "name": "Swagger UI",
            "path": "/api/docs/",
            "operations": [op("GET", False, response="Swagger UI HTML")]
        },
        {
            "name": "ReDoc UI",
            "path": "/api/redoc/",
            "operations": [op("GET", False, response="ReDoc HTML")]
        }
    ]
})

# Authentication category
auth_endpoints = []

auth_endpoints.append({
    "name": "Register",
    "path": "/api/auth/register/",
    "operations": [
        op(
            "POST",
            False,
            request={
                "email": "user@example.com",
                "password": "securepassword",
                "confirm_password": "securepassword",
                "first_name": "John",
                "last_name": "Doe",
                "promo_code": "WELCOME2024"
            },
            response={
                "success": True,
                "message": "Registration successful. Please verify your email.",
                "user": {
                    "id": 123,
                    "email": "user@example.com",
                    "first_name": "John",
                    "last_name": "Doe"
                },
                "access_token": "jwt_access_token",
                "refresh_token": "jwt_refresh_token",
                "verification_sent": True
            },
            notes="promo_code optional"
        )
    ]
})

auth_endpoints.append({
    "name": "Login",
    "path": "/api/auth/login/",
    "operations": [
        op(
            "POST",
            False,
            request={
                "email": "user@example.com",
                "password": "securepassword"
            },
            response={
                "success": True,
                "access_token": "jwt_access_token",
                "refresh_token": "jwt_refresh_token",
                "user": {
                    "id": 123,
                    "email": "user@example.com",
                    "first_name": "John",
                    "last_name": "Doe"
                }
            }
        )
    ]
})

auth_endpoints.append({
    "name": "Logout",
    "path": "/api/auth/logout/",
    "operations": [
        op(
            "POST",
            True,
            request={"refresh_token": "jwt_refresh_token"},
            response={
                "success": True,
                "message": "Successfully logged out."
            }
        )
    ]
})

auth_endpoints.append({
    "name": "Token Refresh",
    "path": "/api/auth/refresh/",
    "operations": [
        op(
            "POST",
            False,
            request={"refresh": "jwt_refresh_token"},
            response={"access": "new_jwt_access_token"}
        )
    ]
})

auth_endpoints.append({
    "name": "Social Auth Redirect",
    "path": "/api/auth/social/<provider>/",
    "operations": [
        op(
            "GET",
            False,
            response="Social auth redirect URL",
            notes="provider is google or github",
            path_params=["provider"]
        )
    ]
})

auth_endpoints.append({
    "name": "Google Social Login",
    "path": "/api/auth/social/google/",
    "operations": [
        op(
            "POST",
            False,
            request={"access_token": "google_access_token"},
            response="User data and tokens"
        )
    ]
})

auth_endpoints.append({
    "name": "GitHub Social Login",
    "path": "/api/auth/social/github/",
    "operations": [
        op(
            "POST",
            False,
            request={"code": "github_auth_code"},
            response="User data and tokens"
        )
    ]
})

auth_endpoints.append({
    "name": "Forgot Password",
    "path": "/api/auth/forgot-password/",
    "operations": [
        op(
            "POST",
            False,
            request={"email": "user@example.com"},
            response={
                "success": True,
                "message": "Password reset email sent."
            }
        )
    ]
})

auth_endpoints.append({
    "name": "Reset Password",
    "path": "/api/auth/reset-password/",
    "operations": [
        op(
            "POST",
            False,
            request={
                "token": "reset_token",
                "new_password": "newpassword",
                "confirm_password": "newpassword"
            },
            response={
                "success": True,
                "message": "Password reset successful."
            }
        )
    ]
})

auth_endpoints.append({
    "name": "Change Password",
    "path": "/api/auth/change-password/",
    "operations": [
        op(
            "POST",
            True,
            request={
                "current_password": "oldpassword",
                "new_password": "newpassword",
                "confirm_password": "newpassword"
            },
            response={
                "success": True,
                "message": "Password changed successfully."
            }
        )
    ]
})

auth_endpoints.append({
    "name": "Verify Email",
    "path": "/api/auth/verify-email/",
    "operations": [
        op(
            "POST",
            False,
            request={"token": "verification_token"},
            response={
                "success": True,
                "message": "Email verified successfully."
            }
        )
    ]
})

auth_endpoints.append({
    "name": "Resend Verification",
    "path": "/api/auth/resend-verification/",
    "operations": [
        op(
            "POST",
            False,
            request={"email": "user@example.com"},
            response={
                "success": True,
                "message": "Verification email sent."
            }
        )
    ]
})

auth_endpoints.append({
    "name": "Auth Profile",
    "path": "/api/auth/profile/",
    "operations": [
        op("GET", True, response="Authenticated user profile"),
        op(
            "PUT",
            True,
            request={
                "first_name": "John",
                "last_name": "Doe",
                "bio": "User bio"
            },
            response="Updated profile"
        ),
        op(
            "PATCH",
            True,
            request={"bio": "User bio"},
            response="Updated profile"
        )
    ]
})

auth_endpoints.append({
    "name": "Google Drive Auth",
    "path": "/api/auth/google-drive/auth/",
    "operations": [
        op("GET", True, response="Google Drive authorization URL"),
        op("POST", True, request={"code": "google_auth_code"}, response="Google Drive integration status")
    ]
})

auth_endpoints.append({
    "name": "Google Drive Disconnect",
    "path": "/api/auth/google-drive/disconnect/",
    "operations": [
        op("DELETE", True, response="Google Drive disconnected")
    ]
})

auth_endpoints.append({
    "name": "Google Drive Status",
    "path": "/api/auth/google-drive/status/",
    "operations": [
        op("GET", True, response={"connected": True, "email": "user@gmail.com"})
    ]
})

auth_endpoints.append({
    "name": "2FA Setup",
    "path": "/api/auth/2fa/setup/",
    "operations": [
        op("POST", True, response={"qr_code": "base64_qr_code", "secret": "2fa_secret"})
    ]
})

auth_endpoints.append({
    "name": "2FA Verify",
    "path": "/api/auth/2fa/verify/",
    "operations": [
        op(
            "POST",
            True,
            request={"token": "123456"},
            response={"success": True, "backup_codes": ["code1", "code2"]}
        )
    ]
})

auth_endpoints.append({
    "name": "2FA Disable",
    "path": "/api/auth/2fa/disable/",
    "operations": [
        op("DELETE", True, request={"password": "userpassword"}, response="2FA disabled")
    ]
})

auth_endpoints.append({
    "name": "Sessions",
    "path": "/api/auth/sessions/",
    "operations": [
        op("GET", True, response="Active sessions list")
    ]
})

auth_endpoints.append({
    "name": "Session Detail",
    "path": "/api/auth/sessions/<session_id>/",
    "operations": [
        op("DELETE", True, response="Session revoked", path_params=["session_id"])
    ]
})

categories.append({
    "name": "Authentication",
    "description": "Account registration, login, verification, and security endpoints.",
    "endpoints": auth_endpoints
})

# Users category
users_endpoints = []

# Complex endpoints first
users_endpoints.extend([
    {
        "name": "Profile",
        "path": "/api/users/profile/",
        "operations": [
            op("GET", True, response="Current user profile"),
            op(
                "PUT",
                True,
                request={
                    "first_name": "John",
                    "last_name": "Doe",
                    "bio": "Updated bio",
                    "display_name": "JohnD"
                },
                response="Updated profile"
            ),
            op(
                "PATCH",
                True,
                request={"bio": "Updated bio"},
                response="Updated profile"
            )
        ]
    },
    {
        "name": "Profile Update",
        "path": "/api/users/profile/update/",
        "operations": [
            op(
                "PUT",
                True,
                request={
                    "first_name": "John",
                    "last_name": "Doe",
                    "bio": "Updated bio",
                    "display_name": "JohnD"
                },
                response="Updated profile"
            ),
            op(
                "PATCH",
                True,
                request={"bio": "Updated bio"},
                response="Updated profile"
            )
        ]
    },
    {
        "name": "Avatar Upload",
        "path": "/api/users/avatar/upload/",
        "operations": [
            op(
                "POST",
                True,
                request={"avatar": "<file>"},
                response={
                    "success": True,
                    "avatar_url": "https://example.com/avatars/user123.jpg"
                },
                notes="Multipart form data"
            )
        ]
    },
    {
        "name": "Change Password",
        "path": "/api/users/password/",
        "operations": [
            op(
                "PUT",
                True,
                request={
                    "current_password": "oldpassword",
                    "new_password": "newpassword"
                },
                response="Password change confirmation"
            )
        ]
    },
    {
        "name": "Onboarding",
        "path": "/api/users/onboarding/",
        "operations": [
            op("GET", True, response="Onboarding status"),
            op("POST", True, response="Onboarding updated")
        ]
    },
    {
        "name": "Friend Request by Username",
        "path": "/api/users/friends/request/",
        "operations": [
            op(
                "POST",
                True,
                request={"username": "target_user"},
                response="Friend request sent"
            )
        ]
    },
    {
        "name": "Block User",
        "path": "/api/users/block/",
        "operations": [
            op(
                "POST",
                True,
                request={"user_id": "uuid"},
                response="User blocked"
            )
        ]
    },
    {
        "name": "Unblock User",
        "path": "/api/users/unblock/",
        "operations": [
            op(
                "POST",
                True,
                request={"user_id": "uuid"},
                response="User unblocked"
            )
        ]
    },
    {
        "name": "Add Favorite",
        "path": "/api/users/favorites/add/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "content_type": "video",
                    "content_id": "uuid"
                },
                response="Favorite added"
            )
        ]
    },
    {
        "name": "Remove Favorite",
        "path": "/api/users/favorites/<favorite_id>/remove/",
        "operations": [
            op("DELETE", True, response="Favorite removed", path_params=["favorite_id"])
        ]
    },
    {
        "name": "User Report",
        "path": "/api/users/report/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "reported_user_id": "uuid",
                    "reason": "spam",
                    "description": "Report details"
                },
                response="Report submitted"
            )
        ]
    },
    {
        "name": "Delete Account",
        "path": "/api/users/delete-account/",
        "operations": [
            op(
                "DELETE",
                True,
                request={
                    "password": "userpassword",
                    "confirmation": "DELETE"
                },
                response="Account deletion confirmed"
            )
        ]
    }
])

# Simple GET endpoints with descriptions
simple_get = [
    ("User Dashboard Stats", "/api/users/dashboard/stats/", "User dashboard statistics"),
    ("Achievements", "/api/users/achievements/", "User achievements list"),
    ("User Stats", "/api/users/stats/", {
        "total_parties": 15,
        "total_watch_time": 1200,
        "videos_uploaded": 5,
        "friends_count": 23
    }),
    ("Sessions", "/api/users/sessions/", "Active sessions"),
    ("Inventory", "/api/users/inventory/", "User inventory"),
    ("Friends", "/api/users/friends/", "Friends list"),
    ("User Activity", "/api/users/activity/", "User activity feed"),
    ("Suggestions", "/api/users/suggestions/", "Suggested users"),
    ("Notification Settings", "/api/users/notifications/settings/", "Notification settings"),
    ("Privacy Settings", "/api/users/privacy/settings/", "Privacy settings"),
    ("Settings", "/api/users/settings/", "User settings"),
    ("Export Data", "/api/users/export-data/", "Export initiated"),
    ("Mutual Friends", "/api/users/<user_id>/mutual-friends/", "Mutual friends", ["user_id"]),
    ("Online Status", "/api/users/online-status/", "Friends online status"),
    ("Legacy Activity", "/api/users/legacy/activity/", "Legacy activity feed"),
    ("Watch History", "/api/users/watch-history/", "Watch history"),
    ("Favorites", "/api/users/favorites/", "Favorites list"),
    ("Notifications", "/api/users/notifications/", "User notifications"),
    ("Mutual Profile", "/api/users/<user_id>/profile/", "Public user profile", ["user_id"]),
    ("Legacy Public Profile", "/api/users/<user_id>/public-profile/", "Legacy public profile", ["user_id"])
]

for entry in simple_get:
    if len(entry) == 4:
        title, path, response, params = entry
        users_endpoints.append({
            "name": title,
            "path": path,
            "operations": [op("GET", True, response=response, path_params=params)]
        })
    else:
        title, path, response = entry
        users_endpoints.append({
            "name": title,
            "path": path,
            "operations": [op("GET", True, response=response)]
        })

# Search endpoints with query params
users_endpoints.append({
    "name": "Search Users",
    "path": "/api/users/search/",
    "operations": [op("GET", True, response="Search results", query=["q"])]
})

# Session management endpoints
actions_with_params = [
    ("Session Detail", "/api/users/sessions/<session_id>/", "DELETE", "Session revoked", ["session_id"]),
    ("Accept Friend Request", "/api/users/friends/<request_id>/accept/", "POST", "Friend request accepted", ["request_id"]),
    ("Decline Friend Request", "/api/users/friends/<request_id>/decline/", "POST", "Friend request declined", ["request_id"]),
    ("Send Friend Request", "/api/users/<user_id>/friend-request/", "POST", "Friend request sent", ["user_id"]),
    ("Block User (legacy)", "/api/users/<user_id>/block/", "POST", "User blocked", ["user_id"]),
    ("Friendship Accept", "/api/users/friends/<friendship_id>/accept/", "POST", "Friendship accepted", ["friendship_id"]),
    ("Friendship Decline", "/api/users/friends/<friendship_id>/decline/", "POST", "Friendship declined", ["friendship_id"]),
    ("Remove Friend", "/api/users/friends/<username>/remove/", "DELETE", "Friend removed", ["username"]),
    ("Notification Read", "/api/users/notifications/<notification_id>/read/", "POST", "Notification marked read", ["notification_id"])
]

for title, path, method, response, params in actions_with_params:
    users_endpoints.append({
        "name": title,
        "path": path,
        "operations": [op(method, True, response=response, path_params=params)]
    })

users_endpoints.append({
    "name": "Revoke All Sessions",
    "path": "/api/users/sessions/revoke-all/",
    "operations": [op("DELETE", True, response="All sessions revoked")]
})

users_endpoints.append({
    "name": "Mark All Notifications Read",
    "path": "/api/users/notifications/mark-all-read/",
    "operations": [op("POST", True, response="All notifications marked read")]
})

# Legacy endpoints
legacy_paths = [
    "/api/users/friends/legacy/",
    "/api/users/friends/legacy/requests/",
    "/api/users/friends/legacy/send/",
    "/api/users/friends/legacy/<request_id>/accept/",
    "/api/users/friends/legacy/<request_id>/decline/",
    "/api/users/friends/legacy/<friend_id>/remove/",
    "/api/users/users/<user_id>/block/",
    "/api/users/users/<user_id>/unblock/",
    "/api/users/legacy/search/"
]

for path in legacy_paths:
    params = []
    if "<" in path:
        params.append(path.split("<")[1].split(">")[0])
    users_endpoints.append({
        "name": "Legacy Endpoint",
        "path": path,
        "operations": [op("GET", True, response="Legacy response", path_params=params or None)]
    })

categories.append({
    "name": "Users",
    "description": "User profiles, relationships, and account utilities.",
    "endpoints": users_endpoints
})

# Videos category
videos_endpoints = []

videos_endpoints.append({
    "name": "Videos Collection",
    "path": "/api/videos/",
    "operations": [
        op(
            "GET",
            False,
            response="Paginated list of videos",
            query=["page", "page_size", "search", "category", "uploaded_by"]
        ),
        op(
            "POST",
            True,
            request={
                "title": "Video Title",
                "description": "Video description",
                "video_file": "<file>",
                "thumbnail": "<file>",
                "category": "movies",
                "is_public": True,
                "tags": ["tag1", "tag2"]
            },
            response="Video created",
            notes="Multipart upload supported"
        )
    ]
})

videos_endpoints.append({
    "name": "Video Detail",
    "path": "/api/videos/<video_id>/",
    "operations": [
        op("GET", False, response="Video detail", path_params=["video_id"]),
        op(
            "PUT",
            True,
            request={
                "title": "Updated Title",
                "description": "Updated description",
                "is_public": False
            },
            response="Video updated",
            path_params=["video_id"]
        ),
        op(
            "PATCH",
            True,
            request={"description": "Updated description"},
            response="Video updated",
            path_params=["video_id"]
        ),
        op("DELETE", True, response="Video deleted", path_params=["video_id"])
    ]
})

# Simple video operations with path params
for title, suffix, method, response in [
    ("Video Like", "like/", "POST", "Video liked"),
    ("Video Comments", "comments/", "GET", "Video comments"),
    ("Video Comment Create", "comments/", "POST", "Comment created"),
    ("Video Stream", "stream/", "GET", {
        "streaming_url": "https://cdn.example.com/videos/video.m3u8",
        "quality_variants": ["720p", "1080p"],
        "duration": 3600
    }),
    ("Video Download", "download/", "GET", "Video download stream"),
    ("Video Thumbnail", "thumbnail/", "GET", "Thumbnail image"),
    ("Video Analytics", "analytics/", "GET", {
        "total_views": 1500,
        "unique_viewers": 1200,
        "watch_time": 45000,
        "engagement_rate": 0.85
    }),
    ("Processing Status", "processing-status/", "GET", {
        "status": "completed",
        "processing_steps": {
            "transcoding": "completed",
            "thumbnail_generation": "completed",
            "quality_variants": "completed"
        }
    }),
    ("Quality Variants", "quality-variants/", "GET", {
        "variants": [
            {"quality": "720p", "url": "https://cdn.example.com/720p.m3u8", "bitrate": 2500},
            {"quality": "1080p", "url": "https://cdn.example.com/1080p.m3u8", "bitrate": 5000}
        ]
    }),
    ("Regenerate Thumbnail", "regenerate-thumbnail/", "POST", "Thumbnail regeneration requested"),
    ("Share Video", "share/", "POST", "Share details"),
    ("Detailed Analytics", "analytics/detailed/", "GET", "Detailed analytics"),
    ("Analytics Heatmap", "analytics/heatmap/", "GET", "Engagement heatmap"),
    ("Analytics Retention", "analytics/retention/", "GET", "Retention data"),
    ("Analytics Journey", "analytics/journey/", "GET", "Viewer journey"),
    ("Analytics Comparative", "analytics/comparative/", "GET", "Comparative analytics"),
    ("Video Proxy", "proxy/", "GET", "Proxied video stream")
]:
    operation = op(method, True if method != "GET" or title not in ["Video Stream", "Video Thumbnail", "Quality Variants"] else False, response=response, path_params=["video_id"])
    if title == "Video Comments" or title == "Video Comment Create":
        auth = True if title == "Video Comment Create" else True
        query = ["page", "before", "after"] if title == "Video Comments" else None
        request = {"message": "Comment", "message_type": "text"} if title == "Video Comment Create" else None
        videos_endpoints.append({
            "name": title,
            "path": f"/api/videos/<video_id>/{suffix}",
            "operations": [op(
                method,
                auth,
                request=request,
                response=response,
                path_params=["video_id"],
                query=query
            )]
        })
    elif title == "Regenerate Thumbnail":
        videos_endpoints.append({
            "name": title,
            "path": f"/api/videos/<video_id>/{suffix}",
            "operations": [op("POST", True, request={"timestamp": 30.5}, response=response, path_params=["video_id"])]
        })
    elif title == "Share Video":
        videos_endpoints.append({
            "name": title,
            "path": f"/api/videos/<video_id>/{suffix}",
            "operations": [op("POST", True, request={"platform": "twitter", "message": "Check out this video!"}, response=response, path_params=["video_id"])]
        })
    else:
        videos_endpoints.append({
            "name": title,
            "path": f"/api/videos/<video_id>/{suffix}",
            "operations": [operation]
        })

# Upload endpoints
videos_endpoints.extend([
    {
        "name": "Video Upload",
        "path": "/api/videos/upload/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "video_file": "<file>",
                    "title": "Video Title",
                    "description": "Video description",
                    "thumbnail": "<file optional>"
                },
                response={
                    "upload_id": "uuid",
                    "video_id": "uuid",
                    "status": "uploading"
                },
                notes="Multipart form data"
            )
        ]
    },
    {
        "name": "S3 Upload",
        "path": "/api/videos/upload/s3/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "filename": "video.mp4",
                    "file_size": 1024000,
                    "content_type": "video/mp4"
                },
                response={
                    "upload_url": "https://s3.amazonaws.com/presigned-url",
                    "upload_id": "uuid"
                }
            )
        ]
    },
    {
        "name": "Complete Upload",
        "path": "/api/videos/upload/<upload_id>/complete/",
        "operations": [
            op(
                "POST",
                True,
                request={"title": "Video Title", "description": "Description"},
                response="Video creation confirmation",
                path_params=["upload_id"]
            )
        ]
    },
    {
        "name": "Upload Status",
        "path": "/api/videos/upload/<upload_id>/status/",
        "operations": [
            op(
                "GET",
                True,
                response={
                    "status": "processing",
                    "progress": 75,
                    "estimated_completion": "2025-08-10T13:00:00Z"
                },
                path_params=["upload_id"]
            )
        ]
    }
])

videos_endpoints.extend([
    {
        "name": "Channel Analytics",
        "path": "/api/videos/analytics/channel/",
        "operations": [op("GET", True, response="Channel analytics")]
    },
    {
        "name": "Trending Analytics",
        "path": "/api/videos/analytics/trending/",
        "operations": [op("GET", False, response="Trending videos")]
    },
    {
        "name": "Validate URL",
        "path": "/api/videos/validate-url/",
        "operations": [
            op(
                "POST",
                True,
                request={"url": "https://example.com/video.mp4"},
                response={
                    "valid": True,
                    "content_type": "video/mp4",
                    "file_size": 1024000,
                    "duration": 3600
                }
            )
        ]
    },
    {
        "name": "Video Search",
        "path": "/api/videos/search/",
        "operations": [op("GET", False, response="Search results", query=["q", "category", "duration_min", "duration_max", "sort_by"])]
    },
    {
        "name": "Advanced Video Search",
        "path": "/api/videos/search/advanced/",
        "operations": [op("GET", False, response="Advanced search results", notes="Supports extended filters")]
    }
])

# Google Drive integration
videos_endpoints.extend([
    {
        "name": "Google Drive Videos",
        "path": "/api/videos/gdrive/",
        "operations": [op("GET", True, response="Google Drive movies list")]
    },
    {
        "name": "Google Drive Upload",
        "path": "/api/videos/gdrive/upload/",
        "operations": [
            op(
                "POST",
                True,
                request={"file_id": "google_drive_file_id", "title": "Movie Title"},
                response="Upload initiated"
            )
        ]
    },
    {
        "name": "Google Drive Delete",
        "path": "/api/videos/gdrive/<video_id>/delete/",
        "operations": [op("DELETE", True, response="Google Drive video deleted", path_params=["video_id"])]
    },
    {
        "name": "Google Drive Stream",
        "path": "/api/videos/gdrive/<video_id>/stream/",
        "operations": [op("GET", True, response="Google Drive streaming URL", path_params=["video_id"])]
    }
])

categories.append({
    "name": "Videos",
    "description": "Video uploads, playback, analytics, and integrations.",
    "endpoints": videos_endpoints
})

# Parties category
parties_endpoints = []

simple_party_gets = [
    ("Recent Parties", "/api/parties/recent/", True, "Recent parties"),
    ("Public Parties", "/api/parties/public/", False, "Public parties", ["page", "search", "category"]),
    ("Trending Parties", "/api/parties/trending/", False, "Trending parties"),
    ("Party Recommendations", "/api/parties/recommendations/", True, "Recommended parties"),
    ("Party Search", "/api/parties/search/", False, "Party search results", ["q", "is_public", "category"])
]

for entry in simple_party_gets:
    if len(entry) == 5:
        title, path, auth, response, query = entry
        parties_endpoints.append({
            "name": title,
            "path": path,
            "operations": [op("GET", auth, response=response, query=query)]
        })
    else:
        title, path, auth, response = entry
        parties_endpoints.append({
            "name": title,
            "path": path,
            "operations": [op("GET", auth, response=response)]
        })

parties_endpoints.append({
    "name": "Join by Code",
    "path": "/api/parties/join-by-code/",
    "operations": [op("POST", True, request={"code": "ABC123"}, response="Joined party")]
})

parties_endpoints.append({
    "name": "Join by Invite",
    "path": "/api/parties/join-by-invite/",
    "operations": [op("POST", True, request={"invite_code": "invitation_code"}, response="Joined party")]
})

parties_endpoints.append({
    "name": "Report Party",
    "path": "/api/parties/report/",
    "operations": [
        op(
            "POST",
            True,
            request={
                "party_id": "uuid",
                "reason": "inappropriate_content",
                "description": "Report details"
            },
            response="Report submitted"
        )
    ]
})

parties_endpoints.append({
    "name": "Generate Invite",
    "path": "/api/parties/<party_id>/generate-invite/",
    "operations": [
        op(
            "POST",
            True,
            response={
                "invite_code": "ABC123XYZ",
                "invite_url": "https://app.example.com/join/ABC123XYZ",
                "expires_at": "2025-08-11T12:00:00Z"
            },
            path_params=["party_id"]
        )
    ]
})

parties_endpoints.append({
    "name": "Party Analytics",
    "path": "/api/parties/<party_id>/analytics/",
    "operations": [op("GET", True, response="Party analytics", path_params=["party_id"])]
})

parties_endpoints.append({
    "name": "Update Analytics",
    "path": "/api/parties/<party_id>/update-analytics/",
    "operations": [op("POST", True, response="Analytics updated", path_params=["party_id"])]
})

parties_endpoints.append({
    "name": "Parties Collection",
    "path": "/api/parties/",
    "operations": [
        op("GET", True, response="Paginated parties", query=["page", "search", "is_public", "host"]),
        op(
            "POST",
            True,
            request={
                "title": "Movie Night",
                "description": "Friday movie night with friends",
                "video_id": "uuid",
                "is_public": True,
                "max_participants": 10,
                "scheduled_for": "2025-08-10T20:00:00Z"
            },
            response="Party created"
        )
    ]
})

parties_endpoints.append({
    "name": "Party Detail",
    "path": "/api/parties/<party_id>/",
    "operations": [
        op("GET", True, response="Party details", path_params=["party_id"]),
        op(
            "PUT",
            True,
            request={
                "title": "Updated Title",
                "description": "Updated description",
                "is_public": False
            },
            response="Party updated",
            path_params=["party_id"]
        ),
        op("PATCH", True, response="Party partially updated", path_params=["party_id"]),
        op("DELETE", True, response="Party deleted", path_params=["party_id"])
    ]
})

party_actions = [
    ("Join Party", "join/", "POST", "Joined party"),
    ("Leave Party", "leave/", "POST", "Left party"),
    ("Start Party", "start/", "POST", "Party started"),
    ("Control Party", "control/", "POST", "Control action processed", {"action": "play", "timestamp": 120.5}),
    ("React to Party", "react/", "POST", "Reaction recorded", {"emoji": "😂", "timestamp": 180.3}),
    ("Participants", "participants/", "GET", "Party participants"),
    ("Invite", "invite/", "POST", "Invitations sent", {"user_ids": ["uuid1", "uuid2"], "message": "Join us for movie night!"}),
    ("Select GDrive Movie", "select_gdrive_movie/", "POST", "Google Drive movie selected"),
    ("Sync State", "sync_state/", "GET", "Party sync state"),
    ("Update Sync State", "sync_state/", "POST", "Party sync updated")
]

for title, suffix, method, response, *request in party_actions:
    req = request[0] if request else None
    query = ["page", "before_timestamp"] if suffix == "chat/" and method == "GET" else None
    parties_endpoints.append({
        "name": title,
        "path": f"/api/parties/<party_id>/{suffix}",
        "operations": [
            op(
                method,
                True,
                request=req,
                response=response,
                path_params=["party_id"],
                query=query
            )
        ]
    })

# Party chat separate handling
parties_endpoints.append({
    "name": "Party Chat",
    "path": "/api/parties/<party_id>/chat/",
    "operations": [
        op("GET", True, response="Party chat history", path_params=["party_id"], query=["page", "before_timestamp"]),
        op(
            "POST",
            True,
            request={"message": "Great movie!", "message_type": "text"},
            response="Message sent",
            path_params=["party_id"]
        )
    ]
})

# Invitation endpoints
invitation_operations = [
    ("Invitations", "/api/parties/invitations/", "GET", "Invitations list", None),
    ("Invitation Detail", "/api/parties/invitations/<invitation_id>/", "GET", "Invitation detail", ["invitation_id"]),
    ("Accept Invitation", "/api/parties/invitations/<invitation_id>/accept/", "POST", "Invitation accepted", ["invitation_id"]),
    ("Decline Invitation", "/api/parties/invitations/<invitation_id>/decline/", "POST", "Invitation declined", ["invitation_id"]),
    ("Invitation Analytics", "/api/parties/invitations/<invitation_id>/analytics/", "GET", "Invitation analytics", ["invitation_id"]),
    ("Join by Invitation Code", "/api/parties/invitations/<invitation_id>/join_by_code/", "POST", "Joined via code", ["invitation_id"]),
    ("Kick Participant", "/api/parties/invitations/<invitation_id>/kick_participant/", "POST", "Participant removed", ["invitation_id"]),
    ("Promote Participant", "/api/parties/invitations/<invitation_id>/promote_participant/", "POST", "Participant promoted", ["invitation_id"])
]

for title, path, method, response, params in invitation_operations:
    parties_endpoints.append({
        "name": title,
        "path": path,
        "operations": [op(method, True, response=response, path_params=params)]
    })

categories.append({
    "name": "Parties",
    "description": "Watch party discovery, management, participation, and invitations.",
    "endpoints": parties_endpoints
})

# Chat category
chat_endpoints = []

chat_endpoints.append({
    "name": "Party Chat Messages",
    "path": "/api/chat/<party_id>/messages/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "messages": [
                    {
                        "id": "uuid",
                        "user": {
                            "id": "uuid",
                            "username": "johndoe",
                            "display_name": "John Doe"
                        },
                        "message": "Great movie!",
                        "message_type": "text",
                        "timestamp": "2025-08-10T20:30:00Z",
                        "edited": False
                    }
                ],
                "pagination": {
                    "next": None,
                    "previous": "url",
                    "total": 50
                }
            },
            path_params=["party_id"],
            query=["page", "before", "after", "limit"]
        )
    ]
})

chat_endpoints.append({
    "name": "Send Party Chat Message",
    "path": "/api/chat/<party_id>/messages/send/",
    "operations": [
        op(
            "POST",
            True,
            request={
                "message": "This is awesome!",
                "message_type": "text",
                "reply_to": "message_id"
            },
            response={
                "id": "uuid",
                "message": "This is awesome!",
                "timestamp": "2025-08-10T20:31:00Z",
                "status": "sent"
            },
            notes="reply_to optional",
            path_params=["party_id"]
        )
    ]
})

for title, suffix, request in [
    ("Join Chat Room", "join/", None),
    ("Leave Chat Room", "leave/", None)
]:
    chat_endpoints.append({
        "name": title,
        "path": f"/api/chat/<room_id>/{suffix}",
        "operations": [op("POST", True, response=f"{title} confirmation", path_params=["room_id"])]
    })

chat_endpoints.append({
    "name": "Active Chat Users",
    "path": "/api/chat/<room_id>/active-users/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "active_users": [
                    {
                        "id": "uuid",
                        "username": "johndoe",
                        "display_name": "John Doe",
                        "last_seen": "2025-08-10T20:32:00Z"
                    }
                ],
                "total_active": 5
            },
            path_params=["room_id"]
        )
    ]
})

chat_endpoints.append({
    "name": "Chat Room Settings",
    "path": "/api/chat/<room_id>/settings/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "slow_mode": False,
                "slow_mode_interval": 5,
                "allow_emojis": True,
                "allow_links": True,
                "max_message_length": 500
            },
            path_params=["room_id"]
        ),
        op(
            "PUT",
            True,
            request={
                "slow_mode": False,
                "slow_mode_interval": 5,
                "allow_emojis": True,
                "allow_links": True,
                "max_message_length": 500
            },
            response="Chat settings updated",
            path_params=["room_id"]
        )
    ]
})

chat_actions = [
    ("Moderate Chat", "moderate/", {
        "action": "delete_message",
        "target_id": "message_id",
        "reason": "spam"
    }, "Moderation action applied"),
    ("Ban User", "ban/", {
        "user_id": "uuid",
        "duration": 3600,
        "reason": "inappropriate_behavior"
    }, "User banned"),
    ("Unban User", "unban/", {"user_id": "uuid"}, "User unbanned")
]

for title, suffix, request_body, response in chat_actions:
    chat_endpoints.append({
        "name": title,
        "path": f"/api/chat/<room_id>/{suffix}",
        "operations": [op("POST", True, request=request_body, response=response, path_params=["room_id"])]
    })

chat_endpoints.append({
    "name": "Moderation Log",
    "path": "/api/chat/<room_id>/moderation-log/",
    "operations": [op("GET", True, response="Moderation log", path_params=["room_id"])]
})

chat_endpoints.append({
    "name": "Chat Statistics",
    "path": "/api/chat/<room_id>/stats/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "total_messages": 150,
                "active_participants": 8,
                "message_rate": 2.5,
                "popular_emojis": ["😂", "👍", "❤️"]
            },
            path_params=["room_id"]
        )
    ]
})

chat_endpoints.append({
    "name": "Legacy Chat History",
    "path": "/api/chat/history/<party_id>/",
    "operations": [op("GET", True, response="Legacy chat history", path_params=["party_id"])]
})

chat_endpoints.append({
    "name": "Legacy Moderation",
    "path": "/api/chat/moderate/",
    "operations": [op("POST", True, response="Legacy moderation action")]
})

categories.append({
    "name": "Chat",
    "description": "Real-time chat messaging, room management, and moderation.",
    "endpoints": chat_endpoints
})

# Billing category
billing_endpoints = []

billing_endpoints.append({
    "name": "Subscription Plans",
    "path": "/api/billing/plans/",
    "operations": [
        op(
            "GET",
            False,
            response={
                "plans": [
                    {
                        "id": "basic",
                        "name": "Basic Plan",
                        "price": 9.99,
                        "currency": "USD",
                        "interval": "month",
                        "features": ["Feature 1", "Feature 2"]
                    }
                ]
            }
        )
    ]
})

billing_endpoints.append({
    "name": "Subscribe",
    "path": "/api/billing/subscribe/",
    "operations": [
        op(
            "POST",
            True,
            request={
                "plan_id": "premium",
                "payment_method_id": "pm_123456",
                "promo_code": "SAVE20"
            },
            response="Subscription created",
            notes="promo_code optional"
        )
    ]
})

billing_endpoints.append({
    "name": "Current Subscription",
    "path": "/api/billing/subscription/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "id": "sub_123",
                "plan": "premium",
                "status": "active",
                "current_period_end": "2025-09-10T00:00:00Z",
                "cancel_at_period_end": False
            }
        )
    ]
})

billing_endpoints.append({
    "name": "Cancel Subscription",
    "path": "/api/billing/subscription/cancel/",
    "operations": [
        op(
            "POST",
            True,
            request={
                "cancel_at_period_end": True,
                "reason": "switching_plans"
            },
            response="Cancellation scheduled"
        )
    ]
})

billing_endpoints.append({
    "name": "Resume Subscription",
    "path": "/api/billing/subscription/resume/",
    "operations": [op("POST", True, response="Subscription resumed")]
})

billing_endpoints.extend([
    {
        "name": "Payment Methods",
        "path": "/api/billing/payment-methods/",
        "operations": [op("GET", True, response="Payment methods list")]
    },
    {
        "name": "Payment Method Detail",
        "path": "/api/billing/payment-methods/<payment_method_id>/",
        "operations": [op("GET", True, response="Payment method detail", path_params=["payment_method_id"])]
    },
    {
        "name": "Set Default Payment Method",
        "path": "/api/billing/payment-methods/<payment_method_id>/set-default/",
        "operations": [op("POST", True, response="Default payment method updated", path_params=["payment_method_id"])]
    }
])

billing_endpoints.extend([
    {
        "name": "Billing History",
        "path": "/api/billing/history/",
        "operations": [op("GET", True, response="Billing history", query=["page", "year", "month"])]
    },
    {
        "name": "Invoice Detail",
        "path": "/api/billing/invoices/<invoice_id>/",
        "operations": [op("GET", True, response="Invoice detail", path_params=["invoice_id"])]
    },
    {
        "name": "Invoice Download",
        "path": "/api/billing/invoices/<invoice_id>/download/",
        "operations": [op("GET", True, response="Invoice PDF download", path_params=["invoice_id"])]
    }
])

billing_endpoints.append({
    "name": "Billing Address",
    "path": "/api/billing/address/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "line1": "123 Main St",
                "line2": "Apt 4B",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "country": "US"
            }
        ),
        op(
            "PUT",
            True,
            request={
                "line1": "123 Main St",
                "line2": "Apt 4B",
                "city": "New York",
                "state": "NY",
                "postal_code": "10001",
                "country": "US"
            },
            response="Billing address updated"
        )
    ]
})

billing_endpoints.append({
    "name": "Validate Promo Code",
    "path": "/api/billing/promo-code/validate/",
    "operations": [
        op(
            "POST",
            True,
            request={"promo_code": "SAVE20"},
            response={
                "valid": True,
                "discount_percent": 20,
                "expires_at": "2025-12-31T23:59:59Z"
            }
        )
    ]
})

billing_endpoints.append({
    "name": "Stripe Webhook",
    "path": "/api/billing/webhooks/stripe/",
    "operations": [op("POST", False, response="Webhook processed", notes="Requires Stripe signature header")]
})

categories.append({
    "name": "Billing",
    "description": "Subscriptions, payment methods, invoicing, and billing utilities.",
    "endpoints": billing_endpoints
})

# Analytics category
analytics_endpoints = []

analytics_endpoints.extend([
    {
        "name": "Analytics Overview",
        "path": "/api/analytics/",
        "operations": [op("GET", True, response="Analytics overview", notes="Admin access required")]
    },
    {
        "name": "User Stats",
        "path": "/api/analytics/user-stats/",
        "operations": [op("GET", True, response="User statistics")]
    },
    {
        "name": "Party Stats",
        "path": "/api/analytics/party-stats/<party_id>/",
        "operations": [op("GET", True, response="Party analytics", path_params=["party_id"])]
    },
    {
        "name": "Admin Analytics",
        "path": "/api/analytics/admin/analytics/",
        "operations": [op("GET", True, response="Admin analytics dashboard", notes="Admin access required")]
    },
    {
        "name": "Export Analytics",
        "path": "/api/analytics/export/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "date_range": {
                        "start": "2025-08-01",
                        "end": "2025-08-31"
                    },
                    "format": "csv"
                },
                response="Export started",
                notes="Admin access required"
            )
        ]
    }
])

analytics_dashboard = [
    {"name": "Dashboard Summary", "path": "/api/analytics/dashboard/", "response": "Dashboard statistics"},
    {"name": "User Analytics", "path": "/api/analytics/user/", "response": "User analytics"},
    {"name": "Video Analytics", "path": "/api/analytics/video/<video_id>/", "response": "Video analytics", "path_params": ["video_id"]},
    {"name": "Party Analytics Detail", "path": "/api/analytics/party/<party_id>/", "response": "Party analytics", "path_params": ["party_id"]},
    {"name": "System Analytics", "path": "/api/analytics/system/", "response": "System analytics", "notes": "Admin access required"},
    {"name": "System Performance", "path": "/api/analytics/system/performance/", "response": "System performance metrics", "notes": "Admin access required"},
    {"name": "Revenue Analytics", "path": "/api/analytics/revenue/", "response": "Revenue analytics", "notes": "Admin access required"},
    {"name": "Retention Analytics", "path": "/api/analytics/retention/", "response": "User retention analytics", "notes": "Admin access required"},
    {"name": "Content Analytics", "path": "/api/analytics/content/", "response": "Content analytics", "notes": "Admin access required"},
    {
        "name": "Record Event",
        "path": "/api/analytics/events/",
        "method": "POST",
        "response": "Event recorded",
        "request": {
            "event_type": "video_view",
            "event_data": {
                "video_id": "uuid",
                "watch_duration": 120
            }
        }
    }
]

for item in analytics_dashboard:
    analytics_endpoints.append({
        "name": item["name"],
        "path": item["path"],
        "operations": [
            op(
                item.get("method", "GET"),
                True,
                request=item.get("request"),
                response=item["response"],
                path_params=item.get("path_params"),
                notes=item.get("notes")
            )
        ]
    })

# Advanced analytics
advanced_analytics = [
    ("Real-time Dashboard", "/api/analytics/dashboard/realtime/", "Real-time dashboard data", "Admin access required"),
    ("Advanced Query", "/api/analytics/advanced/query/", "Custom query results", "Admin access required", "POST", {
        "query": "custom_analytics_query",
        "parameters": {}
    }),
    ("A/B Testing", "/api/analytics/ab-testing/", "A/B testing results", "Admin access required", "GET"),
    ("Submit A/B Test", "/api/analytics/ab-testing/", "A/B testing payload accepted", "Admin access required", "POST"),
    ("Predictive Analytics", "/api/analytics/predictive/", "Predictive analytics data", "Admin access required")
]

for item in advanced_analytics:
    name, path, response, notes, *rest = item
    method = rest[0] if rest else "GET"
    request_body = rest[1] if len(rest) > 1 else None
    analytics_endpoints.append({
        "name": name,
        "path": path,
        "operations": [op(method, True, request=request_body, response=response, notes=notes)]
    })

latest_analytics = [
    ("Platform Overview", "/api/analytics/platform-overview/", "Platform overview analytics"),
    ("User Behavior", "/api/analytics/user-behavior/", "User behavior analytics"),
    ("Content Performance", "/api/analytics/content-performance/", "Content performance analytics"),
    ("Advanced Revenue", "/api/analytics/revenue-advanced/", "Advanced revenue analytics"),
    ("Personal Analytics", "/api/analytics/personal/", "Personal user analytics"),
    ("Real-time Feed", "/api/analytics/real-time/", "Real-time analytics feed")
]

for name, path, response in latest_analytics:
    notes = "Admin access required" if "revenue" in path or "platform" in path or "real-time" in path and "personal" not in path else None
    analytics_endpoints.append({
        "name": name,
        "path": path,
        "operations": [op("GET", True, response=response, notes=notes)]
    })

categories.append({
    "name": "Analytics",
    "description": "Usage tracking, reporting, and advanced analytics endpoints.",
    "endpoints": analytics_endpoints
})

# Notifications category
notifications_endpoints = []

notifications_endpoints.append({
    "name": "Notifications",
    "path": "/api/notifications/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "notifications": [
                    {
                        "id": "uuid",
                        "type": "friend_request",
                        "title": "New Friend Request",
                        "message": "John Doe sent you a friend request",
                        "read": False,
                        "created_at": "2025-08-10T20:00:00Z",
                        "data": {"sender_id": "uuid"}
                    }
                ],
                "unread_count": 5
            },
            query=["page", "read", "type"]
        )
    ]
})

notifications_endpoints.extend([
    {
        "name": "Notification Detail",
        "path": "/api/notifications/<notification_id>/",
        "operations": [op("GET", True, response="Notification detail", path_params=["notification_id"])]
    },
    {
        "name": "Mark Notification Read",
        "path": "/api/notifications/<notification_id>/mark-read/",
        "operations": [op("POST", True, response="Notification marked read", path_params=["notification_id"])]
    },
    {
        "name": "Mark All Read",
        "path": "/api/notifications/mark-all-read/",
        "operations": [op("POST", True, response="All notifications marked read")]
    },
    {
        "name": "Clear All Notifications",
        "path": "/api/notifications/clear-all/",
        "operations": [op("DELETE", True, response="Notifications cleared")]
    }
])

notifications_endpoints.append({
    "name": "Notification Preferences",
    "path": "/api/notifications/preferences/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "email_notifications": True,
                "push_notifications": True,
                "friend_requests": True,
                "party_invitations": True,
                "video_comments": False,
                "marketing": False
            }
        )
    ]
})

notifications_endpoints.append({
    "name": "Update Notification Preferences",
    "path": "/api/notifications/preferences/update/",
    "operations": [
        op(
            "POST",
            True,
            request={
                "email_notifications": True,
                "push_notifications": True,
                "friend_requests": True,
                "party_invitations": True
            },
            response="Preferences updated"
        )
    ]
})

push_endpoints = [
    ("Update Push Token", "/api/notifications/push/token/update/", {
        "device_token": "fcm_token",
        "device_type": "ios",
        "app_version": "1.0.0"
    }, "Token updated"),
    ("Remove Push Token", "/api/notifications/push/token/remove/", {"device_token": "fcm_token"}, "Token removed"),
    ("Push Test", "/api/notifications/push/test/", None, "Test notification sent"),
    ("Push Broadcast", "/api/notifications/push/broadcast/", {
        "title": "Announcement",
        "message": "New features available!",
        "target_users": ["all"]
    }, "Broadcast started", "Admin access required")
]

for name, path, request_body, response, *extra in push_endpoints:
    notes = extra[0] if extra else None
    notifications_endpoints.append({
        "name": name,
        "path": path,
        "operations": [op("POST", True, request=request_body, response=response, notes=notes)]
    })

notifications_endpoints.extend([
    {
        "name": "Notification Templates",
        "path": "/api/notifications/templates/",
        "operations": [op("GET", True, response="Notification templates", notes="Admin access required")]
    },
    {
        "name": "Notification Template Detail",
        "path": "/api/notifications/templates/<template_id>/",
        "operations": [op("GET", True, response="Template detail", notes="Admin access required", path_params=["template_id"])]
    },
    {
        "name": "Notification Channels",
        "path": "/api/notifications/channels/",
        "operations": [op("GET", True, response="Notification channels", notes="Admin access required")]
    },
    {
        "name": "Notification Stats",
        "path": "/api/notifications/stats/",
        "operations": [op("GET", True, response="Notification statistics", notes="Admin access required")]
    },
    {
        "name": "Delivery Stats",
        "path": "/api/notifications/delivery-stats/",
        "operations": [op("GET", True, response="Delivery statistics", notes="Admin access required")]
    },
    {
        "name": "Bulk Send",
        "path": "/api/notifications/bulk/send/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "template_id": "uuid",
                    "target_users": ["uuid1", "uuid2"],
                    "data": {}
                },
                response="Bulk send started",
                notes="Admin access required"
            )
        ]
    },
    {
        "name": "Notification Cleanup",
        "path": "/api/notifications/cleanup/",
        "operations": [op("POST", True, request={"older_than_days": 30}, response="Cleanup started", notes="Admin access required")]
    }
])

categories.append({
    "name": "Notifications",
    "description": "User notifications, preferences, push delivery, and admin tools.",
    "endpoints": notifications_endpoints
})

# Integrations category
integrations_endpoints = []

integrations_endpoints.append({
    "name": "Integration Health",
    "path": "/api/integrations/health/",
    "operations": [
        op(
            "GET",
            False,
            response={
                "status": "healthy",
                "services": {
                    "google_drive": "available",
                    "aws_s3": "available",
                    "social_oauth": "available"
                }
            }
        )
    ]
})

# Google Drive integration
integrations_endpoints.extend([
    {
        "name": "Google Drive Auth URL",
        "path": "/api/integrations/google-drive/auth-url/",
        "operations": [op("GET", True, response={"auth_url": "https://accounts.google.com/oauth/authorize?..."})]
    },
    {
        "name": "Google Drive OAuth Callback",
        "path": "/api/integrations/google-drive/oauth-callback/",
        "operations": [op("POST", True, request={"code": "google_oauth_code"}, response="OAuth completed")]
    },
    {
        "name": "Google Drive Files",
        "path": "/api/integrations/google-drive/files/",
        "operations": [op("GET", True, response="Google Drive files", query=["folder_id", "mime_type", "page"])]
    },
    {
        "name": "Google Drive Streaming URL",
        "path": "/api/integrations/google-drive/files/<file_id>/streaming-url/",
        "operations": [op("GET", True, response={"streaming_url": "https://drive.google.com/file/d/xyz/view", "expires_at": "2025-08-10T21:00:00Z"}, path_params=["file_id"])]
    }
])

# AWS S3 integration
integrations_endpoints.extend([
    {
        "name": "S3 Presigned Upload",
        "path": "/api/integrations/s3/presigned-upload/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "filename": "video.mp4",
                    "content_type": "video/mp4",
                    "file_size": 1024000
                },
                response={
                    "upload_url": "https://s3.amazonaws.com/presigned-url",
                    "file_key": "uploads/video_123.mp4"
                }
            )
        ]
    },
    {
        "name": "S3 Upload",
        "path": "/api/integrations/s3/upload/",
        "operations": [op("POST", True, request={"file": "<file>"}, response="File uploaded", notes="Multipart form data")]
    },
    {
        "name": "S3 Streaming URL",
        "path": "/api/integrations/s3/files/<file_key>/streaming-url/",
        "operations": [op("GET", True, response="S3 streaming URL", path_params=["file_key"])]
    }
])

# Social OAuth
integrations_endpoints.extend([
    {
        "name": "Social Auth URL",
        "path": "/api/integrations/social/<provider>/auth-url/",
        "operations": [op("GET", False, response="Social OAuth URL", path_params=["provider"], notes="Supported providers: google, github, facebook, twitter")]
    },
    {
        "name": "Social OAuth Callback",
        "path": "/api/integrations/social/<provider>/callback/",
        "operations": [op("POST", False, request={"code": "oauth_code", "state": "oauth_state"}, response="OAuth processed", path_params=["provider"])]
    }
])

integrations_endpoints.extend([
    {
        "name": "Integration Status",
        "path": "/api/integrations/status/",
        "operations": [op("GET", True, response="Integration status", notes="Admin access required")]
    },
    {
        "name": "Integration Management",
        "path": "/api/integrations/management/",
        "operations": [op("GET", True, response="Integration management", notes="Admin access required")]
    },
    {
        "name": "Test Integration",
        "path": "/api/integrations/test/",
        "operations": [op("POST", True, response="Integration test results", notes="Admin access required")]
    },
    {
        "name": "Integration Types",
        "path": "/api/integrations/types/",
        "operations": [op("GET", False, response="Integration types")]
    },
    {
        "name": "User Connections",
        "path": "/api/integrations/connections/",
        "operations": [op("GET", True, response="Connected services list")]
    },
    {
        "name": "Disconnect Connection",
        "path": "/api/integrations/connections/<connection_id>/disconnect/",
        "operations": [op("DELETE", True, response="Service disconnected", path_params=["connection_id"])]
    }
])

categories.append({
    "name": "Integrations",
    "description": "Third-party service integrations and connection management.",
    "endpoints": integrations_endpoints
})

# Interactive category
interactive_endpoints = []

interactive_endpoints.extend([
    {
        "name": "Party Reactions",
        "path": "/api/interactive/parties/<party_id>/reactions/",
        "operations": [op("GET", True, response="Party reactions", path_params=["party_id"])]
    },
    {
        "name": "Create Reaction",
        "path": "/api/interactive/parties/<party_id>/reactions/create/",
        "operations": [op("POST", True, request={"emoji": "😂", "timestamp": 120.5}, response="Reaction created", path_params=["party_id"])]
    },
    {
        "name": "Voice Chat",
        "path": "/api/interactive/parties/<party_id>/voice-chat/",
        "operations": [op("GET", True, response="Voice chat room info", path_params=["party_id"])]
    },
    {
        "name": "Manage Voice Chat",
        "path": "/api/interactive/parties/<party_id>/voice-chat/manage/",
        "operations": [op("POST", True, request={"action": "mute_user", "user_id": "uuid"}, response="Voice chat updated", path_params=["party_id"])]
    },
    {
        "name": "Screen Shares",
        "path": "/api/interactive/parties/<party_id>/screen-shares/",
        "operations": [op("GET", True, response="Active screen shares", path_params=["party_id"])]
    }
])

interactive_endpoints.extend([
    {
        "name": "Start Screen Share",
        "path": "/api/interactive/parties/<party_id>/screen-shares/start/",
        "operations": [op("POST", True, response="Screen share started", path_params=["party_id"])]
    },
    {
        "name": "Stop Screen Share",
        "path": "/api/interactive/parties/<party_id>/screen-shares/<share_id>/stop/",
        "operations": [op("POST", True, response="Screen share stopped", path_params=["party_id", "share_id"])]
    },
    {
        "name": "Update Screen Share",
        "path": "/api/interactive/screen-shares/<share_id>/update/",
        "operations": [op("POST", True, response="Screen share updated", path_params=["share_id"])]
    },
    {
        "name": "Screen Share Annotations",
        "path": "/api/interactive/screen-shares/<share_id>/annotations/",
        "operations": [op("POST", True, response="Annotations updated", path_params=["share_id"])]
    }
])

interactive_endpoints.extend([
    {
        "name": "Party Polls",
        "path": "/api/interactive/parties/<party_id>/polls/",
        "operations": [op("GET", True, response="Active polls", path_params=["party_id"])]
    },
    {
        "name": "Create Poll",
        "path": "/api/interactive/parties/<party_id>/polls/create/",
        "operations": [
            op(
                "POST",
                True,
                request={
                    "question": "What should we watch next?",
                    "options": ["Movie A", "Movie B", "Movie C"],
                    "duration": 300
                },
                response="Poll created",
                path_params=["party_id"]
            )
        ]
    },
    {
        "name": "Publish Poll",
        "path": "/api/interactive/polls/<poll_id>/publish/",
        "operations": [op("POST", True, response="Poll published", path_params=["poll_id"])]
    },
    {
        "name": "Respond to Poll",
        "path": "/api/interactive/polls/<poll_id>/respond/",
        "operations": [op("POST", True, request={"option_id": "uuid"}, response="Vote recorded", path_params=["poll_id"])]
    },
    {
        "name": "Party Interactive Analytics",
        "path": "/api/interactive/parties/<party_id>/analytics/",
        "operations": [op("GET", True, response="Interactive analytics", path_params=["party_id"])]
    }
])

categories.append({
    "name": "Interactive",
    "description": "Real-time interactive features such as reactions, voice chat, polls, and screen sharing.",
    "endpoints": interactive_endpoints
})

# Moderation category
moderation_endpoints = []

moderation_endpoints.extend([
    {
        "name": "Reports",
        "path": "/api/moderation/reports/",
        "operations": [
            op("GET", True, response="Reports list", notes="Admin access required"),
            op(
                "POST",
                True,
                request={
                    "content_type": "video",
                    "content_id": "uuid",
                    "reason": "inappropriate_content",
                    "description": "Report details"
                },
                response="Report submitted"
            )
        ]
    },
    {
        "name": "Report Detail",
        "path": "/api/moderation/reports/<report_id>/",
        "operations": [op("GET", True, response="Report detail", notes="Admin access required", path_params=["report_id"])]
    }
])

moderation_endpoints.extend([
    {
        "name": "Moderation Queue",
        "path": "/api/moderation/admin/queue/",
        "operations": [op("GET", True, response="Moderation queue", notes="Admin access required")]
    },
    {
        "name": "Moderation Stats",
        "path": "/api/moderation/admin/stats/",
        "operations": [op("GET", True, response="Moderation statistics", notes="Admin access required")]
    },
    {
        "name": "Moderation Dashboard",
        "path": "/api/moderation/admin/dashboard/",
        "operations": [op("GET", True, response="Moderation dashboard", notes="Admin access required")]
    }
])

moderation_actions = [
    ("Assign Report", "/api/moderation/admin/reports/<report_id>/assign/", {
        "moderator_id": "uuid"
    }, "Report assigned"),
    ("Resolve Report", "/api/moderation/admin/reports/<report_id>/resolve/", {
        "action": "approve",
        "reason": "Valid content"
    }, "Report resolved"),
    ("Dismiss Report", "/api/moderation/admin/reports/<report_id>/dismiss/", {
        "reason": "Invalid report"
    }, "Report dismissed")
]

for name, path, request_body, response in moderation_actions:
    moderation_endpoints.append({
        "name": name,
        "path": path,
        "operations": [op("POST", True, request=request_body, response=response, notes="Admin access required", path_params=["report_id"])]
    })

moderation_endpoints.append({
    "name": "Report Actions",
    "path": "/api/moderation/admin/reports/<report_id>/actions/",
    "operations": [op("GET", True, response="Report action history", notes="Admin access required", path_params=["report_id"])]
})

moderation_endpoints.append({
    "name": "Bulk Report Action",
    "path": "/api/moderation/admin/reports/bulk-action/",
    "operations": [
        op(
            "POST",
            True,
            request={
                "report_ids": ["uuid1", "uuid2"],
                "action": "resolve",
                "reason": "Bulk resolution"
            },
            response="Bulk action started",
            notes="Admin access required"
        )
    ]
})

moderation_endpoints.extend([
    {
        "name": "Report Types",
        "path": "/api/moderation/report-types/",
        "operations": [op("GET", False, response="Available report types")]
    },
    {
        "name": "Content Types",
        "path": "/api/moderation/content-types/",
        "operations": [op("GET", False, response="Reportable content types")]
    }
])

categories.append({
    "name": "Moderation",
    "description": "Reporting workflows, admin queues, and reference data.",
    "endpoints": moderation_endpoints
})

# Store category
store_endpoints = []

store_endpoints.append({
    "name": "Store Items",
    "path": "/api/store/items/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "items": [
                    {
                        "id": "uuid",
                        "name": "Premium Theme",
                        "description": "Exclusive theme",
                        "price": 9.99,
                        "currency": "USD",
                        "category": "themes",
                        "featured": True
                    }
                ]
            },
            query=["category", "featured", "page"]
        )
    ]
})

store_endpoints.append({
    "name": "Purchase Item",
    "path": "/api/store/purchase/",
    "operations": [op("POST", True, request={"item_id": "uuid", "payment_method": "credits"}, response="Purchase completed")]
})

store_endpoints.extend([
    {
        "name": "Inventory",
        "path": "/api/store/inventory/",
        "operations": [op("GET", True, response="User inventory")]
    },
    {
        "name": "Achievements",
        "path": "/api/store/achievements/",
        "operations": [op("GET", True, response="Available achievements")]
    },
    {
        "name": "Rewards",
        "path": "/api/store/rewards/",
        "operations": [op("GET", True, response="Available rewards")]
    },
    {
        "name": "Claim Reward",
        "path": "/api/store/rewards/<reward_id>/claim/",
        "operations": [op("POST", True, response="Reward claimed", path_params=["reward_id"])]
    },
    {
        "name": "Store Stats",
        "path": "/api/store/stats/",
        "operations": [op("GET", True, response="Store statistics")]
    }
])

categories.append({
    "name": "Store",
    "description": "In-app purchases, achievements, rewards, and inventory.",
    "endpoints": store_endpoints
})

# Support category
support_endpoints = []

support_endpoints.extend([
    {
        "name": "FAQ Categories",
        "path": "/api/support/faq/categories/",
        "operations": [op("GET", False, response="FAQ categories")]
    },
    {
        "name": "FAQ List",
        "path": "/api/support/faq/",
        "operations": [op("GET", False, response="FAQ list", query=["category", "search"])]
    },
    {
        "name": "Vote FAQ",
        "path": "/api/support/faq/<faq_id>/vote/",
        "operations": [op("POST", True, request={"helpful": True}, response="Vote recorded", path_params=["faq_id"])]
    },
    {
        "name": "View FAQ",
        "path": "/api/support/faq/<faq_id>/view/",
        "operations": [op("GET", False, response="FAQ detail", path_params=["faq_id"])]
    }
])

support_endpoints.extend([
    {
        "name": "Support Tickets",
        "path": "/api/support/tickets/",
        "operations": [
            op("GET", True, response="Support tickets"),
            op(
                "POST",
                True,
                request={
                    "subject": "Issue with video upload",
                    "description": "Detailed description",
                    "category": "technical",
                    "priority": "medium"
                },
                response="Ticket created"
            )
        ]
    },
    {
        "name": "Ticket Detail",
        "path": "/api/support/tickets/<ticket_id>/",
        "operations": [op("GET", True, response="Ticket detail", path_params=["ticket_id"])]
    },
    {
        "name": "Ticket Messages",
        "path": "/api/support/tickets/<ticket_id>/messages/",
        "operations": [op("POST", True, request={"message": "Additional information"}, response="Message added", path_params=["ticket_id"])]
    }
])

support_endpoints.extend([
    {
        "name": "Feedback",
        "path": "/api/support/feedback/",
        "operations": [
            op("GET", True, response="User feedback"),
            op(
                "POST",
                True,
                request={
                    "type": "feature_request",
                    "title": "Add dark mode",
                    "description": "Would love a dark mode option",
                    "rating": 5
                },
                response="Feedback submitted"
            )
        ]
    },
    {
        "name": "Vote Feedback",
        "path": "/api/support/feedback/<feedback_id>/vote/",
        "operations": [op("POST", True, request={"vote": "upvote"}, response="Feedback vote recorded", path_params=["feedback_id"])]
    },
    {
        "name": "Support Search",
        "path": "/api/support/search/",
        "operations": [op("GET", False, response="Support search results", query=["q"])]
    }
])

categories.append({
    "name": "Support",
    "description": "Help center, support tickets, feedback, and FAQ.",
    "endpoints": support_endpoints
})

# Search category
search_endpoints = []

search_endpoints.append({
    "name": "Global Search",
    "path": "/api/search/",
    "operations": [
        op(
            "GET",
            False,
            response={
                "query": "search term",
                "results": {
                    "videos": [
                        {
                            "id": "uuid",
                            "title": "Video Title",
                            "description": "Description",
                            "thumbnail": "url",
                            "duration": 3600
                        }
                    ],
                    "parties": [
                        {
                            "id": "uuid",
                            "title": "Party Title",
                            "host": "username",
                            "participants_count": 5
                        }
                    ],
                    "users": [
                        {
                            "id": "uuid",
                            "username": "johndoe",
                            "display_name": "John Doe",
                            "avatar": "url"
                        }
                    ]
                },
                "total_results": 45
            },
            query=["q", "type", "page", "page_size"]
        )
    ]
})

search_endpoints.append({
    "name": "Discover",
    "path": "/api/search/discover/",
    "operations": [op("GET", False, response={"featured_videos": [], "trending_parties": [], "recommended_content": [], "popular_categories": []}, query=["category", "trending", "recommended"])]
})

categories.append({
    "name": "Search",
    "description": "Platform-wide discovery and search endpoints.",
    "endpoints": search_endpoints
})

# Social category
social_endpoints = []

social_endpoints.extend([
    {
        "name": "Social Groups",
        "path": "/api/social/groups/",
        "operations": [op("GET", True, response="User social groups")]
    },
    {
        "name": "Group Detail",
        "path": "/api/social/groups/<group_id>/",
        "operations": [op("GET", True, response="Group detail", path_params=["group_id"])]
    },
    {
        "name": "Join Group",
        "path": "/api/social/groups/<group_id>/join/",
        "operations": [op("POST", True, response="Joined group", path_params=["group_id"])]
    },
    {
        "name": "Leave Group",
        "path": "/api/social/groups/<group_id>/leave/",
        "operations": [op("POST", True, response="Left group", path_params=["group_id"])]
    }
])

categories.append({
    "name": "Social",
    "description": "Community groups and social interactions beyond friend system.",
    "endpoints": social_endpoints
})

# Messaging category
messaging_endpoints = []

messaging_endpoints.append({
    "name": "Conversations",
    "path": "/api/messaging/conversations/",
    "operations": [
        op("GET", True, response="Conversations list"),
        op(
            "POST",
            True,
            request={
                "participant_ids": ["uuid1", "uuid2"],
                "initial_message": "Hello!"
            },
            response="Conversation created"
        )
    ]
})

messaging_endpoints.extend([
    {
        "name": "Conversation Messages",
        "path": "/api/messaging/conversations/<conversation_id>/messages/",
        "operations": [op("GET", True, response="Conversation messages", path_params=["conversation_id"], query=["page", "before", "after"])]
    },
    {
        "name": "Send Conversation Message",
        "path": "/api/messaging/conversations/<conversation_id>/messages/",
        "operations": [op("POST", True, request={"message": "Hello there!", "message_type": "text"}, response="Message sent", path_params=["conversation_id"])]
    }
])

categories.append({
    "name": "Messaging",
    "description": "Direct messaging between users.",
    "endpoints": messaging_endpoints
})

# Mobile category
mobile_endpoints = []

mobile_endpoints.append({
    "name": "Mobile Config",
    "path": "/api/mobile/config/",
    "operations": [
        op(
            "GET",
            True,
            response={
                "app_version": "1.0.0",
                "min_supported_version": "1.0.0",
                "features": {
                    "offline_sync": True,
                    "push_notifications": True,
                    "video_streaming": True
                },
                "api_endpoints": {},
                "settings": {}
            }
        )
    ]
})

mobile_endpoints.append({
    "name": "Mobile Home",
    "path": "/api/mobile/home/",
    "operations": [op("GET", True, response={"featured_content": [], "recent_parties": [], "friend_activity": [], "recommendations": []})]
})

mobile_endpoints.append({
    "name": "Mobile Sync",
    "path": "/api/mobile/sync/",
    "operations": [op("GET", True, response="Sync data"), op("POST", True, response="Sync updated")]
})

mobile_endpoints.append({
    "name": "Push Token",
    "path": "/api/mobile/push-token/",
    "operations": [op("POST", True, request={"device_token": "fcm_token", "device_type": "ios"}, response="Token registered")]
})

mobile_endpoints.append({
    "name": "App Info",
    "path": "/api/mobile/app-info/",
    "operations": [op("GET", False, response="Mobile app info")]
})

categories.append({
    "name": "Mobile",
    "description": "Mobile application endpoints for configuration and sync.",
    "endpoints": mobile_endpoints
})

# Admin category
admin_endpoints = []

admin_endpoints.extend([
    {
        "name": "Admin Dashboard",
        "path": "/api/admin/dashboard/",
        "operations": [op("GET", True, response="Admin dashboard", notes="Admin access required")]
    },
    {
        "name": "Admin Analytics",
        "path": "/api/admin/analytics/",
        "operations": [op("GET", True, response="Admin analytics", notes="Admin access required")]
    }
])

admin_endpoints.append({
    "name": "Admin Users",
    "path": "/api/admin/users/",
    "operations": [
        op("GET", True, response="User management list", notes="Admin access required", query=["search", "status", "page"])
    ]
})

admin_endpoints.append({
    "name": "Admin User Detail",
    "path": "/api/admin/users/<user_id>/",
    "operations": [op("GET", True, response="User detail", notes="Admin access required", path_params=["user_id"])]
})

admin_user_actions = [
    ("Suspend User", "/api/admin/users/<user_id>/suspend/", "POST", {"reason": "Terms violation"}),
    ("Unsuspend User", "/api/admin/users/<user_id>/unsuspend/", "POST", None),
    ("Ban User", "/api/admin/users/<user_id>/ban/", "POST", {"reason": "Terms violation", "duration": 86400}),
    ("Unban User", "/api/admin/users/<user_id>/unban/", "POST", None)
]

for name, path, method, request_body in admin_user_actions:
    admin_endpoints.append({
        "name": name,
        "path": path,
        "operations": [op(method, True, request=request_body, response=f"{name} confirmation", notes="Admin access required", path_params=["user_id"])]
    })

admin_endpoints.extend([
    {
        "name": "User Bulk Action",
        "path": "/api/admin/users/bulk-action/",
        "operations": [op("POST", True, response="Bulk action executed", notes="Admin access required")]
    },
    {
        "name": "User Export",
        "path": "/api/admin/users/export/",
        "operations": [op("GET", True, response="User export generated", notes="Admin access required")]
    },
    {
        "name": "User Actions",
        "path": "/api/admin/users/<user_id>/actions/",
        "operations": [op("GET", True, response="User actions log", notes="Admin access required", path_params=["user_id"])]
    }
])

admin_endpoints.extend([
    {
        "name": "Admin Parties",
        "path": "/api/admin/parties/",
        "operations": [op("GET", True, response="Admin party list", notes="Admin access required")]
    },
    {
        "name": "Delete Party",
        "path": "/api/admin/parties/<party_id>/delete/",
        "operations": [op("DELETE", True, response="Party deleted", notes="Admin access required", path_params=["party_id"])]
    }
])

admin_endpoints.extend([
    {
        "name": "Admin Videos",
        "path": "/api/admin/videos/",
        "operations": [op("GET", True, response="Admin video list", notes="Admin access required")]
    },
    {
        "name": "Delete Video",
        "path": "/api/admin/videos/<video_id>/delete/",
        "operations": [op("DELETE", True, response="Video deleted", notes="Admin access required", path_params=["video_id"])]
    }
])

admin_endpoints.extend([
    {
        "name": "Admin Reports",
        "path": "/api/admin/reports/",
        "operations": [op("GET", True, response="Admin reports", notes="Admin access required")]
    },
    {
        "name": "Resolve Admin Report",
        "path": "/api/admin/reports/<report_id>/resolve/",
        "operations": [op("POST", True, request={"action": "approve", "reason": "Content approved"}, response="Report resolved", notes="Admin access required", path_params=["report_id"])]
    }
])

admin_endpoints.extend([
    {
        "name": "System Logs",
        "path": "/api/admin/logs/",
        "operations": [op("GET", True, response="System logs", notes="Admin access required", query=["level", "date_from", "date_to"])]
    },
    {
        "name": "System Health",
        "path": "/api/admin/system-health/",
        "operations": [
            op(
                "GET",
                True,
                response={
                    "status": "healthy",
                    "services": {
                        "database": "healthy",
                        "redis": "healthy",
                        "celery": "healthy",
                        "storage": "healthy"
                    },
                    "metrics": {
                        "cpu_usage": 45.2,
                        "memory_usage": 68.5,
                        "disk_usage": 32.1
                    }
                },
                notes="Admin access required"
            )
        ]
    },
    {
        "name": "Maintenance Mode",
        "path": "/api/admin/maintenance/",
        "operations": [op("POST", True, request={"action": "enable", "message": "Scheduled maintenance"}, response="Maintenance updated", notes="Admin access required")]
    }
])

admin_endpoints.extend([
    {
        "name": "Broadcast Message",
        "path": "/api/admin/broadcast/",
        "operations": [op("POST", True, request={"message": "System maintenance scheduled", "type": "announcement", "target_users": "all"}, response="Broadcast sent", notes="Admin access required")]
    },
    {
        "name": "Send Admin Notification",
        "path": "/api/admin/notifications/send/",
        "operations": [op("POST", True, request={"title": "Important Update", "message": "New features available", "recipients": ["uuid1", "uuid2"]}, response="Notification sent", notes="Admin access required")]
    }
])

admin_endpoints.extend([
    {
        "name": "Admin Settings",
        "path": "/api/admin/settings/",
        "operations": [op("GET", True, response="System settings", notes="Admin access required")]
    },
    {
        "name": "Update Admin Settings",
        "path": "/api/admin/settings/update/",
        "operations": [op("POST", True, request={"setting_key": "max_upload_size", "setting_value": "100MB"}, response="Settings updated", notes="Admin access required")]
    }
])

admin_endpoints.extend([
    {
        "name": "Health Check",
        "path": "/api/admin/health/check/",
        "operations": [op("GET", True, response="Health check", notes="Admin access required")]
    },
    {
        "name": "Health Status",
        "path": "/api/admin/health/status/",
        "operations": [op("GET", True, response="Health status", notes="Admin access required")]
    },
    {
        "name": "Health Metrics",
        "path": "/api/admin/health/metrics/",
        "operations": [op("GET", True, response="System metrics", notes="Admin access required")]
    }
])

categories.append({
    "name": "Admin",
    "description": "Administrative dashboards, moderation actions, system management, and broadcasting.",
    "endpoints": admin_endpoints
})

# Legacy Redirects category
legacy_endpoints = []

legacy_endpoints.extend([
    {
        "name": "Legacy Auth Redirect",
        "path": "/auth/<path:remaining>",
        "operations": [op("GET", False, response="Redirect to /api/auth/", notes="Redirects to new API", path_params=["remaining"])]
    },
    {
        "name": "Legacy Users Redirect",
        "path": "/users/<path:remaining>",
        "operations": [op("GET", False, response="Redirect to /api/users/", notes="Redirects to new API", path_params=["remaining"])]
    },
    {
        "name": "Legacy Videos Redirect",
        "path": "/videos/<path:remaining>",
        "operations": [op("GET", False, response="Redirect to /api/videos/", notes="Redirects to new API", path_params=["remaining"])]
    },
    {
        "name": "Legacy Parties Redirect",
        "path": "/parties/<path:remaining>",
        "operations": [op("GET", False, response="Redirect to /api/parties/", notes="Redirects to new API", path_params=["remaining"])]
    }
])

categories.append({
    "name": "Legacy",
    "description": "Legacy routes maintained for backward compatibility that redirect to the API namespace.",
    "endpoints": legacy_endpoints
})

# Static files category
static_endpoints = [
    {
        "name": "Media Files",
        "path": "/media/",
        "operations": [op("GET", False, response="Media file access", notes="Development only")]
    },
    {
        "name": "Static Files",
        "path": "/static/",
        "operations": [op("GET", False, response="Static asset access", notes="Development only")]
    },
    {
        "name": "Debug Toolbar",
        "path": "/__debug__/",
        "operations": [op("GET", False, response="Django debug toolbar", notes="Development only")]
    }
]

categories.append({
    "name": "Static",
    "description": "Development static and media asset endpoints.",
    "endpoints": static_endpoints
})


data = {
    "metadata": metadata,
    "categories": categories
}

with open("docs/api/backend-endpoints.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)


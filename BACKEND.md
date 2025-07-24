# Watch Party Backend Implementation Guide

# Watch Party Backend Implementation Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Design](#api-design)
3. [Database Schema](#database-schema)
4. [Implementation Details](#implementation-details)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Frontend Integration](#frontend-integration)
8. [Security Considerations](#security-considerations)
9. [Scalability and Performance](#scalability-and-performance)
10. [Error Handling and Logging](#error-handling-and-logging)
11. [Future Enhancements](#future-enhancements)

## Overview

This document provides comprehensive guidance for implementing and integrating a Django backend with SQLAlchemy to support the watch-party frontend application. The backend is built to support 10,000+ concurrent users with real-time synchronization, multi-cloud storage, enhanced security, and comprehensive social features.

## 1. Architecture Overview

### 1.1 Technology Stack

- **Framework**: Django 4.2+ with Django REST Framework
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Real-time**: Django Channels with WebSocket support
- **Caching**: Redis for session storage and caching
- **Task Queue**: Celery with Redis broker
- **Authentication**: JWT tokens with refresh mechanism
- **File Storage**: AWS S3, Google Drive, OneDrive, DropBox, FTP support
- **Video Processing**: FFmpeg for video transcoding
- **Security**: 2FA, OTP, device tracking, session management

### 1.2 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Load Balancer │    │   Django App    │
│   (Next.js)     │◄──►│   (Nginx)       │◄──►│   (Multiple     │
│                 │    │                 │    │   Instances)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                       ┌─────────────────┐             │
                       │   WebSocket     │◄────────────┤
                       │   (Channels)    │             │
                       └─────────────────┘             │
                                                        │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │◄──►│   Redis Cache   │◄──►│   Celery        │
│   (Primary DB)  │    │   (Sessions)    │    │   (Background   │
│                 │    │                 │    │   Tasks)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 1.3 Project Structure

```
watchparty_backend/
├── manage.py
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── watchparty/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   └── production.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── apps/
│   ├── __init__.py
│   ├── authentication/
│   ├── users/
│   ├── parties/
│   ├── videos/
│   ├── social/
│   ├── billing/
│   ├── notifications/
│   └── admin_panel/
├── core/
│   ├── __init__.py
│   ├── models.py
│   ├── permissions.py
│   ├── exceptions.py
│   └── utils.py
└── tests/
    ├── __init__.py
    ├── test_authentication.py
    ├── test_parties.py
    └── test_videos.py
```

## 2. API Design

### 2.1 Enhanced Authentication Endpoints

#### POST /api/auth/register
Register a new user account with enhanced security features.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "acceptTerms": true,
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "web"
  }
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": null,
      "emailVerified": false,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    "tokens": {
      "access": "jwt-access-token",
      "refresh": "jwt-refresh-token"
    },
    "requiresEmailVerification": true
  }
}
```

#### POST /api/auth/login
Enhanced authentication with 2FA support and device tracking.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "web",
    "deviceName": "Chrome on MacOS"
  },
  "twoFactorCode": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://cdn.example.com/avatars/user.jpg",
      "emailVerified": true,
      "twoFactorEnabled": true,
      "subscription": {
        "plan": "premium",
        "status": "active",
        "expiresAt": "2024-12-31T23:59:59Z"
      },
      "preferences": {
        "notifications": {
          "email": true,
          "push": true,
          "sound": true
        },
        "privacy": {
          "profileVisible": true,
          "activityVisible": false
        }
      }
    },
    "tokens": {
      "access": "jwt-access-token",
      "refresh": "jwt-refresh-token"
    },
    "session": {
      "id": "session-uuid",
      "deviceInfo": {
        "platform": "web",
        "deviceName": "Chrome on MacOS"
      },
      "expiresAt": "2024-01-08T00:00:00Z"
    }
  }
}
```

#### POST /api/auth/2fa/setup
Setup two-factor authentication.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "secretKey": "JBSWY3DPEHPK3PXP",
    "backupCodes": [
      "12345678",
      "87654321",
      "13579024"
    ]
  }
}
```

#### POST /api/auth/2fa/verify
Verify and enable two-factor authentication.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "code": "123456"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Two-factor authentication enabled successfully"
}
```

#### POST /api/auth/refresh
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh": "jwt-refresh-token"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "access": "new-jwt-access-token"
  }
}
```

#### POST /api/auth/logout
Enhanced logout with session management.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "allDevices": false
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

### 2.2 Enhanced User Management Endpoints

#### GET /api/users/me
Get comprehensive current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://cdn.example.com/avatars/user.jpg",
    "bio": "Love watching movies with friends!",
    "emailVerified": true,
    "twoFactorEnabled": true,
    "preferences": {
      "notifications": {
        "email": true,
        "push": true,
        "sound": true,
        "partyInvites": true,
        "friendRequests": true
      },
      "privacy": {
        "profileVisible": true,
        "activityVisible": false,
        "onlineStatus": true
      },
      "video": {
        "autoplay": true,
        "quality": "auto",
        "subtitles": "auto"
      }
    },
    "subscription": {
      "plan": "premium",
      "status": "active",
      "expiresAt": "2024-12-31T23:59:59Z",
      "features": {
        "maxPartyParticipants": 50,
        "videoUploadLimit": "unlimited",
        "storageLimit": "100GB"
      }
    },
    "stats": {
      "partiesHosted": 25,
      "partiesJoined": 150,
      "totalWatchTime": 45000,
      "friendsCount": 48,
      "videosUploaded": 12
    },
    "devices": [
      {
        "id": "device-uuid",
        "name": "Chrome on MacOS",
        "platform": "web",
        "lastActive": "2024-01-01T20:00:00Z",
        "isCurrent": true
      }
    ],
    "connectedAccounts": {
      "google": {
        "connected": true,
        "email": "user@gmail.com"
      },
      "microsoft": {
        "connected": false
      },
      "dropbox": {
        "connected": true,
        "email": "user@example.com"
      }
    }
  }
}
```

#### PUT /api/users/me
Update current user profile with enhanced options.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio - Movie enthusiast and watch party host!",
  "preferences": {
    "notifications": {
      "email": false,
      "push": true,
      "sound": false,
      "partyInvites": true,
      "friendRequests": true
    },
    "privacy": {
      "profileVisible": true,
      "activityVisible": true,
      "onlineStatus": false
    },
    "video": {
      "autoplay": false,
      "quality": "1080p",
      "subtitles": "off"
    }
  }
}
```

### 2.3 Enhanced Watch Party Endpoints

#### GET /api/parties
Get user's watch parties with advanced filtering and search.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `status`: Filter by status (scheduled, active, paused, completed, cancelled)
- `role`: Filter by user role (host, participant, moderator)
- `search`: Search by title or description
- `category`: Filter by video category
- `startDate`: Filter by scheduled start date (ISO 8601)
- `endDate`: Filter by scheduled end date (ISO 8601)
- `sortBy`: Sort by (createdAt, scheduledAt, participantCount, title)
- `sortOrder`: Sort order (asc, desc)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "parties": [
      {
        "id": "uuid-string",
        "title": "Movie Night: The Matrix Trilogy",
        "description": "Classic sci-fi movie marathon night",
        "status": "active",
        "roomId": "room-uuid-string",
        "inviteCode": "MATRIX2024",
        "scheduledAt": "2024-01-01T20:00:00Z",
        "startedAt": "2024-01-01T20:05:00Z",
        "createdAt": "2024-01-01T10:00:00Z",
        "host": {
          "id": "uuid-string",
          "username": "johndoe",
          "avatar": "https://cdn.example.com/avatars/user.jpg",
          "isOnline": true
        },
        "participants": [
          {
            "id": "uuid-string",
            "username": "janedoe",
            "avatar": "https://cdn.example.com/avatars/user2.jpg",
            "joinedAt": "2024-01-01T19:45:00Z",
            "role": "participant",
            "isOnline": true
          }
        ],
        "video": {
          "id": "uuid-string",
          "title": "The Matrix",
          "thumbnail": "https://cdn.example.com/thumbnails/matrix.jpg",
          "duration": 8160,
          "category": "Action"
        },
        "currentState": {
          "currentTime": 1500,
          "isPlaying": true,
          "lastUpdated": "2024-01-01T20:30:00Z"
        },
        "settings": {
          "maxParticipants": 25,
          "requireApproval": false,
          "allowChat": true,
          "allowReactions": true,
          "allowScreenShare": true,
          "isPrivate": false,
          "passwordProtected": false
        },
        "stats": {
          "participantCount": 8,
          "messagesCount": 247,
          "reactionsCount": 89
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "availableStatuses": ["scheduled", "active", "completed"],
      "availableCategories": ["Action", "Comedy", "Drama", "Horror"]
    }
  }
}
```

#### POST /api/parties
Create a new watch party.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
\`\`\`json
{
  "title": "Movie Night: The Matrix",
  "description": "Classic sci-fi movie night",
  "videoId": "uuid",
  "scheduledAt": "2024-01-01T20:00:00Z",
  "settings": {
    "maxParticipants": 10,
    "requireApproval": false,
    "allowChat": true,
    "allowReactions": true,
    "isPrivate": false
  },
  "invitedFriends": ["uuid1", "uuid2"]
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "success": true,
  "data": {
    "party": {
      "id": "uuid",
      "title": "Movie Night: The Matrix",
      "description": "Classic sci-fi movie night",
      "status": "scheduled",
      "roomId": "room_uuid",
      "inviteCode": "ABC123",
      "scheduledAt": "2024-01-01T20:00:00Z",
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
}
\`\`\`

#### GET /api/parties/:id
Get specific watch party details.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "party": {
      "id": "uuid",
      "title": "Movie Night: The Matrix",
      "description": "Classic sci-fi movie night",
      "status": "active",
      "roomId": "room_uuid",
      "inviteCode": "ABC123",
      "scheduledAt": "2024-01-01T20:00:00Z",
      "host": {
        "id": "uuid",
        "username": "johndoe",
        "avatar": "https://example.com/avatar.jpg"
      },
      "participants": [],
      "video": {
        "id": "uuid",
        "title": "The Matrix",
        "url": "https://streaming.example.com/matrix.m3u8",
        "thumbnail": "https://example.com/thumbnail.jpg",
        "duration": 8160
      },
      "playbackState": {
        "currentTime": 1250,
        "isPlaying": true,
        "lastUpdated": "2024-01-01T20:30:00Z"
      }
    }
  }
}
\`\`\`

#### POST /api/parties/:id/join
Join a watch party.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
\`\`\`json
{
  "inviteCode": "ABC123"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Successfully joined the party",
  "data": {
    "roomId": "room_uuid",
    "websocketUrl": "wss://api.example.com/ws/party/room_uuid"
  }
}
\`\`\`

### 1.4 Video Management Endpoints

#### GET /api/videos
Get user's video library.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `search`: Search query
- `category`: Filter by category
- `sortBy`: Sort by (title, createdAt, duration)

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "videos": [
      {
        "id": "uuid",
        "title": "The Matrix",
        "description": "A computer hacker learns from mysterious rebels about the true nature of his reality.",
        "thumbnail": "https://example.com/thumbnail.jpg",
        "duration": 8160,
        "category": "Action",
        "uploadedAt": "2024-01-01T10:00:00Z",
        "uploadedBy": {
          "id": "uuid",
          "username": "johndoe"
        },
        "metadata": {
          "resolution": "1080p",
          "fileSize": "2.5GB",
          "format": "mp4"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
\`\`\`

#### POST /api/videos/upload
Upload a new video file.

**Headers:** 
- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
- `file`: Video file
- `title`: Video title
- `description`: Video description
- `category`: Video category
- `isPrivate`: Boolean (default: false)

**Response (201):**
\`\`\`json
{
  "success": true,
  "data": {
    "video": {
      "id": "uuid",
      "title": "My Video",
      "uploadStatus": "processing",
      "uploadProgress": 0
    }
  }
}
\`\`\`

### 1.5 Friends & Social Endpoints

#### GET /api/friends
Get user's friends list.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "friends": [
      {
        "id": "uuid",
        "username": "janedoe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "online",
        "lastSeen": "2024-01-01T20:00:00Z",
        "mutualFriends": 5,
        "friendsSince": "2023-06-15T10:00:00Z"
      }
    ]
  }
}
\`\`\`

#### GET /api/friends/requests
Get pending friend requests.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "received": [
      {
        "id": "uuid",
        "from": {
          "id": "uuid",
          "username": "newuser",
          "avatar": "https://example.com/avatar.jpg"
        },
        "sentAt": "2024-01-01T15:00:00Z",
        "message": "Hey! Let's watch movies together!"
      }
    ],
    "sent": [
      {
        "id": "uuid",
        "to": {
          "id": "uuid",
          "username": "moviefan",
          "avatar": "https://example.com/avatar.jpg"
        },
        "sentAt": "2024-01-01T14:00:00Z"
      }
    ]
  }
}
\`\`\`

### 1.6 Real-time WebSocket Events

#### Connection URL: `wss://api.example.com/ws/party/:roomId`

**Authentication:** Send JWT token in connection headers or as query parameter.

**Event Types:**

##### party.sync
Synchronize playback state across all participants.
\`\`\`json
{
  "type": "party.sync",
  "data": {
    "currentTime": 1250.5,
    "isPlaying": true,
    "timestamp": "2024-01-01T20:30:00Z"
  }
}
\`\`\`

##### party.chat
Chat message in the party.
\`\`\`json
{
  "type": "party.chat",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "message": "Great movie!",
    "timestamp": "2024-01-01T20:30:00Z",
    "reactions": []
  }
}
\`\`\`

##### party.reaction
User reaction to video moment.
\`\`\`json
{
  "type": "party.reaction",
  "data": {
    "userId": "uuid",
    "username": "johndoe",
    "reaction": "😂",
    "timestamp": "2024-01-01T20:30:00Z",
    "videoTime": 1250.5
  }
}
\`\`\`

### 1.7 Admin Endpoints

#### GET /api/admin/users
Get all users (admin only).

**Headers:** `Authorization: Bearer <admin_access_token>`

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search query
- `status`: Filter by status (active, suspended, banned)

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "username": "johndoe",
        "status": "active",
        "subscription": "premium",
        "createdAt": "2024-01-01T10:00:00Z",
        "lastActivity": "2024-01-01T20:00:00Z",
        "stats": {
          "partiesHosted": 25,
          "partiesJoined": 150,
          "totalWatchTime": 45000
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 1000,
      "pages": 20
    }
  }
}
\`\`\`

## 3. Database Schema

### 3.1 Complete SQLAlchemy Models

```python
# core/models.py
from sqlalchemy import create_engine, Column, String, Integer, DateTime, Boolean, Text, ForeignKey, JSON, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    avatar_url = Column(String(500))
    bio = Column(Text)
    is_active = Column(Boolean, default=True)
    is_staff = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(32))
    backup_codes = Column(JSON, default=list)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    hosted_parties = relationship("Party", back_populates="host")
    uploaded_videos = relationship("Video", back_populates="uploaded_by")
    subscriptions = relationship("Subscription", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")

class UserSession(Base):
    __tablename__ = 'user_sessions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    refresh_token_hash = Column(String(255), nullable=False)
    device_info = Column(JSON, default=dict)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    revoked_at = Column(DateTime)
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class Video(Base):
    __tablename__ = 'videos'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    video_url = Column(String(500), nullable=False)
    thumbnail_url = Column(String(500))
    duration = Column(Integer)  # in seconds
    file_size = Column(Integer)  # in bytes
    category = Column(String(50))
    upload_progress = Column(Integer, default=0)
    processing_status = Column(String(20), default='pending')  # pending, processing, completed, failed
    uploaded_by_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    is_public = Column(Boolean, default=True)
    view_count = Column(Integer, default=0)
    metadata = Column(JSON, default=dict)  # resolution, format, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    uploaded_by = relationship("User", back_populates="uploaded_videos")
    parties = relationship("Party", back_populates="video")

class CloudStorage(Base):
    __tablename__ = 'cloud_storage'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    provider = Column(String(50), nullable=False)  # google_drive, onedrive, dropbox, ftp
    provider_user_id = Column(String(255))
    access_token = Column(Text)  # encrypted
    refresh_token = Column(Text)  # encrypted
    credentials = Column(JSON, default=dict)  # encrypted provider-specific data
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")

class Party(Base):
    __tablename__ = 'parties'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    room_id = Column(String(100), unique=True, nullable=False, index=True)
    invite_code = Column(String(20), unique=True)
    password_hash = Column(String(255))  # for password-protected parties
    host_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    video_id = Column(UUID(as_uuid=True), ForeignKey('videos.id'), nullable=False)
    status = Column(String(20), default='scheduled')  # scheduled, active, paused, ended
    current_time = Column(Float, default=0.0)  # current playback time in seconds
    is_playing = Column(Boolean, default=False)
    last_sync_at = Column(DateTime, default=datetime.utcnow)
    scheduled_at = Column(DateTime, nullable=False)
    started_at = Column(DateTime)
    ended_at = Column(DateTime)
    settings = Column(JSON, default=dict)  # max_participants, allow_chat, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    host = relationship("User", back_populates="hosted_parties")
    video = relationship("Video", back_populates="parties")
    participants = relationship("PartyParticipant", back_populates="party")
    chat_messages = relationship("ChatMessage", back_populates="party")

class PartyParticipant(Base):
    __tablename__ = 'party_participants'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    party_id = Column(UUID(as_uuid=True), ForeignKey('parties.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    role = Column(String(20), default='participant')  # host, moderator, participant
    joined_at = Column(DateTime, default=datetime.utcnow)
    left_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    party = relationship("Party", back_populates="participants")
    user = relationship("User")

class ChatMessage(Base):
    __tablename__ = 'chat_messages'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    party_id = Column(UUID(as_uuid=True), ForeignKey('parties.id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    message = Column(Text, nullable=False)
    message_type = Column(String(20), default='text')  # text, reaction, system
    reply_to_id = Column(UUID(as_uuid=True), ForeignKey('chat_messages.id'))
    reactions = Column(JSON, default=list)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_deleted = Column(Boolean, default=False)
    
    # Relationships
    party = relationship("Party", back_populates="chat_messages")
    user = relationship("User")
    reply_to = relationship("ChatMessage", remote_side=[id])

class Friendship(Base):
    __tablename__ = 'friendships'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    addressee_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    status = Column(String(20), default='pending')  # pending, accepted, blocked
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    requester = relationship("User", foreign_keys=[requester_id])
    addressee = relationship("User", foreign_keys=[addressee_id])

class Subscription(Base):
    __tablename__ = 'subscriptions'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    plan = Column(String(50), nullable=False)  # free, premium, enterprise
    status = Column(String(20), default='active')  # active, cancelled, expired
    stripe_subscription_id = Column(String(100))
    current_period_start = Column(DateTime)
    current_period_end = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")

class Notification(Base):
    __tablename__ = 'notifications'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # party_invite, friend_request, system
    data = Column(JSON, default=dict)  # additional notification data
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")

class Analytics(Base):
    __tablename__ = 'analytics'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    party_id = Column(UUID(as_uuid=True), ForeignKey('parties.id'))
    video_id = Column(UUID(as_uuid=True), ForeignKey('videos.id'))
    event_type = Column(String(50), nullable=False)  # view, play, pause, join, etc.
    event_data = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    
    # Relationships
    user = relationship("User")
    party = relationship("Party")
    video = relationship("Video")
```

### 2.2 Video Management Tables

\`\`\`sql
-- Videos table
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT,
    duration INTEGER, -- in seconds
    file_size BIGINT,
    format VARCHAR(10),
    resolution VARCHAR(10),
    category VARCHAR(50),
    is_private BOOLEAN DEFAULT FALSE,
    processing_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
    upload_progress INTEGER DEFAULT 0,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_videos_uploaded_by (uploaded_by),
    INDEX idx_videos_category (category),
    INDEX idx_videos_created_at (created_at)
);

-- Video access permissions
CREATE TABLE video_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_type VARCHAR(20) NOT NULL, -- view, edit, admin
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(video_id, user_id),
    INDEX idx_video_permissions_video_id (video_id),
    INDEX idx_video_permissions_user_id (user_id)
);
\`\`\`

### 2.3 Watch Party Tables

\`\`\`sql
-- Watch parties
CREATE TABLE parties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    room_id VARCHAR(50) UNIQUE NOT NULL,
    invite_code VARCHAR(10) UNIQUE,
    host_id UUID NOT NULL REFERENCES users(id),
    video_id UUID REFERENCES videos(id),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, active, paused, completed, cancelled
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    ended_at TIMESTAMP WITH TIME ZONE,
    settings JSONB DEFAULT '{}',
    playback_state JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_parties_host_id (host_id),
    INDEX idx_parties_status (status),
    INDEX idx_parties_scheduled_at (scheduled_at),
    INDEX idx_parties_room_id (room_id)
);

-- Party participants
CREATE TABLE party_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    role VARCHAR(20) DEFAULT 'participant', -- host, moderator, participant
    is_active BOOLEAN DEFAULT TRUE,
    
    UNIQUE(party_id, user_id),
    INDEX idx_party_participants_party_id (party_id),
    INDEX idx_party_participants_user_id (user_id)
);

-- Chat messages
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    party_id UUID NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, emoji, system
    reply_to UUID REFERENCES chat_messages(id),
    reactions JSONB DEFAULT '[]',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_chat_messages_party_id (party_id),
    INDEX idx_chat_messages_user_id (user_id),
    INDEX idx_chat_messages_created_at (created_at)
);
\`\`\`

### 2.4 Social Features Tables

\`\`\`sql
-- Friendships
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    responded_at TIMESTAMP WITH TIME ZONE,
    message TEXT,
    
    UNIQUE(requester_id, addressee_id),
    INDEX idx_friendships_requester_id (requester_id),
    INDEX idx_friendships_addressee_id (addressee_id),
    INDEX idx_friendships_status (status),
    
    CONSTRAINT friendships_no_self_friend CHECK (requester_id != addressee_id)
);

-- User activity feed
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- party_created, party_joined, video_uploaded, etc.
    activity_data JSONB DEFAULT '{}',
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_activities_user_id (user_id),
    INDEX idx_activities_type (activity_type),
    INDEX idx_activities_created_at (created_at)
);
\`\`\`

### 2.5 Subscription & Billing Tables

\`\`\`sql
-- Subscription plans
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB DEFAULT '{}',
    limits JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(name)
);

-- User subscriptions
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active', -- active, cancelled, expired, suspended
    billing_cycle VARCHAR(20), -- monthly, yearly
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    stripe_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_user_subscriptions_user_id (user_id),
    INDEX idx_user_subscriptions_status (status)
);

-- Payment history
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    subscription_id UUID REFERENCES user_subscriptions(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, failed, refunded
    payment_method VARCHAR(50),
    stripe_payment_intent_id VARCHAR(255),
    invoice_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_payments_user_id (user_id),
    INDEX idx_payments_status (status),
    INDEX idx_payments_created_at (created_at)
);
\`\`\`

### 2.6 Admin & Analytics Tables

\`\`\`sql
-- System logs
CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level VARCHAR(20) NOT NULL, -- debug, info, warning, error, critical
    message TEXT NOT NULL,
    module VARCHAR(100),
    user_id UUID REFERENCES users(id),
    request_id VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    INDEX idx_system_logs_level (level),
    INDEX idx_system_logs_created_at (created_at),
    INDEX idx_system_logs_user_id (user_id)
);

-- User analytics
CREATE TABLE user_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    parties_hosted INTEGER DEFAULT 0,
    parties_joined INTEGER DEFAULT 0,
    watch_time_minutes INTEGER DEFAULT 0,
    messages_sent INTEGER DEFAULT 0,
    reactions_sent INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(user_id, date),
    INDEX idx_user_analytics_user_id (user_id),
    INDEX idx_user_analytics_date (date)
);
\`\`\`

## 4. Implementation Details

### 4.1 Enhanced Django Project Structure

```
watchparty_backend/
├── manage.py
├── requirements.txt
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── watchparty/
│   ├── __init__.py
│   ├── settings/
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── development.py
│   │   ├── production.py
│   │   └── testing.py
│   ├── urls.py
│   ├── wsgi.py
│   ├── asgi.py
│   ├── celery.py
│   └── routing.py
├── apps/
│   ├── __init__.py
│   ├── authentication/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── utils.py
│   │   ├── permissions.py
│   │   └── tasks.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── utils.py
│   ├── parties/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── consumers.py
│   │   └── tasks.py
│   ├── videos/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── tasks.py
│   │   └── storage.py
│   ├── social/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── utils.py
│   ├── billing/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── webhooks.py
│   │   └── stripe_utils.py
│   ├── notifications/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── consumers.py
│   │   └── tasks.py
│   ├── analytics/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tasks.py
│   ├── integrations/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   ├── google_drive.py
│   │   ├── onedrive.py
│   │   ├── dropbox.py
│   │   └── ftp.py
│   └── admin_panel/
│       ├── __init__.py
│       ├── models.py
│       ├── serializers.py
│       ├── views.py
│       └── urls.py
├── core/
│   ├── __init__.py
│   ├── permissions.py
│   ├── pagination.py
│   ├── exceptions.py
│   ├── middleware.py
│   ├── utils.py
│   ├── validators.py
│   └── cache.py
├── utils/
│   ├── __init__.py
│   ├── email_service.py
│   ├── sms_service.py
│   ├── encryption.py
│   └── video_processing.py
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_authentication.py
    ├── test_parties.py
    ├── test_videos.py
    ├── test_social.py
    ├── test_billing.py
    └── test_integrations.py
```

### 4.2 Django Settings Configuration

```python
# watchparty/settings/base.py
import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Security Settings
SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = False
ALLOWED_HOSTS = []

# Django Apps
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'channels',
    'celery',
    'django_extensions',
    'django_filters',
    'drf_spectacular',
]

LOCAL_APPS = [
    'apps.authentication',
    'apps.users',
    'apps.parties',
    'apps.videos',
    'apps.social',
    'apps.billing',
    'apps.notifications',
    'apps.analytics',
    'apps.integrations',
    'apps.admin_panel',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Middleware
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'core.middleware.JWTAuthenticationMiddleware',
    'core.middleware.UserActivityMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'watchparty.urls'

# Database Configuration
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME', 'watchparty'),
        'USER': os.environ.get('DB_USER', 'postgres'),
        'PASSWORD': os.environ.get('DB_PASSWORD', ''),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# Cache Configuration
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': os.environ.get('REDIS_URL', 'redis://localhost:6379/1'),
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'core.pagination.CustomPageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

# JWT Configuration
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
}

# Celery Configuration
CELERY_BROKER_URL = os.environ.get('CELERY_BROKER_URL', 'redis://localhost:6379/2')
CELERY_RESULT_BACKEND = os.environ.get('CELERY_RESULT_BACKEND', 'redis://localhost:6379/2')
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'UTC'

# Channels Configuration
ASGI_APPLICATION = 'watchparty.asgi.application'
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [os.environ.get('REDIS_URL', 'redis://localhost:6379/3')],
        },
    },
}

# File Storage Configuration
DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'
STATICFILES_STORAGE = 'django.contrib.staticfiles.storage.StaticFilesStorage'

# AWS S3 Configuration
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-west-2')
AWS_DEFAULT_ACL = None
AWS_S3_CUSTOM_DOMAIN = f'{AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com'

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL')

# Stripe Configuration
STRIPE_PUBLISHABLE_KEY = os.environ.get('STRIPE_PUBLISHABLE_KEY')
STRIPE_SECRET_KEY = os.environ.get('STRIPE_SECRET_KEY')
STRIPE_WEBHOOK_SECRET = os.environ.get('STRIPE_WEBHOOK_SECRET')

# Two-Factor Authentication
OTP_TOTP_ISSUER = 'WatchParty'
OTP_TOTP_PERIOD = 30

# Video Processing
VIDEO_UPLOAD_PATH = 'videos/'
VIDEO_THUMBNAIL_PATH = 'thumbnails/'
MAX_VIDEO_FILE_SIZE = 500 * 1024 * 1024  # 500MB
SUPPORTED_VIDEO_FORMATS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm']

# Security Settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
CORS_ALLOW_CREDENTIALS = True

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'django.log',
            'formatter': 'verbose',
        },
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
}
```

### 4.3 WebSocket Implementation

```python
# apps/parties/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from .models import Party, PartyParticipant, ChatMessage

User = get_user_model()

class PartyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'party_{self.room_id}'
        
        # Authenticate user
        token = self.scope['query_string'].decode().split('token=')[1] if 'token=' in self.scope['query_string'].decode() else None
        
        if not token:
            await self.close()
            return
            
        try:
            access_token = AccessToken(token)
            user_id = access_token['user_id']
            self.user = await self.get_user(user_id)
        except Exception:
            await self.close()
            return
        
        # Check if user is participant
        is_participant = await self.check_participant()
        if not is_participant:
            await self.close()
            return
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        
        # Notify others that user joined
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'user_joined',
                'user_id': str(self.user.id),
                'username': self.user.username,
                'avatar': self.user.avatar_url,
            }
        )
    
    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        
        # Notify others that user left
        if hasattr(self, 'user'):
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_left',
                    'user_id': str(self.user.id),
                    'username': self.user.username,
                }
            )
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        
        if message_type == 'video_sync':
            await self.handle_video_sync(data)
        elif message_type == 'chat_message':
            await self.handle_chat_message(data)
        elif message_type == 'reaction':
            await self.handle_reaction(data)
    
    async def handle_video_sync(self, data):
        # Update party playback state
        await self.update_party_state(data)
        
        # Broadcast to all participants
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'video_sync',
                'current_time': data['current_time'],
                'is_playing': data['is_playing'],
                'user_id': str(self.user.id),
                'timestamp': data.get('timestamp'),
            }
        )
    
    async def handle_chat_message(self, data):
        # Save message to database
        message = await self.save_chat_message(data['message'])
        
        # Broadcast to all participants
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'chat_message',
                'message_id': str(message.id),
                'message': message.message,
                'user_id': str(self.user.id),
                'username': self.user.username,
                'avatar': self.user.avatar_url,
                'timestamp': message.timestamp.isoformat(),
            }
        )
    
    async def handle_reaction(self, data):
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                'type': 'reaction',
                'reaction': data['reaction'],
                'user_id': str(self.user.id),
                'username': self.user.username,
                'video_time': data.get('video_time'),
                'timestamp': data.get('timestamp'),
            }
        )
    
    # WebSocket message handlers
    async def video_sync(self, event):
        await self.send(text_data=json.dumps({
            'type': 'video_sync',
            'data': event
        }))
    
    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'data': event
        }))
    
    async def reaction(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction',
            'data': event
        }))
    
    async def user_joined(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'data': event
        }))
    
    async def user_left(self, event):
        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'data': event
        }))
    
    # Database operations
    @database_sync_to_async
    def get_user(self, user_id):
        return User.objects.get(id=user_id)
    
    @database_sync_to_async
    def check_participant(self):
        return PartyParticipant.objects.filter(
            party__room_id=self.room_id,
            user=self.user,
            is_active=True
        ).exists()
    
    @database_sync_to_async
    def update_party_state(self, data):
        party = Party.objects.get(room_id=self.room_id)
        party.current_time = data['current_time']
        party.is_playing = data['is_playing']
        party.last_sync_at = timezone.now()
        party.save()
        return party
    
    @database_sync_to_async
    def save_chat_message(self, message_text):
        party = Party.objects.get(room_id=self.room_id)
        message = ChatMessage.objects.create(
            party=party,
            user=self.user,
            message=message_text
        )
        return message
```

## 5. Testing

### 5.1 Test Configuration

```python
# tests/conftest.py
import pytest
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
from apps.parties.models import Party
from apps.videos.models import Video

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def user():
    return User.objects.create_user(
        email='test@example.com',
        username='testuser',
        password='testpass123',
        first_name='Test',
        last_name='User'
    )

@pytest.fixture
def authenticated_client(api_client, user):
    refresh = RefreshToken.for_user(user)
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {refresh.access_token}')
    return api_client

@pytest.fixture
def video(user):
    return Video.objects.create(
        title='Test Video',
        description='A test video',
        video_url='https://example.com/video.mp4',
        uploaded_by=user
    )

@pytest.fixture
def party(user, video):
    return Party.objects.create(
        title='Test Party',
        description='A test party',
        room_id='test-room-123',
        host=user,
        video=video,
        scheduled_at=timezone.now() + timedelta(hours=1)
    )
```

### 5.2 Authentication Tests

```python
# tests/test_authentication.py
import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class TestAuthentication:
    
    def test_user_registration(self, api_client):
        url = reverse('auth:register')
        data = {
            'email': 'newuser@example.com',
            'username': 'newuser',
            'password': 'securepass123',
            'firstName': 'New',
            'lastName': 'User',
            'acceptTerms': True
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_201_CREATED
        assert 'tokens' in response.data['data']
        assert 'access' in response.data['data']['tokens']
        assert 'refresh' in response.data['data']['tokens']
        
        # Verify user was created
        user = User.objects.get(email='newuser@example.com')
        assert user.username == 'newuser'
        assert user.first_name == 'New'
        assert not user.is_verified
    
    def test_user_login(self, api_client, user):
        url = reverse('auth:login')
        data = {
            'email': user.email,
            'password': 'testpass123'
        }
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'tokens' in response.data['data']
        assert response.data['data']['user']['username'] == user.username
    
    def test_token_refresh(self, api_client, user):
        refresh = RefreshToken.for_user(user)
        url = reverse('auth:refresh')
        data = {'refresh': str(refresh)}
        
        response = api_client.post(url, data, format='json')
        
        assert response.status_code == status.HTTP_200_OK
        assert 'access' in response.data['data']
    
    def test_2fa_setup(self, authenticated_client):
        url = reverse('auth:2fa-setup')
        
        response = authenticated_client.post(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert 'qrCode' in response.data['data']
        assert 'secretKey' in response.data['data']
        assert 'backupCodes' in response.data['data']
```

## 6. Deployment

### 6.1 Docker Configuration

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    build-essential \
    libpq-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser
RUN chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "watchparty.wsgi:application"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: watchparty
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  web:
    build: .
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DEBUG=1
      - DB_HOST=db
      - REDIS_URL=redis://redis:6379

  celery:
    build: .
    command: celery -A watchparty worker -l info
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
    environment:
      - DB_HOST=db
      - CELERY_BROKER_URL=redis://redis:6379/2

volumes:
  postgres_data:
```

## 7. Frontend Integration

### 7.1 API Client Configuration

```typescript
// Frontend API client configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
export const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export const API_ENDPOINTS = {
  // Authentication
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    twoFactorSetup: '/auth/2fa/setup',
    twoFactorVerify: '/auth/2fa/verify',
  },
  
  // Users
  users: {
    me: '/users/me',
    updateProfile: '/users/me',
    sessions: '/users/sessions',
  },
  
  // Parties
  parties: {
    list: '/parties',
    create: '/parties',
    detail: (id: string) => `/parties/${id}`,
    join: (id: string) => `/parties/${id}/join`,
    leave: (id: string) => `/parties/${id}/leave`,
  },
  
  // Videos
  videos: {
    list: '/videos',
    upload: '/videos/upload',
    detail: (id: string) => `/videos/${id}`,
    stream: (id: string) => `/videos/${id}/stream`,
  },
  
  // WebSocket
  websocket: {
    party: (roomId: string) => `/party/${roomId}`,
    notifications: '/notifications',
  }
};
```

## 8. Security Considerations

### 8.1 Authentication Security

```python
# apps/authentication/utils.py
import pyotp
import qrcode
import io
import base64
from cryptography.fernet import Fernet
from django.conf import settings

class TwoFactorAuth:
    @staticmethod
    def generate_secret():
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(user, secret):
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=user.email,
            issuer_name=settings.OTP_TOTP_ISSUER
        )
        
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
    
    @staticmethod
    def verify_token(secret, token):
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)
    
    @staticmethod
    def generate_backup_codes():
        import secrets
        return [secrets.token_hex(4).upper() for _ in range(8)]

class EncryptionService:
    def __init__(self):
        self.key = settings.ENCRYPTION_KEY.encode()
        self.cipher = Fernet(self.key)
    
    def encrypt(self, data: str) -> str:
        return self.cipher.encrypt(data.encode()).decode()
    
    def decrypt(self, encrypted_data: str) -> str:
        return self.cipher.decrypt(encrypted_data.encode()).decode()
```

## 9. Scalability and Performance

### 9.1 Database Optimization

```python
# core/managers.py
from django.db import models

class PartyManager(models.Manager):
    def active_parties(self):
        return self.filter(status='active').select_related('host', 'video').prefetch_related('participants__user')
    
    def with_participant_count(self):
        return self.annotate(
            participant_count=models.Count('participants', filter=models.Q(participants__is_active=True))
        )

class VideoManager(models.Manager):
    def public_videos(self):
        return self.filter(is_public=True, processing_status='completed')
    
    def with_view_stats(self):
        return self.annotate(
            total_views=models.Sum('analytics__view_count')
        )
```

## 10. Error Handling and Logging

### 10.1 Custom Exception Handling

```python
# core/exceptions.py
from rest_framework.views import exception_handler
from rest_framework import status
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        custom_response_data = {
            'success': False,
            'error': {
                'message': str(exc),
                'code': response.status_code,
                'details': response.data if isinstance(response.data, dict) else {'detail': response.data}
            }
        }
        
        # Log the error
        logger.error(f"API Error: {exc}", extra={
            'request': context['request'],
            'view': context['view'],
            'status_code': response.status_code
        })
        
        response.data = custom_response_data
    
    return response

class BusinessLogicError(Exception):
    def __init__(self, message, code=None):
        self.message = message
        self.code = code
        super().__init__(self.message)

class PartyFullError(BusinessLogicError):
    def __init__(self):
        super().__init__("Party is full", "PARTY_FULL")
```

## 11. Future Enhancements

### 11.1 Microservices Architecture

```python
# Future microservices structure
services = {
    'user_service': {
        'responsibilities': ['Authentication', 'User Management', 'Profiles'],
        'database': 'PostgreSQL',
        'apis': ['REST', 'GraphQL']
    },
    'video_service': {
        'responsibilities': ['Video Upload', 'Processing', 'Streaming'],
        'database': 'PostgreSQL + S3',
        'apis': ['REST', 'gRPC']
    },
    'party_service': {
        'responsibilities': ['Party Management', 'Real-time Sync'],
        'database': 'PostgreSQL + Redis',
        'apis': ['REST', 'WebSocket']
    },
    'analytics_service': {
        'responsibilities': ['Usage Analytics', 'Business Intelligence'],
        'database': 'ClickHouse + Redis',
        'apis': ['REST', 'GraphQL']
    }
}
```

---

**Ready to build a scalable, secure, and feature-rich watch party backend! 🚀**

*This implementation guide provides everything needed to create a production-ready backend that can handle 10,000+ concurrent users with real-time synchronization, advanced security, and comprehensive social features.*
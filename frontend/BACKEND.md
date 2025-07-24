# Watch Party Backend Implementation Guide

## Table of Contents
1. [API Design](#api-design)
2. [Database Schema](#database-schema)
3. [Implementation Details](#implementation-details)
4. [Testing](#testing)
5. [Deployment](#deployment)
6. [Frontend Integration](#frontend-integration)
7. [Security Considerations](#security-considerations)
8. [Scalability and Performance](#scalability-and-performance)
9. [Error Handling and Logging](#error-handling-and-logging)
10. [Future Enhancements](#future-enhancements)

## Overview

This document outlines the backend architecture and implementation requirements for the Watch Party application. The backend is built using Django with SQLAlchemy for ORM, providing RESTful APIs to support the React frontend functionality.

## 1. API Design

### 1.1 Authentication Endpoints

#### POST /api/auth/register
Register a new user account.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "username": "johndoe"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "avatar": null,
      "createdAt": "2024-01-01T12:00:00Z"
    },
    "tokens": {
      "access": "jwt_access_token",
      "refresh": "jwt_refresh_token"
    }
  }
}
\`\`\`

#### POST /api/auth/login
Authenticate user and return JWT tokens.

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "securepassword"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "username": "johndoe",
      "avatar": "https://example.com/avatar.jpg",
      "subscription": {
        "plan": "premium",
        "status": "active",
        "expiresAt": "2024-12-31T23:59:59Z"
      }
    },
    "tokens": {
      "access": "jwt_access_token",
      "refresh": "jwt_refresh_token"
    }
  }
}
\`\`\`

#### POST /api/auth/refresh
Refresh JWT access token.

**Request Body:**
\`\`\`json
{
  "refresh": "jwt_refresh_token"
}
\`\`\`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "access": "new_jwt_access_token"
  }
}
\`\`\`

#### POST /api/auth/logout
Invalidate user session and tokens.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
\`\`\`json
{
  "success": true,
  "message": "Successfully logged out"
}
\`\`\`

### 1.2 User Management Endpoints

#### GET /api/users/me
Get current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Love watching movies with friends!",
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
    },
    "subscription": {
      "plan": "premium",
      "status": "active",
      "expiresAt": "2024-12-31T23:59:59Z"
    },
    "stats": {
      "partiesHosted": 25,
      "partiesJoined": 150,
      "totalWatchTime": 45000
    }
  }
}
\`\`\`

#### PUT /api/users/me
Update current user profile.

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
\`\`\`json
{
  "firstName": "John",
  "lastName": "Doe",
  "bio": "Updated bio",
  "preferences": {
    "notifications": {
      "email": false,
      "push": true,
      "sound": false
    }
  }
}
\`\`\`

### 1.3 Watch Party Endpoints

#### GET /api/parties
Get user's watch parties with pagination and filtering.

**Headers:** `Authorization: Bearer <access_token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)
- `status`: Filter by status (active, upcoming, completed)
- `role`: Filter by user role (host, participant)

**Response (200):**
\`\`\`json
{
  "success": true,
  "data": {
    "parties": [
      {
        "id": "uuid",
        "title": "Movie Night: The Matrix",
        "description": "Classic sci-fi movie night",
        "status": "active",
        "scheduledAt": "2024-01-01T20:00:00Z",
        "createdAt": "2024-01-01T10:00:00Z",
        "host": {
          "id": "uuid",
          "username": "johndoe",
          "avatar": "https://example.com/avatar.jpg"
        },
        "participants": [
          {
            "id": "uuid",
            "username": "janedoe",
            "avatar": "https://example.com/avatar2.jpg",
            "joinedAt": "2024-01-01T19:45:00Z"
          }
        ],
        "video": {
          "id": "uuid",
          "title": "The Matrix",
          "thumbnail": "https://example.com/thumbnail.jpg",
          "duration": 8160
        },
        "settings": {
          "maxParticipants": 10,
          "requireApproval": false,
          "allowChat": true,
          "allowReactions": true
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "pages": 3
    }
  }
}
\`\`\`

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

## 2. Database Schema

### 2.1 User Management Tables

\`\`\`sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    bio TEXT,
    status VARCHAR(20) DEFAULT 'active', -- active, suspended, banned
    email_verified BOOLEAN DEFAULT FALSE,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT users_username_check CHECK (LENGTH(username) >= 3)
);

-- User sessions for JWT token management
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    revoked_at TIMESTAMP WITH TIME ZONE,
    
    INDEX idx_user_sessions_user_id (user_id),
    INDEX idx_user_sessions_expires_at (expires_at)
);
\`\`\`

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

## 3. Implementation Details

### 3.1 Django Project Structure

\`\`\`
watchparty_backend/
├── manage.py
├── requirements.txt
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
│   └── celery.py
├── apps/
│   ├── __init__.py
│   ├── authentication/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── utils.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── parties/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── consumers.py
│   ├── videos/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── tasks.py
│   ├── social/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── billing/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   ├── urls.py
│   │   └── webhooks.py
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
│   └── utils.py
└── tests/
    ├── __init__.py
    ├── test_authentication.py
    ├── test_parties.py
    └── test_videos.py
\`\`\`

### 3.2 SQLAlchemy Models Implementation

```python
# apps/users/models.py
from sqlalchemy import Column, String, Boolean, DateTime, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    username = Column(String(50), unique=True, nullable=False, index=True)
    first_name = Column(String(100))
    last_name = Column(String(100))
    avatar_url = Column(Text)
    bio = Column(Text)
    status = Column(String(20), default='active')
    email_verified = Column(Boolean, default=False)
    preferences = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_activity = Column(DateTime(timezone=True))
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username})>"

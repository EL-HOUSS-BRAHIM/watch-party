# Updated Authentication Flow Diagram

## Login Flow (With Session Tracking)

```
┌─────────────┐
│   Browser   │
│   (User)    │
└──────┬──────┘
       │
       │ 1. POST credentials
       ▼
┌─────────────────────────┐
│  Next.js Frontend       │
│  /api/auth/login        │
└──────┬──────────────────┘
       │
       │ 2. Forward to Django
       ▼
┌─────────────────────────┐
│  Django Backend         │
│  LoginView              │
│                         │
│  • Validate credentials │
│  • Update last_login    │
│  • Generate JWT tokens  │
│  • Create UserSession ──┼──► ┌─────────────────┐
│    - Device info        │    │  UserSession    │
│    - IP address         │    │  ─────────────  │
│    - User agent         │    │  • user         │
│    - Token hash         │    │  • device_info  │
│    - Expires at         │    │  • ip_address   │
│                         │    │  • user_agent   │
└──────┬──────────────────┘    │  • token_hash   │
       │                       │  • expires_at   │
       │ 3. Return tokens +    │  • is_active    │
       │    user profile       └─────────────────┘
       ▼
┌─────────────────────────┐
│  Next.js Frontend       │
│  Set HTTP-only cookies  │
│                         │
│  • access_token (60min) │
│  • refresh_token (7d)   │
└──────┬──────────────────┘
       │
       │ 4. Redirect to dashboard
       ▼
┌─────────────┐
│  Dashboard  │
└─────────────┘
```

## Session Validation Flow

```
┌─────────────┐
│   Browser   │
│  Page Load  │
└──────┬──────┘
       │
       │ 1. Check auth status
       ▼
┌─────────────────────────┐
│  Next.js Frontend       │
│  /api/auth/session      │
│                         │
│  Read cookies:          │
│  • access_token         │
│  • refresh_token        │
└──────┬──────────────────┘
       │
       │ 2. Validate with backend
       ▼
┌─────────────────────────┐
│  Django Backend         │
│  /api/auth/profile/     │
│                         │
│  Check JWT validity     │
└──────┬──────────────────┘
       │
       ├─── Token Valid ────► Return user profile
       │
       └─── Token Expired ──► ┌─────────────────────┐
                               │  Auto Refresh       │
                               │  ───────────────    │
                               │  1. Use refresh     │
                               │  2. Get new tokens  │
                               │  3. Update cookies  │
                               │  4. Get profile     │
                               └──────┬──────────────┘
                                      │
                                      ▼
                               ┌─────────────────────┐
                               │  Return auth state  │
                               │  + user profile     │
                               └─────────────────────┘
```

## Logout Flow (With Session Cleanup)

```
┌─────────────┐
│   Browser   │
│   (User)    │
└──────┬──────┘
       │
       │ 1. Click logout
       ▼
┌─────────────────────────┐
│  Next.js Frontend       │
│  /api/auth/logout       │
│                         │
│  Send refresh_token     │
└──────┬──────────────────┘
       │
       │ 2. Forward to Django
       ▼
┌─────────────────────────┐
│  Django Backend         │
│  LogoutView             │
│                         │
│  1. Hash refresh token  │
│  2. Find UserSession    │
│  3. Set is_active=False│──► ┌─────────────────┐
│  4. Blacklist token     │    │  UserSession    │
│                         │    │  ─────────────  │
└──────┬──────────────────┘    │  is_active: ❌  │
       │                       └─────────────────┘
       │ 3. Success response
       ▼
┌─────────────────────────┐
│  Next.js Frontend       │
│  Clear auth state       │
│  Redirect to login      │
└──────┬──────────────────┘
       │
       ▼
┌─────────────┐
│ Login Page  │
└─────────────┘
```

## Automated Cleanup (Celery Tasks)

```
┌──────────────────────────────────────────────────┐
│              Celery Beat Scheduler               │
└──────┬───────────────┬──────────────┬────────────┘
       │               │              │
       │ Every hour    │ Every 6h     │ Daily
       │               │              │
       ▼               ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Cleanup    │ │   Cleanup    │ │   Cleanup    │
│   Expired    │ │   Expired    │ │  Inactive    │
│   Sessions   │ │    Tokens    │ │   Sessions   │
│              │ │              │ │              │
│  Remove:     │ │  Remove:     │ │  Remove:     │
│  • Expired   │ │  • Email     │ │  • Inactive  │
│  • Inactive  │ │    verifs    │ │    >30 days  │
└──────────────┘ │  • Password  │ └──────────────┘
                 │    resets    │
                 └──────────────┘

         All tasks route to 'maintenance' queue
```

## Token Lifetimes

```
┌─────────────────────────────────────────────────┐
│                Token Lifecycle                  │
└─────────────────────────────────────────────────┘

Access Token:
├── Lifetime: 60 minutes
├── Cookie: 60 minutes (aligned ✓)
├── Stored: HTTP-only cookie
└── Auto-refresh: When expired

Refresh Token:
├── Lifetime: 7 days
├── Cookie: 7 days (aligned ✓)
├── Stored: HTTP-only cookie
├── Rotation: Enabled
└── Blacklist: On logout & rotation
```

## Security Features

```
┌─────────────────────────────────────────────────┐
│           Security Enhancements                 │
└─────────────────────────────────────────────────┘

Session Tracking:
✓ Device fingerprinting (browser, OS, device)
✓ IP address logging (proxy-aware)
✓ User agent string capture
✓ Session expiration tracking

Token Security:
✓ HTTP-only cookies (XSS protection)
✓ Token hashing (prevent exposure)
✓ Token blacklisting (prevent reuse)
✓ Token rotation (refresh security)

Automated Cleanup:
✓ Expired session removal
✓ Old token cleanup
✓ Inactive session purging
✓ Database optimization
```

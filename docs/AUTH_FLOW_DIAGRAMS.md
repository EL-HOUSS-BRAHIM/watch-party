# Authentication Flow - Visual Diagrams

This document provides visual representations of the authentication flow before and after the fix.

---

## Before Fix (Broken)

### Login Flow - Direct Backend Call

```
┌─────────────────┐
│                 │
│     Browser     │
│  (watch-party   │
│  .brahim-       │
│   elhouss.me)   │
│                 │
└────────┬────────┘
         │
         │ 1. POST /api/auth/login
         │    {email, password}
         │
         ▼
┌─────────────────┐
│                 │
│      Nginx      │
│   Reverse Proxy │
│                 │
└────────┬────────┘
         │
         │ 2. Routes to backend
         │    location /api/ { proxy_pass backend; }
         │
         ▼
┌─────────────────┐
│                 │
│  Django Backend │
│  (be-watch-     │
│   party.brahim- │
│   elhouss.me)   │
│                 │
└────────┬────────┘
         │
         │ 3. Returns JSON:
         │    {
         │      access_token: "...",
         │      refresh_token: "...",
         │      user: {...}
         │    }
         │
         ▼
┌─────────────────┐
│                 │
│     Browser     │
│                 │
│  ❌ Problem:    │
│  - Tokens in    │
│    JavaScript   │
│  - No cookies   │
│  - XSS risk     │
│                 │
└─────────────────┘

         │
         │ 4. Redirect to /dashboard
         │
         ▼
         
┌─────────────────┐
│                 │
│     Browser     │
│                 │
│  GET /dashboard │
│  (no cookies)   │
│                 │
└────────┬────────┘
         │
         │ 5. Session check fails
         │
         ▼
         
┌─────────────────┐
│                 │
│  Redirect to    │
│  /auth/login    │
│                 │
│  ❌ User can't  │
│     log in!     │
│                 │
└─────────────────┘
```

---

## After Fix (Working)

### Login Flow - Through Frontend API Route

```
┌─────────────────┐
│                 │
│     Browser     │
│  (watch-party   │
│  .brahim-       │
│   elhouss.me)   │
│                 │
└────────┬────────┘
         │
         │ 1. POST /api/auth/login
         │    {email, password}
         │
         ▼
┌─────────────────┐
│                 │
│      Nginx      │
│   Reverse Proxy │
│                 │
└────────┬────────┘
         │
         │ 2. Routes to FRONTEND (more specific rule)
         │    location /api/auth/ { proxy_pass frontend; }
         │
         ▼
┌─────────────────┐
│                 │
│  Next.js        │
│  API Route      │
│  /api/auth/     │
│  login          │
│                 │
└────────┬────────┘
         │
         │ 3. Proxies to backend
         │
         ▼
┌─────────────────┐
│                 │
│  Django Backend │
│  (be-watch-     │
│   party.brahim- │
│   elhouss.me)   │
│                 │
└────────┬────────┘
         │
         │ 4. Returns JSON:
         │    {
         │      access_token: "...",
         │      refresh_token: "...",
         │      user: {...}
         │    }
         │
         ▼
┌─────────────────┐
│                 │
│  Next.js        │
│  API Route      │
│                 │
│  5. Extracts    │
│     tokens      │
│                 │
│  6. Sets        │
│     HTTP-only   │
│     cookies:    │
│     - access_   │
│       token     │
│     - refresh_  │
│       token     │
│                 │
└────────┬────────┘
         │
         │ 7. Returns safe JSON:
         │    {
         │      success: true,
         │      user: {...}
         │    }
         │    (NO TOKENS!)
         │
         ▼
┌─────────────────┐
│                 │
│     Browser     │
│                 │
│  ✅ Receives:   │
│  - Safe JSON    │
│  - HTTP-only    │
│    cookies      │
│  - No XSS risk  │
│                 │
└────────┬────────┘
         │
         │ 8. Redirect to /dashboard
         │    (cookies included automatically)
         │
         ▼
┌─────────────────┐
│                 │
│     Browser     │
│                 │
│  GET /dashboard │
│  Cookie: access_│
│    _token=...   │
│                 │
└────────┬────────┘
         │
         │ 9. Session check with cookies
         │
         ▼
┌─────────────────┐
│                 │
│  Next.js        │
│  /api/auth/     │
│  session        │
│                 │
│  10. Validates  │
│      token from │
│      cookie     │
│                 │
└────────┬────────┘
         │
         │ 11. Returns authenticated
         │
         ▼
┌─────────────────┐
│                 │
│   Dashboard     │
│   Loads!        │
│                 │
│  ✅ User is     │
│     logged in!  │
│                 │
└─────────────────┘
```

---

## Nginx Routing Logic

### Before (Broken)

```
Request: /api/auth/login
         │
         ▼
    ┌─────────────────────┐
    │ Nginx Location      │
    │ Matching            │
    └─────────┬───────────┘
              │
              │ Check: location /api/
              │ Match: YES (starts with /api/)
              │
              ▼
    ┌─────────────────────┐
    │ Route to:           │
    │ backend:8000        │
    │ (Django)            │
    └─────────────────────┘
              │
              ▼
         ❌ No cookie management
         ❌ Tokens exposed
```

### After (Fixed)

```
Request: /api/auth/login
         │
         ▼
    ┌─────────────────────┐
    │ Nginx Location      │
    │ Matching            │
    └─────────┬───────────┘
              │
              ├─ Check: location /api/auth/
              │  Match: YES (14 chars)
              │  Priority: HIGHEST (longest prefix)
              │
              ▼
    ┌─────────────────────┐
    │ Route to:           │
    │ frontend:3000       │
    │ (Next.js)           │
    └─────────────────────┘
              │
              ▼
         ✅ Cookie management
         ✅ Tokens secured


Request: /api/parties/list
         │
         ▼
    ┌─────────────────────┐
    │ Nginx Location      │
    │ Matching            │
    └─────────┬───────────┘
              │
              ├─ Check: location /api/auth/
              │  Match: NO (doesn't start with /api/auth/)
              │
              ├─ Check: location /api/
              │  Match: YES (5 chars)
              │
              ▼
    ┌─────────────────────┐
    │ Route to:           │
    │ backend:8000        │
    │ (Django)            │
    └─────────────────────┘
              │
              ▼
         ✅ Direct to backend (efficient)
```

---

## Cookie Flow

### HTTP-only Cookie Lifecycle

```
┌───────────────────────────────────────────────────────┐
│                    Login Success                       │
└─────────────────────┬─────────────────────────────────┘
                      │
                      ▼
        ┌──────────────────────────────┐
        │   Next.js API Route          │
        │   Sets Cookies:              │
        │                              │
        │   Set-Cookie: access_token=  │
        │     eyJ0eXAiOi...; HttpOnly; │
        │     Secure; SameSite=Lax;    │
        │     Path=/; Max-Age=3600     │
        │                              │
        │   Set-Cookie: refresh_token= │
        │     eyJ0eXAiOi...; HttpOnly; │
        │     Secure; SameSite=Lax;    │
        │     Path=/; Max-Age=604800   │
        └────────────┬─────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │   Browser Cookie Storage     │
        │                              │
        │   🍪 access_token            │
        │      ├─ Value: eyJ0eXAiOi... │
        │      ├─ HttpOnly: ✅          │
        │      ├─ Secure: ✅            │
        │      ├─ SameSite: Lax        │
        │      └─ Expires: 1 hour      │
        │                              │
        │   🍪 refresh_token           │
        │      ├─ Value: eyJ0eXAiOi... │
        │      ├─ HttpOnly: ✅          │
        │      ├─ Secure: ✅            │
        │      ├─ SameSite: Lax        │
        │      └─ Expires: 7 days      │
        └────────────┬─────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │   Future Requests            │
        │                              │
        │   Browser automatically      │
        │   includes cookies:          │
        │                              │
        │   GET /dashboard             │
        │   Cookie: access_token=...   │
        │   Cookie: refresh_token=...  │
        └────────────┬─────────────────┘
                     │
                     ▼
        ┌──────────────────────────────┐
        │   Server Reads Cookies       │
        │                              │
        │   ✅ Can validate session     │
        │   ✅ JavaScript can't access  │
        │   ✅ Protected from XSS       │
        └──────────────────────────────┘
```

---

## Security Comparison

### Before Fix (Insecure)

```
┌───────────────────────────────────────┐
│           Browser Memory              │
│                                       │
│   JavaScript has access to:          │
│   ├─ access_token: "eyJ0eXAiOi..."   │
│   └─ refresh_token: "eyJ0eXAiOi..."  │
│                                       │
│   ❌ Risk: XSS attack can steal       │
│      tokens from localStorage or      │
│      memory                           │
│                                       │
│   ❌ Developer might accidentally     │
│      log tokens to console            │
│                                       │
│   ❌ Browser extensions can access    │
│      tokens                           │
└───────────────────────────────────────┘
```

### After Fix (Secure)

```
┌───────────────────────────────────────┐
│           Browser Memory              │
│                                       │
│   JavaScript has access to:          │
│   ├─ success: true                   │
│   └─ user: {id, email, ...}          │
│                                       │
│   ✅ No tokens in JavaScript          │
│   ✅ Tokens in HTTP-only cookies      │
│                                       │
└───────────────────────────────────────┘
         │
         ▼
┌───────────────────────────────────────┐
│      Browser Cookie Storage           │
│      (Protected Area)                 │
│                                       │
│   🍪 access_token (HttpOnly)          │
│   🍪 refresh_token (HttpOnly)         │
│                                       │
│   ✅ JavaScript CANNOT access          │
│   ✅ Only sent over HTTPS              │
│   ✅ SameSite protection               │
│   ✅ Immune to XSS attacks             │
└───────────────────────────────────────┘
```

---

## Request Flow Comparison

### Non-Auth Endpoints (Unchanged)

All non-authentication endpoints still go directly to backend for efficiency:

```
/api/parties/list    →  Nginx  →  Backend (Direct)
/api/videos/search   →  Nginx  →  Backend (Direct)
/api/notifications   →  Nginx  →  Backend (Direct)
/api/users/profile   →  Nginx  →  Backend (Direct)

✅ No extra proxy layer
✅ Better performance
✅ Simpler architecture
```

### Auth Endpoints (Through Frontend)

Only authentication endpoints go through frontend for cookie management:

```
/api/auth/login      →  Nginx  →  Frontend  →  Backend
/api/auth/logout     →  Nginx  →  Frontend  →  Backend
/api/auth/session    →  Nginx  →  Frontend  (validates cookie)
/api/auth/refresh    →  Nginx  →  Frontend  →  Backend

✅ Secure cookie management
✅ Tokens never exposed
✅ Minimal performance impact (only auth)
```

---

## Summary

**The Fix Achieves:**
1. ✅ Secure authentication (HTTP-only cookies)
2. ✅ No token exposure to JavaScript
3. ✅ Efficient non-auth API calls (direct to backend)
4. ✅ Proper session persistence
5. ✅ Protection from XSS and CSRF attacks

**Best of Both Worlds:**
- Security where needed (auth endpoints)
- Simplicity everywhere else (direct backend calls)

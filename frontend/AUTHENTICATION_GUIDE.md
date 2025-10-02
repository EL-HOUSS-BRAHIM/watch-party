# Authentication & Public Access Guide

## 🔒 Overview

The application now implements **role-based access control** with three levels of access:

1. **Public** - Marketing pages accessible to everyone
2. **Guest** - Limited party access for anonymous users
3. **Authenticated** - Full dashboard access for logged-in users

---

## 🎯 Access Levels

### 1. Public Access (No Login Required)

**Available Pages**:
- `/` - Landing page
- `/pricing` - Pricing information
- `/about` - About page
- `/party/[code]` - **NEW**: Join public parties as guest

**Features**:
- Full marketing content
- Party join with guest name
- Limited party features (see below)

### 2. Guest Access (Anonymous Party Join)

**Route**: `/party/[code]`

**Requirements**:
- Party must have `is_public: true`
- Party must have `allow_guest_chat: true`
- Must provide a guest name (max 20 characters)

**Features Allowed** ✅:
- ✅ Watch synced video with all participants
- ✅ Send text messages in chat (max 500 characters)
- ✅ See participant count
- ✅ See party name and host

**Features Blocked** 🚫:
- 🚫 Voice chat
- 🚫 Emoji reactions
- 🚫 Polls
- 🚫 Games
- 🚫 Video control (host only)
- 🚫 Invite others
- 🚫 Change settings
- 🚫 Create parties

**Guest Badge**: Displayed with 👁️ icon and blue styling

### 3. Authenticated Access (Full Features)

**Route**: `/dashboard/*`

**Requirements**:
- Must have valid `access_token` in localStorage
- Automatic redirect to `/auth/login` if not authenticated

**Features**:
- ✅ Full dashboard access
- ✅ Create and manage parties
- ✅ All interactive features
- ✅ Voice chat
- ✅ Emoji reactions
- ✅ Polls and games
- ✅ Video controls
- ✅ Settings and profile management

---

## 🔐 Authentication System

### Token Storage

**Location**: `localStorage`

**Keys**:
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token (optional)

### Auth Utilities

**File**: `lib/auth.ts`

```typescript
// Check if user is logged in
auth.isAuthenticated() // boolean

// Get tokens
auth.getAccessToken() // string | null
auth.getRefreshToken() // string | null

// Login
auth.setTokens(accessToken, refreshToken)

// Logout
auth.clearTokens()
```

### useAuth Hook

```typescript
const { isAuthenticated, isLoading, login, logout } = useAuth()

// Login
login(accessToken, refreshToken)

// Logout (also redirects to /auth/login)
logout()
```

### ProtectedRoute Component

**File**: `components/auth/protected-route.tsx`

**Usage**:
```tsx
<ProtectedRoute>
  <YourProtectedComponent />
</ProtectedRoute>
```

**Behavior**:
1. Shows loading spinner while checking auth
2. Redirects to `/auth/login` if not authenticated
3. Stores attempted URL in `?redirect=` parameter
4. Only renders children if authenticated

---

## 📁 File Structure

```
frontend/
├── app/
│   ├── (dashboard)/
│   │   └── layout.tsx              # ✅ Protected with ProtectedRoute
│   ├── auth/
│   │   └── login/page.tsx          # Login page (stores tokens)
│   └── party/
│       └── [code]/page.tsx         # 🆕 Public party join page
│
├── components/
│   ├── auth/
│   │   └── protected-route.tsx     # 🆕 Auth protection wrapper
│   ├── party/
│   │   └── public-party-layout.tsx # 🆕 Guest party UI
│   └── layout/
│       ├── conditional-layout.tsx  # Updated with party route handling
│       └── dashboard-header.tsx    # Updated with logout button
│
└── lib/
    └── auth.ts                      # 🆕 Auth utilities and hooks
```

---

## 🚀 User Flows

### Flow 1: Guest Joining Public Party

```
1. User visits /party/ABC123
2. System checks if party is public (API call)
3. If private → Show error "This party is private"
4. If public → Show join screen
5. User enters guest name (e.g., "Guest123")
6. Click "Join Party"
7. Enter party room with limited features
8. Can watch video + send text messages
9. See blue "GUEST" badge on messages
10. "Leave Party" button returns to join screen
```

### Flow 2: Protected Dashboard Access

```
1. User visits /dashboard
2. ProtectedRoute checks localStorage for access_token
3. If no token:
   - Redirect to /auth/login?redirect=%2Fdashboard
4. User logs in with credentials
5. Login success → Tokens stored in localStorage
6. Redirect to /dashboard (from redirect parameter)
7. ProtectedRoute allows access
8. Dashboard renders with full features
```

### Flow 3: Logout

```
1. User clicks "Sign Out" in DashboardHeader
2. useAuth().logout() called
3. Tokens cleared from localStorage
4. Automatic redirect to /auth/login
5. Any dashboard access now blocked
```

---

## 🎨 UI Components

### Public Party Join Screen

**Before Joining**:
```
┌─────────────────────────────────────┐
│          🎬                         │
│     [Party Name]                    │
│  Hosted by @username                │
│  X people watching                  │
│                                     │
│  [Guest Mode Notice]                │
│                                     │
│  Enter your name:                   │
│  [____________]                     │
│                                     │
│  [Join Party]                       │
│                                     │
│  Create an account for full         │
│  features →                         │
└─────────────────────────────────────┘
```

### Public Party Room

**Header**:
```
┌────────────────────────────────────────────────────┐
│ [🎬 Party Name]  [👥 5]  [👁️ Guest: Name]  [Leave] │
│  Code: ABC123                                       │
└────────────────────────────────────────────────────┘
```

**Layout**:
```
┌───────────────────────────────────────────────────┐
│ Header (party info + guest badge + leave)        │
├─────────────────────────────────┬─────────────────┤
│                                 │  💬 Chat        │
│                                 │  (text only)    │
│     Video Player                │                 │
│     (synced with host)          │  [Messages]     │
│                                 │                 │
│                                 │  [Send Box]     │
│  [▶️] 1:23 / 5:00               │                 │
│  🔒 Host controls playback      │                 │
│                                 │                 │
│  [Guest Mode Limitations Notice]│                 │
└─────────────────────────────────┴──��──────────────┘
```

### Protected Route Loading

```
┌─────────────────────────────────────┐
│                                     │
│         [Spinner Animation]         │
│   Checking authentication...        │
│                                     │
└─────────────────────────────────────┘
```

---

## 🧪 Testing Checklist

### Authentication Protection

- [ ] `/dashboard` redirects to `/auth/login` when not logged in
- [ ] After login, redirect back to attempted URL
- [ ] Logout button clears tokens and redirects
- [ ] Dashboard accessible after login
- [ ] Token persists across page refreshes
- [ ] Multi-tab sync (logout in one tab affects others)

### Public Party Access

- [ ] `/party/ABC123` loads without authentication
- [ ] Private party shows "This party is private" error
- [ ] Join screen requires guest name
- [ ] Can't join without entering name
- [ ] After joining, party room loads
- [ ] Video player shows "synced with host" message
- [ ] Chat messages show "GUEST" badge
- [ ] Character limit enforced (500 chars)
- [ ] Leave button returns to join screen
- [ ] Sign up link goes to `/auth/register`

### Guest Limitations

- [ ] No voice chat button visible
- [ ] No emoji reaction buttons
- [ ] No poll creation
- [ ] No game features
- [ ] No video control buttons (play/pause disabled for guests)
- [ ] Guest limitations notice displayed
- [ ] Host controls message shown on video player

---

## 🔧 Configuration

### Party Settings for Guest Access

To allow guests, party must have:

```json
{
  "settings": {
    "is_public": true,
    "allow_guest_chat": true
  }
}
```

### API Endpoints

**Public Party Data**:
```
GET /api/parties/public/[code]/
```
Returns party info without authentication.

**Guest Join** (WebSocket):
```
WS /ws/party/[code]/?guest_name=Guest123
```
Anonymous WebSocket connection for video sync + chat.

---

## 🎯 Security Considerations

### Token Security

- ✅ Tokens stored in localStorage (accessible to same-origin only)
- ✅ No sensitive data in tokens (server validates)
- ✅ Refresh tokens for long sessions (optional)
- ⚠️ XSS protection required (React already sanitizes)

### Guest Limitations

- ✅ No guest can access user data
- ✅ No guest can control video playback
- ✅ No guest can change party settings
- ✅ Message rate limiting recommended (TODO)
- ✅ Guest names not stored permanently

### Route Protection

- ✅ Client-side protection (ProtectedRoute)
- ⚠️ **Must also protect API endpoints** (backend validation)
- ✅ Redirect unauthorized users
- ✅ Store attempted URL for post-login redirect

---

## 📊 Metrics

### Guest Usage

Track:
- Number of guest joins per party
- Average guest session duration
- Guest-to-user conversion rate
- Most common guest names

### Authentication

Track:
- Failed login attempts
- Average session duration
- Token refresh frequency
- Logout reasons (manual vs expired)

---

## 🚀 Future Enhancements

### Phase 1: Basic Improvements
- [ ] Rate limiting for guest messages
- [ ] Guest name profanity filter
- [ ] Show "X guests online" count
- [ ] Guest message history (session only)

### Phase 2: Advanced Features
- [ ] Guest can upgrade to full account mid-session
- [ ] "Sign up" prompt after 15 minutes
- [ ] Guest can save party to favorites (cookie)
- [ ] Email invite for guests

### Phase 3: Premium Features
- [ ] Party analytics (guest engagement)
- [ ] Custom guest permissions per party
- [ ] Guest moderation tools for hosts
- [ ] Temporary guest accounts (24h)

---

## 💡 Best Practices

### For Users

**Creating Public Parties**:
1. Enable "Public Access" in party settings
2. Enable "Allow Guest Chat"
3. Share party code with friends
4. Monitor guest activity

**Guests Joining**:
1. Choose appropriate guest name
2. Be respectful in chat
3. Upgrade to account for full features
4. No need to create account to watch

### For Developers

**Adding Protected Routes**:
```tsx
// Wrap in ProtectedRoute
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>
```

**Checking Auth in Components**:
```tsx
const { isAuthenticated, isLoading } = useAuth()

if (isLoading) return <Loading />
if (!isAuthenticated) return <LoginPrompt />
```

**Creating Public Features**:
- Don't require authentication
- Show upgrade prompts
- Limit features appropriately
- Always validate on backend

---

## 🆘 Troubleshooting

### "Checking authentication..." Stuck

**Cause**: localStorage not accessible  
**Fix**: Check browser privacy settings, allow localStorage

### Redirect Loop on Login

**Cause**: Token not being stored  
**Fix**: Check login API response, verify token format

### Guest Can't Join Party

**Causes**:
- Party is private (`is_public: false`)
- Guest chat disabled (`allow_guest_chat: false`)
- Invalid party code
- Party ended

**Fix**: Check party settings, verify code

### Dashboard Accessible Without Login

**Cause**: Old tokens in localStorage  
**Fix**: Clear localStorage or call `auth.clearTokens()`

---

## 📞 API Integration

### Login Endpoint

```typescript
// app/auth/login/page.tsx
const data = await authApi.login({ email, password })

// Store tokens
if (data.access_token) {
  localStorage.setItem("access_token", data.access_token)
}
if (data.refresh_token) {
  localStorage.setItem("refresh_token", data.refresh_token)
}

// Redirect
window.location.href = "/dashboard"
```

### Public Party Endpoint

```typescript
// app/party/[code]/page.tsx
const response = await fetch(`/api/parties/public/${code}/`)
const data = await response.json()

// Check if public
if (!data.settings?.is_public) {
  throw new Error("This party is private")
}
```

---

## 🎓 Summary

### For End Users

- **Guests**: Can join public parties without account, watch + chat
- **Members**: Full access to all features after login
- **Hosts**: Can enable guest access per party

### For Developers

- **Auth**: Use `useAuth()` hook and `ProtectedRoute` component
- **Public**: Use `/party/[code]` for guest access
- **Protected**: Wrap dashboard routes in `ProtectedRoute`

### Key Files

- `lib/auth.ts` - Auth utilities
- `components/auth/protected-route.tsx` - Route protection
- `components/party/public-party-layout.tsx` - Guest UI
- `app/party/[code]/page.tsx` - Public party page

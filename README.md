# 🎬 Watch Party Platform - Frontend Architecture

![Watch Party Platform](https://img.shields.io/badge/Version-2.0.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06b6d4) ![Status](https://img.shields.io/badge/Status-Production%20Ready-green)

> **A modern, dark-themed streaming platform where users can watch football games together, stream from Google Drive or S3, chat live, and manage premium subscriptions.**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Architecture Overview](#architecture-overview)
4. [Page Structure & Routes](#page-structure--routes)
5. [Component Architecture](#component-architecture)
6. [Design System](#design-system)
7. [Data Flow](#data-flow)
8. [Dynamic Content Requirements](#dynamic-content-requirements)
9. [Setup & Development](#setup--development)
10. [Deployment](#deployment)

---

## 🎯 Overview

Watch Party Platform is a production-ready SaaS application that enables users to watch football games synchronously with friends and family. The platform features real-time video synchronization, live chat, premium subscriptions, and comprehensive admin controls.

### Key Features
- 🎥 **Synchronized Video Streaming** - Google Drive & S3 integration
- 💬 **Real-time Chat** - Socket.IO powered live messaging
- 👥 **User Management** - Authentication, profiles, friend systems
- 💳 **Billing & Subscriptions** - Stripe integration with premium plans
- 🛡️ **Admin Dashboard** - Content moderation, user management, system controls
- 📱 **Responsive Design** - Mobile-first, dark-mode optimized
- ⚡ **High Performance** - Next.js 15, React 19, optimized for scale

---

## 🛠 Tech Stack

### Frontend Core
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4
- **UI Library:** Radix UI (Accessible components)
- **State Management:** TanStack Query + React Context
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Charts:** Recharts

### Real-time & External Services
- **WebSockets:** Socket.IO Client
- **HTTP Client:** Axios
- **Payment:** Stripe Integration
- **Video Storage:** Google Drive API, AWS S3
- **Authentication:** JWT-based with social login support

### Development Tools
- **Package Manager:** pnpm
- **Linting:** ESLint + Next.js rules
- **Type Checking:** TypeScript strict mode
- **Animations:** Tailwind CSS Animate
- **Theme:** next-themes (Dark/Light mode)

---

## 🏗 Architecture Overview

```mermaid
graph TB
    subgraph "Frontend (Next.js 15)"
        A[App Router] --> B[Public Pages]
        A --> C[Protected Routes]
        A --> D[Admin Panel]
        
        B --> B1[Landing Page]
        B --> B2[Auth Pages]
        B --> B3[Legal Pages]
        
        C --> C1[Dashboard]
        C --> C2[Watch Rooms]
        C --> C3[User Settings]
        
        D --> D1[User Management]
        D --> D2[Content Moderation]
        D --> D3[System Controls]
    end
    
    subgraph "Real-time Layer"
        E[Socket.IO Client]
        F[WebRTC for Video Sync]
    end
    
    subgraph "Backend Services"
        G[PHP Backend - API]
        H[Python Backend - AI/ML]
        I[WebSocket Server]
    end
    
    subgraph "External Services"
        J[Google Drive API]
        K[AWS S3]
        L[Stripe Payments]
        M[Email Service]
    end
    
    A --> E
    E --> I
    C --> G
    D --> G
    C2 --> F
    G --> J
    G --> K
    C --> L
    G --> M
```

### Component Architecture Flow

```mermaid
graph LR
    subgraph "UI Layer"
        A[shadcn/ui Base] --> B[Custom Components]
        B --> C[Page Components]
        C --> D[Layout Wrappers]
    end
    
    subgraph "State Management"
        E[React Context] --> F[TanStack Query]
        F --> G[Local State]
    end
    
    subgraph "Business Logic"
        H[Custom Hooks] --> I[API Layer]
        I --> J[WebSocket Manager]
    end
    
    A --> H
    E --> H
    H --> C
    D --> C
```

---

## 🌐 Page Structure & Routes

### Public Routes (Unauthenticated)

| **Route** | **Component** | **Purpose** | **Dynamic Inputs** |
|-----------|---------------|-------------|-------------------|
| `/` | Landing Page | Hero, features, testimonials | - Featured matches<br>- User testimonials<br>- Live party count |
| `/join` | Signup Page | User registration with discount | - Current promo codes<br>- Referral tracking |
| `/login` | Login Page | JWT authentication | - OAuth providers<br>- Remember me state |
| `/forgot-password` | Password Reset | Email-based reset | - Email validation<br>- Rate limiting status |
| `/reset-password/[token]` | New Password Form | Token-based reset | - Token validation<br>- Password requirements |
| `/pricing` | Pricing Plans | Free vs Premium comparison | - Current pricing<br>- Feature matrix<br>- Limited time offers |
| `/about` | About Us | Team, mission, vision | - Team member profiles<br>- Company stats |
| `/contact` | Contact Form | Support and inquiries | - Contact form state<br>- Department routing |
| `/help` | FAQ & Support | Documentation and guides | - Search functionality<br>- Popular questions |
| `/features` | Feature Deep Dive | Technical capabilities | - Feature availability by plan<br>- Demo videos |
| `/terms` | Terms of Service | Legal agreement | - Last updated date<br>- Version tracking |
| `/privacy` | Privacy Policy | Data protection policy | - Data collection details<br>- Regional variations |
| `/blog` | Blog/News | SEO content and updates | - Blog post list<br>- Categories/tags |
| `/blog/[slug]` | Blog Post | Individual articles | - Post content<br>- Related articles<br>- Comments |
| `/mobile` | Mobile Redirect | App download/QR code | - Platform detection<br>- Download links |

### Protected Routes (User Dashboard)

| **Route** | **Component** | **Purpose** | **Dynamic Inputs** |
|-----------|---------------|-------------|-------------------|
| `/dashboard` | Dashboard Home | User overview and quick actions | - Active parties count<br>- Subscription status<br>- Recent activity feed<br>- Quick action buttons |
| `/watch/[roomId]` | Watch Party Room | Main streaming interface | - Room metadata<br>- Participant list<br>- Chat messages<br>- Video source<br>- Sync status |
| `/dashboard/party/create` | Create Party Form | New party setup | - Available video sources<br>- Privacy settings<br>- Scheduling options |
| `/dashboard/parties` | Party Management | User's created parties | - Party list with status<br>- Filter/search options<br>- Bulk actions |
| `/dashboard/videos` | Video Library | Personal video collection | - Uploaded videos<br>- Linked content<br>- Storage usage |
| `/dashboard/videos/upload` | Upload Interface | Video upload/linking | - Upload progress<br>- Supported formats<br>- Storage limits |
| `/dashboard/videos/[id]/edit` | Video Editor | Video metadata editing | - Video details<br>- Thumbnail options<br>- Privacy settings |
| `/dashboard/favorites` | Saved Content | Favorited videos/rooms | - Favorites list<br>- Organization options |
| `/dashboard/friends` | Social Management | Friend connections | - Friend requests<br>- Online status<br>- Activity feed |
| `/dashboard/notifications` | Notification Center | All app notifications | - Notification list<br>- Read/unread status<br>- Notification settings |
| `/dashboard/settings/profile` | Profile Settings | Personal information | - Avatar upload<br>- Profile details<br>- Privacy preferences |
| `/dashboard/settings/accounts` | Connected Accounts | OAuth integrations | - Connected services<br>- Authorization status |
| `/dashboard/settings/security` | Security Settings | Password, 2FA, sessions | - Active sessions<br>- Security events<br>- 2FA setup |
| `/dashboard/billing` | Billing Management | Subscription and payments | - Current plan<br>- Payment history<br>- Invoice downloads |
| `/dashboard/invite` | Referral Center | Friend invitations | - Referral links<br>- Invitation tracking<br>- Rewards status |
| `/dashboard/support` | User Support | Help and ticket system | - Open tickets<br>- Support history<br>- Contact options |

### Admin Routes (Administrative)

| **Route** | **Component** | **Purpose** | **Dynamic Inputs** |
|-----------|---------------|-------------|-------------------|
| `/admin` | Admin Dashboard | System overview and stats | - User metrics<br>- System health<br>- Revenue analytics<br>- Alert notifications |
| `/admin/users` | User Management | User administration | - User search/filter<br>- User actions (ban/promote)<br>- User analytics |
| `/admin/videos` | Content Moderation | Video content review | - Flagged content queue<br>- Moderation actions<br>- Content analytics |
| `/admin/parties` | Party Monitoring | Live party oversight | - Active parties<br>- Real-time metrics<br>- Intervention tools |
| `/admin/system` | System Controls | Technical administration | - Service status<br>- System actions<br>- Performance metrics |
| `/admin/plans` | Subscription Management | Plan configuration | - Plan details<br>- Pricing adjustments<br>- Feature toggles |
| `/admin/coupons` | Promotion Management | Discount code system | - Active coupons<br>- Usage statistics<br>- Expiration tracking |
| `/admin/analytics` | Analytics Dashboard | Business intelligence | - Revenue reports<br>- User engagement<br>- Performance metrics |
| `/admin/logs` | System Logs | Error and activity logs | - Log filters<br>- Error tracking<br>- Performance logs |
| `/admin/reports` | Report Center | Generated reports | - Report templates<br>- Scheduled reports<br>- Export options |
| `/admin/settings` | System Settings | Global configuration | - Feature flags<br>- System parameters<br>- Integration settings |

---

## 🧩 Component Architecture

### Component Hierarchy

```mermaid
graph TD
    A[App Layout] --> B[Theme Provider]
    B --> C[Auth Provider]
    C --> D[Socket Provider]
    D --> E[Query Client Provider]
    
    E --> F[Page Components]
    F --> G[Layout Components]
    F --> H[Feature Components]
    F --> I[UI Components]
    
    G --> G1[Navbar]
    G --> G2[Sidebar]
    G --> G3[Footer]
    G --> G4[Breadcrumbs]
    
    H --> H1[Video Player]
    H --> H2[Chat System]
    H --> H3[Auth Forms]
    H --> H4[Billing Forms]
    
    I --> I1[shadcn/ui Base]
    I --> I2[Custom UI]
    I1 --> I2
```

### Component Categories

#### 🎨 UI Elements (Base Components)
```typescript
// Core interactive elements
- Button (variants: primary, secondary, ghost, destructive)
- Input (with validation states, icons, sizes)
- Select (single/multi, searchable, async loading)
- Checkbox & Radio Groups
- Switch Toggle
- Slider (for volume, progress)
- Badge (status, role, notifications)
- Avatar (with fallbacks, online indicators)
- Tooltip & Popover
- Dialog & Modal
- Tabs & Accordion
- Progress Bar (upload, buffering, subscription usage)
- Pagination (for lists, search results)
```

#### 🏗 Layout Components
```typescript
// Structural and navigation elements
- AppLayout (main app wrapper)
- PublicLayout (marketing pages)
- DashboardLayout (authenticated pages)
- AdminLayout (admin panel)
- Navbar (responsive, role-based menu)
- Sidebar (collapsible, context-aware)
- Footer (links, social, legal)
- Breadcrumbs (navigation hierarchy)
- PageHeader (title, actions, metadata)
- ContentWrapper (consistent spacing, responsive)
- ErrorBoundary (graceful error handling)
- LoadingStates (skeleton, spinner, progressive)
```

#### 🔐 Authentication Components
```typescript
// User authentication and authorization
- LoginForm (email/password, social login)
- RegisterForm (validation, terms acceptance)
- ForgotPasswordForm (email input, rate limiting)
- ResetPasswordForm (token validation, password strength)
- ProtectedRoute (authentication guard)
- AdminGuard (role-based access control)
- SocialLoginButtons (OAuth providers)
- TwoFactorForm (OTP input, backup codes)
- SessionManager (active sessions, logout)
- ProfileVerification (email, phone verification)
```

#### 🎥 Video & Party Components
```typescript
// Core streaming functionality
- VideoPlayer (custom controls, quality selection, fullscreen)
- ChatBox (real-time messages, emoji support, moderation)
- ParticipantList (user avatars, roles, kick/mute controls)
- ReactionOverlay (emoji reactions, live feedback)
- PartyControls (play/pause sync, seeking, volume)
- RoomSettings (privacy, permissions, scheduling)
- StreamStatus (live indicator, viewer count, quality)
- VideoUploader (drag-drop, progress, validation)
- VideoLibrary (grid view, search, filters)
- SyncManager (playback synchronization, latency handling)
```

#### 💬 Chat & Social Components
```typescript
// Communication and social features
- MessageBubble (own/other styling, timestamps, reactions)
- EmojiPicker (categories, recent, search)
- UserMention (@ mentions, suggestions)
- ChatModeration (message deletion, user timeout)
- FriendCard (profile, online status, actions)
- NotificationBell (unread count, dropdown list)
- ActivityFeed (recent actions, timestamps)
- InviteManager (link generation, QR codes)
- SocialShare (platform-specific sharing)
- UserProfile (detailed view, friendship status)
```

#### 💳 Billing & Subscription Components
```typescript
// Payment and subscription management
- PlanCard (features, pricing, CTA buttons)
- PaymentForm (Stripe Elements, validation)
- BillingHistory (invoices, download, disputes)
- SubscriptionManager (upgrade/downgrade, cancellation)
- UsageMetrics (bandwidth, storage, party limits)
- PromoCodeInput (validation, discount display)
- PaymentMethodManager (add/remove cards, default)
- RefundRequest (form, status tracking)
- PricingCalculator (dynamic pricing, discounts)
- BillingAlerts (payment failures, expiration warnings)
```

#### 🛠 Admin & System Components
```typescript
// Administrative and monitoring tools
- AdminStats (KPI cards, trend indicators)
- UserTable (search, filter, bulk actions, pagination)
- VideoModerationQueue (flagged content, review actions)
- SystemHealthPanel (service status, performance metrics)
- LogViewer (real-time logs, filters, search)
- AnalyticsDashboard (charts, metrics, date ranges)
- BulkActions (mass user operations, content management)
- SystemControls (cache clearing, service restarts)
- ReportGenerator (custom reports, export options)
- FeatureFlags (toggle features, A/B testing)
- ContentModeration (AI flagging, manual review)
- AuditLog (system changes, user actions, timestamps)
```

#### 🔔 Notification & Feedback Components
```typescript
// User engagement and communication
- Toast (success, error, warning, info states)
- NotificationCenter (categorized, mark as read)
- FeedbackForm (bug reports, feature requests)
- RatingSystem (star ratings, reviews)
- SurveyModal (user satisfaction, feature feedback)
- AnnouncementBanner (system updates, promotions)
- ProgressTracker (onboarding, goal completion)
- TutorialOverlay (feature introduction, guided tours)
- StatusIndicator (online/offline, system health)
- AlertManager (critical notifications, acknowledgments)
```

---

## 🎨 Design System - "Neo Stadium Glow"

### Color Palette Implementation

```typescript
// Design tokens for Tailwind CSS
const colors = {
  // Base Dark Theme
  background: {
    primary: '#0E0E10',    // Main app background
    secondary: '#1A1A1D',  // Cards, modals, elevated surfaces
    tertiary: '#2E2E32',   // Borders, dividers, subtle elements
  },
  
  // Text Hierarchy
  text: {
    primary: '#FFFFFF',    // Main content, headings
    secondary: '#B3B3B3',  // Descriptions, metadata
    tertiary: '#888888',   // Placeholder, disabled states
    inverse: '#0E0E10',    // Text on light backgrounds
  },
  
  // Accent Colors (Semantic)
  accent: {
    primary: '#3ABEF9',    // Primary actions, links, focus states
    success: '#9FF87A',    // Success states, online indicators
    warning: '#FFC857',    // Warnings, attention needed
    error: '#FF3B3B',      // Errors, destructive actions
    highlight: '#14FFEC',  // Special highlights, active states
    premium: '#FFD700',    // Premium features, paid content
  },
  
  // Supporting Colors
  support: {
    violet: '#7C5FFF',     // Secondary accents, tooltips
    pink: '#FF69B4',       // Reactions, emotive elements
    gradient: 'linear-gradient(135deg, #3ABEF9, #7C5FFF)', // Buttons, banners
  }
};

// Usage Examples in Components
const buttonStyles = {
  primary: 'bg-accent-primary hover:bg-accent-primary/90 text-white',
  secondary: 'bg-background-secondary hover:bg-background-tertiary text-text-primary',
  premium: 'bg-accent-premium hover:bg-accent-premium/90 text-text-inverse',
  destructive: 'bg-accent-error hover:bg-accent-error/90 text-white',
};

const statusStyles = {
  online: 'bg-accent-success text-accent-success/20',
  offline: 'bg-text-tertiary text-text-secondary',
  premium: 'bg-accent-premium text-accent-premium/20',
  warning: 'bg-accent-warning text-accent-warning/20',
};
```

### Extended Tailwind Configuration

```javascript
// tailwind.config.ts
export default {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        background: {
          primary: '#0E0E10',
          secondary: '#1A1A1D',
          tertiary: '#2E2E32',
        },
        surface: {
          DEFAULT: '#1A1A1D',
          elevated: '#242427',
          overlay: 'rgba(14, 14, 16, 0.95)',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          tertiary: '#888888',
          inverse: '#0E0E10',
        },
        accent: {
          primary: '#3ABEF9',
          secondary: '#28A8E0',
          success: '#9FF87A',
          warning: '#FFC857',
          error: '#FF3B3B',
          highlight: '#14FFEC',
          premium: '#FFD700',
          violet: '#7C5FFF',
          pink: '#FF69B4',
        },
        border: {
          DEFAULT: '#2E2E32',
          focus: '#3ABEF9',
          success: '#9FF87A',
          error: '#FF3B3B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '3.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-gentle': 'bounce 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        glow: {
          '0%': { 
            boxShadow: '0 0 5px #3ABEF9, 0 0 10px #3ABEF9, 0 0 15px #3ABEF9',
          },
          '100%': { 
            boxShadow: '0 0 10px #3ABEF9, 0 0 20px #3ABEF9, 0 0 30px #3ABEF9',
          },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-primary': 'linear-gradient(135deg, #3ABEF9, #7C5FFF)',
        'gradient-success': 'linear-gradient(135deg, #9FF87A, #14FFEC)',
        'gradient-premium': 'linear-gradient(135deg, #FFD700, #FFC857)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(58, 190, 249, 0.5)',
        'glow-md': '0 0 20px rgba(58, 190, 249, 0.5)',
        'glow-lg': '0 0 30px rgba(58, 190, 249, 0.5)',
        'premium': '0 0 20px rgba(255, 215, 0, 0.3)',
        'success': '0 0 15px rgba(159, 248, 122, 0.3)',
        'error': '0 0 15px rgba(255, 59, 59, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

### Accessibility Standards

```typescript
// Accessibility compliance checklist
const accessibilityFeatures = {
  colorContrast: {
    // WCAG AA compliant ratios
    primaryText: '21:1', // White on dark background
    secondaryText: '7.5:1', // Light gray on dark background
    accentColors: 'Minimum 4.5:1 against backgrounds',
  },
  
  focusManagement: {
    focusRings: 'Visible focus indicators with glow effect',
    tabOrder: 'Logical keyboard navigation',
    skipLinks: 'Skip to main content functionality',
    trapFocus: 'Modal and dropdown focus trapping',
  },
  
  semanticHTML: {
    landmarks: 'Proper use of nav, main, aside, footer',
    headings: 'Hierarchical heading structure (h1-h6)',
    lists: 'Proper ul/ol for navigation and content',
    buttons: 'Button vs link semantic distinction',
  },
  
  screenReaderSupport: {
    ariaLabels: 'Descriptive labels for all interactive elements',
    ariaDescriptions: 'Context for complex UI components',
    liveRegions: 'Announcements for dynamic content updates',
    roleAttributes: 'Proper ARIA roles for custom components',
  },
  
  keyboardNavigation: {
    tabSupport: 'All interactive elements keyboard accessible',
    shortcuts: 'Keyboard shortcuts for power users',
    escapeHandling: 'ESC key closes modals/dropdowns',
    arrowNavigation: 'Arrow key navigation in lists/menus',
  },
};
```

---

## 🔄 Data Flow Architecture

### State Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant H as Custom Hook
    participant Q as TanStack Query
    participant A as API Layer
    participant S as Socket.IO
    participant B as Backend

    U->>C: User Action
    C->>H: Trigger Hook
    H->>Q: Query/Mutation
    Q->>A: HTTP Request
    A->>B: API Call
    B-->>A: Response
    A-->>Q: Data
    Q-->>H: Updated State
    H-->>C: Re-render
    
    Note over S,B: Real-time Updates
    B->>S: WebSocket Event
    S->>H: Socket Hook
    H->>C: Live Update
    C->>U: UI Update
```

### Authentication Flow

```mermaid
graph TD
    A[User Login] --> B{Auth Method?}
    B -->|Email/Password| C[Credential Validation]
    B -->|Social Login| D[OAuth Flow]
    
    C --> E[JWT Generation]
    D --> E
    
    E --> F[Store Tokens]
    F --> G[Update Auth Context]
    G --> H[Redirect to Dashboard]
    
    I[Token Refresh] --> J{Token Valid?}
    J -->|Yes| K[Continue Session]
    J -->|No| L[Force Re-login]
    
    M[Logout] --> N[Clear Tokens]
    N --> O[Clear Context]
    O --> P[Redirect to Login]
```

### Real-time Communication Flow

```mermaid
graph LR
    subgraph "Frontend"
        A[Video Player] --> B[Socket Client]
        C[Chat Component] --> B
        D[Participant List] --> B
    end
    
    subgraph "Backend Services"
        E[WebSocket Server] --> F[PHP API]
        E --> G[Redis Pub/Sub]
        E --> H[Database]
    end
    
    subgraph "External Services"
        I[Google Drive]
        J[AWS S3]
    end
    
    B <-->|Real-time Events| E
    F --> I
    F --> J
    G --> E
    H --> F
```

---

## ⚡ Dynamic Content Requirements

### Real-time Data Synchronization

| **Component** | **Data Source** | **Update Frequency** | **Fallback Strategy** |
|---------------|-----------------|---------------------|----------------------|
| Video Player | WebSocket + CDN | Real-time (< 100ms) | Local state + retry logic |
| Chat Messages | Socket.IO | Instant | Message queuing + resend |
| Participant List | WebSocket | Real-time | Cached participant data |
| Notification Bell | Server-Sent Events | Every 30s | Polling fallback |
| System Status | Health Check API | Every 60s | Static status page |
| Live Metrics | WebSocket | Every 5s | Historical data |

### Dynamic Content Loading Strategies

```typescript
// Content loading patterns
const dynamicContent = {
  // Immediate Load (Critical Path)
  critical: [
    'User authentication state',
    'Current subscription status', 
    'Active party information',
    'Chat message history (last 50)',
  ],
  
  // Lazy Load (Below Fold)
  deferred: [
    'User profile details',
    'Billing history',
    'Friend activity feed',
    'Video thumbnails',
    'Admin analytics data',
  ],
  
  // On-Demand (User Triggered)
  onDemand: [
    'Video upload interface',
    'Advanced settings panels',
    'Historical reports',
    'System logs',
    'Detailed user profiles',
  ],
  
  // Background Sync (Invisible to User)
  background: [
    'Cache warming',
    'Offline data sync',
    'Performance metrics',
    'Usage analytics',
    'A/B test assignments',
  ],
};

// Data refresh strategies
const refreshStrategies = {
  realTime: ['chat', 'videoSync', 'participants'],
  periodic: ['notifications', 'systemHealth', 'metrics'],
  manual: ['settings', 'profile', 'billing'],
  onFocus: ['dashboard', 'parties', 'friends'],
  onMount: ['initialData', 'userPreferences', 'permissions'],
};
```

### Input Validation & Form States

```typescript
// Form input requirements by page
const formInputs = {
  // Authentication Forms
  login: {
    email: 'Email validation + rate limiting',
    password: 'Minimum security requirements',
    rememberMe: 'Persistent session option',
    twoFactorCode: 'OTP validation (conditional)',
  },
  
  register: {
    email: 'Uniqueness check + verification',
    password: 'Strength meter + confirmation',
    firstName: 'Required, character limits',
    lastName: 'Required, character limits',
    termsAccepted: 'Mandatory legal agreement',
    promoCode: 'Optional discount application',
  },
  
  // Party Creation
  createParty: {
    title: 'Required, 3-100 characters',
    description: 'Optional, max 500 characters',
    videoSource: 'URL validation (GDrive/S3)',
    privacy: 'Public/Private/Friends-only',
    maxParticipants: 'Number, 2-50 range',
    scheduledStart: 'Future date/time picker',
    allowChat: 'Boolean toggle',
    allowReactions: 'Boolean toggle',
    moderators: 'User selection from friends',
  },
  
  // Video Upload
  videoUpload: {
    file: 'Format validation, size limits',
    title: 'Required, SEO friendly',
    description: 'Optional, rich text editor',
    thumbnail: 'Image upload, auto-generate option',
    tags: 'Multi-select, auto-suggestions',
    visibility: 'Private/Friends/Public',
    allowDownload: 'Boolean permission',
    ageRestriction: 'Content rating selection',
  },
  
  // Payment Forms
  billing: {
    cardNumber: 'Stripe validation',
    expiryDate: 'MM/YY format validation',
    cvv: 'Security code validation',
    billingAddress: 'Address completion',
    savePaymentMethod: 'Future use option',
    promoCode: 'Discount code validation',
  },
  
  // Admin Forms
  userModeration: {
    reason: 'Required for actions',
    duration: 'Time-based penalties',
    notifyUser: 'Communication option',
    publicLog: 'Transparency setting',
  },
};
```

### Performance Optimization Strategies

```typescript
// Performance optimization techniques
const optimizations = {
  // Code Splitting
  routing: 'Automatic page-level splitting',
  components: 'Dynamic imports for heavy components',
  libraries: 'Vendor chunk optimization',
  
  // Data Fetching
  prefetching: 'Next.js Link prefetching',
  caching: 'TanStack Query with stale-while-revalidate',
  pagination: 'Virtual scrolling for large lists',
  
  // Asset Optimization
  images: 'Next.js Image component with WebP',
  fonts: 'Font preloading and subsetting',
  icons: 'Tree-shaking with Lucide React',
  
  // Runtime Performance  
  memoization: 'React.memo for expensive components',
  virtualization: 'React Window for long lists',
  debouncing: 'Search input optimization',
  
  // Network Optimization
  compression: 'Gzip/Brotli compression',
  cdn: 'Global asset distribution', 
  serviceWorker: 'Offline functionality',
};
```

---

## 🚀 Setup & Development

### Prerequisites

```bash
# Required versions
Node.js >= 18.0.0
pnpm >= 8.0.0
Git >= 2.0.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/EL-HOUSS-BRAHIM/v0-watch-party.git
cd watch-party

# Install dependencies
pnpm install:all

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development servers
pnpm dev
```

### Environment Configuration

```bash
# Frontend Environment Variables (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY=your_drive_api_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Backend Integration
DATABASE_URL=mysql://user:pass@localhost:3306/watchparty
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_...
GOOGLE_DRIVE_CLIENT_ID=your_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=your_bucket_name

# Email & Notifications
SMTP_HOST=smtp.example.com
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_pass
PUSHER_APP_ID=your_pusher_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
```

### Development Scripts

```bash
# Development
pnpm dev                    # Start all services
pnpm dev:frontend          # Frontend only
pnpm dev:backend           # Backend services only

# Building
pnpm build                 # Production build
pnpm build:frontend        # Frontend build only
pnpm start                 # Production start

# Testing
pnpm test                  # Run all tests
pnpm test:frontend         # Frontend tests
pnpm test:e2e             # End-to-end tests
pnpm lint                  # Code linting
pnpm type-check           # TypeScript checking

# Utilities
pnpm clean                 # Clean build artifacts
pnpm clean:all            # Full reset
pnpm logs                  # View all logs
pnpm status               # Service status
pnpm troubleshoot         # Debug helper
```

### Project Structure Guidelines

```
v0-watch-party/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth layout group
│   ├── (dashboard)/              # User dashboard
│   ├── (public)/                 # Public pages
│   ├── admin/                    # Admin panel
│   └── api/                      # API routes
├── components/                   # React components
│   ├── ui/                       # Base UI components
│   ├── auth/                     # Auth-related
│   ├── video/                    # Video components
│   ├── chat/                     # Chat system
│   ├── billing/                  # Payment forms
│   └── admin/                    # Admin tools
├── contexts/                     # React contexts
├── hooks/                        # Custom hooks
├── lib/                          # Utilities
├── public/                       # Static assets
├── styles/                       # Global styles
└── types/                        # TypeScript definitions
```

---

## 🌍 Deployment

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] CDN configured for assets
- [ ] Error monitoring enabled
- [ ] Performance monitoring setup
- [ ] Backup systems tested
- [ ] Security headers configured
- [ ] GDPR compliance verified
- [ ] Accessibility testing completed

### Deployment Commands

```bash
# Production build
pnpm build

# Docker deployment
docker build -f Dockerfile.frontend -t watch-party-frontend .
docker run -p 3000:3000 watch-party-frontend

# Vercel deployment
vercel --prod

# AWS deployment
aws s3 sync ./out s3://your-bucket-name
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | - |
| Largest Contentful Paint | < 2.5s | - |
| Cumulative Layout Shift | < 0.1 | - |
| First Input Delay | < 100ms | - |
| Time to Interactive | < 3.5s | - |

---

## 📚 Additional Resources

### Documentation Links
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)

### API Documentation
- [Backend PHP API](./backend-php/README.md)
- [Python ML Services](./backend-python/README.md)
- [WebSocket Events](./docs/websocket-api.md)

### Contributing
Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

### License
This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

**Built with ❤️ by the Watch Party Team**

*Last updated: July 19, 2025*
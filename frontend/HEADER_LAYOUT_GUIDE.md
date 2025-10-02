# Header & Layout Architecture

## Overview

The application now uses **context-aware layouts** with different headers for different sections:

## 🎯 Layout Types

### 1. **Marketing Layout** (Landing & Public Pages)
- **Routes**: `/` (homepage), `/pricing`, `/about`, etc.
- **Header**: `MarketingHeader` component
- **Features**:
  - Gradient WatchParty logo (purple → blue)
  - "Get Started" CTA button with gradient background
  - Minimalist, conversion-focused design
  - Clean navigation for public visitors
- **Footer**: `SiteFooter` with full site information

### 2. **Dashboard Layout** (Authenticated Pages)
- **Routes**: `/dashboard/*` (all dashboard pages)
- **Header**: `DashboardHeader` component
- **Features**:
  - 🔍 Global search bar (parties, videos, friends)
  - 🔔 Notifications dropdown with badge count
  - ⚙️ Quick settings access
  - 👤 User profile menu with:
    - User name & username
    - Pro/Premium badge
    - Profile link
    - Settings link
    - Sign out button
  - Full sidebar navigation (handled by `DashboardLayout`)
- **Footer**: Integrated within dashboard layout

### 3. **Auth Layout** (Login & Registration)
- **Routes**: `/auth/*` (login, register, forgot-password, etc.)
- **Header**: **None** (minimal distraction-free layout)
- **Features**:
  - Clean centered form
  - No navigation distractions
  - Focus on authentication flow
- **Footer**: **None**

---

## 📁 File Structure

```
frontend/
├── app/
│   ├── layout.tsx                     # Root layout - conditional rendering
│   ├── (dashboard)/
│   │   └── layout.tsx                 # Dashboard layout wrapper
│   └── auth/
│       └── login/page.tsx             # Auth pages (minimal layout)
│
└── components/
    ├── layout/
    │   ├── conditional-layout.tsx     # 🆕 Route-based layout switcher
    │   ├── marketing-header.tsx       # 🆕 Public pages header (renamed from site-header)
    │   ├── dashboard-header.tsx       # 🆕 Dashboard header
    │   └── site-footer.tsx            # Shared footer
    │
    └── dashboard/
        └── dashboard-layout.tsx       # Dashboard sidebar + content wrapper
```

---

## 🔄 How It Works

### Conditional Rendering Logic

The `ConditionalLayout` component in `app/layout.tsx` determines which layout to use:

```typescript
// Dashboard pages → Use DashboardLayout (no wrapper needed)
if (pathname.startsWith('/dashboard')) {
  return <>{children}</>
}

// Auth pages → Minimal layout (no header/footer)
if (pathname.startsWith('/auth')) {
  return <main>{children}</main>
}

// Marketing pages → MarketingHeader + footer
return (
  <>
    <MarketingHeader />
    <main>{children}</main>
    <SiteFooter />
  </>
)
```

### Dashboard Integration

The `DashboardLayout` component now includes:
1. **DashboardHeader** (top bar with search, notifications, user menu)
2. **Sidebar** (left navigation with collapsible sections)
3. **Main content area** (your dashboard pages)

---

## 🎨 Design System

### MarketingHeader
- **Background**: Dark blur (`bg-gray-950/80 backdrop-blur-xl`)
- **Logo**: Gradient circle with 🎬 emoji
- **Typography**: Bold purple "WatchParty" text
- **CTA**: Gradient button (purple → blue)

### DashboardHeader
- **Background**: Dark blur with top border
- **Height**: Fixed 64px (`h-16`)
- **Search**: Centered, max-width 2xl
- **Icons**: Emoji-based (🔔 🔍 ⚙️ 👤)
- **Dropdowns**: Glass effect with backdrop blur

---

## 🧪 Testing Routes

### Landing Page (MarketingHeader)
```
http://localhost:3000/
```
**Expected**: Gradient logo, "Get Started" button, marketing content

### Login Page (No Header)
```
http://localhost:3000/auth/login
```
**Expected**: Clean centered login form, no header/footer
**Test credentials**:
- Email: `admin@watchparty.local`
- Password: `admin123!`

### Dashboard (DashboardHeader)
```
http://localhost:3000/dashboard
```
**Expected**: Search bar, notifications, user menu, sidebar navigation

---

## 🚀 Benefits

1. ✅ **Context-Aware**: Each section has appropriate navigation
2. ✅ **Performance**: Only loads necessary components per route
3. ✅ **User Experience**: 
   - Marketing visitors see conversion-focused header
   - Authenticated users get rich dashboard navigation
   - Auth flows remain distraction-free
4. ✅ **Maintainable**: Clear separation of concerns
5. ✅ **Scalable**: Easy to add new layout types (e.g., admin panel)

---

## 📝 Notes

- **No icon library required**: Uses emoji for icons (🔍 🔔 ⚙️ 👤)
- **Client-side routing**: All headers use `next/link` for fast navigation
- **Responsive**: All headers adapt to mobile/desktop viewports
- **TypeScript**: Fully typed components

---

## 🔧 Future Enhancements

- [ ] Add breadcrumb navigation to dashboard
- [ ] Implement notification real-time updates
- [ ] Add keyboard shortcuts (Cmd+K for search)
- [ ] Mobile-optimized hamburger menu
- [ ] Admin-specific header for `/admin/*` routes

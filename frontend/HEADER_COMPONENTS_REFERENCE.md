# Header Components Visual Reference

## 🎨 Header Types Comparison

### 1. MarketingHeader (`/`)
**Purpose**: Landing page and public marketing pages  
**Location**: `components/layout/marketing-header.tsx`

```
┌─────────────────────────────────────────────────────────────────┐
│  [🎬 WatchParty]      Join Party  |  Login  |  [Get Started ✨]  │
│   gradient logo                              gradient button     │
└─────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Gradient logo circle (purple → blue)
- Bold "WatchParty" branding
- Simple navigation (Join Party, Login)
- Prominent "Get Started" CTA
- Clean, minimal design for conversions

**Code Structure**:
```tsx
<header className="sticky top-0 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
  <Logo /> {/* Gradient + emoji */}
  <Navigation /> {/* Join Party, Login */}
  <Button>Get Started</Button> {/* Gradient background */}
</header>
```

---

### 2. DashboardHeader (`/dashboard/*`)
**Purpose**: Authenticated user navigation  
**Location**: `components/layout/dashboard-header.tsx`

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [🎬 WatchParty]  [🔍 Search.....................] [🔔5] [⚙️] [👤 Alex ▼]  │
│   logo            full-width search bar          notify  set  user menu     │
└────────────────────────────────────────────────────────────────────────────┘
```

**Key Features**:
- Compact logo (links to /dashboard)
- **Global search bar** (parties, videos, friends)
- **Notification bell** with badge count
- **Settings icon** (quick access)
- **User profile menu**:
  - Avatar with gradient background
  - Username display
  - Dropdown with:
    - Profile link
    - Settings link
    - Sign out button

**Interactive Elements**:
- Search: Focus → purple border glow
- Notifications: Click → dropdown with recent items
- User menu: Click → profile dropdown

**Code Structure**:
```tsx
<header className="sticky top-0 h-16 border-b border-white/10 bg-gray-950/80 backdrop-blur-xl">
  <Logo href="/dashboard" />
  <SearchBar /> {/* Full-width with 🔍 icon */}
  <Actions>
    <NotificationButton count={5} /> {/* 🔔 with badge */}
    <SettingsButton /> {/* ⚙️ icon */}
    <UserMenu /> {/* 👤 with dropdown */}
  </Actions>
</header>
```

---

### 3. Auth Pages (No Header)
**Purpose**: Login, register, forgot password  
**Location**: Handled by `conditional-layout.tsx`

```
┌────────────────────────────────┐
│                                │
│    (no header - clean form)    │
│                                │
│      [Login Form Content]      │
│                                │
│    (no footer - focused UX)    │
│                                │
└────────────────────────────────┘
```

**Key Features**:
- **No header or footer** (distraction-free)
- Centered form layout
- Focus on authentication flow
- Minimal chrome for conversions

---

## 🎯 Usage by Route

| Route Pattern | Header Type | Footer | Layout |
|--------------|-------------|--------|--------|
| `/` | MarketingHeader | ✅ Yes | Marketing |
| `/pricing` | MarketingHeader | ✅ Yes | Marketing |
| `/about` | MarketingHeader | ✅ Yes | Marketing |
| `/dashboard` | DashboardHeader | ❌ No | Dashboard |
| `/dashboard/*` | DashboardHeader | ❌ No | Dashboard |
| `/auth/login` | ❌ None | ❌ No | Minimal |
| `/auth/register` | ❌ None | ❌ No | Minimal |

---

## 🔍 Visual Details

### MarketingHeader Styling
```css
/* Logo */
.logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(to-br, #9333ea, #2563eb);
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

/* "Get Started" Button */
.cta-button {
  background: linear-gradient(to-r, #9333ea, #2563eb);
  padding: 12px 32px;
  font-weight: 700;
  box-shadow: 0 20px 25px -5px rgba(147, 51, 234, 0.3);
}
```

### DashboardHeader Styling
```css
/* Search Bar */
.search-bar {
  max-width: 42rem; /* 2xl */
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

/* Notification Badge */
.notification-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 20px;
  height: 20px;
  background: #ef4444; /* red-500 */
  border-radius: 9999px;
  font-size: 10px;
}

/* User Avatar */
.user-avatar {
  width: 28px;
  height: 28px;
  background: linear-gradient(to-br, #a855f7, #3b82f6);
  border-radius: 8px;
}
```

---

## 📱 Responsive Behavior

### MarketingHeader
- **Desktop**: Full navigation visible
- **Mobile**: Hamburger menu (TODO)
- **Tablet**: Compact button text

### DashboardHeader
- **Desktop**: Full search bar visible
- **Mobile**: Search collapses to icon
- **Tablet**: User name hidden, avatar only

---

## 🧪 Testing Checklist

### MarketingHeader
- [ ] Logo links to `/`
- [ ] "Join Party" link works
- [ ] "Login" link goes to `/auth/login`
- [ ] "Get Started" button has gradient + hover effect
- [ ] Header sticks to top on scroll
- [ ] Backdrop blur effect visible

### DashboardHeader
- [ ] Logo links to `/dashboard`
- [ ] Search bar accepts input
- [ ] Search bar has focus styles (purple border)
- [ ] Notification bell shows badge count
- [ ] Notification dropdown opens on click
- [ ] Settings icon links to `/settings`
- [ ] User menu dropdown opens on click
- [ ] Profile link in dropdown works
- [ ] Sign out button visible

### Auth Pages
- [ ] No header visible on `/auth/login`
- [ ] No footer visible on `/auth/login`
- [ ] Form is vertically centered
- [ ] Layout is clean and focused

---

## 🎨 Color Palette

### Shared Colors
- **Background**: `#030712` (gray-950)
- **Border**: `rgba(255, 255, 255, 0.1)` (white/10)
- **Text Primary**: `#ffffff` (white)
- **Text Secondary**: `rgba(255, 255, 255, 0.7)` (white/70)

### Brand Gradients
- **Purple**: `#9333ea` (purple-600) → `#a855f7` (purple-500)
- **Blue**: `#2563eb` (blue-600) → `#3b82f6` (blue-500)
- **Combined**: Purple → Blue gradient

### Interactive States
- **Hover**: Background opacity increases to `0.1`
- **Focus**: Purple border `rgba(147, 51, 234, 0.5)`
- **Active**: Background opacity `0.15`

---

## 🚀 Implementation Notes

1. **No external dependencies**: All icons use emoji
2. **Accessibility**: Proper ARIA labels (TODO)
3. **Performance**: Minimal re-renders with local state
4. **TypeScript**: Fully typed props and state
5. **Client components**: All headers use `'use client'`

---

## 📊 Component Hierarchy

```
RootLayout (app/layout.tsx)
├── ConditionalLayout
    │
    ├── MarketingLayout (/, /pricing, etc.)
    │   ├── MarketingHeader
    │   ├── <Page Content>
    │   └── SiteFooter
    │
    ├── DashboardLayout (/dashboard/*)
    │   ├── DashboardHeader ⭐ NEW
    │   ├── Sidebar (collapsible)
    │   └── <Dashboard Content>
    │
    └── AuthLayout (/auth/*)
        └── <Auth Form> (no header/footer)
```

---

## 💡 Best Practices

### When to Use Each Header

**MarketingHeader**:
- ✅ Landing page
- ✅ Public content pages
- ✅ Pricing, about, contact
- ✅ Blog/documentation
- ❌ User-specific pages

**DashboardHeader**:
- ✅ User dashboard
- ✅ Content management
- ✅ Settings pages
- ✅ User profiles
- ❌ Public pages

**No Header (Auth)**:
- ✅ Login/register
- ✅ Password reset
- ✅ Email verification
- ✅ Onboarding flows
- ❌ Everything else

---

## 🔗 Quick Links

- **Marketing Header**: `/components/layout/marketing-header.tsx`
- **Dashboard Header**: `/components/layout/dashboard-header.tsx`
- **Conditional Logic**: `/components/layout/conditional-layout.tsx`
- **Dashboard Layout**: `/components/dashboard/dashboard-layout.tsx`
- **Full Guide**: See `HEADER_LAYOUT_GUIDE.md`

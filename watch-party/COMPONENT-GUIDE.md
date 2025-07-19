# Watch Party Component Architecture

## 📁 Component Organization

```
components/
├── admin/           # Admin panel specific components
├── auth/            # Authentication & security components  
├── billing/         # Subscription & payment components
├── chat/            # Real-time messaging components
├── dashboard/       # User dashboard components
├── landing/         # Marketing/landing page components
├── layout/          # Site-wide layout components
├── notifications/   # Notification system components
├── parties/         # Watch party specific components
├── social/          # Friend/social features components
├── support/         # Help & support components
├── ui/              # Base UI components (Shadcn/ui)
├── video/           # Video player & streaming components
└── watch-party/     # Live watch party room components
```

## 🎨 Design System - "Neo Stadium Glow"

### Color Usage Guide

#### Primary Actions & Navigation
```css
/* Electric Blue - Main brand color */
.primary { color: #3ABEF9; }
/* Use for: Primary buttons, links, active states, logos */
```

#### Status & Feedback  
```css
/* Success - Lime Glow */
.success { color: #9FF87A; }
/* Use for: Online status, success messages, confirmations */

/* Warning - Amber */
.warning { color: #FFC857; }
/* Use for: Warnings, pending states, attention needed */

/* Error - Rad Red */
.error { color: #FF3B3B; }
/* Use for: Errors, offline status, destructive actions */
```

#### Special Features
```css
/* Premium - Gold */
.premium { color: #FFD700; }
/* Use for: Premium badges, paid features, upgrades */

/* Highlight - Electric Cyan */
.highlight { color: #14FFEC; }
/* Use for: Focus states, active elements, emphasis */

/* Violet Pop - Purple */
.violet { color: #7C5FFF; }
/* Use for: Secondary accents, tooltips, special buttons */

/* Soft Pink - Emotional */
.pink { color: #FF69B4; }
/* Use for: Reactions, hearts, emotive elements */
```

### Typography Hierarchy
```css
/* Text Colors */
.neo-text-primary { color: #FFFFFF; }      /* Main headings, primary text */
.neo-text-secondary { color: #B3B3B3; }   /* Body text, descriptions */  
.neo-text-tertiary { color: #8A8A8A; }    /* Muted text, timestamps */
```

### Surface Colors
```css
/* Backgrounds */
.neo-background { background: #0E0E10; }        /* Main app background */
.neo-surface { background: #1A1A1D; }           /* Cards, modals, panels */
.neo-surface-elevated { background: #242428; }   /* Elevated surfaces */

/* Borders */
.neo-border { border-color: #2E2E32; }          /* Standard borders */
.neo-border-strong { border-color: #3A3A3F; }   /* Emphasized borders */
```

## 🧩 Key Component Categories

### 1. Layout & Navigation (7 components)
- `<Navbar />` - Responsive navigation with auth states
- `<Footer />` - Site-wide footer with links
- `<DashboardSidebar />` - User dashboard navigation
- `<AdminSidebar />` - Admin panel navigation
- `<DashboardHeader />` - Dashboard page header
- `<AdminHeader />` - Admin page header
- `<Breadcrumbs />` - Navigation breadcrumbs

### 2. Authentication & Security (7 components)
- `<LoginForm />` - Email/password + social login
- `<RegisterForm />` - User registration
- `<ForgotPasswordForm />` - Password reset request
- `<ResetPasswordForm />` - Password reset with token
- `<SocialLoginButtons />` - OAuth provider buttons
- `<ProtectedRoute />` - Authentication guard wrapper
- `<AdminGuard />` - Admin-only route protection

### 3. Video & Streaming (8 components)
- `<VideoPlayer />` - Custom video player (supports GDrive/S3/local)
- `<StreamStatusBanner />` - Live/scheduled/ended status
- `<ReactionOverlay />` - Floating emoji reactions
- `<ViewerCountBadge />` - Live viewer count display
- `<LiveBadge />` - Live streaming indicator
- `<PartyLoading />` - Loading state for watch parties
- `<PartyNotFound />` - Error state for invalid parties
- `<PartyControls />` - Host control panel

### 4. Chat & Social (10 components)
- `<ChatBox />` - Real-time messaging interface
- `<MessageBubble />` - Individual chat message
- `<EmojiPicker />` - Emoji selection modal
- `<ParticipantsList />` - Room member list
- `<FriendCard />` - Friend profile card
- `<InviteFriends />` - Friend invitation system
- `<SharePartyDialog />` - Party sharing modal
- `<NotificationBell />` - Notification icon with count
- `<NotificationList />` - Notification feed
- `<WatchPartyRoom />` - Complete watch party interface

### 5. Billing & Subscriptions (3 components)
- `<PlanCard />` - Subscription plan display
- `<PaymentForm />` - Stripe payment integration
- `<InvoiceList />` - Billing history display

### 6. Admin & Management (8 components)
- `<AdminStats />` - System metrics dashboard
- `<SystemHealth />` - Service status monitoring
- `<RecentActivity />` - Activity feed
- `<QuickActions />` - Admin action shortcuts
- `<UserTable />` - User management interface
- `<VideoFlagTable />` - Content moderation
- `<LogViewer />` - System log display
- `<SupportCenter />` - Help ticket system

### 7. Party Management (3 components)
- `<CreatePartyForm />` - Party creation wizard
- `<PartyCard />` - Party preview card
- `<PartySettings />` - Party configuration

### 8. Dashboard & Analytics (5 components)
- `<DashboardStats />` - User statistics
- `<ActivityFeed />` - User activity timeline
- `<RecentParties />` - Recent watch parties
- `<QuickActions />` - Dashboard shortcuts
- `<AnalyticsChart />` - Data visualization

## 🎯 UI Component Library (40+ base components)

### Form Elements
- `<Button />` - Multiple variants (primary, secondary, ghost, destructive)
- `<Input />` - Text input with validation states
- `<Textarea />` - Multi-line text input
- `<Select />` - Dropdown selection
- `<Checkbox />` - Boolean input
- `<Switch />` - Toggle switch
- `<RadioGroup />` - Single selection from options
- `<Slider />` - Numeric range input
- `<Calendar />` - Date picker
- `<FileDropzone />` - File upload zone

### Feedback & Status
- `<Badge />` - Status indicators
- `<Progress />` - Progress bars
- `<Skeleton />` - Loading placeholders
- `<Toast />` - Notification popups
- `<Alert />` - Inline messages
- `<Spinner />` - Loading indicators

### Layout & Structure
- `<Card />` - Content containers
- `<Tabs />` - Tabbed content
- `<Accordion />` - Collapsible sections
- `<Separator />` - Visual dividers
- `<ScrollArea />` - Custom scrollbars
- `<ResizablePanel />` - Resizable layouts

### Overlays & Modals
- `<Dialog />` - Modal dialogs
- `<Sheet />` - Slide-out panels  
- `<Popover />` - Floating content
- `<Tooltip />` - Hover information
- `<DropdownMenu />` - Context menus
- `<HoverCard />` - Rich hover content

### Data Display
- `<Table />` - Data tables
- `<Avatar />` - User profile images
- `<AspectRatio />` - Responsive media containers
- `<Carousel />` - Image/content sliders
- `<Chart />` - Data visualization
- `<Pagination />` - Page navigation

## 🚀 Usage Examples

### Creating a Watch Party Card
```tsx
<PartyCard 
  party={{
    id: "123",
    title: "Champions League Final",
    status: "live",
    participants: 42,
    thumbnail: "/thumbnail.jpg"
  }}
/>
```

### Building a Premium Feature
```tsx
<Card className="border-premium bg-premium/5">
  <Badge className="bg-premium text-premium-foreground">
    <Crown className="h-3 w-3 mr-1" />
    Premium
  </Badge>
  <h3 className="text-premium">4K Ultra HD Streaming</h3>
</Card>
```

### Admin Dashboard Widget
```tsx
<Card className="neo-surface">
  <CardHeader>
    <CardTitle className="text-neo-text-primary">System Health</CardTitle>
  </CardHeader>
  <CardContent>
    <SystemHealth health={healthData} />
  </CardContent>
</Card>
```

## 🎨 Custom CSS Utilities

### Button Styles
```css
.btn-primary    /* Primary electric blue button */
.btn-secondary  /* Secondary neutral button */
.btn-premium    /* Gold premium button */
.btn-success    /* Lime green success button */
.btn-error      /* Red destructive button */
```

### Text Gradients
```css
.text-gradient-primary  /* Blue to purple gradient text */
.text-gradient-premium  /* Gold gradient text */
```

### Card Styles
```css
.card           /* Standard neo card with glow shadow */
.card-elevated  /* Elevated card with stronger shadow */
.card-premium   /* Premium card with gold accent */
```

### Input Styles  
```css
.input-base     /* Standard dark input with focus glow */
.input-error    /* Error state with red border */
.input-success  /* Success state with green border */
```

This architecture provides a scalable, maintainable, and visually cohesive component system perfect for a modern streaming platform. Each component follows the "Neo Stadium Glow" design language while maintaining accessibility and performance standards.

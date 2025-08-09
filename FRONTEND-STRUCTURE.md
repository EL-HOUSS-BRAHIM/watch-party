# Watch Party Frontend Structure

> **⚠️ DEPLOYMENT UPDATE**: This project now uses a unified deployment system. See the root-level `deploy.sh` script and GitHub Actions workflow for automated CI/CD deployment.

This document provides a comprehensive overview of the Watch Party frontend application structure, including all pages, components, and their organization.

## 📁 Project Overview

The frontend is built with **Next.js 14** using the App Router architecture, TypeScript, and Tailwind CSS. It follows a modern component-based architecture with clear separation of concerns.

## 🗂️ Updated File Structure

```
frontend/
├── app/                           # Next.js App Router pages
│   ├── (auth)/                   # Authentication route group
│   │   ├── callback/             # OAuth callback handler
│   │   ├── login/                # User login
│   │   ├── register/             # User registration
│   │   ├── forgot-password/      # Password reset
│   │   └── reset-password/       # Password reset form
│   ├── dashboard/                # User dashboard pages
│   ├── watch/[roomId]/          # Watch party rooms
│   ├── profile/[userId]/        # User profiles
│   └── [other pages]/           # Additional pages
├── components/                   # Reusable UI components
│   ├── ui/                      # Base UI components
│   ├── auth/                    # Authentication components
│   ├── video/                   # Video-related components
│   ├── party/                   # Party management components
│   ├── social/                  # Social networking components
│   ├── notifications/           # Notification components
│   ├── chat/                    # Chat interface components
│   ├── billing/                 # Billing and subscription components
│   └── [other feature dirs]/   # Other feature-specific components
├── contexts/                    # React context providers
├── hooks/                       # Custom React hooks
├── lib/                         # Utility libraries and API clients
├── types/                       # TypeScript type definitions
├── styles/                      # Global styles
├── public/                      # Static assets
└── __tests__/                   # Test files
```

## 🏗️ Core Architecture

```
frontend/
├── app/                    # Next.js App Router pages
├── components/             # Reusable UI components
├── contexts/              # React context providers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility libraries and API clients
├── types/                 # TypeScript type definitions
├── styles/                # Global styles
├── public/                # Static assets
└── __tests__/             # Test files
```

## 📄 Pages Structure

### Root Level Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Home/Landing page |
| `/about` | `app/about/page.tsx` | About page |
| `/discover` | `app/discover/page.tsx` | Content discovery page |
| `/help` | `app/help/page.tsx` | Help and support |
| `/invite` | `app/invite/page.tsx` | Invitation handling |
| `/onboarding` | `app/onboarding/page.tsx` | User onboarding flow |
| `/privacy` | `app/privacy/page.tsx` | Privacy policy |
| `/search` | `app/search/page.tsx` | Search functionality |
| `/store` | `app/store/page.tsx` | In-app store |
| `/terms` | `app/terms/page.tsx` | Terms of service |
| `/verify-email` | `app/verify-email/page.tsx` | Email verification |

### Authentication Pages (`(auth)` group)

| Route | File | Description |
|-------|------|-------------|
| `/login` | `app/(auth)/login/page.tsx` | User login |
| `/register` | `app/(auth)/register/page.tsx` | User registration |
| `/forgot-password` | `app/(auth)/forgot-password/page.tsx` | Password reset request |
| `/reset-password` | `app/(auth)/reset-password/page.tsx` | Password reset form |
| `/callback` | `app/(auth)/callback/page.tsx` | OAuth callback handler |

### Watch Party Pages

| Route | File | Description |
|-------|------|-------------|
| `/watch/[roomId]` | `app/watch/[roomId]/page.tsx` | Watch party room |

### User Profile Pages

| Route | File | Description |
|-------|------|-------------|
| `/profile/[userId]` | `app/profile/[userId]/page.tsx` | User profile view |

### Dashboard Pages

The dashboard contains numerous sub-sections:

| Route | File | Description |
|-------|------|-------------|
| `/dashboard` | `app/dashboard/page.tsx` | Main dashboard |
| `/dashboard/account` | `app/dashboard/account/page.tsx` | Account settings |
| `/dashboard/activity` | `app/dashboard/activity/page.tsx` | User activity |
| `/dashboard/admin` | `app/dashboard/admin/page.tsx` | Admin panel |
| `/dashboard/analytics` | `app/dashboard/analytics/page.tsx` | Analytics dashboard |
| `/dashboard/billing` | `app/dashboard/billing/page.tsx` | Billing management |
| `/dashboard/events` | `app/dashboard/events/page.tsx` | Events management |
| `/dashboard/feedback` | `app/dashboard/feedback/page.tsx` | User feedback |
| `/dashboard/friends` | `app/dashboard/friends/page.tsx` | Friends management |
| `/dashboard/groups` | `app/dashboard/groups/page.tsx` | Groups management |
| `/dashboard/i18n` | `app/dashboard/i18n/page.tsx` | Internationalization |
| `/dashboard/integrations` | `app/dashboard/integrations/page.tsx` | Third-party integrations |
| `/dashboard/messages` | `app/dashboard/messages/page.tsx` | Messaging center |
| `/dashboard/notifications` | `app/dashboard/notifications/page.tsx` | Notification settings |
| `/dashboard/parties` | `app/dashboard/parties/page.tsx` | Party management |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | Profile settings |
| `/dashboard/rewards` | `app/dashboard/rewards/page.tsx` | Rewards system |
| `/dashboard/security` | `app/dashboard/security/page.tsx` | Security settings |
| `/dashboard/settings` | `app/dashboard/settings/page.tsx` | General settings |
| `/dashboard/social` | `app/dashboard/social/page.tsx` | Social features |
| `/dashboard/videos` | `app/dashboard/videos/page.tsx` | Video management |

### Analytics Pages

| Route | File | Description |
|-------|------|-------------|
| `/analytics` | `app/analytics/page.tsx` | Analytics overview |

## 🧩 Components Structure

### Core Components

| Component | File | Description |
|-----------|------|-------------|
| Providers | `components/providers.tsx` | Root context providers |
| Theme Provider | `components/theme-provider.tsx` | Theme management |
| Client Layout | `app/ClientLayout.tsx` | Client-side layout wrapper |

### UI Components (`components/ui/`)

The UI component library includes:

#### Form & Input Components
- `button.tsx` - Button component
- `input.tsx` - Input field
- `textarea.tsx` - Text area
- `select.tsx` - Select dropdown
- `checkbox.tsx` - Checkbox input
- `radio-group.tsx` - Radio button group
- `switch.tsx` - Toggle switch
- `slider.tsx` - Range slider
- `form.tsx` & `form-enhanced.tsx` - Form components
- `label.tsx` - Form labels

#### Layout Components
- `card.tsx` - Card container
- `sheet.tsx` - Side sheet/panel
- `dialog.tsx` - Modal dialog
- `drawer.tsx` - Drawer component
- `sidebar.tsx` - Sidebar navigation
- `tabs.tsx` - Tab interface
- `accordion.tsx` - Collapsible accordion
- `collapsible.tsx` - Collapsible content
- `separator.tsx` - Visual separator
- `scroll-area.tsx` - Scrollable area
- `resizable.tsx` - Resizable panels

#### Navigation Components
- `navigation-menu.tsx` - Main navigation
- `breadcrumb.tsx` - Breadcrumb navigation
- `pagination.tsx` - Pagination controls
- `menubar.tsx` - Menu bar
- `command.tsx` & `command-palette.tsx` - Command interface

#### Feedback Components
- `alert.tsx` - Alert messages
- `toast.tsx` & `toaster.tsx` - Toast notifications
- `loading-spinner.tsx` - Loading indicator
- `skeleton.tsx` & `skeleton-loader.tsx` - Loading skeletons
- `progress.tsx` - Progress indicator

#### Display Components
- `avatar.tsx` - User avatar
- `badge.tsx` - Status badges
- `table.tsx` - Data tables
- `calendar.tsx` - Calendar widget
- `chart.tsx` - Charts and graphs
- `carousel.tsx` - Image/content carousel
- `aspect-ratio.tsx` - Aspect ratio container

#### Interactive Components
- `dropdown-menu.tsx` - Dropdown menus
- `context-menu.tsx` & `context-menu-enhanced.tsx` - Context menus
- `popover.tsx` - Popover content
- `hover-card.tsx` - Hover cards
- `tooltip.tsx` & `tooltip-enhanced.tsx` - Tooltips
- `toggle.tsx` & `toggle-group.tsx` - Toggle buttons

#### Mobile Components
- `mobile-drawer.tsx` - Mobile drawer
- `mobile-video-controls.tsx` - Mobile video controls
- `touch-slider.tsx` - Touch-friendly slider

#### Specialized Components
- `lazy-image.tsx` - Lazy-loaded images
- `drag-drop-upload.tsx` - File upload with drag & drop
- `virtual-list.tsx` - Virtualized lists
- `error-boundary.tsx` - Error boundary wrapper
- `input-otp.tsx` - OTP input field

#### Watch Party Specific Components
- `watch-party-button.tsx` - Branded button
- `watch-party-card.tsx` - Branded card
- `watch-party-form.tsx` - Branded form
- `watch-party-input.tsx` - Branded input
- `watch-party-modal.tsx` - Branded modal
- `watch-party-select.tsx` - Branded select
- `watch-party-table.tsx` - Branded table
- `watch-party-textarea.tsx` - Branded textarea

### Feature Components

#### Authentication (`components/auth/`)
- `auth-guard.tsx` - Route protection
- `protected-route.tsx` - Protected route wrapper

#### Video (`components/video/`)
- `video-player.tsx` - Basic video player
- `advanced-video-player.tsx` - Advanced video player with controls
- `video-uploader.tsx` - Video upload interface
- `video-library.tsx` - Video library browser
- `video-processing-pipeline.tsx` - Video processing workflow
- `video-quality-selector.tsx` - Video quality selection component

#### Party Management (`components/party/`)
- `party-controls.tsx` - Party control interface
- `participant-list.tsx` - List of party participants
- `party-invite-dialog.tsx` - Party invitation management
- `join-by-code-dialog.tsx` - Join party by room code
- `party-host-controls.tsx` - Host control panel
- `party-status-indicator.tsx` - Real-time sync status indicator

#### Chat (`components/chat/`)
- `chat-interface.tsx` - Real-time chat interface

#### Notifications (`components/notifications/`)
- `notification-center.tsx` - Notification management
- `notification-bell.tsx` - Notification indicator
- `notification-preferences.tsx` - Granular notification settings
- `notification-grouping.tsx` - Smart notification grouping and filtering

#### Billing (`components/billing/`)
- `subscription-plans.tsx` - Subscription plan selection
- `payment-methods.tsx` - Payment method management
- `billing-history.tsx` - Billing history view
- `usage-stats.tsx` - Usage statistics

#### Theme (`components/theme/`)
- `theme-switcher.tsx` - Theme toggle component
- `theme-provider.tsx` - Theme context provider

#### Admin (`components/admin/`)
- Admin panel components for system management

#### Analytics (`components/analytics/`)
- Analytics and reporting components

#### Integrations (`components/integrations/`)
- `integration-api-system.tsx` - Third-party integration management

#### Groups (`components/groups/`)
- `group-management-system.tsx` - Group management interface

#### Moderation (`components/moderation/`)
- `content-moderation-system.tsx` - Content moderation tools

#### Security (`components/security/`)
- `advanced-security-system.tsx` - Security management interface

#### Performance (`components/performance/`)
- `performance-optimizer.tsx` - Performance optimization tools

#### Monitoring (`components/monitoring/`)
- `monitoring-dashboard.tsx` - System monitoring dashboard

#### Testing (`components/testing/`)
- `testing-suite-dashboard.tsx` - Testing interface

#### Documentation (`components/documentation/`)
- `documentation-manager.tsx` - Documentation management

#### Social (`components/social/`)
- Social networking components
- `enhanced-friend-search.tsx` - Advanced friend search with suggestions
- `friend-requests-management.tsx` - Complete friend request management
- `block-list-management.tsx` - Privacy and blocking controls
- `friend-profile-preview.tsx` - Rich user profile previews

#### Events (`components/events/`)
- Event management components

#### I18n (`components/i18n/`)
- Internationalization components

#### Layout (`components/layout/`)
- Layout-specific components

#### SEO (`components/seo/`)
- SEO optimization components

#### Deployment (`components/deployment/`)
- Deployment management components

## 🔌 API Integration

### Authentication API (`lib/api/auth.ts`)
- OAuth URL generation for social providers
- Social authentication completion
- Token management and refresh
- User registration and login

### Friends API Integration
- User search with advanced filtering
- Friend suggestion algorithms
- Request management (send, accept, reject, cancel)
- Block list management with privacy controls

### Party API Integration
- Room creation and management
- Invitation system with multiple delivery methods
- Real-time synchronization APIs
- Participant management

### Notification API Integration
- Preference management with granular controls
- Real-time notification delivery
- Grouping and filtering algorithms
- Push notification registration

### Store API Integration
- Item catalog with search and filtering
- Purchase transaction handling
- Inventory management
- Achievement tracking and rewards

## 🎯 Contexts

| Context | File | Description |
|---------|------|-------------|
| Auth Context | `contexts/auth-context.tsx` | Authentication state management |
| Socket Context | `contexts/socket-context.tsx` | WebSocket connection management |
| Feature Flag Context | `contexts/feature-flag-context.tsx` | Feature flag management |

## 🪝 Custom Hooks

| Hook | File | Description |
|------|------|-------------|
| useApi | `hooks/use-api.ts` | API interaction hook |
| useDebounce | `hooks/use-debounce.ts` | Debouncing functionality |
| useI18n | `hooks/use-i18n.tsx` | Internationalization hook |
| useKeyboardShortcuts | `hooks/use-keyboard-shortcuts.tsx` | Keyboard shortcut handling |
| useMobile | `hooks/use-mobile.tsx` | Mobile device detection |
| useToast | `hooks/use-toast.ts` | Toast notification hook |

## 📚 Libraries (`lib/`)

| Directory | Description |
|-----------|-------------|
| `lib/api/` | API client and utilities |
| `lib/i18n/` | Internationalization utilities |
| `lib/performance/` | Performance optimization utilities |
| `lib/stores/` | State management stores |
| `lib/api.ts` | Main API client |
| `lib/utils.ts` | Utility functions |

## 🎨 Styling

| File | Description |
|------|-------------|
| `styles/globals.css` | Global CSS styles |
| `app/globals.css` | App-specific global styles |
| `tailwind.config.ts` | Tailwind CSS configuration |
| `postcss.config.mjs` | PostCSS configuration |

## 🔧 Configuration Files

| File | Description |
|------|-------------|
| `next.config.mjs` | Next.js configuration |
| `tsconfig.json` | TypeScript configuration |
| `package.json` | Dependencies and scripts |
| `components.json` | UI components configuration |
| `.env.local` | Environment variables |

## 🧪 Testing

| Directory/File | Description |
|----------------|-------------|
| `__tests__/` | Test files organized by feature |
| `jest.config.js` | Jest configuration |
| `jest.setup.js` | Jest setup file |
| `playwright.config.ts` | Playwright E2E test configuration |
| `e2e/` | End-to-end tests |

## 🚀 Development Scripts

The application includes several development scripts accessible through the `start-dev.sh` file for easy development setup.

## 📦 Dependencies

### Core Dependencies
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Core React library
- **TypeScript 5** - Type safety and development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **date-fns** - Date utility library
- **Zod** - Runtime type validation
- **Socket.io Client** - Real-time communication

### UI Component Library
- Complete set of accessible, customizable components
- Consistent design system with theme support
- Mobile-responsive components
- Advanced form handling with validation

## 📱 Mobile Support

The application includes comprehensive mobile support with:
- Mobile-specific UI components
- Touch-friendly controls
- Responsive design patterns
- Mobile video player optimizations

## 🌐 Internationalization

Full i18n support is implemented with:
- Multi-language components
- Translation management
- Locale-specific formatting
- RTL language support

## 🔒 Security Features

- Advanced security system components
- Authentication guards
- Protected routes
- Content moderation tools

This architecture provides a scalable, maintainable, and feature-rich frontend for the Watch Party application, supporting everything from basic video watching to advanced social features and administrative functionality.

## 🆕 Recently Implemented Features

### Social Authentication & OAuth
- Complete OAuth callback handling for Google and GitHub
- Secure token management and error handling
- Seamless integration with existing auth flow

### Enhanced Party Management
- **Party Invite System**: Room code sharing, email invitations, invite links
- **Join by Code**: Simple room code entry with validation
- **Host Controls**: Comprehensive party management with participant controls
- **Status Indicators**: Real-time sync status and connection monitoring

### Advanced Video Features
- **Quality Selector**: Multi-quality video streaming with bitrate display
- Smooth quality switching without interruption
- Adaptive streaming support

### Complete Friends System
- **Smart Friend Search**: AI-powered suggestions based on mutual friends, location, and interests
- **Request Management**: Full lifecycle management of friend requests
- **Privacy Controls**: Comprehensive blocking system with reason tracking
- **Profile Previews**: Rich user profiles with activity history and achievements

### Enhanced Notifications
- **Granular Preferences**: Category-based notification settings with priority levels
- **Smart Grouping**: Intelligent notification batching and filtering
- **Quiet Hours**: Time-based notification management
- **Rate Limiting**: Configurable notification frequency controls

### Store & Rewards Integration
- Comprehensive store system with item browsing and purchasing
- Achievement system with progress tracking
- Point-based economy with inventory management
- Cart functionality and purchase history

### Technical Improvements
- Type-safe TypeScript implementation across all components
- Responsive design with mobile-first approach
- Error boundaries and comprehensive error handling
- Performance optimizations with debouncing and lazy loading
- Accessibility features with proper ARIA labels

# 🎬 Watch Party Frontend

A modern, real-time watch party application that allows users to watch videos together, chat, and share experiences in synchronized viewing sessions. Built with Next.js 14 and cutting-edge web technologies.

![Watch Party Demo](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4-38B2AC)

## 🌟 Project Overview

Watch Party is a comprehensive platform that enables users to:

- **Create and join synchronized watch parties** with real-time video synchronization
- **Chat in real-time** during viewing sessions with emoji reactions and moderation
- **Manage video libraries** with upload, organization, and sharing capabilities
- **Build social connections** through friend systems and activity feeds
- **Access admin tools** for platform management and analytics
- **Handle subscriptions** with integrated billing and payment processing

The application supports multiple video formats, real-time communication, and scales to handle thousands of concurrent users across multiple watch parties.

## 🛠️ Frontend Technologies

### Core Framework
- **Next.js 14** - React framework with App Router, Server Components, and Server Actions
- **React 18** - UI library with concurrent features and Suspense
- **TypeScript 5.0** - Type-safe development with strict mode enabled

### Styling & UI
- **Tailwind CSS 3.4** - Utility-first CSS framework with custom design system
- **shadcn/ui** - High-quality, accessible React components
- **Lucide React** - Beautiful, customizable SVG icons
- **Framer Motion** - Smooth animations and transitions

### State Management
- **Zustand** - Lightweight state management for global app state
- **React Context** - Built-in state management for authentication and features
- **React Query/TanStack Query** - Server state management and caching

### Real-time Communication
- **Socket.IO Client** - WebSocket communication for real-time features
- **WebRTC** - Peer-to-peer video synchronization
- **Server-Sent Events** - Live notifications and updates

### Development & Testing
- **Jest** - Unit testing framework with React Testing Library
- **Playwright** - End-to-end testing for critical user journeys
- **ESLint** - Code linting with Next.js and TypeScript rules
- **Prettier** - Code formatting and style consistency

### Performance & Optimization
- **Bundle Analyzer** - Webpack bundle analysis and optimization
- **Code Splitting** - Lazy loading for improved performance
- **Image Optimization** - Next.js Image component with WebP support
- **SEO Optimization** - Meta tags, structured data, and sitemap generation

## 📁 Project Structure

\`\`\`
watch-party-frontend/
├── app/                          # Next.js App Router pages
│   ├── (auth)/                   # Authentication pages group
│   │   ├── login/               # Login page
│   │   ├── register/            # Registration page
│   │   └── layout.tsx           # Auth layout wrapper
│   ├── (dashboard)/             # Protected dashboard pages
│   │   ├── admin/               # Admin panel pages
│   │   ├── billing/             # Billing and subscription pages
│   │   ├── dashboard/           # Main dashboard
│   │   ├── friends/             # Social features pages
│   │   ├── parties/             # Watch party management
│   │   ├── settings/            # User settings
│   │   ├── videos/              # Video library pages
│   │   └── layout.tsx           # Dashboard layout
│   ├── watch/[roomId]/          # Dynamic watch party rooms
│   ├── globals.css              # Global styles and Tailwind imports
│   ├── layout.tsx               # Root layout with providers
│   └── page.tsx                 # Landing page
├── components/                   # Reusable React components
│   ├── admin/                   # Admin panel components
│   ├── auth/                    # Authentication components
│   ├── billing/                 # Billing and payment components
│   ├── chat/                    # Real-time chat components
│   ├── layout/                  # Layout and navigation components
│   ├── notifications/           # Notification system components
│   ├── party/                   # Watch party specific components
│   ├── social/                  # Social features components
│   ├── ui/                      # Base UI components (shadcn/ui)
│   └── video/                   # Video player and management components
├── contexts/                     # React Context providers
│   ├── auth-context.tsx         # Authentication state management
│   ├── feature-flag-context.tsx # Feature flag management
│   └── socket-context.tsx       # WebSocket connection management
├── hooks/                        # Custom React hooks
│   ├── use-auth.ts              # Authentication hooks
│   ├── use-socket.ts            # WebSocket hooks
│   └── use-toast.ts             # Toast notification hooks
├── lib/                          # Utility libraries and configurations
│   ├── api/                     # API client and endpoints
│   ├── performance/             # Performance optimization utilities
│   ├── stores/                  # Zustand store definitions
│   └── utils.ts                 # Common utility functions
├── types/                        # TypeScript type definitions
│   ├── api.ts                   # API response types
│   ├── auth.ts                  # Authentication types
│   └── index.ts                 # Exported type definitions
├── __tests__/                    # Test files
│   ├── components/              # Component unit tests
│   ├── contexts/                # Context provider tests
│   └── lib/                     # Utility function tests
├── e2e/                          # End-to-end tests
│   ├── auth.spec.ts             # Authentication flow tests
│   ├── admin.spec.ts            # Admin panel tests
│   └── watch-party.spec.ts      # Watch party functionality tests
└── public/                       # Static assets
    ├── icons/                   # App icons and favicons
    └── images/                  # Static images and graphics
\`\`\`

## 🚀 Installation and Setup

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm, yarn, or pnpm** - Package manager
- **Git** - Version control

### Step 1: Clone the Repository

\`\`\`bash
git clone https://github.com/your-username/watch-party-frontend.git
cd watch-party-frontend
\`\`\`

### Step 2: Install Dependencies

\`\`\`bash
# Using npm
npm install

# Using yarn
yarn install

# Using pnpm
pnpm install
\`\`\`

### Step 3: Environment Configuration

1. Copy the example environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

2. Configure the environment variables in `.env.local`:
\`\`\`bash
# Required: API and WebSocket URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# Required: Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Third-party integrations
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-key

# Optional: Analytics and monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
\`\`\`

### Step 4: Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Step 5: Build for Production

\`\`\`bash
npm run build
npm run start
\`\`\`

## 📖 Usage

### Getting Started

1. **Registration/Login**: Create an account or sign in with existing credentials
2. **Dashboard**: Access your personal dashboard with recent activity and quick actions
3. **Create Watch Party**: Start a new watch party by uploading a video or selecting from your library
4. **Join Watch Party**: Use a room code or invitation link to join existing parties
5. **Video Management**: Upload, organize, and manage your video library
6. **Social Features**: Add friends, view activity feeds, and discover new content

### Key Features

#### Watch Parties
- **Real-time Synchronization**: All participants see the same video timestamp
- **Chat Integration**: Text chat with emoji reactions and moderation tools
- **Participant Management**: Host controls for managing viewers and permissions
- **Screen Sharing**: Share your screen for presentations or discussions

#### Video Management
- **Upload System**: Drag-and-drop video uploads with progress tracking
- **Library Organization**: Folders, tags, and search functionality
- **Format Support**: MP4, WebM, AVI, and other common video formats
- **Quality Settings**: Automatic quality adjustment based on connection speed

#### Social Platform
- **Friend System**: Send/receive friend requests and manage connections
- **Activity Feeds**: See what friends are watching and sharing
- **User Profiles**: Customizable profiles with watch history and preferences
- **Discovery**: Find new content and users through recommendations

## 🧩 Components

### Core Components

#### `VideoPlayer` (`components/video/video-player.tsx`)
Advanced video player with synchronization capabilities:
- Custom controls with play/pause, seek, volume, and fullscreen
- Real-time synchronization across multiple clients
- Quality selection and playback speed controls
- Subtitle support and accessibility features

#### `ChatInterface` (`components/chat/chat-interface.tsx`)
Real-time chat system for watch parties:
- Message sending and receiving with WebSocket
- Emoji reactions and custom emotes
- Message moderation and filtering
- User mentions and notifications

#### `ParticipantList` (`components/party/participant-list.tsx`)
Displays and manages watch party participants:
- Real-time participant updates
- User roles and permissions (host, moderator, viewer)
- Kick/ban functionality for hosts
- Participant status indicators

### Layout Components

#### `DashboardSidebar` (`components/layout/dashboard-sidebar.tsx`)
Navigation sidebar for the dashboard:
- Collapsible design with icons and labels
- Active page highlighting
- User profile section
- Quick action buttons

#### `DashboardHeader` (`components/layout/dashboard-header.tsx`)
Top navigation bar with:
- Search functionality
- Notification center
- User menu and settings
- Theme toggle

### UI Components

Built on **shadcn/ui** for consistency and accessibility:
- `Button`, `Input`, `Card`, `Dialog` - Basic interactive elements
- `Table`, `Form`, `Select` - Data display and input components
- `Toast`, `Alert`, `Badge` - Feedback and status components
- `Skeleton`, `Spinner` - Loading states and placeholders

## 📄 Pages

### Public Pages

#### Landing Page (`app/page.tsx`)
- Hero section with feature highlights
- Pricing information and plan comparison
- User testimonials and social proof
- Call-to-action for registration

#### Authentication Pages (`app/(auth)/`)
- **Login** (`login/page.tsx`): Email/password and social login options
- **Register** (`register/page.tsx`): Account creation with email verification

### Protected Pages

#### Dashboard (`app/(dashboard)/dashboard/page.tsx`)
- Personal activity overview
- Recent watch parties and videos
- Friend activity feed
- Quick action shortcuts

#### Watch Parties (`app/(dashboard)/parties/`)
- **List View** (`page.tsx`): Browse and search existing parties
- **Create Party** (`create/page.tsx`): Set up new watch parties
- **Party Room** (`app/watch/[roomId]/page.tsx`): Active watch party interface

#### Video Library (`app/(dashboard)/videos/page.tsx`)
- Video grid with thumbnails and metadata
- Upload interface with drag-and-drop
- Organization tools (folders, tags, search)
- Sharing and permission management

#### Social Features (`app/(dashboard)/friends/page.tsx`)
- Friends list with online status
- Friend requests (sent/received)
- User search and discovery
- Activity feed and recommendations

#### Admin Panel (`app/(dashboard)/admin/page.tsx`)
- User management and moderation tools
- System analytics and performance metrics
- Content moderation and reporting
- Platform configuration and settings

#### Billing (`app/(dashboard)/billing/page.tsx`)
- Subscription management
- Payment method configuration
- Billing history and invoices
- Usage statistics and limits

## 🎨 Styling

### Design System

The application uses **Tailwind CSS** with a custom design system:

\`\`\`css
/* Custom color palette */
:root {
  --primary: 262.1 83.3% 57.8%;
  --secondary: 220 14.3% 95.9%;
  --accent: 220 14.3% 95.9%;
  --destructive: 0 84.2% 60.2%;
  --muted: 220 14.3% 95.9%;
  --border: 220 13% 91%;
  --radius: 0.5rem;
}
\`\`\`

### Component Styling

- **Utility-First Approach**: Tailwind classes for rapid development
- **Component Variants**: Using `class-variance-authority` for consistent component APIs
- **Responsive Design**: Mobile-first approach with breakpoint-specific styles
- **Dark Mode Support**: Automatic theme switching with system preference detection

### Animation and Transitions

- **Framer Motion**: Smooth page transitions and component animations
- **CSS Transitions**: Hover effects and state changes
- **Loading States**: Skeleton loaders and progress indicators
- **Micro-interactions**: Button feedback and form validation animations

## 🗄️ State Management

### Global State (Zustand)

#### UI Store (`lib/stores/ui-store.ts`)
\`\`\`typescript
interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  notifications: Notification[];
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  addNotification: (notification: Notification) => void;
}
\`\`\`

#### Auth Store (Context)
\`\`\`typescript
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
}
\`\`\`

### Local State Management

- **React useState**: Component-level state for forms and UI interactions
- **React useReducer**: Complex state logic in components like video player
- **Custom Hooks**: Reusable state logic for common patterns

### Server State

- **TanStack Query**: API data fetching, caching, and synchronization
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Background Refetching**: Keep data fresh without user intervention

## 🔌 API Integration

### API Client (`lib/api/client.ts`)

Centralized API client with:
- **Axios Configuration**: Base URL, interceptors, and error handling
- **Authentication**: Automatic token attachment and refresh
- **Request/Response Transformation**: Data normalization and error formatting
- **Retry Logic**: Automatic retry for failed requests

### Endpoint Structure

\`\`\`typescript
// Authentication endpoints
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/me

// Watch party endpoints
GET    /api/parties
POST   /api/parties
GET    /api/parties/:id
PUT    /api/parties/:id
DELETE /api/parties/:id

// Video management
GET    /api/videos
POST   /api/videos/upload
GET    /api/videos/:id
PUT    /api/videos/:id
DELETE /api/videos/:id

// Social features
GET    /api/friends
POST   /api/friends/request
PUT    /api/friends/:id/accept
DELETE /api/friends/:id
\`\`\`

### Real-time Communication

#### WebSocket Events
\`\`\`typescript
// Client to server
'join-party' | 'leave-party' | 'video-action' | 'chat-message'

// Server to client
'party-update' | 'video-sync' | 'chat-message' | 'user-joined' | 'user-left'
\`\`\`

#### Data Synchronization
- **Video Playback**: Real-time sync of play/pause/seek actions
- **Chat Messages**: Instant message delivery with typing indicators
- **Participant Updates**: Live participant list with join/leave events
- **Presence System**: Online/offline status for friends and party members

## 🧪 Testing

### Testing Strategy

#### Unit Tests (Jest + React Testing Library)
- **Component Testing**: Render testing, user interactions, and prop validation
- **Hook Testing**: Custom hook behavior and state management
- **Utility Testing**: Pure function testing and edge cases
- **Context Testing**: Provider behavior and state updates

#### Integration Tests
- **API Integration**: Mock API responses and error handling
- **Component Integration**: Multi-component workflows and data flow
- **State Management**: Store updates and side effects

#### End-to-End Tests (Playwright)
- **Authentication Flows**: Login, registration, and logout processes
- **Watch Party Creation**: Full workflow from creation to joining
- **Video Playback**: Synchronization testing across multiple browsers
- **Admin Functions**: User management and moderation tools

### Running Tests

\`\`\`bash
# Unit tests
npm run test
npm run test:watch
npm run test:coverage

# E2E tests
npm run test:e2e
npm run test:e2e:headed

# All tests
npm run test:all
\`\`\`

### Test Coverage

- **Components**: 95%+ coverage for critical UI components
- **Hooks**: 100% coverage for custom hooks
- **Utilities**: 100% coverage for pure functions
- **Integration**: 90%+ coverage for user workflows

## 🚀 Deployment

### Production Build

\`\`\`bash
# Build the application
npm run build

# Start production server
npm run start

# Analyze bundle size
npm run analyze
\`\`\`

### Environment Configuration

#### Production Environment Variables
\`\`\`bash
# Required production variables
NEXT_PUBLIC_API_URL=https://api.yourapp.com
NEXT_PUBLIC_WEBSOCKET_URL=wss://api.yourapp.com
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourapp.com

# Optional production variables
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
\`\`\`

### Deployment Platforms

#### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables
3. Deploy automatically on push to main branch

#### Docker Deployment
\`\`\`dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

#### Static Export
\`\`\`bash
npm run build
npm run export
\`\`\`

### Performance Optimization

- **Code Splitting**: Automatic route-based splitting
- **Image Optimization**: Next.js Image component with WebP
- **Bundle Analysis**: Regular bundle size monitoring
- **Caching Strategy**: Static assets and API response caching

## 🤝 Contributing

### Development Workflow

1. **Fork the Repository**: Create your own fork of the project
2. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
3. **Make Changes**: Implement your feature or bug fix
4. **Write Tests**: Add tests for new functionality
5. **Run Tests**: Ensure all tests pass
6. **Submit Pull Request**: Create a PR with detailed description

### Code Standards

#### TypeScript
- **Strict Mode**: All TypeScript strict checks enabled
- **Type Safety**: No `any` types without explicit reasoning
- **Interface Definitions**: Proper typing for all props and state

#### Code Style
- **ESLint**: Follow Next.js and TypeScript ESLint rules
- **Prettier**: Automatic code formatting on save
- **Naming Conventions**: 
  - Components: PascalCase (`UserProfile`)
  - Files: kebab-case (`user-profile.tsx`)
  - Variables: camelCase (`userName`)

#### Component Guidelines
- **Single Responsibility**: Each component has one clear purpose
- **Props Interface**: All props properly typed with interfaces
- **Error Boundaries**: Wrap components that might fail
- **Accessibility**: WCAG 2.1 AA compliance

### Pull Request Process

1. **Description**: Clear description of changes and motivation
2. **Testing**: Include test results and coverage information
3. **Screenshots**: Visual changes should include before/after screenshots
4. **Breaking Changes**: Clearly document any breaking changes
5. **Review**: Address all review comments before merging

### Issue Reporting

When reporting issues, please include:
- **Environment**: Browser, OS, Node.js version
- **Steps to Reproduce**: Clear reproduction steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Screenshots**: Visual issues should include screenshots

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ **Commercial Use**: Use in commercial projects
- ✅ **Modification**: Modify the source code
- ✅ **Distribution**: Distribute the software
- ✅ **Private Use**: Use for private projects
- ❌ **Liability**: No warranty or liability
- ❌ **Trademark Use**: No trademark rights granted

## 🙏 Acknowledgments

- **Next.js Team**: For the amazing React framework
- **Vercel**: For hosting and deployment platform
- **shadcn**: For the beautiful UI component library
- **Tailwind CSS**: For the utility-first CSS framework
- **Open Source Community**: For all the amazing libraries and tools

## 📞 Support

- **Documentation**: [Project Wiki](https://github.com/your-username/watch-party-frontend/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/watch-party-frontend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/watch-party-frontend/discussions)
- **Email**: support@yourapp.com

---

**Built with ❤️ by the Watch Party Team**

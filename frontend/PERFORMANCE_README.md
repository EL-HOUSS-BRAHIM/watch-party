# 🎬 WatchParty Frontend - Performance Optimized

A lightweight, performance-focused frontend for the WatchParty platform. Designed to run smoothly on low-end devices and use minimal RAM.

## 🚀 Performance Features

- **Minimal Bundle Size**: Removed heavy dependencies and UI libraries
- **Optimized Components**: Simplified React components with minimal state
- **Lazy Loading**: Components load only when needed
- **Memory Efficient**: Target <50MB RAM usage instead of 161MB
- **Fast First Paint**: Minimal CSS and inline styles
- **Code Splitting**: Automatic vendor and page-level splits

## 🎯 Core Features

- **Simple Landing Page**: Clear call-to-action for join/login
- **Quick Authentication**: Fast login/register flow
- **Lightweight Dashboard**: Create parties, add movie links, connect drives
- **Real-time Party Rooms**: Video sync and chat (minimal UI)
- **Drive Integration**: Google Drive connection for personal libraries

## 🛠️ Tech Stack

- **Next.js 15**: App Router with performance optimizations
- **React 19**: Latest with minimal dependencies
- **TypeScript**: Type safety without bloat
- **Tailwind CSS**: Utility-first CSS for small bundle size
- **No Heavy UI Libraries**: Custom lightweight components

## 📦 Installation

```bash
# Clone the repository
cd frontend

# Install dependencies
pnpm install

# Set up environment
cp .env.local.example .env.local

# Start development server
pnpm dev
```

## 🔧 Environment Setup

```env
# .env.local
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## 🏗️ Backend Integration

The frontend connects to the Django backend via API routes:

- **Authentication**: `/api/auth/login`, `/api/auth/register`
- **Parties**: `/api/parties` (GET/POST)
- **Google Drive**: Integration via backend OAuth

### Available Backend APIs

The backend provides extensive APIs (see `Watch_Party_API.yaml`):

- Party management (`/v2/parties/`)
- Video streaming (`/v2/videos/`)
- Chat functionality (`/v2/chat/`)
- Google Drive integration (`/v2/integrations/google-drive/`)
- User analytics (`/v2/analytics/`)

## 📱 User Flow

1. **Landing Page** → Join party or login
2. **Authentication** → Quick signup/signin
3. **Dashboard** → Create parties, add movies, connect drive
4. **Party Room** → Watch together with chat

## ⚡ Performance Optimizations Applied

### Bundle Size Reduction
- Removed Radix UI complex components
- Simplified state management
- Minimal external dependencies
- Tree-shaking optimizations

### Memory Usage
- Lazy component loading
- Efficient re-renders
- Minimal state storage
- Garbage collection friendly

### Network Optimizations
- API route caching
- Minimal data fetching
- Compressed assets
- CDN-ready build

## 🔄 Build & Deploy

```bash
# Production build
pnpm build

# Start production server
pnpm start

# Docker build (if needed)
docker build -t watchparty-frontend .
```

## 🎯 Performance Targets

- **First Contentful Paint**: <1.5s
- **Time to Interactive**: <3s
- **Memory Usage**: <50MB
- **Bundle Size**: <500KB gzipped
- **Lighthouse Score**: >90

## 🔗 API Integration Examples

### Create a Party
```typescript
const response = await fetch('/api/parties', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Movie Night',
    description: 'Watching Avatar together',
    visibility: 'friends'
  })
})
```

### Join a Party
```typescript
const response = await fetch(`/api/parties/${partyId}/join`, {
  method: 'POST'
})
```

## 🎪 Party Features

- **Video Sync**: Automatic playback synchronization
- **Chat**: Real-time messaging
- **Screen Share**: Host can share screen
- **Drive Integration**: Access personal video libraries
- **Mobile Friendly**: Works on all devices

## 🔧 Development

```bash
# Run with debug mode
pnpm dev --turbo

# Type checking
pnpm type-check

# Linting
pnpm lint

# Testing
pnpm test
```

## 📊 Monitoring

Monitor performance in production:
- Bundle analyzer: `pnpm analyze`
- Lighthouse audits
- Core Web Vitals
- Memory usage profiling

## 🤝 Contributing

1. Focus on performance first
2. Keep components minimal
3. Test on low-end devices
4. Monitor bundle size impact

---

**Goal**: A blazing-fast watch party platform that works everywhere! 🚀
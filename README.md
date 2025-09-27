# Watch Party Monorepo

A full-stack watch party application with synchronized video viewing, real-time chat, and social features.

## Architecture

This monorepo contains:
- **Frontend**: Next.js 15.2.4 with React, TypeScript, and Tailwind CSS
- **Backend**: Django 5.0 with Django REST Framework, WebSocket support, and PostgreSQL

## Project Structure

```
watch-party-monorepo/
├── frontend/                 # Next.js application
│   ├── app/                  # App Router pages
│   ├── components/           # Reusable React components
│   ├── lib/                  # Utility functions and configurations
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript type definitions
│   ├── package.json          # Frontend dependencies
│   └── .env.dev              # Development environment variables
├── backend/                  # Django application
│   ├── apps/                 # Django apps (authentication, parties, etc.)
│   ├── config/               # Django settings and configurations
│   ├── venv/                 # Python virtual environment
│   ├── requirements.txt      # Python dependencies
│   └── .env.dev              # Development environment variables
├── scripts/                  # Development and deployment scripts
│   ├── dev-setup.sh          # Setup development environment
│   ├── start-frontend.sh     # Start frontend dev server
│   └── start-backend.sh      # Start backend dev server
├── docs/                     # Documentation
└── package.json              # Root package.json with workspace config
```

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- Redis server
- Git

### Setup Development Environment

1. **Clone and setup**:
   ```bash
   cd ~/watch-party-monorepo
   npm run setup
   ```

2. **Start development servers**:
   ```bash
   # Start both frontend and backend
   npm run dev
   
   # Or start individually
   npm run dev:frontend  # Frontend on http://127.0.0.1:3000
   npm run dev:backend   # Backend on http://127.0.0.1:8001
   ```

## Development Workflow

### Frontend Development
- **Port**: 3000 (development)
- **Framework**: Next.js 15.2.4 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React hooks and Context API

### Backend Development
- **Port**: 8001 (development), 8000 (production)
- **Framework**: Django 5.0 with Django REST Framework
- **Database**: SQLite (development), PostgreSQL (production)
- **Authentication**: JWT tokens with refresh mechanism

### Environment Variables

#### Frontend (.env.dev)
```bash
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
NEXT_PUBLIC_APP_URL=http://127.0.0.1:3000
NODE_ENV=development
```

#### Backend (.env.dev)
```bash
DEBUG=True
DJANGO_SETTINGS_MODULE=config.settings.development
DATABASE_URL=sqlite:///db.dev.sqlite3
REDIS_URL=redis://127.0.0.1:6379/1
SECRET_KEY=dev-secret-key-change-in-production
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOW_ALL_ORIGINS=True
```

## Available Scripts

From the root directory:
- `npm run setup` - Setup development environment
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build frontend for production
- `npm run test` - Run frontend tests
- `npm run lint` - Lint frontend code

## Production Deployment

The production environment is running:
- Frontend: https://watch-party.brahim-elhouss.me (PM2 + Nginx + Cloudflare)
- Backend: Same domain with /api prefix (Gunicorn + Nginx + PostgreSQL)

## Contributing

1. Make changes in the monorepo
2. Test locally with `npm run dev`
3. Build and test with `npm run build`
4. Commit and push to GitHub

## Technology Stack

### Frontend
- Next.js 15.2.4 (React 19)
- TypeScript
- Tailwind CSS
- Lucide Icons
- shadcn/ui components

### Backend
- Django 5.0
- Django REST Framework
- PostgreSQL
- Redis (caching & sessions)
- Channels (WebSocket support)
- Celery (background tasks)

### Infrastructure
- PM2 (Process Management)
- Nginx (Reverse Proxy)
- Cloudflare (CDN & SSL)
- Ubuntu 24.04 LTS

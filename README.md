# 🎬 Watch Party

A unified repository containing both frontend and backend for the Watch Party application - a next-generation platform for synchronized video watching with friends.

## 🏗️ Repository Structure

```
watch-party-monorepo/
├── frontend/                 # Next.js 15.2.4 React application
│   ├── app/                 # App router pages
│   ├── components/          # Reusable React components  
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility libraries
│   └── types/               # TypeScript type definitions
├── backend/                 # Django REST API
│   ├── apps/                # Django applications
│   ├── config/              # Django configuration
│   ├── shared/              # Shared utilities
│   └── requirements/        # Python dependencies
├── scripts/                 # Development and deployment scripts
└── .github/workflows/       # CI/CD workflows
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+ and pip
- PostgreSQL 13+
- Redis 6+
- FFmpeg (for video metadata extraction)

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:EL-HOUSS-BRAHIM/watch-party.git
   cd watch-party
   ```

2. **Install FFmpeg:**
   ```bash
   # macOS
   brew install ffmpeg
   
   # Ubuntu/Debian
   sudo apt-get update && sudo apt-get install -y ffmpeg
   
   # Verify installation
   ffmpeg -version
   ```

3. **Setup Backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements/development.txt
   cp .env.example .env      # Configure your environment variables
   python manage.py migrate
   python manage.py runserver
   ```

3. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local  # Configure your environment variables
   npm run dev
   ```

### Using Development Scripts

- **Start both frontend and backend:**
  ```bash
  ./scripts/dev-setup.sh
  ```

- **Start backend only:**
  ```bash
  ./scripts/start-backend.sh
  ```

- **Start frontend only:**
  ```bash
  ./scripts/start-frontend.sh
  ```

## 🏭 Production Deployment

### Docker-Based Deployment

The application is deployed using Docker Compose on AWS Lightsail with Cloudflare integration.

### Automatic Deployment

GitHub Actions automatically deploy to production:

- **Trigger:** Push to `master` branch
- **Target:** Lightsail server via SSH
- **Process:** Git pull → Docker build (with cache-busting) → Container restart

> **Note:** Deployments use git commit hash-based cache busting to ensure all code changes are included in Docker builds. See [DEPLOYMENT_CACHE_FIX.md](./DEPLOYMENT_CACHE_FIX.md) for details.

### Server Setup

1. **Bootstrap Server (one-time):**
   ```bash
   # Run on fresh Ubuntu Lightsail instance
   curl -sSL https://raw.githubusercontent.com/EL-HOUSS-BRAHIM/watch-party/master/bootstrap.sh | sudo bash
   ```

2. **Deploy Application:**
   ```bash
   # As deploy user on server
   ./deploy-docker.sh
   ```

### Manual Deployment

From your local machine:
```bash
# Deploy via GitHub Actions
git push origin master

# Or deploy directly to server
ssh deploy@35.181.116.57
cd /srv/watch-party
./deploy-docker.sh
```

### Deployment Architecture

- **Cloudflare:** DNS + SSL termination + CDN
- **Lightsail:** Docker containers (Nginx → Next.js + Django)  
- **AWS RDS:** PostgreSQL database (external)
- **AWS ElastiCache:** Valkey/Redis cache (external)
- **AWS S3:** Media and static file storage
- **Domains:** watch-party.brahim-elhouss.me (main), be-watch-party.brahim-elhouss.me (API)

### Deployment Options

**Production (default):**
```bash
# Uses external AWS RDS and ElastiCache
docker-compose up -d
```

**Development:**
```bash
# Uses local PostgreSQL and Redis containers
docker-compose -f docker-compose.dev.yml up -d
```

### Environment Configuration

Configure environment variables for both services:

**Backend (`backend/.env`)**:
```bash
cp backend/.env.example backend/.env
# Edit with your settings - AWS production endpoints are pre-configured:
# - RDS PostgreSQL: watch-party-postgres.cj6w0queklir.eu-west-3.rds.amazonaws.com
# - ElastiCache Valkey: master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com
# - Update with your actual database password and Redis auth token
# - AWS S3 settings (uses IAM role MyAppRole)
# - Email SMTP configuration
# - Social OAuth keys (Google, Discord, GitHub)
# - Stripe payment keys
# - JWT secret keys
```

**Frontend (`frontend/.env.local`)**:
```bash
cp frontend/.env.example frontend/.env.local
# Already configured with correct API URLs:
# - NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
# - NEXT_PUBLIC_FRONTEND_API=https://be-watch-party.brahim-elhouss.me/api
# - NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws
# - Analytics and feature flags
```

## 🔧 Configuration

### Backend Configuration

Key environment variables in `backend/.env`:

- `SECRET_KEY`: Django secret key
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET_KEY`: JWT signing key

### Frontend Configuration

Key environment variables in `frontend/.env.local`:

- `NEXT_PUBLIC_API_URL`: Backend base URL (used by server components)
- `NEXT_PUBLIC_FRONTEND_API`: Public API base (browser requests)
- `NEXT_PUBLIC_APP_URL`: Frontend application URL

## 📚 API Documentation

- **Swagger UI:** Available at `/api/docs/` when backend is running
- **ReDoc:** Available at `/api/redoc/`
- **OpenAPI Schema:** Available at `/api/schema/`

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests  
```bash
cd frontend
npm test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

## 🏗️ Architecture

### Backend Architecture
- **Django 4.2+** with Django REST Framework
- **PostgreSQL** for primary database
- **Redis** for caching and sessions
- **Celery** for background tasks
- **WebSocket** support via Django Channels

### Frontend Architecture
- **Next.js 15.2.4** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Shadcn/ui** component library

## 🔐 Security

- JWT-based authentication
- CORS configuration
- Rate limiting
- Input validation and sanitization
- SQL injection protection
- XSS protection

## 📈 Monitoring

- Health check endpoints
- Performance monitoring
- Error tracking
- Application logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m '\''Add some amazing feature\''`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions and support, please open an issue in the GitHub repository.

---

**Built with ❤️ for the future of social entertainment**
# Deployment fix for nginx and services - Tue Sep 30 00:05:01 +01 2025

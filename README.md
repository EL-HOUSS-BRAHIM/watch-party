# 🎬 Watch Party Monorepo

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

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:EL-HOUSS-BRAHIM/watch-party.git
   cd watch-party
   ```

2. **Setup Backend:**
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

### Automatic Deployment

The repository includes GitHub Actions workflows for automatic deployment:

- **Backend Deployment:** Triggered on changes to `backend/` directory
- **Frontend Deployment:** Triggered on changes to `frontend/` directory
- **Full Deployment:** Triggered on pushes to `master` branch

### Manual Deployment

1. **Backend:**
   ```bash
   cd backend
   ./deploy.sh
   ```

2. **Frontend:**
   ```bash
   cd frontend
   npm run build
   # Deploy build files to server
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

- `NEXT_PUBLIC_API_URL`: Backend API URL
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

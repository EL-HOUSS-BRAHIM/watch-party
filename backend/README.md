# 🐍 Watch Party Backend

A robust Django backend for the Watch Party platform with real-time streaming, authentication, billing, and comprehensive admin controls.

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 13+ (or MySQL 8+)
- Redis 7.0+
- Git

### Installation

1. **Clone the repository** (if not already done):
   ```bash
   git clone https://github.com/EL-HOUSS-BRAHIM/v0-watch-party.git
   cd v0-watch-party/backend
   ```

2. **Run the setup script**:
   ```bash
   ./setup.sh
   ```

3. **Activate virtual environment**:
   ```bash
   source venv/bin/activate
   ```

4. **Update environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

6. **Start background services** (in separate terminals):
   ```bash
   # Terminal 1: Celery Worker
   celery -A watchparty worker --loglevel=info
   
   # Terminal 2: Celery Beat
   celery -A watchparty beat --loglevel=info
   ```

## 🌐 Development URLs

- **API**: http://localhost:8000/api/
- **Admin Panel**: http://localhost:8000/admin/
- **API Documentation**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

## 🏗️ Architecture

### Project Structure

```
backend/
├── manage.py                 # Django management script
├── requirements.txt          # Python dependencies
├── setup.sh                 # Setup script
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
├── .env.example            # Environment variables template
├── watchparty/             # Main project directory
│   ├── settings/           # Settings modules
│   │   ├── base.py        # Base settings
│   │   ├── development.py # Development settings
│   │   ├── production.py  # Production settings
│   │   └── testing.py     # Testing settings
│   ├── urls.py            # Main URL configuration
│   ├── wsgi.py           # WSGI configuration
│   ├── asgi.py           # ASGI configuration (WebSockets)
│   └── celery.py         # Celery configuration
├── apps/                  # Django applications
│   ├── authentication/   # User authentication
│   ├── users/            # User management
│   ├── videos/           # Video management
│   ├── parties/          # Watch party management
│   ├── chat/             # Real-time chat
│   ├── billing/          # Stripe billing
│   ├── analytics/        # User analytics
│   └── notifications/    # Notifications
├── utils/                # Utility modules
│   ├── middleware.py     # Custom middleware
│   └── mixins.py        # View mixins
├── templates/            # Email templates
├── static/              # Static files
├── mediafiles/          # User uploads
└── logs/                # Application logs
```

### Django Applications

1. **Authentication** (`apps.authentication`)
   - User registration, login, logout
   - JWT token management
   - Email verification
   - Password reset
   - Social authentication

2. **Users** (`apps.users`)
   - User profile management
   - Friend system
   - User preferences
   - Activity tracking

3. **Videos** (`apps.videos`)
   - Video upload and storage
   - Google Drive integration
   - AWS S3 integration
   - Video metadata extraction

4. **Parties** (`apps.parties`)
   - Watch party creation and management
   - Participant management
   - Party controls (play, pause, seek)
   - Room codes and invitations

5. **Chat** (`apps.chat`)
   - Real-time messaging
   - WebSocket connections
   - Message history
   - Emoji reactions

6. **Billing** (`apps.billing`)
   - Stripe integration
   - Subscription management
   - Payment processing
   - Invoice generation

7. **Analytics** (`apps.analytics`)
   - User behavior tracking
   - Watch time analytics
   - Performance metrics
   - Reporting

8. **Notifications** (`apps.notifications`)
   - Email notifications
   - Push notifications
   - In-app notifications
   - Notification preferences

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Refresh JWT token
- `POST /api/auth/forgot-password/` - Request password reset
- `POST /api/auth/reset-password/` - Reset password
- `POST /api/auth/verify-email/` - Verify email
- `GET /api/auth/profile/` - Get user profile
- `PUT /api/auth/profile/` - Update user profile

### Videos
- `GET /api/videos/` - List videos
- `POST /api/videos/` - Upload video
- `GET /api/videos/{id}/` - Get video details
- `PUT /api/videos/{id}/` - Update video
- `DELETE /api/videos/{id}/` - Delete video

### Parties
- `GET /api/parties/` - List parties
- `POST /api/parties/` - Create party
- `GET /api/parties/{id}/` - Get party details
- `POST /api/parties/{id}/join/` - Join party
- `POST /api/parties/{id}/leave/` - Leave party

### WebSocket Endpoints
- `ws://localhost:8000/ws/party/{party_id}/` - Party WebSocket

## 🔧 Configuration

### Environment Variables

```bash
# Core Django Settings
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/db_name

# Redis
REDIS_URL=redis://localhost:6379/0
CELERY_BROKER_URL=redis://localhost:6379/2

# JWT Configuration
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_LIFETIME=60  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days

# External Services
STRIPE_SECRET_KEY=sk_test_...
AWS_ACCESS_KEY_ID=your-access-key
GOOGLE_DRIVE_CLIENT_ID=your-client-id

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-password
```

### Database Configuration

The backend supports multiple database configurations:

#### PostgreSQL (Recommended)
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/watchparty_dev
```

#### MySQL
```bash
DATABASE_URL=mysql://user:password@localhost:3306/watchparty_dev
```

#### SQLite (Development only)
```bash
DATABASE_URL=sqlite:///db.sqlite3
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Run migrations
docker-compose exec backend python manage.py migrate

# Create superuser
docker-compose exec backend python manage.py createsuperuser
```

### Production Deployment

1. **Build production image**:
   ```bash
   docker build -t watchparty-backend .
   ```

2. **Deploy with docker-compose**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## 🧪 Testing

### Run Tests

```bash
# All tests
python manage.py test

# Specific app
python manage.py test apps.authentication

# With coverage
pytest --cov=apps --cov-report=html
```

### Test Configuration

Tests use SQLite in-memory database for speed. Configuration is in `settings/testing.py`.

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate limiting** on authentication endpoints
- **CORS protection** with configurable origins
- **Security headers** (XSS, CSRF, etc.)
- **Input validation** with Django REST Framework
- **SQL injection protection** with Django ORM
- **Password hashing** with Django's built-in hashers

## 📊 Monitoring & Logging

### Logging

Logs are written to:
- Console (development)
- `/var/log/watchparty/django.log` (production)

### Error Tracking

Sentry integration for error tracking in production:

```bash
SENTRY_DSN=your-sentry-dsn
```

### Performance Monitoring

New Relic integration:

```bash
NEW_RELIC_LICENSE_KEY=your-license-key
```

## 🚀 Deployment

### Requirements

- Python 3.11+
- PostgreSQL 13+
- Redis 7.0+
- nginx (for production)
- SSL certificate (Let's Encrypt recommended)

### Production Setup

1. **Server setup**:
   ```bash
   # Install dependencies
   sudo apt update
   sudo apt install python3.11 postgresql redis-server nginx

   # Create user
   sudo useradd -m -s /bin/bash watchparty
   ```

2. **Application deployment**:
   ```bash
   # Clone repository
   git clone https://github.com/EL-HOUSS-BRAHIM/v0-watch-party.git
   cd v0-watch-party/backend

   # Setup virtual environment
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt

   # Configure environment
   cp .env.example .env
   # Edit .env with production values

   # Run migrations
   python manage.py migrate
   python manage.py collectstatic
   ```

3. **Process management** (using systemd):
   ```bash
   # Create service files
   sudo cp deployment/watchparty.service /etc/systemd/system/
   sudo cp deployment/watchparty-celery.service /etc/systemd/system/

   # Enable and start services
   sudo systemctl enable watchparty watchparty-celery
   sudo systemctl start watchparty watchparty-celery
   ```

4. **Nginx configuration**:
   ```bash
   sudo cp deployment/nginx.conf /etc/nginx/sites-available/watchparty
   sudo ln -s /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```

## 📚 API Documentation

### Interactive Documentation

- **Swagger UI**: http://localhost:8000/api/docs/
- **ReDoc**: http://localhost:8000/api/redoc/

### Authentication Example

```python
import requests

# Register user
response = requests.post('http://localhost:8000/api/auth/register/', {
    'email': 'user@example.com',
    'password': 'securepass123',
    'confirm_password': 'securepass123',
    'first_name': 'John',
    'last_name': 'Doe'
})

data = response.json()
access_token = data['access_token']

# Use token for authenticated requests
headers = {'Authorization': f'Bearer {access_token}'}
profile = requests.get('http://localhost:8000/api/auth/profile/', headers=headers)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

### Code Style

- **Python**: Follow PEP 8
- **Django**: Follow Django coding style
- **Linting**: Use flake8, black, isort

```bash
# Format code
black .
isort .

# Check style
flake8 .
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Common Issues

1. **Database connection errors**:
   - Check PostgreSQL is running
   - Verify DATABASE_URL in .env
   - Check firewall settings

2. **Redis connection errors**:
   - Check Redis is running
   - Verify REDIS_URL in .env
   - Check Redis configuration

3. **Migration errors**:
   - Delete migration files (keep __init__.py)
   - Run `python manage.py makemigrations`
   - Run `python manage.py migrate`

4. **Static files not loading**:
   - Run `python manage.py collectstatic`
   - Check STATIC_URL and STATIC_ROOT settings

### Support

- **Issues**: https://github.com/EL-HOUSS-BRAHIM/v0-watch-party/issues
- **Discussions**: https://github.com/EL-HOUSS-BRAHIM/v0-watch-party/discussions

---

**Built with ❤️ by the Watch Party Team**

*Last updated: July 20, 2025*

# 🚀 Watch Party Backend Refactoring - Quick Start Guide

## Overview
This guide provides quick steps to get started with the refactored Watch Party backend architecture.

## 📁 New Architecture Overview

### Core Modules
```
back-end/
├── core/                     # Shared utilities and base classes
│   ├── exceptions.py        # Custom exception hierarchy
│   ├── permissions.py       # Fine-grained access control
│   ├── validators.py        # Comprehensive validation
│   ├── mixins.py           # Reusable model/view patterns
│   ├── utils.py            # Utility functions
│   └── pagination.py       # Standardized pagination
├── services/                # Business logic layer
│   ├── auth_service.py     # Authentication operations
│   └── video_service.py    # Video management (to be implemented)
└── middleware/              # Cross-cutting concerns
    └── enhanced_middleware.py # Security, logging, performance
```

## 🎯 Quick Setup (2 minutes)

### Option 1: Automated Setup (Recommended)
```bash
cd /home/bross/Desktop/watch-party/back-end
./setup_refactored.sh
```

### Option 2: Manual Setup
```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env with your configuration

# 4. Run migrations
python manage.py migrate

# 5. Create superuser (optional)
python manage.py createsuperuser

# 6. Start development server
python manage.py runserver
```

## 🔧 Configuration Priority

### Essential .env Variables
```bash
# Required for basic functionality
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3

# Required for authentication
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ACCESS_TOKEN_LIFETIME=15
JWT_REFRESH_TOKEN_LIFETIME=1440

# Required for Redis features
REDIS_URL=redis://localhost:6379/0

# Required for file uploads
MEDIA_URL=/media/
MEDIA_ROOT=media/
```

### Optional but Recommended
```bash
# For production security
CORS_ALLOWED_ORIGINS=http://localhost:3000
ALLOWED_HOSTS=localhost,127.0.0.1

# For external services (set when ready)
AWS_ACCESS_KEY_ID=your-aws-key
STRIPE_PUBLISHABLE_KEY=your-stripe-key
GOOGLE_DRIVE_CLIENT_ID=your-google-client-id
```

## 🏃‍♂️ Development Workflow

### Starting Development
```bash
# Terminal 1: Main server
python manage.py runserver

# Terminal 2: Background tasks (if using)
celery -A watchparty worker --loglevel=info

# Terminal 3: Scheduled tasks (if using)
celery -A watchparty beat --loglevel=info
```

### Common Commands
```bash
# Database
python manage.py makemigrations
python manage.py migrate
python manage.py flush  # Reset database

# Users
python manage.py createsuperuser
python create_test_users.py  # Create test data

# Static files
python manage.py collectstatic

# Testing
python manage.py test
python test_api.py  # Custom API tests
```

## 📋 Implementation Phases

### Phase 1: Core Integration (Week 1) - 🚧 Current Phase
- [ ] Update Django settings to include new modules
- [ ] Integrate enhanced middleware stack
- [ ] Update existing models to use new mixins
- [ ] Configure environment variables

### Phase 2: API Enhancement (Week 2)
- [ ] Integrate service layer in views
- [ ] Implement 2FA authentication endpoints
- [ ] Enhanced video management APIs
- [ ] Advanced party features

### Phase 3: Real-time Features (Week 3)
- [ ] Enhanced WebSocket consumers
- [ ] Real-time notifications
- [ ] Chat improvements
- [ ] Performance monitoring

## 🔍 Key Features Added

### Enhanced Security
- **Rate Limiting**: Configurable per-endpoint limits
- **Security Headers**: HSTS, CSP, XSS protection
- **Request Logging**: Comprehensive audit trail
- **Permission System**: Fine-grained access control

### Improved Authentication
- **JWT with Refresh**: Secure token management
- **2FA Support**: TOTP-based two-factor authentication
- **Email Verification**: Secure account activation
- **Password Policies**: Configurable strength requirements

### Performance & Monitoring
- **Redis Caching**: Intelligent cache management
- **Performance Middleware**: Request timing and metrics
- **User Activity Tracking**: Engagement analytics
- **Database Optimization**: Query optimization utilities

### Developer Experience
- **Standardized Exceptions**: Consistent error handling
- **Comprehensive Validation**: Data integrity enforcement
- **Utility Functions**: Common operations simplified
- **Service Layer**: Clean business logic separation

## 🚨 Troubleshooting

### Common Issues

#### Redis Connection Error
```bash
# Start Redis server
redis-server --daemonize yes

# Or install Redis if missing
sudo apt-get install redis-server  # Ubuntu/Debian
brew install redis                 # macOS
```

#### Migration Conflicts
```bash
# Reset migrations (development only)
python manage.py migrate --fake-initial
python manage.py makemigrations
python manage.py migrate
```

#### Environment Configuration
```bash
# Verify environment loading
python -c "from django.conf import settings; print(settings.SECRET_KEY)"
```

#### Permission Errors
```bash
# Fix file permissions
chmod +x setup_refactored.sh
chmod 755 media/
```

## 📚 Next Steps

1. **Complete Phase 1**: Follow TODO.md for Django settings integration
2. **Review Documentation**: Check individual module docstrings
3. **Run Tests**: Ensure all functionality works as expected
4. **Configure Production**: Update settings for deployment
5. **Monitor Performance**: Use built-in monitoring tools

## 📞 Support

- **TODO.md**: Comprehensive implementation checklist
- **BACKEND.md**: Original architecture documentation
- **Individual modules**: Detailed docstrings and comments
- **Test files**: Working examples of functionality

---

**Status**: ✅ Core infrastructure complete (25%) | 🚧 Integration phase | 📅 ~3 weeks to full implementation

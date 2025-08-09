# Production Deployment Setup - Watch Party Backend

## 🚀 Deployment Summary

The Watch Party backend has been successfully deployed to the production server at **13.37.8.163**.

### 🌐 Live URLs
- **Backend API**: https://be-watch-party.brahim-elhouss.me
- **Admin Panel**: https://be-watch-party.brahim-elhouss.me/admin/
- **Health Check**: https://be-watch-party.brahim-elhouss.me/health/

### 🏗️ Infrastructure Overview

#### Server Configuration
- **Server IP**: 13.37.8.163
- **OS**: Ubuntu 24.04.2 LTS
- **Domain**: be-watch-party.brahim-elhouss.me
- **SSL**: Let's Encrypt certificates via Cloudflare

#### Services Architecture
1. **Nginx** - Reverse proxy with SSL termination
2. **Daphne** - ASGI server running Django on port 8000
3. **Redis** - Cache and message broker on port 6380
4. **Celery Worker** - Background task processing
5. **Celery Beat** - Scheduled task manager

### 📁 Directory Structure
```
/home/ubuntu/brahim/be_watch-party/
├── apps/                   # Django applications
├── core/                   # Core utilities
├── middleware/             # Custom middleware
├── services/              # Business logic services
├── static/                # Static files
├── staticfiles/           # Collected static files
├── media/                 # User uploaded files
├── logs/                  # Application logs
├── venv/                  # Python virtual environment
├── manage.py              # Django management script
├── requirements.txt       # Python dependencies
├── .env                   # Environment variables
└── db.sqlite3            # SQLite database
```

### 🔧 Configuration Files

#### Nginx Configuration
- **File**: `/etc/nginx/sites-available/watch-party`
- **Features**: 
  - SSL termination
  - Rate limiting
  - Gzip compression
  - Security headers
  - WebSocket support
  - Static file serving

#### Systemd Services
1. **Backend Service**: `/etc/systemd/system/watch-party-backend.service`
2. **Celery Worker**: `/etc/systemd/system/watch-party-celery-worker.service`
3. **Celery Beat**: `/etc/systemd/system/watch-party-celery-beat.service`
4. **Redis**: `/etc/systemd/system/redis-watchparty.service`

### 🔐 Environment Configuration

#### Production Settings
- **File**: `watchparty/settings/production.py`
- **Database**: SQLite with connection pooling
- **Cache**: Redis-backed caching
- **Security**: SSL redirects, secure cookies, HSTS
- **CORS**: Configured for frontend domain

#### Environment Variables (.env)
```bash
DEBUG=False
SECRET_KEY=your-secure-secret-key
ALLOWED_HOSTS=be-watch-party.brahim-elhouss.me,127.0.0.1,localhost
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://:watchparty_redis_2025@127.0.0.1:6380/0
# ... other variables
```

### 🚀 Deployment Process

#### Manual Deployment
Use the deployment script:
```bash
./deploy-backend.sh
```

#### Automated Deployment
- **GitHub Workflow**: `.github/workflows/deploy-backend.yml`
- **Trigger**: Push to `main` branch with backend changes
- **Process**: 
  1. Upload code via rsync
  2. Install dependencies
  3. Run migrations
  4. Collect static files
  5. Restart services
  6. Health check

### 🔍 Monitoring & Health Checks

#### Service Status
```bash
sudo systemctl status watch-party-backend.service
sudo systemctl status watch-party-celery-worker.service
sudo systemctl status watch-party-celery-beat.service
sudo systemctl status redis-watchparty.service
```

#### Health Endpoint
```bash
curl https://be-watch-party.brahim-elhouss.me/health/
```

#### Logs
```bash
# Application logs
tail -f /home/ubuntu/brahim/be_watch-party/logs/django.log

# Service logs
sudo journalctl -u watch-party-backend.service -f
sudo journalctl -u watch-party-celery-worker.service -f

# Nginx logs
sudo tail -f /var/log/nginx/be-watch-party.access.log
sudo tail -f /var/log/nginx/be-watch-party.error.log
```

### 👤 Admin Access
- **URL**: https://be-watch-party.brahim-elhouss.me/admin/
- **Username**: admin@watchparty.com
- **Password**: admin123
- **Note**: Change the default credentials in production!

### 🔒 Security Features
- SSL/TLS encryption
- Rate limiting per IP
- Security headers (XSS protection, CSRF, etc.)
- CORS configuration
- Secure session management
- Input validation and sanitization

### 📊 Performance Features
- Redis caching
- Gzip compression
- Static file optimization
- Connection pooling
- Celery for background tasks

### 🛠️ Maintenance Tasks

#### Updating the Backend
1. Push changes to the `main` branch
2. GitHub Actions will automatically deploy
3. Monitor service status and logs

#### Manual Service Management
```bash
# Restart services
sudo systemctl restart watch-party-backend.service
sudo systemctl restart watch-party-celery-worker.service
sudo systemctl restart watch-party-celery-beat.service

# Check status
sudo systemctl status watch-party-backend.service
```

#### Database Backup
```bash
# Backup database
cp /home/ubuntu/brahim/be_watch-party/db.sqlite3 /home/ubuntu/brahim/be_watch-party/db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)
```

### 🚨 Troubleshooting

#### Common Issues
1. **Service not starting**: Check logs with `journalctl`
2. **Database errors**: Verify .env configuration
3. **Static files not loading**: Run `collectstatic` command
4. **Redis connection issues**: Check Redis service status

#### Quick Fixes
```bash
# Restart all services
sudo systemctl restart watch-party-backend.service watch-party-celery-worker.service watch-party-celery-beat.service

# Check service health
curl -I https://be-watch-party.brahim-elhouss.me/health/

# View recent logs
sudo journalctl -u watch-party-backend.service -n 50
```

### 📈 Next Steps
1. Set up monitoring and alerting
2. Implement log aggregation
3. Add backup automation
4. Configure SSL certificate auto-renewal
5. Optimize database performance
6. Add load balancing if needed

---

## 🎉 Deployment Status: ✅ SUCCESSFUL

The backend is now live and ready for production use!

# Watch Party - Unified Deployment

This repository contains a unified deployment solution for the Watch Party application, featuring both frontend (Next.js) and backend (Django) components with automated CI/CD using GitHub Actions.

## 🚀 Architecture

- **Frontend**: Next.js application with React and TypeScript
- **Backend**: Django REST API with WebSocket support
- **Database**: SQLite (configurable to PostgreSQL)
- **Cache/Queue**: Redis with isolated instance
- **Reverse Proxy**: Nginx with SSL/TLS
- **Process Manager**: PM2 for Node.js processes
- **CI/CD**: GitHub Actions for automated deployment

## 📁 Project Structure

```
watch-party/
├── front-end/           # Next.js frontend application
├── back-end/            # Django backend API
├── .github/workflows/   # GitHub Actions CI/CD
├── deploy.sh           # Unified deployment script
└── README.md           # This file
```

## 🛠️ Deployment

### Domain Configuration

The application uses two domains:

- **Frontend**: `watch-party.brahim-elhouss.me` - Next.js application
- **Backend**: `be-watch-party.brahim-elhouss.me` - Django API

Both domains should point to the same server IP address. The Nginx configuration automatically handles:
- SSL termination for both domains
- Routing frontend requests to Next.js (port 3000)
- Routing API requests to Django (port 8000)
- CORS configuration between domains

### Prerequisites

1. **Server Requirements**:
   - Ubuntu 20.04+ (or similar Linux distribution)
   - Root or sudo access
   - At least 2GB RAM
   - Domain names pointing to your server:
     - `watch-party.brahim-elhouss.me` (frontend)
     - `be-watch-party.brahim-elhouss.me` (backend)

2. **DNS Configuration**:
   - Set both domains to point to your server IP
   - If using Cloudflare, set to "DNS Only" (gray cloud) during SSL setup

### First-Time Deployment

1. **Clone the repository on your server**:
   ```bash
   ssh ubuntu@your-server-ip
   cd /home/ubuntu
   git clone https://github.com/EL-HOUSS-BRAHIM/watch-party.git
   cd watch-party
   ```

2. **Run the deployment script**:
   ```bash
   chmod +x deploy.sh
   
   # Optional: Check port availability first
   ./port-manager.sh status
   
   # Run full deployment
   sudo ./deploy.sh --full
   ```

   The deployment script automatically:
   - Checks port availability and assigns alternatives if needed
   - Installs system dependencies (Nginx, Redis, Node.js, Python, PM2)
   - Configure Redis with isolated instance
   - Set up Python virtual environment and install dependencies
   - Install frontend dependencies and build the application
   - Configure Nginx with SSL-ready configuration
   - Obtain Let's Encrypt SSL certificates
   - Start all services with PM2
   - Create management scripts

3. **Configure environment variables**:
   ```bash
   # Backend environment (copy from example and edit)
   cp back-end/.env.production.example back-end/.env
   nano back-end/.env  # Edit with your actual values
   
   # Frontend environment (copy from example and edit) 
   cp front-end/.env.production.example front-end/.env.local
   nano front-end/.env.local  # Edit with your actual values
   ```

4. **Restart services after configuration**:
   ```bash
   watch-party restart
   ```

### Deployment Options

- `./deploy.sh --full` - Complete deployment with SSL certificates
- `./deploy.sh --no-ssl` - Deployment without SSL (for testing)
- `./deploy.sh --ssl-only` - Only setup SSL certificates
- `./deploy.sh --services-only` - Only start services

## 🔧 Management Commands

After deployment, use these commands to manage your application:

### Service Management
```bash
watch-party start          # Start all services
watch-party stop           # Stop all services  
watch-party restart        # Restart all services
watch-party status         # Check status of all services
```

### Port Management
The system automatically detects port conflicts and assigns alternative ports if needed:

```bash
# Check current port status
./port-manager.sh status

# Find alternative ports for conflicts
./port-manager.sh find

# Set custom ports
./port-manager.sh set 8080 3001

# Show all system port usage
./port-manager.sh usage

# Reset to default ports (8000, 3000)
./port-manager.sh reset
```

**Default Ports:**
- Backend (Django): 8000 (auto-assigns 8001-8100 if conflict)
- Frontend (Next.js): 3000 (auto-assigns 3001-3100 if conflict)  
- Redis: 6380 (fixed, isolated from system Redis)

**Environment Variables:**
- `WATCH_PARTY_BACKEND_PORT` - Override default backend port
- `WATCH_PARTY_FRONTEND_PORT` - Override default frontend port

### Log Management
```bash
watch-party logs backend           # Backend Django logs
watch-party logs frontend          # Frontend Next.js logs
watch-party logs celery-worker     # Celery worker logs
watch-party logs celery-beat       # Celery scheduler logs
watch-party logs nginx-backend     # Backend Nginx access logs
watch-party logs nginx-frontend    # Frontend Nginx access logs
watch-party logs nginx-errors      # All Nginx error logs
watch-party logs all              # All PM2 logs
```

### Deployment & Monitoring
```bash
watch-party deploy        # Deploy latest changes from git
watch-party monitor       # Open PM2 monitoring dashboard
watch-party config        # Check configuration files status
watch-party update-env    # Show how to update environment files
```

## 📄 Environment Configuration

The application uses environment files for configuration:

### Backend Environment Files
- **`.env.example`** - Comprehensive development template with all options
- **`.env.production.example`** - Production-ready template for deployment  
- **`.env`** - Actual environment file (create from examples)

### Frontend Environment Files
- **`.env.local`** - Development/local environment file
- **`.env.production.example`** - Production template
- **`.env.local`** - Used for both development and production (Next.js convention)

### Key Configuration Updates
The unified deployment system uses updated paths and domains:

**Backend** (`.env`):
```bash
# Database path for unified deployment
DATABASE_URL=sqlite:///home/ubuntu/watch-party/back-end/db.sqlite3

# Redis configuration (isolated instance)
REDIS_URL=redis://:watchparty_redis_2025@127.0.0.1:6380/0

# CORS for new frontend domain
CORS_ALLOWED_ORIGINS=https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me
```

**Frontend** (`.env.local`):
```bash
# API endpoints
NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me
NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me

# Production app URL
NEXT_PUBLIC_APP_URL=https://watch-party.brahim-elhouss.me
```

## 🔄 GitHub Actions CI/CD

### Setup

1. **Add these secrets to your GitHub repository**:
   - `SERVER_HOST`: Your server IP address
   - `SERVER_USER`: SSH username (usually `ubuntu`)
   - `SERVER_SSH_KEY`: Private SSH key content

2. **Generate SSH Key** (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   cat ~/.ssh/id_rsa.pub >> ~/.ssh/authorized_keys  # On server
   cat ~/.ssh/id_rsa  # Copy private key to GitHub secrets
   ```

### Workflow

The CI/CD pipeline runs on every push to `main` branch:

1. **Test Backend**: 
   - Set up Python environment
   - Install dependencies
   - Run Django tests

2. **Test Frontend**:
   - Set up Node.js environment
   - Install dependencies with pnpm
   - Run linting and tests
   - Build the application

3. **Deploy**:
   - SSH to server
   - Pull latest code
   - Run `watch-party deploy`
   - Verify deployment

4. **Notify**: Send deployment status notifications

### Manual Deployment Trigger

You can also trigger deployment manually from GitHub Actions tab.

## 🛡️ Security Features

### SSL/TLS Configuration
- Let's Encrypt certificates with auto-renewal
- Modern TLS protocols (1.2, 1.3)
- Strong cipher suites
- HTTP to HTTPS redirects
- HSTS headers

### Nginx Security
- Rate limiting for different endpoints
- Security headers (XSS, CSRF, etc.)
- Cloudflare real IP detection
- Large file upload handling
- WebSocket support

### Application Security
- Redis password protection
- Environment-based configuration
- CORS configuration
- Django security middleware
- PM2 process management

## 📊 Monitoring & Logging

### Log Locations
- **PM2 Logs**: `/var/log/watch-party/`
- **Nginx Logs**: `/var/log/nginx/`
- **Redis Logs**: `/var/log/redis/watchparty/`

### Monitoring Tools
```bash
# PM2 monitoring dashboard
watch-party monitor

# Service status
watch-party status

# Real-time logs
watch-party logs all
```

### Health Checks
- Backend: `https://be-watch-party.brahim-elhouss.me/health/`
- Frontend: `https://watch-party.brahim-elhouss.me/`

## 🔧 Configuration

### Backend Configuration (`back-end/.env`)
- Django settings (DEBUG, SECRET_KEY, ALLOWED_HOSTS)
- Database configuration
- Redis URLs for cache and Celery
- CORS settings
- Security headers
- Email configuration

### Frontend Configuration (`front-end/.env.local`)
- API endpoints
- WebSocket URLs
- Authentication settings
- Feature flags
- External service keys

### Nginx Configuration
The deployment script creates a unified Nginx configuration handling:
- Both frontend and backend domains
- SSL termination
- Rate limiting
- Security headers
- Static file serving
- WebSocket proxying

## 🐛 Troubleshooting

### Common Issues

1. **SSL Certificate Errors**:
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew certificates
   sudo certbot renew --dry-run
   ```

2. **Service Connection Issues**:
   ```bash
   # Check service status
   watch-party status
   
   # View specific service logs
   watch-party logs backend
   ```

3. **Permission Issues**:
   ```bash
   # Fix ownership
   sudo chown -R ubuntu:ubuntu /home/ubuntu/watch-party
   ```

4. **Redis Connection Issues**:
   ```bash
   # Test Redis connection
   redis-cli -p 6380 -a watchparty_redis_2025 ping
   
   # Check Redis logs
   sudo tail -f /var/log/redis/watchparty/redis-server.log
   ```

### Debug Commands
```bash
# Check Nginx configuration
sudo nginx -t

# Test backend directly
curl http://localhost:8000/health/

# Test frontend directly  
curl http://localhost:3000/

# Check PM2 processes
pm2 list

# Monitor system resources
htop
```

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update system packages
sudo apt update && sudo apt upgrade

# Update application
watch-party deploy
```

### Backup Strategy
Regular backups should include:
- Database: `back-end/db.sqlite3`
- Media files: `back-end/media/`
- Environment configs: `.env` files
- SSL certificates: `/etc/letsencrypt/`

### Performance Monitoring
- Use `watch-party monitor` for real-time process monitoring
- Check log files regularly for errors
- Monitor disk space and memory usage
- Set up automated health checks

## 📞 Support

- **Health Check**: Check service status with `watch-party status`
- **Logs**: View logs with `watch-party logs [service]`
- **WebSocket Testing**: Test real-time connections with `./health-check.sh websocket`
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: 
  - Check configuration files for inline comments
  - See [WEBSOCKET-CONFIGURATION.md](WEBSOCKET-CONFIGURATION.md) for WebSocket setup details

## 🎯 Production Checklist

- [ ] DNS records configured and propagated
- [ ] SSL certificates obtained and configured
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Static files collected and served
- [ ] Services running and healthy
- [ ] GitHub Actions secrets configured
- [ ] Monitoring and alerting set up
- [ ] Backup strategy implemented
- [ ] Security headers validated
- [ ] Performance optimizations applied

## 🔗 URLs

After successful deployment:

- **Frontend**: https://watch-party.brahim-elhouss.me
- **Backend API**: https://be-watch-party.brahim-elhouss.me/api/
- **Backend WebSocket**: wss://be-watch-party.brahim-elhouss.me/ws/
- **Admin Panel**: https://be-watch-party.brahim-elhouss.me/admin/
- **Health Check**: https://be-watch-party.brahim-elhouss.me/health/

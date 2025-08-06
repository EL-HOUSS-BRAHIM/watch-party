# Watch Party Backend - Nginx Deployment Guide

This guide will help you deploy the Watch Party Backend with Nginx on your server using the domain `be-watch-party.brahim-elhouss.me`.

## 🚀 Quick Deployment

### 1. Prerequisites

Make sure your server meets these requirements:
- Ubuntu 20.04+ or similar Linux distribution
- Domain `be-watch-party.brahim-elhouss.me` pointing to your server IP
- Cloudflare protection should be set to "DNS Only" (gray cloud) during SSL setup
- Backend code already deployed at `/home/ubuntu/brahim/be_watch-party/`

### 2. Upload Configuration Files

Upload these files to your server:
```bash
# Copy the deployment script to your server
scp deploy-nginx.sh ubuntu@13.37.8.163:~/
scp .env.production.example ubuntu@13.37.8.163:~/
```

### 3. Run Deployment Script

SSH into your server and run the deployment script:
```bash
ssh ubuntu@13.37.8.163
chmod +x deploy-nginx.sh
sudo ./deploy-nginx.sh
```

### 4. Configure Environment Variables

```bash
cd /home/ubuntu/brahim/be_watch-party/
cp ~/.env.production.example .env
nano .env  # Edit with your actual values
```

### 5. Start the Backend

```bash
# Start the backend service
watch-party start

# Check status
watch-party status
```

## 📁 Files Included

### `nginx-watch-party.conf`
Complete Nginx configuration with:
- SSL/TLS encryption
- Cloudflare real IP detection
- Rate limiting for different endpoints
- WebSocket support for real-time features
- Static file serving
- Security headers
- Gzip compression

### `deploy-nginx.sh`
Automated deployment script that:
- Installs Nginx and Certbot
- Configures SSL certificate with Let's Encrypt
- Sets up systemd service for the Django backend
- Creates management script for easy operations
- Configures log rotation and monitoring

### `.env.production.example`
Production environment template with all necessary variables.

## 🔧 Management Commands

After deployment, use these commands to manage your backend:

```bash
# Service Management
watch-party start              # Start all services (Django, Celery, Redis, Nginx)
watch-party stop               # Stop all services
watch-party restart            # Restart all services
watch-party status             # Check status of all services

# Log Monitoring
watch-party logs               # View Django backend logs
watch-party worker-logs        # View Celery worker logs
watch-party beat-logs          # View Celery beat scheduler logs
watch-party redis-logs         # View Redis logs
watch-party nginx-logs         # View Nginx access logs
watch-party nginx-errors       # View Nginx error logs

# Development & Debugging
watch-party redis-cli          # Connect to Redis CLI
watch-party celery-status      # Show Celery worker status
watch-party deploy             # Deploy updates from git
```

## 🔄 Advanced Monitoring

Use the monitoring script for detailed Redis and Celery monitoring:

```bash
# Upload and setup monitoring script
scp watch-party-monitor.sh ubuntu@13.37.8.163:~/
chmod +x watch-party-monitor.sh
sudo mv watch-party-monitor.sh /usr/local/bin/wp-monitor

# Monitoring commands
wp-monitor health-check        # Quick health check of all services
wp-monitor redis-info          # Redis server information
wp-monitor celery-workers      # Active Celery workers
wp-monitor logs-all            # Tail all service logs
```

## 🛡️ Security Features

The configuration includes:
- **Rate Limiting**: Different limits for auth, API, uploads, and general requests
- **SSL Security**: Modern TLS configuration with strong ciphers
- **Security Headers**: HSTS, XSS protection, content type sniffing protection
- **Cloudflare Integration**: Real IP detection and trusted proxy configuration
- **File Upload Security**: Large file handling with proper timeouts
- **Redis Security**: Password protection and command restrictions
- **Service Isolation**: Redis runs on dedicated port with isolated data

## 🔄 Infrastructure Components

### Redis Configuration
- **Port**: 6380 (isolated from system Redis on 6379)
- **Password**: `watchparty_redis_2025`
- **Database Layout**:
  - Database 0: Django cache
  - Database 1: Celery message broker
  - Database 2: Celery result backend
- **Security**: Command restrictions, memory limits, persistence enabled

### Celery Configuration
- **Worker Service**: `watch-party-celery-worker`
- **Beat Scheduler**: `watch-party-celery-beat`
- **Concurrency**: 4 workers
- **Task Limits**: 1000 tasks per worker before restart
- **Queue Routing**: Separate queues for different task types

### Service Dependencies
```
nginx → django_backend → redis-watchparty
                      ↘ celery-worker → redis-watchparty
                      ↘ celery-beat → redis-watchparty
```

## 🔍 Troubleshooting

### SSL Certificate Issues
If SSL certificate generation fails:
1. Ensure DNS is pointing to your server
2. Set Cloudflare to "DNS Only" mode for the subdomain
3. Check that port 80 is accessible
4. Verify domain ownership

### Backend Connection Issues
```bash
# Check Django backend
sudo systemctl status watch-party-backend
watch-party logs

# Test backend directly
curl http://localhost:8000/api/test/
```

### Redis Issues
```bash
# Check Redis status
sudo systemctl status redis-watchparty

# Test Redis connection
redis-cli -p 6380 -a watchparty_redis_2025 ping

# Monitor Redis
wp-monitor redis-info
```

### Celery Issues
```bash
# Check Celery services
sudo systemctl status watch-party-celery-worker
sudo systemctl status watch-party-celery-beat

# View Celery logs
watch-party worker-logs
watch-party beat-logs

# Check active workers
wp-monitor celery-workers
```

### Nginx Issues
```bash
# Test Nginx configuration
sudo nginx -t

# Check Nginx status
sudo systemctl status nginx

# View error logs
watch-party nginx-errors
```

### Service Isolation
If other applications interfere:
- Redis runs on port 6380 (not default 6379)
- All services use `watch-party-*` prefixes
- Redis password protects the instance
- Separate systemd services for each component

### Cloudflare Configuration
For optimal performance with Cloudflare:
1. Set SSL/TLS encryption mode to "Full (strict)"
2. Enable "Always Use HTTPS"
3. Consider enabling "HTTP/2" and "HTTP/3"
4. Set up appropriate page rules for caching

## 📊 Monitoring

### Log Locations
- **Nginx Access**: `/var/log/nginx/be-watch-party.access.log`
- **Nginx Errors**: `/var/log/nginx/be-watch-party.error.log`
- **Django Logs**: Check with `watch-party logs`

### Health Check
```bash
# Test the API
curl https://be-watch-party.brahim-elhouss.me/api/test/

# Check WebSocket connection
curl -H "Upgrade: websocket" \
     -H "Connection: Upgrade" \
     https://be-watch-party.brahim-elhouss.me/ws/
```

## 🔄 Updates and Maintenance

### Deploying Updates
```bash
# Simple deployment
watch-party deploy

# Manual deployment
cd /home/ubuntu/brahim/be_watch-party/
git pull
source venv/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate
watch-party restart
```

### SSL Certificate Renewal
Certificates auto-renew via systemd timer. To check:
```bash
sudo systemctl status certbot.timer
sudo certbot certificates
```

### Backup
Regular backups should include:
- Database: `/home/ubuntu/brahim/be_watch-party/db.sqlite3`
- Media files: `/home/ubuntu/brahim/be_watch-party/media/`
- Environment config: `/home/ubuntu/brahim/be_watch-party/.env`

## 🌐 Production Checklist

- [ ] Domain DNS configured and propagated
- [ ] SSL certificate obtained and configured
- [ ] Environment variables set in `.env`
- [ ] Database migrations applied
- [ ] Static files collected
- [ ] Nginx configuration tested
- [ ] Backend service running
- [ ] Health check passing
- [ ] Cloudflare configured (if using)
- [ ] Monitoring and logging configured
- [ ] Backup strategy implemented

## 🔗 Useful Links

- **API Documentation**: `https://be-watch-party.brahim-elhouss.me/api/docs/`
- **Admin Panel**: `https://be-watch-party.brahim-elhouss.me/admin/`
- **Health Check**: `https://be-watch-party.brahim-elhouss.me/api/test/`

---

**Need help?** Check the logs first, then review this guide. Most issues are related to DNS configuration, SSL setup, or environment variables.

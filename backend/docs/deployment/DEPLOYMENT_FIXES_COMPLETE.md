# Watch Party Deployment Fix Summary

## Deployment Issues Fixed

### 1. Virtual Environment Issues
- **Problem**: Corrupted virtual environment missing gunicorn executable
- **Solution**: Complete virtual environment recreation with full dependency installation
- **Location**: `/var/www/watchparty/venv/`

### 2. Service Configuration Problems  
- **Problem**: 
  - Multi-line ExecStart commands in systemd service files causing failures
  - Port conflicts between gunicorn and daphne (both on 8001)
  - Log file permission errors
- **Solution**: 
  - Single-line ExecStart commands in service files
  - Separated ports: gunicorn (8001), daphne (8002)
  - Fixed log directory ownership: `ubuntu:ubuntu` with 664 permissions
- **Files**: 
  - `/etc/systemd/system/watchparty-gunicorn.service`
  - `/etc/systemd/system/watchparty-daphne.service` 
  - `/etc/systemd/system/watchparty-celery.service`

### 3. Nginx Configuration for Cloudflare
- **Problem**: Generic nginx config not optimized for Cloudflare proxy
- **Solution**: 
  - Created Cloudflare-compatible nginx configuration
  - Added proper real IP headers (CF-Connecting-IP)
  - Removed SSL handling (Cloudflare terminates SSL)
  - Fixed static file paths (`/static/` → `/var/www/watchparty/staticfiles/`)
- **Files**: 
  - `nginx.conf` (Cloudflare-compatible, default)
  - `nginx-ssl.conf` (SSL version for non-Cloudflare setups)

### 4. Deployment Script Updates
- **Problem**: Production script generated generic nginx config
- **Solution**: 
  - Updated `scripts/production.sh` to use project nginx templates
  - Nginx config now copied from `nginx.conf` file instead of generated
  - Maintains Cloudflare compatibility in automated deployments

## Current Server Status

### Services Running ✅
- `watchparty-gunicorn.service` - HTTP API (port 8001)
- `watchparty-daphne.service` - WebSocket (port 8002) 
- `watchparty-celery.service` - Background tasks
- `nginx` - Reverse proxy with Cloudflare optimization

### Health Check ✅
```bash
curl http://be-watch-party.brahim-elhouss.me/health/
# Returns: 301 redirect to HTTPS (Cloudflare handling SSL)
```

### Static Files ✅
- Collected to `/var/www/watchparty/staticfiles/`
- Properly served through nginx

## Configuration Files

### 1. Nginx Configuration (Cloudflare)
- **File**: `nginx.conf`
- **Features**:
  - Cloudflare IP trust settings
  - Proper proxy headers (CF-Connecting-IP)
  - Static file serving from correct path
  - WebSocket proxy to port 8002
  - HTTP API proxy to port 8001

### 2. Nginx Configuration (SSL)
- **File**: `nginx-ssl.conf`
- **Features**:
  - Full SSL termination
  - HTTP to HTTPS redirects
  - SSL security headers
  - Same proxy setup as Cloudflare version

### 3. Production Deployment Script
- **File**: `scripts/production.sh`
- **Updates**:
  - Uses static nginx configuration templates
  - Correct port assignments (8001/8002)
  - Improved error handling and logging
  - Cloudflare-first approach

## Network Architecture

```
Internet → Cloudflare (SSL termination) → Server Nginx (port 80) → {
  /static/     → Static files
  /media/      → Media files  
  /ws/         → Daphne (port 8002) - WebSockets
  /health/     → Gunicorn (port 8001) - Health check
  /            → Gunicorn (port 8001) - Django app
}
```

## Next Steps

### Immediate
- ✅ All services running properly
- ✅ Nginx configuration optimized for Cloudflare
- ✅ Deployment script updated for future deployments

### Recommended  
- **AWS Security Groups**: Configure inbound rules for ports 80/443
- **Monitoring**: Set up log rotation for nginx and application logs
- **Backups**: Ensure database and media file backup procedures

## Deployment Process

### For Future Deployments
1. Push code to repository
2. GitHub Actions will use updated `scripts/production.sh`
3. Script will automatically:
   - Deploy application to `/var/www/watchparty/`
   - Copy `nginx.conf` for Cloudflare compatibility
   - Create services with correct port assignments
   - Enable and start all services

### Manual Deployment
```bash
# On server
cd /var/www/watchparty/
./scripts/production.sh
```

## Troubleshooting

### Check Service Status
```bash
sudo systemctl status watchparty-gunicorn
sudo systemctl status watchparty-daphne  
sudo systemctl status watchparty-celery
sudo systemctl status nginx
```

### Check Logs
```bash
# Application logs
sudo journalctl -u watchparty-gunicorn -f
sudo journalctl -u watchparty-daphne -f

# Nginx logs  
sudo tail -f /var/log/watchparty/nginx_access.log
sudo tail -f /var/log/watchparty/nginx_error.log
```

### Port Conflicts
```bash
# Check what's using the ports
sudo netstat -tlnp | grep :8001
sudo netstat -tlnp | grep :8002
sudo netstat -tlnp | grep :80
```

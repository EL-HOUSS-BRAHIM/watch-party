#!/bin/bash

# Deployment script for Watch Party Backend Nginx Configuration
# Run this script on your server (ubuntu@13.37.8.163)

set -e

echo "🚀 Starting Watch Party Backend Nginx Setup..."

# Variables
DOMAIN="be-watch-party.brahim-elhouss.me"
BACKEND_PATH="/home/ubuntu/brahim/be_watch-party"
NGINX_CONFIG="/etc/nginx/sites-available/watch-party"
NGINX_ENABLED="/etc/nginx/sites-enabled/watch-party"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is fine for setup."
    SUDO=""
else
    SUDO="sudo"
fi

# Update system packages
print_status "Updating system packages..."
$SUDO apt update

# Install required packages
print_status "Installing required packages..."
$SUDO apt install -y nginx certbot python3-certbot-nginx curl redis-server supervisor

# Configure Redis for Watch Party (isolated instance)
print_status "Configuring Redis for Watch Party..."
$SUDO mkdir -p /etc/redis/watchparty
$SUDO mkdir -p /var/lib/redis/watchparty
$SUDO mkdir -p /var/log/redis/watchparty

# Create Redis configuration for Watch Party on port 6380 (isolated)
cat > /tmp/redis-watchparty.conf << 'EOF'
# Redis configuration for Watch Party Backend
port 6380
bind 127.0.0.1
timeout 0
tcp-keepalive 300

# Logging
loglevel notice
logfile /var/log/redis/watchparty/redis-server.log

# Persistence
save 900 1
save 300 10
save 60 10000
rdbcompression yes
dbfilename dump.rdb
dir /var/lib/redis/watchparty/

# Memory management
maxmemory 512mb
maxmemory-policy allkeys-lru

# Security
requirepass watchparty_redis_2025
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""

# Database isolation (use different databases for different purposes)
databases 16

# Append only file
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
EOF

$SUDO mv /tmp/redis-watchparty.conf /etc/redis/watchparty/redis.conf
$SUDO chown -R redis:redis /var/lib/redis/watchparty/
$SUDO chown -R redis:redis /var/log/redis/watchparty/

# Create Redis systemd service for Watch Party
cat > /tmp/redis-watchparty.service << 'EOF'
[Unit]
Description=Redis In-Memory Data Store for Watch Party
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/bin/redis-server /etc/redis/watchparty/redis.conf
ExecStop=/usr/bin/redis-cli -p 6380 -a watchparty_redis_2025 shutdown
TimeoutStopSec=0
Restart=always

[Install]
WantedBy=multi-user.target
EOF

$SUDO mv /tmp/redis-watchparty.service /etc/systemd/system/
$SUDO systemctl daemon-reload
$SUDO systemctl enable redis-watchparty
$SUDO systemctl start redis-watchparty

# Create necessary directories
print_status "Creating necessary directories..."
$SUDO mkdir -p /var/log/nginx
$SUDO mkdir -p /var/www/html

# Backup existing nginx configuration if it exists
if [ -f "$NGINX_CONFIG" ]; then
    print_warning "Backing up existing nginx configuration..."
    $SUDO cp "$NGINX_CONFIG" "$NGINX_CONFIG.backup.$(date +%Y%m%d_%H%M%S)"
fi

# Copy the nginx configuration
print_status "Installing nginx configuration..."
cat > /tmp/watch-party.conf << 'EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=50r/m;

# Upstream Django backend
upstream django_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name be-watch-party.brahim-elhouss.me;
    
    # Cloudflare real IP
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}
EOF

$SUDO mv /tmp/watch-party.conf "$NGINX_CONFIG"

# Enable the site
print_status "Enabling nginx site..."
$SUDO ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"

# Remove default nginx site if it exists
if [ -f "/etc/nginx/sites-enabled/default" ]; then
    print_status "Removing default nginx site..."
    $SUDO rm -f /etc/nginx/sites-enabled/default
fi

# Test nginx configuration
print_status "Testing nginx configuration..."
$SUDO nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed!"
    exit 1
fi

# Start and enable nginx
print_status "Starting nginx..."
$SUDO systemctl start nginx
$SUDO systemctl enable nginx

# Get SSL certificate from Let's Encrypt
print_status "Obtaining SSL certificate from Let's Encrypt..."
print_warning "Make sure your domain DNS is pointing to this server before continuing!"

read -p "Press Enter to continue with SSL certificate generation, or Ctrl+C to cancel..."

# Stop nginx temporarily for standalone certbot
$SUDO systemctl stop nginx

# Get the certificate using standalone mode (since nginx is not running yet with SSL)
$SUDO certbot certonly \
    --standalone \
    --non-interactive \
    --agree-tos \
    --email admin@brahim-elhouss.me \
    -d "$DOMAIN"

if [ $? -ne 0 ]; then
    print_error "Failed to obtain SSL certificate!"
    print_warning "You may need to:"
    print_warning "1. Ensure DNS is properly configured"
    print_warning "2. Check if Cloudflare is in 'DNS Only' mode for this subdomain"
    print_warning "3. Verify port 80 is accessible"
    exit 1
fi

# Now add the full nginx configuration with SSL
print_status "Updating nginx configuration with SSL settings..."
cat > /tmp/watch-party-ssl.conf << 'EOF'
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=auth:10m rate=10r/m;
limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone $binary_remote_addr zone=upload:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=general:10m rate=50r/m;

# Upstream Django backend
upstream django_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

# HTTP server - redirect to HTTPS
server {
    listen 80;
    server_name be-watch-party.brahim-elhouss.me;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name be-watch-party.brahim-elhouss.me;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/be-watch-party.brahim-elhouss.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/be-watch-party.brahim-elhouss.me/privkey.pem;
    
    # SSL security settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Cloudflare real IP
    set_real_ip_from 103.21.244.0/22;
    set_real_ip_from 103.22.200.0/22;
    set_real_ip_from 103.31.4.0/22;
    set_real_ip_from 104.16.0.0/13;
    set_real_ip_from 104.24.0.0/14;
    set_real_ip_from 108.162.192.0/18;
    set_real_ip_from 131.0.72.0/22;
    set_real_ip_from 141.101.64.0/18;
    set_real_ip_from 162.158.0.0/15;
    set_real_ip_from 172.64.0.0/13;
    set_real_ip_from 173.245.48.0/20;
    set_real_ip_from 188.114.96.0/20;
    set_real_ip_from 190.93.240.0/20;
    set_real_ip_from 197.234.240.0/22;
    set_real_ip_from 198.41.128.0/17;
    real_ip_header CF-Connecting-IP;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # General settings
    client_max_body_size 5G;
    client_body_timeout 300s;
    client_header_timeout 60s;
    keepalive_timeout 65s;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Static files
    location /static/ {
        alias /home/ubuntu/brahim/be_watch-party/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri $uri/ =404;
    }
    
    # Media files
    location /media/ {
        alias /home/ubuntu/brahim/be_watch-party/media/;
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
        try_files $uri $uri/ =404;
    }
    
    # WebSocket connections
    location /ws/ {
        proxy_pass http://django_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
        proxy_connect_timeout 60s;
        
        limit_req zone=general burst=20 nodelay;
    }
    
    # API authentication endpoints
    location ~ ^/api/(auth|register|login)/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        limit_req zone=auth burst=10 nodelay;
        
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_connect_timeout 60s;
    }
    
    # File upload endpoints
    location ~ ^/api/(videos|media)/upload/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        limit_req zone=upload burst=5 nodelay;
        
        proxy_read_timeout 1800s;
        proxy_send_timeout 1800s;
        proxy_connect_timeout 60s;
        
        client_max_body_size 5G;
        client_body_timeout 1800s;
        proxy_request_buffering off;
    }
    
    # General API endpoints
    location /api/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        limit_req zone=api burst=200 nodelay;
        
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_connect_timeout 60s;
        
        proxy_buffering on;
        proxy_buffer_size 4k;
        proxy_buffers 8 4k;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        limit_req zone=general burst=50 nodelay;
        
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_connect_timeout 60s;
    }
    
    # Root and other requests
    location / {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        limit_req zone=general burst=100 nodelay;
        
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_connect_timeout 60s;
    }
    
    # Health check endpoint
    location /health/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        access_log off;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Log configuration
    access_log /var/log/nginx/be-watch-party.access.log;
    error_log /var/log/nginx/be-watch-party.error.log;
}
EOF

$SUDO mv /tmp/watch-party-ssl.conf "$NGINX_CONFIG"

# Test nginx configuration again
print_status "Testing nginx configuration with SSL..."
$SUDO nginx -t

if [ $? -ne 0 ]; then
    print_error "Nginx configuration test failed!"
    exit 1
fi

# Start nginx
print_status "Starting nginx with SSL configuration..."
$SUDO systemctl start nginx

# Setup auto-renewal for SSL certificates
print_status "Setting up SSL certificate auto-renewal..."
$SUDO systemctl enable certbot.timer
$SUDO systemctl start certbot.timer

# Create systemd service for Django backend
print_status "Creating systemd service for Django backend..."
cat > /tmp/watch-party-backend.service << 'EOF'
[Unit]
Description=Watch Party Django Backend
After=network.target redis-watchparty.service
Wants=redis-watchparty.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/brahim/be_watch-party
Environment=PATH=/home/ubuntu/brahim/be_watch-party/venv/bin
EnvironmentFile=/home/ubuntu/brahim/be_watch-party/.env
ExecStart=/home/ubuntu/brahim/be_watch-party/venv/bin/daphne -p 8000 watchparty.asgi:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

$SUDO mv /tmp/watch-party-backend.service /etc/systemd/system/

# Create Celery Worker service
print_status "Creating Celery Worker service..."
cat > /tmp/watch-party-celery-worker.service << 'EOF'
[Unit]
Description=Watch Party Celery Worker
After=network.target redis-watchparty.service
Wants=redis-watchparty.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/brahim/be_watch-party
Environment=PATH=/home/ubuntu/brahim/be_watch-party/venv/bin
EnvironmentFile=/home/ubuntu/brahim/be_watch-party/.env
ExecStart=/home/ubuntu/brahim/be_watch-party/venv/bin/celery -A watchparty worker --loglevel=info --concurrency=4 --max-tasks-per-child=1000
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

$SUDO mv /tmp/watch-party-celery-worker.service /etc/systemd/system/

# Create Celery Beat (scheduler) service
print_status "Creating Celery Beat service..."
cat > /tmp/watch-party-celery-beat.service << 'EOF'
[Unit]
Description=Watch Party Celery Beat Scheduler
After=network.target redis-watchparty.service
Wants=redis-watchparty.service

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=/home/ubuntu/brahim/be_watch-party
Environment=PATH=/home/ubuntu/brahim/be_watch-party/venv/bin
EnvironmentFile=/home/ubuntu/brahim/be_watch-party/.env
ExecStart=/home/ubuntu/brahim/be_watch-party/venv/bin/celery -A watchparty beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

$SUDO mv /tmp/watch-party-celery-beat.service /etc/systemd/system/

$SUDO systemctl daemon-reload
$SUDO systemctl enable watch-party-backend
$SUDO systemctl enable watch-party-celery-worker
$SUDO systemctl enable watch-party-celery-beat

# Create a management script
print_status "Creating management script..."
cat > /tmp/watch-party-manage.sh << 'EOF'
#!/bin/bash

# Watch Party Backend Management Script

BACKEND_PATH="/home/ubuntu/brahim/be_watch-party"
BACKEND_SERVICE="watch-party-backend"
CELERY_WORKER_SERVICE="watch-party-celery-worker"
CELERY_BEAT_SERVICE="watch-party-celery-beat"
REDIS_SERVICE="redis-watchparty"

case "$1" in
    start)
        echo "Starting Watch Party Backend and services..."
        sudo systemctl start $REDIS_SERVICE
        sudo systemctl start $BACKEND_SERVICE
        sudo systemctl start $CELERY_WORKER_SERVICE
        sudo systemctl start $CELERY_BEAT_SERVICE
        sudo systemctl start nginx
        ;;
    stop)
        echo "Stopping Watch Party Backend and services..."
        sudo systemctl stop $CELERY_BEAT_SERVICE
        sudo systemctl stop $CELERY_WORKER_SERVICE
        sudo systemctl stop $BACKEND_SERVICE
        ;;
    restart)
        echo "Restarting Watch Party Backend and services..."
        sudo systemctl restart $REDIS_SERVICE
        sudo systemctl restart $BACKEND_SERVICE
        sudo systemctl restart $CELERY_WORKER_SERVICE
        sudo systemctl restart $CELERY_BEAT_SERVICE
        sudo systemctl restart nginx
        ;;
    status)
        echo "=== Redis Status ==="
        sudo systemctl status $REDIS_SERVICE --no-pager
        echo ""
        echo "=== Backend Status ==="
        sudo systemctl status $BACKEND_SERVICE --no-pager
        echo ""
        echo "=== Celery Worker Status ==="
        sudo systemctl status $CELERY_WORKER_SERVICE --no-pager
        echo ""
        echo "=== Celery Beat Status ==="
        sudo systemctl status $CELERY_BEAT_SERVICE --no-pager
        echo ""
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager
        ;;
    logs)
        echo "=== Backend Logs ==="
        sudo journalctl -u $BACKEND_SERVICE -f
        ;;
    worker-logs)
        echo "=== Celery Worker Logs ==="
        sudo journalctl -u $CELERY_WORKER_SERVICE -f
        ;;
    beat-logs)
        echo "=== Celery Beat Logs ==="
        sudo journalctl -u $CELERY_BEAT_SERVICE -f
        ;;
    redis-logs)
        echo "=== Redis Logs ==="
        sudo tail -f /var/log/redis/watchparty/redis-server.log
        ;;
    nginx-logs)
        echo "=== Nginx Access Logs ==="
        sudo tail -f /var/log/nginx/be-watch-party.access.log
        ;;
    nginx-errors)
        echo "=== Nginx Error Logs ==="
        sudo tail -f /var/log/nginx/be-watch-party.error.log
        ;;
    redis-cli)
        echo "=== Connecting to Redis ==="
        redis-cli -p 6380 -a watchparty_redis_2025
        ;;
    celery-status)
        echo "=== Celery Status ==="
        cd $BACKEND_PATH
        source venv/bin/activate
        celery -A watchparty inspect active
        ;;
    deploy)
        echo "Deploying latest changes..."
        cd $BACKEND_PATH
        git pull
        source venv/bin/activate
        pip install -r requirements.txt
        python manage.py collectstatic --noinput
        python manage.py migrate
        sudo systemctl restart $BACKEND_SERVICE
        sudo systemctl restart $CELERY_WORKER_SERVICE
        sudo systemctl restart $CELERY_BEAT_SERVICE
        echo "Deployment complete!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|worker-logs|beat-logs|redis-logs|nginx-logs|nginx-errors|redis-cli|celery-status|deploy}"
        echo ""
        echo "Available commands:"
        echo "  start          - Start all services"
        echo "  stop           - Stop all services"
        echo "  restart        - Restart all services"
        echo "  status         - Show status of all services"
        echo "  logs           - Show backend logs (follow)"
        echo "  worker-logs    - Show Celery worker logs (follow)"
        echo "  beat-logs      - Show Celery beat logs (follow)"
        echo "  redis-logs     - Show Redis logs (follow)"
        echo "  nginx-logs     - Show Nginx access logs (follow)"
        echo "  nginx-errors   - Show Nginx error logs (follow)"
        echo "  redis-cli      - Connect to Redis CLI"
        echo "  celery-status  - Show Celery worker status"
        echo "  deploy         - Deploy latest changes"
        exit 1
        ;;
esac
EOF
        echo "=== Backend Logs ==="
        sudo journalctl -u $SERVICE_NAME -f
        ;;
    nginx-logs)
        echo "=== Nginx Access Logs ==="
        sudo tail -f /var/log/nginx/be-watch-party.access.log
        ;;
    nginx-errors)
        echo "=== Nginx Error Logs ==="
        sudo tail -f /var/log/nginx/be-watch-party.error.log
        ;;
    deploy)
        echo "Deploying latest changes..."
        cd $BACKEND_PATH
        git pull
        source venv/bin/activate
        pip install -r requirements.txt
        python manage.py collectstatic --noinput
        python manage.py migrate
        sudo systemctl restart $SERVICE_NAME
        echo "Deployment complete!"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|nginx-logs|nginx-errors|deploy}"
        exit 1
        ;;
esac
EOF

$SUDO mv /tmp/watch-party-manage.sh /usr/local/bin/watch-party
$SUDO chmod +x /usr/local/bin/watch-party

print_status "✅ Setup completed successfully!"
echo ""
print_status "🎉 Your Watch Party Backend is now configured with:"
echo "   • Domain: https://be-watch-party.brahim-elhouss.me"
echo "   • SSL Certificate: Let's Encrypt (auto-renewal enabled)"
echo "   • Nginx: Configured with rate limiting and security headers"
echo "   • Cloudflare: Real IP detection configured"
echo ""
print_status "📝 Management commands:"
echo "   • Start backend: watch-party start"
echo "   • Stop backend: watch-party stop"
echo "   • Restart backend: watch-party restart"
echo "   • Check status: watch-party status"
echo "   • View logs: watch-party logs"
echo "   • Deploy updates: watch-party deploy"
echo ""
print_warning "⚠️  Next steps:"
echo "   1. Make sure your Django backend is running in production mode"
echo "   2. Set ALLOWED_HOSTS to include 'be-watch-party.brahim-elhouss.me'"
echo "   3. Configure your environment variables (.env file)"
echo "   4. Run: watch-party start"
echo "   5. Test: curl https://be-watch-party.brahim-elhouss.me/api/test/"
echo ""
print_status "🔧 To start your backend now, run:"
echo "   cd $BACKEND_PATH"
echo "   source venv/bin/activate"
echo "   watch-party start"

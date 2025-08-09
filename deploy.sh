#!/bin/bash

# Watch Party Unified Deployment Script
# Deploys both frontend and backend components with PM2 and Nginx

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_BACKEND="be-watch-party.brahim-elhouss.me"
DOMAIN_FRONTEND="watch-party.brahim-elhouss.me"
PROJECT_ROOT="/home/ubuntu/watch-party"
BACKEND_PATH="$PROJECT_ROOT/back-end"
FRONTEND_PATH="$PROJECT_ROOT/front-end"
NGINX_CONFIG_DIR="/etc/nginx/sites-available"
NGINX_ENABLED_DIR="/etc/nginx/sites-enabled"

# Port Configuration (can be overridden via environment variables)
DEFAULT_BACKEND_PORT=8000
DEFAULT_FRONTEND_PORT=3000
BACKEND_PORT=${WATCH_PARTY_BACKEND_PORT:-$DEFAULT_BACKEND_PORT}
FRONTEND_PORT=${WATCH_PARTY_FRONTEND_PORT:-$DEFAULT_FRONTEND_PORT}

# Port range for automatic selection if defaults are taken
PORT_RANGE_START=8001
PORT_RANGE_END=8100

# Print functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}==================== $1 ====================${NC}"
}

# Function to check if a port is available
is_port_available() {
    local port=$1
    if command -v netstat &> /dev/null; then
        ! netstat -tuln | grep -q ":$port "
    elif command -v ss &> /dev/null; then
        ! ss -tuln | grep -q ":$port "
    else
        # Fallback: try to bind to the port
        ! nc -z localhost "$port" 2>/dev/null
    fi
}

# Function to find an available port
find_available_port() {
    local start_port=$1
    local end_port=$2
    local service_name=$3
    
    for port in $(seq $start_port $end_port); do
        if is_port_available $port; then
            echo $port
            return 0
        fi
    done
    
    print_error "No available ports found in range $start_port-$end_port for $service_name"
    return 1
}

# Function to check and assign ports
check_and_assign_ports() {
    print_section "CHECKING PORT AVAILABILITY"
    
    # Check backend port
    if is_port_available $BACKEND_PORT; then
        print_status "Backend port $BACKEND_PORT is available"
    else
        print_warning "Backend port $BACKEND_PORT is in use, finding alternative..."
        BACKEND_PORT=$(find_available_port $PORT_RANGE_START $PORT_RANGE_END "backend")
        if [ $? -eq 0 ]; then
            print_status "Backend will use port $BACKEND_PORT"
        else
            print_error "Could not find available port for backend"
            exit 1
        fi
    fi
    
    # Check frontend port  
    if is_port_available $FRONTEND_PORT; then
        print_status "Frontend port $FRONTEND_PORT is available"
    else
        print_warning "Frontend port $FRONTEND_PORT is in use, finding alternative..."
        # For frontend, start from 3001 to keep it in the 3000s range
        FRONTEND_PORT=$(find_available_port 3001 3100 "frontend")
        if [ $? -eq 0 ]; then
            print_status "Frontend will use port $FRONTEND_PORT"
        else
            print_error "Could not find available port for frontend"
            exit 1
        fi
    fi
    
    # Export ports for use in configuration files
    export WATCH_PARTY_BACKEND_PORT=$BACKEND_PORT
    export WATCH_PARTY_FRONTEND_PORT=$FRONTEND_PORT
    
    print_status "Port assignment complete:"
    print_status "  Backend:  $BACKEND_PORT"
    print_status "  Frontend: $FRONTEND_PORT"
}

# Check if running as root or with sudo
if [[ $EUID -eq 0 ]]; then
    print_warning "Running as root. This is fine for setup."
    SUDO=""
else
    SUDO="sudo"
fi

# Function to install system dependencies
install_dependencies() {
    print_section "INSTALLING SYSTEM DEPENDENCIES"
    
    print_status "Updating system packages..."
    $SUDO apt update
    
    print_status "Installing required packages..."
    $SUDO apt install -y nginx certbot python3-certbot-nginx curl redis-server supervisor git python3-venv python3-pip
    
    # Install Node.js and pnpm if not installed
    if ! command -v node &> /dev/null; then
        print_status "Installing Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
        $SUDO apt-get install -y nodejs
    fi
    
    if ! command -v pnpm &> /dev/null; then
        print_status "Installing pnpm..."
        curl -fsSL https://get.pnpm.io/install.sh | sh -
        export PATH="$HOME/.local/share/pnpm:$PATH"
    fi
    
    # Install PM2 globally
    if ! command -v pm2 &> /dev/null; then
        print_status "Installing PM2..."
        npm install -g pm2
        pm2 install pm2-logrotate
    fi
}

# Function to configure Redis
configure_redis() {
    print_section "CONFIGURING REDIS"
    
    print_status "Setting up Redis for Watch Party..."
    $SUDO mkdir -p /etc/redis/watchparty
    $SUDO mkdir -p /var/lib/redis/watchparty
    $SUDO mkdir -p /var/log/redis/watchparty
    
    cat > /tmp/redis-watchparty.conf << 'EOF'
# Redis configuration for Watch Party
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

databases 16
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
EOF
    
    $SUDO mv /tmp/redis-watchparty.conf /etc/redis/watchparty/redis.conf
    $SUDO chown -R redis:redis /var/lib/redis/watchparty/
    $SUDO chown -R redis:redis /var/log/redis/watchparty/
    
    # Create Redis systemd service
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
    
    print_status "Redis configured on port 6380"
}

# Function to setup backend
setup_backend() {
    print_section "SETTING UP BACKEND"
    
    print_status "Creating Python virtual environment..."
    cd $BACKEND_PATH
    
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    print_status "Installing Python dependencies..."
    pip install --upgrade pip
    pip install -r requirements.txt
    
    print_status "Running Django migrations..."
    python manage.py migrate
    
    print_status "Collecting static files..."
    python manage.py collectstatic --noinput
    
    deactivate
    
    # Create PM2 ecosystem file for backend
    cat > $BACKEND_PATH/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'watch-party-backend',
      cwd: '/home/ubuntu/watch-party/back-end',
      script: './venv/bin/daphne',
      args: '-p $BACKEND_PORT watchparty.asgi:application',
      env_file: '.env',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      log_file: '/var/log/watch-party/backend.log',
      out_file: '/var/log/watch-party/backend-out.log',
      error_file: '/var/log/watch-party/backend-error.log',
      time: true
    },
    {
      name: 'watch-party-celery-worker',
      cwd: '/home/ubuntu/watch-party/back-end',
      script: './venv/bin/celery',
      args: '-A watchparty worker --loglevel=info --concurrency=4 --max-tasks-per-child=1000',
      env_file: '.env',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      log_file: '/var/log/watch-party/celery-worker.log',
      out_file: '/var/log/watch-party/celery-worker-out.log',
      error_file: '/var/log/watch-party/celery-worker-error.log',
      time: true
    },
    {
      name: 'watch-party-celery-beat',
      cwd: '/home/ubuntu/watch-party/back-end',
      script: './venv/bin/celery',
      args: '-A watchparty beat --loglevel=info --scheduler django_celery_beat.schedulers:DatabaseScheduler',
      env_file: '.env',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      log_file: '/var/log/watch-party/celery-beat.log',
      out_file: '/var/log/watch-party/celery-beat-out.log',
      error_file: '/var/log/watch-party/celery-beat-error.log',
      time: true
    }
  ]
};
EOF
    
    print_status "Backend setup complete"
    
    # Setup environment file if it doesn't exist
    if [ ! -f "$BACKEND_PATH/.env" ]; then
        if [ -f "$BACKEND_PATH/.env.production.example" ]; then
            print_status "Creating backend .env from .env.production.example..."
            cp "$BACKEND_PATH/.env.production.example" "$BACKEND_PATH/.env"
            print_warning "Please update $BACKEND_PATH/.env with your actual configuration values"
        else
            print_warning "No .env.production.example found. Please create $BACKEND_PATH/.env manually"
        fi
    else
        print_status "Backend .env file already exists"
    fi
}

# Function to setup frontend
setup_frontend() {
    print_section "SETTING UP FRONTEND"
    
    cd $FRONTEND_PATH
    
    print_status "Installing frontend dependencies..."
    pnpm install
    
    print_status "Building frontend..."
    pnpm build
    
    # Create PM2 ecosystem file for frontend
    cat > $FRONTEND_PATH/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'watch-party-frontend',
      cwd: '/home/ubuntu/watch-party/front-end',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: $FRONTEND_PORT
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      log_file: '/var/log/watch-party/frontend.log',
      out_file: '/var/log/watch-party/frontend-out.log',
      error_file: '/var/log/watch-party/frontend-error.log',
      time: true
    }
  ]
};
EOF
    
    print_status "Frontend setup complete"
    
    # Setup environment file for production
    if [ ! -f "$FRONTEND_PATH/.env.local" ]; then
        if [ -f "$FRONTEND_PATH/.env.production.example" ]; then
            print_status "Creating frontend .env.local from .env.production.example..."
            cp "$FRONTEND_PATH/.env.production.example" "$FRONTEND_PATH/.env.local"
            print_warning "Please update $FRONTEND_PATH/.env.local with your actual configuration values"
        else
            print_warning "No .env.production.example found. Please create $FRONTEND_PATH/.env.local manually"
        fi
    else
        print_status "Frontend .env.local file already exists"
        # Update existing .env.local for production URLs if needed
        if grep -q "localhost:3000" "$FRONTEND_PATH/.env.local"; then
            print_warning "Frontend .env.local contains localhost URLs. Consider updating for production."
        fi
    fi
}

# Function to configure Nginx
configure_nginx() {
    print_section "CONFIGURING NGINX"
    
    print_status "Creating Nginx configuration with ports: Backend=$BACKEND_PORT, Frontend=$FRONTEND_PORT"
    
    # Create combined nginx configuration using variable substitution
    cat > /tmp/watch-party.conf << EOF
# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=auth:10m rate=10r/m;
limit_req_zone \$binary_remote_addr zone=api:10m rate=100r/m;
limit_req_zone \$binary_remote_addr zone=upload:10m rate=5r/m;
limit_req_zone \$binary_remote_addr zone=general:10m rate=50r/m;

# Upstream servers
upstream backend_server {
    server 127.0.0.1:$BACKEND_PORT;
    keepalive 32;
}

upstream frontend_server {
    server 127.0.0.1:$FRONTEND_PORT;
    keepalive 32;
}

# Backend HTTP server - redirect to HTTPS
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

# Frontend HTTP server - redirect to HTTPS  
server {
    listen 80;
    server_name watch-party.brahim-elhouss.me;
    
    # Let's Encrypt challenge
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all HTTP traffic to HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# Backend HTTPS server
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
        alias /home/ubuntu/watch-party/back-end/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
        try_files $uri $uri/ =404;
    }
    
    # Media files
    location /media/ {
        alias /home/ubuntu/watch-party/back-end/media/;
        expires 1y;
        add_header Cache-Control "public";
        access_log off;
        try_files $uri $uri/ =404;
    }
    
    # WebSocket connections
    location /ws/ {
        proxy_pass http://backend_server;
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
        proxy_pass http://backend_server;
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
        proxy_pass http://backend_server;
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
        proxy_pass http://backend_server;
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
        proxy_pass http://backend_server;
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
    
    # Health check endpoint
    location /health/ {
        proxy_pass http://backend_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        access_log off;
    }
    
    # Root and other requests
    location / {
        proxy_pass http://backend_server;
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
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Log configuration
    access_log /var/log/nginx/be-watch-party.access.log;
    error_log /var/log/nginx/be-watch-party.error.log;
}

# Frontend HTTPS server
server {
    listen 443 ssl http2;
    server_name watch-party.brahim-elhouss.me;
    
    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/watch-party.brahim-elhouss.me/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/watch-party.brahim-elhouss.me/privkey.pem;
    
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
    client_max_body_size 50M;
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
    
    # Next.js static files
    location /_next/static/ {
        proxy_pass http://frontend_server;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
    
    # All requests go to Next.js
    location / {
        proxy_pass http://frontend_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # WebSocket support for Next.js HMR and real-time features
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        limit_req zone=general burst=100 nodelay;
        
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
        proxy_connect_timeout 60s;
    }
    
    # Log configuration
    access_log /var/log/nginx/watch-party.access.log;
    error_log /var/log/nginx/watch-party.error.log;
}
EOF
    
    $SUDO mv /tmp/watch-party.conf "$NGINX_CONFIG_DIR/watch-party"
    $SUDO ln -sf "$NGINX_CONFIG_DIR/watch-party" "$NGINX_ENABLED_DIR/watch-party"
    
    # Remove default nginx site if it exists
    if [ -f "$NGINX_ENABLED_DIR/default" ]; then
        print_status "Removing default nginx site..."
        $SUDO rm -f "$NGINX_ENABLED_DIR/default"
    fi
    
    print_status "Nginx configuration created"
}

# Function to obtain SSL certificates
setup_ssl() {
    print_section "SETTING UP SSL CERTIFICATES"
    
    print_status "Testing Nginx configuration..."
    $SUDO nginx -t
    
    if [ $? -ne 0 ]; then
        print_error "Nginx configuration test failed!"
        exit 1
    fi
    
    $SUDO systemctl start nginx
    $SUDO systemctl enable nginx
    
    print_warning "Make sure your domains DNS are pointing to this server before continuing!"
    print_warning "Set Cloudflare to 'DNS Only' mode during SSL setup."
    read -p "Press Enter to continue with SSL certificate generation, or Ctrl+C to cancel..."
    
    # Get SSL certificates
    print_status "Obtaining SSL certificate for backend..."
    $SUDO certbot certonly \
        --nginx \
        --non-interactive \
        --agree-tos \
        --email admin@brahim-elhouss.me \
        -d "$DOMAIN_BACKEND"
    
    if [ $? -ne 0 ]; then
        print_error "Failed to obtain SSL certificate for backend!"
        exit 1
    fi
    
    print_status "Obtaining SSL certificate for frontend..."
    $SUDO certbot certonly \
        --nginx \
        --non-interactive \
        --agree-tos \
        --email admin@brahim-elhouss.me \
        -d "$DOMAIN_FRONTEND"
    
    if [ $? -ne 0 ]; then
        print_error "Failed to obtain SSL certificate for frontend!"
        exit 1
    fi
    
    # Setup auto-renewal
    $SUDO systemctl enable certbot.timer
    $SUDO systemctl start certbot.timer
    
    print_status "SSL certificates obtained and auto-renewal configured"
}

# Function to create log directories
setup_logging() {
    print_section "SETTING UP LOGGING"
    
    $SUDO mkdir -p /var/log/watch-party
    $SUDO chown ubuntu:ubuntu /var/log/watch-party
    $SUDO mkdir -p /var/log/nginx
    
    print_status "Log directories created"
}

# Function to start services
start_services() {
    print_section "STARTING SERVICES"
    
    # Start Redis
    $SUDO systemctl start redis-watchparty
    
    # Start PM2 processes
    print_status "Starting backend services..."
    cd $BACKEND_PATH
    pm2 start ecosystem.config.js
    
    print_status "Starting frontend service..."
    cd $FRONTEND_PATH
    pm2 start ecosystem.config.js
    
    # Save PM2 configuration and setup startup
    pm2 save
    pm2 startup
    
    # Restart Nginx with new configuration
    print_status "Restarting Nginx..."
    $SUDO nginx -t && $SUDO systemctl restart nginx
    
    print_status "All services started"
}

# Function to save port configuration
save_port_config() {
    print_section "SAVING PORT CONFIGURATION"
    
    local config_file="$PROJECT_ROOT/.port-config"
    cat > "$config_file" << EOF
# Watch Party Port Configuration
# Generated on $(date)
BACKEND_PORT=$BACKEND_PORT
FRONTEND_PORT=$FRONTEND_PORT
REDIS_PORT=6380
EOF
    
    print_status "Port configuration saved to $config_file"
    print_status "  Backend:  $BACKEND_PORT"
    print_status "  Frontend: $FRONTEND_PORT"
    print_status "  Redis:    6380"
}

# Function to create management script
create_management_script() {
    print_section "CREATING MANAGEMENT SCRIPT"
    
    cat > /tmp/watch-party-manage.sh << 'EOF'
#!/bin/bash

# Watch Party Management Script

PROJECT_ROOT="/home/ubuntu/watch-party"
BACKEND_PATH="$PROJECT_ROOT/back-end"
FRONTEND_PATH="$PROJECT_ROOT/front-end"

# Load port configuration
if [ -f "$PROJECT_ROOT/.port-config" ]; then
    source "$PROJECT_ROOT/.port-config"
else
    BACKEND_PORT=8000
    FRONTEND_PORT=3000
fi

case "$1" in
    start)
        echo "Starting Watch Party services..."
        sudo systemctl start redis-watchparty
        sudo systemctl start nginx
        cd $BACKEND_PATH && pm2 start ecosystem.config.js
        cd $FRONTEND_PATH && pm2 start ecosystem.config.js
        ;;
    stop)
        echo "Stopping Watch Party services..."
        pm2 stop all
        ;;
    restart)
        echo "Restarting Watch Party services..."
        sudo systemctl restart redis-watchparty
        sudo systemctl restart nginx
        pm2 restart all
        ;;
    status)
        echo "=== PM2 Status ==="
        pm2 status
        echo ""
        echo "=== Redis Status ==="
        sudo systemctl status redis-watchparty --no-pager
        echo ""
        echo "=== Nginx Status ==="
        sudo systemctl status nginx --no-pager
        ;;
    logs)
        case "$2" in
            backend)
                pm2 logs watch-party-backend
                ;;
            frontend)
                pm2 logs watch-party-frontend
                ;;
            celery-worker)
                pm2 logs watch-party-celery-worker
                ;;
            celery-beat)
                pm2 logs watch-party-celery-beat
                ;;
            nginx-backend)
                sudo tail -f /var/log/nginx/be-watch-party.access.log
                ;;
            nginx-frontend)
                sudo tail -f /var/log/nginx/watch-party.access.log
                ;;
            nginx-errors)
                sudo tail -f /var/log/nginx/*.error.log
                ;;
            all)
                pm2 logs
                ;;
            *)
                echo "Usage: $0 logs {backend|frontend|celery-worker|celery-beat|nginx-backend|nginx-frontend|nginx-errors|all}"
                ;;
        esac
        ;;
    deploy)
        echo "Deploying latest changes..."
        cd $PROJECT_ROOT
        git pull
        
        echo "Updating backend..."
        cd $BACKEND_PATH
        source venv/bin/activate
        pip install -r requirements.txt
        python manage.py migrate
        python manage.py collectstatic --noinput
        deactivate
        
        echo "Updating frontend..."
        cd $FRONTEND_PATH
        pnpm install
        pnpm build
        
        echo "Restarting services..."
        pm2 restart all
        
        echo "Deployment complete!"
        ;;
    monitor)
        pm2 monit
        ;;
    config)
        echo "=== Configuration Files Status ==="
        echo "Backend .env: $([ -f $BACKEND_PATH/.env ] && echo "✅ Exists" || echo "❌ Missing")"
        echo "Frontend .env.local: $([ -f $FRONTEND_PATH/.env.local ] && echo "✅ Exists" || echo "❌ Missing")"
        echo ""
        echo "To create missing config files:"
        echo "Backend:  cp $BACKEND_PATH/.env.production.example $BACKEND_PATH/.env"
        echo "Frontend: cp $FRONTEND_PATH/.env.production.example $FRONTEND_PATH/.env.local"
        ;;
    update-env)
        echo "Updating environment files from examples..."
        if [ -f "$BACKEND_PATH/.env.production.example" ]; then
            echo "Backend example available. Update manually: $BACKEND_PATH/.env"
        fi
        if [ -f "$FRONTEND_PATH/.env.production.example" ]; then
            echo "Frontend example available. Update manually: $FRONTEND_PATH/.env.local"  
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs|deploy|monitor|config|update-env}"
        echo ""
        echo "Available commands:"
        echo "  start       - Start all services"
        echo "  stop        - Stop all services"
        echo "  restart     - Restart all services"
        echo "  status      - Show status of all services"
        echo "  logs        - Show logs (specify: backend|frontend|celery-worker|celery-beat|nginx-backend|nginx-frontend|nginx-errors|all)"
        echo "  deploy      - Deploy latest changes from git"
        echo "  monitor     - Open PM2 monitoring dashboard"
        echo "  config      - Check configuration files status"
        echo "  update-env  - Show how to update environment files"
        exit 1
        ;;
esac
EOF
    
    $SUDO mv /tmp/watch-party-manage.sh /usr/local/bin/watch-party
    $SUDO chmod +x /usr/local/bin/watch-party
    
    print_status "Management script created at /usr/local/bin/watch-party"
}

# Main deployment function
main() {
    print_section "WATCH PARTY UNIFIED DEPLOYMENT"
    
    case "$1" in
        --full)
            print_status "Running full deployment..."
            check_and_assign_ports
            install_dependencies
            configure_redis
            setup_logging
            setup_backend
            setup_frontend
            configure_nginx
            setup_ssl
            start_services
            save_port_config
            create_management_script
            ;;
        --no-ssl)
            print_status "Running deployment without SSL..."
            check_and_assign_ports
            install_dependencies
            configure_redis
            setup_logging
            setup_backend
            setup_frontend
            configure_nginx
            start_services
            save_port_config
            create_management_script
            ;;
        --ssl-only)
            print_status "Setting up SSL certificates only..."
            setup_ssl
            ;;
        --services-only)
            print_status "Starting services only..."
            start_services
            ;;
        *)
            echo "Usage: $0 {--full|--no-ssl|--ssl-only|--services-only}"
            echo ""
            echo "Options:"
            echo "  --full          Full deployment with SSL certificates"
            echo "  --no-ssl        Deployment without SSL (for testing)"
            echo "  --ssl-only      Only setup SSL certificates"
            echo "  --services-only Only start services"
            echo ""
            echo "For first-time deployment, use: $0 --full"
            exit 1
            ;;
    esac
    
    print_section "DEPLOYMENT COMPLETE"
    print_status "✅ Watch Party deployment completed successfully!"
    echo ""
    print_status "🎉 Your applications are now running:"
    echo "   • Frontend: https://watch-party.brahim-elhouss.me"
    echo "   • Backend:  https://be-watch-party.brahim-elhouss.me"
    echo "   • Admin:    https://be-watch-party.brahim-elhouss.me/admin/"
    echo ""
    print_status "📝 Management commands:"
    echo "   • Start services:     watch-party start"
    echo "   • Stop services:      watch-party stop"
    echo "   • Restart services:   watch-party restart"
    echo "   • Check status:       watch-party status"
    echo "   • View logs:          watch-party logs [service]"
    echo "   • Deploy updates:     watch-party deploy"
    echo "   • Monitor services:   watch-party monitor"
    echo ""
    print_warning "⚠️  Next steps:"
    echo "   1. Configure your environment variables (.env files)"
    echo "   2. Set up your domains in Cloudflare"
    echo "   3. Test the applications"
    echo "   4. Set up monitoring and backups"
}

# Run main function with arguments
main "$@"

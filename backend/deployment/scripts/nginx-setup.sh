#!/bin/bash
set -euo pipefail

# Watch Party Backend - Nginx Setup Script
# Configures Nginx reverse proxy with SSL support

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
DOMAIN="${1:-be-watch-party.brahim-elhouss.me}"
PROJECT_DIR="/opt/watch-party-backend"

log_info "Setting up Nginx for domain: $DOMAIN"

# Remove default nginx site
log_info "Removing default Nginx configuration..."
sudo rm -f /etc/nginx/sites-enabled/default

# Create Nginx configuration
log_info "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/watchparty-backend << EOF > /dev/null
upstream django_backend { 
    server 127.0.0.1:8000; 
    keepalive 32; 
}

upstream websocket_backend { 
    server 127.0.0.1:8002; 
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name $DOMAIN *.brahim-elhouss.me;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN *.brahim-elhouss.me;
    
    # SSL Configuration (will be updated by Cloudflare setup)
    ssl_certificate /etc/ssl/certs/cloudflare-origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 50M;
    
    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Logging
    access_log /var/log/nginx/watchparty_access.log;
    error_log /var/log/nginx/watchparty_error.log warn;

    # Static files
    location /static/ { 
        alias $PROJECT_DIR/staticfiles/; 
        expires 1y; 
        add_header Cache-Control "public, immutable"; 
        try_files \$uri \$uri/ =404;
    }
    
    location /media/ { 
        alias $PROJECT_DIR/media/; 
        expires 30d; 
        add_header Cache-Control "public"; 
        try_files \$uri \$uri/ =404;
    }

    # WebSocket connections
    location /ws/ {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 86400;
        proxy_connect_timeout 10;
        proxy_send_timeout 10;
    }

    # Health check endpoint
    location /health/ {
        proxy_pass http://django_backend;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        access_log off;
    }

    # All other requests to Django
    location / { 
        proxy_pass http://django_backend; 
        proxy_set_header Host \$host; 
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for; 
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Timeouts
        proxy_connect_timeout 30;
        proxy_send_timeout 30;
        proxy_read_timeout 120;
        
        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }
}
EOF

# Enable the site
log_info "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/watchparty-backend /etc/nginx/sites-enabled/

# Test Nginx configuration
log_info "Testing Nginx configuration..."
sudo nginx -t

# Restart Nginx
log_info "Restarting Nginx..."
sudo systemctl restart nginx
sudo systemctl enable nginx

log_success "Nginx setup completed!"
log_info "Configuration:"
log_info "- Domain: $DOMAIN"
log_info "- HTTP -> HTTPS redirect: Enabled"
log_info "- Static files: $PROJECT_DIR/staticfiles/"
log_info "- Media files: $PROJECT_DIR/media/"
log_info "- WebSocket support: Enabled on /ws/"
log_info "- Django backend: 127.0.0.1:8000"
log_info "- WebSocket backend: 127.0.0.1:8002"

log_warning "Next step: Run ./deployment/scripts/ssl-setup.sh to configure SSL certificates"
#!/bin/bash

# =============================================================================
# Watch Party - Server Configuration Update Script
# =============================================================================
# Updates Nginx and PM2 to support both Frontend and Backend domains.
# Server: 35.181.116.57
# =============================================================================

set -e

# Configuration
SERVER_HOST="35.181.116.57"
ADMIN_USER="ubuntu"
APP_USER="deploy"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
APP_DIR="/home/deploy/watch-party"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_header() { echo -e "${BLUE}[UPDATE]${NC} $1"; }

# 1. Update Nginx Configuration (requires sudo -> use ADMIN_USER)
print_header "Updating Nginx Configuration (as $ADMIN_USER)"

ssh -i "$SSH_KEY" "$ADMIN_USER@$SERVER_HOST" "sudo tee /etc/nginx/sites-available/watchparty-backend > /dev/null" << 'EOF'
# Watch Party - Complete Nginx Configuration
# Supports:
# - Backend: be-watch-party.brahim-elhouss.me (Django @ 8000)
# - Frontend: watch-party.brahim-elhouss.me (Next.js @ 3000)
# - SSL: Cloudflare Origin Certificates

upstream django_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

upstream nextjs_frontend {
    server 127.0.0.1:3000;
    keepalive 32;
}

upstream websocket_backend {
    server 127.0.0.1:8002;
}

# HTTP Redirect to HTTPS
server {
    listen 80;
    server_name be-watch-party.brahim-elhouss.me watch-party.brahim-elhouss.me 35.181.116.57;
    return 301 https://$host$request_uri;
}

# Backend Server Block
server {
    listen 443 ssl http2;
    server_name be-watch-party.brahim-elhouss.me;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/cloudflare-origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Logging
    access_log /var/log/nginx/backend_access.log;
    error_log /var/log/nginx/backend_error.log warn;

    # Static files
    location /static/ {
        alias /home/deploy/watch-party/backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /home/deploy/watch-party/backend/mediafiles/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # WebSocket connections
    location /ws/ {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API & Admin
    location / {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Frontend Server Block
server {
    listen 443 ssl http2;
    server_name watch-party.brahim-elhouss.me;

    # SSL Configuration
    ssl_certificate /etc/ssl/certs/cloudflare-origin.pem;
    ssl_certificate_key /etc/ssl/private/cloudflare-origin.key;
    ssl_protocols TLSv1.2 TLSv1.3;

    # Logging
    access_log /var/log/nginx/frontend_access.log;
    error_log /var/log/nginx/frontend_error.log warn;

    location / {
        proxy_pass http://nextjs_frontend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

print_status "Nginx configuration updated."

# 2. Update PM2 Configuration (as APP_USER)
print_header "Updating PM2 Configuration and Scripts (as $APP_USER)"

# Update start-django.sh
ssh -i "$SSH_KEY" "$APP_USER@$SERVER_HOST" "cat > $APP_DIR/backend/start-django.sh" << 'EOF'
#!/bin/bash
cd /home/deploy/watch-party/backend
source venv/bin/activate
export $(grep -v "^#" .env | xargs)
exec gunicorn --workers 2 --worker-class gevent --worker-connections 500 --bind 127.0.0.1:8000 --timeout 120 --keep-alive 5 --access-logfile /home/deploy/watch-party/logs/gunicorn_access.log --error-logfile /home/deploy/watch-party/logs/gunicorn_error.log config.wsgi:application
EOF

ssh -i "$SSH_KEY" "$APP_USER@$SERVER_HOST" "chmod +x $APP_DIR/backend/start-django.sh"

# Update ecosystem.config.js
ssh -i "$SSH_KEY" "$APP_USER@$SERVER_HOST" "cat > $APP_DIR/backend/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [
    {
      name: "watchparty-django",
      script: "/home/deploy/watch-party/backend/start-django.sh",
      cwd: "/home/deploy/watch-party/backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        DJANGO_SETTINGS_MODULE: "config.settings.production"
      }
    },
    {
      name: "watchparty-frontend",
      script: "npm",
      args: "start",
      cwd: "/home/deploy/watch-party/frontend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        NEXT_PUBLIC_API_URL: "https://be-watch-party.brahim-elhouss.me/api",
        NEXT_PUBLIC_WS_URL: "wss://be-watch-party.brahim-elhouss.me/ws"
      }
    }
  ]
};
EOF

print_status "PM2 configuration updated."

# 3. Build Frontend and Restart Services (as APP_USER)
print_header "Building Frontend and Restarting Services (as $APP_USER)"

ssh -i "$SSH_KEY" "$APP_USER@$SERVER_HOST" << 'EOF'
    set -e
    
    # Ensure PM2 is available (install locally if needed)
    # We will install it in frontend directory later

    # 0. Setup Backend Environment
    echo "Setting up Backend Environment..."
    cd /home/deploy/watch-party/backend
    
    # Create logs directory
    mkdir -p /home/deploy/watch-party/logs
    
    # Create venv if missing
    if [ ! -d "venv" ]; then
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    
    # Install requirements
    pip install --upgrade pip
    pip install -r requirements.txt
    pip install gunicorn gevent
    
    # Run migrations and collect static
    python manage.py migrate --noinput
    python manage.py collectstatic --noinput

    # 1. Install Frontend Dependencies
    echo "Installing frontend dependencies..."
    cd /home/deploy/watch-party/frontend
    # Check if pnpm is installed, else use npm
    if ! command -v pnpm &> /dev/null; then
        npm install -g pnpm || echo "Cannot install pnpm globally, using npm"
    fi
    
    if command -v pnpm &> /dev/null; then
        pnpm install
    else
        npm install
    fi
    
    # 2. Build Frontend
    echo "Building frontend..."
    # Ensure env vars are present for build
    export NEXT_PUBLIC_API_URL="https://be-watch-party.brahim-elhouss.me/api"
    export NEXT_PUBLIC_WS_URL="wss://be-watch-party.brahim-elhouss.me/ws"
    
    if command -v pnpm &> /dev/null; then
        pnpm build
    else
        npm run build
    fi
    
    # 3. Restart PM2
    echo "Restarting PM2..."
    cd /home/deploy/watch-party/frontend
    
    # Ensure pm2 is installed
    npm install pm2 --save-dev
    
    # Use npx to run pm2
    npx pm2 restart ../backend/ecosystem.config.js || npx pm2 start ../backend/ecosystem.config.js
    npx pm2 save
EOF

# 4. Restart Nginx (as ADMIN_USER)
print_header "Restarting Nginx (as $ADMIN_USER)"
ssh -i "$SSH_KEY" "$ADMIN_USER@$SERVER_HOST" << 'EOF'
    # Remove old config if exists
    if [ -f /etc/nginx/sites-enabled/watch-party ]; then
        sudo rm /etc/nginx/sites-enabled/watch-party
    fi
    
    # Enable new config
    if [ ! -f /etc/nginx/sites-enabled/watchparty-backend ]; then
        sudo ln -s /etc/nginx/sites-available/watchparty-backend /etc/nginx/sites-enabled/watchparty-backend
    fi
    
    sudo nginx -t && sudo systemctl restart nginx
EOF

print_status "Update complete! Check your domains now."


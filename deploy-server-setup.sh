#!/bin/bash

# Server Setup Script for Watch Party Production Deployment
# Run this script on the server as ubuntu user

set -e

echo "🚀 Setting up Watch Party production server..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
echo "📦 Installing required packages..."
sudo apt install -y \
    nginx \
    python3 \
    python3-pip \
    python3-venv \
    postgresql \
    postgresql-contrib \
    redis-server \
    git \
    curl \
    wget \
    unzip \
    supervisor \
    certbot \
    python3-certbot-nginx \
    htop \
    fail2ban \
    ufw

# Install Node.js (for potential frontend deployment)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Setup PostgreSQL
echo "🗄️ Setting up PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user for watch party
sudo -u postgres psql << EOF
CREATE DATABASE watchparty_prod;
CREATE USER watchparty_user WITH PASSWORD 'secure_password_2024!';
GRANT ALL PRIVILEGES ON DATABASE watchparty_prod TO watchparty_user;
ALTER USER watchparty_user CREATEDB;
\q
EOF

# Setup Redis
echo "📊 Setting up Redis..."
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Setup application directory
echo "📁 Setting up application directory..."
sudo mkdir -p /var/www/watchparty
sudo chown -R ubuntu:ubuntu /var/www/watchparty

# Create application directories
mkdir -p /var/www/watchparty/backend
mkdir -p /var/www/watchparty/logs
mkdir -p /var/www/watchparty/static
mkdir -p /var/www/watchparty/media

# Setup firewall
echo "🔒 Setting up firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Setup fail2ban
echo "🛡️ Setting up fail2ban..."
sudo systemctl start fail2ban
sudo systemctl enable fail2ban

# Create nginx configuration
echo "🌐 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/watchparty << 'EOF'
server {
    listen 80;
    server_name 13.37.8.163;
    
    client_max_body_size 100M;
    
    # Serve static files
    location /static/ {
        alias /var/www/watchparty/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Serve media files
    location /media/ {
        alias /var/www/watchparty/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # WebSocket for chat/real-time features
    location /ws/ {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }
    
    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Serve frontend (if needed)
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# Create supervisor configuration for Django
echo "👥 Setting up Supervisor for Django..."
sudo tee /etc/supervisor/conf.d/watchparty-django.conf << 'EOF'
[program:watchparty-django]
command=/var/www/watchparty/backend/venv/bin/gunicorn --workers 3 --bind 127.0.0.1:8000 watchparty.wsgi:application
directory=/var/www/watchparty/backend
user=ubuntu
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/www/watchparty/logs/django.log
environment=PATH="/var/www/watchparty/backend/venv/bin"
EOF

# Create supervisor configuration for WebSocket (if using channels)
sudo tee /etc/supervisor/conf.d/watchparty-websocket.conf << 'EOF'
[program:watchparty-websocket]
command=/var/www/watchparty/backend/venv/bin/daphne -b 127.0.0.1 -p 8001 watchparty.asgi:application
directory=/var/www/watchparty/backend
user=ubuntu
autostart=true
autorestart=true
redirect_stderr=true
stdout_logfile=/var/www/watchparty/logs/websocket.log
environment=PATH="/var/www/watchparty/backend/venv/bin"
EOF

# Create environment file template
echo "⚙️ Creating environment template..."
tee /var/www/watchparty/backend/.env.production << 'EOF'
# Django Settings
DEBUG=False
SECRET_KEY=your-super-secret-key-here-change-this
ALLOWED_HOSTS=13.37.8.163,localhost,127.0.0.1

# Database
DATABASE_URL=postgresql://watchparty_user:secure_password_2024!@localhost:5432/watchparty_prod

# Redis
REDIS_URL=redis://localhost:6379/0

# Static/Media Files
STATIC_ROOT=/var/www/watchparty/static
MEDIA_ROOT=/var/www/watchparty/media

# Email (configure as needed)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Security
SECURE_SSL_REDIRECT=False
SECURE_BROWSER_XSS_FILTER=True
SECURE_CONTENT_TYPE_NOSNIFF=True
X_FRAME_OPTIONS=DENY
EOF

echo "✅ Server setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Add your SSH public key to ~/.ssh/authorized_keys"
echo "2. Update the .env.production file with your actual configuration"
echo "3. Deploy your Django application to /var/www/watchparty/backend"
echo "4. Run migrations and collect static files"
echo "5. Start supervisor services"
echo ""
echo "SSH Public Key to add:"
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDBXab+pmZnoIp+pFlsobLZfdBmvQkp2nVBPQMweQuMvjLTrgALBypMFazm2HHLKmGY1X4TUXrMcl9RXMhH2/LDA4jtBBR7p1zKJbjKh1TfHChi+MBi1iS7pfyLG7WrneSbP4PhIzR+q+XXh6zLOn23owhOPanIarKieUEAs9bZ1Ma4gKtZHTYVOSxMltKudm/Y6vOaf72U4o4YYFx1zX77h2TyiN4aBWhWiqJdfmbkawNKQsGMQk92rimnBO+Exc4mL2GDSesJNVkV41lwAvdm1JQy5FoEC2gxKuhClP8CGY8vrYwKNj6K162yBxEjJCXXN25LHQRyVemhCgGn/0gzt1b1ffGRvmlCx07wZ9ku6FNJeKNgc06phx+wKj+fTDg8Rod76llhlmgoJiuzv3/c80tDCW9O+zEeUi0FB8cxpzudmu8yb0XBDXY25VFYJjHCnE8rmFg5T0jv7fNOUCoRVGIY8aSp+dWFVmTmpdUeGCJFRipPHcZSBIU7zh+3tGJBaaBbOHOn7QlM1vdrRRa0xFDSCscWUedYNG0C0mkStZDu0iCYBmYxFO2Uqjc3+GtzwaDRFHPVoNMFHLNv4FJYsbb6FCE8fdsAnu5Z8zytxmPrjdGCShyXTTkeStZnHPmbOOT23oMiUxXroGl8xeBVXCn0yEyncsMQ8Ia/u6gzZw== deployment@watch-party"

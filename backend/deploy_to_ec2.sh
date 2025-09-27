#!/bin/bash

# =============================================================================
# Watch Party Backend - EC2 Deployment Script
# =============================================================================
# This script deploys the Watch Party backend to your EC2 instance
# EC2 Instance: 35.181.208.71 (ubuntu user)
# 
# Usage:
#   ./deploy_to_ec2.sh [--key-path /path/to/key.pem] [--skip-deps] [--restart-only]
#
# Options:
#   --key-path    Path to SSH private key (default: ~/.ssh/id_rsa)
#   --skip-deps   Skip dependency installation
#   --restart-only Only restart services (no file copy)
#   --help        Show this help message
# =============================================================================

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Default configuration
PRODUCTION_HOST="35.181.208.71"
PRODUCTION_USER="ubuntu"
PRODUCTION_KEY_PATH="/workspaces/watch-party-backend/.ssh/id_rsa"
REMOTE_DIR="/opt/watch-party-backend"
BACKEND_DOMAIN="be-watch-party.brahim-elhouss.me"
FRONTEND_DOMAIN="watch-party.brahim-elhouss.me"
SKIP_DEPS=false
RESTART_ONLY=false
SETUP_NGINX=true
SETUP_SSL=false

# Infrastructure endpoints
DB_HOST="all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com"
REDIS_PRIMARY_HOST="master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com"
REDIS_REPLICA_HOST="replica.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com"

# Helper functions
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[DEPLOY]${NC} $1"
}

# Show usage information
show_help() {
    echo "Watch Party Backend - EC2 Deployment Script"
    echo
    echo "Usage: $0 [OPTIONS]"
    echo
    echo "Options:"
    echo "  --key-path PATH    Path to SSH private key (default: /workspaces/watch-party-backend/.ssh/id_rsa)"
    echo "  --skip-deps        Skip dependency installation"
    echo "  --restart-only     Only restart services (no file copy)"
    echo "  --skip-nginx       Skip Nginx configuration"
    echo "  --setup-ssl        Setup SSL/HTTPS configuration"
    echo "  --help             Show this help message"
    echo
    echo "Infrastructure:"
    echo "  EC2 Host:         $PRODUCTION_HOST"
    echo "  Database:         $DB_HOST"
    echo "  Redis Primary:    $REDIS_PRIMARY_HOST"
    echo "  Redis Replica:    $REDIS_REPLICA_HOST"
    echo
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --key-path)
            PRODUCTION_KEY_PATH="$2"
            shift 2
            ;;
        --skip-deps)
            SKIP_DEPS=true
            shift
            ;;
        --restart-only)
            RESTART_ONLY=true
            shift
            ;;
        --skip-nginx)
            SETUP_NGINX=false
            shift
            ;;
        --setup-ssl)
            SETUP_SSL=true
            shift
            ;;
        --help)
            show_help
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
done

# Pre-deployment checks
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if SSH key exists
    if [ ! -f "$PRODUCTION_KEY_PATH" ]; then
        print_error "SSH key not found at: $PRODUCTION_KEY_PATH"
        print_error "Use --key-path to specify the correct path to your SSH key"
        exit 1
    fi
    
    # Check if .env.production exists
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found"
        print_error "Please create .env.production with your production configuration"
        exit 1
    fi
    
    # Test SSH connection
    print_status "Testing SSH connection to $PRODUCTION_HOST..."
    if ! ssh -i "$PRODUCTION_KEY_PATH" -o ConnectTimeout=10 -o BatchMode=yes "$PRODUCTION_USER@$PRODUCTION_HOST" "echo 'Connection successful'" &>/dev/null; then
        print_error "Cannot connect to $PRODUCTION_HOST"
        print_error "Please check your SSH key and network connection"
        exit 1
    fi
    
    print_status "✅ Prerequisites check passed"
}

# Deploy files to EC2
deploy_files() {
    if [ "$RESTART_ONLY" = true ]; then
        print_status "Skipping file deployment (restart-only mode)"
        return
    fi
    
    print_header "Deploying Files to EC2"
    
    # Create deployment directory on remote server
    print_status "Setting up deployment directory..."
    ssh -i "$PRODUCTION_KEY_PATH" "$PRODUCTION_USER@$PRODUCTION_HOST" << EOF
        sudo mkdir -p $REMOTE_DIR
        sudo chown $PRODUCTION_USER:$PRODUCTION_USER $REMOTE_DIR
        mkdir -p $REMOTE_DIR/{logs,static,media}
        mkdir -p /var/log/watchparty
        sudo chown $PRODUCTION_USER:$PRODUCTION_USER /var/log/watchparty
EOF
    
    # Copy project files to remote server
    print_status "Syncing project files..."
    rsync -avz --delete -e "ssh -i $PRODUCTION_KEY_PATH" \
        --exclude '.git' \
        --exclude '__pycache__' \
        --exclude '*.pyc' \
        --exclude 'venv' \
        --exclude 'node_modules' \
        --exclude '.env' \
        --exclude '.env.development' \
        --exclude 'staticfiles' \
        --exclude 'mediafiles' \
        --exclude 'celerybeat-schedule' \
        ./ "$PRODUCTION_USER@$PRODUCTION_HOST:$REMOTE_DIR/"
    
    # Copy production environment file
    print_status "Copying production environment..."
    scp -i "$PRODUCTION_KEY_PATH" .env.production "$PRODUCTION_USER@$PRODUCTION_HOST:$REMOTE_DIR/.env"
    
    print_status "✅ File deployment completed"
}

# Install dependencies and setup environment
setup_environment() {
    if [ "$SKIP_DEPS" = true ] || [ "$RESTART_ONLY" = true ]; then
        print_status "Skipping dependency installation"
        return
    fi
    
    print_header "Setting Up Environment"
    
    ssh -i "$PRODUCTION_KEY_PATH" "$PRODUCTION_USER@$PRODUCTION_HOST" << 'EOF'
        cd /opt/watch-party-backend
        
        # Update system packages
        sudo apt update
        
        # Install system dependencies
        sudo apt install -y \
            python3 python3-pip python3-venv python3-dev \
            build-essential libpq-dev \
            nginx redis-tools postgresql-client \
            curl software-properties-common
        
        # Install Node.js and PM2
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        if ! command -v pm2 &> /dev/null; then
            sudo npm install -g pm2
        fi
        
        # Create and activate virtual environment
        if [ ! -d "venv" ]; then
            python3 -m venv venv
        fi
        
        source venv/bin/activate
        
        # Upgrade pip
        pip install --upgrade pip
        
        # Install Python dependencies
        pip install -r requirements/production.txt
        
        echo "✅ Environment setup completed"
EOF
    
    print_status "✅ Environment setup completed"
}

# Run Django management commands
setup_django() {
    print_header "Setting Up Django Application"
    
    ssh -i "$PRODUCTION_KEY_PATH" "$PRODUCTION_USER@$PRODUCTION_HOST" << 'EOF'
        cd /opt/watch-party-backend
        source venv/bin/activate
        
        # Run database migrations
        echo "Running database migrations..."
        python manage.py migrate --noinput
        
        # Collect static files
        echo "Collecting static files..."
        python manage.py collectstatic --noinput
        
        # Create superuser if it doesn't exist (optional)
        python manage.py shell << PYTHON
try:
    from apps.authentication.models import User
    if not User.objects.filter(is_superuser=True).exists():
        print("No superuser found. You may want to create one manually.")
    else:
        print("Superuser already exists.")
except Exception as e:
    print(f"Could not check superuser: {e}")
PYTHON
        
        echo "✅ Django setup completed"
EOF
    
    print_status "✅ Django setup completed"
}

# Configure and start services
setup_services() {
    print_header "Configuring Services"
    
    ssh -i "$PRODUCTION_KEY_PATH" "$PRODUCTION_USER@$PRODUCTION_HOST" << 'EOF'
        cd /opt/watch-party-backend
        
        # Create startup script
        cat > start-django.sh << 'STARTEOF'
#!/bin/bash
cd /opt/watch-party-backend
source venv/bin/activate
export $(grep -v "^#" .env | xargs)
exec /opt/watch-party-backend/venv/bin/gunicorn --workers 2 --worker-class gevent --worker-connections 500 --bind 127.0.0.1:8000 --timeout 120 --keep-alive 5 --access-logfile /var/log/watchparty/gunicorn_access.log --error-logfile /var/log/watchparty/gunicorn_error.log config.wsgi:application
STARTEOF
        
        chmod +x start-django.sh
        
        # Create PM2 ecosystem file
        cat > ecosystem.config.js << 'ECOEOF'
module.exports = {
  apps: [
    {
      name: "watchparty-django",
      script: "/opt/watch-party-backend/start-django.sh",
      cwd: "/opt/watch-party-backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_file: "/var/log/watchparty/pm2_django.log",
      out_file: "/var/log/watchparty/pm2_django_out.log",
      error_file: "/var/log/watchparty/pm2_django_error.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
};
ECOEOF
        
        # Stop existing PM2 processes
        pm2 delete all || true
        
        # Start PM2 ecosystem
        pm2 start ecosystem.config.js
        
        # Save PM2 configuration
        pm2 save
        
        # Setup PM2 startup script
        sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
        
        echo "✅ PM2 services configured and started"
EOF
    
    print_status "✅ Services configured and started"
}

# Configure Nginx
setup_nginx() {
    if [ "$SETUP_NGINX" = false ]; then
        print_status "Skipping Nginx configuration"
        return
    fi
    
    print_header "Setting Up Nginx"
    
    if [ "$SETUP_SSL" = true ]; then
        setup_nginx_https
    else
        setup_nginx_http
    fi
}

# Setup HTTP-only Nginx configuration
setup_nginx_http() {
    print_status "Setting up Nginx HTTP configuration..."
    
    ssh -i "$PRODUCTION_KEY_PATH" "$PRODUCTION_USER@$PRODUCTION_HOST" << EOF
        # Create Nginx configuration for HTTP
        sudo tee /etc/nginx/sites-available/watchparty-backend > /dev/null << 'NGINXEOF'
# Watch Party Backend - Nginx Configuration (HTTP)
upstream django_backend {
    server 127.0.0.1:8000 max_fails=3 fail_timeout=30s;
    keepalive 32;
}

upstream websocket_backend {
    server 127.0.0.1:8002 max_fails=3 fail_timeout=30s;
}

# Rate limiting zones
limit_req_zone \\\$binary_remote_addr zone=api:10m rate=30r/m;

# HTTP server - Backend
server {
    listen 80;
    server_name $PRODUCTION_HOST $BACKEND_DOMAIN;
    
    # Optimized buffers and timeouts
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    client_body_timeout 30s;
    client_header_timeout 30s;
    send_timeout 30s;
    
    # Logging
    access_log /var/log/nginx/watchparty_access.log;
    error_log /var/log/nginx/watchparty_error.log warn;
    
    # Basic security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

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
        alias /opt/watch-party-backend/staticfiles/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        gzip_static on;
    }

    # Media files
    location /media/ {
        alias /opt/watch-party-backend/mediafiles/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # WebSocket connections
    location /ws/ {
        proxy_pass http://websocket_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \\\$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        proxy_buffering off;
    }

    # Health check
    location /health/ {
        proxy_pass http://django_backend;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
        access_log off;
    }

    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=10 nodelay;
        
        proxy_pass http://django_backend;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }

    # Admin interface
    location /admin/ {
        proxy_pass http://django_backend;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }

    # All other requests
    location / {
        proxy_pass http://django_backend;
        proxy_set_header Host \\\$host;
        proxy_set_header X-Real-IP \\\$remote_addr;
        proxy_set_header X-Forwarded-For \\\$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \\\$scheme;
    }

    # Security blocks
    location ~ /\\\\.(env|git|htaccess|htpasswd) {
        deny all;
        access_log off;
        log_not_found off;
        return 404;
    }
}
NGINXEOF

        # Enable the site
        sudo ln -sf /etc/nginx/sites-available/watchparty-backend /etc/nginx/sites-enabled/
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Test and reload nginx
        sudo nginx -t && sudo systemctl reload nginx
        
        echo "✅ Nginx HTTP configuration completed"
EOF
    
    print_status "✅ Nginx HTTP configuration completed"
    print_warning "Your backend is available at: http://$PRODUCTION_HOST"
    print_warning "To enable HTTPS, run with --setup-ssl flag"
}

# Setup HTTPS Nginx configuration  
setup_nginx_https() {
    print_status "Setting up Nginx HTTPS configuration..."
    
    ssh -i "$PRODUCTION_KEY_PATH" "$PRODUCTION_USER@$PRODUCTION_HOST" << EOF
        # Install certbot if not present
        if ! command -v certbot &> /dev/null; then
            sudo apt update
            sudo apt install -y certbot python3-certbot-nginx
        fi
        
        # Get SSL certificate
        sudo certbot --nginx -d $BACKEND_DOMAIN --non-interactive --agree-tos --email admin@$BACKEND_DOMAIN || true
        
        echo "✅ Nginx HTTPS configuration completed"
EOF
    
    print_status "✅ Nginx HTTPS configuration completed"
    print_status "Your backend is available at: https://$BACKEND_DOMAIN"
}

# Test the deployment
test_deployment() {
    print_header "Testing Deployment"
    
    # Test service status
    print_status "Checking PM2 services..."
    ssh -i "$PRODUCTION_KEY_PATH" "$PRODUCTION_USER@$PRODUCTION_HOST" << 'EOF'
        cd /opt/watch-party-backend
        pm2 status
        pm2 logs --lines 5
EOF
    
    # Test HTTP endpoint
    print_status "Testing HTTP endpoint..."
    if curl -f "http://$PRODUCTION_HOST:8000/health/" &>/dev/null; then
        print_status "✅ Backend health check passed"
    else
        print_warning "⚠️  Backend health check failed (this may be normal if nginx is not configured)"
    fi
    
    print_status "✅ Deployment testing completed"
}

# Main deployment function
main() {
    print_header "Starting Deployment to EC2"
    echo "Target: $PRODUCTION_USER@$PRODUCTION_HOST"
    echo "Key: $PRODUCTION_KEY_PATH"
    echo "Remote Directory: $REMOTE_DIR"
    echo
    
    # Confirm deployment
    read -p "Continue with deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled"
        exit 0
    fi
    
    # Run deployment steps
    check_prerequisites
    deploy_files
    setup_environment
    setup_django
    setup_nginx
    setup_services
    test_deployment
    
    print_header "Deployment Completed Successfully! 🎉"
    echo
    print_status "Your Watch Party backend is now running on:"
    print_status "  • Server: http://$PRODUCTION_HOST:8000"
    print_status "  • WebSocket: ws://$PRODUCTION_HOST:8002"
    echo
    print_warning "Next steps:"
    print_warning "  1. Configure SSL certificates"
    print_warning "  2. Setup domain DNS records"
    print_warning "  3. Configure Nginx reverse proxy"
    print_warning "  4. Set up monitoring and backups"
    echo
    print_status "To check service status: pm2 status"
    print_status "To view logs: pm2 logs"
    print_status "To restart services: pm2 restart all"
}

# Run main function
main "$@"
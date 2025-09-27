#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - SERVER SETUP SCRIPT
# =============================================================================
# Handles production server setup and configuration
# Author: Watch Party Team
# Version: 1.0
# Last Updated: August 11, 2025

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors and emojis
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'
readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly GEAR="⚙️"

# Logging functions
log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

# Server configuration
PYTHON_VERSION="3.11"
NODE_VERSION="18"
POSTGRES_VERSION="15"
REDIS_VERSION="7"

# =============================================================================
# SYSTEM UPDATES & DEPENDENCIES
# =============================================================================

update_system() {
    log_info "Updating system packages..."
    
    # Update package lists
    sudo apt-get update -y
    
    # Upgrade existing packages
    sudo apt-get upgrade -y
    
    # Install essential packages
    sudo apt-get install -y \
        curl \
        wget \
        git \
        vim \
        htop \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        build-essential \
        pkg-config \
        libssl-dev \
        libffi-dev \
        libjpeg-dev \
        libpng-dev \
        libpq-dev \
        nginx \
        supervisor \
        fail2ban \
        ufw
    
    log_success "System packages updated"
}

# =============================================================================
# PYTHON SETUP
# =============================================================================

setup_python() {
    log_info "Setting up Python ${PYTHON_VERSION}..."
    
    # Add deadsnakes PPA for Python versions
    sudo add-apt-repository ppa:deadsnakes/ppa -y
    sudo apt-get update -y
    
    # Install Python and related packages
    sudo apt-get install -y \
        python${PYTHON_VERSION} \
        python${PYTHON_VERSION}-dev \
        python${PYTHON_VERSION}-venv \
        python${PYTHON_VERSION}-distutils \
        python3-pip
    
    # Set up alternatives
    sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python${PYTHON_VERSION} 1
    sudo update-alternatives --install /usr/bin/python python /usr/bin/python${PYTHON_VERSION} 1
    
    # Upgrade pip
    python3 -m pip install --upgrade pip setuptools wheel
    
    log_success "Python ${PYTHON_VERSION} installed and configured"
}

# =============================================================================
# DATABASE SETUP
# =============================================================================

setup_postgresql() {
    log_info "Setting up PostgreSQL ${POSTGRES_VERSION}..."
    
    # Install PostgreSQL
    sudo apt-get install -y postgresql-${POSTGRES_VERSION} postgresql-contrib-${POSTGRES_VERSION}
    
    # Start and enable PostgreSQL
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres createdb watchparty 2>/dev/null || log_warning "Database 'watchparty' already exists"
    sudo -u postgres createuser --createdb watchparty_user 2>/dev/null || log_warning "User 'watchparty_user' already exists"
    
    # Set password for database user
    sudo -u postgres psql -c "ALTER USER watchparty_user PASSWORD 'watchparty_secure_password';"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE watchparty TO watchparty_user;"
    
    log_success "PostgreSQL ${POSTGRES_VERSION} configured"
}

setup_redis() {
    log_info "Setting up Redis ${REDIS_VERSION}..."
    
    # Install Redis
    sudo apt-get install -y redis-server
    
    # Configure Redis
    sudo sed -i 's/^# maxmemory <bytes>/maxmemory 256mb/' /etc/redis/redis.conf
    sudo sed -i 's/^# maxmemory-policy noeviction/maxmemory-policy allkeys-lru/' /etc/redis/redis.conf
    
    # Start and enable Redis
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    log_success "Redis ${REDIS_VERSION} configured"
}

# =============================================================================
# WEB SERVER SETUP
# =============================================================================

setup_nginx() {
    log_info "Configuring Nginx..."
    
    # Remove default site
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Create watchparty site configuration
    sudo tee /etc/nginx/sites-available/watchparty > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;

    client_max_body_size 100M;

    location /static/ {
        alias /var/www/watchparty/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location /media/ {
        alias /var/www/watchparty/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF
    
    # Enable site
    sudo ln -sf /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/
    
    # Test configuration
    sudo nginx -t
    
    # Start and enable Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    log_success "Nginx configured"
}

# =============================================================================
# APPLICATION DEPLOYMENT
# =============================================================================

setup_application_directory() {
    log_info "Setting up application directory..."
    
    # Create application directories
    sudo mkdir -p /var/www/watchparty
    sudo mkdir -p /var/log/watchparty
    sudo mkdir -p /var/run/watchparty
    
    # Set permissions
    sudo chown -R $USER:www-data /var/www/watchparty
    sudo chown -R $USER:www-data /var/log/watchparty
    sudo chown -R $USER:www-data /var/run/watchparty
    
    sudo chmod -R 755 /var/www/watchparty
    sudo chmod -R 755 /var/log/watchparty
    sudo chmod -R 755 /var/run/watchparty
    
    log_success "Application directories created"
}

setup_systemd_services() {
    log_info "Setting up systemd services..."
    
    # Create Gunicorn service
    sudo tee /etc/systemd/system/watchparty-gunicorn.service > /dev/null << EOF
[Unit]
Description=Watch Party Gunicorn daemon
After=network.target postgresql.service redis.service

[Service]
Type=notify
User=$USER
Group=www-data
RuntimeDirectory=watchparty
WorkingDirectory=/var/www/watchparty
Environment=PATH=/var/www/watchparty/venv/bin
ExecStart=/var/www/watchparty/venv/bin/gunicorn --bind 127.0.0.1:8000 --workers 3 --worker-class gevent watchparty.wsgi:application
ExecReload=/bin/kill -s HUP \$MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Create Celery worker service
    sudo tee /etc/systemd/system/watchparty-celery.service > /dev/null << EOF
[Unit]
Description=Watch Party Celery Worker
After=network.target postgresql.service redis.service

[Service]
Type=forking
User=$USER
Group=www-data
WorkingDirectory=/var/www/watchparty
Environment=PATH=/var/www/watchparty/venv/bin
ExecStart=/var/www/watchparty/venv/bin/celery -A watchparty worker --loglevel=info --detach --pidfile=/var/run/watchparty/celery.pid
ExecStop=/bin/kill -s TERM \$MAINPID
Restart=on-failure
RestartSec=5
PIDFile=/var/run/watchparty/celery.pid
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Create Celery beat service
    sudo tee /etc/systemd/system/watchparty-celery-beat.service > /dev/null << EOF
[Unit]
Description=Watch Party Celery Beat
After=network.target postgresql.service redis.service

[Service]
Type=forking
User=$USER
Group=www-data
WorkingDirectory=/var/www/watchparty
Environment=PATH=/var/www/watchparty/venv/bin
ExecStart=/var/www/watchparty/venv/bin/celery -A watchparty beat --loglevel=info --detach --pidfile=/var/run/watchparty/celery-beat.pid
ExecStop=/bin/kill -s TERM \$MAINPID
Restart=on-failure
RestartSec=5
PIDFile=/var/run/watchparty/celery-beat.pid
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd
    sudo systemctl daemon-reload
    
    log_success "Systemd services configured"
}

# =============================================================================
# SECURITY SETUP
# =============================================================================

setup_firewall() {
    log_info "Setting up firewall..."
    
    # Reset UFW
    sudo ufw --force reset
    
    # Default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow essential services
    sudo ufw allow ssh
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Enable firewall
    sudo ufw --force enable
    
    log_success "Firewall configured"
}

setup_fail2ban() {
    log_info "Setting up Fail2Ban..."
    
    # Create custom configuration
    sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
bantime = 86400

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10

[nginx-botsearch]
enabled = true
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF
    
    # Start and enable Fail2Ban
    sudo systemctl start fail2ban
    sudo systemctl enable fail2ban
    
    log_success "Fail2Ban configured"
}

# =============================================================================
# SSL SETUP
# =============================================================================

setup_ssl_ready() {
    log_info "Preparing for SSL setup..."
    
    # Install Certbot
    sudo apt-get install -y certbot python3-certbot-nginx
    
    log_success "SSL tools installed (run ssl-setup.sh separately to configure certificates)"
}

# =============================================================================
# MONITORING SETUP
# =============================================================================

setup_monitoring() {
    log_info "Setting up basic monitoring..."
    
    # Create log rotation configuration
    sudo tee /etc/logrotate.d/watchparty > /dev/null << 'EOF'
/var/log/watchparty/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    postrotate
        systemctl reload watchparty-gunicorn
    endscript
}
EOF
    
    # Create status check script
    sudo tee /usr/local/bin/watchparty-status > /dev/null << 'EOF'
#!/bin/bash
echo "=== Watch Party Server Status ==="
echo "Date: $(date)"
echo
echo "=== System Load ==="
uptime
echo
echo "=== Memory Usage ==="
free -h
echo
echo "=== Disk Usage ==="
df -h /
echo
echo "=== Service Status ==="
systemctl is-active --quiet postgresql && echo "PostgreSQL: ✅ Running" || echo "PostgreSQL: ❌ Stopped"
systemctl is-active --quiet redis && echo "Redis: ✅ Running" || echo "Redis: ❌ Stopped"
systemctl is-active --quiet nginx && echo "Nginx: ✅ Running" || echo "Nginx: ❌ Stopped"
systemctl is-active --quiet watchparty-gunicorn && echo "Gunicorn: ✅ Running" || echo "Gunicorn: ❌ Stopped"
systemctl is-active --quiet watchparty-celery && echo "Celery: ✅ Running" || echo "Celery: ❌ Stopped"
systemctl is-active --quiet watchparty-celery-beat && echo "Celery Beat: ✅ Running" || echo "Celery Beat: ❌ Stopped"
EOF
    
    sudo chmod +x /usr/local/bin/watchparty-status
    
    log_success "Monitoring tools configured"
}

# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

setup_server() {
    log_info "Starting server setup..."
    
    update_system
    setup_python
    setup_postgresql
    setup_redis
    setup_nginx
    setup_application_directory
    setup_systemd_services
    setup_firewall
    setup_fail2ban
    setup_ssl_ready
    setup_monitoring
    
    log_success "Server setup completed!"
    log_info "Next steps:"
    echo "  1. Deploy your application to /var/www/watchparty"
    echo "  2. Run './manage.sh ssl-setup' to configure SSL certificates"
    echo "  3. Update your domain configuration in Nginx"
    echo "  4. Start the services with: sudo systemctl start watchparty-gunicorn watchparty-celery watchparty-celery-beat"
}

update_server() {
    log_info "Updating server configuration..."
    
    # Update system packages
    sudo apt-get update -y && sudo apt-get upgrade -y
    
    # Restart services
    sudo systemctl restart nginx
    sudo systemctl restart postgresql
    sudo systemctl restart redis
    
    # Check if application services exist before restarting
    if systemctl list-unit-files | grep -q watchparty-gunicorn; then
        sudo systemctl restart watchparty-gunicorn
    fi
    
    if systemctl list-unit-files | grep -q watchparty-celery; then
        sudo systemctl restart watchparty-celery
    fi
    
    if systemctl list-unit-files | grep -q watchparty-celery-beat; then
        sudo systemctl restart watchparty-celery-beat
    fi
    
    log_success "Server updated"
}

show_status() {
    /usr/local/bin/watchparty-status 2>/dev/null || {
        log_warning "Status script not found. Run 'setup' first."
        exit 1
    }
}

show_help() {
    echo "Watch Party Server Setup Script"
    echo
    echo "USAGE:"
    echo "  $0 [COMMAND]"
    echo
    echo "COMMANDS:"
    echo "  setup     Complete server setup"
    echo "  update    Update server configuration"
    echo "  status    Show server status"
    echo "  help      Show this help message"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    local command="${1:-help}"
    
    case "$command" in
        setup)
            setup_server
            ;;
        update)
            update_server
            ;;
        status)
            show_status
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Only run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

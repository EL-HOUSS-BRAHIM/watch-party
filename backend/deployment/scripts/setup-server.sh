#!/bin/bash
set -euo pipefail

# Watch Party Backend - Initial Server Setup Script
# This script sets up a fresh Ubuntu server for the Watch Party Backend

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configuration
PROJECT_DIR="/opt/watch-party-backend"
LOG_DIR="/var/log/watchparty"
DEPLOY_USER="ubuntu"

log_info "Starting Watch Party Backend server setup..."

# Update system
log_info "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
log_info "Installing required packages..."
sudo apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    nginx \
    git \
    curl \
    htop \
    redis-tools \
    postgresql-client \
    awscli \
    nodejs \
    npm \
    unzip \
    certbot \
    python3-certbot-nginx

# Install PM2 globally
log_info "Installing PM2..."
sudo npm install -g pm2@latest

# Create project directory
log_info "Creating project directory..."
sudo mkdir -p $PROJECT_DIR
sudo chown -R $DEPLOY_USER:$DEPLOY_USER $PROJECT_DIR

# Create log directory
log_info "Creating log directory..."
sudo mkdir -p $LOG_DIR
sudo chown -R $DEPLOY_USER:$DEPLOY_USER $LOG_DIR

# Configure swap (for t2.micro instances)
log_info "Configuring swap space..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

# Configure swappiness
log_info "Optimizing swap settings..."
echo 'vm.swappiness=10' | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Configure timezone
log_info "Setting timezone to UTC..."
sudo timedatectl set-timezone UTC

# Setup firewall (basic)
log_info "Configuring firewall..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Optimize limits for PM2
log_info "Optimizing system limits..."
echo "$DEPLOY_USER soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "$DEPLOY_USER hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Clone repository (if not exists)
if [ ! -d "$PROJECT_DIR/.git" ]; then
    log_info "Cloning repository..."
    cd /opt
    sudo -u $DEPLOY_USER git clone https://github.com/EL-HOUSS-BRAHIM/watch-party-backend.git
    cd $PROJECT_DIR
    sudo -u $DEPLOY_USER git checkout master
fi

# Setup Python virtual environment
log_info "Creating Python virtual environment..."
cd $PROJECT_DIR
sudo -u $DEPLOY_USER python3 -m venv venv
sudo -u $DEPLOY_USER ./venv/bin/pip install --upgrade pip

# Install Python dependencies
log_info "Installing Python dependencies..."
sudo -u $DEPLOY_USER ./venv/bin/pip install -r requirements.txt

# Install additional optimized packages
sudo -u $DEPLOY_USER ./venv/bin/pip install \
    'requests==2.31.0' \
    'psycopg2-binary' \
    'drf-spectacular[sidecar]'

# Setup PM2 startup
log_info "Setting up PM2 startup..."
sudo -u $DEPLOY_USER pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $DEPLOY_USER --hp /home/$DEPLOY_USER

# Create systemd service for PM2 (backup)
log_info "Creating PM2 systemd service..."
sudo tee /etc/systemd/system/pm2-$DEPLOY_USER.service > /dev/null << EOF
[Unit]
Description=PM2 process manager
Documentation=https://pm2.keymetrics.io/
After=network.target

[Service]
Type=forking
User=$DEPLOY_USER
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
Environment=PATH=/home/$DEPLOY_USER/.nvm/versions/node/v20.17.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin
Environment=PM2_HOME=/home/$DEPLOY_USER/.pm2
PIDFile=/home/$DEPLOY_USER/.pm2/pm2.pid
Restart=on-failure

ExecStart=/usr/bin/pm2 resurrect
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable pm2-$DEPLOY_USER

# Set proper permissions
log_info "Setting file permissions..."
cd $PROJECT_DIR
sudo chown -R $DEPLOY_USER:$DEPLOY_USER .
sudo chmod +x *.sh
sudo chmod +x deployment/scripts/*.sh

log_success "Server setup completed successfully!"
log_info "Next steps:"
log_info "1. Copy your .env file to $PROJECT_DIR/.env"
log_info "2. Run: ./deployment/scripts/nginx-setup.sh"
log_info "3. Run: ./deployment/scripts/ssl-setup.sh"
log_info "4. Run: ./deployment/scripts/deploy-app.sh"
#!/bin/bash
set -e

# Watch Party Server Bootstrap Script
# This script sets up a fresh Ubuntu server for Docker-based deployment

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
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

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

print_header "Watch Party Server Bootstrap"

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install core packages
print_status "Installing core packages..."
apt install -y \
  nginx \
  certbot python3-certbot-nginx \
  git \
  curl \
  wget \
  ufw \
  fail2ban \
  docker.io \
  docker-compose \
  unzip \
  build-essential \
  htop \
  tree \
  nano \
  postgresql-client \
  redis-tools

# Setup firewall
print_status "Configuring firewall..."
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Enable services
print_status "Enabling services..."
systemctl enable docker
systemctl start docker
systemctl enable nginx
systemctl start nginx

# Setup deploy user
print_status "Creating deploy user..."
if ! id "deploy" &>/dev/null; then
    adduser --disabled-password --gecos "" deploy
    usermod -aG docker deploy
    usermod -aG sudo deploy
fi

# Create application directory
print_status "Setting up application directory..."
mkdir -p /srv
chown deploy:deploy /srv

# Setup SSH for deploy user
print_status "Setting up SSH for deploy user..."
mkdir -p /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys

# Add the SSH public key for GitHub Actions deployment
echo "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDrezlsRoiBQxCydGqh9hfkmRcQ6QEV3zLblo/2Sc3UKyDv1fzqHpuW1SIzDCg7/Cf93LGIv4jLhlwFqLxUGqSchIrXUsZ3iAf8eZsmVIJ5EfvqS8lJmwtBLwk1eilW6Xn6yvwQ9u9GINNft6kDifeL9WA/IFi3PQjwz21HjtyJl6N7atSezppcFeiurS0ntnjXgvs85osaERVIzsSossH25gV3tRvyJ9XFKQ6j4LgvsYqx1s8oNj4OZCvojruHbDpgdcYiP+JQRRZVLI2VFzNpR0gU3Itj0HxTIC2AVqXoZoS2kOz08U4qypY6nIdYvD1s7z4D0egv7vJ87+2fSYO5LHfylycrI0YI83sK34F1xNuFzQU9yKpYC0viDjAK2VboKThcNVSjDHPMm4psE7pfA2gWct7Z4hbsy/IXMswXn/7zNuBYOjGfgt35rsO0i51ph18blNdVuW7SXgFTWLLX95VaTf8UQMVaG1lB6yo5X2gky1mBQkZn3Up/FcZrB4eoSDg1yIwZkGcCydN/qQnuSWjPiWcJlC7K2ZPQP+uxaiVaO4XBDZpQ15djoyjx7hrNEsKStFwLtxI7OS0IIm9A2Via4J2oLSvXjmkTC/g4hdW/g+O5goh/KcPA/UovRu+70VNhyuIzPRiIzd4m025JsJuHqDolFDequ/F/k+47/w== brahim-crafts.tech@gmail.com" >> /home/deploy/.ssh/authorized_keys

chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

# Install Docker Compose v2
print_status "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose

# Configure fail2ban
print_status "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 1h
findtime = 10m
maxretry = 5

[sshd]
enabled = true
port = 22
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl start fail2ban

# Configure nginx base
print_status "Configuring Nginx..."
cat > /etc/nginx/nginx.conf << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;

events {
    worker_connections 4096;
    use epoll;
    multi_accept on;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;

    # Basic optimizations
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    server_tokens off;

    # Buffer settings
    client_body_buffer_size 128k;
    client_max_body_size 100m;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;

    # Timeouts
    client_body_timeout 12;
    client_header_timeout 12;
    send_timeout 10;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/s;

    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF

# Remove default site
rm -f /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart services
print_status "Restarting services..."
systemctl restart nginx
systemctl restart fail2ban

# Create log directories
print_status "Creating log directories..."
mkdir -p /var/log/watchparty
chown deploy:deploy /var/log/watchparty

# Setup automatic security updates
print_status "Configuring automatic security updates..."
apt install -y unattended-upgrades
cat > /etc/apt/apt.conf.d/20auto-upgrades << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF

# Show system info
print_status "System Information:"
echo "OS: $(lsb_release -d | cut -f2)"
echo "Kernel: $(uname -r)"
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Nginx: $(nginx -v 2>&1)"

print_header "Bootstrap Complete!"
print_status "✅ Server setup completed successfully"
print_status ""
print_status "Next steps:"
print_status "1. SSH key has been automatically added for deploy user"
print_status "2. Configure GitHub secrets:"
print_status "   - LIGHTSAIL_HOST: $(curl -s ifconfig.me || hostname -I | cut -d' ' -f1)"
print_status "   - LIGHTSAIL_SSH_KEY: Your private key content"
print_status "3. Push to master branch to trigger deployment"
print_status ""
print_status "Test SSH access: ssh deploy@$(curl -s ifconfig.me || hostname -I | cut -d' ' -f1)"
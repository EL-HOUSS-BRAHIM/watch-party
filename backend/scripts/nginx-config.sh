#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - NGINX CONFIGURATION SCRIPT
# =============================================================================
# Configure Nginx for the Watch Party Backend

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Change to project root
cd "$PROJECT_ROOT"

# Check if running as root or with sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root or with sudo"
        log_info "Run: sudo $0 $*"
        exit 1
    fi
}

# Install Nginx if not present
install_nginx() {
    if ! command -v nginx &> /dev/null; then
        log_info "Installing Nginx..."
        
        if command -v apt-get &> /dev/null; then
            apt-get update
            apt-get install -y nginx
        elif command -v yum &> /dev/null; then
            yum install -y nginx
        elif command -v dnf &> /dev/null; then
            dnf install -y nginx
        else
            log_error "Unsupported package manager. Please install Nginx manually."
            exit 1
        fi
        
        log_success "Nginx installed"
    else
        log_info "Nginx is already installed"
    fi
}

# Configure Nginx for Watch Party
configure_nginx() {
    local domain="${1:-your-domain.com}"
    local ssl="${2:-false}"
    local staging="${3:-false}"
    
    log_info "Configuring Nginx for domain: $domain"
    
    # Create configuration file
    local config_file="/etc/nginx/sites-available/watch-party-backend"
    local static_path="/var/www/watch-party-backend/static"
    local media_path="/var/www/watch-party-backend/media"
    
    # Create directories
    mkdir -p "/var/www/watch-party-backend"
    mkdir -p "$static_path"
    mkdir -p "$media_path"
    
    # Set ownership
    chown -R www-data:www-data /var/www/watch-party-backend
    
    # Generate Nginx configuration
    cat > "$config_file" << EOF
# Watch Party Backend - Nginx Configuration
# Generated on $(date)

upstream django_app {
    server 127.0.0.1:8000;
}

upstream daphne_app {
    server 127.0.0.1:8001;
}

# Rate limiting zones
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;
limit_req_zone \$binary_remote_addr zone=websocket:10m rate=20r/s;

EOF

    if [[ "$ssl" == "true" ]]; then
        # HTTPS configuration
        cat >> "$config_file" << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $domain www.$domain;
    
    # Allow Let's Encrypt challenges
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    # Redirect all other traffic to HTTPS
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# Main HTTPS server block
server {
    listen 443 ssl http2;
    server_name $domain www.$domain;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;
    
    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: ws:; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none';" always;

EOF
    else
        # HTTP only configuration
        cat >> "$config_file" << EOF
# Main HTTP server block
server {
    listen 80;
    server_name $domain www.$domain;

EOF
    fi

    # Common server configuration
    cat >> "$config_file" << EOF
    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
    
    # Client Settings
    client_max_body_size 50M;
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
    
    # Timeouts
    proxy_connect_timeout 60s;
    proxy_send_timeout 60s;
    proxy_read_timeout 60s;
    
    # Root directory
    root /var/www/watch-party-backend;
    index index.html;
    
    # Security: Hide server information
    server_tokens off;
    
    # Logging
    access_log /var/log/nginx/watchparty_access.log;
    error_log /var/log/nginx/watchparty_error.log;
    
    # Static files with long cache
    location /static/ {
        alias $static_path/;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header X-Content-Type-Options nosniff;
        
        # Optional: Enable serving compressed files
        location ~* \.(css|js)$ {
            gzip_static on;
        }
    }
    
    # Media files with moderate cache
    location /media/ {
        alias $media_path/;
        expires 30d;
        add_header Cache-Control "public";
        add_header X-Content-Type-Options nosniff;
        
        # Security: Prevent execution of uploaded files
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            return 403;
        }
    }
    
    # WebSocket connections for real-time features
    location /ws/ {
        limit_req zone=websocket burst=50 nodelay;
        
        proxy_pass http://daphne_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_redirect off;
        proxy_buffering off;
        
        # WebSocket specific timeouts
        proxy_read_timeout 86400;
        proxy_send_timeout 86400;
    }
    
    # API endpoints with rate limiting
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://django_app;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_redirect off;
    }
    
    # Authentication endpoints with stricter rate limiting
    location ~ ^/(auth|login|register|password|api/auth) {
        limit_req zone=login burst=5 nodelay;
        
        proxy_pass http://django_app;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_redirect off;
    }
    
    # Admin interface
    location /admin/ {
        proxy_pass http://django_app;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_redirect off;
    }
    
    # Health check endpoint (no rate limiting)
    location /health/ {
        access_log off;
        proxy_pass http://django_app;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ \.(sql|log|conf)$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Main application (catch-all)
    location / {
        # Try to serve static files first, then proxy to Django
        try_files \$uri @django;
    }
    
    location @django {
        proxy_pass http://django_app;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_redirect off;
    }
}

# Optional: Separate server block for monitoring/internal endpoints
server {
    listen 127.0.0.1:8080;
    server_name localhost;
    
    access_log off;
    
    # Nginx status (for monitoring)
    location /nginx_status {
        stub_status on;
        allow 127.0.0.1;
        deny all;
    }
    
    # Health check for load balancer
    location /lb_health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    log_success "Nginx configuration created: $config_file"
    
    # Enable the site
    if [[ ! -L "/etc/nginx/sites-enabled/watch-party-backend" ]]; then
        ln -s "$config_file" "/etc/nginx/sites-enabled/watch-party-backend"
        log_success "Site enabled"
    fi
    
    # Test configuration
    if nginx -t; then
        log_success "Nginx configuration test passed"
    else
        log_error "Nginx configuration test failed"
        return 1
    fi
    
    # Reload Nginx
    systemctl reload nginx
    log_success "Nginx reloaded"
    
    # Show next steps
    echo
    log_info "Nginx configuration completed!"
    echo "  📄 Config file: $config_file"
    echo "  📂 Static files: $static_path"
    echo "  📂 Media files: $media_path"
    echo
    
    if [[ "$ssl" == "true" ]]; then
        log_warning "SSL is enabled but certificates may not exist yet"
        echo "  Run: ./manage.sh ssl-setup $domain"
    else
        log_info "HTTP configuration is active"
        echo "  To enable SSL: ./manage.sh ssl-setup $domain"
    fi
}

# Remove Nginx configuration
remove_nginx_config() {
    log_info "Removing Nginx configuration..."
    
    # Disable site
    if [[ -L "/etc/nginx/sites-enabled/watch-party-backend" ]]; then
        rm "/etc/nginx/sites-enabled/watch-party-backend"
        log_success "Site disabled"
    fi
    
    # Remove configuration file
    if [[ -f "/etc/nginx/sites-available/watch-party-backend" ]]; then
        rm "/etc/nginx/sites-available/watch-party-backend"
        log_success "Configuration file removed"
    fi
    
    # Test and reload
    if nginx -t; then
        systemctl reload nginx
        log_success "Nginx reloaded"
    else
        log_error "Nginx configuration test failed after removal"
    fi
}

# Show Nginx status
show_nginx_status() {
    log_info "Nginx Status:"
    echo
    
    # Check if Nginx is running
    if systemctl is-active --quiet nginx; then
        log_success "Nginx is running"
    else
        log_error "Nginx is not running"
    fi
    
    # Check configuration
    if [[ -f "/etc/nginx/sites-available/watch-party-backend" ]]; then
        log_success "Configuration file exists"
    else
        log_warning "Configuration file not found"
    fi
    
    if [[ -L "/etc/nginx/sites-enabled/watch-party-backend" ]]; then
        log_success "Site is enabled"
    else
        log_warning "Site is not enabled"
    fi
    
    # Test configuration
    echo
    log_info "Configuration test:"
    nginx -t
    
    # Show logs
    echo
    log_info "Recent access logs:"
    tail -5 /var/log/nginx/watchparty_access.log 2>/dev/null || echo "No access logs found"
    
    echo
    log_info "Recent error logs:"
    tail -5 /var/log/nginx/watchparty_error.log 2>/dev/null || echo "No error logs found"
}

# Update Nginx configuration
update_nginx_config() {
    local domain="$1"
    local enable_ssl="$2"
    
    if [[ -z "$domain" ]]; then
        log_error "Domain name is required for update"
        exit 1
    fi
    
    log_info "Updating Nginx configuration for $domain"
    
    # Backup existing configuration
    if [[ -f "/etc/nginx/sites-available/watch-party-backend" ]]; then
        cp "/etc/nginx/sites-available/watch-party-backend" \
           "/etc/nginx/sites-available/watch-party-backend.backup.$(date +%Y%m%d_%H%M%S)"
        log_info "Existing configuration backed up"
    fi
    
    # Reconfigure
    configure_nginx "$domain" "$enable_ssl"
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        configure|config|setup)
            check_permissions
            install_nginx
            
            local domain="${1:-your-domain.com}"
            local ssl="${2:-false}"
            
            # Parse additional options
            while [[ $# -gt 0 ]]; do
                case $1 in
                    --ssl|--enable-ssl)
                        ssl="true"
                        shift
                        ;;
                    --domain)
                        domain="$2"
                        shift 2
                        ;;
                    *)
                        shift
                        ;;
                esac
            done
            
            configure_nginx "$domain" "$ssl"
            ;;
        remove|uninstall)
            check_permissions
            remove_nginx_config "$@"
            ;;
        status|info)
            show_nginx_status "$@"
            ;;
        update)
            check_permissions
            update_nginx_config "$@"
            ;;
        reload|restart)
            check_permissions
            log_info "Reloading Nginx..."
            systemctl reload nginx
            log_success "Nginx reloaded"
            ;;
        test)
            log_info "Testing Nginx configuration..."
            nginx -t
            ;;
        logs)
            local log_type="${1:-access}"
            local lines="${2:-50}"
            
            case "$log_type" in
                access)
                    tail -$lines /var/log/nginx/watchparty_access.log
                    ;;
                error)
                    tail -$lines /var/log/nginx/watchparty_error.log
                    ;;
                both)
                    echo "=== ACCESS LOGS ==="
                    tail -$lines /var/log/nginx/watchparty_access.log
                    echo
                    echo "=== ERROR LOGS ==="
                    tail -$lines /var/log/nginx/watchparty_error.log
                    ;;
                *)
                    log_error "Unknown log type: $log_type"
                    exit 1
                    ;;
            esac
            ;;
        help|--help|-h)
            echo "Nginx Configuration Script Commands:"
            echo "  configure, setup        Configure Nginx for Watch Party"
            echo "    --domain <domain>     Set domain name"
            echo "    --ssl                 Enable SSL configuration"
            echo "  remove, uninstall       Remove Nginx configuration"
            echo "  status, info            Show Nginx status"
            echo "  update <domain>         Update configuration for domain"
            echo "  reload, restart         Reload Nginx"
            echo "  test                    Test Nginx configuration"
            echo "  logs [type] [lines]     Show logs (access|error|both)"
            echo
            echo "Examples:"
            echo "  sudo ./nginx-config.sh configure example.com --ssl"
            echo "  sudo ./nginx-config.sh update example.com"
            echo "  ./nginx-config.sh logs error 100"
            ;;
        *)
            log_error "Unknown nginx command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

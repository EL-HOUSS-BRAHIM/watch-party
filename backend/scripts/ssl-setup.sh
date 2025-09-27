#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - SSL SETUP SCRIPT
# =============================================================================
# Handles SSL certificate setup and HTTPS configuration
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
readonly LOCK="🔒"

# Logging functions
log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

# Configuration
DEFAULT_EMAIL="admin@example.com"
DEFAULT_DOMAIN="yourdomain.com"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

check_root() {
    if [[ $EUID -eq 0 ]]; then
        log_error "This script should not be run as root"
        exit 1
    fi
}

check_dependencies() {
    local missing_deps=()
    
    # Check for required commands
    for cmd in certbot nginx; do
        if ! command -v "$cmd" &> /dev/null; then
            missing_deps+=("$cmd")
        fi
    done
    
    if [[ ${#missing_deps[@]} -gt 0 ]]; then
        log_error "Missing dependencies: ${missing_deps[*]}"
        log_info "Run './manage.sh server-setup' first to install dependencies"
        exit 1
    fi
}

get_domain_input() {
    local domain=""
    
    if [[ -n "${DOMAIN:-}" ]]; then
        domain="$DOMAIN"
    else
        echo -n "Enter your domain name (e.g., yourdomain.com): "
        read -r domain
    fi
    
    if [[ -z "$domain" ]]; then
        log_error "Domain name is required"
        exit 1
    fi
    
    echo "$domain"
}

get_email_input() {
    local email=""
    
    if [[ -n "${EMAIL:-}" ]]; then
        email="$EMAIL"
    else
        echo -n "Enter your email address for SSL notifications: "
        read -r email
    fi
    
    if [[ -z "$email" ]]; then
        log_warning "Using default email: $DEFAULT_EMAIL"
        email="$DEFAULT_EMAIL"
    fi
    
    echo "$email"
}

validate_domain() {
    local domain="$1"
    
    # Basic domain validation
    if [[ ! "$domain" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$ ]]; then
        log_error "Invalid domain format: $domain"
        exit 1
    fi
    
    # Check if domain resolves to this server
    local server_ip
    server_ip=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "unknown")
    
    local domain_ip
    domain_ip=$(dig +short "$domain" | tail -n1)
    
    if [[ "$server_ip" != "unknown" && "$domain_ip" != "$server_ip" ]]; then
        log_warning "Domain $domain does not resolve to this server IP ($server_ip)"
        log_warning "Current domain IP: $domain_ip"
        
        if [[ "${FORCE:-false}" != "true" ]]; then
            echo -n "Continue anyway? (y/N): "
            read -r continue_anyway
            if [[ "$continue_anyway" != "y" && "$continue_anyway" != "Y" ]]; then
                log_error "SSL setup cancelled"
                exit 1
            fi
        fi
    fi
}

# =============================================================================
# NGINX CONFIGURATION
# =============================================================================

backup_nginx_config() {
    log_info "Backing up Nginx configuration..."
    
    local backup_dir="/etc/nginx/backups"
    sudo mkdir -p "$backup_dir"
    
    local timestamp
    timestamp=$(date +"%Y%m%d_%H%M%S")
    
    if [[ -f /etc/nginx/sites-available/watchparty ]]; then
        sudo cp /etc/nginx/sites-available/watchparty "$backup_dir/watchparty_$timestamp"
        log_success "Nginx config backed up to $backup_dir/watchparty_$timestamp"
    fi
}

create_ssl_nginx_config() {
    local domain="$1"
    
    log_info "Creating SSL-ready Nginx configuration..."
    
    # Create SSL configuration
    sudo tee /etc/nginx/sites-available/watchparty > /dev/null << EOF
# HTTP to HTTPS redirect
server {
    listen 80;
    server_name $domain www.$domain;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        return 301 https://\$server_name\$request_uri;
    }
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $domain www.$domain;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/$domain/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$domain/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";

    client_max_body_size 100M;

    # Static files
    location /static/ {
        alias /var/www/watchparty/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
        
        # Gzip compression
        gzip on;
        gzip_types text/css application/javascript text/javascript application/x-javascript image/svg+xml;
    }

    location /media/ {
        alias /var/www/watchparty/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
    }

    # Django application
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}
EOF

    # Add rate limiting to main nginx.conf if not present
    if ! sudo grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
        sudo sed -i '/http {/a\\tlimit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;' /etc/nginx/nginx.conf
    fi

    log_success "SSL Nginx configuration created"
}

# =============================================================================
# SSL CERTIFICATE MANAGEMENT
# =============================================================================

obtain_certificate() {
    local domain="$1"
    local email="$2"
    
    log_info "Obtaining SSL certificate for $domain..."
    
    # Create temporary Nginx config for ACME challenge
    sudo tee /etc/nginx/sites-available/watchparty-temp > /dev/null << EOF
server {
    listen 80;
    server_name $domain www.$domain;
    
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
    
    # Switch to temporary config
    sudo ln -sf /etc/nginx/sites-available/watchparty-temp /etc/nginx/sites-enabled/watchparty
    sudo nginx -t && sudo systemctl reload nginx
    
    # Obtain certificate
    local certbot_cmd="certbot certonly --webroot -w /var/www/html -d $domain -d www.$domain --email $email --agree-tos --non-interactive"
    
    if [[ "${DRY_RUN:-false}" == "true" ]]; then
        certbot_cmd="$certbot_cmd --dry-run"
        log_info "Running in dry-run mode..."
    fi
    
    if sudo $certbot_cmd; then
        log_success "SSL certificate obtained successfully"
        return 0
    else
        log_error "Failed to obtain SSL certificate"
        return 1
    fi
}

setup_auto_renewal() {
    log_info "Setting up automatic certificate renewal..."
    
    # Create renewal hook script
    sudo tee /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh > /dev/null << 'EOF'
#!/bin/bash
systemctl reload nginx
EOF
    
    sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/nginx-reload.sh
    
    # Test renewal process
    if sudo certbot renew --dry-run; then
        log_success "Certificate auto-renewal configured and tested"
    else
        log_warning "Certificate auto-renewal test failed"
    fi
}

# =============================================================================
# SECURITY ENHANCEMENTS
# =============================================================================

setup_security_headers() {
    log_info "Setting up additional security configurations..."
    
    # Create security configuration file
    sudo tee /etc/nginx/conf.d/security.conf > /dev/null << 'EOF'
# Security headers
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss: ws:;" always;

# Hide Nginx version
server_tokens off;

# Prevent access to hidden files
location ~ /\. {
    deny all;
    access_log off;
    log_not_found off;
}

# Prevent access to backup files
location ~ ~$ {
    deny all;
    access_log off;
    log_not_found off;
}
EOF
    
    log_success "Security headers configured"
}

# =============================================================================
# FIREWALL CONFIGURATION
# =============================================================================

update_firewall() {
    log_info "Updating firewall for HTTPS..."
    
    # Allow HTTPS traffic
    sudo ufw allow 443/tcp
    
    # Reload firewall
    sudo ufw reload
    
    log_success "Firewall updated for HTTPS"
}

# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

setup_ssl() {
    local domain email
    
    log_info "Starting SSL setup..."
    
    check_root
    check_dependencies
    
    # Get domain and email
    domain=$(get_domain_input)
    email=$(get_email_input)
    
    # Validate domain
    validate_domain "$domain"
    
    log_info "Setting up SSL for domain: $domain"
    log_info "Using email: $email"
    
    # Backup current configuration
    backup_nginx_config
    
    # Obtain SSL certificate
    if obtain_certificate "$domain" "$email"; then
        # Create SSL-enabled configuration
        create_ssl_nginx_config "$domain"
        
        # Switch to SSL configuration
        sudo nginx -t && sudo systemctl reload nginx
        
        # Setup additional security
        setup_security_headers
        setup_auto_renewal
        update_firewall
        
        log_success "SSL setup completed successfully!"
        log_info "Your site is now available at: https://$domain"
        log_info "Certificate will auto-renew before expiration"
    else
        log_error "SSL setup failed"
        exit 1
    fi
}

renew_certificates() {
    log_info "Renewing SSL certificates..."
    
    if sudo certbot renew; then
        log_success "Certificates renewed successfully"
        sudo systemctl reload nginx
    else
        log_error "Certificate renewal failed"
        exit 1
    fi
}

check_certificates() {
    log_info "Checking SSL certificate status..."
    
    sudo certbot certificates
}

remove_ssl() {
    local domain="$1"
    
    if [[ -z "$domain" ]]; then
        echo -n "Enter domain to remove SSL for: "
        read -r domain
    fi
    
    if [[ -z "$domain" ]]; then
        log_error "Domain name is required"
        exit 1
    fi
    
    log_warning "Removing SSL configuration for $domain..."
    
    if [[ "${FORCE:-false}" != "true" ]]; then
        echo -n "Are you sure? This will remove SSL certificates and revert to HTTP. (y/N): "
        read -r confirm
        if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
            log_info "SSL removal cancelled"
            exit 0
        fi
    fi
    
    # Remove certificates
    sudo certbot delete --cert-name "$domain"
    
    # Restore HTTP-only configuration
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
    
    sudo nginx -t && sudo systemctl reload nginx
    
    log_success "SSL configuration removed"
}

show_help() {
    echo "Watch Party SSL Setup Script"
    echo
    echo "USAGE:"
    echo "  $0 [COMMAND] [OPTIONS]"
    echo
    echo "COMMANDS:"
    echo "  setup              Setup SSL certificates and HTTPS"
    echo "  renew              Renew existing certificates"
    echo "  check              Check certificate status"
    echo "  remove [domain]    Remove SSL configuration"
    echo "  help               Show this help message"
    echo
    echo "OPTIONS:"
    echo "  --domain DOMAIN    Specify domain name"
    echo "  --email EMAIL      Specify email address"
    echo "  --dry-run          Test certificate obtaining without actually getting it"
    echo "  --force            Skip confirmations"
    echo
    echo "EXAMPLES:"
    echo "  $0 setup --domain yourdomain.com --email admin@yourdomain.com"
    echo "  $0 renew"
    echo "  $0 remove yourdomain.com --force"
}

# =============================================================================
# MAIN EXECUTION
# =============================================================================

main() {
    # Parse options
    while [[ $# -gt 0 ]]; do
        case $1 in
            --domain)
                DOMAIN="$2"
                shift 2
                ;;
            --email)
                EMAIL="$2"
                shift 2
                ;;
            --dry-run)
                DRY_RUN="true"
                shift
                ;;
            --force)
                FORCE="true"
                shift
                ;;
            setup|renew|check|remove|help)
                COMMAND="$1"
                shift
                ;;
            *)
                if [[ -z "${COMMAND:-}" ]]; then
                    COMMAND="$1"
                else
                    DOMAIN_ARG="$1"
                fi
                shift
                ;;
        esac
    done
    
    local command="${COMMAND:-help}"
    
    case "$command" in
        setup)
            setup_ssl
            ;;
        renew)
            renew_certificates
            ;;
        check)
            check_certificates
            ;;
        remove)
            remove_ssl "${DOMAIN_ARG:-}"
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

#!/bin/bash

# =============================================================================
# Watch Party Backend - Production Deployment Script
# =============================================================================
# This script automates the complete deployment process from git push to 
# production server with all optimizations and configurations tested.
# 
# Tested Configuration:
# - AWS EC2 t2.micro (1GB RAM) with 4GB swap
# - Ubuntu 24.04 LTS
# - Django 5.0 with DRF, Celery, Channels
# - AWS ElastiCache Valkey (Redis-compatible)
# - Cloudflare SSL with Origin Certificates
# - PM2 process management
# =============================================================================

set -euo pipefail

# Configuration
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly PROJECT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
readonly SERVER_USER="${DEPLOY_USER:-ubuntu}"
readonly SERVER_HOST="${DEPLOY_HOST:-35.181.208.71}"
readonly SERVER_PATH="/opt/watch-party-backend"
readonly SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
readonly BRANCH="${DEPLOY_BRANCH:-master}"

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

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
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check SSH key
    if [[ ! -f "$SSH_KEY" ]]; then
        log_error "SSH key not found at $SSH_KEY"
        exit 1
    fi
    
    # Check SSH connection
    if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 -o BatchMode=yes "${SERVER_USER}@${SERVER_HOST}" exit; then
        log_error "Cannot connect to server ${SERVER_HOST}"
        exit 1
    fi
    
    # Check git status
    if [[ -n "$(git status --porcelain)" ]]; then
        log_warning "Working directory has uncommitted changes"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Deployment cancelled"
            exit 0
        fi
    fi
    
    log_success "Prerequisites check passed"
}

# Deploy to server
deploy_to_server() {
    log_info "Starting deployment to production server..."
    
    # Create deployment script on server
    cat << 'EOF' | ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_HOST}" 'cat > /tmp/deploy.sh'
#!/bin/bash
set -euo pipefail

SERVER_PATH="/opt/watch-party-backend"
BRANCH="${1:-master}"

log_info() {
    echo -e "\e[34m[INFO]\e[0m $1"
}

log_success() {
    echo -e "\e[32m[SUCCESS]\e[0m $1"
}

log_error() {
    echo -e "\e[31m[ERROR]\e[0m $1" >&2
}

# Navigate to project directory
cd "$SERVER_PATH"

# Git operations
log_info "Updating code from Git repository..."
git fetch origin
git reset --hard "origin/$BRANCH"
git clean -fd

# Install/update dependencies
log_info "Installing Python dependencies..."
pip install -r requirements/production.txt

# Run database migrations
log_info "Running database migrations..."
python manage.py migrate --noinput

# Collect static files
log_info "Collecting static files..."
python manage.py collectstatic --noinput

# Update permissions
log_info "Setting file permissions..."
chmod +x start-*.sh
chmod 644 ecosystem.config.js

# Restart services via PM2
log_info "Restarting services..."
pm2 restart ecosystem.config.js
pm2 save

# Health check
log_info "Performing health check..."
sleep 10  # Give services time to start

# Check PM2 status
pm2 status

# Check if Django is responding
if curl -f -s -o /dev/null "http://localhost:8000/health/"; then
    log_success "Django health check passed"
else
    log_error "Django health check failed"
    exit 1
fi

# Check if API docs are accessible
if curl -f -s -o /dev/null "http://localhost:8000/api/docs/"; then
    log_success "API documentation accessible"
else
    log_error "API documentation not accessible"
fi

log_success "Deployment completed successfully!"
EOF

    # Execute deployment on server
    ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_HOST}" "chmod +x /tmp/deploy.sh && /tmp/deploy.sh '$BRANCH'"
    
    log_success "Server deployment completed"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check HTTPS endpoint
    local api_url="https://be-watch-party.brahim-elhouss.me"
    
    if curl -f -s -o /dev/null "$api_url/health/"; then
        log_success "HTTPS health check passed: $api_url/health/"
    else
        log_error "HTTPS health check failed"
        return 1
    fi
    
    if curl -f -s -o /dev/null "$api_url/api/docs/"; then
        log_success "API documentation accessible: $api_url/api/docs/"
    else
        log_warning "API documentation check failed"
    fi
    
    # Check server resources
    log_info "Checking server resources..."
    ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_HOST}" << 'EOF'
echo "=== Memory Usage ==="
free -h
echo "=== Disk Usage ==="
df -h /
echo "=== PM2 Status ==="
pm2 status
echo "=== Nginx Status ==="
sudo systemctl status nginx --no-pager -l
EOF
    
    log_success "Deployment verification completed"
}

# Rollback function
rollback() {
    log_warning "Rolling back deployment..."
    
    ssh -i "$SSH_KEY" "${SERVER_USER}@${SERVER_HOST}" << 'EOF'
cd /opt/watch-party-backend
git log --oneline -10
echo "Enter commit hash to rollback to:"
read -r commit_hash
git reset --hard "$commit_hash"
pm2 restart ecosystem.config.js
pm2 save
EOF
    
    log_success "Rollback completed"
}

# Main deployment flow
main() {
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            deploy_to_server
            verify_deployment
            log_success "🚀 Deployment completed successfully!"
            log_info "API: https://be-watch-party.brahim-elhouss.me/api/docs/"
            log_info "Health: https://be-watch-party.brahim-elhouss.me/health/"
            ;;
        "rollback")
            rollback
            ;;
        "verify")
            verify_deployment
            ;;
        "help"|"-h"|"--help")
            cat << EOF
Usage: $0 [command]

Commands:
  deploy    Deploy current branch to production (default)
  rollback  Rollback to a previous commit
  verify    Verify current deployment
  help      Show this help message

Environment Variables:
  DEPLOY_USER   Server username (default: ubuntu)
  DEPLOY_HOST   Server hostname (default: 35.181.208.71) 
  DEPLOY_BRANCH Git branch to deploy (default: master)
  SSH_KEY       Path to SSH key (default: ~/.ssh/id_rsa)

Examples:
  $0 deploy                    # Deploy current branch
  DEPLOY_BRANCH=develop $0     # Deploy develop branch
  $0 rollback                  # Interactive rollback
  $0 verify                    # Verify deployment
EOF
            ;;
        *)
            log_error "Unknown command: $1"
            log_info "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

main "$@"
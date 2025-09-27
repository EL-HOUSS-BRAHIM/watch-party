#!/bin/bash
set -euo pipefail

# Watch Party Backend - Git-based Update Script
# Updates the application from Git and restarts services

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
PROJECT_DIR="/opt/watch-party-backend"
DEPLOY_USER="ubuntu"
BRANCH="${1:-master}"

cd $PROJECT_DIR

log_info "Starting application update from Git..."
log_info "Branch: $BRANCH"

# Backup current .env
log_info "Backing up environment configuration..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Stash any local changes
log_info "Stashing local changes..."
git stash push -m "Auto-stash before deployment $(date)"

# Fetch latest changes
log_info "Fetching latest changes..."
git fetch origin

# Switch to target branch
log_info "Switching to branch: $BRANCH"
git checkout $BRANCH

# Pull latest changes
log_info "Pulling latest changes..."
git pull origin $BRANCH

# Show recent commits
log_info "Recent commits:"
git log --oneline -5

# Activate virtual environment
log_info "Activating virtual environment..."
source venv/bin/activate

# Update dependencies
log_info "Updating Python dependencies..."
pip install -r requirements.txt
pip install 'requests==2.31.0' 'psycopg2-binary' 'drf-spectacular[sidecar]'

# Load environment variables
set -a
source .env
set +a

# Run Django commands
log_info "Running Django setup commands..."
python manage.py collectstatic --noinput || log_warning "Static files collection failed"
python manage.py migrate || log_warning "Database migrations failed"

# Check for new/changed startup scripts
log_info "Updating startup scripts..."
if [ -f "deployment/scripts/deploy-app.sh" ]; then
    chmod +x deployment/scripts/*.sh
    # Regenerate optimized startup scripts from deployment
    ./deployment/scripts/deploy-app.sh --skip-pm2-restart || true
fi

# Graceful restart of services
log_info "Gracefully restarting services..."
pm2 reload ecosystem.config.js

# Wait for services to stabilize
log_info "Waiting for services to stabilize..."
sleep 10

# Health check
log_info "Performing health check..."
if curl -f -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/ | grep -q "200"; then
    log_success "Health check passed!"
else
    log_warning "Health check failed - but continuing anyway"
fi

# Show PM2 status
log_info "Current PM2 status:"
pm2 status

# Show recent logs
log_info "Recent logs:"
pm2 logs --lines 10

log_success "Application update completed!"
log_info "Deployment details:"
log_info "- Branch: $BRANCH"
log_info "- Commit: $(git rev-parse --short HEAD)"
log_info "- Time: $(date)"

# Create deployment record
echo "$(date): Updated to $(git rev-parse --short HEAD) from branch $BRANCH" >> .deployment_history
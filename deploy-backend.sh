#!/bin/bash

# Watch Party Backend Deployment Script
# This script deploys the Django backend to the production server

set -e  # Exit on any error

# Configuration
SERVER_IP="13.37.8.163"
SERVER_USER="ubuntu"
SSH_KEY=".ssh/deploy_key"
DEPLOY_PATH="/home/ubuntu/brahim/be_watch-party"
LOCAL_BACKEND_PATH="./back-end"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting Backend Deployment to Production${NC}"

# Function to run commands on the server
run_remote() {
    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to copy files to server
copy_to_server() {
    rsync -avz --delete -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" "$1" "$SERVER_USER@$SERVER_IP:$2"
}

echo -e "${YELLOW}📁 Preparing deployment directory...${NC}"
run_remote "mkdir -p $DEPLOY_PATH"

echo -e "${YELLOW}📦 Uploading backend code...${NC}"
# Create a temporary directory for deployment
TEMP_DIR=$(mktemp -d)
echo "Temporary directory: $TEMP_DIR"

# Copy backend files to temp directory, excluding unnecessary files
rsync -av --exclude='__pycache__' --exclude='*.pyc' --exclude='.env' --exclude='venv' --exclude='node_modules' --exclude='.git' "$LOCAL_BACKEND_PATH/" "$TEMP_DIR/"

# Upload to server
copy_to_server "$TEMP_DIR/" "$DEPLOY_PATH"

# Clean up temp directory
rm -rf "$TEMP_DIR"

echo -e "${YELLOW}🐍 Setting up Python virtual environment...${NC}"
run_remote "cd $DEPLOY_PATH && python3 -m venv venv"

echo -e "${YELLOW}📚 Installing Python dependencies...${NC}"
run_remote "cd $DEPLOY_PATH && source venv/bin/activate && pip install --upgrade pip && pip install -r requirements.txt"

echo -e "${YELLOW}🔧 Setting up environment variables...${NC}"
# Check if .env file exists, if not copy from example
run_remote "cd $DEPLOY_PATH && if [ ! -f .env ]; then cp .env.production.example .env; echo 'Created .env file from example. Please update it with production values.'; fi"

echo -e "${YELLOW}🗄️ Running database migrations...${NC}"
run_remote "cd $DEPLOY_PATH && source venv/bin/activate && python manage.py migrate --settings=watchparty.settings.production"

echo -e "${YELLOW}📊 Collecting static files...${NC}"
run_remote "cd $DEPLOY_PATH && source venv/bin/activate && python manage.py collectstatic --noinput --settings=watchparty.settings.production"

echo -e "${YELLOW}👤 Creating superuser (if needed)...${NC}"
run_remote "cd $DEPLOY_PATH && source venv/bin/activate && python manage.py shell --settings=watchparty.settings.production -c \"
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@watchparty.com', 'admin123')
    print('Superuser created: admin/admin123')
else:
    print('Superuser already exists')
\""

echo -e "${YELLOW}🔄 Restarting services...${NC}"
run_remote "sudo systemctl daemon-reload"
run_remote "sudo systemctl start watch-party-backend.service"
run_remote "sudo systemctl start watch-party-celery-worker.service"
run_remote "sudo systemctl start watch-party-celery-beat.service"

echo -e "${YELLOW}✅ Checking service status...${NC}"
run_remote "sudo systemctl status watch-party-backend.service --no-pager -l"

echo -e "${YELLOW}🔍 Testing deployment...${NC}"
sleep 5  # Wait for services to start
run_remote "curl -f http://localhost:8000/health/ || echo 'Health check failed'"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}Backend is running at: https://be-watch-party.brahim-elhouss.me${NC}"
echo -e "${YELLOW}📝 Next steps:${NC}"
echo -e "  1. Update the .env file with production values"
echo -e "  2. Check logs: sudo journalctl -u watch-party-backend.service -f"
echo -e "  3. Monitor nginx logs: sudo tail -f /var/log/nginx/be-watch-party.error.log"

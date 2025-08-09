#!/bin/bash

# Quick Update Script for Watch Party Backend
# This script updates the existing deployment with latest code

set -e  # Exit on any error

# Configuration
SERVER_IP="13.37.8.163"
SERVER_USER="ubuntu"
DEPLOY_KEY="/workspaces/watch-party/.ssh/deploy_key"
REMOTE_DIR="/home/ubuntu/brahim"
APP_DIR="be_watch-party"
BRANCH="backend-hardening-sprint"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔄 Starting quick update of production server...${NC}"

# Function to run commands on remote server
run_remote() {
    ssh -i "$DEPLOY_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

echo -e "${YELLOW}📋 Step 1: Pulling latest code...${NC}"
run_remote "cd $REMOTE_DIR/$APP_DIR && git fetch origin && git checkout $BRANCH && git pull origin $BRANCH"

echo -e "${YELLOW}📋 Step 2: Updating dependencies...${NC}"
run_remote "cd $REMOTE_DIR/$APP_DIR && source venv/bin/activate && pip install -r requirements.txt"

echo -e "${YELLOW}📋 Step 3: Running migrations...${NC}"
run_remote "cd $REMOTE_DIR/$APP_DIR && source venv/bin/activate && python manage.py migrate"

echo -e "${YELLOW}📋 Step 4: Collecting static files...${NC}"
run_remote "cd $REMOTE_DIR/$APP_DIR && source venv/bin/activate && python manage.py collectstatic --noinput"

echo -e "${YELLOW}📋 Step 5: Restarting services...${NC}"
run_remote "sudo systemctl restart daphne celery nginx"

echo -e "${YELLOW}📋 Step 6: Verifying services...${NC}"
sleep 3

echo "Checking services status:"
run_remote "sudo systemctl is-active daphne && echo 'Daphne: ✅ Running'"
run_remote "sudo systemctl is-active celery && echo 'Celery: ✅ Running'"
run_remote "sudo systemctl is-active nginx && echo 'Nginx: ✅ Running'"

echo -e "${GREEN}✅ Quick update completed successfully!${NC}"
echo -e "${BLUE}🌐 Application updated at: https://be-watch-party.brahim-elhouss.me${NC}"

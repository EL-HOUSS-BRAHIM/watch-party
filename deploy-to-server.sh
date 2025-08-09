#!/bin/bash

# Production Deployment Script for Watch Party Backend
# This script deploys the backend to the production server

set -e  # Exit on any error

# Configuration
SERVER_IP="13.37.8.163"
SERVER_USER="ubuntu"
DEPLOY_KEY="/workspaces/watch-party/.ssh/deploy_key"
REMOTE_DIR="/home/ubuntu/brahim"
APP_DIR="be_watch-party"
REPO_URL="https://github.com/EL-HOUSS-BRAHIM/watch-party.git"
BRANCH="backend-hardening-sprint"
DOMAIN="be-watch-party.brahim-elhouss.me"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting deployment to production server...${NC}"

# Function to run commands on remote server
run_remote() {
    ssh -i "$DEPLOY_KEY" -o StrictHostKeyChecking=no "$SERVER_USER@$SERVER_IP" "$1"
}

# Function to copy files to remote server
copy_to_remote() {
    scp -i "$DEPLOY_KEY" -o StrictHostKeyChecking=no "$1" "$SERVER_USER@$SERVER_IP:$2"
}

echo -e "${YELLOW}📋 Step 1: Checking server connection...${NC}"
if ! run_remote "echo 'Server connection successful'"; then
    echo -e "${RED}❌ Failed to connect to server${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Step 2: Creating backup of current deployment...${NC}"
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
run_remote "cd $REMOTE_DIR && if [ -d '$APP_DIR' ]; then cp -r '$APP_DIR' '$BACKUP_DIR' && echo 'Backup created: $BACKUP_DIR'; else echo 'No existing deployment to backup'; fi"

echo -e "${YELLOW}📋 Step 3: Stopping services...${NC}"
run_remote "sudo supervisorctl stop all || echo 'No supervisor processes to stop'"
run_remote "sudo pkill -f daphne || echo 'No daphne processes running'"
run_remote "sudo pkill -f celery || echo 'No celery processes running'"

echo -e "${YELLOW}📋 Step 4: Setting up fresh deployment...${NC}"
run_remote "cd $REMOTE_DIR && rm -rf '$APP_DIR'"
run_remote "cd $REMOTE_DIR && git clone '$REPO_URL' '$APP_DIR'"
run_remote "cd $REMOTE_DIR/$APP_DIR && git checkout '$BRANCH'"

echo -e "${YELLOW}📋 Step 5: Copying backend files...${NC}"
run_remote "cd $REMOTE_DIR/$APP_DIR && if [ ! -d 'back-end' ]; then echo 'Error: back-end directory not found'; exit 1; fi"
run_remote "cd $REMOTE_DIR/$APP_DIR && cp -r back-end/* . && rm -rf back-end front-end"

echo -e "${YELLOW}📋 Step 6: Setting up Python environment...${NC}"
run_remote "cd $REMOTE_DIR/$APP_DIR && python3 -m venv venv"
run_remote "cd $REMOTE_DIR/$APP_DIR && source venv/bin/activate && pip install --upgrade pip"
run_remote "cd $REMOTE_DIR/$APP_DIR && source venv/bin/activate && pip install -r requirements.txt"

echo -e "${YELLOW}📋 Step 7: Setting up environment variables...${NC}"
# Copy existing .env if it exists in backup
run_remote "cd $REMOTE_DIR && if [ -f '$BACKUP_DIR/.env' ]; then cp '$BACKUP_DIR/.env' '$APP_DIR/.env'; echo 'Environment file copied from backup'; else echo 'No existing .env file found'; fi"

echo -e "${YELLOW}📋 Step 8: Database setup...${NC}"
# Copy existing database if it exists
run_remote "cd $REMOTE_DIR && if [ -f '$BACKUP_DIR/db.sqlite3' ]; then cp '$BACKUP_DIR/db.sqlite3' '$APP_DIR/db.sqlite3'; echo 'Database copied from backup'; fi"

# Run migrations
run_remote "cd $REMOTE_DIR/$APP_DIR && source venv/bin/activate && python manage.py migrate"

echo -e "${YELLOW}📋 Step 9: Collecting static files...${NC}"
run_remote "cd $REMOTE_DIR/$APP_DIR && source venv/bin/activate && python manage.py collectstatic --noinput"

echo -e "${YELLOW}📋 Step 10: Setting up permissions...${NC}"
run_remote "cd $REMOTE_DIR && chown -R ubuntu:ubuntu '$APP_DIR'"
run_remote "cd $REMOTE_DIR/$APP_DIR && chmod +x manage.py"

echo -e "${YELLOW}📋 Step 11: Creating systemd services...${NC}"

# Create Daphne service
cat > /tmp/daphne.service << EOF
[Unit]
Description=Daphne ASGI Server for Watch Party
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=$REMOTE_DIR/$APP_DIR
Environment=PATH=$REMOTE_DIR/$APP_DIR/venv/bin
ExecStart=$REMOTE_DIR/$APP_DIR/venv/bin/daphne -p 8000 watchparty.asgi:application
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

copy_to_remote "/tmp/daphne.service" "/tmp/daphne.service"
run_remote "sudo mv /tmp/daphne.service /etc/systemd/system/daphne.service"

# Create Celery service
cat > /tmp/celery.service << EOF
[Unit]
Description=Celery Worker for Watch Party
After=network.target

[Service]
Type=simple
User=ubuntu
Group=ubuntu
WorkingDirectory=$REMOTE_DIR/$APP_DIR
Environment=PATH=$REMOTE_DIR/$APP_DIR/venv/bin
ExecStart=$REMOTE_DIR/$APP_DIR/venv/bin/celery -A watchparty worker --loglevel=info --concurrency=4 --max-tasks-per-child=1000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

copy_to_remote "/tmp/celery.service" "/tmp/celery.service"
run_remote "sudo mv /tmp/celery.service /etc/systemd/system/celery.service"

echo -e "${YELLOW}📋 Step 12: Starting services...${NC}"
run_remote "sudo systemctl daemon-reload"
run_remote "sudo systemctl enable daphne celery"
run_remote "sudo systemctl start daphne celery"
run_remote "sudo systemctl restart nginx"

echo -e "${YELLOW}📋 Step 13: Verifying deployment...${NC}"
sleep 5

# Check service status
echo "Checking Daphne service:"
run_remote "sudo systemctl is-active daphne" || echo "Daphne service check failed"

echo "Checking Celery service:"
run_remote "sudo systemctl is-active celery" || echo "Celery service check failed"

echo "Checking Nginx service:"
run_remote "sudo systemctl is-active nginx" || echo "Nginx service check failed"

# Test the application
echo "Testing application endpoint:"
run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/health/ || echo 'Health check failed'"

echo -e "${GREEN}✅ Deployment completed!${NC}"
echo -e "${BLUE}🌐 Your application should be available at: https://$DOMAIN${NC}"
echo -e "${BLUE}📊 To check logs:${NC}"
echo -e "  ${YELLOW}Daphne logs:${NC} ssh -i $DEPLOY_KEY $SERVER_USER@$SERVER_IP 'sudo journalctl -u daphne -f'"
echo -e "  ${YELLOW}Celery logs:${NC} ssh -i $DEPLOY_KEY $SERVER_USER@$SERVER_IP 'sudo journalctl -u celery -f'"
echo -e "  ${YELLOW}Nginx logs:${NC} ssh -i $DEPLOY_KEY $SERVER_USER@$SERVER_IP 'sudo tail -f /var/log/nginx/be-watch-party.error.log'"

# Cleanup
rm -f /tmp/daphne.service /tmp/celery.service

echo -e "${GREEN}🎉 Deployment script completed successfully!${NC}"

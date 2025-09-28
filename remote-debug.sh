#!/bin/bash

# Remote Server Diagnostics and Fix Script
# This script connects to the Lightsail server and runs diagnostics/fixes

set -e

LIGHTSAIL_HOST="35.181.116.57"
DEPLOY_USER="deploy"
APP_DIR="/srv/watch-party"
REPO_URL="https://github.com/EL-HOUSS-BRAHIM/watch-party.git"

echo "=== CONNECTING TO LIGHTSAIL SERVER ==="
echo "Host: $LIGHTSAIL_HOST"
echo "User: $DEPLOY_USER"
echo

# Function to run command on server
run_remote() {
    ssh -o StrictHostKeyChecking=no "$DEPLOY_USER@$LIGHTSAIL_HOST" "$1"
}

echo "1. Checking server connection..."
if run_remote "echo 'Connected successfully'"; then
    echo "✅ Server connection OK"
else
    echo "❌ Cannot connect to server"
    echo "Please ensure:"
    echo "1. SSH key is properly configured"
    echo "2. Security group allows SSH (port 22)"
    echo "3. Server is running"
    exit 1
fi

echo
echo "2. Updating repository on server..."
run_remote "cd $APP_DIR && git pull origin master"

echo
echo "3. Running diagnostics on server..."
run_remote "cd $APP_DIR && chmod +x debug-server.sh && ./debug-server.sh" | tee server-diagnostics.log

echo
echo "4. Checking if AWS is configured..."
AWS_CONFIGURED=$(run_remote "aws sts get-caller-identity > /dev/null 2>&1 && echo 'YES' || echo 'NO'")

if [ "$AWS_CONFIGURED" = "NO" ]; then
    echo "❌ AWS not configured. Configuring now..."
    run_remote "cd $APP_DIR && chmod +x configure-aws.sh && ./configure-aws.sh"
else
    echo "✅ AWS already configured"
fi

echo
echo "5. Checking Docker container status..."
CONTAINER_STATUS=$(run_remote "cd $APP_DIR && docker-compose ps --services --filter 'status=running' | wc -l")
echo "Running containers: $CONTAINER_STATUS"

if [ "$CONTAINER_STATUS" -lt 5 ]; then
    echo "❌ Not all containers are running. Attempting restart..."
    run_remote "cd $APP_DIR && docker-compose down && docker-compose up -d"
    
    echo "Waiting 30 seconds for containers to start..."
    sleep 30
    
    echo "Checking container status again..."
    run_remote "cd $APP_DIR && docker-compose ps"
else
    echo "✅ All expected containers are running"
fi

echo
echo "6. Testing web connectivity..."
echo "Testing frontend (port 3000)..."
FRONTEND_STATUS=$(run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo '000'")
echo "Frontend response: $FRONTEND_STATUS"

echo "Testing backend (port 8000)..."
BACKEND_STATUS=$(run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost:8000/health/ || echo '000'")
echo "Backend response: $BACKEND_STATUS"

echo "Testing nginx (port 80)..."
NGINX_STATUS=$(run_remote "curl -s -o /dev/null -w '%{http_code}' http://localhost/ || echo '000'")
echo "Nginx response: $NGINX_STATUS"

echo
echo "7. Checking logs for errors..."
echo "Recent nginx errors:"
run_remote "sudo tail -10 /var/log/nginx/error.log" || echo "No nginx error log or no recent errors"

echo
echo "Recent application logs:"
run_remote "cd $APP_DIR && docker-compose logs --tail=20 backend" || echo "Cannot retrieve backend logs"

echo
echo "=== DIAGNOSIS SUMMARY ==="
echo "AWS Configured: $AWS_CONFIGURED"
echo "Running Containers: $CONTAINER_STATUS/5 expected"
echo "Frontend Status: $FRONTEND_STATUS"
echo "Backend Status: $BACKEND_STATUS" 
echo "Nginx Status: $NGINX_STATUS"

if [ "$FRONTEND_STATUS" = "200" ] && [ "$BACKEND_STATUS" = "200" ] && [ "$NGINX_STATUS" = "200" ]; then
    echo "✅ All services appear to be working locally"
    echo "The 522 error might be a Cloudflare or DNS issue"
    echo "Check:"
    echo "1. DNS A records point to $LIGHTSAIL_HOST"
    echo "2. Cloudflare proxy settings"
    echo "3. Firewall rules allow HTTP/HTTPS traffic"
else
    echo "❌ Found service issues that need to be addressed"
    echo "Check the diagnostics output above for specific problems"
fi

echo
echo "Diagnostics saved to: server-diagnostics.log"
echo "To connect to the server: ssh $DEPLOY_USER@$LIGHTSAIL_HOST"
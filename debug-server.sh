#!/bin/bash

echo "=== WATCH PARTY DEPLOYMENT DIAGNOSTICS ==="
echo "Date: $(date)"
echo "Server: $(hostname)"
echo

echo "=== 1. DOCKER STATUS ==="
echo "Docker service status:"
sudo systemctl status docker --no-pager -l

echo
echo "Running containers:"
sudo docker-compose ps

echo
echo "All containers (including stopped):"
sudo docker ps -a

echo
echo "=== 2. DOCKER COMPOSE LOGS ==="
echo "Recent logs from all services:"
sudo docker-compose logs --tail=50

echo
echo "=== 3. NGINX STATUS ==="
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l

echo
echo "Nginx configuration test:"
sudo nginx -t

echo
echo "=== 4. NETWORK STATUS ==="
echo "Port 80 (HTTP):"
sudo netstat -tlnp | grep :80

echo "Port 443 (HTTPS):"
sudo netstat -tlnp | grep :443

echo "Port 8000 (Backend):"
sudo netstat -tlnp | grep :8000

echo "Port 3000 (Frontend):"
sudo netstat -tlnp | grep :3000

echo
echo "=== 5. ENVIRONMENT FILES ==="
echo "Backend .env file exists:"
ls -la /home/deploy/watch-party/backend/.env

echo
echo "Frontend .env.local file exists:"
ls -la /home/deploy/watch-party/frontend/.env.local

echo
echo "=== 6. AWS CONFIGURATION ==="
echo "AWS CLI installed:"
which aws || echo "AWS CLI not installed"

echo
echo "AWS credentials configured:"
aws sts get-caller-identity 2>/dev/null || echo "AWS credentials not configured or IAM role not working"

echo
echo "=== 7. DISK SPACE ==="
df -h

echo
echo "=== 8. MEMORY USAGE ==="
free -h

echo
echo "=== DIAGNOSTICS COMPLETE ==="
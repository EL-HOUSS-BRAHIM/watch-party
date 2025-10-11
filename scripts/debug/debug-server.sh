#!/bin/bash

echo "=== WATCH PARTY DEPLOYMENT DIAGNOSTICS ==="
echo "Date: $(date)"
echo "Server: $(hostname)"
echo "Current directory: $(pwd)"
echo

echo "=== 1. DOCKER STATUS ==="
echo "Docker service status:"
systemctl status docker --no-pager -l

echo
echo "Running containers:"
docker-compose ps

echo
echo "All containers (including stopped):"
docker ps -a

echo
echo "=== 2. DOCKER COMPOSE LOGS ==="
echo "Recent logs from all services:"
docker-compose logs --tail=50

echo
echo "=== 3. NGINX STATUS ==="
echo "Nginx status:"
systemctl status nginx --no-pager -l

echo
echo "Nginx configuration test:"
nginx -t

echo
echo "=== 4. NETWORK STATUS ==="
echo "Port 80 (HTTP):"
netstat -tlnp | grep :80

echo "Port 443 (HTTPS):"
netstat -tlnp | grep :443

echo "Port 8000 (Backend):"
netstat -tlnp | grep :8000

echo "Port 3000 (Frontend):"
netstat -tlnp | grep :3000

echo
echo "=== 5. ENVIRONMENT FILES ==="
echo "Backend .env file exists:"
ls -la backend/.env

echo
echo "Frontend .env.local file exists:"
ls -la frontend/.env.local

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
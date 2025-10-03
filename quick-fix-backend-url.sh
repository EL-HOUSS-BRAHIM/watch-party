#!/bin/bash

# Quick fix to update frontend environment variables
# This script should be run on the deployment server

set -e

echo "🚀 Applying BACKEND_URL fix to frontend container..."

# Navigate to app directory
APP_DIR="/srv/watch-party"
if [ ! -d "$APP_DIR" ]; then
    APP_DIR="$HOME/watch-party"
fi

cd "$APP_DIR"

echo "📁 Working directory: $APP_DIR"

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git reset --hard origin/master

# Show the docker-compose environment section
echo ""
echo "✅ Verifying docker-compose.yml has correct BACKEND_URL..."
grep -A 8 "frontend:" docker-compose.yml | grep -A 7 "environment:"

# Recreate frontend container with new environment
echo ""
echo "🔄 Recreating frontend container with new environment variables..."
docker-compose up -d --force-recreate frontend

# Wait for frontend to be healthy
echo ""
echo "⏳ Waiting for frontend to be healthy..."
sleep 10

# Check if frontend is running
if docker-compose ps | grep frontend | grep -q "Up"; then
    echo "✅ Frontend container is running"
else
    echo "❌ Frontend container failed to start"
    docker-compose logs --tail=50 frontend
    exit 1
fi

# Verify the environment variable
echo ""
echo "🔍 Verifying BACKEND_URL in container..."
CONTAINER_ID=$(docker-compose ps -q frontend)
BACKEND_URL=$(docker exec $CONTAINER_ID env | grep "^BACKEND_URL=" || echo "NOT FOUND")

echo "Container environment:"
echo "  $BACKEND_URL"

if echo "$BACKEND_URL" | grep -q "https://be-watch-party.brahim-elhouss.me"; then
    echo "✅ BACKEND_URL is correctly set!"
else
    echo "❌ BACKEND_URL is NOT correct!"
    echo "Expected: BACKEND_URL=https://be-watch-party.brahim-elhouss.me"
    echo "Got: $BACKEND_URL"
    exit 1
fi

echo ""
echo "🎉 Fix applied successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test login at: https://watch-party.brahim-elhouss.me/auth/login"
echo "2. Check browser network tab - requests should go to be-watch-party.brahim-elhouss.me"
echo "3. No more 500 errors! ✨"
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Done!"

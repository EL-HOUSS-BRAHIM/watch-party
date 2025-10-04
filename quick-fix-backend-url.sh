#!/bin/bash

# Quick fix to rebuild frontend with correct BACKEND_URL configuration
# This script ensures NEXT_PUBLIC_API_URL is properly embedded at build time

set -e

echo "🚀 Fixing BACKEND_URL configuration for frontend..."

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

# Show the docker-compose build args section
echo ""
echo "✅ Verifying docker-compose.yml has correct build args..."
echo "Build args for frontend:"
grep -A 8 "args:" docker-compose.yml

echo ""
echo "Environment variables for frontend:"
grep -A 10 "environment:" docker-compose.yml | grep -A 10 "BACKEND_URL"

# Stop frontend and remove the old image to force rebuild
echo ""
echo "🛑 Stopping frontend container and removing old image..."
docker-compose stop frontend
docker rmi watchparty-frontend:latest 2>/dev/null || true

# Force rebuild with no cache to ensure NEXT_PUBLIC_* vars are embedded
echo ""
echo "� Rebuilding frontend with embedded environment variables..."
echo "⚠️  This will take a few minutes as Next.js needs to rebuild with NEXT_PUBLIC_* vars"
docker-compose build --no-cache --build-arg GIT_COMMIT_HASH=$(git rev-parse HEAD) frontend

# Start the rebuilt container
echo ""
echo "🚀 Starting rebuilt frontend container..."
docker-compose up -d frontend

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
NEXT_PUBLIC_API_URL=$(docker exec $CONTAINER_ID env | grep "^NEXT_PUBLIC_API_URL=" || echo "NOT FOUND")

echo "Container environment:"
echo "  $BACKEND_URL"
echo "  $NEXT_PUBLIC_API_URL"

# Also check if the environment vars are properly embedded in the built app
echo ""
echo "🔍 Checking if NEXT_PUBLIC_API_URL is embedded in the built app..."
EMBEDDED_URL=$(docker exec $CONTAINER_ID grep -r "be-watch-party.brahim-elhouss.me" .next/ 2>/dev/null | head -1 || echo "")
if [ -n "$EMBEDDED_URL" ]; then
    echo "✅ Backend URL is embedded in the built application"
else
    echo "❌ Backend URL NOT found in built application - rebuild may be needed"
fi

# Verify the environment variables and built application
echo ""
echo "🔍 Verifying environment variables in container..."
CONTAINER_ID=$(docker-compose ps -q frontend)
if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Frontend container not found!"
    exit 1
fi

BACKEND_URL=$(docker exec $CONTAINER_ID env | grep "^BACKEND_URL=" || echo "NOT FOUND")
NEXT_PUBLIC_API_URL=$(docker exec $CONTAINER_ID env | grep "^NEXT_PUBLIC_API_URL=" || echo "NOT FOUND")

echo "Runtime environment variables:"
echo "  $BACKEND_URL"
echo "  $NEXT_PUBLIC_API_URL"

# Check if the environment vars are properly embedded in the built app
echo ""
echo "🔍 Checking if NEXT_PUBLIC_API_URL is embedded in the built Next.js app..."
EMBEDDED_CHECK=$(docker exec $CONTAINER_ID find .next -name "*.js" -exec grep -l "be-watch-party.brahim-elhouss.me" {} \; 2>/dev/null | head -1 || echo "")
if [ -n "$EMBEDDED_CHECK" ]; then
    echo "✅ Backend URL is properly embedded in the built application!"
    echo "   Found in: $(basename $EMBEDDED_CHECK)"
else
    echo "❌ Backend URL NOT found in built application!"
    echo "   This means NEXT_PUBLIC_API_URL was not available during build time"
    exit 1
fi

if echo "$BACKEND_URL" | grep -q "https://be-watch-party.brahim-elhouss.me"; then
    echo "✅ BACKEND_URL is correctly set for server-side API calls!"
else
    echo "❌ BACKEND_URL is NOT correct for server-side API calls!"
    echo "Expected: BACKEND_URL=https://be-watch-party.brahim-elhouss.me"
    echo "Got: $BACKEND_URL"
    exit 1
fi

echo ""
echo "🎉 Fix applied successfully!"
echo ""
echo "📋 What this fix does:"
echo "• Forces rebuild of frontend container with correct NEXT_PUBLIC_API_URL"
echo "• Embeds backend URL (be-watch-party.brahim-elhouss.me) into client-side JavaScript bundle"
echo "• Ensures both server-side (BACKEND_URL) and client-side (NEXT_PUBLIC_API_URL) use correct domain"
echo ""
echo "📋 Next steps:"
echo "1. Test login at: https://watch-party.brahim-elhouss.me/auth/login"
echo "2. Check browser network tab - requests should go to be-watch-party.brahim-elhouss.me"
echo "3. No more 500 errors from wrong domain! ✨"
echo ""
echo "⚠️  Note: This rebuild was necessary because NEXT_PUBLIC_* environment variables"
echo "   must be available at BUILD TIME, not just runtime, to be embedded in the client bundle."
echo ""
echo "📊 Container status:"
docker-compose ps

echo ""
echo "✅ Done!"

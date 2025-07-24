#!/bin/bash

# This script runs Django with ASGI support for WebSockets

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Starting Watch Party Backend with WebSocket Support${NC}"

# Set Django settings module
export DJANGO_SETTINGS_MODULE=watchparty.settings.development

# Check if virtual environment is activated
if [[ "$VIRTUAL_ENV" == "" ]]; then
    echo -e "${YELLOW}⚠️  Virtual environment not activated. Activating...${NC}"
    source venv/bin/activate || {
        echo -e "${YELLOW}❌ Could not activate virtual environment. Please run 'source venv/bin/activate' first.${NC}"
        exit 1
    }
fi

# Install/upgrade daphne if needed
echo -e "${BLUE}📦 Checking ASGI server...${NC}"
pip install daphne==4.0.0 --quiet || {
    echo -e "${YELLOW}⚠️  Installing daphne...${NC}"
    pip install daphne==4.0.0
}

# Run database migrations
echo -e "${BLUE}🔄 Checking database migrations...${NC}"
python manage.py migrate --check --verbosity=0 &>/dev/null || {
    echo -e "${YELLOW}⚠️  Running database migrations...${NC}"
    python manage.py migrate
}

# Collect static files if needed
echo -e "${BLUE}📁 Checking static files...${NC}"
python manage.py collectstatic --noinput --clear --verbosity=0 &>/dev/null || true

echo ""
echo -e "${GREEN}✅ Starting ASGI development server with WebSocket support...${NC}"
echo -e "${BLUE}🌐 Server will be available at:${NC}"
echo -e "   • API: http://localhost:8000/api/"
echo -e "   • Admin: http://localhost:8000/admin/"
echo -e "   • WebSocket: ws://localhost:8000/ws/"
echo -e "   • API Docs: http://localhost:8000/api/docs/"
echo ""

# Start the ASGI server
exec daphne -b 0.0.0.0 -p 8000 watchparty.asgi:application

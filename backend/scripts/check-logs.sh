#!/bin/bash

# Check Logs Script for Watch Party Backend
# This script helps diagnose logging configuration and issues

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DEPLOY_DIR="/var/www/watch-party-backend"
SYSTEM_LOG_DIR="/var/log/watchparty"
PROJECT_LOG_DIR="$DEPLOY_DIR/logs"

echo -e "${BLUE}Watch Party Backend - Log Configuration Check${NC}"
echo "=============================================="
echo ""

# Check if directories exist
echo -e "${YELLOW}Checking log directories:${NC}"
if [ -d "$SYSTEM_LOG_DIR" ]; then
    echo -e "${GREEN}✅ System log directory exists: $SYSTEM_LOG_DIR${NC}"
    echo "   Contents:"
    ls -la "$SYSTEM_LOG_DIR/" 2>/dev/null | sed 's/^/   /'
else
    echo -e "${RED}❌ System log directory missing: $SYSTEM_LOG_DIR${NC}"
fi

echo ""
if [ -d "$PROJECT_LOG_DIR" ]; then
    echo -e "${GREEN}✅ Project log directory exists: $PROJECT_LOG_DIR${NC}"
    echo "   Contents:"
    ls -la "$PROJECT_LOG_DIR/" 2>/dev/null | sed 's/^/   /'
else
    echo -e "${RED}❌ Project log directory missing: $PROJECT_LOG_DIR${NC}"
fi

echo ""
echo -e "${YELLOW}Checking log file permissions:${NC}"

# System logs
for log_file in "django.log" "django_errors.log" "access.log" "error.log"; do
    file_path="$SYSTEM_LOG_DIR/$log_file"
    if [ -f "$file_path" ]; then
        perms=$(ls -l "$file_path" | awk '{print $1, $3, $4}')
        echo -e "${GREEN}✅ $file_path${NC}"
        echo "   Permissions: $perms"
    else
        echo -e "${RED}❌ Missing: $file_path${NC}"
    fi
done

echo ""

# Project logs
for log_file in "django.log" "security.log" "performance.log"; do
    file_path="$PROJECT_LOG_DIR/$log_file"
    if [ -f "$file_path" ]; then
        perms=$(ls -l "$file_path" | awk '{print $1, $3, $4}')
        echo -e "${GREEN}✅ $file_path${NC}"
        echo "   Permissions: $perms"
    else
        echo -e "${RED}❌ Missing: $file_path${NC}"
    fi
done

echo ""
echo -e "${YELLOW}Checking recent log entries:${NC}"

# Check Django production logs
if [ -f "$SYSTEM_LOG_DIR/django.log" ]; then
    echo -e "${BLUE}Recent Django logs (last 10 lines):${NC}"
    tail -n 10 "$SYSTEM_LOG_DIR/django.log" 2>/dev/null | sed 's/^/   /' || echo "   (empty or unreadable)"
fi

echo ""

if [ -f "$SYSTEM_LOG_DIR/django_errors.log" ]; then
    echo -e "${BLUE}Recent Django error logs (last 5 lines):${NC}"
    tail -n 5 "$SYSTEM_LOG_DIR/django_errors.log" 2>/dev/null | sed 's/^/   /' || echo "   (empty or unreadable)"
fi

echo ""

# Check Gunicorn logs
if [ -f "$SYSTEM_LOG_DIR/error.log" ]; then
    echo -e "${BLUE}Recent Gunicorn error logs (last 5 lines):${NC}"
    tail -n 5 "$SYSTEM_LOG_DIR/error.log" 2>/dev/null | sed 's/^/   /' || echo "   (empty or unreadable)"
fi

echo ""
echo -e "${YELLOW}Django logging configuration check:${NC}"

# Check Django settings
if [ -f "$DEPLOY_DIR/.env" ]; then
    source "$DEPLOY_DIR/.env"
    if [ -n "$DJANGO_SETTINGS_MODULE" ]; then
        echo "Django settings module: $DJANGO_SETTINGS_MODULE"
        
        # Try to check logging configuration
        if [ -d "$DEPLOY_DIR/venv" ]; then
            echo "Checking Django logging configuration..."
            cd "$DEPLOY_DIR"
            source venv/bin/activate 2>/dev/null
            python -c "
import os
import django
from django.conf import settings

try:
    django.setup()
    logging_config = getattr(settings, 'LOGGING', {})
    handlers = logging_config.get('handlers', {})
    
    print('Configured log handlers:')
    for name, config in handlers.items():
        if 'filename' in config:
            print(f'  {name}: {config[\"filename\"]}')
        else:
            print(f'  {name}: {config.get(\"class\", \"unknown\")}')
            
except Exception as e:
    print(f'Error checking Django config: {e}')
" 2>/dev/null || echo "Could not check Django configuration"
        fi
    fi
else
    echo -e "${RED}No .env file found${NC}"
fi

echo ""
echo -e "${YELLOW}Service status:${NC}"
systemctl is-active --quiet watchparty-gunicorn && echo -e "${GREEN}✅ Gunicorn service is running${NC}" || echo -e "${RED}❌ Gunicorn service is not running${NC}"

echo ""
echo -e "${YELLOW}Log file sizes:${NC}"
for dir in "$SYSTEM_LOG_DIR" "$PROJECT_LOG_DIR"; do
    if [ -d "$dir" ]; then
        echo "Directory: $dir"
        find "$dir" -name "*.log" -exec ls -lh {} \; 2>/dev/null | awk '{print "  " $9 ": " $5}' || echo "  (no log files)"
    fi
done

echo ""
echo -e "${BLUE}Log check complete!${NC}"

# Suggest fixes if issues found
if [ ! -d "$SYSTEM_LOG_DIR" ] || [ ! -f "$SYSTEM_LOG_DIR/django.log" ]; then
    echo ""
    echo -e "${YELLOW}Suggested fixes:${NC}"
    echo "1. Create missing log directories:"
    echo "   sudo mkdir -p $SYSTEM_LOG_DIR"
    echo "   sudo mkdir -p $PROJECT_LOG_DIR"
    echo ""
    echo "2. Create missing log files:"
    echo "   sudo touch $SYSTEM_LOG_DIR/django.log"
    echo "   sudo touch $SYSTEM_LOG_DIR/django_errors.log"
    echo "   sudo touch $SYSTEM_LOG_DIR/access.log"
    echo "   sudo touch $SYSTEM_LOG_DIR/error.log"
    echo ""
    echo "3. Set proper ownership:"
    echo "   sudo chown -R www-data:www-data $SYSTEM_LOG_DIR"
    echo "   sudo chown -R www-data:www-data $PROJECT_LOG_DIR"
    echo ""
    echo "4. Set proper permissions:"
    echo "   sudo chmod 664 $SYSTEM_LOG_DIR/*.log"
    echo "   sudo chmod 664 $PROJECT_LOG_DIR/*.log"
fi

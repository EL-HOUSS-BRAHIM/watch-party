#!/bin/bash

# Redis and Celery Monitoring Script for Watch Party Backend
# This script provides detailed monitoring and management for Redis and Celery

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

BACKEND_PATH="/home/ubuntu/brahim/be_watch-party"
REDIS_PASSWORD="watchparty_redis_2025"

case "$1" in
    redis-info)
        print_header "Redis Server Information"
        redis-cli -p 6380 -a $REDIS_PASSWORD INFO server
        echo ""
        print_header "Redis Memory Usage"
        redis-cli -p 6380 -a $REDIS_PASSWORD INFO memory
        echo ""
        print_header "Redis Client Connections"
        redis-cli -p 6380 -a $REDIS_PASSWORD INFO clients
        ;;
    
    redis-stats)
        print_header "Redis Statistics"
        redis-cli -p 6380 -a $REDIS_PASSWORD INFO stats
        echo ""
        print_header "Redis Keyspace"
        redis-cli -p 6380 -a $REDIS_PASSWORD INFO keyspace
        ;;
    
    celery-workers)
        print_header "Active Celery Workers"
        cd $BACKEND_PATH
        source venv/bin/activate
        celery -A watchparty inspect active
        echo ""
        print_header "Registered Tasks"
        celery -A watchparty inspect registered
        ;;
    
    celery-stats)
        print_header "Celery Worker Statistics"
        cd $BACKEND_PATH
        source venv/bin/activate
        celery -A watchparty inspect stats
        ;;
    
    celery-queues)
        print_header "Celery Queue Status"
        cd $BACKEND_PATH
        source venv/bin/activate
        celery -A watchparty inspect active_queues
        echo ""
        print_header "Scheduled Tasks"
        celery -A watchparty inspect scheduled
        ;;
    
    redis-monitor)
        print_header "Redis Live Monitor (Ctrl+C to exit)"
        redis-cli -p 6380 -a $REDIS_PASSWORD MONITOR
        ;;
    
    redis-slowlog)
        print_header "Redis Slow Query Log"
        redis-cli -p 6380 -a $REDIS_PASSWORD SLOWLOG GET 10
        ;;
    
    redis-memory)
        print_header "Redis Memory Analysis"
        redis-cli -p 6380 -a $REDIS_PASSWORD MEMORY USAGE
        echo ""
        print_header "Top Memory Keys"
        redis-cli -p 6380 -a $REDIS_PASSWORD --bigkeys
        ;;
    
    health-check)
        print_header "Health Check - All Services"
        
        # Redis health
        echo -n "Redis (port 6380): "
        if redis-cli -p 6380 -a $REDIS_PASSWORD ping >/dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        
        # Backend health
        echo -n "Django Backend: "
        if curl -f http://localhost:8000/api/test/ >/dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        
        # Celery worker health
        echo -n "Celery Worker: "
        if systemctl is-active watch-party-celery-worker >/dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        
        # Celery beat health
        echo -n "Celery Beat: "
        if systemctl is-active watch-party-celery-beat >/dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        
        # Nginx health
        echo -n "Nginx: "
        if systemctl is-active nginx >/dev/null 2>&1; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}FAILED${NC}"
        fi
        ;;
    
    purge-tasks)
        print_warning "This will purge all pending Celery tasks!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Purging Celery tasks..."
            cd $BACKEND_PATH
            source venv/bin/activate
            celery -A watchparty purge -f
            print_status "Tasks purged successfully"
        fi
        ;;
    
    reset-redis)
        print_warning "This will FLUSH ALL Redis databases!"
        print_warning "This includes cache, Celery queues, and session data!"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Flushing Redis databases..."
            redis-cli -p 6380 -a $REDIS_PASSWORD FLUSHALL
            print_status "Redis databases flushed"
        fi
        ;;
    
    backup-redis)
        print_status "Creating Redis backup..."
        BACKUP_DIR="/home/ubuntu/backups/redis"
        mkdir -p $BACKUP_DIR
        BACKUP_FILE="$BACKUP_DIR/redis-backup-$(date +%Y%m%d_%H%M%S).rdb"
        redis-cli -p 6380 -a $REDIS_PASSWORD --rdb $BACKUP_FILE
        print_status "Redis backup created: $BACKUP_FILE"
        ;;
    
    logs-all)
        print_header "Tailing all service logs (Ctrl+C to exit)"
        sudo journalctl -f \
            -u watch-party-backend \
            -u watch-party-celery-worker \
            -u watch-party-celery-beat \
            -u redis-watchparty \
            -u nginx
        ;;
    
    *)
        echo "Watch Party Redis & Celery Monitor"
        echo ""
        echo "Usage: $0 {command}"
        echo ""
        echo "Redis Commands:"
        echo "  redis-info      - Show Redis server information"
        echo "  redis-stats     - Show Redis statistics"
        echo "  redis-monitor   - Live Redis command monitor"
        echo "  redis-slowlog   - Show slow query log"
        echo "  redis-memory    - Memory usage analysis"
        echo "  reset-redis     - DANGER: Flush all Redis data"
        echo "  backup-redis    - Create Redis backup"
        echo ""
        echo "Celery Commands:"
        echo "  celery-workers  - Show active workers and tasks"
        echo "  celery-stats    - Show worker statistics"
        echo "  celery-queues   - Show queue status"
        echo "  purge-tasks     - Purge all pending tasks"
        echo ""
        echo "Monitoring Commands:"
        echo "  health-check    - Check all services"
        echo "  logs-all        - Tail all service logs"
        echo ""
        echo "Examples:"
        echo "  $0 health-check    # Quick health check"
        echo "  $0 redis-info      # Redis server info"
        echo "  $0 celery-workers  # Show active workers"
        exit 1
        ;;
esac

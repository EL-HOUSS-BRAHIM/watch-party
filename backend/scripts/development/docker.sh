#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - DOCKER OPERATIONS SCRIPT
# =============================================================================
# Handles Docker containerization and container management
# Author: Watch Party Team
# Version: 1.0
# Last Updated: August 11, 2025

set -e

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors and emojis
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'
readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"
readonly DOCKER="🐳"

# Logging functions
log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

# Docker configuration
IMAGE_NAME="watchparty-backend"
CONTAINER_NAME="watchparty-app"
NETWORK_NAME="watchparty-network"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        log_info "Please install Docker first: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        log_error "Docker daemon is not running"
        log_info "Please start Docker service"
        exit 1
    fi
}

check_docker_compose() {
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed"
        log_info "Please install Docker Compose"
        exit 1
    fi
}

get_docker_compose_cmd() {
    if command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    else
        echo "docker compose"
    fi
}

# =============================================================================
# DOCKERFILE CREATION
# =============================================================================

create_dockerfile() {
    log_info "Creating Dockerfile..."
    
    cat > "$PROJECT_ROOT/Dockerfile" << 'EOF'
# Multi-stage build for production optimization
FROM python:3.11-slim as builder

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    libjpeg-dev \
    libpng-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

# Create and set work directory
WORKDIR /app

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim as production

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_SETTINGS_MODULE=watchparty.settings.production

# Install system dependencies for runtime
RUN apt-get update && apt-get install -y \
    libpq5 \
    libjpeg62-turbo \
    libpng16-16 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd --create-home --shell /bin/bash watchparty

# Create app directory
WORKDIR /app

# Copy Python dependencies from builder stage
COPY --from=builder /usr/local/lib/python3.11/site-packages/ /usr/local/lib/python3.11/site-packages/
COPY --from=builder /usr/local/bin/ /usr/local/bin/

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/media /app/static && \
    chown -R watchparty:watchparty /app

# Switch to non-root user
USER watchparty

# Collect static files
RUN python manage.py collectstatic --noinput --settings=watchparty.settings.production || true

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health/ || exit 1

# Expose port
EXPOSE 8000

# Default command
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "3", "--worker-class", "gevent", "watchparty.wsgi:application"]
EOF
    
    log_success "Dockerfile created"
}

create_dockerignore() {
    log_info "Creating .dockerignore..."
    
    cat > "$PROJECT_ROOT/.dockerignore" << 'EOF'
# Version control
.git
.gitignore

# Virtual environments
venv/
env/
.env

# Python cache
__pycache__/
*.pyc
*.pyo
*.pyd
.Python
*.so
.pytest_cache/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Database
*.sqlite3
db.sqlite3

# Media files (if large)
media/

# Documentation
docs/
README.md

# Scripts
scripts/
*.sh

# Backups
backups/

# Test files
.coverage
.tox
htmlcov/

# Node modules (if any)
node_modules/

# Temporary files
tmp/
temp/
EOF
    
    log_success ".dockerignore created"
}

create_docker_compose() {
    log_info "Creating docker-compose.yml..."
    
    cat > "$PROJECT_ROOT/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: watchparty-postgres
    environment:
      POSTGRES_DB: watchparty
      POSTGRES_USER: watchparty_user
      POSTGRES_PASSWORD: watchparty_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - watchparty-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U watchparty_user -d watchparty"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: watchparty-redis
    command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - watchparty-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  web:
    build: .
    container_name: watchparty-web
    command: >
      sh -c "python manage.py migrate &&
             python manage.py collectstatic --noinput &&
             gunicorn --bind 0.0.0.0:8000 --workers 3 --worker-class gevent watchparty.wsgi:application"
    volumes:
      - static_data:/app/static
      - media_data:/app/media
      - ./logs:/app/logs
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://watchparty_user:watchparty_password@db:5432/watchparty
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
      - SECRET_KEY=your-secret-key-here-change-in-production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - watchparty-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health/"]
      interval: 30s
      timeout: 10s
      retries: 3

  celery:
    build: .
    container_name: watchparty-celery
    command: celery -A watchparty worker --loglevel=info
    volumes:
      - media_data:/app/media
      - ./logs:/app/logs
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://watchparty_user:watchparty_password@db:5432/watchparty
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
      - SECRET_KEY=your-secret-key-here-change-in-production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - watchparty-network
    restart: unless-stopped

  celery-beat:
    build: .
    container_name: watchparty-celery-beat
    command: celery -A watchparty beat --loglevel=info
    volumes:
      - ./logs:/app/logs
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://watchparty_user:watchparty_password@db:5432/watchparty
      - REDIS_URL=redis://redis:6379/0
      - CELERY_BROKER_URL=redis://redis:6379/0
      - SECRET_KEY=your-secret-key-here-change-in-production
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - watchparty-network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: watchparty-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - static_data:/var/www/static:ro
      - media_data:/var/www/media:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - web
    networks:
      - watchparty-network
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
  static_data:
  media_data:

networks:
  watchparty-network:
    driver: bridge
EOF
    
    log_success "docker-compose.yml created"
}

create_docker_compose_dev() {
    log_info "Creating docker-compose.dev.yml for development..."
    
    cat > "$PROJECT_ROOT/docker-compose.dev.yml" << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:15
    container_name: watchparty-postgres-dev
    environment:
      POSTGRES_DB: watchparty_dev
      POSTGRES_USER: watchparty_user
      POSTGRES_PASSWORD: watchparty_password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - watchparty-dev-network

  redis:
    image: redis:7-alpine
    container_name: watchparty-redis-dev
    ports:
      - "6379:6379"
    networks:
      - watchparty-dev-network

  web:
    build:
      context: .
      target: builder
    container_name: watchparty-web-dev
    command: python manage.py runserver 0.0.0.0:8000
    volumes:
      - .:/app
      - /app/__pycache__
    ports:
      - "8000:8000"
    environment:
      - DEBUG=True
      - DATABASE_URL=postgresql://watchparty_user:watchparty_password@db:5432/watchparty_dev
      - REDIS_URL=redis://redis:6379/0
      - SECRET_KEY=dev-secret-key-not-for-production
    depends_on:
      - db
      - redis
    networks:
      - watchparty-dev-network

volumes:
  postgres_dev_data:

networks:
  watchparty-dev-network:
    driver: bridge
EOF
    
    log_success "docker-compose.dev.yml created"
}

create_nginx_config() {
    log_info "Creating Nginx configuration for Docker..."
    
    mkdir -p "$PROJECT_ROOT/nginx/conf.d"
    
    cat > "$PROJECT_ROOT/nginx/nginx.conf" << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # Include additional configurations
    include /etc/nginx/conf.d/*.conf;
}
EOF
    
    cat > "$PROJECT_ROOT/nginx/conf.d/watchparty.conf" << 'EOF'
upstream watchparty_backend {
    server web:8000;
}

server {
    listen 80;
    server_name localhost;

    client_max_body_size 100M;

    # Static files
    location /static/ {
        alias /var/www/static/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /var/www/media/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # WebSocket support
    location /ws/ {
        proxy_pass http://watchparty_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Django application
    location / {
        proxy_pass http://watchparty_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Rate limiting
        limit_req zone=api burst=20 nodelay;
    }
}
EOF
    
    log_success "Nginx configuration created"
}

# =============================================================================
# DOCKER OPERATIONS
# =============================================================================

build_image() {
    local tag="${1:-latest}"
    
    log_info "Building Docker image: $IMAGE_NAME:$tag"
    
    cd "$PROJECT_ROOT"
    docker build -t "$IMAGE_NAME:$tag" .
    
    log_success "Docker image built successfully"
}

run_container() {
    local mode="${1:-production}"
    
    if [[ "$mode" == "dev" || "$mode" == "development" ]]; then
        log_info "Starting development environment..."
        
        local compose_cmd
        compose_cmd=$(get_docker_compose_cmd)
        
        $compose_cmd -f docker-compose.dev.yml up -d
        
        log_success "Development environment started"
        log_info "Application available at: http://localhost:8000"
        log_info "PostgreSQL available at: localhost:5432"
        log_info "Redis available at: localhost:6379"
        
    else
        log_info "Starting production environment..."
        
        local compose_cmd
        compose_cmd=$(get_docker_compose_cmd)
        
        $compose_cmd up -d
        
        log_success "Production environment started"
        log_info "Application available at: http://localhost"
    fi
}

stop_containers() {
    local mode="${1:-production}"
    
    log_info "Stopping containers..."
    
    local compose_cmd
    compose_cmd=$(get_docker_compose_cmd)
    
    if [[ "$mode" == "dev" || "$mode" == "development" ]]; then
        $compose_cmd -f docker-compose.dev.yml down
    else
        $compose_cmd down
    fi
    
    log_success "Containers stopped"
}

restart_containers() {
    local mode="${1:-production}"
    
    stop_containers "$mode"
    run_container "$mode"
}

show_logs() {
    local service="${1:-web}"
    local follow="${2:-false}"
    
    local compose_cmd
    compose_cmd=$(get_docker_compose_cmd)
    
    if [[ "$follow" == "true" || "$follow" == "-f" ]]; then
        $compose_cmd logs -f "$service"
    else
        $compose_cmd logs "$service"
    fi
}

show_status() {
    log_info "Docker container status:"
    
    local compose_cmd
    compose_cmd=$(get_docker_compose_cmd)
    
    echo
    echo "Production containers:"
    $compose_cmd ps 2>/dev/null || echo "No production containers running"
    
    echo
    echo "Development containers:"
    $compose_cmd -f docker-compose.dev.yml ps 2>/dev/null || echo "No development containers running"
    
    echo
    echo "Docker images:"
    docker images | grep -E "(watchparty|postgres|redis|nginx)" || echo "No watchparty images found"
}

clean_docker() {
    log_warning "Cleaning Docker resources..."
    
    if [[ "${FORCE:-false}" != "true" ]]; then
        echo -n "This will remove all stopped containers, unused networks, and dangling images. Continue? (y/N): "
        read -r confirm
        if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
            log_info "Docker cleanup cancelled"
            return 0
        fi
    fi
    
    # Stop all containers
    stop_containers "production" 2>/dev/null || true
    stop_containers "development" 2>/dev/null || true
    
    # Clean Docker system
    docker system prune -f
    
    # Remove volumes if requested
    if [[ "${REMOVE_VOLUMES:-false}" == "true" ]]; then
        log_warning "Removing Docker volumes..."
        docker volume prune -f
    fi
    
    log_success "Docker cleanup completed"
}

exec_container() {
    local service="${1:-web}"
    local command="${2:-bash}"
    
    local compose_cmd
    compose_cmd=$(get_docker_compose_cmd)
    
    if $compose_cmd ps | grep -q "$service"; then
        $compose_cmd exec "$service" "$command"
    else
        log_error "Service '$service' is not running"
        return 1
    fi
}

# =============================================================================
# ENVIRONMENT SETUP
# =============================================================================

setup_docker_env() {
    log_info "Setting up Docker environment..."
    
    create_dockerfile
    create_dockerignore
    create_docker_compose
    create_docker_compose_dev
    create_nginx_config
    
    log_success "Docker environment setup completed"
    log_info "Next steps:"
    echo "  1. Build image: ./manage.sh docker build"
    echo "  2. Start development: ./manage.sh docker dev"
    echo "  3. Start production: ./manage.sh docker up"
}

# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

show_help() {
    echo "Watch Party Docker Operations Script"
    echo
    echo "USAGE:"
    echo "  $0 [COMMAND] [OPTIONS]"
    echo
    echo "SETUP COMMANDS:"
    echo "  setup              Setup Docker environment (create all config files)"
    echo "  build [tag]        Build Docker image"
    echo
    echo "CONTAINER COMMANDS:"
    echo "  up [mode]          Start containers (mode: production|dev)"
    echo "  down [mode]        Stop containers"
    echo "  restart [mode]     Restart containers"
    echo "  status             Show container status"
    echo
    echo "DEVELOPMENT COMMANDS:"
    echo "  dev                Start development environment"
    echo "  prod               Start production environment"
    echo "  logs [service]     Show container logs"
    echo "  exec [service]     Execute command in container"
    echo "  shell [service]    Open shell in container"
    echo
    echo "MAINTENANCE COMMANDS:"
    echo "  clean              Clean Docker resources"
    echo "  prune              Remove unused Docker objects"
    echo "  reset              Reset entire Docker environment"
    echo
    echo "EXAMPLES:"
    echo "  $0 setup           # Setup Docker environment"
    echo "  $0 build latest    # Build with 'latest' tag"
    echo "  $0 dev             # Start development environment"
    echo "  $0 logs web -f     # Follow web service logs"
    echo "  $0 exec web bash   # Open bash in web container"
}

main() {
    check_docker
    
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        setup)
            setup_docker_env
            ;;
        build)
            build_image "$@"
            ;;
        up|start)
            run_container "$@"
            ;;
        down|stop)
            stop_containers "$@"
            ;;
        restart)
            restart_containers "$@"
            ;;
        dev|development)
            run_container "dev"
            ;;
        prod|production)
            run_container "production"
            ;;
        logs)
            show_logs "$@"
            ;;
        exec)
            exec_container "$@"
            ;;
        shell)
            exec_container "${1:-web}" "bash"
            ;;
        status|ps)
            show_status
            ;;
        clean)
            clean_docker
            ;;
        prune)
            docker system prune -f
            ;;
        reset)
            FORCE=true REMOVE_VOLUMES=true clean_docker
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            log_error "Unknown command: $command"
            show_help
            exit 1
            ;;
    esac
}

# Only run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

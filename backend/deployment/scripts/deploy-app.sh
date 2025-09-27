#!/bin/bash
set -euo pipefail

# Watch Party Backend - Application Deployment Script
# Deploys the application using PM2 with optimized configuration

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
PROJECT_DIR="/opt/watch-party-backend"
DEPLOY_USER="ubuntu"

# Ensure we're in the project directory
cd $PROJECT_DIR

log_info "Starting application deployment..."

# Ensure .env file exists
if [ ! -f ".env" ]; then
    log_error ".env file not found! Please create it from .env.example"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Activate virtual environment
log_info "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
log_info "Installing Python dependencies..."
pip install -r requirements.txt
pip install 'requests==2.31.0' 'psycopg2-binary' 'drf-spectacular[sidecar]'

# Create optimized startup scripts
log_info "Creating optimized startup scripts..."

# Django startup script (optimized for t2.micro)
cat > start-django.sh << 'EOF'
#!/bin/bash
cd /opt/watch-party-backend
source venv/bin/activate
set -a && source .env && set +a
exec gunicorn \
    --workers 2 \
    --worker-class gevent \
    --worker-connections 100 \
    --bind 127.0.0.1:8000 \
    --timeout 120 \
    --keep-alive 5 \
    --preload \
    --access-logfile /var/log/watchparty/gunicorn_access.log \
    --error-logfile /var/log/watchparty/gunicorn_error.log \
    config.wsgi:application
EOF

# Celery worker script (optimized)
cat > start-celery-worker.sh << 'EOF'
#!/bin/bash
cd /opt/watch-party-backend
source venv/bin/activate
set -a && source .env && set +a
exec celery -A config worker -l info --concurrency=1
EOF

# Celery beat script
cat > start-celery-beat.sh << 'EOF'
#!/bin/bash
cd /opt/watch-party-backend
source venv/bin/activate
set -a && source .env && set +a
exec celery -A config beat -l info --scheduler django_celery_beat.schedulers:DatabaseScheduler
EOF

# Daphne ASGI server script
cat > start-daphne.sh << 'EOF'
#!/bin/bash
cd /opt/watch-party-backend
source venv/bin/activate
set -a && source .env && set +a
exec daphne -b 127.0.0.1 -p 8002 --access-log /var/log/watchparty/daphne_access.log config.asgi:application
EOF

# Make scripts executable
chmod +x start-*.sh

# Create PM2 ecosystem configuration
log_info "Creating PM2 configuration..."
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'watchparty-django',
      script: './start-django.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      log_file: '/var/log/watchparty/pm2_django.log',
      out_file: '/var/log/watchparty/pm2_django_out.log',
      error_file: '/var/log/watchparty/pm2_django_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      env: {
        NODE_ENV: 'production'
      }
    },
    {
      name: 'watchparty-daphne',
      script: './start-daphne.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M',
      log_file: '/var/log/watchparty/pm2_daphne.log',
      out_file: '/var/log/watchparty/pm2_daphne_out.log',
      error_file: '/var/log/watchparty/pm2_daphne_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'watchparty-celery-worker',
      script: './start-celery-worker.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '400M',
      log_file: '/var/log/watchparty/pm2_celery_worker.log',
      out_file: '/var/log/watchparty/pm2_celery_worker_out.log',
      error_file: '/var/log/watchparty/pm2_celery_worker_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    },
    {
      name: 'watchparty-celery-beat',
      script: './start-celery-beat.sh',
      cwd: '/opt/watch-party-backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '200M',
      log_file: '/var/log/watchparty/pm2_celery_beat.log',
      out_file: '/var/log/watchparty/pm2_celery_beat_out.log',
      error_file: '/var/log/watchparty/pm2_celery_beat_error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
EOF

# Run Django setup commands
log_info "Running Django setup commands..."
python manage.py collectstatic --noinput || log_warning "Static files collection failed"
python manage.py migrate || log_warning "Database migrations failed"

# Stop existing PM2 processes
log_info "Stopping existing PM2 processes..."
pm2 delete all 2>/dev/null || true

# Start PM2 processes
log_info "Starting PM2 processes..."
pm2 start ecosystem.config.js

# Save PM2 configuration
log_info "Saving PM2 configuration..."
pm2 save

# Show PM2 status
log_info "PM2 process status:"
pm2 status

log_success "Application deployment completed!"
log_info "Services are now running with PM2"
log_info "Check logs with: pm2 logs"
log_info "Monitor with: pm2 monit"
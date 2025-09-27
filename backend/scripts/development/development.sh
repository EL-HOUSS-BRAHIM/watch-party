#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - DEVELOPMENT SCRIPT
# =============================================================================
# Handle all development-related operations

set -e

# Import common functions if available
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Change to project root
cd "$PROJECT_ROOT"

# Check virtual environment
check_venv() {
    if [[ "$VIRTUAL_ENV" == "" ]]; then
        log_warning "Virtual environment not activated"
        if [[ -f "venv/bin/activate" ]]; then
            log_info "Activating virtual environment..."
            source venv/bin/activate
        elif [[ -f "activate_venv.sh" ]]; then
            log_info "Using activate_venv.sh..."
            source activate_venv.sh
        else
            log_error "No virtual environment found. Run './manage.sh setup' first"
            exit 1
        fi
    fi
}

# Start development server
start_dev_server() {
    check_venv
    
    log_info "Starting Django development server..."
    
    # Set environment
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    # Check migrations
    log_info "Checking migrations..."
    python manage.py migrate --check --verbosity=0 &>/dev/null || {
        log_warning "Running migrations..."
        python manage.py migrate
    }
    
    # Collect static files
    log_info "Collecting static files..."
    python manage.py collectstatic --noinput --clear --verbosity=0 &>/dev/null || true
    
    log_success "Starting server at http://localhost:8000"
    log_info "API available at: http://localhost:8000/api/"
    log_info "Admin available at: http://localhost:8000/admin/"
    log_info "API docs available at: http://localhost:8000/api/docs/"
    
    exec python manage.py runserver 0.0.0.0:8000
}

# Start development server with WebSocket support
start_dev_server_ws() {
    check_venv
    
    log_info "Starting Django server with WebSocket support..."
    
    # Set environment
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    # Install daphne if needed
    pip show daphne &>/dev/null || {
        log_info "Installing daphne..."
        pip install daphne==4.0.0
    }
    
    # Check migrations
    log_info "Checking migrations..."
    python manage.py migrate --check --verbosity=0 &>/dev/null || {
        log_warning "Running migrations..."
        python manage.py migrate
    }
    
    # Collect static files
    log_info "Collecting static files..."
    python manage.py collectstatic --noinput --clear --verbosity=0 &>/dev/null || true
    
    log_success "Starting ASGI server with WebSocket support"
    log_info "Server available at: http://localhost:8000"
    log_info "WebSocket available at: ws://localhost:8000/ws/"
    
    exec daphne -b 0.0.0.0 -p 8000 watchparty.asgi:application
}

# Open Django shell
open_shell() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    log_info "Opening Django shell..."
    python manage.py shell
}

# Open database shell
open_dbshell() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    log_info "Opening database shell..."
    python manage.py dbshell
}

# Run tests
run_tests() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.testing
    
    local test_args=("$@")
    
    log_info "Running tests..."
    
    # Install test dependencies if needed
    pip show coverage &>/dev/null || {
        log_info "Installing test dependencies..."
        pip install coverage pytest-django
    }
    
    if [[ ${#test_args[@]} -eq 0 ]]; then
        # Run all tests with coverage
        log_info "Running all tests with coverage..."
        coverage run --source='.' manage.py test --verbosity=2
        coverage report --show-missing
        coverage html
        log_success "Coverage report generated in htmlcov/"
    else
        # Run specific tests
        log_info "Running specific tests: ${test_args[*]}"
        python manage.py test "${test_args[@]}" --verbosity=2
    fi
}

# Run migrations
run_migrations() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    if [[ "$1" == "--fake" ]]; then
        log_info "Running fake migrations..."
        python manage.py migrate --fake
    elif [[ "$1" == "--check" ]]; then
        log_info "Checking migration status..."
        python manage.py showmigrations
    else
        log_info "Running database migrations..."
        python manage.py migrate --verbosity=2
    fi
}

# Create migrations
make_migrations() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    local apps=("$@")
    
    if [[ ${#apps[@]} -eq 0 ]]; then
        log_info "Creating migrations for all apps..."
        python manage.py makemigrations --verbosity=2
    else
        log_info "Creating migrations for: ${apps[*]}"
        python manage.py makemigrations "${apps[@]}" --verbosity=2
    fi
    
    # Show what was created
    log_info "Recent migrations:"
    find apps/*/migrations/ -name "*.py" -not -name "__init__.py" -newer manage.py | sort
}

# Collect static files
collect_static() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    log_info "Collecting static files..."
    python manage.py collectstatic --noinput --clear --verbosity=2
    log_success "Static files collected"
}

# Create superuser
create_superuser() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    log_info "Creating Django superuser..."
    python manage.py createsuperuser
}

# Reset database and start fresh
reset_project() {
    check_venv
    
    if [[ "$FORCE" != "true" ]]; then
        echo -e "${YELLOW}⚠️  This will delete all data and reset the database!${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Reset cancelled"
            return 0
        fi
    fi
    
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    # Remove database
    log_info "Removing database..."
    rm -f db.sqlite3
    
    # Remove migration files (except __init__.py)
    log_info "Removing migration files..."
    find apps/*/migrations/ -name "*.py" -not -name "__init__.py" -delete 2>/dev/null || true
    
    # Remove static files
    log_info "Removing static files..."
    rm -rf staticfiles/ static/ 2>/dev/null || true
    
    # Remove cache files
    log_info "Removing cache files..."
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Create new migrations
    log_info "Creating fresh migrations..."
    python manage.py makemigrations
    
    # Run migrations
    log_info "Running migrations..."
    python manage.py migrate
    
    # Collect static files
    log_info "Collecting static files..."
    python manage.py collectstatic --noinput
    
    log_success "Project reset completed!"
    log_info "You may want to create a superuser: python manage.py createsuperuser"
}

# Load sample data
load_sample_data() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    log_info "Loading sample data..."
    
    # Check if fixtures exist
    if [[ -d "fixtures" ]]; then
        python manage.py loaddata fixtures/*.json
        log_success "Sample data loaded"
    else
        log_warning "No fixtures directory found"
        log_info "Creating sample data programmatically..."
        
        python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
from apps.users.models import UserProfile
from apps.parties.models import WatchParty
from apps.videos.models import Video
import os

User = get_user_model()

# Create sample users
print("Creating sample users...")
admin_user, created = User.objects.get_or_create(
    username='admin',
    defaults={
        'email': 'admin@watchparty.com',
        'is_staff': True,
        'is_superuser': True
    }
)
if created:
    admin_user.set_password('admin123')
    admin_user.save()
    print(f"Created admin user: {admin_user.username}")

demo_user, created = User.objects.get_or_create(
    username='demo',
    defaults={
        'email': 'demo@watchparty.com',
        'first_name': 'Demo',
        'last_name': 'User'
    }
)
if created:
    demo_user.set_password('demo123')
    demo_user.save()
    print(f"Created demo user: {demo_user.username}")

print("Sample data creation completed!")
print("Login credentials:")
print("  Admin: admin / admin123")
print("  Demo: demo / demo123")
EOF
        
        log_success "Sample data created programmatically"
    fi
}

# Django management command wrapper
django_command() {
    check_venv
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    log_info "Running Django command: manage.py $*"
    python manage.py "$@"
}

# Development server monitor
monitor_dev() {
    log_info "Starting development monitor..."
    log_info "Monitoring files for changes..."
    
    # Install watchdog if available
    pip show watchdog &>/dev/null || {
        log_info "Installing watchdog for file monitoring..."
        pip install watchdog
    }
    
    python -c "
import time
import os
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.is_directory:
            return
        if event.src_path.endswith(('.py', '.html', '.css', '.js')):
            print(f'Modified: {event.src_path}')

observer = Observer()
observer.schedule(ChangeHandler(), '.', recursive=True)
observer.start()

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    observer.stop()
observer.join()
"
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        start|dev)
            start_dev_server "$@"
            ;;
        start-ws|dev-ws)
            start_dev_server_ws "$@"
            ;;
        shell)
            open_shell "$@"
            ;;
        dbshell)
            open_dbshell "$@"
            ;;
        test|tests)
            run_tests "$@"
            ;;
        migrate)
            run_migrations "$@"
            ;;
        makemigrations)
            make_migrations "$@"
            ;;
        collectstatic)
            collect_static "$@"
            ;;
        createsuperuser)
            create_superuser "$@"
            ;;
        reset)
            reset_project "$@"
            ;;
        loaddata|sample-data)
            load_sample_data "$@"
            ;;
        monitor)
            monitor_dev "$@"
            ;;
        manage|cmd)
            django_command "$@"
            ;;
        help|--help|-h)
            echo "Development Script Commands:"
            echo "  start, dev              Start development server"
            echo "  start-ws, dev-ws        Start server with WebSocket support"
            echo "  shell                   Open Django shell"
            echo "  dbshell                 Open database shell"
            echo "  test                    Run tests"
            echo "  migrate                 Run migrations"
            echo "  makemigrations          Create new migrations"
            echo "  collectstatic           Collect static files"
            echo "  createsuperuser         Create superuser"
            echo "  reset                   Reset database"
            echo "  loaddata, sample-data   Load sample data"
            echo "  monitor                 Monitor files for changes"
            echo "  manage, cmd             Run Django management command"
            ;;
        *)
            log_error "Unknown development command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

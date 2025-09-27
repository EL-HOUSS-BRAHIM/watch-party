#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - PROJECT SETUP SCRIPT
# =============================================================================
# Handle project setup and installation

set -e

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

# Check Python version
check_python() {
    log_info "Checking Python version..."
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        log_info "Please install Python 3.8+ and try again"
        exit 1
    fi
    
    local python_version=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
    local min_version="3.8"
    
    if [[ "$(printf '%s\n' "$min_version" "$python_version" | sort -V | head -n1)" != "$min_version" ]]; then
        log_error "Python $python_version is too old. Minimum required: $min_version"
        exit 1
    fi
    
    log_success "Python $python_version is compatible"
}

# Setup virtual environment
setup_venv() {
    log_info "Setting up virtual environment..."
    
    if [[ -d "venv" ]]; then
        log_warning "Virtual environment already exists"
        read -p "Remove existing venv and create new one? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            rm -rf venv
        else
            log_info "Using existing virtual environment"
            return 0
        fi
    fi
    
    python3 -m venv venv
    source venv/bin/activate
    
    # Upgrade pip
    log_info "Upgrading pip..."
    pip install --upgrade pip
    
    log_success "Virtual environment created"
}

# Install Python dependencies
install_dependencies() {
    log_info "Installing Python dependencies..."
    
    # Activate virtual environment
    if [[ -f "venv/bin/activate" ]]; then
        source venv/bin/activate
    else
        log_error "Virtual environment not found. Run setup first."
        exit 1
    fi
    
    # Install requirements
    if [[ -f "requirements.txt" ]]; then
        pip install -r requirements.txt
        log_success "Dependencies installed from requirements.txt"
    else
        log_warning "requirements.txt not found, installing basic dependencies..."
        pip install django djangorestframework django-cors-headers
        pip install psycopg2-binary redis celery
        pip install daphne channels channels-redis
        pip install gunicorn whitenoise
        log_success "Basic dependencies installed"
    fi
    
    # Install development dependencies
    log_info "Installing development dependencies..."
    pip install black flake8 isort coverage pytest-django
    pip install watchdog  # For file monitoring
    
    # Create/update requirements file
    pip freeze > requirements.txt
    log_success "requirements.txt updated"
}

# Setup environment configuration
setup_environment() {
    log_info "Setting up environment configuration..."
    
    if [[ ! -f ".env" ]]; then
        if [[ -f ".env.example" ]]; then
            cp .env.example .env
            log_success "Environment file created from .env.example"
            log_warning "Please edit .env file with your configuration"
        else
            log_info "Creating basic .env file..."
            cat > .env << 'EOF'
# Basic Django Configuration
DEBUG=True
SECRET_KEY=django-insecure-please-change-this-in-production
DJANGO_SETTINGS_MODULE=watchparty.settings.development

# Database
DATABASE_URL=sqlite:///db.sqlite3

# Redis
REDIS_URL=redis://localhost:6379/0

# Security
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Development settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
EOF
            log_success "Basic .env file created"
        fi
    else
        log_warning ".env file already exists"
    fi
}

# Setup database
setup_database() {
    log_info "Setting up database..."
    
    # Activate virtual environment
    source venv/bin/activate
    
    # Set Django settings
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    # Check if manage.py exists
    if [[ ! -f "manage.py" ]]; then
        log_error "manage.py not found. This might not be a Django project."
        exit 1
    fi
    
    # Create migrations
    log_info "Creating initial migrations..."
    python manage.py makemigrations
    
    # Run migrations
    log_info "Running database migrations..."
    python manage.py migrate
    
    log_success "Database setup completed"
}

# Collect static files
setup_static_files() {
    log_info "Setting up static files..."
    
    source venv/bin/activate
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    # Create directories
    mkdir -p static staticfiles media logs
    
    # Collect static files
    python manage.py collectstatic --noinput --clear
    
    log_success "Static files collected"
}

# Create superuser
create_superuser() {
    log_info "Creating Django superuser..."
    
    source venv/bin/activate
    export DJANGO_SETTINGS_MODULE=watchparty.settings.development
    
    if [[ "$FORCE" == "true" ]]; then
        # Create superuser with default credentials
        python manage.py shell << 'EOF'
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@watchparty.com', 'admin123')
    print("Superuser created: admin / admin123")
else:
    print("Superuser already exists")
EOF
    else
        python manage.py createsuperuser
    fi
    
    log_success "Superuser created"
}

# Setup development tools
setup_dev_tools() {
    log_info "Setting up development tools..."
    
    # Create pre-commit hook
    if [[ -d ".git" ]]; then
        cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Watch Party Backend Pre-commit Hook

echo "Running pre-commit checks..."

# Format code with black
echo "Formatting code with black..."
source venv/bin/activate
black --check . || {
    echo "Code formatting issues found. Run: black ."
    exit 1
}

# Check imports with isort
echo "Checking imports with isort..."
isort --check-only . || {
    echo "Import sorting issues found. Run: isort ."
    exit 1
}

# Run flake8
echo "Running flake8..."
flake8 . || {
    echo "Code style issues found. Please fix and try again."
    exit 1
}

echo "Pre-commit checks passed!"
EOF
        chmod +x .git/hooks/pre-commit
        log_success "Git pre-commit hook installed"
    fi
    
    # Create development configuration files
    cat > .flake8 << 'EOF'
[flake8]
max-line-length = 88
extend-ignore = E203, W503
exclude = venv, migrations, __pycache__
EOF

    cat > pyproject.toml << 'EOF'
[tool.black]
line-length = 88
target-version = ['py38']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
  | migrations
)/
'''

[tool.isort]
profile = "black"
multi_line_output = 3
line_length = 88
skip = ["venv", "migrations"]
EOF
    
    log_success "Development tools configured"
}

# Full project setup
full_setup() {
    log_info "Starting full project setup..."
    echo
    
    check_python
    setup_venv
    install_dependencies
    setup_environment
    setup_database
    setup_static_files
    setup_dev_tools
    
    # Optionally create superuser
    if [[ "$1" == "--with-superuser" ]] || [[ "$FORCE" == "true" ]]; then
        create_superuser
    else
        echo
        read -p "Create superuser now? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            create_superuser
        fi
    fi
    
    echo
    log_success "Project setup completed!"
    echo
    echo "🎉 Watch Party Backend is ready!"
    echo
    echo "Next steps:"
    echo "  1. Review and edit .env file with your configuration"
    echo "  2. Start development server: ./manage.sh dev"
    echo "  3. Visit: http://localhost:8000"
    echo "  4. Admin interface: http://localhost:8000/admin/"
    echo "  5. API docs: http://localhost:8000/api/docs/"
    echo
    
    if [[ ! "$REPLY" =~ ^[Yy]$ ]] && [[ "$FORCE" != "true" ]]; then
        log_info "To create a superuser later: ./manage.sh createsuperuser"
    fi
}

# Quick install (dependencies only)
quick_install() {
    log_info "Quick installation (dependencies only)..."
    
    check_python
    
    if [[ ! -d "venv" ]]; then
        setup_venv
    else
        source venv/bin/activate
    fi
    
    install_dependencies
    
    log_success "Dependencies installed!"
    log_info "Run './manage.sh setup' for full project setup"
}

# Update dependencies
update_dependencies() {
    log_info "Updating dependencies..."
    
    if [[ ! -d "venv" ]]; then
        log_error "Virtual environment not found. Run setup first."
        exit 1
    fi
    
    source venv/bin/activate
    
    # Update pip
    pip install --upgrade pip
    
    # Update all packages
    if [[ -f "requirements.txt" ]]; then
        pip install --upgrade -r requirements.txt
        pip freeze > requirements.txt
        log_success "Dependencies updated"
    else
        log_error "requirements.txt not found"
        exit 1
    fi
}

# Reset setup (clean and setup again)
reset_setup() {
    if [[ "$FORCE" != "true" ]]; then
        echo -e "${YELLOW}⚠️  This will remove virtual environment and reset setup${NC}"
        read -p "Are you sure? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log_info "Reset cancelled"
            return 0
        fi
    fi
    
    log_info "Resetting project setup..."
    
    # Remove virtual environment
    rm -rf venv
    
    # Remove generated files
    rm -f requirements.txt .flake8 pyproject.toml
    
    # Reset database
    rm -f db.sqlite3
    
    # Clean cache
    find . -name "*.pyc" -delete 2>/dev/null || true
    find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
    
    # Run full setup
    full_setup "$@"
}

# Main command handler
main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        full-setup|setup)
            full_setup "$@"
            ;;
        install|deps)
            quick_install "$@"
            ;;
        update|upgrade)
            update_dependencies "$@"
            ;;
        venv|virtualenv)
            setup_venv "$@"
            ;;
        env|environment)
            setup_environment "$@"
            ;;
        database|db)
            setup_database "$@"
            ;;
        static)
            setup_static_files "$@"
            ;;
        superuser)
            create_superuser "$@"
            ;;
        dev-tools|tools)
            setup_dev_tools "$@"
            ;;
        reset)
            reset_setup "$@"
            ;;
        help|--help|-h)
            echo "Setup Script Commands:"
            echo "  full-setup, setup       Complete project setup"
            echo "    --with-superuser      Create superuser automatically"
            echo "  install, deps           Install dependencies only"
            echo "  update, upgrade         Update all dependencies"
            echo "  venv, virtualenv        Setup virtual environment"
            echo "  env, environment        Setup environment configuration"
            echo "  database, db            Setup database"
            echo "  static                  Setup static files"
            echo "  superuser               Create Django superuser"
            echo "  dev-tools, tools        Setup development tools"
            echo "  reset                   Reset and setup again"
            ;;
        *)
            log_error "Unknown setup command: $command"
            exit 1
            ;;
    esac
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

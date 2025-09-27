#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - ENVIRONMENT MANAGEMENT SCRIPT
# =============================================================================
# Handles virtual environment setup and Python environment management
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
readonly PYTHON="🐍"

# Logging functions
log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

# Environment configuration
VENV_DIR="$PROJECT_ROOT/venv"
PYTHON_VERSION="3.11"
REQUIREMENTS_FILE="$PROJECT_ROOT/requirements.txt"

# =============================================================================
# UTILITY FUNCTIONS
# =============================================================================

check_python() {
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        log_info "Please install Python 3.8 or higher"
        exit 1
    fi
    
    local python_version
    python_version=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
    local major_version
    major_version=$(echo "$python_version" | cut -d'.' -f1)
    local minor_version
    minor_version=$(echo "$python_version" | cut -d'.' -f2)
    
    if [[ "$major_version" -lt 3 ]] || [[ "$major_version" -eq 3 && "$minor_version" -lt 8 ]]; then
        log_error "Python $python_version is not supported. Please install Python 3.8 or higher"
        exit 1
    fi
    
    log_info "Using Python $python_version"
}

check_venv_module() {
    if ! python3 -m venv --help &> /dev/null; then
        log_error "Python venv module is not available"
        log_info "Please install python3-venv package"
        exit 1
    fi
}

get_venv_python() {
    if [[ -f "$VENV_DIR/bin/python" ]]; then
        echo "$VENV_DIR/bin/python"
    else
        echo "python3"
    fi
}

get_venv_pip() {
    if [[ -f "$VENV_DIR/bin/pip" ]]; then
        echo "$VENV_DIR/bin/pip"
    else
        echo "pip3"
    fi
}

is_venv_active() {
    [[ -n "${VIRTUAL_ENV:-}" ]] && [[ "$VIRTUAL_ENV" == "$VENV_DIR" ]]
}

venv_exists() {
    [[ -d "$VENV_DIR" ]] && [[ -f "$VENV_DIR/bin/python" ]]
}

# =============================================================================
# VIRTUAL ENVIRONMENT MANAGEMENT
# =============================================================================

create_venv() {
    log_info "Creating virtual environment..."
    
    check_python
    check_venv_module
    
    if venv_exists; then
        log_warning "Virtual environment already exists at $VENV_DIR"
        if [[ "${FORCE:-false}" != "true" ]]; then
            echo -n "Recreate virtual environment? (y/N): "
            read -r recreate
            if [[ "$recreate" != "y" && "$recreate" != "Y" ]]; then
                log_info "Virtual environment creation skipped"
                return 0
            fi
        fi
        remove_venv
    fi
    
    # Create virtual environment
    python3 -m venv "$VENV_DIR"
    
    # Upgrade pip
    "$VENV_DIR/bin/python" -m pip install --upgrade pip setuptools wheel
    
    log_success "Virtual environment created at $VENV_DIR"
}

activate_venv() {
    if ! venv_exists; then
        log_error "Virtual environment does not exist. Create it first with: ./manage.sh env create"
        exit 1
    fi
    
    if is_venv_active; then
        log_info "Virtual environment is already active"
        return 0
    fi
    
    log_info "To activate the virtual environment, run:"
    echo "source $VENV_DIR/bin/activate"
    
    # For scripts that source this file
    if [[ "${BASH_SOURCE[0]}" != "${0}" ]]; then
        source "$VENV_DIR/bin/activate"
        log_success "Virtual environment activated"
    fi
}

deactivate_venv() {
    if is_venv_active; then
        deactivate
        log_success "Virtual environment deactivated"
    else
        log_info "Virtual environment is not active"
    fi
}

remove_venv() {
    if venv_exists; then
        log_warning "Removing virtual environment..."
        rm -rf "$VENV_DIR"
        log_success "Virtual environment removed"
    else
        log_info "Virtual environment does not exist"
    fi
}

# =============================================================================
# DEPENDENCY MANAGEMENT
# =============================================================================

install_dependencies() {
    local dev_deps="${1:-false}"
    
    if ! venv_exists; then
        log_error "Virtual environment does not exist. Create it first."
        exit 1
    fi
    
    local pip_cmd
    pip_cmd=$(get_venv_pip)
    
    log_info "Installing dependencies..."
    
    # Install production dependencies
    if [[ -f "$REQUIREMENTS_FILE" ]]; then
        $pip_cmd install -r "$REQUIREMENTS_FILE"
        log_success "Production dependencies installed"
    else
        log_warning "requirements.txt not found"
    fi
    
    # Install development dependencies
    if [[ "$dev_deps" == "true" ]]; then
        local dev_requirements="$PROJECT_ROOT/requirements-dev.txt"
        if [[ -f "$dev_requirements" ]]; then
            $pip_cmd install -r "$dev_requirements"
            log_success "Development dependencies installed"
        else
            log_info "Creating development requirements..."
            create_dev_requirements
            $pip_cmd install -r "$dev_requirements"
        fi
    fi
}

create_dev_requirements() {
    log_info "Creating development requirements..."
    
    cat > "$PROJECT_ROOT/requirements-dev.txt" << 'EOF'
# Development tools
pytest>=7.0.0
pytest-django>=4.5.0
pytest-cov>=4.0.0
black>=22.0.0
flake8>=5.0.0
isort>=5.10.0
mypy>=0.991
pre-commit>=2.20.0

# Testing
factory-boy>=3.2.0
faker>=15.0.0
responses>=0.21.0

# Documentation
sphinx>=5.0.0
sphinx-rtd-theme>=1.0.0

# Debugging
django-debug-toolbar>=3.7.0
django-extensions>=3.2.0
ipython>=8.5.0

# Code quality
bandit>=1.7.0
safety>=2.2.0
vulture>=2.6.0
EOF
    
    log_success "Development requirements created"
}

freeze_requirements() {
    if ! venv_exists; then
        log_error "Virtual environment does not exist"
        exit 1
    fi
    
    local pip_cmd
    pip_cmd=$(get_venv_pip)
    
    log_info "Freezing current dependencies..."
    
    $pip_cmd freeze > "$REQUIREMENTS_FILE"
    
    log_success "Dependencies frozen to $REQUIREMENTS_FILE"
}

update_dependencies() {
    if ! venv_exists; then
        log_error "Virtual environment does not exist"
        exit 1
    fi
    
    local pip_cmd
    pip_cmd=$(get_venv_pip)
    
    log_info "Updating dependencies..."
    
    # Update pip first
    $pip_cmd install --upgrade pip setuptools wheel
    
    # Update all packages
    $pip_cmd list --outdated --format=freeze | grep -v '^\-e' | cut -d = -f 1 | xargs -n1 $pip_cmd install -U
    
    log_success "Dependencies updated"
}

# =============================================================================
# ENVIRONMENT INFORMATION
# =============================================================================

show_env_info() {
    echo -e "${BLUE}${PYTHON} Python Environment Information:${NC}"
    echo
    
    # Python version
    echo "Python Version:"
    if venv_exists; then
        $(get_venv_python) --version
    else
        python3 --version 2>/dev/null || echo "Python not available"
    fi
    echo
    
    # Virtual environment status
    echo "Virtual Environment:"
    if venv_exists; then
        echo "  Path: $VENV_DIR"
        echo "  Status: $(is_venv_active && echo "Active" || echo "Inactive")"
        echo "  Python: $(get_venv_python)"
        echo "  Pip: $(get_venv_pip)"
    else
        echo "  Status: Not created"
    fi
    echo
    
    # Installed packages
    if venv_exists; then
        echo "Installed Packages:"
        $(get_venv_pip) list --format=columns 2>/dev/null || echo "  No packages installed"
    fi
    echo
    
    # Environment variables
    echo "Environment Variables:"
    echo "  VIRTUAL_ENV: ${VIRTUAL_ENV:-"Not set"}"
    echo "  PYTHONPATH: ${PYTHONPATH:-"Not set"}"
    echo "  PATH: ${PATH}"
}

check_env_health() {
    log_info "Checking environment health..."
    
    local issues=0
    
    # Check Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is not installed"
        ((issues++))
    else
        log_success "Python 3 is available"
    fi
    
    # Check virtual environment
    if ! venv_exists; then
        log_warning "Virtual environment is not created"
        ((issues++))
    else
        log_success "Virtual environment exists"
        
        # Check if venv Python works
        if $(get_venv_python) --version &> /dev/null; then
            log_success "Virtual environment Python is working"
        else
            log_error "Virtual environment Python is not working"
            ((issues++))
        fi
    fi
    
    # Check requirements
    if [[ -f "$REQUIREMENTS_FILE" ]]; then
        log_success "Requirements file exists"
        
        if venv_exists; then
            # Check if all requirements are installed
            local missing_packages
            missing_packages=$($(get_venv_pip) check 2>&1 | grep "No module named" | wc -l)
            if [[ "$missing_packages" -eq 0 ]]; then
                log_success "All dependencies are installed"
            else
                log_warning "$missing_packages dependencies may be missing"
                ((issues++))
            fi
        fi
    else
        log_warning "Requirements file is missing"
        ((issues++))
    fi
    
    # Summary
    echo
    if [[ "$issues" -eq 0 ]]; then
        log_success "Environment health check passed"
    else
        log_warning "Environment health check found $issues issues"
    fi
    
    return $issues
}

# =============================================================================
# ENVIRONMENT SCRIPTS
# =============================================================================

create_activation_script() {
    log_info "Creating activation script..."
    
    cat > "$PROJECT_ROOT/activate_venv.sh" << EOF
#!/bin/bash
# Virtual environment activation script for Watch Party Backend

SCRIPT_DIR="\$(cd "\$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="\$SCRIPT_DIR/venv"

if [[ -f "\$VENV_DIR/bin/activate" ]]; then
    source "\$VENV_DIR/bin/activate"
    echo "✅ Virtual environment activated"
    echo "Python: \$(python --version)"
    echo "Pip: \$(pip --version)"
else
    echo "❌ Virtual environment not found at \$VENV_DIR"
    echo "Create it with: ./manage.sh env create"
    exit 1
fi
EOF
    
    chmod +x "$PROJECT_ROOT/activate_venv.sh"
    
    log_success "Activation script created at $PROJECT_ROOT/activate_venv.sh"
}

create_env_file() {
    local env_file="$PROJECT_ROOT/.env"
    
    if [[ -f "$env_file" ]]; then
        log_warning ".env file already exists"
        return 0
    fi
    
    log_info "Creating .env file template..."
    
    cat > "$env_file" << 'EOF'
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here-change-in-production
DJANGO_SETTINGS_MODULE=watchparty.settings.development

# Database
DATABASE_URL=sqlite:///db.sqlite3
# DATABASE_URL=postgresql://user:password@localhost:5432/watchparty

# Redis
REDIS_URL=redis://localhost:6379/0

# Celery
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0

# Email (for development)
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
# EMAIL_HOST=smtp.gmail.com
# EMAIL_PORT=587
# EMAIL_USE_TLS=True
# EMAIL_HOST_USER=your-email@gmail.com
# EMAIL_HOST_PASSWORD=your-app-password

# Media and Static Files
MEDIA_URL=/media/
STATIC_URL=/static/

# Security (for production)
# ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
# SECURE_SSL_REDIRECT=True
# SESSION_COOKIE_SECURE=True
# CSRF_COOKIE_SECURE=True

# Third-party services

# Social Authentication
# GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
# GOOGLE_OAUTH_CLIENT_SECRET=your-google-client-secret
EOF
    
    log_success ".env file template created"
    log_warning "Please update .env file with your actual configuration"
}

# =============================================================================
# MAIN FUNCTIONS
# =============================================================================

show_help() {
    echo "Watch Party Environment Management Script"
    echo
    echo "USAGE:"
    echo "  $0 [COMMAND] [OPTIONS]"
    echo
    echo "VIRTUAL ENVIRONMENT COMMANDS:"
    echo "  create             Create virtual environment"
    echo "  activate           Show activation command"
    echo "  remove             Remove virtual environment"
    echo "  recreate           Remove and recreate virtual environment"
    echo
    echo "DEPENDENCY COMMANDS:"
    echo "  install            Install production dependencies"
    echo "  install-dev        Install development dependencies"
    echo "  update             Update all dependencies"
    echo "  freeze             Freeze current dependencies to requirements.txt"
    echo
    echo "ENVIRONMENT COMMANDS:"
    echo "  info               Show environment information"
    echo "  check              Check environment health"
    echo "  setup              Complete environment setup"
    echo "  reset              Reset entire environment"
    echo
    echo "UTILITY COMMANDS:"
    echo "  create-scripts     Create activation and environment scripts"
    echo "  create-env         Create .env file template"
    echo
    echo "OPTIONS:"
    echo "  --force            Force operation without confirmation"
    echo
    echo "EXAMPLES:"
    echo "  $0 create          # Create virtual environment"
    echo "  $0 install-dev     # Install with development dependencies"
    echo "  $0 info            # Show environment information"
}

setup_full_env() {
    log_info "Setting up complete Python environment..."
    
    create_venv
    install_dependencies "true"
    create_activation_script
    create_env_file
    
    log_success "Environment setup completed!"
    log_info "To activate the environment, run:"
    echo "  source ./activate_venv.sh"
    echo "  # or"
    echo "  source venv/bin/activate"
}

reset_env() {
    log_warning "Resetting Python environment..."
    
    if [[ "${FORCE:-false}" != "true" ]]; then
        echo -n "This will remove the virtual environment and recreate it. Continue? (y/N): "
        read -r confirm
        if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
            log_info "Environment reset cancelled"
            return 0
        fi
    fi
    
    remove_venv
    setup_full_env
}

main() {
    local command="${1:-help}"
    shift || true
    
    case "$command" in
        create)
            create_venv
            ;;
        activate)
            activate_venv
            ;;
        remove|delete)
            remove_venv
            ;;
        recreate)
            FORCE=true remove_venv
            create_venv
            ;;
        install)
            install_dependencies "false"
            ;;
        install-dev)
            install_dependencies "true"
            ;;
        update|upgrade)
            update_dependencies
            ;;
        freeze)
            freeze_requirements
            ;;
        info|status)
            show_env_info
            ;;
        check|health)
            check_env_health
            ;;
        setup|init)
            setup_full_env
            ;;
        reset)
            reset_env
            ;;
        create-scripts)
            create_activation_script
            ;;
        create-env)
            create_env_file
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

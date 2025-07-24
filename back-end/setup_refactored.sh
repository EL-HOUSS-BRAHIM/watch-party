#!/bin/bash

# =============================================================================
# Watch Party Backend Refactoring Setup Script
# =============================================================================
# This script helps set up the refactored backend environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check Python version
check_python_version() {
    print_status "Checking Python version..."
    
    if command_exists python3; then
        python_version=$(python3 --version | awk '{print $2}')
        major_version=$(echo $python_version | cut -d. -f1)
        minor_version=$(echo $python_version | cut -d. -f2)
        
        if [ "$major_version" -eq 3 ] && [ "$minor_version" -ge 11 ]; then
            print_success "Python $python_version is compatible"
            PYTHON_CMD="python3"
        else
            print_error "Python 3.11+ required, found $python_version"
            exit 1
        fi
    else
        print_error "Python3 not found. Please install Python 3.11+"
        exit 1
    fi
}

# Function to check system dependencies
check_system_dependencies() {
    print_status "Checking system dependencies..."
    
    missing_deps=()
    
    # Check for Redis
    if ! command_exists redis-server; then
        missing_deps+=("redis-server")
    fi
    
    # Check for PostgreSQL (optional but recommended)
    if ! command_exists psql; then
        print_warning "PostgreSQL not found. You can use SQLite for development."
    fi
    
    # Check for Git
    if ! command_exists git; then
        missing_deps+=("git")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing dependencies: ${missing_deps[*]}"
        print_status "Please install them using your package manager:"
        print_status "Ubuntu/Debian: sudo apt-get install ${missing_deps[*]}"
        print_status "macOS: brew install ${missing_deps[*]}"
        exit 1
    fi
    
    print_success "All system dependencies are installed"
}

# Function to set up virtual environment
setup_virtual_environment() {
    print_status "Setting up virtual environment..."
    
    # Check if we're already in a virtual environment
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        print_success "Already in virtual environment: $VIRTUAL_ENV"
        VENV_PYTHON="python"
        VENV_PIP="pip"
        
        # Upgrade pip in current virtual environment
        print_status "Upgrading pip in current virtual environment..."
        $VENV_PIP install --upgrade pip --break-system-packages 2>/dev/null || {
            print_warning "Using pip without system package override"
            $VENV_PIP install --upgrade pip --user
        }
        print_success "Pip upgrade completed"
        return 0
    fi
    
    if [ ! -d "venv" ]; then
        print_status "Creating virtual environment..."
        $PYTHON_CMD -m venv venv
        print_success "Virtual environment created"
    else
        print_warning "Virtual environment already exists"
    fi
    
    # Set virtual environment paths
    VENV_PYTHON="./venv/bin/python"
    VENV_PIP="./venv/bin/pip"
    
    # Verify virtual environment
    if [ -f "$VENV_PYTHON" ] && [ -f "$VENV_PIP" ]; then
        print_success "Virtual environment is ready"
        
        # Upgrade pip in virtual environment
        print_status "Upgrading pip in virtual environment..."
        $VENV_PIP install --upgrade pip
        print_success "Pip upgraded successfully"
    else
        print_error "Virtual environment setup failed"
        exit 1
    fi
}

# Function to install Python dependencies
install_dependencies() {
    print_status "Installing Python dependencies..."
    
    if [ -f "requirements.txt" ]; then
        # Use the appropriate pip (current environment or venv)
        if [[ "$VIRTUAL_ENV" != "" ]]; then
            print_status "Installing in current virtual environment..."
            pip install -r requirements.txt --break-system-packages 2>/dev/null || {
                print_warning "Installing with user flag"
                pip install -r requirements.txt --user
            }
        elif [ -f "./venv/bin/pip" ]; then
            ./venv/bin/pip install -r requirements.txt
        else
            print_error "No suitable Python environment found"
            exit 1
        fi
        print_success "Dependencies installed successfully"
    else
        print_error "requirements.txt not found"
        exit 1
    fi
}

# Function to set up environment configuration
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success "Created .env file from .env.example"
            print_warning "Please update .env file with your configuration"
        else
            print_error ".env.example not found"
            exit 1
        fi
    else
        print_warning ".env file already exists"
    fi
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if manage.py exists
    if [ ! -f "manage.py" ]; then
        print_error "manage.py not found. Are you in the correct directory?"
        exit 1
    fi
    
    # Use appropriate Python (current environment or venv)
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        PYTHON_EXEC="python"
    elif [ -f "./venv/bin/python" ]; then
        PYTHON_EXEC="./venv/bin/python"
    else
        print_error "No suitable Python environment found"
        exit 1
    fi
    
    # Create migrations for new modules
    print_status "Creating migrations for core modules..."
    $PYTHON_EXEC manage.py makemigrations authentication users videos parties chat billing analytics notifications integrations interactive
    
    # Run migrations
    print_status "Applying migrations..."
    $PYTHON_EXEC manage.py migrate
    
    print_success "Database migrations completed"
}

# Function to collect static files
collect_static() {
    print_status "Collecting static files..."
    
    # Use appropriate Python (current environment or venv)
    if [[ "$VIRTUAL_ENV" != "" ]]; then
        PYTHON_EXEC="python"
    elif [ -f "./venv/bin/python" ]; then
        PYTHON_EXEC="./venv/bin/python"
    else
        print_error "No suitable Python environment found"
        exit 1
    fi
    
    $PYTHON_EXEC manage.py collectstatic --noinput
    print_success "Static files collected"
}

# Function to create superuser
create_superuser() {
    print_status "Creating superuser account..."
    
    read -p "Do you want to create a superuser account? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Use appropriate Python (current environment or venv)
        if [[ "$VIRTUAL_ENV" != "" ]]; then
            PYTHON_EXEC="python"
        elif [ -f "./venv/bin/python" ]; then
            PYTHON_EXEC="./venv/bin/python"
        else
            print_error "No suitable Python environment found"
            exit 1
        fi
        
        $PYTHON_EXEC manage.py createsuperuser
        print_success "Superuser created"
    else
        print_warning "Skipping superuser creation"
    fi
}

# Function to start services
start_services() {
    print_status "Starting Redis server..."
    
    # Check if Redis is running
    if ! pgrep -x "redis-server" > /dev/null; then
        if command_exists redis-server; then
            redis-server --daemonize yes
            print_success "Redis server started"
        else
            print_warning "Redis server not found. Please start it manually."
        fi
    else
        print_success "Redis server is already running"
    fi
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    read -p "Do you want to run the test suite? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        # Use appropriate Python (current environment or venv)
        if [[ "$VIRTUAL_ENV" != "" ]]; then
            PYTHON_EXEC="python"
        elif [ -f "./venv/bin/python" ]; then
            PYTHON_EXEC="./venv/bin/python"
        else
            print_error "No suitable Python environment found"
            exit 1
        fi
        
        $PYTHON_EXEC manage.py test
        print_success "Tests completed"
    else
        print_warning "Skipping tests"
    fi
}

# Function to display final instructions
display_instructions() {
    echo
    print_success "🎉 Watch Party Backend setup completed!"
    echo
    print_status "Next steps:"
    echo "1. Update your .env file with the correct configuration values"
    echo "2. Start the development server: ./venv/bin/python manage.py runserver"
    echo "3. Start Celery worker: ./venv/bin/celery -A watchparty worker --loglevel=info"
    echo "4. Start Celery beat: ./venv/bin/celery -A watchparty beat --loglevel=info"
    echo
    print_status "Important URLs:"
    echo "• API Documentation: http://localhost:8000/api/docs/"
    echo "• Admin Panel: http://localhost:8000/admin/"
    echo "• API Root: http://localhost:8000/api/"
    echo
    print_status "Useful commands:"
    echo "• Activate virtual environment: source venv/bin/activate"
    echo "• Run development server: ./venv/bin/python manage.py runserver"
    echo "• Create migrations: ./venv/bin/python manage.py makemigrations"
    echo "• Apply migrations: ./venv/bin/python manage.py migrate"
    echo "• Run tests: ./venv/bin/python manage.py test"
    echo "• Create superuser: ./venv/bin/python manage.py createsuperuser"
    echo
    print_warning "Don't forget to:"
    echo "1. Configure your database (PostgreSQL recommended for production)"
    echo "2. Set up Redis for caching and real-time features"
    echo "3. Configure external services (AWS S3, Stripe, Google Drive)"
    echo "4. Update security settings for production deployment"
}

# Main setup function
main() {
    echo "============================================================================="
    echo "              Watch Party Backend Refactoring Setup Script"
    echo "============================================================================="
    echo
    
    # Check if we're in the correct directory
    if [ ! -f "manage.py" ] || [ ! -f "requirements.txt" ]; then
        print_error "Please run this script from the backend directory (where manage.py is located)"
        exit 1
    fi
    
    # Run setup steps
    check_python_version
    check_system_dependencies
    setup_virtual_environment
    install_dependencies
    setup_environment
    
    run_migrations
    collect_static
    create_superuser
    start_services
    run_tests
    
    display_instructions
}

# Run main function
main "$@"

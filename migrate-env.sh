#!/bin/bash

# Environment Migration Helper for Watch Party
# Helps migrate from old deployment paths to new unified deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check current environment files
check_env_files() {
    echo "=== Current Environment Files Status ==="
    
    # Backend
    echo "Backend:"
    if [ -f "back-end/.env" ]; then
        print_status ".env exists"
    else
        print_warning ".env missing"
    fi
    
    if [ -f "back-end/.env.example" ]; then
        print_status ".env.example exists (comprehensive template)"
    fi
    
    if [ -f "back-end/.env.production.example" ]; then
        print_status ".env.production.example exists (production template)"
    fi
    
    # Frontend  
    echo ""
    echo "Frontend:"
    if [ -f "front-end/.env.local" ]; then
        print_status ".env.local exists"
    else
        print_warning ".env.local missing"
    fi
    
    if [ -f "front-end/.env.production.example" ]; then
        print_status ".env.production.example exists"
    fi
}

# Migrate backend environment
migrate_backend_env() {
    echo ""
    echo "=== Backend Environment Migration ==="
    
    if [ ! -f "back-end/.env" ]; then
        print_warning "No backend .env file found"
        if [ -f "back-end/.env.production.example" ]; then
            print_status "Creating .env from .env.production.example..."
            cp back-end/.env.production.example back-end/.env
            print_warning "Please edit back-end/.env with your actual values"
        elif [ -f "back-end/.env.example" ]; then
            print_status "Creating .env from .env.example..."
            cp back-end/.env.example back-end/.env
            print_warning "Please edit back-end/.env with your actual values (this is development template)"
        else
            print_error "No template files found!"
            return 1
        fi
    else
        print_status "Backend .env already exists"
        
        # Check if this is a development configuration
        if grep -q "DEBUG=True" back-end/.env 2>/dev/null && grep -q "localhost:3000" back-end/.env 2>/dev/null; then
            print_warning "Current .env appears to be configured for development"
            echo ""
            echo "For production deployment, you should update:"
            echo "  - DEBUG=False"
            echo "  - SECRET_KEY=your-production-secret-key"
            echo "  - ALLOWED_HOSTS=be-watch-party.brahim-elhouss.me,127.0.0.1,localhost"
            echo "  - CORS_ALLOWED_ORIGINS=https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me"
            echo "  - REDIS_URL=redis://:watchparty_redis_2025@127.0.0.1:6380/0"
            echo ""
            echo "Would you like me to create a production-ready .env file? (y/N)"
            read -r response
            if [[ "$response" =~ ^[Yy]$ ]]; then
                print_status "Creating production .env from template..."
                cp back-end/.env back-end/.env.backup
                cp back-end/.env.production.example back-end/.env
                echo "✓ Backup created: back-end/.env.backup"
                echo "✓ Production .env created from template"
                echo "⚠️  Please review and update the values in back-end/.env"
            fi
        fi
        
        # Check for old paths and suggest updates
        if grep -q "/home/ubuntu/brahim/be_watch-party" back-end/.env 2>/dev/null; then
            print_warning "Found old deployment paths in .env"
            echo "Consider updating these paths:"
            echo "  OLD: /home/ubuntu/brahim/be_watch-party"  
            echo "  NEW: /home/ubuntu/watch-party/back-end"
        fi
        
        if grep -q "vercel.app\|v0-watch-party" back-end/.env 2>/dev/null; then
            print_warning "Found old frontend domain (Vercel) in .env"
            echo "Consider updating CORS_ALLOWED_ORIGINS to:"
            echo "  https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me"
        fi
    fi
}

# Migrate frontend environment  
migrate_frontend_env() {
    echo ""
    echo "=== Frontend Environment Migration ==="
    
    if [ ! -f "front-end/.env.local" ]; then
        print_warning "No frontend .env.local file found"
        if [ -f "front-end/.env.production.example" ]; then
            print_status "Creating .env.local from .env.production.example..."
            cp front-end/.env.production.example front-end/.env.local
            print_warning "Please edit front-end/.env.local with your actual values"
        else
            print_error "No frontend template file found!"
            return 1
        fi
    else
        print_status "Frontend .env.local already exists"
        
        # Check current values
        if grep -q "localhost:3000" front-end/.env.local 2>/dev/null; then
            print_warning "Frontend .env.local contains localhost URLs"
            echo "For production, consider updating NEXT_PUBLIC_APP_URL to:"
            echo "  https://watch-party.brahim-elhouss.me"
        fi
    fi
}

# Show current configuration
show_config() {
    echo ""
    echo "=== Current Configuration Summary ==="
    
    if [ -f "back-end/.env" ]; then
        echo "Backend (.env):"
        grep -E "^(ALLOWED_HOSTS|CORS_ALLOWED_ORIGINS|DATABASE_URL|REDIS_URL)=" back-end/.env 2>/dev/null || echo "  Key variables not found"
    fi
    
    echo ""
    if [ -f "front-end/.env.local" ]; then
        echo "Frontend (.env.local):"
        grep -E "^NEXT_PUBLIC_(API_URL|APP_URL|WS_URL)=" front-end/.env.local 2>/dev/null || echo "  Key variables not found"
    fi
}

# Create backup of current files
backup_current() {
    local backup_dir="env-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    echo ""
    echo "=== Creating Backup ==="
    
    if [ -f "back-end/.env" ]; then
        cp back-end/.env "$backup_dir/backend.env"
        print_status "Backed up backend .env"
    fi
    
    if [ -f "front-end/.env.local" ]; then
        cp front-end/.env.local "$backup_dir/frontend.env.local"
        print_status "Backed up frontend .env.local"
    fi
    
    if [ "$(ls -A $backup_dir)" ]; then
        print_status "Backup created in: $backup_dir"
    else
        rmdir "$backup_dir"
        print_warning "No files to backup"
    fi
}

# Main function
main() {
    case "${1:-check}" in
        check)
            check_env_files
            show_config
            ;;
        migrate)
            backup_current
            migrate_backend_env
            migrate_frontend_env
            print_status "Migration completed!"
            echo ""
            echo "Next steps:"
            echo "1. Review and edit your .env files"
            echo "2. Run: ./deploy.sh --full"
            ;;
        backup)
            backup_current
            ;;
        show)
            show_config
            ;;
        *)
            echo "Usage: $0 {check|migrate|backup|show}"
            echo ""
            echo "Commands:"
            echo "  check    - Check current environment files status (default)"
            echo "  migrate  - Migrate environment files for unified deployment"
            echo "  backup   - Create backup of current environment files"
            echo "  show     - Show current configuration values"
            echo ""
            echo "Examples:"
            echo "  $0 check     # Check status"
            echo "  $0 migrate   # Migrate files"
            exit 1
            ;;
    esac
}

# Make sure we're in the right directory
if [ ! -d "back-end" ] || [ ! -d "front-end" ]; then
    print_error "Please run this script from the watch-party root directory"
    exit 1
fi

main "$@"

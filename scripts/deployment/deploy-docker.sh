#!/bin/bash

# Watch Party Docker Deployment Script
# This script deploys the full-stack application using Docker Compose
# Designed for Lightsail server deployment with Cloudflare integration

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="watch-party"
APP_DIR="/srv/$APP_NAME"
LIGHTSAIL_HOST="35.181.116.57"
BACKEND_DOMAIN="be-watch-party.brahim-elhouss.me"
FRONTEND_DOMAIN="watch-party.brahim-elhouss.me"
REPO_URL="https://github.com/EL-HOUSS-BRAHIM/watch-party.git"

# Function to print colored output
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
    echo -e "${BLUE}[TASK]${NC} $1"
}

# Function to check if we're on the server
check_server_environment() {
    if [ "$(whoami)" != "deploy" ]; then
        print_error "This script should be run as the 'deploy' user on the server"
        exit 1
    fi
    
    if [ "$(hostname -I | xargs)" != "$LIGHTSAIL_HOST" ]; then
        print_warning "This doesn't appear to be the expected Lightsail server"
        print_warning "Expected IP: $LIGHTSAIL_HOST"
        print_warning "Current IP: $(hostname -I | xargs)"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to setup the repository
setup_repository() {
    print_header "Setting up repository"
    
    if [ ! -d "$APP_DIR" ]; then
        print_status "Cloning repository..."
        git clone "$REPO_URL" "$APP_DIR"
        cd "$APP_DIR"
    else
        print_status "Updating repository..."
        cd "$APP_DIR"
        git fetch origin
        git reset --hard origin/master
    fi
    
    print_status "Repository setup complete"
}

# Function to configure AWS
configure_aws() {
    print_header "Configuring AWS CLI and credentials"
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        print_status "Installing AWS CLI..."
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
        rm -rf aws awscliv2.zip
        print_status "AWS CLI installed successfully"
    else
        print_status "AWS CLI already installed: $(aws --version)"
    fi
    
    # Configure AWS to use IAM role
    print_status "Configuring AWS to use IAM role..."
    
    mkdir -p ~/.aws
    cat > ~/.aws/config << EOF
[default]
region = eu-west-3
output = json
EOF
    
    print_status "Testing AWS configuration..."
    if aws sts get-caller-identity > /dev/null 2>&1; then
        print_status "✅ AWS configuration successful!"
        
        # Test S3 access
        if aws s3 ls > /dev/null 2>&1; then
            print_status "✅ S3 access confirmed"
        else
            print_warning "❌ S3 access failed - check IAM role permissions"
        fi
    else
        print_error "❌ AWS configuration failed!"
        print_error "Please ensure:"
        print_error "1. IAM role MyAppRole is attached to this Lightsail instance"
        print_error "2. IAM role has necessary permissions (S3, SSM, etc.)"
        print_error "3. Instance metadata service is accessible"
        return 1
    fi
    
    print_status "AWS configuration complete"
}

# Function to setup environment files
setup_environment() {
    print_header "Setting up environment configuration"
    
    # Backend environment
    if [ ! -f "$APP_DIR/backend/.env" ]; then
        print_status "Creating backend .env file from comprehensive example..."
        cp "$APP_DIR/backend/.env.example" "$APP_DIR/backend/.env"
        
        print_warning "Backend .env created with AWS production configuration. Review and update:"
        print_warning "- Database password for RDS: watch-party-postgres.cj6w0queklir.eu-west-3.rds.amazonaws.com"
        print_warning "- Redis auth token for ElastiCache: master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com"
        print_warning "- SECRET_KEY and JWT keys (generate new ones for production)"
        print_warning "- AWS S3 bucket name (if using file uploads)"
        print_warning "- Email configuration (SMTP settings)"
        print_warning "- Social OAuth keys (Google, Discord, GitHub)"
        print_warning "- Stripe payment keys (if using billing features)"
        print_warning ""
        print_warning "Edit: nano $APP_DIR/backend/.env"
    else
        print_status "Backend .env file already exists"
    fi
    
    # Frontend environment  
    if [ ! -f "$APP_DIR/frontend/.env.local" ]; then
        print_status "Creating frontend .env.local file from example..."
        cp "$APP_DIR/frontend/.env.example" "$APP_DIR/frontend/.env.local"
        
        print_warning "Frontend .env.local created with correct API URLs"
        print_warning "You may want to customize analytics and feature flags"
        print_warning ""
        print_warning "Edit: nano $APP_DIR/frontend/.env.local"
    else
        print_status "Frontend .env.local file already exists"
    fi
    
    if [ ! -f "$APP_DIR/backend/.env" ] || [ ! -f "$APP_DIR/frontend/.env.local" ]; then
        print_warning ""
        read -p "Press Enter after reviewing/editing environment files..." -r
    fi
}

# Function to build and start services
deploy_services() {
    print_header "Building and deploying services"
    
    cd "$APP_DIR"
    
    print_status "Building Docker images..."
    docker-compose build --no-cache
    
    print_status "Starting services..."
    docker-compose up -d --remove-orphans
    
    # Wait for backend to be ready
    print_status "Waiting for backend to be ready..."
    sleep 30
    
    # Run database migrations
    print_status "Running database migrations..."
    docker-compose exec -T backend python manage.py migrate
    
    # Collect static files
    print_status "Collecting static files..."
    docker-compose exec -T backend python manage.py collectstatic --noinput
    
    # Create superuser if needed
    print_status "Checking for superuser..."
    if ! docker-compose exec -T backend python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print('Superuser exists' if User.objects.filter(is_superuser=True).exists() else 'No superuser');" | grep -q "Superuser exists"; then
        print_warning "No superuser found. You may want to create one:"
        print_warning "docker-compose exec backend python manage.py createsuperuser"
    fi
    
    print_status "Services deployed successfully"
}

# Function to check service health
check_health() {
    print_header "Checking service health"
    
    cd "$APP_DIR"
    
    # Check if containers are running
    print_status "Checking container status..."
    docker-compose ps
    
    # Check backend health
    print_status "Checking backend health..."
    if curl -f http://localhost:8000/health/ > /dev/null 2>&1; then
        print_status "✅ Backend is healthy"
    else
        print_error "❌ Backend health check failed"
        print_status "Backend logs:"
        docker-compose logs --tail=20 backend
    fi
    
    # Check frontend health
    print_status "Checking frontend health..."
    if curl -f http://localhost:3000/ > /dev/null 2>&1; then
        print_status "✅ Frontend is healthy"
    else
        print_error "❌ Frontend health check failed"
        print_status "Frontend logs:"
        docker-compose logs --tail=20 frontend
    fi
    
    # Check nginx health
    print_status "Checking nginx health..."
    if curl -f http://localhost/health > /dev/null 2>&1; then
        print_status "✅ Nginx is healthy"
    else
        print_error "❌ Nginx health check failed"
        print_status "Nginx logs:"
        docker-compose logs --tail=20 nginx
    fi
}

# Function to show logs
show_logs() {
    print_header "Showing recent logs"
    
    cd "$APP_DIR"
    
    echo -e "\n${BLUE}Backend logs:${NC}"
    docker-compose logs --tail=20 backend
    
    echo -e "\n${BLUE}Frontend logs:${NC}"
    docker-compose logs --tail=20 frontend
    
    echo -e "\n${BLUE}Nginx logs:${NC}"
    docker-compose logs --tail=20 nginx
    
    echo -e "\n${BLUE}Database logs:${NC}"
    docker-compose logs --tail=10 db
}

# Function to restart services
restart_services() {
    print_header "Restarting services"
    
    cd "$APP_DIR"
    
    print_status "Restarting all services..."
    docker-compose restart
    
    print_status "Waiting for services to be ready..."
    sleep 30
    
    check_health
}

# Function to stop services
stop_services() {
    print_header "Stopping services"
    
    cd "$APP_DIR"
    
    print_status "Stopping all services..."
    docker-compose down
    
    print_status "Services stopped"
}

# Function to update and redeploy
update_and_redeploy() {
    print_header "Updating and redeploying"
    
    setup_repository
    deploy_services
    check_health
    
    print_status "Update and redeploy complete!"
}

# Function to cleanup old Docker resources
cleanup_docker() {
    print_header "Cleaning up Docker resources"
    
    print_status "Removing unused containers..."
    docker container prune -f
    
    print_status "Removing unused images..."
    docker image prune -f
    
    print_status "Removing unused volumes..."
    docker volume prune -f
    
    print_status "Removing unused networks..."
    docker network prune -f
    
    print_status "Docker cleanup complete"
}

# Function to show disk usage
show_disk_usage() {
    print_header "System Resource Usage"
    
    echo -e "\n${BLUE}Disk Usage:${NC}"
    df -h
    
    echo -e "\n${BLUE}Docker Usage:${NC}"
    docker system df
    
    echo -e "\n${BLUE}Memory Usage:${NC}"
    free -h
    
    echo -e "\n${BLUE}Running Containers:${NC}"
    docker ps
}

# Function to backup data
backup_data() {
    print_header "Creating data backup"
    
    cd "$APP_DIR"
    BACKUP_DIR="$HOME/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    print_status "Creating database backup..."
    docker-compose exec -T db pg_dump -U watchparty watchparty > "$BACKUP_DIR/database.sql"
    
    print_status "Creating media files backup..."
    if [ -d "$(docker-compose config --volumes | grep media)" ]; then
        docker run --rm -v "$(docker-compose config --volumes | grep media)":/source -v "$BACKUP_DIR":/backup alpine tar czf /backup/media.tar.gz -C /source .
    fi
    
    print_status "Backup created at: $BACKUP_DIR"
}

# Main menu
show_menu() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   Watch Party Docker Deployment       ${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo
    echo "Application: $APP_NAME"
    echo "Directory: $APP_DIR"
    echo "Server: $LIGHTSAIL_HOST"
    echo "Domains: $BACKEND_DOMAIN, $FRONTEND_DOMAIN"
    echo
    echo "1. Full Deploy (setup + deploy)"
    echo "2. Update and Redeploy"
    echo "3. Restart Services"
    echo "4. Check Health"
    echo "5. Show Logs"
    echo "6. Stop Services"
    echo "7. Cleanup Docker"
    echo "8. Show Resource Usage"
    echo "9. Create Backup"
    echo "10. Setup Environment Only"
    echo "11. Configure AWS"
    echo "0. Exit"
    echo
}

# Function for full deployment
full_deploy() {
    print_header "Starting full deployment"
    
    setup_repository
    configure_aws
    setup_environment
    deploy_services
    check_health
    
    print_status "🎉 Full deployment complete!"
    print_status "Frontend: http://$LIGHTSAIL_HOST/ (https://$FRONTEND_DOMAIN)"
    print_status "Backend API: http://$LIGHTSAIL_HOST/api/ (https://$BACKEND_DOMAIN)"
    print_status "Health check: http://$LIGHTSAIL_HOST/health/"
    print_warning "Configure your DNS to point $FRONTEND_DOMAIN (main) and $BACKEND_DOMAIN to $LIGHTSAIL_HOST"
}

# Main execution
main() {
    check_server_environment
    
    while true; do
        show_menu
        read -p "Choose an option [0-11]: " choice
        
        case $choice in
            1)
                full_deploy
                ;;
            2)
                update_and_redeploy
                ;;
            3)
                restart_services
                ;;
            4)
                check_health
                ;;
            5)
                show_logs
                ;;
            6)
                stop_services
                ;;
            7)
                cleanup_docker
                ;;
            8)
                show_disk_usage
                ;;
            9)
                backup_data
                ;;
            10)
                setup_environment
                ;;
            11)
                configure_aws
                ;;
            0)
                print_status "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 0-11."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..." -r
        echo
    done
}

# Run main function
main "$@"
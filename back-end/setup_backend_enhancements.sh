#!/bin/bash

# Backend Enhancement Setup Script
# This script sets up all the new features and API endpoints added to the backend

set -e  # Exit on any error

echo "🚀 Setting up Watch Party Backend Enhancements..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}📋 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "manage.py" ]; then
    print_error "Please run this script from the backend directory (where manage.py is located)"
    exit 1
fi

# Activate virtual environment if it exists
if [ -f "venv/bin/activate" ]; then
    print_step "Activating virtual environment..."
    source venv/bin/activate
    print_success "Virtual environment activated"
elif [ -f "../venv/bin/activate" ]; then
    print_step "Activating virtual environment..."
    source ../venv/bin/activate
    print_success "Virtual environment activated"
else
    print_warning "No virtual environment found. Make sure you have one set up."
fi

# Install additional required packages
print_step "Installing additional Python packages..."
pip install requests python-qrcode[pil] pyotp || {
    print_error "Failed to install required packages"
    exit 1
}
print_success "Additional packages installed"

# Create database migrations for modified models
print_step "Creating database migrations..."

# Create migration for User model (social auth fields)
python manage.py makemigrations authentication --name add_social_auth_fields || {
    print_error "Failed to create authentication migrations"
    exit 1
}

# Create migrations for other apps if needed
python manage.py makemigrations users || true
python manage.py makemigrations videos || true
python manage.py makemigrations parties || true
python manage.py makemigrations analytics || true
python manage.py makemigrations notifications || true
python manage.py makemigrations billing || true
python manage.py makemigrations chat || true

print_success "Database migrations created"

# Apply migrations
print_step "Applying database migrations..."
python manage.py migrate || {
    print_error "Failed to apply migrations"
    exit 1
}
print_success "Database migrations applied"

# Collect static files
print_step "Collecting static files..."
python manage.py collectstatic --noinput || {
    print_warning "Failed to collect static files (this might be OK in development)"
}

# Create cache tables if using database cache
print_step "Setting up cache tables..."
python manage.py createcachetable || {
    print_warning "Failed to create cache table (might already exist)"
}

# Run system checks
print_step "Running Django system checks..."
python manage.py check || {
    print_error "Django system check failed"
    exit 1
}
print_success "Django system checks passed"

# Create superuser if it doesn't exist
print_step "Checking for superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(is_superuser=True).exists():
    print('No superuser found. You may want to create one with: python manage.py createsuperuser')
else:
    print('Superuser already exists')
"

print_success "Backend enhancement setup completed!"

echo ""
echo "🎉 Setup Summary:"
echo "=================="
echo ""
print_success "✅ Social Authentication (Google, GitHub) added to /api/auth/social/"
print_success "✅ Enhanced User Management endpoints added to /api/users/"
print_success "✅ Advanced Chat System endpoints added to /api/chat/"
print_success "✅ Enhanced Video Management endpoints added to /api/videos/"
print_success "✅ Comprehensive Admin Panel endpoints added to /api/admin/"
print_success "✅ Advanced Analytics endpoints added to /api/analytics/"
print_success "✅ All database migrations applied"

echo ""
echo "🔗 New API Endpoints Added:"
echo "============================"
echo ""
echo "Authentication & Social Login:"
echo "  POST /api/auth/social/google/ - Google OAuth authentication"
echo "  POST /api/auth/social/github/ - GitHub OAuth authentication"
echo ""
echo "Enhanced User Management:"
echo "  GET  /api/users/export-data/ - Export user data (GDPR)"
echo "  POST /api/users/delete-account/ - Delete user account"
echo "  GET  /api/users/<id>/mutual-friends/ - Get mutual friends"
echo "  GET  /api/users/online-status/ - Get online status of users"
echo ""
echo "Advanced Video Management:"
echo "  GET  /api/videos/<id>/processing-status/ - Get video processing status"
echo "  GET  /api/videos/<id>/quality-variants/ - Get available quality variants"
echo "  POST /api/videos/<id>/regenerate-thumbnail/ - Regenerate video thumbnail"
echo "  POST /api/videos/<id>/share/ - Generate shareable links"
echo "  GET  /api/videos/search/advanced/ - Advanced video search"
echo ""
echo "Enhanced Chat System:"
echo "  POST /api/chat/<id>/join/ - Join chat room"
echo "  POST /api/chat/<id>/leave/ - Leave chat room"
echo "  GET  /api/chat/<id>/active-users/ - Get active users in chat"
echo "  POST /api/chat/<id>/moderate/ - Moderate chat messages"
echo "  POST /api/chat/<id>/ban/ - Ban user from chat"
echo "  GET  /api/chat/<id>/stats/ - Get chat statistics"
echo ""
echo "Enhanced Admin Panel:"
echo "  POST /api/admin/users/bulk-action/ - Bulk user operations"
echo "  GET  /api/admin/users/export/ - Export users to CSV"
echo "  GET  /api/admin/users/<id>/actions/ - Get user action history"
echo "  GET  /api/admin/settings/ - Get system settings"
echo "  PUT  /api/admin/settings/update/ - Update system settings"
echo "  POST /api/admin/notifications/send/ - Send notifications to users"
echo ""
echo "Advanced Analytics:"
echo "  GET  /api/analytics/system/performance/ - System performance metrics"
echo "  GET  /api/analytics/revenue/ - Revenue and subscription analytics"
echo "  GET  /api/analytics/retention/ - User retention analysis"
echo "  GET  /api/analytics/content/ - Content performance analytics"
echo ""
echo "🔥 Next Steps:"
echo "=============="
echo "1. Start the development server: python manage.py runserver"
echo "2. Test the new endpoints using the API documentation at /api/docs/"
echo "3. Configure social authentication settings in your .env file"
echo "4. Set up proper production settings for deployment"
echo ""
print_success "All enhancements are now ready to use! 🎊"

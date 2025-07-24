#!/bin/bash

# =============================================================================
# Quick Setup Completion Script
# =============================================================================

echo "🎉 Completing Watch Party Backend Setup"
echo "========================================"

# Run migrations
echo "📋 Running migrations..."
python manage.py makemigrations
python manage.py migrate

# Check Django configuration
echo "🔍 Checking Django configuration..."
python manage.py check

# Create superuser (optional)
echo "👤 Creating superuser..."
echo "You can skip this and create it later if needed."
read -p "Create superuser now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    python manage.py createsuperuser
fi

# Start Redis if needed
echo "🔄 Checking Redis server..."
if ! pgrep -x "redis-server" > /dev/null; then
    echo "Starting Redis server..."
    redis-server --daemonize yes
    echo "✅ Redis server started"
else
    echo "✅ Redis server is already running"
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Start the development server: python manage.py runserver"
echo "2. Visit: http://localhost:8000/admin/ (admin panel)"
echo "3. Visit: http://localhost:8000/api/ (API root)"
echo ""
echo "Useful commands:"
echo "• python manage.py runserver (start development server)"
echo "• python manage.py createsuperuser (create admin user)"
echo "• python manage.py shell (Django shell)"
echo "• python manage.py collectstatic (collect static files)"
echo ""

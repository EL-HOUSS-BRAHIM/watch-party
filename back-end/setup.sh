#!/bin/bash

# Watch Party Backend Setup Script
# This script sets up the Django backend development environment

set -e

echo "🚀 Setting up Watch Party Backend..."

# Check if Python 3.11+ is installed
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
echo "📋 Python version: $python_version"

# Convert version to comparable format (e.g., 3.11 -> 311)
version_number=$(echo $python_version | sed 's/\.//')
if [ "$version_number" -lt 311 ]; then
    echo "❌ Python 3.11+ is required, found $python_version"
    exit 1
fi

# Create virtual environment
echo "🔧 Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please update .env with your configuration!"
fi

# Create logs directory
mkdir -p logs

# Create media directories
mkdir -p mediafiles/avatars
mkdir -p staticfiles

# Check if PostgreSQL is available
echo "🗄️  Checking database connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL is available"
    
    # Try to create database
    createdb watchparty_dev 2>/dev/null || echo "📋 Database watchparty_dev may already exist"
else
    echo "⚠️  PostgreSQL not found. Please install PostgreSQL or update DATABASE_URL in .env"
fi

# Check if Redis is available
echo "📮 Checking Redis connection..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is available"
    else
        echo "⚠️  Redis server is not running. Please start Redis server."
    fi
else
    echo "⚠️  Redis not found. Please install Redis or update REDIS_URL in .env"
fi

# Run migrations
echo "🔄 Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
echo "👤 Creating superuser..."
echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin@watchparty.com', 'admin123') if not User.objects.filter(username='admin@watchparty.com').exists() else None" | python manage.py shell

# Collect static files
echo "📁 Collecting static files..."
python manage.py collectstatic --noinput

echo ""
echo "🎉 Backend setup completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Update .env with your configuration"
echo "   2. Start the development server with WebSocket support: ./run_dev_server.sh"
echo "   3. Alternative: python manage.py runserver (no WebSocket support)"
echo "   4. Start Celery worker (in separate terminal): celery -A watchparty worker --loglevel=info"
echo "   5. Start Celery beat (in separate terminal): celery -A watchparty beat --loglevel=info"
echo ""
echo "🌐 Development URLs:"
echo "   • API: http://localhost:8000/api/"
echo "   • Admin: http://localhost:8000/admin/"
echo "   • WebSocket: ws://localhost:8000/ws/"
echo "   • API Docs: http://localhost:8000/api/docs/"
echo ""
echo "🔧 Default superuser:"
echo "   • Email: admin@watchparty.com"
echo "   • Password: admin123"
echo ""

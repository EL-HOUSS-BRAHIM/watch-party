#!/bin/bash

# Quick Setup Script for Watch Party Development
# This script helps you get started quickly

set -e  # Exit on error

echo "=========================================="
echo "WATCH PARTY - QUICK SETUP"
echo "=========================================="
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo "Error: Please run this script from the project root directory"
    exit 1
fi

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env
    echo "✓ Created backend/.env"
    echo ""
    echo "⚠️  IMPORTANT: Run 'python3 scripts/generate-secrets.py' to generate secure secrets"
    echo ""
else
    echo "✓ backend/.env already exists"
fi

# Create frontend .env.local if it doesn't exist
if [ ! -f "frontend/.env.local" ]; then
    echo "Creating frontend/.env.local for development..."
    cat > frontend/.env.local << 'EOF'
# Development Environment
BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
VSCODE_SIMPLE_BROWSER=true
NODE_ENV=development
EOF
    echo "✓ Created frontend/.env.local"
else
    echo "✓ frontend/.env.local already exists"
fi

echo ""
echo "=========================================="
echo "NEXT STEPS"
echo "=========================================="
echo ""
echo "1. Generate secure secrets:"
echo "   python3 scripts/generate-secrets.py"
echo ""
echo "2. Update backend/.env with generated secrets"
echo ""
echo "3. Install backend dependencies:"
echo "   cd backend"
echo "   pip install -r requirements.txt"
echo ""
echo "4. Run database migrations:"
echo "   python manage.py migrate"
echo ""
echo "5. Create superuser:"
echo "   python manage.py createsuperuser"
echo ""
echo "6. Start backend server:"
echo "   python manage.py runserver"
echo ""
echo "7. In a new terminal, install frontend dependencies:"
echo "   cd frontend"
echo "   npm install"
echo ""
echo "8. Start frontend server:"
echo "   npm run dev"
echo ""
echo "9. Open in VS Code Simple Browser:"
echo "   Right-click on http://localhost:3000"
echo "   Select 'Open in Simple Browser'"
echo ""
echo "=========================================="
echo "✓ Setup complete!"
echo "=========================================="

#!/bin/bash

# Watch Party Setup Verification Script
# This script checks if critical configuration is properly set up

echo "=========================================="
echo "WATCH PARTY - SETUP VERIFICATION"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if a value is a placeholder
is_placeholder() {
    local value="$1"
    if [[ "$value" =~ "your-" ]] || [[ "$value" =~ "your_" ]] || [[ "$value" =~ "change-this" ]] || [[ "$value" =~ "change_this" ]]; then
        return 0
    fi
    return 1
}

# Check if .env file exists
echo "Checking environment files..."
if [ ! -f "backend/.env" ]; then
    echo -e "${RED}✗ backend/.env file not found!${NC}"
    echo "  Create it from backend/.env.example"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✓ backend/.env exists${NC}"
    
    # Source the .env file
    export $(grep -v '^#' backend/.env | xargs)
    
    # Check critical secrets
    echo ""
    echo "Checking critical secrets..."
    
    # SECRET_KEY
    if [ -z "$SECRET_KEY" ] || is_placeholder "$SECRET_KEY"; then
        echo -e "${RED}✗ SECRET_KEY is not set or is a placeholder${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ SECRET_KEY is set${NC}"
    fi
    
    # JWT_SECRET_KEY
    if [ -z "$JWT_SECRET_KEY" ] || is_placeholder "$JWT_SECRET_KEY"; then
        echo -e "${RED}✗ JWT_SECRET_KEY is not set or is a placeholder${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ JWT_SECRET_KEY is set${NC}"
    fi
    
    # Check CORS settings
    echo ""
    echo "Checking CORS configuration..."
    if grep -q "CORS_ALLOW_ALL_ORIGINS = True" backend/config/settings/production.py; then
        echo -e "${RED}✗ CORS_ALLOW_ALL_ORIGINS is True in production (security risk!)${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ CORS_ALLOW_ALL_ORIGINS is properly restricted${NC}"
    fi
    
    # Check Stripe keys
    echo ""
    echo "Checking Stripe configuration..."
    if [[ "$STRIPE_PUBLISHABLE_KEY" =~ "pk_test_" ]]; then
        echo -e "${YELLOW}⚠ Stripe is in TEST mode${NC}"
        WARNINGS=$((WARNINGS + 1))
    elif [ -z "$STRIPE_PUBLISHABLE_KEY" ] || is_placeholder "$STRIPE_PUBLISHABLE_KEY"; then
        echo -e "${RED}✗ Stripe publishable key not configured${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✓ Stripe configured for production${NC}"
    fi
    
    # Check email configuration
    echo ""
    echo "Checking email configuration..."
    if [ -z "$EMAIL_HOST_USER" ]; then
        echo -e "${YELLOW}⚠ Email not configured (EMAIL_HOST_USER empty)${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ Email configuration present${NC}"
    fi
    
    # Check AWS configuration
    echo ""
    echo "Checking AWS configuration..."
    if [ -z "$AWS_STORAGE_BUCKET_NAME" ] || is_placeholder "$AWS_STORAGE_BUCKET_NAME"; then
        echo -e "${YELLOW}⚠ AWS S3 bucket not configured${NC}"
        WARNINGS=$((WARNINGS + 1))
    else
        echo -e "${GREEN}✓ AWS S3 bucket configured${NC}"
    fi
fi

# Check frontend environment
echo ""
echo "Checking frontend configuration..."
if [ ! -f "frontend/.env.local" ] && [ ! -f "frontend/.env.production" ]; then
    echo -e "${YELLOW}⚠ No frontend environment files found${NC}"
    echo "  Create frontend/.env.local for development"
    WARNINGS=$((WARNINGS + 1))
else
    echo -e "${GREEN}✓ Frontend environment files exist${NC}"
fi

# Check if Python is available
echo ""
echo "Checking Python environment..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓ Python available: $PYTHON_VERSION${NC}"
else
    echo -e "${RED}✗ Python 3 not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check if Node is available
echo ""
echo "Checking Node.js environment..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js available: $NODE_VERSION${NC}"
else
    echo -e "${RED}✗ Node.js not found${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Summary
echo ""
echo "=========================================="
echo "VERIFICATION SUMMARY"
echo "=========================================="

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Your setup looks good.${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup complete with $WARNINGS warning(s)${NC}"
    echo "Review the warnings above before deploying to production."
    exit 0
else
    echo -e "${RED}✗ Found $ERRORS error(s) and $WARNINGS warning(s)${NC}"
    echo "Please fix the errors above before proceeding."
    exit 1
fi

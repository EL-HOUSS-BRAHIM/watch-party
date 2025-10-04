#!/bin/bash

# Test script to verify backend URL configuration is correct
set -e

echo "🔍 Backend URL Configuration Validation"
echo "========================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Test 1: Check Dockerfile has NEXT_PUBLIC_* build args
echo ""
echo "Test 1: Checking Dockerfile..."
if grep -q "ARG NEXT_PUBLIC_API_URL=" frontend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Dockerfile has NEXT_PUBLIC_API_URL build arg"
else
    echo -e "${RED}✗${NC} Dockerfile missing NEXT_PUBLIC_API_URL build arg"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "ENV NEXT_PUBLIC_API_URL=" frontend/Dockerfile; then
    echo -e "${GREEN}✓${NC} Dockerfile sets NEXT_PUBLIC_API_URL environment variable"
else
    echo -e "${RED}✗${NC} Dockerfile missing NEXT_PUBLIC_API_URL environment variable"
    ERRORS=$((ERRORS + 1))
fi

# Test 2: Check docker-compose.yml has build args
echo ""
echo "Test 2: Checking docker-compose.yml..."
if grep -A 15 "frontend:" docker-compose.yml | grep -q "NEXT_PUBLIC_API_URL:"; then
    echo -e "${GREEN}✓${NC} docker-compose.yml passes NEXT_PUBLIC_API_URL as build arg"
else
    echo -e "${RED}✗${NC} docker-compose.yml missing NEXT_PUBLIC_API_URL build arg"
    ERRORS=$((ERRORS + 1))
fi

# Test 3: Check the value is correct
echo ""
echo "Test 3: Checking URL values..."
DOCKERFILE_URL=$(grep "ARG NEXT_PUBLIC_API_URL=" frontend/Dockerfile | cut -d'=' -f2)
COMPOSE_URL=$(grep -A 15 "frontend:" docker-compose.yml | grep "NEXT_PUBLIC_API_URL:" | cut -d'"' -f2)

if [[ "$DOCKERFILE_URL" == *"be-watch-party.brahim-elhouss.me"* ]]; then
    echo -e "${GREEN}✓${NC} Dockerfile default URL is correct: $DOCKERFILE_URL"
else
    echo -e "${RED}✗${NC} Dockerfile URL is incorrect: $DOCKERFILE_URL"
    ERRORS=$((ERRORS + 1))
fi

if [[ "$COMPOSE_URL" == *"be-watch-party.brahim-elhouss.me"* ]]; then
    echo -e "${GREEN}✓${NC} docker-compose.yml URL is correct: $COMPOSE_URL"
else
    echo -e "${RED}✗${NC} docker-compose.yml URL is incorrect: $COMPOSE_URL"
    ERRORS=$((ERRORS + 1))
fi

# Test 4: Check .env.example is updated
echo ""
echo "Test 4: Checking .env.example..."
if grep -q "BACKEND_URL=https://be-watch-party.brahim-elhouss.me" frontend/.env.example; then
    echo -e "${GREEN}✓${NC} .env.example has correct production BACKEND_URL"
else
    echo -e "${RED}✗${NC} .env.example BACKEND_URL is incorrect"
    ERRORS=$((ERRORS + 1))
fi

# Test 5: Check docker-compose.aws.yml
echo ""
echo "Test 5: Checking docker-compose.aws.yml..."
if grep -A 15 "frontend:" docker-compose.aws.yml | grep -q "NEXT_PUBLIC_API_URL:"; then
    echo -e "${GREEN}✓${NC} docker-compose.aws.yml passes NEXT_PUBLIC_API_URL as build arg"
else
    echo -e "${RED}✗${NC} docker-compose.aws.yml missing NEXT_PUBLIC_API_URL build arg"
    ERRORS=$((ERRORS + 1))
fi

# Test 6: Check setup script
echo ""
echo "Test 6: Checking deployment script..."
if grep -q "BACKEND_URL=https://be-watch-party.brahim-elhouss.me" scripts/deployment/setup-aws-environment.sh; then
    echo -e "${GREEN}✓${NC} setup-aws-environment.sh creates .env.local with correct URL"
else
    echo -e "${RED}✗${NC} setup-aws-environment.sh has incorrect URL"
    ERRORS=$((ERRORS + 1))
fi

# Test 7: Check for any references to wrong URL
echo ""
echo "Test 7: Checking for wrong URL references..."
WRONG_URLS=$(grep -r "http://backend:8000" frontend/.env.example 2>/dev/null || true)
if [ -z "$WRONG_URLS" ]; then
    echo -e "${GREEN}✓${NC} No references to http://backend:8000 in .env.example"
else
    echo -e "${YELLOW}⚠${NC} Found references to http://backend:8000 in .env.example"
    echo "  This is expected in comments for local development"
fi

# Summary
echo ""
echo "========================================"
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Configuration is correct. The frontend will:"
    echo "  - Use be-watch-party.brahim-elhouss.me for API calls"
    echo "  - Have correct URLs embedded in JavaScript bundle"
    echo "  - Connect to correct backend at runtime"
    exit 0
else
    echo -e "${RED}✗ $ERRORS test(s) failed!${NC}"
    echo ""
    echo "Please fix the configuration errors above."
    exit 1
fi

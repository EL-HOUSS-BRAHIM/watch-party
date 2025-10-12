#!/bin/bash

# =============================================================================
# COMPREHENSIVE CONFIGURATION VALIDATION SCRIPT
# =============================================================================
# Tests all Docker configurations, environment files, and deployment setup
# 
# Usage: bash scripts/tests/validate-configuration.sh
#
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

test_pass() {
    echo -e "${GREEN}✓${NC} $1"
    PASS=$((PASS + 1))
}

test_fail() {
    echo -e "${RED}✗${NC} $1"
    FAIL=$((FAIL + 1))
}

test_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARN=$((WARN + 1))
}

section_header() {
    echo ""
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo -e "${CYAN}$1${NC}"
    echo -e "${CYAN}═══════════════════════════════════════════════${NC}"
    echo ""
}

# ============================================================================
# TEST SUITE
# ============================================================================

section_header "DOCKER COMPOSE CONFIGURATION TESTS"

# Test 1: docker-compose.yml completeness
echo "Test 1: docker-compose.yml frontend configuration"
if grep -A 15 "context: ./frontend" docker-compose.yml | grep -q "NEXT_PUBLIC_API_URL:"; then
    test_pass "docker-compose.yml has NEXT_PUBLIC_API_URL in build args"
else
    test_fail "docker-compose.yml missing NEXT_PUBLIC_API_URL in build args"
fi

if grep -A 15 "context: ./frontend" docker-compose.yml | grep -q "NEXT_PUBLIC_FRONTEND_API:"; then
    test_pass "docker-compose.yml has NEXT_PUBLIC_FRONTEND_API in build args"
else
    test_fail "docker-compose.yml missing NEXT_PUBLIC_FRONTEND_API in build args"
fi

if grep -A 15 "context: ./frontend" docker-compose.yml | grep -q "NEXT_PUBLIC_WS_URL:"; then
    test_pass "docker-compose.yml has NEXT_PUBLIC_WS_URL in build args"
else
    test_fail "docker-compose.yml missing NEXT_PUBLIC_WS_URL in build args"
fi

# Test 2: docker-compose.aws.yml completeness
echo ""
echo "Test 2: docker-compose.aws.yml frontend configuration"
if grep -A 15 "context: ./frontend" docker-compose.aws.yml | grep -q "NEXT_PUBLIC_API_URL:"; then
    test_pass "docker-compose.aws.yml has NEXT_PUBLIC_API_URL in build args"
else
    test_fail "docker-compose.aws.yml missing NEXT_PUBLIC_API_URL in build args"
fi

# Test 3: docker-compose.dev.yml completeness
echo ""
echo "Test 3: docker-compose.dev.yml frontend configuration"
if grep -A 15 "context: ./frontend" docker-compose.dev.yml | grep -q "NEXT_PUBLIC_API_URL:"; then
    test_pass "docker-compose.dev.yml has NEXT_PUBLIC_API_URL in build args"
else
    test_fail "docker-compose.dev.yml missing NEXT_PUBLIC_API_URL in build args"
fi

# Test 4: URL consistency
echo ""
echo "Test 4: Production URL consistency across files"
COMPOSE_URL=$(grep "NEXT_PUBLIC_API_URL:" docker-compose.yml | head -1 | cut -d'"' -f2)
AWS_URL=$(grep "NEXT_PUBLIC_API_URL:" docker-compose.aws.yml | head -1 | cut -d'"' -f2)
BUILD_URL=$(grep "FRONTEND_API_URL=" scripts/deployment/build-docker-images.sh | cut -d'"' -f2)

if [ "$COMPOSE_URL" == "$AWS_URL" ] && [ "$COMPOSE_URL" == "$BUILD_URL" ]; then
    test_pass "Production URLs consistent: $COMPOSE_URL"
else
    test_warn "URLs differ: compose=$COMPOSE_URL, aws=$AWS_URL, build=$BUILD_URL"
fi

section_header "ENVIRONMENT FILE TESTS"

# Test 5: Backend .env.example
echo "Test 5: Backend .env.example configuration"
if [ -f backend/.env.example ]; then
    test_pass "backend/.env.example exists"
    
    if grep -q "^DEBUG=False" backend/.env.example; then
        test_pass "backend/.env.example has production-appropriate DEBUG=False"
    else
        test_warn "backend/.env.example has DEBUG=True (development default)"
    fi
    
    if grep -q "DJANGO_SETTINGS_MODULE=config.settings.production" backend/.env.example; then
        test_pass "backend/.env.example has production settings module"
    else
        test_warn "backend/.env.example has development settings module"
    fi
    
    if grep -q "ALLOWED_HOSTS=" backend/.env.example; then
        test_pass "backend/.env.example has ALLOWED_HOSTS"
    else
        test_fail "backend/.env.example missing ALLOWED_HOSTS"
    fi
    
    if grep -q "DATABASE_URL=" backend/.env.example; then
        test_pass "backend/.env.example has DATABASE_URL"
    else
        test_fail "backend/.env.example missing DATABASE_URL"
    fi
else
    test_fail "backend/.env.example not found"
fi

# Test 6: Frontend .env.example
echo ""
echo "Test 6: Frontend .env.example configuration"
if [ -f frontend/.env.example ]; then
    test_pass "frontend/.env.example exists"
    
    if grep -q "BACKEND_URL=" frontend/.env.example; then
        test_pass "frontend/.env.example has BACKEND_URL"
    else
        test_fail "frontend/.env.example missing BACKEND_URL"
    fi
    
    if grep -q "NEXT_PUBLIC_API_URL=" frontend/.env.example; then
        test_pass "frontend/.env.example has NEXT_PUBLIC_API_URL"
    else
        test_fail "frontend/.env.example missing NEXT_PUBLIC_API_URL"
    fi
    
    if grep -q "NEXT_PUBLIC_WS_URL=" frontend/.env.example; then
        test_pass "frontend/.env.example has NEXT_PUBLIC_WS_URL"
    else
        test_fail "frontend/.env.example missing NEXT_PUBLIC_WS_URL"
    fi
else
    test_fail "frontend/.env.example not found"
fi

section_header "DOCKERFILE TESTS"

# Test 7: Frontend Dockerfile
echo "Test 7: Frontend Dockerfile configuration"
if [ -f frontend/Dockerfile ]; then
    test_pass "frontend/Dockerfile exists"
    
    # Check for required ARG declarations
    if grep -q "ARG NEXT_PUBLIC_API_URL" frontend/Dockerfile; then
        test_pass "frontend/Dockerfile declares NEXT_PUBLIC_API_URL"
    else
        test_fail "frontend/Dockerfile missing NEXT_PUBLIC_API_URL declaration"
    fi
    
    if grep -q "ARG NEXT_PUBLIC_FRONTEND_API" frontend/Dockerfile; then
        test_pass "frontend/Dockerfile declares NEXT_PUBLIC_FRONTEND_API"
    else
        test_fail "frontend/Dockerfile missing NEXT_PUBLIC_FRONTEND_API declaration"
    fi
    
    if grep -q "ARG NEXT_PUBLIC_WS_URL" frontend/Dockerfile; then
        test_pass "frontend/Dockerfile declares NEXT_PUBLIC_WS_URL"
    else
        test_fail "frontend/Dockerfile missing NEXT_PUBLIC_WS_URL declaration"
    fi
    
    # Check for ENV declarations
    if grep -q "ENV NEXT_PUBLIC_API_URL=" frontend/Dockerfile; then
        test_pass "frontend/Dockerfile sets NEXT_PUBLIC_API_URL as ENV"
    else
        test_fail "frontend/Dockerfile missing NEXT_PUBLIC_API_URL ENV"
    fi
else
    test_fail "frontend/Dockerfile not found"
fi

# Test 8: Backend Dockerfile
echo ""
echo "Test 8: Backend Dockerfile configuration"
if [ -f backend/Dockerfile ]; then
    test_pass "backend/Dockerfile exists"
else
    test_fail "backend/Dockerfile not found"
fi

section_header "DEPLOYMENT SCRIPT TESTS"

# Test 9: Deployment scripts exist
echo "Test 9: Deployment scripts existence"
for script in deploy-main.sh setup-aws-environment.sh setup-ssl-certificates.sh build-docker-images.sh deploy-services.sh health-checks.sh; do
    if [ -f "scripts/deployment/$script" ]; then
        test_pass "scripts/deployment/$script exists"
    else
        test_fail "scripts/deployment/$script missing"
    fi
done

# Test 10: setup-aws-environment.sh correctness
echo ""
echo "Test 10: setup-aws-environment.sh configuration"
if grep -q "DJANGO_SETTINGS_MODULE=config.settings.production" scripts/deployment/setup-aws-environment.sh; then
    test_pass "setup-aws-environment.sh uses production settings"
else
    test_fail "setup-aws-environment.sh missing production settings"
fi

if grep -q "BACKEND_URL=https://be-watch-party.brahim-elhouss.me" scripts/deployment/setup-aws-environment.sh; then
    test_pass "setup-aws-environment.sh sets correct BACKEND_URL"
else
    test_fail "setup-aws-environment.sh missing correct BACKEND_URL"
fi

# Test 11: build-docker-images.sh build args
echo ""
echo "Test 11: build-docker-images.sh build arguments"
if grep -q "NEXT_PUBLIC_API_URL=" scripts/deployment/build-docker-images.sh; then
    test_pass "build-docker-images.sh passes NEXT_PUBLIC_API_URL"
else
    test_fail "build-docker-images.sh missing NEXT_PUBLIC_API_URL"
fi

if grep -q "NEXT_PUBLIC_FRONTEND_API=" scripts/deployment/build-docker-images.sh; then
    test_pass "build-docker-images.sh passes NEXT_PUBLIC_FRONTEND_API"
else
    test_fail "build-docker-images.sh missing NEXT_PUBLIC_FRONTEND_API"
fi

section_header "GITHUB ACTIONS WORKFLOW TESTS"

# Test 12: GitHub Actions workflow
echo "Test 12: GitHub Actions workflow configuration"
if [ -f .github/workflows/deploy.yml ]; then
    test_pass ".github/workflows/deploy.yml exists"
    
    if grep -q "deploy-main.sh" .github/workflows/deploy.yml; then
        test_pass "Workflow calls deploy-main.sh"
    else
        test_warn "Workflow doesn't call deploy-main.sh"
    fi
    
    if grep -q "AWS_ACCESS_KEY_ID" .github/workflows/deploy.yml; then
        test_pass "Workflow includes AWS_ACCESS_KEY_ID"
    else
        test_fail "Workflow missing AWS_ACCESS_KEY_ID"
    fi
    
    if grep -q "SSL_ORIGIN" .github/workflows/deploy.yml; then
        test_pass "Workflow includes SSL_ORIGIN secret"
    else
        test_fail "Workflow missing SSL_ORIGIN secret"
    fi
else
    test_fail ".github/workflows/deploy.yml not found"
fi

section_header "SECURITY TESTS"

# Test 13: .gitignore
echo "Test 13: Security - .gitignore configuration"
if grep -q "^\.env$" .gitignore; then
    test_pass ".gitignore excludes .env files"
else
    test_warn ".gitignore might not exclude .env files"
fi

if grep -q "^\.env\.local$" .gitignore; then
    test_pass ".gitignore excludes .env.local files"
else
    test_warn ".gitignore might not exclude .env.local files"
fi

# Test 14: No committed secrets
echo ""
echo "Test 14: Security - No committed environment files"
if git ls-files | grep -E "\.env$|\.env\.local$" | grep -v example; then
    test_fail "Found committed .env files (security risk)"
else
    test_pass "No .env files committed (correct)"
fi

# ============================================================================
# SUMMARY
# ============================================================================

section_header "TEST SUMMARY"

TOTAL=$((PASS + FAIL + WARN))
echo -e "Total Tests:     ${BLUE}$TOTAL${NC}"
echo -e "Passed:          ${GREEN}$PASS${NC}"
echo -e "Failed:          ${RED}$FAIL${NC}"
echo -e "Warnings:        ${YELLOW}$WARN${NC}"

echo ""
if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  ✓ ALL CRITICAL TESTS PASSED!         ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    
    if [ $WARN -gt 0 ]; then
        echo ""
        echo -e "${YELLOW}Note: There are $WARN warning(s) that should be reviewed.${NC}"
    fi
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║  ✗ TESTS FAILED - REVIEW REQUIRED     ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    exit 1
fi

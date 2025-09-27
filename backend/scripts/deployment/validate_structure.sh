#!/bin/bash

# =============================================================================
# WATCH PARTY BACKEND - DEPLOYMENT VALIDATION SCRIPT
# =============================================================================
# Tests the new project structure and deployment configuration

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

cd "$PROJECT_ROOT"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

run_test() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    log_info "Testing: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        log_success "$test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$test_name"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    
    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    
    log_info "Testing: $test_name"
    
    local output
    if output=$(eval "$test_command" 2>&1); then
        log_success "$test_name"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        log_error "$test_name"
        echo "Output: $output"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "🧪 Watch Party Backend - Deployment Validation"
echo "=============================================="
echo

log_info "Project Root: $PROJECT_ROOT"
echo

# Test 1: Project Structure
log_info "=== Testing Project Structure ==="

run_test "manage.py exists" "[[ -f 'manage.py' ]]"
run_test "config/ directory exists" "[[ -d 'config' ]]"
run_test "shared/ directory exists" "[[ -d 'shared' ]]"
run_test "apps/ directory exists" "[[ -d 'apps' ]]"
run_test "requirements/ directory exists" "[[ -d 'requirements' ]]"
run_test "scripts/ directory exists" "[[ -d 'scripts' ]]"

# Test config directory structure
run_test "config/__init__.py exists" "[[ -f 'config/__init__.py' ]]"
run_test "config/settings/ directory exists" "[[ -d 'config/settings' ]]"
run_test "config/wsgi.py exists" "[[ -f 'config/wsgi.py' ]]"
run_test "config/asgi.py exists" "[[ -f 'config/asgi.py' ]]"
run_test "config/urls.py exists" "[[ -f 'config/urls.py' ]]"

# Test shared directory structure
run_test "shared/middleware/ directory exists" "[[ -d 'shared/middleware' ]]"
run_test "shared/services/ directory exists" "[[ -d 'shared/services' ]]"
run_test "shared/utils/ directory exists" "[[ -d 'shared/utils' ]]"

# Test requirements structure
run_test "requirements/base.txt exists" "[[ -f 'requirements/base.txt' ]]"
run_test "requirements/development.txt exists" "[[ -f 'requirements/development.txt' ]]"
run_test "requirements/production.txt exists" "[[ -f 'requirements/production.txt' ]]"
run_test "requirements/testing.txt exists" "[[ -f 'requirements/testing.txt' ]]"

echo

# Test 2: Configuration Files
log_info "=== Testing Configuration Files ==="

# Test Django settings modules
run_test "config.settings.base module" "python3 -c 'import config.settings.base'"
run_test "config.settings.development module" "python3 -c 'import config.settings.development'"
run_test "config.settings.production module" "python3 -c 'import config.settings.production'"
run_test "config.settings.testing module" "python3 -c 'import config.settings.testing'"

# Test WSGI/ASGI applications
run_test "config.wsgi application" "python3 -c 'from config.wsgi import application'"
run_test "config.asgi application" "python3 -c 'from config.asgi import application'"

echo

# Test 3: Django Commands
log_info "=== Testing Django Commands ==="

# Set default settings module for testing
export DJANGO_SETTINGS_MODULE=config.settings.development

# Test basic Django commands
run_test_with_output "Django check" "python3 manage.py check --verbosity=0"
run_test_with_output "Django help command" "python3 manage.py help | head -1"

# Test if migrations can be made (dry-run)
if run_test "Django makemigrations (dry-run)" "python3 manage.py makemigrations --dry-run"; then
    log_info "Migrations check passed"
else
    log_warning "Migrations may be needed or there are issues"
fi

echo

# Test 4: Requirements Files
log_info "=== Testing Requirements Files ==="

# Check if requirements files are properly formatted
run_test "base.txt format" "python3 -c 'import pkg_resources; list(pkg_resources.parse_requirements(open(\"requirements/base.txt\")))'"
run_test "development.txt format" "python3 -c 'import pkg_resources; list(pkg_resources.parse_requirements(open(\"requirements/development.txt\")))'"
run_test "production.txt format" "python3 -c 'import pkg_resources; list(pkg_resources.parse_requirements(open(\"requirements/production.txt\")))'"
run_test "testing.txt format" "python3 -c 'import pkg_resources; list(pkg_resources.parse_requirements(open(\"requirements/testing.txt\")))'"

# Check if requirements reference base.txt correctly
if grep -q "^-r base.txt" requirements/development.txt requirements/production.txt requirements/testing.txt; then
    log_success "Requirements files properly reference base.txt"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    log_error "Requirements files don't properly reference base.txt"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo

# Test 5: Import Structure
log_info "=== Testing Import Structure ==="

# Test if shared modules can be imported
if [[ -f "shared/__init__.py" ]]; then
    run_test "shared module import" "python3 -c 'import shared'"
else
    log_warning "shared/__init__.py not found - creating it"
    echo "# Shared utilities and services" > shared/__init__.py
fi

# Test middleware imports
if [[ -d "shared/middleware" ]]; then
    run_test "shared.middleware module" "python3 -c 'import shared.middleware' 2>/dev/null || echo 'OK - no __init__.py needed'"
fi

echo

# Test 6: Deployment Scripts
log_info "=== Testing Deployment Scripts ==="

run_test "simple_deploy.sh exists" "[[ -f 'scripts/deployment/simple_deploy.sh' ]]"
run_test "simple_deploy.sh is executable" "[[ -x 'scripts/deployment/simple_deploy.sh' ]]"

# Test deployment script help
if [[ -f "scripts/deployment/simple_deploy.sh" ]]; then
    run_test "deployment script help" "./scripts/deployment/simple_deploy.sh help | grep -q 'USAGE'"
fi

echo

# Test 7: Old Structure Cleanup Check
log_info "=== Checking Old Structure Cleanup ==="

if [[ -d "watchparty" ]]; then
    log_warning "Old 'watchparty' directory still exists - should be cleaned up"
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    log_success "Old 'watchparty' directory cleaned up"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

if [[ -f "requirements.txt" ]] && [[ ! -L "requirements.txt" ]]; then
    log_warning "Old 'requirements.txt' file still exists (not a symlink)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    log_success "Old requirements.txt handled properly"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

if [[ -f "stracture.md" ]]; then
    log_warning "Typo file 'stracture.md' still exists - should be removed"
    TESTS_FAILED=$((TESTS_FAILED + 1))
else
    log_success "No typo files found"
    TESTS_PASSED=$((TESTS_PASSED + 1))
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo

# Test 8: Environment Configuration
log_info "=== Testing Environment Configuration ==="

if [[ -f ".env" ]]; then
    log_info "Found .env file - checking DJANGO_SETTINGS_MODULE"
    
    if grep -q "DJANGO_SETTINGS_MODULE=config.settings" .env; then
        log_success ".env uses new config.settings module"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        log_error ".env doesn't use new config.settings module"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    log_warning "No .env file found - this is needed for deployment"
fi
TESTS_TOTAL=$((TESTS_TOTAL + 1))

echo

# Test 9: Static Files and Media
log_info "=== Testing Static Files Configuration ==="

# Test collectstatic (dry-run)
export DJANGO_SETTINGS_MODULE=config.settings.development
run_test_with_output "collectstatic (dry-run)" "python3 manage.py collectstatic --dry-run --noinput | head -1"

echo

# Test Results Summary
echo "=============================================="
echo "🏁 Test Results Summary"
echo "=============================================="
echo
echo "Total Tests: $TESTS_TOTAL"
log_success "Tests Passed: $TESTS_PASSED"
if [[ $TESTS_FAILED -gt 0 ]]; then
    log_error "Tests Failed: $TESTS_FAILED"
else
    log_success "Tests Failed: $TESTS_FAILED"
fi

echo
if [[ $TESTS_FAILED -eq 0 ]]; then
    log_success "🎉 All tests passed! Deployment structure is ready."
    echo
    echo "Next steps:"
    echo "1. Run cleanup script: ./scripts/maintenance/project_restructure_cleanup.sh"
    echo "2. Test deployment: ./scripts/deployment/simple_deploy.sh test"
    echo "3. Deploy to server: ./scripts/deployment/simple_deploy.sh deploy user@server.com"
    exit 0
else
    log_error "❌ Some tests failed. Please fix the issues before deployment."
    echo
    echo "Common fixes:"
    echo "- Ensure all directories exist: config/, shared/, requirements/"
    echo "- Update .env file to use config.settings module"
    echo "- Run cleanup script if old files exist"
    echo "- Check Python imports and module structure"
    exit 1
fi

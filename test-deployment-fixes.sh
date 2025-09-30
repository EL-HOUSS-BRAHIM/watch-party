#!/bin/bash

# =============================================================================
# DEPLOYMENT FIXES VALIDATION SCRIPT  
# =============================================================================
# This script validates the specific fixes made for deployment issues
# Author: GitHub Copilot Agent
# =============================================================================

set -e

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

readonly CHECK="✅"
readonly CROSS="❌"
readonly WARNING="⚠️"
readonly INFO="ℹ️"

log_info() { echo -e "${BLUE}${INFO} $1${NC}"; }
log_success() { echo -e "${GREEN}${CHECK} $1${NC}"; }
log_warning() { echo -e "${YELLOW}${WARNING} $1${NC}"; }
log_error() { echo -e "${RED}${CROSS} $1${NC}"; }

print_header() {
    echo
    echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    🔍 Deployment Fixes Validation (New)                       ║${NC}"
    echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo
}

check_django_celery_beat() {
    log_info "Checking django-celery-beat dependency fix..."
    
    if grep -q "django-celery-beat" backend/requirements.txt; then
        local version
        version=$(grep "django-celery-beat" backend/requirements.txt | cut -d'=' -f3)
        log_success "django-celery-beat==${version} found in requirements.txt"
        return 0
    else
        log_error "django-celery-beat missing from requirements.txt"
        return 1
    fi
}

check_docker_optimizations() {
    log_info "Checking Docker build optimizations..."
    
    local checks=0
    local passed=0
    
    # Check frontend Dockerfile optimizations
    if grep -q "NODE_OPTIONS.*max-old-space-size" frontend/Dockerfile; then
        log_success "Frontend Dockerfile has memory optimization"
        ((passed++))
    else
        log_error "Frontend Dockerfile missing memory optimization"
    fi
    ((checks++))
    
    # Check network timeout configuration
    if grep -q "network-timeout" frontend/Dockerfile; then
        log_success "Frontend Dockerfile has network timeout configuration"
        ((passed++))
    else
        log_error "Frontend Dockerfile missing network timeout configuration"
    fi
    ((checks++))
    
    # Check Docker Compose health checks with start periods
    if grep -q "start_period" docker-compose.yml; then
        log_success "Docker Compose has enhanced health checks"
        ((passed++))
    else
        log_error "Docker Compose missing enhanced health checks"
    fi
    ((checks++))
    
    # Check image reuse in Docker Compose
    if grep -q "image: watchparty-backend:latest" docker-compose.yml; then
        log_success "Docker Compose has image reuse optimization"
        ((passed++))
    else
        log_error "Docker Compose missing image reuse optimization"
    fi
    ((checks++))
    
    if [ $passed -eq $checks ]; then
        log_success "All Docker optimizations are in place (${passed}/${checks})"
        return 0
    else
        log_warning "Some Docker optimizations missing (${passed}/${checks})"
        return 1
    fi
}

check_deployment_workflow() {
    log_info "Checking deployment workflow enhancements..."
    
    local checks=0
    local passed=0
    
    # Check for build timeout handling
    if grep -q "timeout 1200" .github/workflows/deploy.yml; then
        log_success "Deployment workflow has build timeout handling (20 min)"
        ((passed++))
    else
        log_error "Deployment workflow missing build timeout handling"
    fi
    ((checks++))
    
    # Check for BuildKit optimization
    if grep -q "DOCKER_BUILDKIT=1" .github/workflows/deploy.yml; then
        log_success "Deployment workflow has BuildKit optimization"
        ((passed++))
    else
        log_error "Deployment workflow missing BuildKit optimization"
    fi
    ((checks++))
    
    # Check for staged deployment
    if grep -q "Starting backend service" .github/workflows/deploy.yml; then
        log_success "Deployment workflow has staged service startup"
        ((passed++))
    else
        log_error "Deployment workflow missing staged service startup"
    fi
    ((checks++))
    
    # Check for enhanced health checks
    if grep -q "Testing frontend health" .github/workflows/deploy.yml; then
        log_success "Deployment workflow has enhanced health checks"
        ((passed++))
    else
        log_error "Deployment workflow missing enhanced health checks"
    fi
    ((checks++))
    
    if [ $passed -eq $checks ]; then
        log_success "All deployment workflow enhancements are in place (${passed}/${checks})"
        return 0
    else
        log_warning "Some deployment workflow enhancements missing (${passed}/${checks})"
        return 1
    fi
}

check_aws_documentation() {
    log_info "Checking AWS IAM policy fix documentation..."
    
    if [ -f "AWS_IAM_POLICY_FIX.md" ]; then
        log_success "AWS IAM policy fix documentation created"
        
        # Check if it contains the specific policy
        if grep -q "secretsmanager:GetSecretValue" AWS_IAM_POLICY_FIX.md; then
            log_success "Documentation contains required IAM permissions"
        else
            log_warning "Documentation may be incomplete"
        fi
        return 0
    else
        log_error "AWS IAM policy fix documentation missing"
        return 1
    fi
}

run_syntax_checks() {
    log_info "Running syntax checks..."
    
    local checks=0
    local passed=0
    
    # Check Docker Compose syntax
    if command -v docker-compose &> /dev/null; then
        if docker-compose config > /dev/null 2>&1; then
            log_success "Docker Compose syntax is valid"
            ((passed++))
        else
            log_error "Docker Compose syntax error"
        fi
        ((checks++))
    fi
    
    # Check Dockerfile syntax (basic)
    if [ -f backend/Dockerfile ] && [ -f frontend/Dockerfile ]; then
        log_success "Dockerfiles exist"
        ((passed++))
    else
        log_error "Some Dockerfiles missing"
    fi
    ((checks++))
    
    if [ $passed -eq $checks ]; then
        return 0
    else
        return 1
    fi
}

generate_detailed_report() {
    local overall_status="$1"
    
    echo
    echo "==========================================="
    echo "    DEPLOYMENT FIXES VALIDATION REPORT"
    echo "==========================================="
    echo "Timestamp: $(date)"
    echo "Project: Watch Party Deployment Fixes"
    echo
    
    if [ "$overall_status" = "success" ]; then
        echo "✅ OVERALL STATUS: ALL FIXES VALIDATED"
        echo
        echo "🎯 Issues Fixed:"
        echo "  ✅ Missing django-celery-beat dependency"
        echo "  ✅ Docker build timeout and memory issues"
        echo "  ✅ Deployment workflow optimization"
        echo "  ✅ AWS IAM permissions documentation"
        echo
        echo "🚀 Ready for Deployment:"
        echo "  1. Push changes to master branch"
        echo "  2. Monitor GitHub Actions deployment"
        echo "  3. Apply AWS IAM policy if needed (see AWS_IAM_POLICY_FIX.md)"
        echo "  4. Verify services are healthy"
        echo
        echo "📊 Expected Improvements:"
        echo "  • Faster Docker builds with better caching"
        echo "  • Reduced frontend build timeouts"
        echo "  • Better error handling and logging"
        echo "  • Staged service startup for reliability"
    else
        echo "❌ OVERALL STATUS: SOME ISSUES REMAIN"
        echo
        echo "Please address the failed checks above before deploying."
        echo "Each fix is important for deployment stability."
    fi
    
    echo
    echo "==========================================="
}

main() {
    print_header
    
    local checks=(
        "check_django_celery_beat"
        "check_docker_optimizations" 
        "check_deployment_workflow"
        "check_aws_documentation"
        "run_syntax_checks"
    )
    
    local failed_checks=()
    
    for check in "${checks[@]}"; do
        if ! $check; then
            failed_checks+=("$check")
        fi
        echo
    done
    
    if [ ${#failed_checks[@]} -eq 0 ]; then
        generate_detailed_report "success"
        exit 0
    else
        generate_detailed_report "failed"
        echo "❌ Failed checks: ${failed_checks[*]}"
        exit 1
    fi
}

case "${1:-}" in
    --help|-h)
        echo "Deployment Fixes Validation Script"
        echo
        echo "Usage: $0"
        echo
        echo "Validates deployment fixes for:"
        echo "• django-celery-beat dependency issue"
        echo "• Docker build optimization and timeout handling" 
        echo "• GitHub Actions workflow improvements"
        echo "• AWS IAM permissions documentation"
        ;;
    *)
        main
        ;;
esac
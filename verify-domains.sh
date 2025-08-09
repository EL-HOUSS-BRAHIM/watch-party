#!/bin/bash

# Domain Configuration Verification Script
# Verifies that all configuration files have the correct domains

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Expected domains
EXPECTED_FRONTEND="watch-party.brahim-elhouss.me"
EXPECTED_BACKEND="be-watch-party.brahim-elhouss.me"

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[i]${NC} $1"
}

print_section() {
    echo -e "\n${BLUE}==================== $1 ====================${NC}"
}

check_file_domains() {
    local file="$1"
    local description="$2"
    
    if [ ! -f "$file" ]; then
        print_warning "$description: File not found - $file"
        return 1
    fi
    
    local issues=0
    
    # Check for expected domains
    if grep -q "$EXPECTED_FRONTEND" "$file"; then
        print_status "$description: Frontend domain found ✓"
    else
        print_error "$description: Frontend domain NOT found"
        ((issues++))
    fi
    
    if grep -q "$EXPECTED_BACKEND" "$file"; then
        print_status "$description: Backend domain found ✓"
    else
        print_error "$description: Backend domain NOT found"
        ((issues++))
    fi
    
    # Check for old/incorrect domains
    if grep -q "vercel.app\|localhost:3000\|127.0.0.1:3000" "$file"; then
        print_warning "$description: Found development/old domains"
        echo "  $(grep -n "vercel.app\|localhost:3000\|127.0.0.1:3000" "$file" | head -3)"
    fi
    
    return $issues
}

main() {
    print_section "DOMAIN CONFIGURATION VERIFICATION"
    
    print_info "Expected domains:"
    print_info "  Frontend: $EXPECTED_FRONTEND"
    print_info "  Backend:  $EXPECTED_BACKEND"
    
    local total_issues=0
    
    print_section "CHECKING DEPLOYMENT SCRIPTS"
    check_file_domains "deploy.sh" "Deploy Script" || ((total_issues++))
    check_file_domains "health-check.sh" "Health Check Script" || ((total_issues++))
    check_file_domains "backup.sh" "Backup Script" || ((total_issues++))
    
    print_section "CHECKING BACKEND CONFIGURATION"
    check_file_domains "back-end/.env.production.example" "Backend Prod Template" || ((total_issues++))
    check_file_domains "back-end/watchparty/settings/production.py" "Django Production Settings" || ((total_issues++))
    
    if [ -f "back-end/.env" ]; then
        check_file_domains "back-end/.env" "Backend Environment" || ((total_issues++))
    else
        print_warning "Backend .env file not found (will be created during deployment)"
    fi
    
    print_section "CHECKING FRONTEND CONFIGURATION"
    check_file_domains "front-end/.env.production.example" "Frontend Prod Template" || ((total_issues++))
    check_file_domains "front-end/.env.local" "Frontend Local Environment" || ((total_issues++))
    
    print_section "CHECKING DOCUMENTATION"
    check_file_domains "README.md" "README Documentation" || ((total_issues++))
    
    print_section "CHECKING GITHUB ACTIONS"
    if [ -f ".github/workflows/deploy.yml" ]; then
        if grep -q "watch-party" ".github/workflows/deploy.yml"; then
            print_status "GitHub Actions: Domain references found ✓"
        else
            print_warning "GitHub Actions: No domain references (may be intentional)"
        fi
    else
        print_warning "GitHub Actions workflow not found"
    fi
    
    print_section "DOMAIN DNS VERIFICATION"
    print_info "Checking DNS resolution..."
    
    for domain in "$EXPECTED_FRONTEND" "$EXPECTED_BACKEND"; do
        if command -v dig &> /dev/null; then
            local ip=$(dig +short "$domain" | head -1)
            if [ -n "$ip" ]; then
                print_status "$domain resolves to $ip"
            else
                print_warning "$domain does not resolve"
            fi
        elif command -v nslookup &> /dev/null; then
            if nslookup "$domain" &> /dev/null; then
                print_status "$domain resolves ✓"
            else
                print_warning "$domain does not resolve"
            fi
        else
            print_info "DNS tools not available, skipping DNS check"
            break
        fi
    done
    
    print_section "CORS CONFIGURATION CHECK"
    if [ -f "back-end/.env" ] || [ -f "back-end/.env.production.example" ]; then
        local env_file="back-end/.env"
        [ -f "$env_file" ] || env_file="back-end/.env.production.example"
        
        if grep -q "CORS_ALLOWED_ORIGINS.*$EXPECTED_FRONTEND" "$env_file"; then
            print_status "CORS configuration includes frontend domain ✓"
        else
            print_error "CORS configuration may be missing frontend domain"
            echo "  Check CORS_ALLOWED_ORIGINS in $env_file"
            ((total_issues++))
        fi
    fi
    
    print_section "SSL CERTIFICATE PATHS CHECK"
    if grep -q "/etc/letsencrypt/live/$EXPECTED_FRONTEND" deploy.sh && \
       grep -q "/etc/letsencrypt/live/$EXPECTED_BACKEND" deploy.sh; then
        print_status "SSL certificate paths are correctly configured ✓"
    else
        print_error "SSL certificate paths may be incorrect"
        ((total_issues++))
    fi
    
    print_section "SUMMARY"
    if [ $total_issues -eq 0 ]; then
        print_status "All domain configurations are correct! 🎉"
        print_info ""
        print_info "Your domains are properly configured:"
        print_info "  Frontend: https://$EXPECTED_FRONTEND"
        print_info "  Backend:  https://$EXPECTED_BACKEND"
        print_info "  API:      https://$EXPECTED_BACKEND/api/"
        print_info "  Admin:    https://$EXPECTED_BACKEND/admin/"
        exit 0
    else
        print_error "$total_issues domain configuration issue(s) found! ❌"
        print_info ""
        print_info "Please review the issues above and update the configurations."
        print_info "You can run this script again after making changes."
        exit 1
    fi
}

# Parse command line arguments
case "${1:-verify}" in
    verify)
        main
        ;;
    urls)
        print_section "APPLICATION URLS"
        print_info "Frontend: https://$EXPECTED_FRONTEND"
        print_info "Backend:  https://$EXPECTED_BACKEND"
        print_info "API:      https://$EXPECTED_BACKEND/api/"
        print_info "Admin:    https://$EXPECTED_BACKEND/admin/"
        print_info "Health:   https://$EXPECTED_BACKEND/health/"
        ;;
    domains)
        print_section "CONFIGURED DOMAINS"
        echo "Frontend Domain: $EXPECTED_FRONTEND"
        echo "Backend Domain:  $EXPECTED_BACKEND"
        echo ""
        echo "These domains should both point to your server IP address."
        ;;
    *)
        echo "Usage: $0 {verify|urls|domains}"
        echo ""
        echo "Commands:"
        echo "  verify   - Verify domain configuration in all files (default)"
        echo "  urls     - Display all application URLs"
        echo "  domains  - Show configured domain names"
        exit 1
        ;;
esac

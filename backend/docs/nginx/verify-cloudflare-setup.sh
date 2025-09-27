#!/bin/bash

# Cloudflare Full (Strict) SSL Verification Script
# This script helps verify your Cloudflare and Nginx configuration

set -e

echo "=== Cloudflare Full (Strict) SSL Configuration Verification ==="
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    local status=$1
    local message=$2
    if [[ $status == "OK" ]]; then
        echo -e "${GREEN}✅ $message${NC}"
    elif [[ $status == "WARNING" ]]; then
        echo -e "${YELLOW}⚠️  $message${NC}"
    elif [[ $status == "ERROR" ]]; then
        echo -e "${RED}❌ $message${NC}"
    else
        echo -e "${BLUE}ℹ️  $message${NC}"
    fi
}

echo "🔍 Checking Nginx Configuration..."
echo "================================="

# Check if nginx is installed
if command -v nginx > /dev/null 2>&1; then
    print_status "OK" "Nginx is installed"
    nginx_version=$(nginx -v 2>&1 | grep -o '[0-9.]*')
    print_status "INFO" "Nginx version: $nginx_version"
else
    print_status "ERROR" "Nginx is not installed"
    exit 1
fi

# Check nginx configuration syntax
echo ""
echo "Testing Nginx configuration syntax..."
if nginx -t > /dev/null 2>&1; then
    print_status "OK" "Nginx configuration syntax is valid"
else
    print_status "ERROR" "Nginx configuration has syntax errors"
    echo "Run 'nginx -t' to see detailed errors"
fi

# Check if nginx is running
if systemctl is-active --quiet nginx; then
    print_status "OK" "Nginx service is running"
else
    print_status "WARNING" "Nginx service is not running"
    echo "Start with: sudo systemctl start nginx"
fi

echo ""
echo "📁 Checking SSL Certificate Files..."
echo "==================================="

# Check for SSL certificates
if [[ -f "/etc/ssl/certs/cloudflare-origin.crt" ]]; then
    print_status "OK" "Cloudflare origin certificate found"
    
    # Verify certificate validity
    if openssl x509 -in /etc/ssl/certs/cloudflare-origin.crt -text -noout > /dev/null 2>&1; then
        print_status "OK" "Certificate file is valid"
        
        # Check certificate expiration
        expiry_date=$(openssl x509 -in /etc/ssl/certs/cloudflare-origin.crt -noout -enddate | cut -d= -f2)
        print_status "INFO" "Certificate expires: $expiry_date"
        
        # Check certificate subject
        subject=$(openssl x509 -in /etc/ssl/certs/cloudflare-origin.crt -noout -subject | cut -d= -f2-)
        print_status "INFO" "Certificate subject: $subject"
        
    else
        print_status "ERROR" "Certificate file is invalid"
    fi
else
    print_status "WARNING" "Cloudflare origin certificate not found at /etc/ssl/certs/cloudflare-origin.crt"
fi

if [[ -f "/etc/ssl/private/cloudflare-origin.key" ]]; then
    print_status "OK" "Cloudflare origin private key found"
    
    # Verify private key
    if openssl rsa -in /etc/ssl/private/cloudflare-origin.key -check -noout > /dev/null 2>&1; then
        print_status "OK" "Private key file is valid"
    else
        print_status "ERROR" "Private key file is invalid"
    fi
    
    # Check key permissions
    key_perms=$(stat -c "%a" /etc/ssl/private/cloudflare-origin.key)
    if [[ "$key_perms" == "600" ]]; then
        print_status "OK" "Private key has correct permissions (600)"
    else
        print_status "WARNING" "Private key permissions are $key_perms (should be 600)"
        echo "Fix with: sudo chmod 600 /etc/ssl/private/cloudflare-origin.key"
    fi
else
    print_status "WARNING" "Cloudflare origin private key not found at /etc/ssl/private/cloudflare-origin.key"
fi

echo ""
echo "🌐 Checking Domain and SSL..."
echo "============================="

# Test domain resolution
domain="be-watch-party.brahim-elhouss.me"
if nslookup "$domain" > /dev/null 2>&1; then
    print_status "OK" "Domain $domain resolves correctly"
    ip_address=$(nslookup "$domain" | grep -A1 "Name:" | tail -1 | awk '{print $2}')
    print_status "INFO" "Domain points to: $ip_address"
else
    print_status "ERROR" "Domain $domain does not resolve"
fi

# Check if we can connect to the domain
echo ""
echo "Testing HTTPS connectivity..."
if curl -s -o /dev/null -w "%{http_code}" "https://$domain/health/" | grep -q "200\|404"; then
    print_status "OK" "HTTPS connection to $domain successful"
else
    print_status "WARNING" "Could not establish HTTPS connection to $domain"
fi

# Check Cloudflare headers
echo ""
echo "🔗 Checking Cloudflare Integration..."
echo "===================================="

cf_headers=$(curl -s -I "https://$domain/" 2>/dev/null | grep -i "cf-\|cloudflare" || true)
if [[ -n "$cf_headers" ]]; then
    print_status "OK" "Cloudflare headers detected"
    echo "$cf_headers" | while IFS= read -r line; do
        print_status "INFO" "  $line"
    done
else
    print_status "WARNING" "No Cloudflare headers detected"
    echo "This might indicate traffic is not going through Cloudflare"
fi

echo ""
echo "📊 System Status..."
echo "=================="

# Check log directories
if [[ -d "/var/log/watchparty" ]]; then
    print_status "OK" "Log directory exists"
else
    print_status "WARNING" "Log directory /var/log/watchparty does not exist"
    echo "Create with: sudo mkdir -p /var/log/watchparty && sudo chown www-data:www-data /var/log/watchparty"
fi

# Check static files directory
if [[ -d "/var/www/watchparty/staticfiles" ]]; then
    print_status "OK" "Static files directory exists"
else
    print_status "WARNING" "Static files directory /var/www/watchparty/staticfiles does not exist"
fi

# Check if Django/Python app is running on expected ports
if netstat -tuln | grep -q ":8001"; then
    print_status "OK" "Django app appears to be running on port 8001"
else
    print_status "WARNING" "Django app does not appear to be running on port 8001"
fi

if netstat -tuln | grep -q ":8002"; then
    print_status "OK" "WebSocket server appears to be running on port 8002"
else
    print_status "WARNING" "WebSocket server does not appear to be running on port 8002"
fi

echo ""
echo "📋 Summary and Next Steps..."
echo "============================"

echo ""
print_status "INFO" "Configuration files available:"
echo "  • nginx.conf (updated with security improvements)"
echo "  • nginx-cloudflare-full-strict.conf (full strict mode configuration)"
echo "  • nginx-ssl.conf (direct SSL without Cloudflare)"
echo "  • setup-cloudflare-ssl.sh (certificate setup helper)"

echo ""
print_status "INFO" "To enable Full (Strict) SSL mode:"
echo "1. Obtain Cloudflare Origin Certificate from your Cloudflare dashboard"
echo "2. Run: sudo ./setup-cloudflare-ssl.sh"
echo "3. Use nginx-cloudflare-full-strict.conf as your nginx configuration"
echo "4. Set Cloudflare SSL/TLS mode to 'Full (strict)'"

echo ""
print_status "INFO" "Current configuration provides:"
echo "  ✓ Cloudflare IP restriction"
echo "  ✓ Enhanced security headers"
echo "  ✓ Better static file caching"
echo "  ✓ Improved WebSocket handling"
echo "  ✓ Protection against common attacks"

echo ""
echo "🔧 For immediate deployment with current setup:"
echo "sudo cp nginx.conf /etc/nginx/sites-available/watchparty"
echo "sudo ln -sf /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/"
echo "sudo nginx -t && sudo systemctl reload nginx"

echo ""
echo "Verification complete! 🎉"

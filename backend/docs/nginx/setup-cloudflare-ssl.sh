#!/bin/bash

# Cloudflare Origin Certificate Setup Script
# This script helps you set up Cloudflare Origin Certificate for Full (Strict) SSL mode

set -e

echo "=== Cloudflare Origin Certificate Setup ==="
echo ""

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script should be run as root for certificate installation"
   echo "Run: sudo $0"
   exit 1
fi

# Create SSL directories if they don't exist
echo "Creating SSL certificate directories..."
mkdir -p /etc/ssl/certs
mkdir -p /etc/ssl/private
chmod 700 /etc/ssl/private

echo ""
echo "📋 STEP 1: Get Cloudflare Origin Certificate"
echo "-------------------------------------------"
echo "1. Go to your Cloudflare dashboard"
echo "2. Select your domain (brahim-elhouss.me)"
echo "3. Go to SSL/TLS → Origin Server"
echo "4. Click 'Create Certificate'"
echo "5. Select 'Let Cloudflare generate a private key and a CSR'"
echo "6. Add these hostnames:"
echo "   - *.brahim-elhouss.me"
echo "   - brahim-elhouss.me"
echo "7. Select certificate validity (up to 15 years)"
echo "8. Copy the certificate and private key"
echo ""

echo "📝 STEP 2: Install Certificate Files"
echo "------------------------------------"
echo "Save the certificate content to: /etc/ssl/certs/cloudflare-origin.crt"
echo "Save the private key content to: /etc/ssl/private/cloudflare-origin.key"
echo ""

read -p "Have you saved both certificate files? (y/N): " -r
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please save the certificate files first, then run this script again."
    exit 1
fi

# Verify certificate files exist
if [[ ! -f "/etc/ssl/certs/cloudflare-origin.crt" ]]; then
    echo "❌ Certificate file not found: /etc/ssl/certs/cloudflare-origin.crt"
    exit 1
fi

if [[ ! -f "/etc/ssl/private/cloudflare-origin.key" ]]; then
    echo "❌ Private key file not found: /etc/ssl/private/cloudflare-origin.key"
    exit 1
fi

# Set proper permissions
echo "Setting proper permissions on certificate files..."
chmod 644 /etc/ssl/certs/cloudflare-origin.crt
chmod 600 /etc/ssl/private/cloudflare-origin.key
chown root:root /etc/ssl/certs/cloudflare-origin.crt
chown root:root /etc/ssl/private/cloudflare-origin.key

# Verify certificate
echo "Verifying certificate..."
if openssl x509 -in /etc/ssl/certs/cloudflare-origin.crt -text -noout > /dev/null 2>&1; then
    echo "✅ Certificate file is valid"
else
    echo "❌ Certificate file is invalid"
    exit 1
fi

if openssl rsa -in /etc/ssl/private/cloudflare-origin.key -check -noout > /dev/null 2>&1; then
    echo "✅ Private key file is valid"
else
    echo "❌ Private key file is invalid"
    exit 1
fi

echo ""
echo "🔧 STEP 3: Configure Nginx"
echo "-------------------------"
echo "The nginx-cloudflare-full-strict.conf file has been created with the proper configuration."
echo "To use it:"
echo ""
echo "1. Copy the configuration:"
echo "   sudo cp nginx-cloudflare-full-strict.conf /etc/nginx/sites-available/watchparty"
echo ""
echo "2. Create symbolic link:"
echo "   sudo ln -sf /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/"
echo ""
echo "3. Remove default site:"
echo "   sudo rm -f /etc/nginx/sites-enabled/default"
echo ""
echo "4. Test nginx configuration:"
echo "   sudo nginx -t"
echo ""
echo "5. Reload nginx:"
echo "   sudo systemctl reload nginx"
echo ""

echo "🛡️  STEP 4: Configure Cloudflare SSL/TLS Settings"
echo "------------------------------------------------"
echo "In your Cloudflare dashboard:"
echo "1. Go to SSL/TLS → Overview"
echo "2. Set SSL/TLS encryption mode to 'Full (strict)'"
echo "3. Go to SSL/TLS → Edge Certificates"
echo "4. Enable 'Always Use HTTPS'"
echo "5. Enable 'HTTP Strict Transport Security (HSTS)'"
echo "6. Set minimum TLS version to 1.2"
echo ""

echo "✅ Cloudflare Origin Certificate setup complete!"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "• Your server now only accepts traffic from Cloudflare IPs"
echo "• All HTTP traffic is redirected to HTTPS"
echo "• Strong security headers are enabled"
echo "• Make sure your Cloudflare SSL mode is set to 'Full (strict)'"
echo ""
echo "🔍 To verify everything is working:"
echo "• Check that your site loads over HTTPS"
echo "• Verify SSL certificate in browser"
echo "• Test that direct IP access is blocked"
echo "• Check nginx logs: tail -f /var/log/watchparty/nginx_*.log"

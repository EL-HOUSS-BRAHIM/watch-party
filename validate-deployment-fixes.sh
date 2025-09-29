#!/bin/bash

# =============================================================================
# Deployment Fix Validation Script
# =============================================================================
# This script validates the fixes made to address deployment issues
# Run this on the Lightsail server to verify the fixes

set -e

echo "🔧 Validating Deployment Fixes..."
echo "=================================="

# Test 1: Check if deploy user has passwordless sudo
echo "Test 1: Checking passwordless sudo for deploy user..."
if sudo -n -u deploy sudo -n true 2>/dev/null; then
    echo "✅ Deploy user has passwordless sudo access"
else
    echo "❌ Deploy user does not have passwordless sudo access"
    echo "   Run: echo 'deploy ALL=(ALL) NOPASSWD:ALL' | sudo tee /etc/sudoers.d/deploy"
    echo "   Then: sudo chmod 440 /etc/sudoers.d/deploy"
fi

# Test 2: Check if AWS CLI can be installed
echo ""
echo "Test 2: Testing AWS CLI installation..."
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI is already installed: $(aws --version)"
else
    echo "📦 AWS CLI not found, testing installation process..."
    
    # Test the same process as in the workflow
    if curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2-test.zip"; then
        echo "✅ AWS CLI download successful"
        rm -f /tmp/awscliv2-test.zip
        
        # Test sudo without password
        if sudo -n true 2>/dev/null; then
            echo "✅ Can run sudo without password - system installation will work"
        else
            echo "⚠️  Cannot run sudo without password - will use user installation"
        fi
    else
        echo "❌ AWS CLI download failed"
    fi
fi

# Test 3: Check IAM role access (if on AWS instance)
echo ""
echo "Test 3: Testing AWS IAM role access..."
if curl -s --connect-timeout 5 http://169.254.169.254/latest/meta-data/iam/security-credentials/ &>/dev/null; then
    echo "✅ Instance metadata service accessible"
    
    if command -v aws &> /dev/null; then
        if aws sts get-caller-identity &>/dev/null; then
            echo "✅ AWS IAM role is working correctly"
            aws sts get-caller-identity | grep -E "(UserId|Account|Arn)"
        else
            echo "❌ AWS IAM role not configured or accessible"
        fi
    else
        echo "⚠️  AWS CLI not installed - cannot test IAM role"
    fi
else
    echo "⚠️  Not running on AWS instance or metadata service not accessible"
fi

# Test 4: Check deploy user setup
echo ""
echo "Test 4: Checking deploy user configuration..."
if id deploy &>/dev/null; then
    echo "✅ Deploy user exists"
    
    if groups deploy | grep -q docker; then
        echo "✅ Deploy user is in docker group"
    else
        echo "❌ Deploy user is not in docker group"
    fi
    
    if groups deploy | grep -q sudo; then
        echo "✅ Deploy user is in sudo group"
    else
        echo "❌ Deploy user is not in sudo group"
    fi
    
    if [ -d /home/deploy/.ssh ]; then
        echo "✅ Deploy user has .ssh directory"
        if [ -f /home/deploy/.ssh/authorized_keys ]; then
            echo "✅ Deploy user has authorized_keys file"
            echo "   Keys count: $(wc -l < /home/deploy/.ssh/authorized_keys)"
        else
            echo "❌ Deploy user missing authorized_keys file"
        fi
    else
        echo "❌ Deploy user missing .ssh directory"
    fi
else
    echo "❌ Deploy user does not exist"
fi

# Test 5: Check services
echo ""
echo "Test 5: Checking required services..."
services=("docker" "nginx")
for service in "${services[@]}"; do
    if systemctl is-active --quiet "$service"; then
        echo "✅ $service is running"
    else
        echo "❌ $service is not running"
    fi
done

echo ""
echo "🎯 Validation Summary:"
echo "======================"
echo "✅ = Working correctly"
echo "⚠️  = Warning/Optional"  
echo "❌ = Needs attention"
echo ""
echo "If you see any ❌ issues, please address them before deploying."
echo "The main deployment issue (sudo password) should now be resolved."
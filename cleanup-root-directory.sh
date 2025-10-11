#!/bin/bash

# Cleanup script to organize root directory files
# Created: October 11, 2025

set -e

echo "🧹 Starting root directory cleanup..."

# Create directory structure if it doesn't exist
echo "📁 Creating directory structure..."
mkdir -p docs
mkdir -p scripts/deployment
mkdir -p scripts/tests
mkdir -p scripts/setup
mkdir -p scripts/debug

# Move documentation files to docs/
echo "📄 Moving documentation files to docs/..."
mv -v AUTHENTICATION_UX_IMPROVEMENTS_OCT11.md docs/ 2>/dev/null || true
mv -v AWS_DEV_SETUP_COMPLETE.md docs/ 2>/dev/null || true
mv -v BACKEND_URL_FIX_DEPLOYMENT.md docs/ 2>/dev/null || true
mv -v BACKEND_URL_FIX_SUMMARY.md docs/ 2>/dev/null || true
mv -v BEFORE_AFTER_FIXES.md docs/ 2>/dev/null || true
mv -v DEPLOYMENT_GUIDE.md docs/ 2>/dev/null || true
mv -v LAYOUT_DIAGRAMS.txt docs/ 2>/dev/null || true
mv -v PLAYWRIGHT_TEST_FIXES_SUMMARY.md docs/ 2>/dev/null || true
mv -v PLAYWRIGHT_TEST_REPORT.md docs/ 2>/dev/null || true
mv -v PLAYWRIGHT_TEST_UPDATE_OCT11.md docs/ 2>/dev/null || true
mv -v QUICK_DEPLOY.md docs/ 2>/dev/null || true
mv -v QUICK_REFERENCE.md docs/ 2>/dev/null || true
mv -v SOLUTION_SUMMARY.md docs/ 2>/dev/null || true
mv -v TESTING_GUIDE.md docs/ 2>/dev/null || true

# Move test scripts to scripts/tests/
echo "🧪 Moving test scripts to scripts/tests/..."
mv -v test-backend-url-config.sh scripts/tests/ 2>/dev/null || true
mv -v test-buildkit-inline-cache-removal.sh scripts/tests/ 2>/dev/null || true
mv -v test-cache-busting.sh scripts/tests/ 2>/dev/null || true
mv -v test-deployment-fixes.sh scripts/tests/ 2>/dev/null || true
mv -v test-docker-cache-optimization.sh scripts/tests/ 2>/dev/null || true
mv -v test-force-rebuild-fix.sh scripts/tests/ 2>/dev/null || true
mv -v validate-deployment-fixes.sh scripts/tests/ 2>/dev/null || true

# Move deployment scripts to scripts/deployment/
echo "🚀 Moving deployment scripts to scripts/deployment/..."
mv -v deploy-docker.sh scripts/deployment/ 2>/dev/null || true
mv -v deploy-helper.sh scripts/deployment/ 2>/dev/null || true
mv -v quick-fix-backend-url.sh scripts/deployment/ 2>/dev/null || true

# Move setup scripts to scripts/setup/
echo "⚙️  Moving setup scripts to scripts/setup/..."
mv -v bootstrap.sh scripts/setup/ 2>/dev/null || true
mv -v configure-aws.sh scripts/setup/ 2>/dev/null || true
mv -v setup-backend-env-from-aws.sh scripts/setup/ 2>/dev/null || true
mv -v setup-dev-environment.sh scripts/setup/ 2>/dev/null || true
mv -v setup-local-dev.sh scripts/setup/ 2>/dev/null || true

# Move debug scripts to scripts/debug/
echo "🐛 Moving debug scripts to scripts/debug/..."
mv -v debug-server.sh scripts/debug/ 2>/dev/null || true
mv -v remote-debug.sh scripts/debug/ 2>/dev/null || true

# Make all scripts executable
echo "🔐 Setting executable permissions..."
chmod +x scripts/deployment/*.sh 2>/dev/null || true
chmod +x scripts/tests/*.sh 2>/dev/null || true
chmod +x scripts/setup/*.sh 2>/dev/null || true
chmod +x scripts/debug/*.sh 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 New directory structure:"
echo "   docs/              - All documentation files"
echo "   scripts/deployment/ - Deployment scripts"
echo "   scripts/tests/      - Test and validation scripts"
echo "   scripts/setup/      - Setup and configuration scripts"
echo "   scripts/debug/      - Debug and troubleshooting scripts"
echo ""
echo "🎯 Root directory now contains only:"
echo "   - README.md"
echo "   - package.json & package-lock.json"
echo "   - docker-compose*.yml files"
echo "   - .gitignore and .git/"
echo "   - Main directories: backend/, frontend/, docs/, scripts/, etc."

#!/bin/bash

# =============================================================================
# MAIN DEPLOYMENT ORCHESTRATOR
# =============================================================================
# This is the main entry point called by GitHub Actions
# It orchestrates the deployment by calling smaller, focused scripts

set -e

APP_NAME=watch-party
APP_DIR=/srv/$APP_NAME

echo "🚀 Starting Watch Party Deployment..."
echo "=================================================="

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source common functions
source "$SCRIPT_DIR/common-functions.sh"

# Export APP_DIR for child scripts
export APP_DIR

# Step 1: Setup repository and permissions
log_step "Step 1: Repository Setup"
bash "$SCRIPT_DIR/setup-repository.sh" || exit_with_error "Repository setup failed"

# Step 2: Configure AWS and environment
log_step "Step 2: AWS and Environment Configuration"
bash "$SCRIPT_DIR/setup-aws-environment.sh" || exit_with_error "AWS configuration failed"

# Step 3: Setup SSL certificates
log_step "Step 3: SSL Certificate Setup"
bash "$SCRIPT_DIR/setup-ssl-certificates.sh" || exit_with_error "SSL setup failed"

# Step 4: Build Docker images
log_step "Step 4: Building Docker Images"
bash "$SCRIPT_DIR/build-docker-images.sh" || exit_with_error "Docker build failed"

# Step 5: Deploy services
log_step "Step 5: Deploying Services"
bash "$SCRIPT_DIR/deploy-services.sh" || exit_with_error "Service deployment failed"

# Step 6: Run health checks
log_step "Step 6: Health Checks"
bash "$SCRIPT_DIR/health-checks.sh" || exit_with_error "Health checks failed"

# Cleanup
log_step "Cleanup"
docker system prune -f || true

log_success "🎉 Deployment completed successfully!"
echo "=================================================="
echo "   Frontend: https://watch-party.brahim-elhouss.me/"
echo "   Backend API: https://be-watch-party.brahim-elhouss.me/api/"
echo "=================================================="

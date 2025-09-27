#!/bin/bash

# =============================================================================
# AWS Infrastructure Cleanup Script - Watch Party Backend
# =============================================================================
# This script removes all AWS resources created by aws-infrastructure-setup.sh
# Use with EXTREME CAUTION - this will delete your databases and all data!
# =============================================================================

set -euo pipefail

# Configuration
AWS_REGION="eu-west-3"
PROJECT_NAME="watch-party"
LOG_FILE="aws-infrastructure-cleanup.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Confirmation prompt
confirm_deletion() {
    echo -e "${RED}⚠️  DANGER ZONE ⚠️${NC}"
    echo "This will DELETE ALL AWS infrastructure created for the Watch Party project:"
    echo "- RDS PostgreSQL database (ALL DATA WILL BE LOST)"
    echo "- ElastiCache Valkey cluster"
    echo "- VPC, subnets, and security groups"
    echo ""
    echo "This action CANNOT be undone!"
    echo ""
    read -p "Type 'DELETE EVERYTHING' to confirm: " confirmation
    
    if [[ "$confirmation" != "DELETE EVERYTHING" ]]; then
        echo "Confirmation failed. Exiting without making changes."
        exit 0
    fi
    
    echo ""
    read -p "Are you absolutely sure? Type 'YES' to continue: " final_confirmation
    
    if [[ "$final_confirmation" != "YES" ]]; then
        echo "Final confirmation failed. Exiting without making changes."
        exit 0
    fi
}

# Delete RDS instance
delete_rds_instance() {
    log "Deleting RDS instance..."
    
    # Disable deletion protection first
    aws rds modify-db-instance \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --no-deletion-protection \
        --region $AWS_REGION 2>/dev/null || log "RDS instance not found or already deleted"
    
    # Delete RDS instance (skip final snapshot for cleanup)
    aws rds delete-db-instance \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --skip-final-snapshot \
        --delete-automated-backups \
        --region $AWS_REGION 2>/dev/null || log "RDS instance not found or already deleted"
    
    log "RDS instance deletion initiated..."
}

# Delete ElastiCache cluster
delete_elasticache_cluster() {
    log "Deleting ElastiCache cluster..."
    
    aws elasticache delete-replication-group \
        --replication-group-id "${PROJECT_NAME}-valkey" \
        --region $AWS_REGION 2>/dev/null || log "ElastiCache cluster not found or already deleted"
    
    log "ElastiCache cluster deletion initiated..."
}

# Wait for resources to be deleted
wait_for_deletions() {
    log "Waiting for resources to be deleted..."
    
    # Wait for RDS deletion
    log "Waiting for RDS instance deletion..."
    aws rds wait db-instance-deleted \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --region $AWS_REGION 2>/dev/null || log "RDS instance already deleted"
    
    # Wait for ElastiCache deletion
    log "Waiting for ElastiCache cluster deletion..."
    while aws elasticache describe-replication-groups \
        --replication-group-id "${PROJECT_NAME}-valkey" \
        --region $AWS_REGION &>/dev/null; do
        log "Still waiting for ElastiCache cluster deletion..."
        sleep 30
    done
    
    log "All database resources deleted ✓"
}

# Delete subnet groups
delete_subnet_groups() {
    log "Deleting subnet groups..."
    
    # Delete RDS subnet group
    aws rds delete-db-subnet-group \
        --db-subnet-group-name "${PROJECT_NAME}-rds-subnet-group" \
        --region $AWS_REGION 2>/dev/null || log "RDS subnet group not found"
    
    # Delete ElastiCache subnet group
    aws elasticache delete-cache-subnet-group \
        --cache-subnet-group-name "${PROJECT_NAME}-cache-subnet-group" \
        --region $AWS_REGION 2>/dev/null || log "ElastiCache subnet group not found"
    
    # Delete parameter group
    aws elasticache delete-cache-parameter-group \
        --cache-parameter-group-name "${PROJECT_NAME}-valkey-params" \
        --region $AWS_REGION 2>/dev/null || log "ElastiCache parameter group not found"
    
    log "Subnet groups deleted ✓"
}

# Get default VPC ID
get_default_vpc_id() {
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=is-default,Values=true" \
        --region $AWS_REGION \
        --query 'Vpcs[0].VpcId' \
        --output text 2>/dev/null || echo "None")
    
    if [[ "$VPC_ID" == "None" || "$VPC_ID" == "" ]]; then
        log "Default VPC not found. Security groups may have already been deleted."
        return 1
    fi
    return 0
}

# Delete security groups only (don't delete VPC resources)
delete_security_groups() {
    if ! get_default_vpc_id; then
        return
    fi
    
    log "Deleting security groups from default VPC..."
    
    # Get security group IDs
    RDS_SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-rds-sg" "Name=vpc-id,Values=$VPC_ID" \
        --region $AWS_REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null || echo "None")
    
    ELASTICACHE_SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-elasticache-sg" "Name=vpc-id,Values=$VPC_ID" \
        --region $AWS_REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null || echo "None")
    
    APP_SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-app-sg" "Name=vpc-id,Values=$VPC_ID" \
        --region $AWS_REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null || echo "None")
    
    # Delete security groups
    for sg_id in "$RDS_SG_ID" "$ELASTICACHE_SG_ID" "$APP_SG_ID"; do
        if [[ "$sg_id" != "None" && "$sg_id" != "" ]]; then
            aws ec2 delete-security-group \
                --group-id "$sg_id" \
                --region $AWS_REGION 2>/dev/null || log "Security group $sg_id not found or already deleted"
        fi
    done
    
    log "Security groups deleted ✓"
    log "Note: Default VPC and subnets are preserved"
}

# Note: We don't delete VPC resources since we're using the default VPC
skip_vpc_deletion() {
    log "Skipping VPC deletion - using default VPC which should be preserved"
    log "Only security groups specific to this project were deleted"
}

# Main cleanup function
main() {
    echo "==============================================================================" > "$LOG_FILE"
    echo "AWS Infrastructure Cleanup Log - $(date)" >> "$LOG_FILE"
    echo "==============================================================================" >> "$LOG_FILE"
    
    log "🗑️  Starting AWS Infrastructure Cleanup for Watch Party Backend"
    
    confirm_deletion
    
    log "Starting cleanup process..."
    
    delete_rds_instance
    delete_elasticache_cluster
    wait_for_deletions
    delete_subnet_groups
    delete_security_groups
    skip_vpc_deletion
    
    log "✅ AWS Infrastructure cleanup completed!"
    log "📋 All cleanup actions are logged in: $LOG_FILE"
    
    warn "Remember to:"
    warn "- Remove AWS credentials from your .env file"
    warn "- Update your Django settings to use local databases"
    warn "- Check for any remaining AWS resources in the console"
}

# Check if running in non-interactive mode
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi

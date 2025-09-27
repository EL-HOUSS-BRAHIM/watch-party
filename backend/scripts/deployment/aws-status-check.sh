#!/bin/bash

# =============================================================================
# AWS Infrastructure Status Checker
# =============================================================================
# Quick status check for Watch Party AWS infrastructure
# =============================================================================

set -euo pipefail

# Configuration
AWS_REGION="eu-west-3"
PROJECT_NAME="watch-party"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log() {
    echo -e "${GREEN}[$(date +'%H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%H:%M:%S')] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%H:%M:%S')] ERROR:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')] INFO:${NC} $1"
}

# Check AWS CLI
check_aws_cli() {
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed"
        return 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not configured"
        return 1
    fi
    
    return 0
}

# Check RDS status
check_rds_status() {
    log "Checking RDS instance status..."
    
    local rds_info
    rds_info=$(aws rds describe-db-instances \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --region $AWS_REGION \
        --query 'DBInstances[0].[DBInstanceStatus,Endpoint.Address,DBName,MasterUsername,AllocatedStorage,StorageEncrypted,MultiAZ,BackupRetentionPeriod]' \
        --output text 2>/dev/null) || {
        error "RDS instance '${PROJECT_NAME}-postgres' not found"
        return 1
    }
    
    local status endpoint dbname username storage encrypted multiaz backup
    read -r status endpoint dbname username storage encrypted multiaz backup <<< "$rds_info"
    
    echo "   Status: $status"
    echo "   Endpoint: $endpoint"
    echo "   Database: $dbname"
    echo "   Username: $username"
    echo "   Storage: ${storage}GB"
    echo "   Encrypted: $encrypted"
    echo "   Multi-AZ: $multiaz"
    echo "   Backup Retention: ${backup} days"
    
    if [[ "$status" == "available" ]]; then
        echo -e "   ${GREEN}✅ RDS is running${NC}"
        return 0
    else
        echo -e "   ${YELLOW}⚠️  RDS status: $status${NC}"
        return 1
    fi
}

# Check ElastiCache status
check_elasticache_status() {
    log "Checking ElastiCache cluster status..."
    
    local cache_info
    cache_info=$(aws elasticache describe-replication-groups \
        --replication-group-id "${PROJECT_NAME}-valkey" \
        --region $AWS_REGION \
        --query 'ReplicationGroups[0].[Status,RedisEndpoint.Address,RedisEndpoint.Port,AtRestEncryptionEnabled,TransitEncryptionEnabled,AuthTokenEnabled,NumCacheClusters]' \
        --output text 2>/dev/null) || {
        error "ElastiCache cluster '${PROJECT_NAME}-valkey' not found"
        return 1
    }
    
    local status endpoint port rest_encrypt transit_encrypt auth_enabled num_nodes
    read -r status endpoint port rest_encrypt transit_encrypt auth_enabled num_nodes <<< "$cache_info"
    
    echo "   Status: $status"
    echo "   Endpoint: $endpoint:$port"
    echo "   Nodes: $num_nodes"
    echo "   Encryption at Rest: $rest_encrypt"
    echo "   Encryption in Transit: $transit_encrypt"
    echo "   Auth Enabled: $auth_enabled"
    
    if [[ "$status" == "available" ]]; then
        echo -e "   ${GREEN}✅ ElastiCache is running${NC}"
        return 0
    else
        echo -e "   ${YELLOW}⚠️  ElastiCache status: $status${NC}"
        return 1
    fi
}

# Check default VPC resources
check_vpc_status() {
    log "Checking default VPC resources..."
    
    # Check default VPC
    local vpc_id
    vpc_id=$(aws ec2 describe-vpcs \
        --filters "Name=is-default,Values=true" \
        --region $AWS_REGION \
        --query 'Vpcs[0].VpcId' \
        --output text 2>/dev/null)
    
    if [[ "$vpc_id" == "None" || -z "$vpc_id" ]]; then
        error "Default VPC not found"
        return 1
    fi
    
    echo "   Default VPC ID: $vpc_id"
    
    # Check subnets in default VPC
    local subnet_count
    subnet_count=$(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$vpc_id" \
        --region $AWS_REGION \
        --query 'length(Subnets)' \
        --output text)
    
    echo "   Available Subnets: $subnet_count"
    
    # Check project-specific security groups
    local sg_count
    sg_count=$(aws ec2 describe-security-groups \
        --filters "Name=vpc-id,Values=$vpc_id" "Name=group-name,Values=${PROJECT_NAME}-*" \
        --region $AWS_REGION \
        --query 'length(SecurityGroups)' \
        --output text)
    
    echo "   Project Security Groups: $sg_count"
    
    echo -e "   ${GREEN}✅ Default VPC resources found${NC}"
    return 0
}

# Check costs (approximate)
check_costs() {
    log "Estimating monthly costs..."
    
    # Note: This is a rough estimate based on current pricing
    info "Estimated monthly costs (USD):"
    echo "   RDS t3.micro: ~\$15-25"
    echo "   ElastiCache t3.micro (2 nodes): ~\$25-35"
    echo "   Data transfer: ~\$1-5"
    echo "   Total estimated: ~\$41-65"
    echo ""
    warn "Actual costs may vary. Check AWS Cost Explorer for accurate billing."
}

# Quick connectivity test
quick_connectivity_test() {
    log "Running quick connectivity test..."
    
    if [[ -f ".env" ]]; then
        # Source environment variables
        set -a
        source .env
        set +a
        
        # Test PostgreSQL connectivity
        if command -v psql &> /dev/null && [[ -n "${DATABASE_URL:-}" ]]; then
            if psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
                echo -e "   ${GREEN}✅ PostgreSQL connection successful${NC}"
            else
                echo -e "   ${YELLOW}⚠️  PostgreSQL connection failed${NC}"
            fi
        else
            echo -e "   ${YELLOW}⚠️  Cannot test PostgreSQL (psql not available or DATABASE_URL not set)${NC}"
        fi
        
        # Test Redis connectivity
        if command -v redis-cli &> /dev/null && [[ -n "${REDIS_HOST:-}" ]] && [[ -n "${REDIS_PASSWORD:-}" ]]; then
            if redis-cli -h "$REDIS_HOST" -p "${REDIS_PORT:-6379}" -a "$REDIS_PASSWORD" --tls ping &> /dev/null; then
                echo -e "   ${GREEN}✅ Redis connection successful${NC}"
            else
                echo -e "   ${YELLOW}⚠️  Redis connection failed${NC}"
            fi
        else
            echo -e "   ${YELLOW}⚠️  Cannot test Redis (redis-cli not available or credentials not set)${NC}"
        fi
    else
        warn ".env file not found. Cannot test connectivity."
    fi
}

# Main function
main() {
    echo "=========================================="
    echo "  AWS Infrastructure Status Check"
    echo "  Project: $PROJECT_NAME"
    echo "  Region: $AWS_REGION"
    echo "=========================================="
    
    # Check prerequisites
    if ! check_aws_cli; then
        exit 1
    fi
    
    # Status checks
    local checks_passed=0
    local total_checks=3
    
    if check_rds_status; then
        ((checks_passed++))
    fi
    echo ""
    
    if check_elasticache_status; then
        ((checks_passed++))
    fi
    echo ""
    
    if check_vpc_status; then
        ((checks_passed++))
    fi
    echo ""
    
    # Quick connectivity test
    quick_connectivity_test
    echo ""
    
    # Cost estimation
    check_costs
    echo ""
    
    # Summary
    echo "=========================================="
    echo "  Summary"
    echo "=========================================="
    echo "AWS Resources: $checks_passed/$total_checks operational"
    
    if [[ $checks_passed -eq $total_checks ]]; then
        echo -e "${GREEN}🎉 All AWS resources are operational!${NC}"
        echo ""
        echo "Next steps:"
        echo "• Run 'python scripts/test-aws-connections.py' for detailed testing"
        echo "• Monitor your application logs for any issues"
        echo "• Check AWS CloudWatch for metrics and logs"
    else
        echo -e "${YELLOW}⚠️  Some resources may need attention${NC}"
        echo ""
        echo "Troubleshooting:"
        echo "• Check the AWS console for resource status"
        echo "• Review aws-infrastructure-setup.log for setup details"
        echo "• Run the setup script again if resources are missing"
    fi
    
    echo ""
    echo "For detailed testing: python scripts/test-aws-connections.py"
    echo "For full status: aws rds describe-db-instances aws elasticache describe-replication-groups"
}

# Run main function
main "$@"

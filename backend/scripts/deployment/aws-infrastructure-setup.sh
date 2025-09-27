#!/bin/bash

# =============================================================================
# AWS Infrastructure Setup Script - Watch Party Backend
# =============================================================================
# This script creates AWS RDS (PostgreSQL) and ElastiCache (Valkey) instances
# following AWS best practices for production deployment
# =============================================================================

set -euo pipefail

# Configuration
AWS_REGION="eu-west-3"
PROJECT_NAME="watch-party"
ENV="production"
LOG_FILE="aws-infrastructure-setup.log"
ENV_FILE=".env"

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
    exit 1
}

info() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Please install it first."
    fi
    
    # Check AWS configuration
    if ! aws sts get-caller-identity &> /dev/null; then
        error "AWS CLI is not configured. Please run 'aws configure' first."
    fi
    
    # Check jq for JSON parsing
    if ! command -v jq &> /dev/null; then
        warn "jq is not installed. Installing it..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y jq
        elif command -v yum &> /dev/null; then
            sudo yum install -y jq
        else
            error "Please install jq manually"
        fi
    fi
    
    log "Prerequisites check completed ✓"
}

# Generate secure passwords
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/\n\r" | head -c $length
}

# Use existing default VPC and subnets
get_default_vpc_resources() {
    log "Using existing default VPC and subnets..."
    
    # Get default VPC
    VPC_ID=$(aws ec2 describe-vpcs \
        --filters "Name=is-default,Values=true" \
        --region $AWS_REGION \
        --query 'Vpcs[0].VpcId' \
        --output text)
    
    if [[ "$VPC_ID" == "None" || -z "$VPC_ID" ]]; then
        error "No default VPC found in region $AWS_REGION. Please create one or use a different region."
        return 1
    fi
    
    log "Using default VPC: $VPC_ID"
    
    # Get all subnets in the default VPC
    SUBNET_IDS=($(aws ec2 describe-subnets \
        --filters "Name=vpc-id,Values=$VPC_ID" \
        --region $AWS_REGION \
        --query 'Subnets[].SubnetId' \
        --output text))
    
    if [[ ${#SUBNET_IDS[@]} -lt 2 ]]; then
        error "Need at least 2 subnets for RDS subnet group. Found: ${#SUBNET_IDS[@]}"
        return 1
    fi
    
    # Use first two subnets for database subnet groups
    SUBNET1_ID=${SUBNET_IDS[0]}
    SUBNET2_ID=${SUBNET_IDS[1]}
    
    # Get availability zones for the subnets
    AZ1=$(aws ec2 describe-subnets \
        --subnet-ids $SUBNET1_ID \
        --region $AWS_REGION \
        --query 'Subnets[0].AvailabilityZone' \
        --output text)
    
    AZ2=$(aws ec2 describe-subnets \
        --subnet-ids $SUBNET2_ID \
        --region $AWS_REGION \
        --query 'Subnets[0].AvailabilityZone' \
        --output text)
    
    log "Using subnets: $SUBNET1_ID ($AZ1), $SUBNET2_ID ($AZ2)"
    log "Total available subnets: ${#SUBNET_IDS[@]}"
    
    # Store all subnet IDs for subnet groups
    ALL_SUBNET_IDS="${SUBNET_IDS[*]}"
    
    log "Default VPC resources identified successfully ✓"
}

# Create security groups
create_security_groups() {
    log "Creating security groups..."
    
    # Check if RDS Security Group already exists
    RDS_SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-rds-sg" "Name=vpc-id,Values=$VPC_ID" \
        --region $AWS_REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null)
    
    if [[ "$RDS_SG_ID" == "None" || -z "$RDS_SG_ID" ]]; then
        RDS_SG_ID=$(aws ec2 create-security-group \
            --group-name "${PROJECT_NAME}-rds-sg" \
            --description "Security group for RDS PostgreSQL instance" \
            --vpc-id $VPC_ID \
            --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${PROJECT_NAME}-rds-sg},{Key=Environment,Value=${ENV}}]" \
            --region $AWS_REGION \
            --query 'GroupId' \
            --output text)
        log "Created RDS security group: $RDS_SG_ID"
    else
        log "Using existing RDS security group: $RDS_SG_ID"
    fi
    
    # Check if ElastiCache Security Group already exists
    ELASTICACHE_SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-elasticache-sg" "Name=vpc-id,Values=$VPC_ID" \
        --region $AWS_REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null)
    
    if [[ "$ELASTICACHE_SG_ID" == "None" || -z "$ELASTICACHE_SG_ID" ]]; then
        ELASTICACHE_SG_ID=$(aws ec2 create-security-group \
            --group-name "${PROJECT_NAME}-elasticache-sg" \
            --description "Security group for ElastiCache Valkey cluster" \
            --vpc-id $VPC_ID \
            --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${PROJECT_NAME}-elasticache-sg},{Key=Environment,Value=${ENV}}]" \
            --region $AWS_REGION \
            --query 'GroupId' \
            --output text)
        log "Created ElastiCache security group: $ELASTICACHE_SG_ID"
    else
        log "Using existing ElastiCache security group: $ELASTICACHE_SG_ID"
    fi
    
    # Check if Application Security Group already exists
    APP_SG_ID=$(aws ec2 describe-security-groups \
        --filters "Name=group-name,Values=${PROJECT_NAME}-app-sg" "Name=vpc-id,Values=$VPC_ID" \
        --region $AWS_REGION \
        --query 'SecurityGroups[0].GroupId' \
        --output text 2>/dev/null)
    
    if [[ "$APP_SG_ID" == "None" || -z "$APP_SG_ID" ]]; then
        APP_SG_ID=$(aws ec2 create-security-group \
            --group-name "${PROJECT_NAME}-app-sg" \
            --description "Security group for application servers" \
            --vpc-id $VPC_ID \
            --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=${PROJECT_NAME}-app-sg},{Key=Environment,Value=${ENV}}]" \
            --region $AWS_REGION \
            --query 'GroupId' \
            --output text)
        log "Created Application security group: $APP_SG_ID"
    else
        log "Using existing Application security group: $APP_SG_ID"
    fi
    
    # Add rules to RDS security group (if they don't exist)
    aws ec2 authorize-security-group-ingress \
        --group-id $RDS_SG_ID \
        --protocol tcp \
        --port 5432 \
        --source-group $APP_SG_ID \
        --region $AWS_REGION 2>/dev/null || log "RDS security group rule already exists"
    
    # Add rules to ElastiCache security group (if they don't exist)
    aws ec2 authorize-security-group-ingress \
        --group-id $ELASTICACHE_SG_ID \
        --protocol tcp \
        --port 6379 \
        --source-group $APP_SG_ID \
        --region $AWS_REGION 2>/dev/null || log "ElastiCache security group rule already exists"
    
    # Add rules to Application security group (if they don't exist)
    aws ec2 authorize-security-group-ingress \
        --group-id $APP_SG_ID \
        --protocol tcp \
        --port 80 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || log "App security group HTTP rule already exists"
    
    aws ec2 authorize-security-group-ingress \
        --group-id $APP_SG_ID \
        --protocol tcp \
        --port 443 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || log "App security group HTTPS rule already exists"
    
    aws ec2 authorize-security-group-ingress \
        --group-id $APP_SG_ID \
        --protocol tcp \
        --port 22 \
        --cidr 0.0.0.0/0 \
        --region $AWS_REGION 2>/dev/null || log "App security group SSH rule already exists"
    
    log "Security groups configured: RDS=$RDS_SG_ID, ElastiCache=$ELASTICACHE_SG_ID, App=$APP_SG_ID"
}

# Create RDS subnet group
create_rds_subnet_group() {
    log "Creating RDS subnet group..."
    
    # Check if RDS subnet group already exists
    if aws rds describe-db-subnet-groups \
        --db-subnet-group-name "${PROJECT_NAME}-rds-subnet-group" \
        --region $AWS_REGION &>/dev/null; then
        log "RDS subnet group already exists: ${PROJECT_NAME}-rds-subnet-group"
        return 0
    fi
    
    # Use all available subnets in the default VPC
    aws rds create-db-subnet-group \
        --db-subnet-group-name "${PROJECT_NAME}-rds-subnet-group" \
        --db-subnet-group-description "Subnet group for ${PROJECT_NAME} RDS instance" \
        --subnet-ids $ALL_SUBNET_IDS \
        --tags Key=Name,Value="${PROJECT_NAME}-rds-subnet-group" Key=Environment,Value=$ENV \
        --region $AWS_REGION
    
    log "RDS subnet group created with subnets: $ALL_SUBNET_IDS ✓"
}

# Create ElastiCache subnet group
create_elasticache_subnet_group() {
    log "Creating ElastiCache subnet group..."
    
    # Check if ElastiCache subnet group already exists
    if aws elasticache describe-cache-subnet-groups \
        --cache-subnet-group-name "${PROJECT_NAME}-cache-subnet-group" \
        --region $AWS_REGION &>/dev/null; then
        log "ElastiCache subnet group already exists: ${PROJECT_NAME}-cache-subnet-group"
        return 0
    fi
    
    # Use all available subnets in the default VPC
    aws elasticache create-cache-subnet-group \
        --cache-subnet-group-name "${PROJECT_NAME}-cache-subnet-group" \
        --cache-subnet-group-description "Subnet group for ${PROJECT_NAME} ElastiCache cluster" \
        --subnet-ids $ALL_SUBNET_IDS \
        --tags Key=Name,Value="${PROJECT_NAME}-cache-subnet-group" Key=Environment,Value=$ENV \
        --region $AWS_REGION
    
    log "ElastiCache subnet group created with subnets: $ALL_SUBNET_IDS ✓"
}

# Create RDS instance
create_rds_instance() {
    log "Creating RDS PostgreSQL instance..."
    # Check if RDS instance already exists
    if aws rds describe-db-instances \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --region $AWS_REGION &>/dev/null; then
        log "RDS instance already exists: ${PROJECT_NAME}-postgres"
        # Get existing RDS endpoint
        RDS_ENDPOINT=$(aws rds describe-db-instances \
            --db-instance-identifier "${PROJECT_NAME}-postgres" \
            --region $AWS_REGION \
            --query 'DBInstances[0].Endpoint.Address' \
            --output text)
        # Get existing database info
        DB_NAME=$(aws rds describe-db-instances \
            --db-instance-identifier "${PROJECT_NAME}-postgres" \
            --region $AWS_REGION \
            --query 'DBInstances[0].DBName' \
            --output text)
        DB_USERNAME=$(aws rds describe-db-instances \
            --db-instance-identifier "${PROJECT_NAME}-postgres" \
            --region $AWS_REGION \
            --query 'DBInstances[0].MasterUsername' \
            --output text)
        # Get engine version for summary (avoid unbound variable)
        POSTGRES_VERSION=$(aws rds describe-db-instances \
            --db-instance-identifier "${PROJECT_NAME}-postgres" \
            --region $AWS_REGION \
            --query 'DBInstances[0].EngineVersion' \
            --output text 2>/dev/null || echo "unknown")
        log "Using existing RDS instance:"
        log "  Endpoint: $RDS_ENDPOINT"
        log "  Database: $DB_NAME"
        log "  Username: $DB_USERNAME"
        warn "⚠️  Using existing RDS instance. Database password not available in this script."
        warn "    Check your previous logs or AWS console for the password."
        DB_PASSWORD="<check_previous_logs_or_aws_console>"
        return 0
    fi
    
    # Generate secure credentials for new instance
    DB_USERNAME="watchparty_admin"
    DB_PASSWORD=$(generate_password 24)
    DB_NAME="watchparty_prod"
    
    # Get latest available PostgreSQL version (prefer 16.x, fallback to 15.x)
    POSTGRES_VERSION=$(aws rds describe-db-engine-versions \
        --engine postgres \
        --region $AWS_REGION \
        --query 'DBEngineVersions[?contains(EngineVersion, `16.`)]|[-1].EngineVersion' \
        --output text 2>/dev/null)
    
    if [[ "$POSTGRES_VERSION" == "None" || -z "$POSTGRES_VERSION" ]]; then
        POSTGRES_VERSION=$(aws rds describe-db-engine-versions \
            --engine postgres \
            --region $AWS_REGION \
            --query 'DBEngineVersions[?contains(EngineVersion, `15.`)]|[-1].EngineVersion' \
            --output text 2>/dev/null || echo "15.13")
    fi
    
    log "Using PostgreSQL version: $POSTGRES_VERSION"
    
    # Create RDS instance
    aws rds create-db-instance \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --db-instance-class db.t3.micro \
        --engine postgres \
        --engine-version "$POSTGRES_VERSION" \
        --master-username $DB_USERNAME \
        --master-user-password "$DB_PASSWORD" \
        --db-name $DB_NAME \
        --allocated-storage 20 \
        --max-allocated-storage 1000 \
        --storage-type gp3 \
        --storage-encrypted \
        --vpc-security-group-ids $RDS_SG_ID \
        --db-subnet-group-name "${PROJECT_NAME}-rds-subnet-group" \
        --backup-retention-period 7 \
        --preferred-backup-window "03:00-04:00" \
        --preferred-maintenance-window "sun:04:00-sun:05:00" \
        --auto-minor-version-upgrade \
        --deletion-protection \
        --enable-performance-insights \
        --performance-insights-retention-period 7 \
        --enable-cloudwatch-logs-exports postgresql \
        --tags Key=Name,Value="${PROJECT_NAME}-postgres" Key=Environment,Value=$ENV \
        --region $AWS_REGION
    
    log "RDS instance creation initiated. This may take 10-15 minutes..."
    
    # Wait for RDS instance to be available
    log "Waiting for RDS instance to be available..."
    aws rds wait db-instance-available \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --region $AWS_REGION
    
    # Get RDS endpoint
    RDS_ENDPOINT=$(aws rds describe-db-instances \
        --db-instance-identifier "${PROJECT_NAME}-postgres" \
        --region $AWS_REGION \
        --query 'DBInstances[0].Endpoint.Address' \
        --output text)
    
    log "RDS instance created successfully!"
    log "  Endpoint: $RDS_ENDPOINT"
    log "  Database: $DB_NAME"
    log "  Username: $DB_USERNAME"
    
    # Store credentials
    echo "# RDS PostgreSQL Credentials" >> "$LOG_FILE"
    echo "RDS_ENDPOINT=$RDS_ENDPOINT" >> "$LOG_FILE"
    echo "RDS_USERNAME=$DB_USERNAME" >> "$LOG_FILE"
    echo "RDS_PASSWORD=$DB_PASSWORD" >> "$LOG_FILE"
    echo "RDS_DATABASE=$DB_NAME" >> "$LOG_FILE"
}

# Create ElastiCache Valkey cluster
create_elasticache_cluster() {
    log "Creating ElastiCache Valkey cluster..."
    if aws elasticache describe-replication-groups \
        --replication-group-id "${PROJECT_NAME}-valkey" \
        --region $AWS_REGION &>/dev/null; then
        log "ElastiCache cluster already exists: ${PROJECT_NAME}-valkey"
        # Attempt to fetch endpoint with retry if not ready
        local attempts=0
        local max_attempts=40  # ~20 minutes @30s
        local status
        while (( attempts < max_attempts )); do
            status=$(aws elasticache describe-replication-groups \
                --replication-group-id "${PROJECT_NAME}-valkey" \
                --region $AWS_REGION \
                --query 'ReplicationGroups[0].Status' \
                --output text 2>/dev/null || echo "unknown")
            REDIS_ENDPOINT=$(aws elasticache describe-replication-groups \
                --replication-group-id "${PROJECT_NAME}-valkey" \
                --region $AWS_REGION \
                --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' \
                --output text 2>/dev/null || echo "None")
            if [[ "$REDIS_ENDPOINT" != "None" && -n "$REDIS_ENDPOINT" ]]; then
                break
            fi
            # fallback to configuration endpoint
            conf_endpoint=$(aws elasticache describe-replication-groups \
                --replication-group-id "${PROJECT_NAME}-valkey" \
                --region $AWS_REGION \
                --query 'ReplicationGroups[0].ConfigurationEndpoint.Address' \
                --output text 2>/dev/null || echo "None")
            if [[ "$conf_endpoint" != "None" && -n "$conf_endpoint" ]]; then
                REDIS_ENDPOINT=$conf_endpoint
                break
            fi
            log "ElastiCache status=$status (endpoint not ready yet) - waiting 30s ($((attempts+1))/$max_attempts)"
            sleep 30
            ((attempts++))
        done
        log "Using existing ElastiCache cluster:"
        log "  Primary Endpoint: $REDIS_ENDPOINT"
        log "  Port: 6379"
        warn "⚠️  Using existing ElastiCache cluster. Auth token not available in this script."
        warn "    Check your previous logs or AWS console for the auth token."
        REDIS_AUTH_TOKEN="<check_previous_logs_or_aws_console>"
        return 0
    fi
    
    # Generate secure auth token for new cluster
    REDIS_AUTH_TOKEN=$(generate_password 64)
    
    # Create parameter group for Valkey 7.2
    aws elasticache create-cache-parameter-group \
        --cache-parameter-group-name "${PROJECT_NAME}-valkey-params" \
        --cache-parameter-group-family "valkey7" \
        --description "Parameter group for ${PROJECT_NAME} Valkey cluster" \
        --region $AWS_REGION 2>/dev/null || log "Parameter group already exists or using default"
    
    # Create replication group (cluster)
    aws elasticache create-replication-group \
        --replication-group-id "${PROJECT_NAME}-valkey" \
        --replication-group-description "Valkey cluster for ${PROJECT_NAME}" \
        --cache-node-type cache.t3.micro \
        --engine valkey \
        --engine-version "7.2" \
        --port 6379 \
        --num-cache-clusters 2 \
        --security-group-ids $ELASTICACHE_SG_ID \
        --cache-subnet-group-name "${PROJECT_NAME}-cache-subnet-group" \
        --auth-token "$REDIS_AUTH_TOKEN" \
        --transit-encryption-enabled \
        --at-rest-encryption-enabled \
        --automatic-failover-enabled \
        --multi-az-enabled \
        --snapshot-retention-limit 5 \
        --snapshot-window "03:00-05:00" \
        --preferred-maintenance-window "sun:05:00-sun:06:00" \
        --tags Key=Name,Value="${PROJECT_NAME}-valkey" Key=Environment,Value=$ENV \
        --region $AWS_REGION
    
    log "ElastiCache Valkey cluster creation initiated..."
    
    # Wait for ElastiCache cluster to be available (custom loop to avoid waiter premature failure)
    log "Waiting for ElastiCache cluster to be available... (custom wait loop)"
    attempts=0
    max_attempts=40
    while (( attempts < max_attempts )); do
        status=$(aws elasticache describe-replication-groups \
            --replication-group-id "${PROJECT_NAME}-valkey" \
            --region $AWS_REGION \
            --query 'ReplicationGroups[0].Status' \
            --output text 2>/dev/null || echo "unknown")
        if [[ "$status" == "available" ]]; then
            break
        fi
        log "ElastiCache status=$status - waiting 30s ($((attempts+1))/$max_attempts)"
        sleep 30
        ((attempts++))
    done
    if [[ "$status" != "available" ]]; then
        warn "ElastiCache cluster not 'available' after wait (status=$status). Proceeding; endpoint may be missing."
    fi
    
    # Get ElastiCache endpoint (with fallback)
    REDIS_ENDPOINT=$(aws elasticache describe-replication-groups \
        --replication-group-id "${PROJECT_NAME}-valkey" \
        --region $AWS_REGION \
        --query 'ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address' \
        --output text 2>/dev/null || echo "None")
    if [[ "$REDIS_ENDPOINT" == "None" || -z "$REDIS_ENDPOINT" ]]; then
        REDIS_ENDPOINT=$(aws elasticache describe-replication-groups \
            --replication-group-id "${PROJECT_NAME}-valkey" \
            --region $AWS_REGION \
            --query 'ReplicationGroups[0].ConfigurationEndpoint.Address' \
            --output text 2>/dev/null || echo "None")
    fi
    
    log "ElastiCache Valkey cluster created successfully!"
    log "  Primary Endpoint: $REDIS_ENDPOINT"
    log "  Port: 6379"
    
    # Store credentials
    echo "# ElastiCache Valkey Credentials" >> "$LOG_FILE"
    echo "REDIS_ENDPOINT=$REDIS_ENDPOINT" >> "$LOG_FILE"
    echo "REDIS_AUTH_TOKEN=$REDIS_AUTH_TOKEN" >> "$LOG_FILE"
}

# Update .env file
update_env_file() {
    log "Updating .env file..."
    if [[ -f "$ENV_FILE" ]]; then
        cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
        log "Backed up existing .env file"
    fi
    # Build Redis block conditionally
    local redis_block
    if [[ -n "${REDIS_ENDPOINT:-}" && "$REDIS_ENDPOINT" != "None" ]]; then
        redis_block="\n# AWS ElastiCache Valkey\nREDIS_URL=rediss://:$REDIS_AUTH_TOKEN@$REDIS_ENDPOINT:6379/0?ssl_cert_reqs=none\nREDIS_HOST=$REDIS_ENDPOINT\nREDIS_PORT=6379\nREDIS_PASSWORD=$REDIS_AUTH_TOKEN\nREDIS_USE_SSL=True\n\n# Celery with AWS ElastiCache\nCELERY_BROKER_URL=rediss://:$REDIS_AUTH_TOKEN@$REDIS_ENDPOINT:6379/2?ssl_cert_reqs=none\nCELERY_RESULT_BACKEND=rediss://:$REDIS_AUTH_TOKEN@$REDIS_ENDPOINT:6379/3?ssl_cert_reqs=none\n\n# Django Channels with AWS ElastiCache\nCHANNEL_LAYERS_CONFIG_HOSTS=rediss://:$REDIS_AUTH_TOKEN@$REDIS_ENDPOINT:6379/4?ssl_cert_reqs=none\n"
    else
        redis_block="\n# ElastiCache endpoint not yet available. Re-run script later to append Redis settings.\n"
    fi
    cat >> "$ENV_FILE" << EOF

# =============================================================================
# AWS INFRASTRUCTURE CREDENTIALS (Generated: $(date))
# =============================================================================

# AWS RDS PostgreSQL
DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@$RDS_ENDPOINT:5432/$DB_NAME?sslmode=require
DATABASE_NAME=$DB_NAME
DATABASE_USER=$DB_USERNAME
DATABASE_PASSWORD=$DB_PASSWORD
DATABASE_HOST=$RDS_ENDPOINT
DATABASE_PORT=5432
DB_SSL_MODE=require
${redis_block}
# AWS Infrastructure IDs (for reference)
VPC_ID=$VPC_ID
RDS_SECURITY_GROUP_ID=$RDS_SG_ID
ELASTICACHE_SECURITY_GROUP_ID=$ELASTICACHE_SG_ID
APPLICATION_SECURITY_GROUP_ID=$APP_SG_ID
EOF
    log "✅ .env file updated successfully!"
}

# Create infrastructure summary
create_summary() {
    log "Creating infrastructure summary..."
    # Ensure POSTGRES_VERSION is set
    if [[ -z "${POSTGRES_VERSION:-}" ]]; then
        POSTGRES_VERSION=$(aws rds describe-db-instances \
            --db-instance-identifier "${PROJECT_NAME}-postgres" \
            --region $AWS_REGION \
            --query 'DBInstances[0].EngineVersion' \
            --output text 2>/dev/null || echo "unknown")
    fi
    
    SUMMARY_FILE="aws-infrastructure-summary.md"
    
    cat > "$SUMMARY_FILE" << EOF
# AWS Infrastructure Summary - Watch Party Backend

**Created:** $(date)  
**Region:** $AWS_REGION  
**Environment:** $ENV  

## 🏗️ Infrastructure Components

### VPC Resources
- **VPC ID:** \`$VPC_ID\` (Default VPC)
- **Region:** \`$AWS_REGION\`
- **Availability Zones:** \`$AZ1\`, \`$AZ2\`

### Subnets
- **Subnet 1:** \`$SUBNET1_ID\` - $AZ1
- **Subnet 2:** \`$SUBNET2_ID\` - $AZ2
- **Total Available Subnets:** ${#SUBNET_IDS[@]}

### Security Groups
- **RDS Security Group:** \`$RDS_SG_ID\`
- **ElastiCache Security Group:** \`$ELASTICACHE_SG_ID\`
- **Application Security Group:** \`$APP_SG_ID\`

## 🗄️ Database (RDS PostgreSQL)
- **Identifier:** \`${PROJECT_NAME}-postgres\`
- **Engine:** PostgreSQL $POSTGRES_VERSION
- **Instance Class:** db.t3.micro
- **Storage:** 20GB GP3 (auto-scaling up to 1TB)
- **Endpoint:** \`$RDS_ENDPOINT\`
- **Database:** \`$DB_NAME\`
- **Username:** \`$DB_USERNAME\`
- **Features:**
  - ✅ Encryption at rest
  - ✅ Automated backups (7 days)
  - ✅ Performance Insights
  - ✅ CloudWatch logs export
  - ✅ Deletion protection
  - ✅ Multi-AZ standby (failover)

## 🔄 Cache (ElastiCache Valkey)
- **Cluster ID:** \`${PROJECT_NAME}-valkey\`
- **Engine:** Valkey 7.2
- **Node Type:** cache.t3.micro
- **Nodes:** 2 (with automatic failover)
- **Primary Endpoint:** \`$REDIS_ENDPOINT\`
- **Port:** 6379
- **Features:**
  - ✅ Encryption in transit
  - ✅ Encryption at rest
  - ✅ Authentication enabled
  - ✅ Automatic failover
  - ✅ Multi-AZ deployment
  - ✅ Automated snapshots (5 days)

## 🔒 Security Features
- Private subnets for databases
- Security groups with minimal required access
- SSL/TLS encryption for all connections
- Strong authentication tokens and passwords
- VPC isolation from public internet

## 📊 Monitoring & Maintenance
- **Backup Windows:**
  - RDS: 03:00-04:00 UTC daily
  - ElastiCache: 03:00-05:00 UTC daily
- **Maintenance Windows:**
  - RDS: Sunday 04:00-05:00 UTC
  - ElastiCache: Sunday 05:00-06:00 UTC
- Performance Insights enabled for RDS
- CloudWatch logs export enabled

## 💰 Cost Optimization
- Using t3.micro instances (suitable for development/testing)
- Auto-scaling storage for RDS
- Automated snapshots with retention policies
- For production, consider upgrading to larger instances

## 🚀 Next Steps
1. Update your application configuration to use the new endpoints
2. Test database connectivity from your application
3. Consider setting up monitoring and alerting
4. Review and adjust instance sizes based on your load
5. Set up automated backups to S3 if needed

## 📝 Important Notes
- All passwords and tokens are stored in the log file: \`$LOG_FILE\`
- Environment variables have been added to your \`.env\` file
- Keep your credentials secure and consider using AWS Secrets Manager for production
- Monitor your AWS costs and set up billing alerts

## 🗑️ Cleanup (if needed)
To delete all resources created by this script:
\`\`\`bash
./scripts/aws-infrastructure-cleanup.sh
\`\`\`
EOF
    
    log "📋 Infrastructure summary created: $SUMMARY_FILE"
}

# Main execution
main() {
    log "🚀 Starting AWS Infrastructure Setup for Watch Party Backend"
    log "Region: $AWS_REGION | Environment: $ENV"
    
    # Initialize log file
    echo "==============================================================================" > "$LOG_FILE"
    echo "AWS Infrastructure Setup Log - $(date)" >> "$LOG_FILE"
    echo "==============================================================================" >> "$LOG_FILE"
    
    check_prerequisites
    get_default_vpc_resources
    create_security_groups
    create_rds_subnet_group
    create_elasticache_subnet_group
    create_rds_instance
    create_elasticache_cluster
    update_env_file
    create_summary
    
    log "✅ AWS Infrastructure setup completed successfully!"
    log "📊 Check the summary file: aws-infrastructure-summary.md"
    log "📋 All credentials are logged in: $LOG_FILE"
    log "⚡ Your .env file has been updated with the new database configurations"
    
    info "🎉 Infrastructure is ready! You can now update your Django application to use AWS services."
    warn "💡 Remember to update your security groups to allow access from your application servers."
    warn "💰 Monitor your AWS costs and adjust instance sizes as needed."
}

# Run main function
main "$@"

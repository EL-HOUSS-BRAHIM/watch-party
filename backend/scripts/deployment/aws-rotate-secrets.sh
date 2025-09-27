#!/bin/bash
# =============================================================================
# AWS Credential Rotation & .env Updater
# =============================================================================
# Rotates RDS (PostgreSQL) master password and ElastiCache (Valkey) auth token
# then updates (in-place) the .env file with the new secure connection strings.
# Safe to re-run. Creates timestamped backup of .env first.
# =============================================================================
set -euo pipefail

AWS_REGION="eu-west-3"
PROJECT_NAME="watch-party"
ENV_FILE=".env"
LOG_FILE="aws-rotate-secrets.log"
APPLY_IMMEDIATELY=true   # set to false to defer modifications (RDS)
WAIT_AFTER_MODIFY=true   # wait until resources become available again

# Colors
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; BLUE='\033[0;34m'; NC='\033[0m'
log(){ echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"; }
warn(){ echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1" | tee -a "$LOG_FILE"; }
error(){ echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1" | tee -a "$LOG_FILE"; exit 1; }
info(){ echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO:${NC} $1" | tee -a "$LOG_FILE"; }

require_cmd(){ command -v "$1" >/dev/null 2>&1 || error "Missing required command: $1"; }

check_prerequisites(){
  log "Checking prerequisites..."
  for c in aws jq openssl sed grep; do require_cmd "$c"; done
  aws sts get-caller-identity --output json >/dev/null || error "AWS CLI not authenticated (run aws configure)";
  log "Prerequisites OK"
}

# Generates a safe token (hex only – avoids forbidden chars for ElastiCache auth tokens)
rand_hex(){ local n=${1:-32}; openssl rand -hex "$n"; }
# Generates DB password (alnum+symbols but remove potentially problematic chars)
rand_db_pwd(){ openssl rand -base64 48 | tr -d '=+/\n' | head -c 32; }

# Update (insert or replace) KEY=VALUE in .env (preserves order for existing keys)
set_env_var(){
  local key="$1"; shift; local value="$1"; shift || true
  if grep -E "^${key}=" "$ENV_FILE" >/dev/null 2>&1; then
    sed -i "s#^${key}=.*#${key}=${value//#/\\#}#" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

backup_env(){
  if [[ -f "$ENV_FILE" ]]; then
    local backup="${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    cp "$ENV_FILE" "$backup"
    log "Backed up .env to $backup"
  else
    warn ".env not found; creating new file"
    touch "$ENV_FILE"
  fi
}

# Retrieve current RDS metadata
fetch_rds(){
  DB_ID="${PROJECT_NAME}-postgres"
  aws rds describe-db-instances --db-instance-identifier "$DB_ID" --region "$AWS_REGION" >/tmp/rds.json || error "RDS instance $DB_ID not found"
  RDS_ENDPOINT=$(jq -r '.DBInstances[0].Endpoint.Address' /tmp/rds.json)
  DB_NAME=$(jq -r '.DBInstances[0].DBName' /tmp/rds.json)
  DB_USERNAME=$(jq -r '.DBInstances[0].MasterUsername' /tmp/rds.json)
  POSTGRES_VERSION=$(jq -r '.DBInstances[0].EngineVersion' /tmp/rds.json)
  DB_STATUS=$(jq -r '.DBInstances[0].DBInstanceStatus' /tmp/rds.json)
  log "RDS: endpoint=$RDS_ENDPOINT db=$DB_NAME user=$DB_USERNAME status=$DB_STATUS version=$POSTGRES_VERSION"
}

rotate_rds_password(){
  log "Rotating RDS master password..."
  NEW_DB_PASSWORD=$(rand_db_pwd)
  local apply_flag=""
  $APPLY_IMMEDIATELY && apply_flag="--apply-immediately"
  aws rds modify-db-instance \
    --db-instance-identifier "$DB_ID" \
    --master-user-password "$NEW_DB_PASSWORD" \
    $apply_flag \
    --region "$AWS_REGION" >/dev/null || error "Failed to modify RDS password"
  log "RDS password rotation initiated"
  if $WAIT_AFTER_MODIFY; then
    log "Waiting for RDS to return to 'available'..."
    aws rds wait db-instance-available --db-instance-identifier "$DB_ID" --region "$AWS_REGION" || error "RDS did not become available"
    fetch_rds
  else
    warn "Skipping wait for RDS availability"
  fi
}

# Fetch ElastiCache replication group metadata
fetch_cache(){
  CACHE_ID="${PROJECT_NAME}-valkey"
  aws elasticache describe-replication-groups --replication-group-id "$CACHE_ID" --region "$AWS_REGION" >/tmp/cache.json || error "ElastiCache replication group $CACHE_ID not found"
  CACHE_STATUS=$(jq -r '.ReplicationGroups[0].Status' /tmp/cache.json)
  REDIS_ENDPOINT=$(jq -r '.ReplicationGroups[0].NodeGroups[0].PrimaryEndpoint.Address // empty' /tmp/cache.json)
  if [[ -z "$REDIS_ENDPOINT" || "$REDIS_ENDPOINT" == "null" ]]; then
    REDIS_ENDPOINT=$(jq -r '.ReplicationGroups[0].ConfigurationEndpoint.Address // empty' /tmp/cache.json)
  fi
  log "Cache: status=$CACHE_STATUS endpoint=${REDIS_ENDPOINT:-<none>}"
}

rotate_cache_token(){
  log "Rotating ElastiCache auth token..."
  NEW_REDIS_TOKEN=$(rand_hex 48) # 96 hex chars
  # Use ROTATE strategy for safer rotation (supports old+new temporarily)
  aws elasticache modify-replication-group \
    --replication-group-id "$CACHE_ID" \
    --auth-token "$NEW_REDIS_TOKEN" \
    --auth-token-update-strategy ROTATE \
    --apply-immediately \
    --region "$AWS_REGION" >/dev/null || error "Failed to start cache auth token rotation"
  if $WAIT_AFTER_MODIFY; then
    log "Waiting for cache to finish modifying (this can take several minutes)..."
    local attempts=0; local max=60
    while (( attempts < max )); do
      fetch_cache
      [[ "$CACHE_STATUS" == "available" ]] && break
      sleep 20; ((attempts++))
    done
    if [[ "$CACHE_STATUS" != "available" ]]; then
      warn "Cache not available after wait; proceeding with latest known endpoint"
    fi
  fi
  # (Optional) finalize rotation by setting new token only (SET) after confirming clients updated
  # aws elasticache modify-replication-group --replication-group-id "$CACHE_ID" --auth-token "$NEW_REDIS_TOKEN" --auth-token-update-strategy SET --apply-immediately --region "$AWS_REGION"
}

update_env(){
  log "Updating .env with new credentials..."
  # RDS
  set_env_var DATABASE_PASSWORD "$NEW_DB_PASSWORD"
  set_env_var DATABASE_USER "$DB_USERNAME"
  set_env_var DATABASE_NAME "$DB_NAME"
  set_env_var DATABASE_HOST "$RDS_ENDPOINT"
  set_env_var DATABASE_PORT 5432
  set_env_var DB_SSL_MODE require
  local new_db_url="postgresql://${DB_USERNAME}:${NEW_DB_PASSWORD}@${RDS_ENDPOINT}:5432/${DB_NAME}?sslmode=require"
  set_env_var DATABASE_URL "$new_db_url"
  # Redis (only if endpoint present)
  if [[ -n "${REDIS_ENDPOINT:-}" ]]; then
    set_env_var REDIS_HOST "$REDIS_ENDPOINT"
    set_env_var REDIS_PORT 6379
    set_env_var REDIS_PASSWORD "$NEW_REDIS_TOKEN"
    set_env_var REDIS_USE_SSL True
    set_env_var REDIS_URL "rediss://:${NEW_REDIS_TOKEN}@${REDIS_ENDPOINT}:6379/0?ssl_cert_reqs=none"
    set_env_var CELERY_BROKER_URL "rediss://:${NEW_REDIS_TOKEN}@${REDIS_ENDPOINT}:6379/2?ssl_cert_reqs=none"
    set_env_var CELERY_RESULT_BACKEND "rediss://:${NEW_REDIS_TOKEN}@${REDIS_ENDPOINT}:6379/3?ssl_cert_reqs=none"
    set_env_var CHANNEL_LAYERS_CONFIG_HOSTS "rediss://:${NEW_REDIS_TOKEN}@${REDIS_ENDPOINT}:6379/4?ssl_cert_reqs=none"
  else
    warn "Redis endpoint not resolved; skipping Redis entries"
  fi
}

summary(){
  echo "==============================================" | tee -a "$LOG_FILE"
  echo "Credential Rotation Summary" | tee -a "$LOG_FILE"
  echo "RDS Endpoint: $RDS_ENDPOINT" | tee -a "$LOG_FILE"
  echo "RDS User: $DB_USERNAME" | tee -a "$LOG_FILE"
  echo "New RDS Password: $NEW_DB_PASSWORD" | tee -a "$LOG_FILE"
  if [[ -n "${REDIS_ENDPOINT:-}" ]]; then
    echo "Redis Endpoint: $REDIS_ENDPOINT" | tee -a "$LOG_FILE"
    echo "New Redis Auth Token: $NEW_REDIS_TOKEN" | tee -a "$LOG_FILE"
  fi
  echo "(Store these secrets securely e.g. AWS Secrets Manager)" | tee -a "$LOG_FILE"
}

main(){
  log "🚀 Starting credential rotation for project $PROJECT_NAME"
  check_prerequisites
  backup_env
  fetch_rds
  rotate_rds_password
  fetch_cache || true
  rotate_cache_token || warn "Cache token rotation failed or skipped"
  fetch_cache || true
  update_env
  summary
  log "✅ Rotation complete"
}

main "$@"

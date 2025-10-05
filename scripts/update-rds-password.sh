#!/bin/bash
#
# Script to update RDS password from AWS Secrets Manager
# This should be run periodically (via cron) to handle AWS RDS password rotation
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$PROJECT_ROOT/backend/.env"
AWS_REGION="eu-west-3"
SECRET_ID="rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Updating RDS password from AWS Secrets Manager...${NC}"

# Find AWS CLI path
AWS_CLI=""
if [ -f "/home/deploy/aws-cli-bin/aws" ]; then
    AWS_CLI="/home/deploy/aws-cli-bin/aws"
elif command -v aws &> /dev/null; then
    AWS_CLI="aws"
else
    echo -e "${RED}AWS CLI not found${NC}"
    exit 1
fi

# Get the secret from AWS Secrets Manager
SECRET_JSON=$($AWS_CLI secretsmanager get-secret-value \
    --secret-id "$SECRET_ID" \
    --region "$AWS_REGION" \
    --query SecretString \
    --output text)

if [ -z "$SECRET_JSON" ]; then
    echo -e "${RED}Failed to retrieve secret from AWS Secrets Manager${NC}"
    exit 1
fi

# Parse the JSON to extract database credentials
DB_USERNAME=$(echo "$SECRET_JSON" | jq -r '.username')
DB_PASSWORD=$(echo "$SECRET_JSON" | jq -r '.password')

# RDS endpoint and database name are fixed (not in the rotating secret)
DB_HOST="all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com"
DB_PORT="5432"
DB_NAME=$(echo "$SECRET_JSON" | jq -r '.dbname // "watchparty_prod"')

if [ -z "$DB_USERNAME" ] || [ -z "$DB_PASSWORD" ] || [ -z "$DB_HOST" ]; then
    echo -e "${RED}Failed to parse database credentials from secret${NC}"
    exit 1
fi

# URL-encode the password to handle special characters
ENCODED_PASSWORD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('${DB_PASSWORD}', safe=''))")

# Construct the DATABASE_URL with URL-encoded password
DATABASE_URL="postgresql://${DB_USERNAME}:${ENCODED_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=require"

# Backup the current .env file
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "${ENV_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}Backed up current .env file${NC}"
fi

# Update the DATABASE_URL in the .env file
if [ -f "$ENV_FILE" ]; then
    # Use sed to replace the DATABASE_URL line
    sed -i.tmp "/^DATABASE_URL=/c\\DATABASE_URL=${DATABASE_URL}" "$ENV_FILE"
    rm -f "${ENV_FILE}.tmp"
    echo -e "${GREEN}Updated DATABASE_URL in $ENV_FILE${NC}"
else
    echo -e "${YELLOW}.env file not found at $ENV_FILE${NC}"
    exit 1
fi

# Restart backend services if running in production
if command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Restarting backend services...${NC}"
    cd "$PROJECT_ROOT"
    docker-compose restart backend celery-worker celery-beat 2>/dev/null || true
    echo -e "${GREEN}Backend services restarted${NC}"
fi

echo -e "${GREEN}RDS password updated successfully!${NC}"
echo -e "${YELLOW}Database: ${DB_HOST}:${DB_PORT}/${DB_NAME}${NC}"
echo -e "${YELLOW}User: ${DB_USERNAME}${NC}"

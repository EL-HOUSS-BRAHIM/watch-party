#!/bin/bash
# Setup staging database on AWS RDS
# Creates watchparty_staging database if it doesn't exist

set -e

echo "🗄️  Setting up staging database..."

# Database connection details (from .env or AWS Secrets Manager)
DB_HOST="all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com"
DB_PORT="5432"
DB_ADMIN_USER="watchparty_admin"
DB_PRODUCTION="watchparty_prod"
DB_STAGING="watchparty_staging"

# Get password from environment or AWS Secrets Manager
if [ -z "$DB_PASSWORD" ]; then
    echo "Fetching database password from AWS Secrets Manager..."
    DB_SECRET=$(aws secretsmanager get-secret-value \
        --secret-id "rds!db-44fd826c-d576-4afd-8bf3-38f59d5cd4ae" \
        --region eu-west-3 \
        --query SecretString \
        --output text 2>/dev/null || echo "{}")
    
    DB_PASSWORD=$(echo "$DB_SECRET" | jq -r '.password // empty')
    
    if [ -z "$DB_PASSWORD" ]; then
        echo "❌ Could not fetch database password"
        echo "Please set DB_PASSWORD environment variable or ensure AWS credentials are configured"
        exit 1
    fi
fi

echo "✅ Database credentials retrieved"

# Check if staging database exists
echo "Checking if staging database exists..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$DB_PRODUCTION" \
    -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_STAGING'" | grep -q 1 && DB_EXISTS=1 || DB_EXISTS=0

if [ "$DB_EXISTS" -eq 1 ]; then
    echo "✅ Staging database '$DB_STAGING' already exists"
else
    echo "Creating staging database '$DB_STAGING'..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$DB_PRODUCTION" \
        -c "CREATE DATABASE $DB_STAGING WITH OWNER $DB_ADMIN_USER ENCODING 'UTF8';"
    echo "✅ Staging database created successfully"
fi

# Grant permissions
echo "Ensuring proper permissions..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_ADMIN_USER" -d "$DB_STAGING" \
    -c "GRANT ALL PRIVILEGES ON DATABASE $DB_STAGING TO $DB_ADMIN_USER;"

echo ""
echo "════════════════════════════════════════"
echo "✅ Staging database setup complete!"
echo "════════════════════════════════════════"
echo "Database: $DB_STAGING"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "User: $DB_ADMIN_USER"
echo ""
echo "Connection string:"
echo "postgresql://${DB_ADMIN_USER}:***@${DB_HOST}:${DB_PORT}/${DB_STAGING}?sslmode=require"
echo ""
echo "Add this to your staging environment .env:"
echo "STAGING_DATABASE_URL=postgresql://${DB_ADMIN_USER}:\${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_STAGING}?sslmode=require"

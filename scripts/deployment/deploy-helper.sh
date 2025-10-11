#!/bin/bash

# =============================================================================
# Watch Party Deployment Helper
# =============================================================================
# This script helps you choose the correct deployment configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'  
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Watch Party Deployment Helper       ${NC}"
echo -e "${BLUE}========================================${NC}"
echo

echo "This script helps you deploy Watch Party with the correct configuration."
echo

echo -e "${GREEN}Available deployment modes:${NC}"
echo
echo "1. AWS Production (Recommended for production)"
echo "   - Uses external AWS RDS PostgreSQL"
echo "   - Uses external AWS ElastiCache Valkey/Redis"
echo "   - Requires AWS infrastructure to be already set up"
echo "   - Uses: docker-compose.yml (default)"
echo
echo "2. Local Development"
echo "   - Uses PostgreSQL container"
echo "   - Uses Redis container"  
echo "   - Self-contained, no external dependencies"
echo "   - Uses: docker-compose.dev.yml"
echo

read -p "Which deployment mode do you want to use? (1 for AWS, 2 for Local): " choice

case $choice in
    1)
        echo
        echo -e "${GREEN}AWS Production Deployment Selected${NC}"
        echo
        echo "Prerequisites:"
        echo "✅ AWS RDS PostgreSQL: watch-party-postgres.cj6w0queklir.eu-west-3.rds.amazonaws.com"
        echo "✅ AWS ElastiCache Valkey: master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com"
        echo "✅ IAM role MyAppRole attached to server"
        echo
        echo "Configuration files:"
        echo "- backend/.env (update with your database password and Redis auth token)"
        echo "- frontend/.env.local (already configured with production endpoints)"
        echo
        echo -e "${YELLOW}Action Required:${NC}"
        echo "1. Update backend/.env with your actual AWS credentials"
        echo "2. Ensure AWS infrastructure is running"
        echo
        echo "Deploy command:"
        echo -e "${BLUE}docker-compose up -d${NC}"
        ;;
        
    2)
        echo
        echo -e "${GREEN}Local Development Deployment Selected${NC}"
        echo
        echo "This mode includes:"
        echo "✅ PostgreSQL container (no external database needed)"
        echo "✅ Redis container (no external cache needed)"
        echo "✅ All services self-contained"
        echo
        echo "Configuration files:"
        echo "- backend/.env (uses container hostnames: db, redis)"
        echo "- frontend/.env.local (uses localhost endpoints)"
        echo
        echo "Deploy command:"
        echo -e "${BLUE}docker-compose -f docker-compose.dev.yml up -d${NC}"
        ;;
        
    *)
        echo -e "${RED}Invalid choice. Please run the script again and choose 1 or 2.${NC}"
        exit 1
        ;;
esac

echo
read -p "Would you like to start the deployment now? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo
    echo -e "${GREEN}Starting deployment...${NC}"
    
    if [ $choice -eq 1 ]; then
        docker-compose up -d
    else
        docker-compose -f docker-compose.dev.yml up -d
    fi
    
    echo
    echo -e "${GREEN}Deployment started successfully!${NC}"
    echo
    echo "Monitor logs with:"
    if [ $choice -eq 1 ]; then
        echo "docker-compose logs -f"
    else
        echo "docker-compose -f docker-compose.dev.yml logs -f"
    fi
else
    echo
    echo "Deployment not started. You can run the deployment manually using the command shown above."
fi

echo
echo -e "${GREEN}Deployment helper complete!${NC}"
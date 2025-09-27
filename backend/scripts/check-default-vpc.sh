#!/bin/bash

# =============================================================================
# AWS Default VPC Check
# =============================================================================
# Quick check to verify default VPC exists before running setup
# =============================================================================

AWS_REGION="eu-west-3"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "Checking AWS default VPC in region: $AWS_REGION"
echo "================================================"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not configured. Run 'aws configure' first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ AWS CLI configured${NC}"

# Get caller identity
ACCOUNT_ID=$(aws sts get-caller-identity --query 'Account' --output text)
USERNAME=$(aws sts get-caller-identity --query 'Arn' --output text | cut -d'/' -f2)

echo "Account ID: $ACCOUNT_ID"
echo "User: $USERNAME"
echo ""

# Check default VPC
echo "Checking default VPC..."
VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=is-default,Values=true" \
    --region $AWS_REGION \
    --query 'Vpcs[0].VpcId' \
    --output text 2>/dev/null)

if [[ "$VPC_ID" == "None" || -z "$VPC_ID" ]]; then
    echo -e "${RED}❌ No default VPC found in region $AWS_REGION${NC}"
    echo ""
    echo "You need to create a default VPC. Run:"
    echo "aws ec2 create-default-vpc --region $AWS_REGION"
    echo ""
    echo "Or choose a different region that has a default VPC."
    exit 1
fi

echo -e "${GREEN}✅ Default VPC found: $VPC_ID${NC}"

# Check subnets
SUBNETS=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --region $AWS_REGION \
    --query 'Subnets[].{SubnetId:SubnetId,AZ:AvailabilityZone,CIDR:CidrBlock}' \
    --output table)

SUBNET_COUNT=$(aws ec2 describe-subnets \
    --filters "Name=vpc-id,Values=$VPC_ID" \
    --region $AWS_REGION \
    --query 'length(Subnets)' \
    --output text)

if [[ $SUBNET_COUNT -lt 2 ]]; then
    echo -e "${YELLOW}⚠️  Warning: Only $SUBNET_COUNT subnet(s) found. You need at least 2 for RDS.${NC}"
    echo "Consider creating additional subnets or using a different region."
else
    echo -e "${GREEN}✅ Found $SUBNET_COUNT subnets (sufficient for RDS)${NC}"
fi

echo ""
echo "Subnets in default VPC:"
echo "$SUBNETS"
echo ""

# Check internet gateway
IGW_ID=$(aws ec2 describe-internet-gateways \
    --filters "Name=attachment.vpc-id,Values=$VPC_ID" \
    --region $AWS_REGION \
    --query 'InternetGateways[0].InternetGatewayId' \
    --output text 2>/dev/null)

if [[ "$IGW_ID" == "None" || -z "$IGW_ID" ]]; then
    echo -e "${YELLOW}⚠️  No Internet Gateway attached to default VPC${NC}"
else
    echo -e "${GREEN}✅ Internet Gateway attached: $IGW_ID${NC}"
fi

echo ""
echo "================================================"
echo -e "${GREEN}🎉 Ready to run AWS infrastructure setup!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: ./scripts/aws-infrastructure-setup.sh"
echo "2. Test: python scripts/test-aws-connections.py"

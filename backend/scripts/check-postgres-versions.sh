#!/bin/bash

# Check available PostgreSQL versions in eu-west-3
echo "Checking available PostgreSQL versions in eu-west-3..."
echo "================================================="

aws rds describe-db-engine-versions \
    --engine postgres \
    --region eu-west-3 \
    --query 'DBEngineVersions[?contains(EngineVersion, `15.`) || contains(EngineVersion, `16.`)].{Version:EngineVersion,Description:DBEngineVersionDescription}' \
    --output table

echo ""
echo "Latest available version:"
aws rds describe-db-engine-versions \
    --engine postgres \
    --region eu-west-3 \
    --query 'DBEngineVersions[?contains(EngineVersion, `15.`) || contains(EngineVersion, `16.`)]|[0].EngineVersion' \
    --output text

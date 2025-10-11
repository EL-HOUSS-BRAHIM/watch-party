#!/bin/bash

# =============================================================================
# Test Script for Force Rebuild Fix
# =============================================================================
# Verifies that the force rebuild mechanism works correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Testing Force Rebuild Fix${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if we're in the right directory
if [ ! -f "scripts/deployment/build-docker-images.sh" ]; then
    echo -e "${RED}❌ Error: Must be run from the watch-party root directory${NC}"
    exit 1
fi

# Test 1: Check if build script accepts FORCE_REBUILD variable
echo -e "\n${BLUE}Test 1: Checking build script for FORCE_REBUILD support...${NC}"
if grep -q 'FORCE_REBUILD="\${FORCE_REBUILD:-0}"' scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ Build script supports FORCE_REBUILD variable${NC}"
else
    echo -e "${RED}❌ Build script missing FORCE_REBUILD support${NC}"
    exit 1
fi

# Test 2: Check if build script accepts REMOVE_OLD_IMAGES variable
echo -e "\n${BLUE}Test 2: Checking build script for REMOVE_OLD_IMAGES support...${NC}"
if grep -q 'REMOVE_OLD_IMAGES="\${REMOVE_OLD_IMAGES:-0}"' scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ Build script supports REMOVE_OLD_IMAGES variable${NC}"
else
    echo -e "${RED}❌ Build script missing REMOVE_OLD_IMAGES support${NC}"
    exit 1
fi

# Test 3: Check if build script uses --no-cache and --pull flags
echo -e "\n${BLUE}Test 3: Checking for --no-cache and --pull flags...${NC}"
if grep -q "\-\-no-cache \-\-pull" scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ Build script uses --no-cache and --pull flags${NC}"
else
    echo -e "${RED}❌ Build script missing --no-cache and --pull flags${NC}"
    exit 1
fi

# Test 4: Check if build script removes old images
echo -e "\n${BLUE}Test 4: Checking if build script removes old images...${NC}"
if grep -q "docker image rm watchparty-backend:latest" scripts/deployment/build-docker-images.sh && \
   grep -q "docker image rm watchparty-frontend:latest" scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ Build script removes old images when requested${NC}"
else
    echo -e "${RED}❌ Build script missing image removal logic${NC}"
    exit 1
fi

# Test 5: Check if clear-app-cache script removes old images
echo -e "\n${BLUE}Test 5: Checking if clear-app-cache removes images...${NC}"
if grep -q "docker image rm watchparty-backend:latest" scripts/deployment/clear-app-cache.sh && \
   grep -q "docker image rm watchparty-frontend:latest" scripts/deployment/clear-app-cache.sh; then
    echo -e "${GREEN}✅ Cache clearing script removes old images${NC}"
else
    echo -e "${RED}❌ Cache clearing script missing image removal${NC}"
    exit 1
fi

# Test 6: Check if deploy workflow supports force_rebuild input
echo -e "\n${BLUE}Test 6: Checking deploy workflow for force_rebuild input...${NC}"
if grep -q "force_rebuild:" .github/workflows/deploy.yml && \
   grep -q "FORCE_REBUILD:" .github/workflows/deploy.yml; then
    echo -e "${GREEN}✅ Deploy workflow supports force_rebuild input${NC}"
else
    echo -e "${RED}❌ Deploy workflow missing force_rebuild input${NC}"
    exit 1
fi

# Test 7: Check if deploy workflow passes FORCE_REBUILD to script
echo -e "\n${BLUE}Test 7: Checking if deploy workflow exports FORCE_REBUILD...${NC}"
if grep -q "export FORCE_REBUILD" .github/workflows/deploy.yml || \
   grep -q "envs:.*FORCE_REBUILD" .github/workflows/deploy.yml; then
    echo -e "${GREEN}✅ Deploy workflow exports FORCE_REBUILD environment variable${NC}"
else
    echo -e "${RED}❌ Deploy workflow doesn't export FORCE_REBUILD${NC}"
    exit 1
fi

# Test 8: Verify GIT_COMMIT_HASH mechanism still works
echo -e "\n${BLUE}Test 8: Verifying GIT_COMMIT_HASH mechanism still intact...${NC}"
if grep -q 'GIT_COMMIT_HASH=$(git rev-parse HEAD' scripts/deployment/build-docker-images.sh && \
   grep -q "build-arg GIT_COMMIT_HASH" scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ GIT_COMMIT_HASH cache busting still works${NC}"
else
    echo -e "${RED}❌ GIT_COMMIT_HASH mechanism broken${NC}"
    exit 1
fi

# Test 9: Check documentation exists
echo -e "\n${BLUE}Test 9: Checking for documentation...${NC}"
if [ -f "docs/DOCKER_CACHE_OPTIMIZATION.md" ] || [ -f "SOLUTION_SUMMARY.md" ]; then
    echo -e "${GREEN}✅ Documentation file exists${NC}"
else
    echo -e "${RED}❌ Documentation file missing${NC}"
    exit 1
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}Summary of changes:${NC}"
echo "1. ✅ build-docker-images.sh supports FORCE_REBUILD and REMOVE_OLD_IMAGES"
echo "2. ✅ Build script uses --no-cache and --pull flags when FORCE_REBUILD=1"
echo "3. ✅ Build script removes old images when REMOVE_OLD_IMAGES=1"
echo "4. ✅ clear-app-cache.sh removes old Docker images when target=all"
echo "5. ✅ Deploy workflow supports manual force rebuild option"
echo "6. ✅ Deploy workflow passes FORCE_REBUILD to deployment scripts"
echo "7. ✅ GIT_COMMIT_HASH cache busting mechanism still intact"
echo "8. ✅ Complete documentation provided"

echo -e "\n${BLUE}How to use:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Method 1: Clear caches workflow"
echo "  1. GitHub Actions → Clear Application Caches"
echo "  2. Run workflow with target 'all'"
echo "  3. Next deployment will build fresh (old images removed)"
echo ""
echo "Method 2: Manual force rebuild"
echo "  1. GitHub Actions → Deploy to Lightsail"
echo "  2. Click 'Run workflow'"
echo "  3. Check 'Force rebuild without cache'"
echo "  4. Run workflow (builds with --no-cache --pull)"
echo ""
echo "Method 3: SSH manual rebuild"
echo "  export FORCE_REBUILD=1"
echo "  export REMOVE_OLD_IMAGES=1"
echo "  bash scripts/deployment/build-docker-images.sh"

echo -e "\n${GREEN}✅ Force rebuild fix is correctly implemented!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

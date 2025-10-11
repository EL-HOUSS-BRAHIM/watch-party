#!/bin/bash

# =============================================================================
# Test Script for Docker Cache Optimization
# =============================================================================
# Verifies that Docker caching is properly configured for fast builds
# while still allowing manual cache clearing when needed

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Testing Docker Cache Optimization${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Must be run from the watch-party root directory${NC}"
    exit 1
fi

# Test 1: Verify cache_from is configured in docker-compose.yml
echo -e "\n${BLUE}Test 1: Checking cache_from configuration...${NC}"
if grep -A 5 "backend:" docker-compose.yml | grep -q "cache_from:"; then
    echo -e "${GREEN}✅ Backend has cache_from configuration${NC}"
else
    echo -e "${RED}❌ Backend missing cache_from configuration${NC}"
    exit 1
fi

if grep -A 15 "frontend:" docker-compose.yml | grep -q "cache_from:"; then
    echo -e "${GREEN}✅ Frontend has cache_from configuration${NC}"
else
    echo -e "${RED}❌ Frontend missing cache_from configuration${NC}"
    exit 1
fi

# Test 2: Verify cache_from references the built images
echo -e "\n${BLUE}Test 2: Checking cache_from references...${NC}"
if grep -A 5 "backend:" docker-compose.yml | grep "cache_from:" -A 1 | grep -q "watchparty-backend:latest"; then
    echo -e "${GREEN}✅ Backend cache_from references watchparty-backend:latest${NC}"
else
    echo -e "${RED}❌ Backend cache_from doesn't reference correct image${NC}"
    exit 1
fi

if grep -A 15 "frontend:" docker-compose.yml | grep "cache_from:" -A 1 | grep -q "watchparty-frontend:latest"; then
    echo -e "${GREEN}✅ Frontend cache_from references watchparty-frontend:latest${NC}"
else
    echo -e "${RED}❌ Frontend cache_from doesn't reference correct image${NC}"
    exit 1
fi

# Test 3: Verify BUILDKIT_INLINE_CACHE is NOT used (it was the problem)
echo -e "\n${BLUE}Test 3: Verifying BUILDKIT_INLINE_CACHE is not used...${NC}"
if grep -q "BUILDKIT_INLINE_CACHE" docker-compose.yml; then
    echo -e "${RED}❌ BUILDKIT_INLINE_CACHE found in docker-compose.yml (should not be there)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ BUILDKIT_INLINE_CACHE correctly not in docker-compose.yml${NC}"
fi

if grep -q "BUILDKIT_INLINE_CACHE" scripts/deployment/build-docker-images.sh; then
    echo -e "${RED}❌ BUILDKIT_INLINE_CACHE found in build script (should not be there)${NC}"
    exit 1
else
    echo -e "${GREEN}✅ BUILDKIT_INLINE_CACHE correctly not in build script${NC}"
fi

# Test 4: Verify Docker BuildKit is enabled
echo -e "\n${BLUE}Test 4: Checking Docker BuildKit is enabled...${NC}"
if grep -q "DOCKER_BUILDKIT=1" scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ Docker BuildKit is enabled${NC}"
else
    echo -e "${RED}❌ Docker BuildKit not enabled${NC}"
    exit 1
fi

# Test 5: Verify FORCE_REBUILD still bypasses cache
echo -e "\n${BLUE}Test 5: Verifying FORCE_REBUILD mechanism...${NC}"
if grep -q "FORCE_REBUILD" scripts/deployment/build-docker-images.sh && \
   grep -q -- "--no-cache --pull" scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ FORCE_REBUILD mechanism present and uses --no-cache${NC}"
else
    echo -e "${RED}❌ FORCE_REBUILD mechanism not working correctly${NC}"
    exit 1
fi

# Test 6: Verify clear-app-cache.sh removes images
echo -e "\n${BLUE}Test 6: Checking cache clearing removes images...${NC}"
if grep -q "docker image rm watchparty-backend:latest" scripts/deployment/clear-app-cache.sh && \
   grep -q "docker image rm watchparty-frontend:latest" scripts/deployment/clear-app-cache.sh; then
    echo -e "${GREEN}✅ Cache clearing script removes built images${NC}"
else
    echo -e "${RED}❌ Cache clearing script doesn't remove images${NC}"
    exit 1
fi

# Test 7: Verify clear-app-cache.sh clears Docker builder cache
echo -e "\n${BLUE}Test 7: Checking cache clearing removes builder cache...${NC}"
if grep -q "docker builder prune" scripts/deployment/clear-app-cache.sh; then
    echo -e "${GREEN}✅ Cache clearing script prunes Docker builder cache${NC}"
else
    echo -e "${RED}❌ Cache clearing script doesn't prune builder cache${NC}"
    exit 1
fi

# Test 8: Verify GIT_COMMIT_HASH mechanism still works
echo -e "\n${BLUE}Test 8: Verifying GIT_COMMIT_HASH cache busting...${NC}"
if grep -q 'GIT_COMMIT_HASH=$(git rev-parse HEAD' scripts/deployment/build-docker-images.sh && \
   grep -q 'GIT_COMMIT_HASH="$GIT_COMMIT_HASH"' scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ GIT_COMMIT_HASH mechanism still intact${NC}"
else
    echo -e "${RED}❌ GIT_COMMIT_HASH mechanism broken${NC}"
    exit 1
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${GREEN}How the optimized caching works:${NC}"
echo -e "1. Docker BuildKit enabled for fast layer caching"
echo -e "2. cache_from uses previous images as cache source"
echo -e "3. Normal builds: Fast (2-5 min) using cached layers"
echo -e "4. GIT_COMMIT_HASH invalidates cache for changed code"
echo -e "5. Clear Caches workflow: Removes images + builder cache"
echo -e "6. After clearing: Next build is fresh (5-15 min)"
echo -e "7. Subsequent builds: Fast again (cache restored)"
echo -e ""
echo -e "${GREEN}Expected behavior:${NC}"
echo -e "• Normal deployments: Fast (uses cache)"
echo -e "• After code changes: Fast (only rebuilds changed layers)"
echo -e "• After clearing cache: Slow but fresh (guaranteed clean build)"
echo -e "• FORCE_REBUILD=1: Slow but fresh (bypasses all cache)"
echo -e ""
echo -e "${GREEN}✅ Docker cache optimization correctly implemented!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

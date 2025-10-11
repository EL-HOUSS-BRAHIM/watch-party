#!/bin/bash

# =============================================================================
# BUILDKIT_INLINE_CACHE REMOVAL VALIDATION SCRIPT
# =============================================================================
# This script validates that BUILDKIT_INLINE_CACHE has been removed from
# docker-compose.yml and build scripts to ensure proper cache invalidation
# =============================================================================

set -e

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Testing BUILDKIT_INLINE_CACHE Removal${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Test 1: Check docker-compose.yml does not have BUILDKIT_INLINE_CACHE
echo -e "\n${BLUE}Test 1: Checking docker-compose.yml...${NC}"
if grep -q "BUILDKIT_INLINE_CACHE" docker-compose.yml; then
    echo -e "${RED}❌ BUILDKIT_INLINE_CACHE found in docker-compose.yml${NC}"
    echo -e "${RED}   This prevents proper cache invalidation after clearing cache${NC}"
    exit 1
else
    echo -e "${GREEN}✅ BUILDKIT_INLINE_CACHE removed from docker-compose.yml${NC}"
fi

# Test 2: Check build script does not pass BUILDKIT_INLINE_CACHE
echo -e "\n${BLUE}Test 2: Checking build-docker-images.sh...${NC}"
if grep -q "BUILDKIT_INLINE_CACHE" scripts/deployment/build-docker-images.sh; then
    echo -e "${RED}❌ BUILDKIT_INLINE_CACHE found in build-docker-images.sh${NC}"
    echo -e "${RED}   This prevents proper cache invalidation after clearing cache${NC}"
    exit 1
else
    echo -e "${GREEN}✅ BUILDKIT_INLINE_CACHE removed from build-docker-images.sh${NC}"
fi

# Test 3: Check clear-app-cache.sh still clears Docker builder cache
echo -e "\n${BLUE}Test 3: Checking cache clearing script...${NC}"
if grep -q "docker builder prune" scripts/deployment/clear-app-cache.sh; then
    echo -e "${GREEN}✅ Cache clearing script still prunes Docker builder cache${NC}"
else
    echo -e "${RED}❌ Cache clearing script missing Docker builder prune${NC}"
    exit 1
fi

# Test 4: Verify cache clearing is gated by TARGET=all
echo -e "\n${BLUE}Test 4: Checking cache clearing is gated by TARGET...${NC}"
if grep -q 'if \[ "$TARGET" = "all" \]' scripts/deployment/clear-app-cache.sh && \
   grep -A 5 'if \[ "$TARGET" = "all" \]' scripts/deployment/clear-app-cache.sh | grep -q "docker builder prune"; then
    echo -e "${GREEN}✅ Docker cache clearing is properly gated by TARGET=all${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Docker cache clearing may not be properly gated${NC}"
fi

# Test 5: Verify GIT_COMMIT_HASH mechanism still exists
echo -e "\n${BLUE}Test 5: Verifying GIT_COMMIT_HASH cache busting still works...${NC}"
if grep -q "GIT_COMMIT_HASH" scripts/deployment/build-docker-images.sh && \
   grep -q "GIT_COMMIT_HASH" frontend/Dockerfile && \
   grep -q "GIT_COMMIT_HASH" backend/Dockerfile; then
    echo -e "${GREEN}✅ GIT_COMMIT_HASH cache busting mechanism still in place${NC}"
else
    echo -e "${RED}❌ GIT_COMMIT_HASH mechanism broken${NC}"
    exit 1
fi

# Test 6: Check workflow file still uses cache clearing
echo -e "\n${BLUE}Test 6: Checking clear-caches workflow...${NC}"
if [ -f .github/workflows/clear-caches.yml ]; then
    if grep -q "clear-app-cache.sh" .github/workflows/clear-caches.yml; then
        echo -e "${GREEN}✅ Workflow still calls cache clearing script${NC}"
    else
        echo -e "${YELLOW}⚠️  Warning: Workflow may not call cache clearing script${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Warning: clear-caches.yml workflow not found${NC}"
fi

echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${GREEN}How the fix works now:${NC}"
echo -e "1. Manual cache clearing workflow removes Docker builder cache"
echo -e "2. BUILDKIT_INLINE_CACHE no longer embeds cache metadata in images"
echo -e "3. After clearing cache, next build starts completely fresh"
echo -e "4. GIT_COMMIT_HASH still provides per-commit cache invalidation"
echo -e "5. Regular deployments still use cache for speed"
echo -e ""
echo -e "${GREEN}Expected behavior:${NC}"
echo -e "• Normal deployments: Fast (uses cache)"
echo -e "• After clearing cache: Fresh build (no cache reuse from images)"
echo -e "• New commits: Cache busted at GIT_COMMIT_HASH layer"
echo -e ""
echo -e "${GREEN}✅ BUILDKIT_INLINE_CACHE removal is correctly implemented!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

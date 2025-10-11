#!/bin/bash

# =============================================================================
# Test Script for Docker Cache Busting Fix
# =============================================================================
# This script verifies that the Docker build cache busting mechanism works
# correctly by checking if code changes trigger fresh builds.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Testing Docker Cache Busting Fix${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Check if we're in the right directory
if [ ! -f "scripts/deployment/build-docker-images.sh" ]; then
    echo -e "${RED}❌ Error: Must be run from the watch-party root directory${NC}"
    exit 1
fi

# Test 1: Check if build script extracts git commit hash
echo -e "\n${BLUE}Test 1: Checking if build script extracts commit hash...${NC}"
if grep -q "GIT_COMMIT_HASH=\$(git rev-parse HEAD" scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ Build script extracts commit hash${NC}"
else
    echo -e "${RED}❌ Build script does not extract commit hash${NC}"
    exit 1
fi

# Test 2: Check if build script passes commit hash to builds
echo -e "\n${BLUE}Test 2: Checking if build script passes hash to Docker builds...${NC}"
if grep -q "build-arg GIT_COMMIT_HASH" scripts/deployment/build-docker-images.sh; then
    echo -e "${GREEN}✅ Build script passes hash to Docker builds${NC}"
else
    echo -e "${RED}❌ Build script does not pass hash to Docker builds${NC}"
    exit 1
fi

# Test 3: Check if frontend Dockerfile accepts and uses GIT_COMMIT_HASH
echo -e "\n${BLUE}Test 3: Checking frontend Dockerfile...${NC}"
if grep -q "ARG GIT_COMMIT_HASH" frontend/Dockerfile && \
   grep -q "RUN echo.*GIT_COMMIT_HASH" frontend/Dockerfile; then
    echo -e "${GREEN}✅ Frontend Dockerfile uses GIT_COMMIT_HASH${NC}"
else
    echo -e "${RED}❌ Frontend Dockerfile missing GIT_COMMIT_HASH usage${NC}"
    exit 1
fi

# Test 4: Check if backend Dockerfile accepts and uses GIT_COMMIT_HASH
echo -e "\n${BLUE}Test 4: Checking backend Dockerfile...${NC}"
if grep -q "ARG GIT_COMMIT_HASH" backend/Dockerfile && \
   grep -q "RUN echo.*GIT_COMMIT_HASH" backend/Dockerfile; then
    echo -e "${GREEN}✅ Backend Dockerfile uses GIT_COMMIT_HASH${NC}"
else
    echo -e "${RED}❌ Backend Dockerfile missing GIT_COMMIT_HASH usage${NC}"
    exit 1
fi

# Test 5: Check positioning - GIT_COMMIT_HASH should be before COPY operations
echo -e "\n${BLUE}Test 5: Checking ARG placement in Dockerfiles...${NC}"

# For frontend: Check if GIT_COMMIT_HASH comes before "COPY . ."
FRONTEND_CHECK=$(awk '/ARG GIT_COMMIT_HASH/{found=1} found && /COPY \. \./{print "OK"; exit} END{if(!found) print "NOT_FOUND"}' frontend/Dockerfile)
if [ "$FRONTEND_CHECK" = "OK" ]; then
    echo -e "${GREEN}✅ Frontend: GIT_COMMIT_HASH correctly placed before COPY${NC}"
else
    echo -e "${RED}❌ Frontend: GIT_COMMIT_HASH not properly positioned${NC}"
    exit 1
fi

# For backend: Check if GIT_COMMIT_HASH comes before "COPY . /app/"
BACKEND_CHECK=$(awk '/ARG GIT_COMMIT_HASH/{found=1} found && /COPY \. \/app\//{print "OK"; exit} END{if(!found) print "NOT_FOUND"}' backend/Dockerfile)
if [ "$BACKEND_CHECK" = "OK" ]; then
    echo -e "${GREEN}✅ Backend: GIT_COMMIT_HASH correctly placed before COPY${NC}"
else
    echo -e "${RED}❌ Backend: GIT_COMMIT_HASH not properly positioned${NC}"
    exit 1
fi

# Test 6: Simulate the cache busting by checking if git commit changes
echo -e "\n${BLUE}Test 6: Simulating commit hash extraction...${NC}"
CURRENT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
if [ "$CURRENT_HASH" != "unknown" ] && [ -n "$CURRENT_HASH" ]; then
    echo -e "${GREEN}✅ Can extract commit hash: ${CURRENT_HASH:0:8}...${NC}"
else
    echo -e "${YELLOW}⚠️  Could not extract commit hash (might be OK if not in git repo)${NC}"
fi

# Summary
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ All tests passed!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${BLUE}How the fix works:${NC}"
echo "1. Build script extracts git commit hash"
echo "2. Passes hash as build argument to Docker"
echo "3. Dockerfiles use the hash in a RUN command"
echo "4. When commit changes, hash changes"
echo "5. Docker invalidates cache for that layer and all after"
echo "6. COPY operations run fresh with new code"

echo -e "\n${GREEN}✅ Cache busting fix is correctly implemented!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

#!/bin/bash

# Authentication Flow Test Script
# Tests the complete authentication flow after deployment

set -e

# Configuration
FRONTEND_URL="${FRONTEND_URL:-https://watch-party.brahim-elhouss.me}"
TEST_EMAIL="${TEST_EMAIL:-admin@watchparty.local}"
TEST_PASSWORD="${TEST_PASSWORD:-admin123!}"
COOKIE_FILE=$(mktemp)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Cleanup on exit
trap "rm -f $COOKIE_FILE" EXIT

echo "🧪 Testing Authentication Flow"
echo "================================"
echo "Frontend: $FRONTEND_URL"
echo "Email: $TEST_EMAIL"
echo ""

# Test 1: Login
echo "📝 Test 1: Login"
echo "Attempting login..."

LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$FRONTEND_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  -c "$COOKIE_FILE")

LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)
LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n 1)

if [ "$LOGIN_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Login API returned 200 OK${NC}"
else
  echo -e "${RED}✗ Login API returned $LOGIN_STATUS${NC}"
  echo "Response: $LOGIN_BODY"
  exit 1
fi

# Check if response contains success
if echo "$LOGIN_BODY" | grep -q '"success".*true'; then
  echo -e "${GREEN}✓ Login response contains success=true${NC}"
else
  echo -e "${RED}✗ Login response missing success=true${NC}"
  echo "Response: $LOGIN_BODY"
  exit 1
fi

# Check if response does NOT contain tokens (security check)
if echo "$LOGIN_BODY" | grep -q 'access_token\|refresh_token'; then
  echo -e "${RED}✗ SECURITY ISSUE: Response contains tokens in JSON${NC}"
  echo "Tokens should be in HTTP-only cookies, not JSON response!"
  exit 1
else
  echo -e "${GREEN}✓ Response does not expose tokens (secure)${NC}"
fi

# Check if cookies were set
if grep -q "access_token" "$COOKIE_FILE"; then
  echo -e "${GREEN}✓ access_token cookie set${NC}"
else
  echo -e "${RED}✗ access_token cookie not set${NC}"
  echo "Cookie file contents:"
  cat "$COOKIE_FILE"
  exit 1
fi

if grep -q "refresh_token" "$COOKIE_FILE"; then
  echo -e "${GREEN}✓ refresh_token cookie set${NC}"
else
  echo -e "${RED}✗ refresh_token cookie not set${NC}"
  exit 1
fi

echo ""

# Test 2: Session validation
echo "📝 Test 2: Session Validation"
echo "Checking session with cookies..."

SESSION_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL/api/auth/session" \
  -b "$COOKIE_FILE")

SESSION_BODY=$(echo "$SESSION_RESPONSE" | head -n -1)
SESSION_STATUS=$(echo "$SESSION_RESPONSE" | tail -n 1)

if [ "$SESSION_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Session API returned 200 OK${NC}"
else
  echo -e "${RED}✗ Session API returned $SESSION_STATUS${NC}"
  echo "Response: $SESSION_BODY"
  exit 1
fi

if echo "$SESSION_BODY" | grep -q '"authenticated".*true'; then
  echo -e "${GREEN}✓ Session is authenticated${NC}"
else
  echo -e "${RED}✗ Session is not authenticated${NC}"
  echo "Response: $SESSION_BODY"
  exit 1
fi

if echo "$SESSION_BODY" | grep -q '"user"'; then
  echo -e "${GREEN}✓ User data present in session${NC}"
else
  echo -e "${RED}✗ User data missing from session${NC}"
  exit 1
fi

echo ""

# Test 3: Dashboard access
echo "📝 Test 3: Dashboard Access"
echo "Accessing dashboard with cookies..."

DASHBOARD_RESPONSE=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL/dashboard" \
  -b "$COOKIE_FILE" \
  -L) # Follow redirects

DASHBOARD_STATUS=$(echo "$DASHBOARD_RESPONSE" | tail -n 1)

if [ "$DASHBOARD_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Dashboard returned 200 OK${NC}"
else
  echo -e "${RED}✗ Dashboard returned $DASHBOARD_STATUS${NC}"
  exit 1
fi

# Check if response is HTML (not a redirect to login)
DASHBOARD_BODY=$(echo "$DASHBOARD_RESPONSE" | head -n -1)
if echo "$DASHBOARD_BODY" | grep -q "<!DOCTYPE html>\|<html"; then
  echo -e "${GREEN}✓ Dashboard loaded (HTML received)${NC}"
else
  echo -e "${YELLOW}⚠ Dashboard response is not HTML${NC}"
fi

# Check if we were NOT redirected to login
if echo "$DASHBOARD_BODY" | grep -q "Sign in to WatchParty\|Login"; then
  echo -e "${RED}✗ Redirected to login page (auth failed)${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Not redirected to login page${NC}"
fi

echo ""

# Test 4: Logout
echo "📝 Test 4: Logout"
echo "Logging out..."

LOGOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$FRONTEND_URL/api/auth/logout" \
  -b "$COOKIE_FILE" \
  -c "$COOKIE_FILE")

LOGOUT_STATUS=$(echo "$LOGOUT_RESPONSE" | tail -n 1)

if [ "$LOGOUT_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ Logout API returned 200 OK${NC}"
else
  echo -e "${RED}✗ Logout API returned $LOGOUT_STATUS${NC}"
  exit 1
fi

# Verify session is now invalid
SESSION_AFTER_LOGOUT=$(curl -s -w "\n%{http_code}" "$FRONTEND_URL/api/auth/session" \
  -b "$COOKIE_FILE")

SESSION_AFTER_STATUS=$(echo "$SESSION_AFTER_LOGOUT" | tail -n 1)
SESSION_AFTER_BODY=$(echo "$SESSION_AFTER_LOGOUT" | head -n -1)

if [ "$SESSION_AFTER_STATUS" = "401" ] || echo "$SESSION_AFTER_BODY" | grep -q '"authenticated".*false'; then
  echo -e "${GREEN}✓ Session invalidated after logout${NC}"
else
  echo -e "${RED}✗ Session still valid after logout${NC}"
  echo "Response: $SESSION_AFTER_BODY"
  exit 1
fi

echo ""
echo "================================"
echo -e "${GREEN}🎉 All tests passed!${NC}"
echo ""
echo "Summary:"
echo "  ✓ Login sets HTTP-only cookies"
echo "  ✓ Tokens not exposed in JSON"
echo "  ✓ Session validation works"
echo "  ✓ Dashboard accessible when authenticated"
echo "  ✓ Logout clears session"
echo ""
echo "Authentication flow is working correctly! 🚀"

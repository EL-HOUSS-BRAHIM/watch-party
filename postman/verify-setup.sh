#!/bin/bash

# =============================================================================
# Watch Party API - Quick Test Verification
# =============================================================================
# This script runs a quick verification of the test setup
# =============================================================================

set -e

POSTMAN_DIR="/workspaces/watch-party/postman"
BASE_URL="http://localhost:8000"

echo "🔍 Watch Party API Test Verification"
echo "====================================="
echo ""

# Check if files exist
echo "📁 Checking test files..."
files=(
    "$POSTMAN_DIR/Watch-Party-API-Collection.json"
    "$POSTMAN_DIR/Watch-Party-Advanced-Tests.json"
    "$POSTMAN_DIR/Watch-Party-Complete-Flow.json"
    "$POSTMAN_DIR/Watch-Party-All-Endpoints.json"
    "$POSTMAN_DIR/environments/Local-Development.postman_environment.json"
    "$POSTMAN_DIR/environments/Production.postman_environment.json"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $(basename "$file")"
    else
        echo "❌ $(basename "$file") - NOT FOUND"
    fi
done

echo ""

# Check Newman installation
echo "🛠️  Checking Newman installation..."
if command -v newman &> /dev/null; then
    echo "✅ Newman is installed: $(newman --version)"
else
    echo "❌ Newman is not installed"
    echo "💡 Install with: npm install -g newman"
fi

echo ""

# Check server status
echo "🌐 Checking Django server..."
if curl -f -s --max-time 5 "$BASE_URL/health/" > /dev/null 2>&1; then
    echo "✅ Django server is running at $BASE_URL"
    
    # Get server info
    health_data=$(curl -s "$BASE_URL/health/" | jq -r '.status' 2>/dev/null || echo "unknown")
    echo "   Status: $health_data"
else
    echo "❌ Django server is not responding"
    echo "💡 Start with: cd /workspaces/watch-party/back-end && python manage.py runserver"
fi

echo ""

# Check API endpoints
echo "🔗 Quick API check..."
endpoints=(
    "/api/"
    "/api/test/"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f -s --max-time 3 "$BASE_URL$endpoint" > /dev/null 2>&1; then
        echo "✅ $endpoint"
    else
        echo "❌ $endpoint"
    fi
done

echo ""

# Run a simple test if Newman is available and server is running
if command -v newman &> /dev/null && curl -f -s --max-time 3 "$BASE_URL/health/" > /dev/null 2>&1; then
    echo "🧪 Running quick health check test..."
    
    # Create a minimal test collection
    cat > "/tmp/quick-test.json" << 'EOF'
{
  "info": {
    "name": "Quick Health Check",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "event": [
        {
          "listen": "test",
          "script": {
            "exec": [
              "pm.test('Health check returns 200', function () {",
              "    pm.response.to.have.status(200);",
              "});",
              "",
              "pm.test('Response contains status', function () {",
              "    const responseJson = pm.response.json();",
              "    pm.expect(responseJson).to.have.property('status');",
              "});"
            ]
          }
        }
      ],
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "http://localhost:8000/health/",
          "host": ["http:", "", "localhost"],
          "port": "8000",
          "path": ["health", ""]
        }
      }
    }
  ]
}
EOF

    if newman run "/tmp/quick-test.json" --reporters cli 2>/dev/null; then
        echo "✅ Quick test passed!"
    else
        echo "❌ Quick test failed"
    fi
    
    # Cleanup
    rm -f "/tmp/quick-test.json"
else
    echo "⏭️  Skipping quick test (Newman not installed or server not running)"
fi

echo ""

# Summary
echo "📋 Summary:"
echo "==========="

if [ -f "$POSTMAN_DIR/Watch-Party-API-Collection.json" ] && \
   [ -f "$POSTMAN_DIR/environments/Local-Development.postman_environment.json" ] && \
   command -v newman &> /dev/null && \
   curl -f -s --max-time 3 "$BASE_URL/health/" > /dev/null 2>&1; then
    echo "🎉 Everything looks good! You can run the full test suite."
    echo ""
    echo "🚀 Quick start commands:"
    echo "   cd /workspaces/watch-party/postman"
    echo "   ./run-tests.sh basic          # Run basic tests only"
    echo "   ./run-tests.sh                # Run all tests"
    echo "   ./ci-test-runner.sh -v        # Run with verbose output"
else
    echo "⚠️  Some components are missing or not working properly."
    echo ""
    echo "🔧 Setup steps:"
    
    if [ ! -f "$POSTMAN_DIR/Watch-Party-API-Collection.json" ]; then
        echo "   • Test collections are missing - check file creation"
    fi
    
    if ! command -v newman &> /dev/null; then
        echo "   • Install Newman: npm install -g newman"
    fi
    
    if ! curl -f -s --max-time 3 "$BASE_URL/health/" > /dev/null 2>&1; then
        echo "   • Start Django server: cd /workspaces/watch-party/back-end && python manage.py runserver"
    fi
fi

echo ""
echo "📖 For detailed instructions, see: /workspaces/watch-party/postman/README.md"

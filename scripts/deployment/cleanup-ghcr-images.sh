#!/bin/bash
# Cleanup old GHCR images to keep only last N versions per environment
# Usage: ./cleanup-ghcr-images.sh [environment] [keep_count]

set -e

ENVIRONMENT=${1:-production}
KEEP_COUNT=${2:-10}
REGISTRY="ghcr.io"
REPO_OWNER="${GITHUB_REPOSITORY_OWNER:-el-houss-brahim}"
REPO_NAME="watch-party"

echo "🧹 Cleaning up GHCR images for $ENVIRONMENT environment"
echo "Keeping last $KEEP_COUNT versions..."

# Function to cleanup images for a service
cleanup_service() {
    local service=$1
    local image_name="${REGISTRY}/${REPO_OWNER}/${REPO_NAME}-${service}"
    
    echo ""
    echo "📦 Processing ${service}..."
    
    # Install skopeo if not present (for listing tags)
    if ! command -v skopeo &> /dev/null; then
        echo "Installing skopeo..."
        if command -v apt-get &> /dev/null; then
            sudo apt-get update -qq && sudo apt-get install -y -qq skopeo
        elif command -v yum &> /dev/null; then
            sudo yum install -y skopeo
        else
            echo "⚠️ Cannot install skopeo, skipping cleanup"
            return 0
        fi
    fi
    
    # Get all tags for this service and environment
    echo "Fetching tags for ${image_name}..."
    ALL_TAGS=$(skopeo list-tags "docker://${image_name}" 2>/dev/null | jq -r '.Tags[]' | grep "^${ENVIRONMENT}-" | grep -v "latest" || echo "")
    
    if [ -z "$ALL_TAGS" ]; then
        echo "✅ No tags found to clean up"
        return 0
    fi
    
    # Sort tags by name (which includes timestamp/SHA) in reverse
    SORTED_TAGS=$(echo "$ALL_TAGS" | sort -r)
    
    # Count total tags
    TOTAL_COUNT=$(echo "$SORTED_TAGS" | wc -l)
    echo "Found $TOTAL_COUNT ${ENVIRONMENT} tags"
    
    if [ "$TOTAL_COUNT" -le "$KEEP_COUNT" ]; then
        echo "✅ Nothing to clean (have $TOTAL_COUNT, keeping $KEEP_COUNT)"
        return 0
    fi
    
    # Get tags to delete (skip first N)
    TAGS_TO_DELETE=$(echo "$SORTED_TAGS" | tail -n +$((KEEP_COUNT + 1)))
    DELETE_COUNT=$(echo "$TAGS_TO_DELETE" | wc -l)
    
    echo "🗑️  Deleting $DELETE_COUNT old tags..."
    
    # Delete old tags using GitHub API
    if [ -n "$GITHUB_TOKEN" ]; then
        echo "$TAGS_TO_DELETE" | while read -r tag; do
            if [ -n "$tag" ]; then
                echo "  Deleting ${tag}..."
                
                # Get package version ID for this tag
                VERSION_ID=$(curl -s -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                    -H "Accept: application/vnd.github+json" \
                    "https://api.github.com/users/${REPO_OWNER}/packages/container/${REPO_NAME}-${service}/versions" \
                    | jq -r ".[] | select(.metadata.container.tags[] == \"${tag}\") | .id" | head -1)
                
                if [ -n "$VERSION_ID" ] && [ "$VERSION_ID" != "null" ]; then
                    curl -s -X DELETE \
                        -H "Authorization: Bearer ${GITHUB_TOKEN}" \
                        -H "Accept: application/vnd.github+json" \
                        "https://api.github.com/users/${REPO_OWNER}/packages/container/${REPO_NAME}-${service}/versions/${VERSION_ID}" \
                        > /dev/null 2>&1 && echo "    ✅ Deleted" || echo "    ⚠️  Failed to delete"
                else
                    echo "    ⚠️  Could not find version ID"
                fi
            fi
        done
    else
        echo "⚠️  GITHUB_TOKEN not set, cannot delete images via API"
        echo "Old tags to delete:"
        echo "$TAGS_TO_DELETE"
        return 0
    fi
    
    echo "✅ Cleanup completed for ${service}"
}

# Cleanup both backend and frontend
cleanup_service "backend"
cleanup_service "frontend"

echo ""
echo "════════════════════════════════════════"
echo "✅ GHCR cleanup completed!"
echo "Environment: $ENVIRONMENT"
echo "Kept: Last $KEEP_COUNT versions per service"
echo "════════════════════════════════════════"

#!/bin/bash

# Watch Party - Code Cleanup Script
# This script removes duplicate, backup, and unused files
# Run with: ./scripts/cleanup-codebase.sh [--dry-run]

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo -e "${YELLOW}Running in DRY RUN mode - no files will be deleted${NC}\n"
fi

DELETED_COUNT=0
KEPT_COUNT=0

# Function to safely remove file
remove_file() {
    local file="$1"
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would delete: $file${NC}"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    else
        if [ -f "$file" ]; then
            echo -e "${RED}Deleting: $file${NC}"
            rm "$file"
            DELETED_COUNT=$((DELETED_COUNT + 1))
        fi
    fi
}

# Function to keep file
keep_file() {
    local file="$1"
    local reason="$2"
    echo -e "${GREEN}Keeping: $file${NC} - $reason"
    KEPT_COUNT=$((KEPT_COUNT + 1))
}

echo "=========================================="
echo "WATCH PARTY - CODE CLEANUP"
echo "=========================================="
echo ""

# 1. TRUE BACKUP FILES (should be deleted)
echo -e "${BLUE}=== Checking Backup Files ===${NC}\n"

if [ -f "./backend/.env.backup.20251005_211912" ]; then
    remove_file "./backend/.env.backup.20251005_211912"
fi

if [ -f "./backend/config/settings/production_backup.py" ]; then
    remove_file "./backend/config/settings/production_backup.py"
fi

if [ -f "./backend/shared/api_documentation_backup.py" ]; then
    remove_file "./backend/shared/api_documentation_backup.py"
fi

# 2. WEBPACK CACHE OLD FILES (safe to delete)
echo ""
echo -e "${BLUE}=== Checking Webpack Cache Files ===${NC}\n"

find ./frontend/.next/cache -name "*.old" 2>/dev/null | while read -r file; do
    remove_file "$file"
done

# 3. ENHANCED FILES (KEEP - they are in use!)
echo ""
echo -e "${BLUE}=== Checking Enhanced Files ===${NC}\n"

keep_file "./backend/apps/videos/enhanced_views.py" "Used in videos/urls.py"
keep_file "./backend/apps/parties/views_enhanced.py" "Used in parties/urls.py"
keep_file "./backend/apps/chat/enhanced_party_consumer.py" "Active WebSocket consumer"
keep_file "./backend/shared/middleware/enhanced_middleware.py" "Used in settings/base.py"

# 4. ANALYTICS FIXED FILE (KEEP - in use)
echo ""
echo -e "${BLUE}=== Checking Analytics Files ===${NC}\n"

if [ -f "./backend/apps/analytics/views_advanced_fixed.py" ]; then
    # Check if it's imported anywhere
    if grep -r "views_advanced_fixed" ./backend/apps/analytics/urls.py >/dev/null 2>&1; then
        keep_file "./backend/apps/analytics/views_advanced_fixed.py" "Used in analytics/urls.py"
    else
        remove_file "./backend/apps/analytics/views_advanced_fixed.py"
    fi
fi

# 5. PLACEHOLDER IMAGES (KEEP - used by frontend)
echo ""
echo -e "${BLUE}=== Checking Placeholder Files ===${NC}\n"

keep_file "./frontend/public/placeholder.svg" "Used as image fallback"
keep_file "./frontend/public/placeholder-user.jpg" "Used for default avatars"

# 6. BACKUP SCRIPT (KEEP - it's a utility)
echo ""
echo -e "${BLUE}=== Checking Utility Scripts ===${NC}\n"

keep_file "./backend/scripts/maintenance/backup.sh" "Legitimate backup utility"

# 7. PYTHON CACHE AND COMPILED FILES
echo ""
echo -e "${BLUE}=== Checking Python Cache Files ===${NC}\n"

find . -type d -name "__pycache__" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/venv/*" -not -path "*/.venv/*" | while read -r dir; do
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would delete: $dir${NC}"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    else
        echo -e "${RED}Deleting: $dir${NC}"
        rm -rf "$dir"
        DELETED_COUNT=$((DELETED_COUNT + 1))
    fi
done

find . -name "*.pyc" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/venv/*" -not -path "*/.venv/*" | while read -r file; do
    remove_file "$file"
done

# 8. OLD DOCUMENTATION FIX FILES (move to archive)
echo ""
echo -e "${BLUE}=== Checking Documentation Files ===${NC}\n"

if [ ! -d "./docs/archive" ]; then
    if [ "$DRY_RUN" = false ]; then
        mkdir -p ./docs/archive
        echo -e "${GREEN}Created ./docs/archive directory${NC}"
    fi
fi

# Move old fix documentation to archive
find ./docs -maxdepth 1 -type f \( -name "*FIX*" -o -name "*BEFORE*" -o -name "*AFTER*" \) | while read -r file; do
    if [ "$DRY_RUN" = true ]; then
        echo -e "${YELLOW}[DRY RUN] Would move to archive: $file${NC}"
    else
        echo -e "${BLUE}Moving to archive: $file${NC}"
        mv "$file" ./docs/archive/
    fi
done

# 9. EMPTY FILES (excluding Python package __init__.py files which may be empty)
echo ""
echo -e "${BLUE}=== Checking Empty Files ===${NC}\n"

find . -type f -empty -not -name "__init__.py" -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/__pycache__/*" -not -path "*/venv/*" -not -path "*/.venv/*" | while read -r file; do
    remove_file "$file"
done

# 10. NODE_MODULES BUILD ARTIFACTS (optional cleanup)
echo ""
echo -e "${BLUE}=== Checking Node Build Artifacts ===${NC}\n"

if [ -d "./frontend/.next" ] && [ "$DRY_RUN" = false ]; then
    echo -e "${YELLOW}Clearing Next.js build cache...${NC}"
    rm -rf ./frontend/.next/cache
    echo -e "${GREEN}Next.js cache cleared${NC}"
fi

# Summary
echo ""
echo "=========================================="
echo "CLEANUP SUMMARY"
echo "=========================================="
echo -e "${RED}Files/Folders to Delete: $DELETED_COUNT${NC}"
echo -e "${GREEN}Files to Keep: $KEPT_COUNT${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${YELLOW}This was a DRY RUN. No files were actually deleted.${NC}"
    echo -e "${YELLOW}Run without --dry-run to perform the cleanup.${NC}"
    echo ""
    echo "To execute cleanup:"
    echo "  ./scripts/cleanup-codebase.sh"
else
    echo -e "${GREEN}Cleanup completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: git status"
    echo "  2. Review deleted files"
    echo "  3. Test application"
    echo "  4. Commit changes if everything works"
fi

echo ""
echo "=========================================="

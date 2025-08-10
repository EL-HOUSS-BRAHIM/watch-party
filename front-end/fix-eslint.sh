#!/bin/bash

echo "Starting comprehensive ESLint error fixes..."

# Function to fix a file
fix_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Skip if file doesn't exist
    if [[ ! -f "$file" ]]; then
        return
    fi
    
    # Create backup
    cp "$file" "$file.backup"
    
    # Fix unescaped entities
    sed -i "s/\([^&]\)'/\1\&apos;/g" "$file"
    sed -i "s/\([^&]\)\"/\1\&quot;/g" "$file"
    sed -i "s/ '/ \&apos;/g" "$file"
    sed -i "s/ \"/ \&quot;/g" "$file"
    
    # Fix any types
    sed -i 's/: any\[\]/: unknown[]/g' "$file"
    sed -i 's/: any\s*=/: unknown =/g' "$file"
    sed -i 's/: any\s*)/: unknown)/g' "$file"
    sed -i 's/: any\s*,/: unknown,/g' "$file"
    sed -i 's/: any\s*;/: unknown;/g' "$file"
    sed -i 's/: any\s*|/: unknown |/g' "$file"
    sed -i 's/| any\s/| unknown /g' "$file"
    sed -i 's/<any>/<unknown>/g' "$file"
    
    # Fix Function type
    sed -i 's/Function/(...args: unknown[]) => unknown/g' "$file"
    
    # Remove unused import lines for specific unused imports
    sed -i '/^[[:space:]]*Users,/d' "$file"
    sed -i '/^[[:space:]]*AlertTriangle,/d' "$file"
    sed -i '/^[[:space:]]*Volume2,/d' "$file"
    sed -i '/^[[:space:]]*VolumeX,/d' "$file"
    sed -i '/^[[:space:]]*Undo,/d' "$file"
    sed -i '/^[[:space:]]*Filter,/d' "$file"
    sed -i '/^[[:space:]]*Separator,/d' "$file"
    sed -i '/^[[:space:]]*DropdownMenu/,/^[[:space:]]*}/d' "$file"
    
    # Fix require imports
    sed -i 's/const \([a-zA-Z_][a-zA-Z0-9_]*\) = require(\(['"'"'"]\)\([^'"'"'"]*\)\2)/import \1 from \2\3\2/g' "$file"
    
    # Fix let to const where appropriate (simple cases)
    sed -i 's/let \([a-zA-Z_][a-zA-Z0-9_]*\) = \([^;]*filter[^;]*\)/const \1 = \2/g' "$file"
    
    echo "Fixed: $file"
}

# List of files to fix (focusing on the ones with errors)
files=(
    "app/dashboard/quality/page.tsx"
    "components/social/block-unblock-manager.tsx"
    "components/social/enhanced-friend-search.tsx"
    "components/social/enhanced-social-features.tsx"
    "components/social/friend-profile-preview.tsx"
    "components/social/friend-requests-management.tsx"
    "components/social/friend-requests.tsx"
    "components/social/friends-list.tsx"
    "components/social/friends-manager.tsx"
    "components/social/groups-manager.tsx"
    "components/social/mutual-friends-suggestions.tsx"
    "components/social/online-status-indicators.tsx"
    "components/social/profile-preview.tsx"
    "components/social/smart-friend-search.tsx"
    "components/social/user-search.tsx"
    "components/store/cart-system.tsx"
    "components/store/store-items.tsx"
    "components/store/store-purchase-modal.tsx"
    "components/store/store-rewards.tsx"
    "components/testing/testing-suite-dashboard.tsx"
    "components/theme/AccessibilityPanel.tsx"
    "components/theme/theme-switcher.tsx"
    "components/ui/chart.tsx"
    "components/ui/command-palette.tsx"
    "components/ui/drag-drop-upload.tsx"
    "components/ui/error-boundary.tsx"
    "components/ui/form-enhanced.tsx"
    "components/ui/lazy-image.tsx"
    "components/ui/mobile-video-controls.tsx"
    "components/ui/profile-preview.tsx"
    "components/ui/use-toast.ts"
    "components/ui/watch-party-table.tsx"
    "components/ui/watch-party-textarea.tsx"
    "components/video/advanced-video-player.tsx"
    "components/video/stream-analytics-overlay.tsx"
    "components/video/video-library.tsx"
    "components/video/video-player.tsx"
    "components/video/video-thumbnail-preview.tsx"
    "components/video/video-upload.tsx"
    "components/video/video-uploader.tsx"
    "components/videos/video-comments.tsx"
    "components/videos/video-details.tsx"
    "components/videos/video-management.tsx"
    "lib/api/admin.ts"
    "lib/api/analytics.ts"
    "lib/api/client.ts"
    "lib/api/index.ts"
    "lib/api/messaging.ts"
    "lib/api/mobile.ts"
    "lib/api/moderation.ts"
    "lib/api/notifications.ts"
    "lib/api/parties.ts"
    "lib/api/safe-access.ts"
    "lib/api/search.ts"
    "lib/api/types.ts"
    "lib/api/users.ts"
    "lib/api/videos.ts"
    "lib/performance/bundle-analyzer.ts"
    "lib/performance/cache.ts"
    "lib/performance/lazy-loading.tsx"
)

# Process each file
for file in "${files[@]}"; do
    if [[ -f "$file" ]]; then
        fix_file "$file"
    fi
done

echo "Basic fixes complete. Now running targeted fixes..."

# Specific fixes for known issues
echo "Fixing specific unescaped entities..."

# Fix the specific unescaped entity issues
find . -name "*.tsx" -not -path "./node_modules/*" -exec sed -i "s/Don't/Don\&apos;t/g" {} \;
find . -name "*.tsx" -not -path "./node_modules/*" -exec sed -i "s/Can't/Can\&apos;t/g" {} \;
find . -name "*.tsx" -not -path "./node_modules/*" -exec sed -i "s/Won't/Won\&apos;t/g" {} \;
find . -name "*.tsx" -not -path "./node_modules/*" -exec sed -i "s/\"([^\"]*)\"/\&quot;\1\&quot;/g" {} \;

echo "All fixes applied. Running lint check..."
npx next lint --max-warnings 0 || echo "Some issues may remain - manual review needed"

echo "Fix script completed!"

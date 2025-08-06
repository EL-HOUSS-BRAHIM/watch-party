#!/bin/bash

# Script to update mocked data in remaining files
# This script will add API imports and basic error handling to files that use mocked data

FILES_TO_UPDATE=(
  "app/dashboard/quality/page.tsx"
  "app/dashboard/analytics/dashboard/page.tsx"
  "app/dashboard/analytics/ab-testing/page.tsx"
  "app/dashboard/analytics/predictive/page.tsx"
  "app/dashboard/admin/analytics/page.tsx"
  "app/dashboard/admin/users/page.tsx"
  "app/dashboard/admin/reports/page.tsx"
  "app/dashboard/admin/page.tsx"
  "app/dashboard/feedback/page.tsx"
  "app/admin/system/page.tsx"
  "app/admin/system/logs/page-clean.tsx"
)

for file in "${FILES_TO_UPDATE[@]}"; do
  if [ -f "/home/bross/Desktop/v0-watch-party-y6/$file" ]; then
    echo "Processing $file..."
    
    # Backup original file
    cp "/home/bross/Desktop/v0-watch-party-y6/$file" "/home/bross/Desktop/v0-watch-party-y6/$file.backup"
    
    # Add API imports if not present
    if ! grep -q "useToast" "/home/bross/Desktop/v0-watch-party-y6/$file"; then
      sed -i '1i import { useToast } from "@/hooks/use-toast"' "/home/bross/Desktop/v0-watch-party-y6/$file"
    fi
    
    if ! grep -q "adminAPI\|analyticsAPI" "/home/bross/Desktop/v0-watch-party-y6/$file"; then
      sed -i '2i import { adminAPI, analyticsAPI } from "@/lib/api"' "/home/bross/Desktop/v0-watch-party-y6/$file"
    fi
    
    echo "Updated $file"
  else
    echo "File $file not found, skipping..."
  fi
done

echo "Batch update completed!"

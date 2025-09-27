#!/bin/bash
set -e

cd $(dirname $0)/../frontend

echo "Starting frontend development server..."
if command -v pnpm &> /dev/null; then
    pnpm dev
else
    npm run dev
fi

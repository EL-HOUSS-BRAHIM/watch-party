#!/bin/bash

# Project Restructure Cleanup Script
# This script removes old directories and files after restructuring

echo "🧹 Starting project cleanup after restructuring..."

# Remove old directories (now moved to new structure)
echo "Removing old directories..."

# Remove old watchparty config (moved to config/)
if [ -d "watchparty" ]; then
    echo "  Removing watchparty/ (moved to config/)"
    rm -rf watchparty/
fi

# Remove old middleware (moved to shared/middleware/)
if [ -d "middleware" ]; then
    echo "  Removing middleware/ (moved to shared/middleware/)"
    rm -rf middleware/
fi

# Remove old services (moved to shared/services/)
if [ -d "services" ]; then
    echo "  Removing services/ (moved to shared/services/)"
    rm -rf services/
fi

# Remove old utils (moved to shared/utils/)
if [ -d "utils" ]; then
    echo "  Removing utils/ (moved to shared/utils/)"
    rm -rf utils/
fi

# Remove old core (moved to shared/)
if [ -d "core" ]; then
    echo "  Removing core/ (moved to shared/)"
    rm -rf core/
fi

# Remove development virtual environments
echo "Removing development virtual environments..."
if [ -d "venv" ]; then
    echo "  Removing venv/"
    rm -rf venv/
fi

if [ -d "test_venv" ]; then
    echo "  Removing test_venv/"
    rm -rf test_venv/
fi

# Remove redundant files
echo "Removing redundant files..."

# Remove duplicate cleanup scripts
if [ -f "cleanup.sh" ]; then
    echo "  Removing root cleanup.sh (moved to scripts/maintenance/)"
    rm -f cleanup.sh
fi

if [ -f "cleanup_project.py" ]; then
    echo "  Removing cleanup_project.py"
    rm -f cleanup_project.py
fi

# Remove old requirements (moved to requirements/production.txt)
if [ -f "requirements-test.txt" ]; then
    echo "  Removing requirements-test.txt (consolidated into requirements/testing.txt)"
    rm -f requirements-test.txt
fi

# Remove temporary and log files
echo "Cleaning up temporary files..."
find . -name "*.pyc" -delete
find . -name "*.pyo" -delete
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.log" -not -path "./logs/*" -delete 2>/dev/null || true

# Remove various temporary files
rm -f *.tmp
rm -f *.temp
rm -f log.log
rm -f workflow-logs.log
rm -f aws-rotate-secrets.log

# Remove development artifacts
if [ -f "security_config.py" ]; then
    echo "  Removing security_config.py (development artifact)"
    rm -f security_config.py
fi

# Clean up redundant shell scripts in root
echo "Moving root shell scripts to appropriate locations..."
for script in activate_venv.sh run_dev_server.sh run_with_websockets.sh health-check.sh manage.sh nginx-helper.sh set-all-secrets.sh; do
    if [ -f "$script" ]; then
        echo "  Removing $script from root (functionality moved to scripts/)"
        rm -f "$script"
    fi
done

# Remove redundant markdown files
echo "Cleaning up documentation..."
if [ -f "AWS_MIGRATION_GUIDE.md" ]; then
    echo "  Moving AWS_MIGRATION_GUIDE.md to docs/"
    mkdir -p docs/deployment/
    mv AWS_MIGRATION_GUIDE.md docs/deployment/
fi

if [ -f "MANAGEMENT_SYSTEM.md" ]; then
    echo "  Moving MANAGEMENT_SYSTEM.md to docs/"
    mkdir -p docs/
    mv MANAGEMENT_SYSTEM.md docs/
fi

if [ -f "CLEANUP_SUMMARY.md" ]; then
    echo "  Removing CLEANUP_SUMMARY.md (outdated)"
    rm -f CLEANUP_SUMMARY.md
fi

if [ -f "aws-infrastructure-summary.md" ]; then
    echo "  Moving aws-infrastructure-summary.md to docs/deployment/"
    mkdir -p docs/deployment/
    mv aws-infrastructure-summary.md docs/deployment/
fi

if [ -f "github-secrets-template.txt" ]; then
    echo "  Moving github-secrets-template.txt to docs/deployment/"
    mkdir -p docs/deployment/
    mv github-secrets-template.txt docs/deployment/
fi

echo "✅ Project cleanup completed!"
echo ""
echo "📁 New structure summary:"
echo "  ├── config/          # Django configuration (was watchparty/)"
echo "  ├── shared/          # Shared utilities (was core/, middleware/, services/, utils/)"
echo "  ├── apps/            # Django applications"
echo "  ├── requirements/    # Organized requirements files"
echo "  ├── scripts/         # Organized by purpose (deployment/, development/, maintenance/)"
echo "  ├── tests/           # Project-wide tests"
echo "  └── docs/            # Consolidated documentation"
echo ""
echo "🔄 Next steps:"
echo "1. Update import statements to use new structure"
echo "2. Test that the application starts correctly"
echo "3. Run migrations if needed"
echo "4. Update deployment scripts with new paths"
echo ""
echo "💡 Note: Run 'python manage.py check' to verify the new structure works correctly"

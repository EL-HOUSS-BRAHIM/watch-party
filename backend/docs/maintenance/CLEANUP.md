# Project Cleanup Guide

This document describes the cleanup procedures and tools available for the Watch Party Backend project.

## Overview

Regular cleanup helps maintain:
- ✅ Clean codebase with optimized imports
- ✅ Reduced disk usage
- ✅ Better Git performance
- ✅ Faster development environment
- ✅ Consistent code formatting

## Cleanup Script

The main cleanup script is `cleanup.sh` which provides comprehensive project maintenance.

### Usage

```bash
# Full cleanup (recommended)
./cleanup.sh

# Specific cleanup operations
./cleanup.sh --cache-only    # Clean only Python cache files
./cleanup.sh --logs-only     # Clean only log files  
./cleanup.sh --temp-only     # Clean only temporary files
./cleanup.sh --imports-only  # Optimize only imports
./cleanup.sh --git-only      # Optimize only Git repository

# Get help
./cleanup.sh --help
```

## What Gets Cleaned

### 1. Python Cache Files
- **Files**: `*.pyc` files
- **Directories**: `__pycache__/` directories
- **Why**: Reduces disk usage and prevents stale bytecode issues

### 2. Log Files
- **Files**: `logfile`, `*.log`, `*.out`, `*.err`
- **Action**: Removes old logs, recreates empty `logs/django.log`
- **Why**: Prevents log files from growing too large

### 3. Temporary Files
- **Patterns**: `*.tmp`, `*.temp`, `*.bak`, `*.backup`, `*.swp`, `*.swo`, `.DS_Store`, `Thumbs.db`
- **Why**: Removes editor and system temporary files

### 4. Import Optimization
- **Tool**: `autoflake` - removes unused imports and variables
- **Tool**: `isort` - organizes import statements
- **Excludes**: Migration files
- **Why**: Cleaner, more maintainable code

### 5. Django Static Files
- **Command**: `python manage.py collectstatic --clear --noinput`
- **Why**: Removes old static files and regenerates them
- **Note**: Requires database connection

### 6. Git Repository
- **Command**: `git gc --prune=now`
- **Why**: Optimizes Git repository and reclaims disk space

## Automatic Cleanup Tasks

The project includes several automatic cleanup tasks:

### 1. Video Temporary Files
- **Location**: `apps/videos/tasks.py`
- **Function**: `cleanup_temporary_files()`
- **Schedule**: Periodic cleanup of video processing temp files
- **Triggers**: Celery task

### 2. Database Cleanup
- **Location**: `core/background_tasks.py`
- **Function**: `cleanup_expired_data()`
- **Cleans**: Old search queries, expired sessions, analytics data
- **Schedule**: Regular intervals

### 3. Notifications Cleanup
- **Location**: `apps/notifications/views.py`
- **Function**: `cleanup_old_notifications()`
- **Endpoint**: `POST /api/notifications/cleanup/`
- **Cleans**: Old read notifications (30+ days)

### 4. Analytics Cleanup
- **Location**: `apps/analytics/tasks.py`
- **Function**: `cleanup_old_analytics()`
- **Cleans**: Old analytics data to maintain performance

## Manual Cleanup Commands

For specific cleanup needs:

```bash
# Remove Python cache files
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +

# Remove log files
rm -f logfile *.log *.out *.err

# Remove temporary files
find . -name "*.tmp" -o -name "*.temp" -o -name "*.bak" | xargs rm -f

# Optimize imports (requires autoflake)
autoflake --remove-all-unused-imports --remove-unused-variables --in-place --recursive . --exclude=migrations

# Sort imports (requires isort)
isort . --skip=migrations --skip=venv --profile=django

# Git cleanup
git gc --prune=now
git remote prune origin
```

## Best Practices

### Regular Cleanup Schedule
- **Daily**: Run cache cleanup (`./cleanup.sh --cache-only`)
- **Weekly**: Run full cleanup (`./cleanup.sh`)
- **Monthly**: Deep cleanup including database tasks
- **Before releases**: Always run full cleanup

### Pre-commit Hooks
Consider adding cleanup commands to pre-commit hooks:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: cleanup-cache
        name: Clean Python cache
        entry: find . -name "*.pyc" -delete
        language: system
        pass_filenames: false
```

### CI/CD Integration
Add cleanup to deployment pipelines:

```yaml
# GitHub Actions example
- name: Cleanup project
  run: ./cleanup.sh --cache-only --temp-only
```

## Monitoring Cleanup

### Project Size Monitoring
```bash
# Check total project size
du -sh .

# Check largest directories
du -sh */ | sort -hr | head -10

# Check for large files
find . -size +10M -type f -exec ls -lh {} \;
```

### Health Check
The project includes a health check script:

```bash
python check_todo_status.py
```

This validates:
- ✅ All required apps are installed
- ✅ Critical endpoints are configured
- ✅ Database models are accessible
- ✅ All TODO items are implemented

## Troubleshooting

### Common Issues

1. **Permission denied**
   ```bash
   chmod +x cleanup.sh
   ```

2. **Django setup fails**
   - Ensure database is accessible
   - Check `DJANGO_SETTINGS_MODULE` environment variable
   - Verify `requirements.txt` dependencies are installed

3. **autoflake/isort not found**
   ```bash
   pip install autoflake isort
   ```

4. **Git cleanup fails**
   - Ensure you're in a Git repository
   - Check for pending changes: `git status`

### Recovery

If cleanup causes issues:

```bash
# Restore from Git (if changes were committed)
git checkout HEAD -- .

# Reinstall dependencies
pip install -r requirements.txt

# Regenerate migrations if needed
python manage.py makemigrations
python manage.py migrate
```

## Advanced Cleanup

### Database Vacuum (PostgreSQL)
```sql
VACUUM ANALYZE;
REINDEX DATABASE watchparty;
```

### Media Files Cleanup
```bash
# Remove orphaned media files (be careful!)
# This should be done with a proper Django management command
python manage.py cleanup_unused_media
```

### Docker Cleanup (if using Docker)
```bash
docker system prune -a
docker volume prune
```

## Automation

### Cron Job Example
```bash
# Add to crontab for weekly cleanup
0 2 * * 0 cd /path/to/project && ./cleanup.sh > /tmp/cleanup.log 2>&1
```

### Systemd Timer Example
```ini
[Unit]
Description=Watch Party Cleanup
Requires=watch-party-cleanup.service

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

---

## Summary

Regular cleanup is essential for maintaining a healthy Django project. Use the provided `cleanup.sh` script for routine maintenance, and monitor the project health with the included tools. Always test cleanup procedures in development before applying to production environments.

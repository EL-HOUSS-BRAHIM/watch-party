# Watch Party Backend Management System

A comprehensive management system for the Watch Party Backend project with a main `manage.sh` script and specialized scripts for different operations.

## 🚀 Quick Start

```bash
# Make the main script executable (if not already)
chmod +x manage.sh

# Show all available commands
./manage.sh help

# Complete project setup
./manage.sh setup

# Start development server
./manage.sh dev

# Create a backup
./manage.sh backup

# View system status
./manage.sh status
```

## 📂 Structure

```
watch-party-backend/
├── manage.sh              # Main management script (entry point)
└── scripts/               # Specialized scripts directory
    ├── development.sh     # Development operations
    ├── setup.sh          # Project setup and installation
    ├── cleanup.sh        # Cleanup operations
    ├── backup.sh         # Backup and restore
    ├── wipeout.sh        # Destructive operations
    ├── health.sh         # Health checks and monitoring
    ├── monitoring.sh     # System monitoring and logs
    ├── check-logs.sh     # Log configuration diagnostics
    ├── diagnose-gunicorn.sh # Comprehensive Gunicorn service diagnostics
    ├── deployment.sh     # Deployment operations
    └── nginx-config.sh   # Nginx configuration
```

## 🎯 Main Commands (`./manage.sh`)

### Development Commands
```bash
./manage.sh dev                    # Start development server
./manage.sh dev-ws                 # Start with WebSocket support
./manage.sh shell                  # Open Django shell
./manage.sh test                   # Run tests
./manage.sh migrate               # Run migrations
./manage.sh makemigrations        # Create migrations
./manage.sh createsuperuser       # Create Django superuser
```

### Project Management
```bash
./manage.sh setup                 # Complete project setup
./manage.sh install               # Install dependencies only
./manage.sh check                 # Run health checks
./manage.sh status                # Show project status
./manage.sh clean                 # Clean project files
./manage.sh logs                  # View logs
```

### Deployment & Server
```bash
./manage.sh deploy               # Deploy to production
./manage.sh deploy-staging       # Deploy to staging
./manage.sh server-setup         # Setup production server
./manage.sh nginx-config         # Configure Nginx
```

### Backup & Maintenance
```bash
./manage.sh backup               # Create full backup
./manage.sh restore <file>       # Restore from backup
./manage.sh db-backup            # Database backup only
./manage.sh monitor              # Show monitoring dashboard
```

### Destructive Operations ⚠️
```bash
./manage.sh wipeout             # Remove project data (keep structure)
./manage.sh nuke                # COMPLETE project removal
```

## 🛠️ Specialized Scripts

### Development Script (`scripts/development.sh`)
Handle all development-related operations:

```bash
# Direct usage
./scripts/development.sh start           # Start dev server
./scripts/development.sh start-ws        # Start with WebSocket
./scripts/development.sh test            # Run tests
./scripts/development.sh reset           # Reset database
./scripts/development.sh loaddata        # Load sample data

# Via main script
./manage.sh dev                          # Same as development.sh start
./manage.sh test                         # Same as development.sh test
```

### Setup Script (`scripts/setup.sh`)
Project setup and installation:

```bash
./scripts/setup.sh full-setup           # Complete setup
./scripts/setup.sh install              # Dependencies only
./scripts/setup.sh venv                 # Setup virtual environment
./scripts/setup.sh database             # Setup database
./scripts/setup.sh reset                # Reset and setup again
```

### Backup Script (`scripts/backup.sh`)
Comprehensive backup and restore operations:

```bash
./scripts/backup.sh backup              # Full project backup
./scripts/backup.sh backup --no-media   # Exclude media files
./scripts/backup.sh db-backup           # Database only
./scripts/backup.sh list                # List available backups
./scripts/backup.sh restore <file>      # Restore from backup
./scripts/backup.sh clean 30            # Remove backups older than 30 days
```

### Cleanup Script (`scripts/cleanup.sh`)
Enhanced cleanup operations:

```bash
./scripts/cleanup.sh clean              # Standard cleanup
./scripts/cleanup.sh deep               # Deep cleanup with optimization
./scripts/cleanup.sh security           # Security-focused cleanup
./scripts/cleanup.sh dev                # Development cleanup
./scripts/cleanup.sh production         # Production-safe cleanup
./scripts/cleanup.sh analyze            # Analyze disk usage
./scripts/cleanup.sh interactive        # Interactive cleanup menu
```

### Health Script (`scripts/health.sh`)
System health monitoring:

```bash
./scripts/health.sh check               # Full health check
./scripts/health.sh status              # Quick status
./scripts/health.sh stats               # Project statistics
./scripts/health.sh system              # System dependencies
./scripts/health.sh database            # Database connectivity
./scripts/health.sh security            # Security checks
```

### Monitoring Script (`scripts/monitoring.sh`)
Real-time monitoring and log viewing:

```bash
./scripts/monitoring.sh logs django     # Show Django logs
./scripts/monitoring.sh logs error      # Show error logs
./scripts/monitoring.sh dashboard       # Live monitoring dashboard
./scripts/monitoring.sh processes       # Show running processes
./scripts/monitoring.sh performance     # Performance metrics
./scripts/monitoring.sh errors 6        # Errors from last 6 hours
```

### Gunicorn Diagnostics Script (`scripts/diagnose-gunicorn.sh`)
Comprehensive diagnostic tool for troubleshooting Gunicorn service issues:

```bash
# Must run with sudo
sudo ./scripts/diagnose-gunicorn.sh                  # Full diagnostics
sudo ./scripts/diagnose-gunicorn.sh --manual-test   # Include manual service test

# Via main script
./manage.sh diagnose-gunicorn                       # If integrated
```

Features:
- System resource analysis (memory, disk, CPU, file limits)
- Port conflict detection
- Service status and process information
- Application file and permission checks
- Python environment testing
- Log file analysis
- Manual Gunicorn testing
- Automated recommendations

### Log Diagnostics Script (`scripts/check-logs.sh`)
Diagnose logging configuration and troubleshoot issues:

```bash
./scripts/check-logs.sh                 # Check log configuration and files
```

### Deployment Script (`scripts/deployment.sh`)
Production deployment operations:

```bash
./scripts/deployment.sh deploy          # Create deployment package
./scripts/deployment.sh deploy-to user@server   # Deploy to server
./scripts/deployment.sh status user@server      # Check deployment status
./scripts/deployment.sh rollback user@server    # Rollback deployment
./scripts/deployment.sh setup-env user@server   # Setup server environment
```

### Nginx Configuration Script (`scripts/nginx-config.sh`)
Nginx setup and management:

```bash
# Must run with sudo
sudo ./scripts/nginx-config.sh configure example.com --ssl
sudo ./scripts/nginx-config.sh status
sudo ./scripts/nginx-config.sh logs access 100
sudo ./scripts/nginx-config.sh remove
```

### Wipeout Script (`scripts/wipeout.sh`) ⚠️
Destructive operations with safety confirmations:

```bash
./scripts/wipeout.sh wipeout            # Remove project data
./scripts/wipeout.sh nuke               # COMPLETE removal
./scripts/wipeout.sh server             # Remove server configs
./scripts/wipeout.sh database           # Remove all databases
```

## 🔧 Global Options

All scripts support these global options:

```bash
--verbose      # Enable verbose output
--dry-run      # Show what would be done without executing
--force        # Skip confirmation prompts
--help         # Show help information
```

Examples:
```bash
./manage.sh backup --verbose            # Verbose backup
./manage.sh clean --dry-run             # See what would be cleaned
./manage.sh wipeout --force             # Force wipeout without prompts
```

## 📝 Configuration

### Environment Variables
Scripts respect these environment variables:

- `VERBOSE`: Enable verbose output
- `DRY_RUN`: Show operations without executing
- `FORCE`: Skip confirmations
- `DJANGO_SETTINGS_MODULE`: Django settings module

### Customization
You can customize script behavior by:

1. Setting environment variables
2. Modifying script configuration sections
3. Creating local override files

## 🔍 Examples

### Complete New Project Setup
```bash
# Initial setup
./manage.sh setup --with-superuser

# Start development
./manage.sh dev

# In another terminal, monitor logs
./manage.sh logs django
```

### Daily Development Workflow
```bash
# Morning routine
./manage.sh status                      # Check project status
./manage.sh migrate                     # Apply any new migrations
./manage.sh dev                         # Start development server

# Before committing
./manage.sh test                        # Run tests
./manage.sh clean                       # Clean up files

# End of day
./manage.sh backup                      # Create backup
```

### Production Deployment
```bash
# Prepare deployment
./manage.sh check                       # Health check
./manage.sh test                        # Run tests
./manage.sh deploy                      # Create deployment package

# Deploy to server
./manage.sh deploy-to user@server       # Direct deployment

# Check deployment
./manage.sh status user@server          # Verify deployment
```

### Maintenance Operations
```bash
# Weekly cleanup
./manage.sh clean deep                  # Deep cleanup

# Monthly backup cleanup
./manage.sh backup clean 30             # Remove old backups

# Health monitoring
./manage.sh monitor                     # Live monitoring dashboard
```

### Emergency Operations
```bash
# Quick diagnostics
./manage.sh status                      # Quick status
./manage.sh logs error                  # Check for errors

# Restore from backup
./manage.sh backup list                 # List available backups
./manage.sh restore backup_file.tar.gz  # Restore specific backup

# Complete reset (development only)
./manage.sh wipeout                     # Remove all data
./manage.sh setup                       # Fresh setup
```

## 🚨 Safety Features

### Confirmation Prompts
Destructive operations require explicit confirmation:
- Wipeout operations require typing "YES I UNDERSTAND"
- Nuclear operations require typing "DELETE"
- Use `--force` to skip prompts (use carefully)

### Backup Integration
- Automatic backups before destructive operations
- Backup verification and integrity checks
- Easy restore functionality

### Dry Run Mode
Test operations safely:
```bash
./manage.sh wipeout --dry-run           # See what would be deleted
./manage.sh clean --dry-run             # See what would be cleaned
```

## 📊 Monitoring & Logging

### Real-time Monitoring
```bash
./manage.sh monitor                     # Live dashboard
./manage.sh logs django                 # Follow Django logs
./manage.sh logs error                  # Monitor errors
```

### Health Checks
```bash
./manage.sh check                       # Comprehensive health check
./manage.sh status                      # Quick status
./manage.sh stats                       # Project statistics
```

### Performance Monitoring
```bash
./manage.sh performance                 # Performance metrics
./manage.sh analyze                     # Disk usage analysis
```

## 🔐 Security

### Security Checks
The system includes automated security checks:
- Environment file validation
- Hardcoded secret detection
- File permission verification
- SSL/TLS configuration validation

### Sensitive Data Protection
- Automatic redaction of secrets in backups
- Secure file permission enforcement
- Environment file sanitization

## 🎯 Best Practices

### Development
1. Always run `./manage.sh check` before starting development
2. Use `./manage.sh test` before committing code
3. Regular backups with `./manage.sh backup`
4. Monitor logs with `./manage.sh logs django`

### Production
1. Use `./manage.sh deploy` for consistent deployments
2. Monitor with `./manage.sh monitor` or `./manage.sh status`
3. Regular security checks with `./manage.sh security`
4. Automated backup scheduling

### Maintenance
1. Weekly `./manage.sh clean deep` for optimization
2. Monthly backup cleanup
3. Regular health checks
4. Performance monitoring

## 🆘 Troubleshooting

### Common Issues

**Virtual Environment Issues:**
```bash
./manage.sh setup venv                  # Recreate virtual environment
```

**Database Issues:**
```bash
./manage.sh check database              # Check database connectivity
./manage.sh reset                       # Reset database (development)
```

**Permission Issues:**
```bash
./manage.sh check permissions           # Check file permissions
chmod +x manage.sh scripts/*.sh         # Fix script permissions
```

**Log File Issues:**
```bash
./manage.sh logs                        # Check all logs
./manage.sh clean logs                  # Clean log files
```

### Getting Help
```bash
./manage.sh help                        # Main help
./scripts/[script-name].sh help         # Script-specific help
```

## 📈 Advanced Usage

### Scripting and Automation
```bash
# Automated deployment script
#!/bin/bash
./manage.sh check || exit 1
./manage.sh test || exit 1
./manage.sh backup
./manage.sh deploy
```

### Custom Scripts
You can add custom scripts to the `scripts/` directory following the same pattern:
```bash
#!/bin/bash
# Custom script template
# Add to scripts/ directory and make executable
```

### Integration with CI/CD
The management system integrates well with CI/CD pipelines:
```yaml
# Example GitHub Actions integration
- name: Setup and Test
  run: |
    ./manage.sh setup --force
    ./manage.sh test
    ./manage.sh check
```

---

**Last Updated:** August 11, 2025  
**Version:** 2.0  
**Compatibility:** Ubuntu 24.04.2 LTS, Python 3.8+, Django 4.2+

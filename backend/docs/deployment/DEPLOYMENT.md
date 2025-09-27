# Watch Party Backend - Deployment Guide

This repository contains a comprehensive deployment setup for the Watch Party Backend Django application with automatic CI/CD via GitHub Actions.

## 🚀 Quick Start

### Prerequisites

- Ubuntu 20.04+ or Debian 11+ server
- Domain name pointing to your server
- GitHub repository with the code
- SSH access to your server

### 1. Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Clone the repository
git clone https://github.com/your-username/watch-party-backend.git
cd watch-party-backend

# Make deploy script executable
chmod +x deploy.sh

# Run deployment (replace with your domain)
sudo DOMAIN=your-domain.com ./deploy.sh
```

### 2. GitHub Actions Setup

1. **Repository Secrets**: Go to your GitHub repository → Settings → Secrets and Variables → Actions

2. **Add the following secrets**:
   ```
   SSH_PRIVATE_KEY     # Your server SSH private key
   SERVER_HOST         # Your server IP address or hostname
   SERVER_USER         # SSH user (usually 'root' or 'ubuntu')
   DOMAIN              # Your domain name (e.g., api.yoursite.com)
   PROJECT_DIR         # Optional: /var/www/watch-party-backend (default)
   PROJECT_USER        # Optional: watchparty (default)
   ```

3. **Generate SSH Key Pair** (if you don't have one):
   ```bash
   # On your local machine
   ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions
   
   # Copy public key to server
   ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server
   
   # Copy private key content to GitHub secret SSH_PRIVATE_KEY
   cat ~/.ssh/github_actions
   ```

## 📁 Project Structure

```
watch-party-backend/
├── deploy.sh                 # Main deployment script
├── nginx.conf                # Nginx configuration template
├── .github/
│   └── workflows/
│       └── deploy.yml        # GitHub Actions workflow
├── requirements.txt          # Python dependencies
├── manage.py                # Django management script
└── ...                      # Your Django application code
```

## 🔧 Deployment Features

### Deployment Script (`deploy.sh`)

The deployment script automatically:

- ✅ Installs and configures system dependencies
- ✅ Sets up PostgreSQL database with secure configuration
- ✅ Configures Redis for caching and Celery
- ✅ Creates isolated project user and virtual environment
- ✅ Installs Python dependencies
- ✅ Configures Nginx with SSL/TLS and security headers
- ✅ Sets up Supervisor for process management
- ✅ Configures SSL certificates with Let's Encrypt
- ✅ Creates automated backup system
- ✅ Implements security best practices

### GitHub Actions Workflow

The CI/CD pipeline includes:

- **Testing Phase**:
  - Runs unit tests with PostgreSQL and Redis
  - Generates coverage reports
  - Performs security checks with Bandit and Safety
  - Uploads test artifacts

- **Build Phase**:
  - Creates clean deployment package
  - Excludes development files
  - Generates deployment metadata

- **Deploy Phase**:
  - Handles both first-time and update deployments
  - Creates automatic backups before updates
  - Performs zero-downtime deployments
  - Includes rollback capability on failure
  - Runs post-deployment health checks

## 🛠️ Manual Deployment Options

### Option 1: Full Automated Deployment

```bash
# With custom domain
sudo DOMAIN=api.yoursite.com ./deploy.sh

# With custom passwords
sudo DOMAIN=api.yoursite.com \
     DB_PASSWORD=your_secure_db_password \
     REDIS_PASSWORD=your_secure_redis_password \
     ./deploy.sh
```

### Option 2: Nginx Configuration Only

If you want to manually copy the Nginx configuration:

```bash
# Copy the nginx.conf file to your server
sudo cp nginx.conf /etc/nginx/sites-available/watch-party-backend

# Edit the configuration file
sudo nano /etc/nginx/sites-available/watch-party-backend

# Update the following in the file:
# - Replace 'your-domain.com' with your actual domain
# - Replace 'your-frontend-domain.com' with your frontend domain
# - Update file paths if different

# Enable the site
sudo ln -s /etc/nginx/sites-available/watch-party-backend /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 🔐 Security Features

### SSL/TLS Configuration
- Automatic Let's Encrypt SSL certificate setup
- Strong SSL cipher configuration
- HSTS headers for enhanced security
- SSL stapling enabled

### Security Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: enabled
- Content-Security-Policy: configured
- Referrer-Policy: strict-origin-when-cross-origin

### Rate Limiting
- API endpoints: 10 requests/second
- Authentication endpoints: 5 requests/minute
- WebSocket connections: 20 requests/second

### Database Security
- Isolated database user with minimal privileges
- Strong password generation
- SSL connections enforced

## 📊 Monitoring & Maintenance

### Service Management

```bash
# Check service status
sudo supervisorctl status

# Restart all services
sudo supervisorctl restart all

# View logs
sudo tail -f /var/www/watch-party-backend/logs/gunicorn.log
sudo tail -f /var/www/watch-party-backend/logs/celery.log
sudo tail -f /var/log/nginx/watchparty_error.log
```

### Backup System

Automated daily backups at 2 AM include:
- Database dumps
- Media files
- Environment configuration

```bash
# Manual backup
sudo /usr/local/bin/backup-watchparty.sh

# View backups
sudo ls -la /var/backups/watchparty/
```

### Database Management

```bash
# Access Django shell
cd /var/www/watch-party-backend
sudo -u watchparty ./venv/bin/python manage.py shell --settings=watchparty.settings.production

# Run migrations
sudo -u watchparty ./venv/bin/python manage.py migrate --settings=watchparty.settings.production

# Create superuser
sudo -u watchparty ./venv/bin/python manage.py createsuperuser --settings=watchparty.settings.production
```

## 🔄 Update Deployment

### Via GitHub Actions (Recommended)
1. Push changes to `main` or `master` branch
2. GitHub Actions automatically tests and deploys
3. Monitor deployment in Actions tab

### Manual Update
```bash
# Pull latest changes
cd /var/www/watch-party-backend
sudo -u watchparty git pull origin main

# Update dependencies
sudo -u watchparty ./venv/bin/pip install -r requirements.txt

# Run migrations
sudo -u watchparty ./venv/bin/python manage.py migrate --settings=watchparty.settings.production

# Collect static files
sudo -u watchparty ./venv/bin/python manage.py collectstatic --noinput --settings=watchparty.settings.production

# Restart services
sudo supervisorctl restart all
```

## 🐛 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**:
   ```bash
   # Renew certificates manually
   sudo certbot renew --force-renewal
   sudo systemctl reload nginx
   ```

2. **Database Connection Issues**:
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Test database connection
   sudo -u postgres psql -d watchparty_db -c "SELECT 1;"
   ```

3. **Redis Connection Issues**:
   ```bash
   # Check Redis status
   sudo systemctl status redis-server
   
   # Test Redis connection
   redis-cli -a your_redis_password ping
   ```

4. **Permission Issues**:
   ```bash
   # Fix file permissions
   sudo chown -R watchparty:watchparty /var/www/watch-party-backend
   sudo chmod -R 755 /var/www/watch-party-backend
   ```

### Log Locations

- **Application Logs**: `/var/www/watch-party-backend/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **PostgreSQL Logs**: `/var/log/postgresql/`
- **System Logs**: `/var/log/syslog`

## 🔧 Environment Configuration

The deployment creates a `.env` file with all necessary configurations. Key settings include:

```env
DJANGO_SETTINGS_MODULE=watchparty.settings.production
SECRET_KEY=auto-generated-secure-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
REDIS_URL=redis://:password@127.0.0.1:6379/0
```

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review application and system logs
3. Ensure all GitHub secrets are properly configured
4. Verify DNS settings point to your server
5. Check firewall settings (ports 80, 443, 22 should be open)

## 🚀 Production Checklist

Before going live:

- [ ] Update default admin password
- [ ] Configure proper email settings
- [ ] Set up monitoring and alerting
- [ ] Configure backup retention policies
- [ ] Review and update CORS settings
- [ ] Set up CDN for static files (optional)
- [ ] Configure proper logging levels
- [ ] Set up health monitoring
- [ ] Review security headers
- [ ] Test disaster recovery procedures

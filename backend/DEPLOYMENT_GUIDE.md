# Watch Party Backend - EC2 Deployment Guide

## Infrastructure Overview

Your Watch Party backend is configured for deployment on AWS infrastructure:

- **EC2 Instance**: `35.181.208.71` (ubuntu user)
- **RDS PostgreSQL**: `all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com:5432`
- **Redis (Valkey)**: 
  - Primary: `master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com:6379`
  - Replica: `replica.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com:6379`
- **Availability Zone**: `eu-west-3b`

## Quick Deployment

### Option 1: Automated Deployment Script

Use the dedicated deployment script for the easiest deployment:

```bash
# Make script executable (if not already)
chmod +x ./deploy_to_ec2.sh

# Deploy with default settings (uses ~/.ssh/id_rsa)
./deploy_to_ec2.sh

# Deploy with custom SSH key
./deploy_to_ec2.sh --key-path /path/to/your-key.pem

# Quick restart (no file copy)
./deploy_to_ec2.sh --restart-only

# Skip dependency installation
./deploy_to_ec2.sh --skip-deps
```

### Option 2: Using the Main Deploy Script

```bash
# Run the deployment script as root
sudo ./deploy.sh

# Or use non-interactive mode
sudo RUN_ACTION=7 ./deploy.sh  # Deploy to production
sudo RUN_ACTION=8 ./deploy.sh  # Test connections
```

## Pre-Deployment Checklist

### 1. Environment Configuration

Ensure your `.env.production` file contains the correct values:

```bash
# Database - Update with your actual credentials
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com:5432/watchparty_prod?sslmode=require

# Redis - No authentication needed for current setup
REDIS_URL=redis://master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com:6379/0

# Security - Update these values
SECRET_KEY=your-super-secret-production-key
JWT_SECRET_KEY=your-jwt-secret-key

# Domains
ALLOWED_HOSTS=35.181.208.71,be-watch-party.brahim-elhouss.me,watch-party.brahim-elhouss.me
```

### 2. SSH Key Configuration

Ensure you have SSH access to your EC2 instance:

```bash
# Test SSH connection
ssh -i ~/.ssh/your-key.pem ubuntu@35.181.208.71

# If using different key path, update the script or use --key-path
```

### 3. DNS Configuration

Update your DNS records to point to your EC2 instance:

```
A    be-watch-party.brahim-elhouss.me    35.181.208.71
A    watch-party.brahim-elhouss.me       35.181.208.71
```

## Manual Deployment Steps

If you prefer manual deployment:

### 1. Connect to EC2

```bash
ssh -i ~/.ssh/your-key.pem ubuntu@35.181.208.71
```

### 2. Prepare the Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3 python3-pip python3-venv nodejs npm nginx
sudo npm install -g pm2

# Create application directory
sudo mkdir -p /opt/watch-party-backend
sudo chown ubuntu:ubuntu /opt/watch-party-backend
```

### 3. Deploy Application Files

From your local machine:

```bash
# Copy files to server
rsync -avz --exclude '.git' --exclude '__pycache__' --exclude 'venv' \
    -e "ssh -i ~/.ssh/your-key.pem" \
    ./ ubuntu@35.181.208.71:/opt/watch-party-backend/

# Copy environment file
scp -i ~/.ssh/your-key.pem .env.production ubuntu@35.181.208.71:/opt/watch-party-backend/.env
```

### 4. Setup Python Environment

On the server:

```bash
cd /opt/watch-party-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements/production.txt

# Run Django setup
python manage.py migrate
python manage.py collectstatic --noinput
```

### 5. Start Services

```bash
# Create log directory
sudo mkdir -p /var/log/watchparty
sudo chown ubuntu:ubuntu /var/log/watchparty

# Start PM2 services
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Service Management

### PM2 Commands

```bash
# Check service status
pm2 status

# View logs
pm2 logs

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Restart specific service
pm2 restart watchparty-django
```

### Service Endpoints

- **Django API**: `http://35.181.208.71:8000`
- **WebSocket**: `ws://35.181.208.71:8002`
- **Health Check**: `http://35.181.208.71:8000/health/`

## Database Setup

### 1. Connect to PostgreSQL

```bash
# From your local machine or EC2
psql -h all-in-one.cj6w0queklir.eu-west-3.rds.amazonaws.com -U postgres -d watchparty_prod
```

### 2. Create Database Schema

The Django migrations will handle schema creation, but you can also:

```sql
-- Create database if it doesn't exist
CREATE DATABASE watchparty_prod;

-- Create user with permissions
GRANT ALL PRIVILEGES ON DATABASE watchparty_prod TO postgres;
```

## SSL Configuration

### 1. Install Certbot

```bash
sudo apt install certbot python3-certbot-nginx
```

### 2. Obtain SSL Certificate

```bash
# For both domains
sudo certbot --nginx -d be-watch-party.brahim-elhouss.me -d watch-party.brahim-elhouss.me
```

### 3. Update Nginx Configuration

The `nginx.conf` file in your project root contains the production configuration.

```bash
# Copy nginx configuration
sudo cp /opt/watch-party-backend/nginx.conf /etc/nginx/sites-available/watchparty
sudo ln -sf /etc/nginx/sites-available/watchparty /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and restart nginx
sudo nginx -t
sudo systemctl restart nginx
```

## Monitoring and Maintenance

### 1. Log Files

- **Django**: `/var/log/watchparty/django.log`
- **Gunicorn**: `/var/log/watchparty/gunicorn_*.log`
- **Celery**: `/var/log/watchparty/pm2_celery_*.log`
- **Nginx**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`

### 2. Health Checks

```bash
# Check application health
curl http://35.181.208.71:8000/health/

# Check database connection
python manage.py dbshell

# Check Redis connection
redis-cli -h master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com ping
```

### 3. Backup Strategy

Set up regular backups for:

- **Database**: Use RDS automated backups
- **Media files**: Sync to S3
- **Application logs**: Rotate and archive

## Troubleshooting

### Common Issues

1. **Permission Errors**
   ```bash
   sudo chown -R ubuntu:ubuntu /opt/watch-party-backend
   sudo chmod +x /opt/watch-party-backend/manage.py
   ```

2. **Database Connection Issues**
   ```bash
   # Check security group settings
   # Verify database credentials in .env
   # Test connection manually
   ```

3. **Redis Connection Issues**
   ```bash
   # Check ElastiCache security group
   # Verify Redis endpoints
   redis-cli -h master.watch-party-valkey.2muo9f.euw3.cache.amazonaws.com ping
   ```

4. **Service Won't Start**
   ```bash
   pm2 logs  # Check for errors
   source venv/bin/activate  # Ensure virtual environment
   python manage.py check  # Check Django configuration
   ```

### Performance Optimization

1. **Gunicorn Workers**: Adjust based on CPU cores
2. **Database Connections**: Monitor and tune connection pool
3. **Redis Memory**: Monitor memory usage
4. **Static Files**: Use CDN for better performance

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **SSH Keys**: Use proper key management
3. **Database**: Use strong passwords and SSL
4. **Nginx**: Configure rate limiting and security headers
5. **Updates**: Keep system packages updated

## Next Steps

After deployment:

1. Test all API endpoints
2. Verify WebSocket connections
3. Set up monitoring (Grafana, Prometheus)
4. Configure automated backups
5. Set up CI/CD pipeline
6. Performance testing and optimization

## Support

For issues or questions:

1. Check the logs first: `pm2 logs`
2. Verify configuration: `python manage.py check`
3. Test connections: `./deploy.sh` option 8
4. Review Django settings for production

---

**Last Updated**: September 26, 2025
**Infrastructure**: AWS EU-West-3 (Paris)
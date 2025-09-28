# Watch Party - Docker Deployment Guide

## Infrastructure Overview

Your Watch Party application is deployed using Docker Compose on AWS Lightsail:

- **Lightsail Server**: `35.181.116.57` (Ubuntu 22.04)
- **Domains**: 
  - Main Frontend: `watch-party.brahim-elhouss.me`
  - Backend API: `be-watch-party.brahim-elhouss.me`
- **CDN/Security**: Cloudflare
- **Architecture**: Docker containers with Nginx reverse proxy
- **AWS Integration**: Uses IAM role (MyAppRole) for credentials

## Quick Deployment

### Option 1: Automated GitHub Actions

Push to master branch to trigger automatic deployment:

```bash
git push origin master
```

GitHub Actions will:
1. SSH to the server
2. Pull latest code
3. Build Docker images
4. Deploy with zero downtime

### Option 2: Manual Server Deployment

SSH to the server and use the deployment script:

```bash
ssh deploy@35.181.116.57
cd /srv/watch-party
./deploy-docker.sh
```

## Initial Server Setup

### 1. Bootstrap Fresh Server

Run the bootstrap script on a fresh Ubuntu Lightsail instance:

```bash
# SSH as root or ubuntu user
curl -sSL https://raw.githubusercontent.com/EL-HOUSS-BRAHIM/watch-party/master/bootstrap.sh | sudo bash
```

This will:
- Install Docker, Nginx, and dependencies
- Create `deploy` user with proper permissions
- Configure firewall and security
- Set up base Nginx configuration

### 2. Configure SSH Access

Add your SSH public key to the deploy user:

```bash
echo "your-ssh-public-key" >> /home/deploy/.ssh/authorized_keys
```

### 3. Configure GitHub Secrets

In your GitHub repository settings, add these secrets:

- `LIGHTSAIL_HOST`: `35.181.116.57`
- `LIGHTSAIL_SSH_KEY`: Your private SSH key content

## Configuration

### Environment Variables

Copy and edit the environment file:

```bash
cp .env.example .env
```

Key variables to configure:

```bash
# Database (using internal PostgreSQL container)
DB_NAME=watchparty
DB_USER=watchparty
DB_PASSWORD=secure-password-here

# Django
SECRET_KEY=your-super-secret-key-here
ALLOWED_HOSTS=35.181.116.57,be-watch-party.brahim-elhouss.me,watch-party.brahim-elhouss.me

# CORS and CSRF (note: watch-party.brahim-elhouss.me is the main frontend domain)
CORS_ALLOWED_ORIGINS=https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me
CSRF_TRUSTED_ORIGINS=https://watch-party.brahim-elhouss.me,https://be-watch-party.brahim-elhouss.me

# External services (AWS - uses IAM role MyAppRole, no keys needed)
USE_S3=true
# AWS credentials automatically provided by IAM role
# AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY not needed
AWS_STORAGE_BUCKET_NAME=your-bucket

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Note: Database and Redis credentials managed via AWS Secrets Manager
# when using external AWS services
```

### Docker Architecture

The application runs in multiple containers:

- **nginx**: Reverse proxy and static file server (port 80/443)
- **frontend**: Next.js application (internal port 3000)
- **backend**: Django API (internal port 8000)
- **celery-worker**: Background task processor
- **celery-beat**: Task scheduler
- **db**: PostgreSQL database
- **redis**: Cache and message broker

## Service Management

### Using the Deployment Script

```bash
cd /srv/watch-party
./deploy-docker.sh
```

Options:
1. **Full Deploy**: Complete setup and deployment
2. **Update and Redeploy**: Pull latest code and restart
3. **Restart Services**: Restart all containers
4. **Check Health**: Verify all services are running
5. **Show Logs**: View recent container logs
6. **Stop Services**: Stop all containers
7. **Cleanup Docker**: Remove unused resources
8. **Show Resource Usage**: System and Docker resource usage
9. **Create Backup**: Backup database and media files

### Docker Compose Commands

Direct Docker management:

```bash
cd /srv/watch-party

# Start all services
docker compose up -d

# View status
docker compose ps

# View logs
docker compose logs -f

# Restart specific service
docker compose restart backend

# Stop all services
docker compose down

# Build and restart
docker compose build --no-cache
docker compose up -d --force-recreate
```

## Monitoring and Health Checks

### Health Endpoints

- **Overall Health**: `http://35.181.116.57/health`
- **Backend API**: `http://35.181.116.57/api/health/`
- **Frontend**: `http://35.181.116.57/`

### Log Monitoring

```bash
# All logs
docker compose logs -f

# Specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# With timestamps
docker compose logs -f -t
```

### Resource Monitoring

```bash
# Container resource usage
docker stats

# System resources
htop

# Disk usage
df -h
docker system df
```

## Database Management

### Backup Database

```bash
# Using deployment script
./deploy-docker.sh  # Option 9 - Create Backup

# Manual backup
docker compose exec db pg_dump -U watchparty watchparty > backup.sql
```

### Restore Database

```bash
# Stop backend services
docker compose stop backend celery-worker celery-beat

# Restore from backup
docker compose exec -T db psql -U watchparty watchparty < backup.sql

# Restart services
docker compose start backend celery-worker celery-beat
```

### Database Migrations

```bash
# Run migrations
docker compose exec backend python manage.py migrate

# Create superuser
docker compose exec backend python manage.py createsuperuser

# Collect static files
docker compose exec backend python manage.py collectstatic --noinput
```

## SSL/HTTPS Configuration

### Cloudflare Setup

1. **DNS Configuration**:
   - Point A record to `35.181.116.57`
   - Enable Cloudflare proxy (orange cloud)

2. **SSL Mode**: Set to "Flexible" or "Full" in Cloudflare dashboard

3. **Security Settings**:
   - Enable "Always Use HTTPS"
   - Set minimum TLS version to 1.2
   - Enable HSTS

### Local SSL (Optional)

For end-to-end encryption, you can also set up local SSL:

```bash
# Install certbot
sudo apt install certbot

# Get certificate
sudo certbot certonly --standalone -d be-watch-party.brahim-elhouss.me -d watch-party.brahim-elhouss.me

# Update nginx configuration to use certificates
```

## Troubleshooting

### Common Issues

1. **Containers Won't Start**
   ```bash
   docker compose logs <service-name>
   docker compose ps  # Check status
   ```

2. **Database Connection Issues**
   ```bash
   # Check database container
   docker compose exec db psql -U watchparty -l
   
   # Check backend environment
   docker compose exec backend env | grep DB
   ```

3. **Permission Issues**
   ```bash
   # Fix ownership
   sudo chown -R deploy:deploy /srv/watch-party
   
   # Check Docker permissions
   sudo usermod -aG docker deploy
   ```

4. **Out of Disk Space**
   ```bash
   # Clean Docker resources
   docker system prune -f
   docker volume prune -f
   docker image prune -a
   ```

5. **Memory Issues**
   ```bash
   # Check resource usage
   docker stats
   free -h
   
   # Restart resource-heavy services
   docker compose restart backend celery-worker
   ```

### Log Analysis

```bash
# Check for errors in logs
docker compose logs backend | grep -i error
docker compose logs frontend | grep -i error
docker compose logs nginx | grep " 5"

# Follow logs in real-time
docker compose logs -f --tail=100 backend
```

## Performance Optimization

### Resource Limits

Edit `docker-compose.yml` to add resource limits:

```yaml
backend:
  deploy:
    resources:
      limits:
        memory: 512M
        cpus: '0.5'
```

### Database Optimization

```bash
# Connect to database
docker compose exec db psql -U watchparty watchparty

# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM your_table;

# Check database size
SELECT pg_size_pretty(pg_database_size('watchparty'));
```

### Caching

Redis is already configured for:
- Django cache backend
- Session storage
- Celery message broker
- Channels layer (WebSocket)

## Security Considerations

1. **Environment Variables**: Never commit `.env` to version control
2. **SSH Keys**: Use strong SSH keys and disable password authentication
3. **Firewall**: Only ports 22, 80, 443 are open
4. **Docker**: Containers run as non-root users
5. **Database**: Internal network, not exposed to internet
6. **Updates**: Regular system and container updates

## Maintenance

### Regular Tasks

1. **System Updates**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Docker Cleanup**:
   ```bash
   docker system prune -f
   ```

3. **Log Rotation**: Configured automatically for Docker logs

4. **Backup**: Schedule regular database backups

5. **Monitoring**: Check service health and resource usage

### Scaling

For high traffic, consider:

1. **Horizontal Scaling**: Multiple Lightsail instances with load balancer
2. **Database**: Move to managed PostgreSQL (RDS)
3. **Cache**: Use managed Redis (ElastiCache)
4. **CDN**: Leverage Cloudflare for static assets
5. **Monitoring**: Add application performance monitoring

## Support

For issues:

1. Check container logs: `docker compose logs <service>`
2. Verify configuration: `cat .env`
3. Test connectivity: Health check endpoints
4. Monitor resources: `docker stats` and `htop`

---

**Last Updated**: September 28, 2025  
**Server**: AWS Lightsail + Docker Compose  
**Domains**: Cloudflare managed
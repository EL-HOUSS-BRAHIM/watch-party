# Deployment Scripts

This directory contains modular deployment scripts for the Watch Party application. These scripts work together to handle deployment to AWS Lightsail while staying within SSH connection timeout limits.

## Architecture

The deployment is split into focused, modular scripts that each handle a specific aspect of the deployment process:

```
deploy-main.sh              # Main orchestrator
├── common-functions.sh     # Shared utilities
├── setup-repository.sh     # Git operations
├── setup-aws-environment.sh # AWS & environment config
├── setup-ssl-certificates.sh # SSL setup
├── build-docker-images.sh  # Docker image building
├── deploy-services.sh      # Service deployment
└── health-checks.sh        # Health verification
```

## Scripts Overview

### 1. `deploy-main.sh`
**Purpose**: Main entry point that orchestrates the deployment

**What it does**:
- Calls each deployment module in the correct order
- Handles overall error conditions
- Reports final deployment status

**Usage**:
```bash
bash scripts/deployment/deploy-main.sh
```

### 2. `common-functions.sh`
**Purpose**: Shared utility functions

**What it provides**:
- Logging functions (`log_info`, `log_success`, `log_error`, `log_warning`)
- Wait helpers (`wait_for_service`)
- Command existence checks
- Consistent error handling

**Usage**:
```bash
source scripts/deployment/common-functions.sh
log_info "Starting deployment..."
```

### 3. `setup-repository.sh`
**Purpose**: Handle git repository cloning/updating and directory permissions

**What it does**:
- Clones or updates the repository
- Checks and fixes directory ownership
- Falls back to home directory if permissions fail
- Exports APP_DIR for other scripts

**Dependencies**: None (can run standalone)

### 4. `setup-aws-environment.sh`
**Purpose**: Configure AWS CLI and create environment files

**What it does**:
- Installs AWS CLI if needed
- Configures AWS credentials
- Tests AWS connectivity and Secrets Manager access
- Generates production `.env` files for backend and frontend
- Verifies Django settings configuration

**Dependencies**: Requires `setup-repository.sh` to have run first

**Environment Variables**:
- `AWS_ACCESS_KEY_ID` (optional, can use IAM role)
- `AWS_SECRET_ACCESS_KEY` (optional, can use IAM role)

### 5. `setup-ssl-certificates.sh`
**Purpose**: Configure SSL certificates for HTTPS

**What it does**:
- Creates SSL directory structure
- Checks write permissions
- Creates certificates from GitHub secrets
- Verifies certificate validity

**Dependencies**: Requires `APP_DIR` to be set

**Environment Variables**:
- `SSL_ORIGIN` - SSL origin certificate
- `SSL_PRIVATE` - SSL private key

### 6. `build-docker-images.sh`
**Purpose**: Build Docker images with optimization

**What it does**:
- Enables Docker BuildKit for faster builds
- Attempts parallel build first
- Falls back to sequential build if parallel fails
- Uses build caching to speed up repeated builds
- Handles build timeouts gracefully

**Dependencies**: Requires Docker and docker-compose

**Build Optimizations**:
- Parallel builds when possible
- Build argument caching
- Memory optimization for Node.js frontend
- Skip AWS calls during build phase

### 7. `deploy-services.sh`
**Purpose**: Start and configure Docker services

**What it does**:
- Configures firewall rules
- Starts services in correct order (backend → workers → frontend → nginx)
- Waits for each service to be ready before starting the next
- Runs database migrations if needed
- Collects static files

**Dependencies**: Requires built Docker images

**Service Startup Order**:
1. Backend (Django/Gunicorn)
2. Celery workers and beat
3. Frontend (Next.js)
4. Nginx reverse proxy

### 8. `health-checks.sh`
**Purpose**: Perform comprehensive health checks

**What it does**:
- Tests backend health endpoints
- Tests frontend availability
- Checks nginx HTTP/HTTPS
- Verifies all containers are running
- Tests external accessibility
- Reports public IP and URLs

**Dependencies**: Requires deployed services

**Health Check Sequence**:
1. Backend health endpoint (10 attempts)
2. Frontend health check (6 attempts)
3. Nginx HTTP and HTTPS
4. Container status
5. Port availability
6. External access tests

## Usage in GitHub Actions

The GitHub Actions workflow (`.github/workflows/deploy.yml`) calls `deploy-main.sh`:

```yaml
- name: Deploy over SSH
  uses: appleboy/ssh-action@v1.0.3
  script: |
    # Quick setup
    cd /srv/watch-party || cd $HOME/watch-party
    
    # Export environment variables
    export APP_DIR
    export AWS_ACCESS_KEY_ID
    export AWS_SECRET_ACCESS_KEY
    export SSL_ORIGIN
    export SSL_PRIVATE
    
    # Run modular deployment
    bash scripts/deployment/deploy-main.sh
```

## Manual Deployment

You can also run the deployment manually on the server:

```bash
# SSH to the server
ssh deploy@your-server

# Navigate to app directory
cd /srv/watch-party  # or ~/watch-party

# Export required environment variables
export AWS_ACCESS_KEY_ID="your-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export SSL_ORIGIN="$(cat /path/to/origin.pem)"
export SSL_PRIVATE="$(cat /path/to/private.key)"

# Run deployment
bash scripts/deployment/deploy-main.sh
```

## Running Individual Scripts

You can run individual scripts for testing or debugging:

```bash
# Test repository setup
bash scripts/deployment/setup-repository.sh

# Test AWS configuration
bash scripts/deployment/setup-aws-environment.sh

# Rebuild Docker images only
bash scripts/deployment/build-docker-images.sh

# Run health checks only
bash scripts/deployment/health-checks.sh
```

## Troubleshooting

### Deployment fails at repository setup
- Check if the deploy user has permissions to `/srv/watch-party`
- The script will automatically fall back to `~/watch-party` if permissions fail

### AWS configuration fails
- Verify AWS credentials in GitHub secrets
- Check if IAM role `MyAppRole` is attached to the instance
- Ensure Secrets Manager has the required secrets

### Docker build times out
- The script automatically retries with sequential build
- Frontend build has extended timeout (1200s) due to Node.js compilation
- BuildKit caching speeds up subsequent builds

### Services fail to start
- Check Docker logs: `docker-compose logs <service-name>`
- Verify environment variables are set correctly
- Ensure AWS services (RDS, ElastiCache) are accessible

### Health checks fail
- Each health check has multiple retry attempts
- Check container logs for specific errors
- Verify firewall allows ports 80, 443, 3000, 8000

## Performance Improvements

Compared to the original monolithic script:

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Workflow file size | 717 lines | 67 lines | 90% smaller |
| Script organization | 1 monolithic | 8 modular | Better maintainability |
| Error isolation | Difficult | Easy | Clearer error messages |
| Reusability | None | High | Scripts can run independently |
| SSH timeout risk | High | Low | Execution stays within limits |

## Environment Variables Reference

### Required (for GitHub Actions)
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `SSL_ORIGIN` - SSL origin certificate content
- `SSL_PRIVATE` - SSL private key content

### Optional
- `APP_DIR` - Application directory (defaults to `/srv/watch-party`)
- `APP_NAME` - Application name (defaults to `watch-party`)

## Directory Structure

After deployment, the application structure looks like:

```
/srv/watch-party/  (or ~/watch-party/)
├── .git/
├── backend/
│   ├── .env              # Generated by setup-aws-environment.sh
│   └── ...
├── frontend/
│   ├── .env.local        # Generated by setup-aws-environment.sh
│   └── ...
├── nginx/
│   └── ssl/              # Generated by setup-ssl-certificates.sh
│       ├── origin.pem
│       └── private.key
└── scripts/
    └── deployment/       # These deployment scripts
```

## Monitoring

After deployment, you can monitor the application:

```bash
# View all service logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Check service status
docker-compose ps

# View recent errors
docker-compose logs --tail=50 backend | grep -i error
```

## Contributing

When modifying deployment scripts:

1. Keep scripts focused on a single responsibility
2. Use the logging functions from `common-functions.sh`
3. Handle errors gracefully with appropriate exit codes
4. Update this README if adding new scripts
5. Test changes locally before committing
6. Maintain backward compatibility when possible

## Support

If you encounter issues with deployment:

1. Check the GitHub Actions logs for the specific step that failed
2. Review the corresponding script in this directory
3. Run the script manually on the server for more detailed output
4. Check container logs with `docker-compose logs <service>`
5. Verify AWS service connectivity and permissions

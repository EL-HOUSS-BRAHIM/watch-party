# Watch Party Backend - Modern Deployment System

This directory contains the complete deployment system for the Watch Party Backend, designed after successful production deployment and optimization.

## Directory Structure

```
deployment/
├── README.md                    # This file
├── scripts/
│   ├── setup-server.sh         # Initial server setup
│   ├── deploy-app.sh            # Application deployment
│   ├── update-app.sh            # Git-based updates
│   ├── nginx-setup.sh           # Nginx configuration
│   ├── ssl-setup.sh             # SSL certificate setup
│   └── health-check.sh          # Health monitoring
├── templates/
│   ├── nginx.conf.template      # Nginx configuration template
│   ├── ecosystem.config.js      # PM2 configuration
│   ├── systemd/                 # Systemd service files
│   └── env.template             # Environment variables template
├── config/
│   ├── requirements.txt         # Python dependencies
│   └── settings.py              # Django settings overrides
└── workflows/
    └── deploy.yml               # GitHub Actions workflow
```

## Deployment Process

### 1. Initial Server Setup
```bash
./deployment/scripts/setup-server.sh
```

### 2. Application Deployment
```bash
./deployment/scripts/deploy-app.sh
```

### 3. Updates (Git-based)
```bash
./deployment/scripts/update-app.sh
```

## Features

- ✅ Automated server setup
- ✅ PM2 process management
- ✅ Nginx reverse proxy with SSL
- ✅ Valkey/Redis configuration
- ✅ Environment-based configuration
- ✅ Health monitoring
- ✅ Git-based deployment workflow
- ✅ Optimized for t2.micro instances
- ✅ GitHub Actions integration

## Requirements

- Ubuntu 24.04 LTS
- AWS EC2 instance with appropriate security groups
- Domain name configured with Cloudflare
- AWS ElastiCache Valkey cluster
- AWS RDS PostgreSQL database

## Configuration

All configuration is done via environment variables in `.env` file.
See `templates/env.template` for all available options.
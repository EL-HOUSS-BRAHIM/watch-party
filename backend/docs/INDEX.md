# Watch Party Backend Documentation Index

This directory contains all organized documentation for the Watch Party Backend project.

## 📁 Directory Structure

### 🔧 **nginx/** - Web Server Configuration
- [`CLOUDFLARE_SSL_GUIDE.md`](nginx/CLOUDFLARE_SSL_GUIDE.md) - Complete Cloudflare SSL setup guide
- [`NGINX_CONFIG_GUIDE.md`](nginx/NGINX_CONFIG_GUIDE.md) - Nginx configuration documentation
- [`nginx-cloudflare-full-strict.conf`](nginx/nginx-cloudflare-full-strict.conf) - Production-ready Cloudflare config
- [`nginx-ssl.conf`](nginx/nginx-ssl.conf) - Direct SSL configuration
- [`setup-cloudflare-ssl.sh`](nginx/setup-cloudflare-ssl.sh) - SSL setup automation script
- [`verify-cloudflare-setup.sh`](nginx/verify-cloudflare-setup.sh) - Configuration verification script

### ☁️ **aws/** - AWS Infrastructure
- [`AWS_MIGRATION_GUIDE.md`](aws/AWS_MIGRATION_GUIDE.md) - AWS migration procedures
- [`AWS_SECURITY_GROUP_FIX.md`](aws/AWS_SECURITY_GROUP_FIX.md) - Security group configuration
- [`aws-infrastructure-summary.md`](aws/aws-infrastructure-summary.md) - Infrastructure overview

### 🚀 **deployment/** - Deployment & CI/CD
- [`DEPLOYMENT.md`](deployment/DEPLOYMENT.md) - Main deployment guide
- [`DEPLOYMENT_CHECKLIST.md`](deployment/DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [`DEPLOYMENT_FIXES_COMPLETE.md`](deployment/DEPLOYMENT_FIXES_COMPLETE.md) - Fixed deployment issues
- [`DEPLOYMENT_FIX_SUMMARY.md`](deployment/DEPLOYMENT_FIX_SUMMARY.md) - Summary of fixes
- [`DEPLOYMENT_SETUP_COMPLETE.md`](deployment/DEPLOYMENT_SETUP_COMPLETE.md) - Setup completion guide
- [`DEPLOYMENT_SUCCESS_SUMMARY.md`](deployment/DEPLOYMENT_SUCCESS_SUMMARY.md) - Success metrics
- [`FINAL_DEPLOYMENT_SUMMARY.md`](deployment/FINAL_DEPLOYMENT_SUMMARY.md) - Final deployment summary
- [`GITHUB_ACTIONS_UPDATE.md`](deployment/GITHUB_ACTIONS_UPDATE.md) - CI/CD updates
- [`SECRETS_GUIDE.md`](deployment/SECRETS_GUIDE.md) - Secrets management

### 🔐 **security/** - Security & Configuration
- [`ENVIRONMENT_VARIABLES_ALIGNMENT.md`](security/ENVIRONMENT_VARIABLES_ALIGNMENT.md) - Environment variables
- [`OAUTH_VARIABLES_UPDATE.md`](security/OAUTH_VARIABLES_UPDATE.md) - OAuth configuration
- [`SSH_PRIVATE_KEY_SETUP.md`](security/SSH_PRIVATE_KEY_SETUP.md) - SSH key setup

### 🛠️ **development/** - Development Setup
- Development setup guides
- Contributing guidelines
- Code standards

### 🔍 **maintenance/** - System Maintenance
- System monitoring
- Backup procedures
- Troubleshooting guides

### 📊 **api/** - API Documentation
- API endpoint documentation
- Authentication guides
- Request/Response examples

## 📋 General Documentation

- [`FIXES_SUMMARY.md`](FIXES_SUMMARY.md) - Summary of all fixes applied
- [`testing.md`](testing.md) - Testing guidelines and procedures
- [`README.md`](README.md) - Documentation overview

## 🚀 Quick Start Guides

### For Development
1. [Development Setup](development/SETUP.md)
2. [API Documentation](api/README.md)

### For Deployment
1. [Deployment Guide](deployment/DEPLOYMENT.md)
2. [Nginx Setup](nginx/CLOUDFLARE_SSL_GUIDE.md)
3. [Security Configuration](security/ENVIRONMENT_VARIABLES_ALIGNMENT.md)

### For Production
1. [Cloudflare SSL Setup](nginx/CLOUDFLARE_SSL_GUIDE.md)
2. [AWS Infrastructure](aws/aws-infrastructure-summary.md)
3. [Deployment Checklist](deployment/DEPLOYMENT_CHECKLIST.md)

## 🔧 Configuration Files

**Active Nginx Config**: [`../nginx.conf`](../nginx.conf) - Currently used configuration
**Alternative Configs**: Available in [`nginx/`](nginx/) directory

## 📞 Need Help?

1. Check the relevant section above
2. Use the verification scripts in [`nginx/`](nginx/) for configuration issues
3. Refer to troubleshooting guides in [`maintenance/`](maintenance/)
4. Check the main [README.md](../README.md) for project overview

## 📝 File Naming Convention

- `*.md` - Documentation files
- `*.conf` - Configuration files
- `*.sh` - Shell scripts (executable)
- `*_GUIDE.md` - Step-by-step guides
- `*_SUMMARY.md` - Summary/overview documents

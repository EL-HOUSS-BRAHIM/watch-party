# AWS Infrastructure Migration Guide

This guide will help you migrate your Watch Party backend from local databases to AWS RDS (PostgreSQL) and ElastiCache (Valkey) using best practices.

## 🚀 Quick Start

1. **Run the infrastructure setup script:**
   ```bash
   ./scripts/aws-infrastructure-setup.sh
   ```

2. **Test connections:**
   ```bash
   python scripts/test-aws-connections.py
   ```

3. **Migrate your data (optional):**
   ```bash
   python scripts/migrate-to-aws.py
   ```

## 📋 Prerequisites

### Required Tools
- **AWS CLI** (configured with appropriate permissions)
- **jq** (JSON processor)
- **PostgreSQL client tools** (`psql`, `pg_dump`)
- **Python 3.9+** with project dependencies

### AWS Permissions Required
Your AWS IAM user/role needs the following permissions:
- `ec2:*` (VPC, Security Groups, Subnets)
- `rds:*` (RDS instances)
- `elasticache:*` (ElastiCache clusters)
- `sts:GetCallerIdentity` (Identity verification)

### Installation Commands
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y awscli jq postgresql-client

# macOS
brew install awscli jq postgresql

# Configure AWS CLI
aws configure
```

## 🏗️ Infrastructure Components

### What Will Be Created

#### VPC and Networking
- **Default VPC** (uses existing default VPC in your AWS account)
- **Existing Subnets** (uses all available subnets in the default VPC)
- **Security Groups** with minimal required access (created specifically for this project)

#### RDS PostgreSQL Database
- **Engine:** PostgreSQL 15.4
- **Instance Class:** `db.t3.micro` (suitable for development)
- **Storage:** 20GB GP3 with auto-scaling up to 1TB
- **Features:**
  - ✅ Encryption at rest
  - ✅ SSL/TLS encryption in transit
  - ✅ Automated backups (7 days retention)
  - ✅ Performance Insights
  - ✅ CloudWatch logs export
  - ✅ Deletion protection
  - ✅ Multi-AZ standby (automatic failover)

#### ElastiCache Valkey Cluster
- **Engine:** Valkey 7.2 (Redis-compatible)
- **Node Type:** `cache.t3.micro`
- **Nodes:** 2 with automatic failover
- **Features:**
  - ✅ Encryption in transit and at rest
  - ✅ Authentication with strong token
  - ✅ Multi-AZ deployment
  - ✅ Automated snapshots (5 days retention)

## 📝 Step-by-Step Setup

### Step 1: Infrastructure Creation

Run the infrastructure setup script:

```bash
./scripts/aws-infrastructure-setup.sh
```

**What it does:**
- Uses your existing default VPC and subnets (no new VPC creation)
- Creates only the necessary security groups for database access
- Creates RDS PostgreSQL instance with encryption
- Creates ElastiCache Valkey cluster
- Generates strong passwords and authentication tokens
- Updates your `.env` file with new credentials
- Creates infrastructure summary and logs

**Expected duration:** 15-20 minutes (faster since no VPC creation required)

### Step 2: Verify Connections

Test all AWS connections:

```bash
python scripts/test-aws-connections.py
```

**What it tests:**
- PostgreSQL connection to AWS RDS
- Redis/Valkey connection to AWS ElastiCache
- Django configuration with AWS services
- Celery broker connectivity

### Step 3: Data Migration (Optional)

If you have existing data to migrate:

```bash
python scripts/migrate-to-aws.py
```

**What it does:**
- Backs up your local PostgreSQL database
- Runs Django migrations on AWS RDS
- Restores your data to AWS RDS
- Migrates Redis data to AWS ElastiCache
- Validates the migration

## 🔧 Configuration Details

### Environment Variables Added

The setup script will add these variables to your `.env` file:

```bash
# AWS RDS PostgreSQL
DATABASE_URL=postgresql://username:password@hostname:5432/database?sslmode=require
DATABASE_NAME=watchparty_prod
DATABASE_USER=watchparty_admin
DATABASE_PASSWORD=<generated-secure-password>
DATABASE_HOST=<rds-endpoint>
DATABASE_PORT=5432
DB_SSL_MODE=require

# AWS ElastiCache Valkey
REDIS_URL=rediss://:auth-token@hostname:6379/0?ssl_cert_reqs=none
REDIS_HOST=<elasticache-endpoint>
REDIS_PORT=6379
REDIS_PASSWORD=<generated-auth-token>
REDIS_USE_SSL=True

# Celery with AWS ElastiCache
CELERY_BROKER_URL=rediss://:auth-token@hostname:6379/2?ssl_cert_reqs=none
CELERY_RESULT_BACKEND=rediss://:auth-token@hostname:6379/3?ssl_cert_reqs=none

# Django Channels with AWS ElastiCache
CHANNEL_LAYERS_CONFIG_HOSTS=rediss://:auth-token@hostname:6379/4?ssl_cert_reqs=none
```

### Django Settings Updates

The following settings have been updated to support AWS:

1. **Database Configuration** (`core/database_optimization.py`):
   - SSL/TLS support for RDS connections
   - Connection pooling optimization
   - Enhanced error handling

2. **Cache Configuration**:
   - SSL/TLS support for ElastiCache
   - Multiple database support for different services
   - Optimized connection settings

3. **Channel Layers**:
   - SSL/TLS configuration for WebSocket connections
   - Encryption key support

## 🔒 Security Features

### Network Security
- **Default VPC**: Uses existing default VPC with proper security group isolation
- **Security Groups**: Minimal required access with source group restrictions
- **Database Access**: Restricted to application security groups only

### Encryption
- **RDS:** Encryption at rest and in transit (SSL/TLS)
- **ElastiCache:** Encryption at rest and in transit
- **Strong Authentication:** Generated passwords and tokens (32-64 characters)

### Access Control
- **Database Access:** Only from application security group
- **Cache Access:** Only from application security group
- **SSL Required:** All connections use SSL/TLS

## 📊 Monitoring and Maintenance

### Automated Backups
- **RDS Backups:** Daily backups with 7-day retention
- **ElastiCache Snapshots:** Daily snapshots with 5-day retention
- **Backup Windows:** 03:00-04:00 UTC (RDS), 03:00-05:00 UTC (ElastiCache)

### Maintenance Windows
- **RDS:** Sunday 04:00-05:00 UTC
- **ElastiCache:** Sunday 05:00-06:00 UTC

### Monitoring Features
- **Performance Insights:** Enabled for RDS
- **CloudWatch Logs:** Database logs exported
- **CloudWatch Metrics:** Available for both services

## 💰 Cost Optimization

### Current Configuration
- **RDS t3.micro:** ~$13-20/month
- **ElastiCache t3.micro (2 nodes):** ~$24-30/month
- **Data Transfer:** Minimal for internal communication
- **Storage:** Based on actual usage

### Production Recommendations
- **Monitor usage** and scale instances as needed
- **Use Reserved Instances** for production (up to 60% savings)
- **Enable auto-scaling** for storage
- **Set up billing alerts**

## 🛠️ Troubleshooting

### Common Issues

#### Connection Timeouts
```bash
# Check security group rules
aws ec2 describe-security-groups --group-ids sg-xxxxxxxxx

# Test network connectivity
telnet your-rds-endpoint 5432
telnet your-elasticache-endpoint 6379
```

#### SSL/TLS Issues
```bash
# Test PostgreSQL SSL connection
psql "postgresql://user:pass@host:5432/db?sslmode=require"

# Test Redis SSL connection
redis-cli --tls -h your-elasticache-endpoint -p 6379 -a your-auth-token
```

#### Django Migration Issues
```bash
# Run migrations manually
python manage.py migrate --run-syncdb

# Check database connection
python manage.py dbshell
```

### Getting Help
- Check logs: `aws-infrastructure-setup.log`
- Test connections: `python scripts/test-aws-connections.py`
- AWS documentation: [RDS](https://docs.aws.amazon.com/rds/) | [ElastiCache](https://docs.aws.amazon.com/elasticache/)

## 🗑️ Cleanup

To remove all AWS resources:

```bash
./scripts/aws-infrastructure-cleanup.sh
```

⚠️ **WARNING:** This will permanently delete all data!

## 📚 Additional Resources

### AWS Best Practices
- [RDS Security Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.Security.html)
- [ElastiCache Security](https://docs.aws.amazon.com/AmazonElastiCache/latest/red-ug/auth.html)
- [VPC Security](https://docs.aws.amazon.com/vpc/latest/userguide/VPC_Security.html)

### Django Configuration
- [Django Database Settings](https://docs.djangoproject.com/en/5.0/ref/settings/#databases)
- [Django Cache Framework](https://docs.djangoproject.com/en/5.0/topics/cache/)
- [Django Channels](https://channels.readthedocs.io/)

## 🎉 Success Indicators

Your migration is successful when:

✅ All connection tests pass  
✅ Django admin loads without errors  
✅ WebSocket connections work  
✅ Background tasks (Celery) function  
✅ Data is properly migrated  
✅ SSL/TLS connections are established  

## 🔄 Next Steps After Migration

1. **Update Deployment Configuration**
   - Update your deployment scripts to use AWS endpoints
   - Configure environment variables in your deployment pipeline

2. **Set Up Monitoring**
   - Configure CloudWatch dashboards
   - Set up alerting for critical metrics

3. **Security Review**
   - Review security group rules
   - Consider using AWS Secrets Manager for production

4. **Performance Optimization**
   - Monitor application performance
   - Adjust instance sizes based on load

5. **Backup Strategy**
   - Test restore procedures
   - Consider additional backup solutions

---

**Questions or Issues?** Check the logs in `aws-infrastructure-setup.log` or run the test script for diagnostics.

# Deployment Checklist

This checklist ensures successful deployment after our fixes.

## ✅ Pre-Deployment Checklist

### 1. Code Quality
- [ ] All tests pass locally
- [ ] No critical linting errors
- [ ] Virtual environment dependencies updated in `requirements.txt`

### 2. Environment Configuration
- [ ] All required GitHub secrets are set
- [ ] Production environment variables are configured
- [ ] Database credentials are valid
- [ ] Redis/cache credentials are valid

### 3. Infrastructure Requirements
- [ ] Server has Python 3.11+ installed
- [ ] PostgreSQL service is running
- [ ] Redis service is running
- [ ] Nginx is installed
- [ ] Required system packages are available

## 🚀 Automated Deployment Process

When you push to the `master` branch, the following happens automatically:

### 1. Virtual Environment Setup
```bash
# Automatic cleanup of corrupted venv
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
pip install gunicorn gevent
```

### 2. Service Configuration
```bash
# Gunicorn service (port 8001)
/var/www/watchparty/venv/bin/gunicorn --bind 127.0.0.1:8001 --workers 3 --worker-class gevent watchparty.wsgi:application

# Daphne service (port 8002)  
/var/www/watchparty/venv/bin/daphne -b 127.0.0.1 -p 8002 watchparty.asgi:application
```

### 3. Nginx Configuration
```nginx
# Main application traffic → gunicorn (port 8001)
location / {
    proxy_pass http://127.0.0.1:8001;
}

# WebSocket traffic → daphne (port 8002)
location /ws/ {
    proxy_pass http://127.0.0.1:8002;
}
```

### 4. Process Management
- Automatic cleanup of existing gunicorn processes
- Service restart with proper dependencies
- Log file permissions fixed automatically

## 🔍 Post-Deployment Verification

After deployment, these checks run automatically:

### Service Status
```bash
sudo systemctl status watchparty-gunicorn.service
sudo systemctl status watchparty-celery.service  
sudo systemctl status watchparty-daphne.service
```

### Connectivity Tests
```bash
curl -I http://localhost:8001  # Django app
curl -I http://localhost/      # Nginx proxy
```

### Log Monitoring
```bash
tail -f /var/log/watchparty/gunicorn_error.log
tail -f /var/log/watchparty/django_errors.log
```

## 🛠️ Manual Deployment (if needed)

If you need to deploy manually:

```bash
# On the server
cd /var/www/watchparty

# Run production setup
sudo ./manage.sh prod-setup

# Or restart services
sudo ./manage.sh prod-restart

# Check status
./manage.sh prod-status
```

## 🚨 Troubleshooting

### Common Issues Fixed

1. **Virtual Environment Corruption**
   - ✅ Auto-recreated on each deployment
   - ✅ Dependencies properly installed

2. **Port Conflicts** 
   - ✅ Gunicorn uses 8001
   - ✅ Daphne uses 8002
   - ✅ Old processes automatically killed

3. **Log Permission Errors**
   - ✅ Log directories created with proper ownership
   - ✅ Files have correct permissions (644)

4. **Service File Issues**
   - ✅ ExecStart commands on single lines
   - ✅ Proper systemd configuration

### Emergency Commands

If services fail to start:
```bash
# Kill all gunicorn processes
sudo pkill -f gunicorn

# Restart services manually
sudo systemctl daemon-reload
sudo systemctl restart watchparty-gunicorn.service
sudo systemctl restart watchparty-daphne.service

# Check logs
sudo journalctl -xeu watchparty-gunicorn.service
```

## 📊 Success Metrics

Deployment is successful when:
- ✅ All services show "active (running)"
- ✅ Health endpoint returns 200/301
- ✅ No errors in application logs
- ✅ WebSocket connections work (if tested)
- ✅ Static files serve correctly

## 🔄 Rollback Plan

If deployment fails:
1. Check service logs
2. Fix issues in code
3. Push new commit to master
4. GitHub Actions will re-deploy automatically

No manual rollback needed - the deployment is idempotent and self-healing.

---

**Note**: All fixes are now automated. Simply push to master and the deployment will handle all the issues we encountered previously! 🎉

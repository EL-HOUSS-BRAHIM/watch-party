# Authentication Fixes - Deployment Checklist

## Pre-Deployment

### Backend
- [ ] Install new dependency
  ```bash
  cd backend
  pip install -r requirements.txt
  ```

- [ ] Run migrations (if needed)
  ```bash
  python manage.py makemigrations authentication
  python manage.py migrate
  ```

- [ ] Verify Celery configuration
  ```bash
  python manage.py shell
  >>> from django.conf import settings
  >>> 'cleanup_expired_sessions' in settings.CELERY_BEAT_SCHEDULE
  True
  ```

### Frontend
- [ ] No new dependencies needed
- [ ] Verify environment variables are set:
  - `BACKEND_URL` (should point to Django backend)
  - `NODE_ENV` (production/development)

## Testing

### Manual Testing

#### Login Flow
- [ ] Login with valid credentials
- [ ] Check UserSession record is created in database
  ```sql
  SELECT * FROM auth_user_sessions ORDER BY created_at DESC LIMIT 5;
  ```
- [ ] Verify device info is captured correctly
- [ ] Check cookies are set with correct expiration

#### Session Validation
- [ ] Refresh page and verify session persists
- [ ] Wait 60+ minutes and verify auto-refresh works
- [ ] Check that expired access token gets refreshed

#### Logout Flow
- [ ] Logout and verify session is marked inactive
  ```sql
  SELECT is_active FROM auth_user_sessions WHERE user_id = '<user_id>';
  ```
- [ ] Verify redirect to login page
- [ ] Try to access protected route (should redirect to login)

#### Celery Tasks
- [ ] Run cleanup task manually
  ```bash
  python manage.py shell
  >>> from apps.authentication.tasks import cleanup_expired_sessions
  >>> cleanup_expired_sessions()
  ```
- [ ] Check task output for deleted count
- [ ] Verify database records were removed

### Automated Testing
- [ ] Run existing authentication tests
  ```bash
  cd backend
  pytest apps/authentication/tests/
  ```

## Deployment Steps

### 1. Deploy Backend

```bash
# SSH into production server
ssh user@production-server

# Navigate to backend directory
cd /path/to/watch-party/backend

# Pull latest changes
git pull origin master

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Collect static files (if needed)
python manage.py collectstatic --noinput

# Restart Django application
sudo systemctl restart watchparty-backend
# OR
pm2 restart watchparty-backend

# Restart Celery workers
sudo systemctl restart celery-worker
sudo systemctl restart celery-beat
# OR
pm2 restart celery-worker
pm2 restart celery-beat
```

### 2. Deploy Frontend

```bash
# SSH into frontend server (or same server)
ssh user@production-server

# Navigate to frontend directory
cd /path/to/watch-party/frontend

# Pull latest changes
git pull origin master

# No new dependencies to install

# Rebuild (if using Next.js standalone)
npm run build

# Restart Next.js application
pm2 restart watchparty-frontend
# OR
sudo systemctl restart watchparty-frontend
```

## Post-Deployment Verification

### Immediate Checks
- [ ] Login works correctly
- [ ] Session tracking is working (check database)
- [ ] Logout works correctly
- [ ] Token refresh works after 60 minutes
- [ ] No error logs in application logs

### Monitor for 24 Hours
- [ ] Check Celery task logs
  ```bash
  tail -f /var/log/celery/beat.log
  tail -f /var/log/celery/worker.log
  ```
- [ ] Verify session cleanup is running
- [ ] Monitor database growth
- [ ] Check for any authentication errors

### Database Queries for Monitoring

```sql
-- Check recent sessions
SELECT 
  u.email,
  s.created_at,
  s.is_active,
  s.device_info->>'browser' as browser,
  s.ip_address
FROM auth_user_sessions s
JOIN authentication_user u ON s.user_id = u.id
ORDER BY s.created_at DESC
LIMIT 10;

-- Count active sessions
SELECT COUNT(*) as active_sessions
FROM auth_user_sessions
WHERE is_active = true AND expires_at > NOW();

-- Count sessions by device
SELECT 
  device_info->>'browser' as browser,
  COUNT(*) as count
FROM auth_user_sessions
WHERE is_active = true
GROUP BY device_info->>'browser';
```

## Rollback Plan

If issues occur:

### Backend Rollback
```bash
# Revert to previous commit
git revert HEAD

# Or checkout previous version
git checkout <previous-commit-hash>

# Restart services
sudo systemctl restart watchparty-backend celery-worker celery-beat
```

### Frontend Rollback
```bash
# Revert to previous commit
git revert HEAD

# Rebuild and restart
npm run build
pm2 restart watchparty-frontend
```

### Database Rollback
```bash
# If migrations were run, rollback
python manage.py migrate authentication <previous-migration-number>
```

## Success Criteria

✅ Users can login successfully
✅ UserSession records are created on login
✅ Sessions are properly tracked with device info
✅ Logout deactivates sessions correctly
✅ Token refresh works automatically
✅ Celery tasks run on schedule
✅ Expired sessions are cleaned up
✅ No increase in error rates
✅ Performance remains stable

## Troubleshooting

### Issue: Sessions not being created
- Check that `user-agents` library is installed
- Verify imports in views.py are correct
- Check application logs for errors

### Issue: Celery tasks not running
- Verify Celery beat is running: `ps aux | grep celery`
- Check Celery beat schedule: `celery -A config inspect scheduled`
- Review beat logs: `tail -f /var/log/celery/beat.log`

### Issue: Token refresh not working
- Check that cookies are set with correct maxAge
- Verify `BACKEND_URL` environment variable is correct
- Check browser console for cookie errors

### Issue: Database growing too fast
- Check if cleanup tasks are running
- Manually run cleanup: `cleanup_expired_sessions.delay()`
- Adjust cleanup frequency if needed

## Contact

For issues or questions:
- Check logs first: `/var/log/watchparty/`
- Review documentation: `/docs/AUTH_FLOW_FIXES_OCT11.md`
- Check Celery status: `celery -A config inspect stats`

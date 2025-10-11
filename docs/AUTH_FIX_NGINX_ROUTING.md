# Critical Fix: Nginx Routing for Authentication

## Problem Identified ✅

The **real** issue was found in the nginx configuration!

### Root Cause:
The nginx configuration was routing `/api/auth/login` directly to the Django backend, bypassing the Next.js API routes that handle cookie management.

**Old nginx config:**
```nginx
# Only /api/auth/session went to frontend
location /api/auth/session {
    proxy_pass http://frontend;
}

# ALL /api/ routes (including /api/auth/login) went to backend  
location /api/ {
    proxy_pass http://backend;
}
```

This caused:
1. Login request → Django backend directly
2. Backend returns tokens in JSON response
3. NO cookies set (Next.js route never executed)
4. Session check fails
5. User redirected back to login

### Fixed nginx config:
```nginx
# ALL /api/auth/* routes go to frontend (for cookie handling)
location /api/auth/ {
    proxy_pass http://frontend;
    proxy_cookie_path / /;
    proxy_cookie_domain $host $host;
}

# Other /api/ routes go to backend
location /api/ {
    proxy_pass http://backend;
}
```

## Deployment Steps

### 1. Update nginx configuration on production server

```bash
# SSH into production server
ssh user@production-server

# Navigate to nginx config
cd /path/to/nginx/conf.d/

# Backup current config
cp default.conf default.conf.backup

# Update the configuration
# (Copy the new nginx/conf.d/default.conf from the repo)
```

### 2. Test nginx configuration

```bash
# Test for syntax errors
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 3. Reload nginx

```bash
# Reload nginx without dropping connections
sudo nginx -s reload

# OR restart nginx
sudo systemctl restart nginx
```

### 4. Verify the fix

Test login through the frontend:
```bash
# Should NOT return tokens in response, only {success: true, user: {...}}
curl -X POST https://watch-party.brahim-elhouss.me/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@watchparty.local","password":"admin123!"}' \
  -c cookies.txt -v
```

Check for cookies in the response headers:
```
< Set-Cookie: access_token=...; Path=/; HttpOnly; SameSite=Lax
< Set-Cookie: refresh_token=...; Path=/; HttpOnly; SameSite=Lax
```

Test session check:
```bash
# Should return authenticated with user data
curl https://watch-party.brahim-elhouss.me/api/auth/session \
  -b cookies.txt
```

Expected response:
```json
{
  "authenticated": true,
  "user": {
    "id": "...",
    "email": "admin@watchparty.local",
    ...
  }
}
```

## Key Changes in nginx/conf.d/default.conf

### Before:
```nginx
location /api/auth/session {
    proxy_pass http://frontend;
}

location /api/ {
    proxy_pass http://backend;  # This caught /api/auth/login!
}
```

### After:
```nginx
location /api/auth/ {
    proxy_pass http://frontend;  # All auth routes to Next.js
    proxy_cookie_path / /;        # Preserve cookie path
    proxy_cookie_domain $host $host;  # Preserve cookie domain
}

location /api/ {
    proxy_pass http://backend;  # Other API routes to backend
}
```

## Why This Matters

### Security:
- ✅ Tokens stored as HTTP-only cookies (XSS protection)
- ✅ Tokens never exposed to client JavaScript
- ✅ SameSite protection enabled

### Functionality:
- ✅ Login sets cookies properly
- ✅ Session validation works
- ✅ Auto-refresh works
- ✅ User stays logged in

## nginx Location Matching Order

nginx processes locations in this order:
1. Exact match (`= /path`)
2. Prefix match with `^~` modifier
3. Regular expression match (`~ or ~*`)
4. **Longest prefix match** ← This is why `/api/auth/` must come before `/api/`

Since we have:
```nginx
location /api/auth/ { ... }  # More specific (14 chars)
location /api/ { ... }        # Less specific (5 chars)
```

nginx will match `/api/auth/login` to the FIRST location (most specific).

## Testing Checklist

After deploying:

- [ ] nginx config test passes (`sudo nginx -t`)
- [ ] nginx reloaded successfully
- [ ] Login response does NOT contain tokens
- [ ] Login response sets `access_token` cookie
- [ ] Login response sets `refresh_token` cookie
- [ ] Session endpoint returns authenticated status
- [ ] Dashboard loads without redirect to login
- [ ] Logout works and clears cookies
- [ ] Token refresh works after 60 minutes

## Rollback Plan

If issues occur:

```bash
# Restore backup
sudo cp /path/to/nginx/conf.d/default.conf.backup /path/to/nginx/conf.d/default.conf

# Test and reload
sudo nginx -t && sudo nginx -s reload
```

## Related Files Modified

- `/workspaces/watch-party/nginx/conf.d/default.conf` - nginx routing configuration

## Summary

The issue was NOT in the frontend code - it was in the **nginx reverse proxy configuration** that was intercepting `/api/auth/login` and routing it directly to the backend, completely bypassing the Next.js API route that handles cookie management.

**Solution:** Route ALL `/api/auth/*` requests to the Next.js frontend, which properly handles:
1. Forwarding to Django backend
2. Receiving tokens
3. Setting HTTP-only cookies
4. Returning safe response (without tokens)

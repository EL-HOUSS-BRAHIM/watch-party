# VS Code Simple Browser Configuration Guide

This guide ensures Watch Party works perfectly in VS Code Simple Browser and other embedded development environments.

---

## 🎯 What We've Configured

### Backend CORS Settings

#### Production (`backend/config/settings/production.py`):
```python
# Secure: Only specific origins allowed
CORS_ALLOW_ALL_ORIGINS = False

# Allowed origins include production and localhost
CORS_ALLOWED_ORIGINS = [
    'https://watch-party.brahim-elhouss.me',
    'https://be-watch-party.brahim-elhouss.me',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
]

# Regex patterns for VS Code and development tools
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.app\.github\.dev$',      # GitHub Codespaces
    r'^https://.*\.vscode-cdn\.net$',       # VS Code Simple Browser
    r'^vscode-webview://.*$',               # VS Code webview protocol
]
```

#### Development (`backend/config/settings/development.py`):
```python
# Allow all origins in development
CORS_ALLOW_ALL_ORIGINS = True

# Additional regex patterns for flexibility
CORS_ALLOWED_ORIGIN_REGEXES = [
    r'^https://.*\.app\.github\.dev$',
    r'^https://.*\.vscode-cdn\.net$',
    r'^vscode-webview://.*$',
    r'^http://localhost:\d+$',              # Any localhost port
    r'^http://127\.0\.0\.1:\d+$',           # Any 127.0.0.1 port
]
```

### Frontend Configuration

#### Next.js (`frontend/next.config.mjs`):
```javascript
async headers() {
  const isDev = process.env.NODE_ENV === 'development';
  const isVSCode = process.env.VSCODE_SIMPLE_BROWSER === 'true';

  // In development OR VS Code, allow all framing
  if (isDev || isVSCode) {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // No X-Frame-Options to allow framing
          // No CSP to avoid conflicts
        ],
      },
    ];
  }
  
  // Production: Strict security headers
  // ...
}
```

#### Environment Variable (`frontend/.env.local`):
```bash
VSCODE_SIMPLE_BROWSER=true
```

---

## 🚀 How to Use

### Option 1: VS Code Simple Browser (Recommended)

1. **Start Backend:**
   ```bash
   cd backend
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Open in Simple Browser:**
   - Right-click on `http://localhost:3000` in your code
   - Select **"Open in Simple Browser"**
   - OR use Command Palette: `Simple Browser: Show`

4. **Verify:**
   - Open browser DevTools (F12)
   - Check Console for CORS errors (should be none)
   - Test login/logout
   - Test WebSocket connections

### Option 2: GitHub Codespaces

Automatically supported! The regex patterns allow `*.app.github.dev` domains.

1. Open Codespaces
2. Start backend and frontend
3. Open forwarded port in browser
4. Everything should work without CORS issues

### Option 3: External Browser (Chrome/Firefox)

For regular browser testing:

1. Frontend will connect to `http://localhost:8000`
2. CORS allows `http://localhost:3000`
3. Works normally without any special configuration

---

## 🔧 Troubleshooting

### Problem: CORS Error in VS Code Simple Browser

**Symptoms:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/...' from origin 'vscode-webview://...' has been blocked by CORS policy
```

**Solutions:**

1. **Check Environment Variable:**
   ```bash
   # In frontend/.env.local
   VSCODE_SIMPLE_BROWSER=true
   ```

2. **Restart Frontend:**
   ```bash
   # Stop and restart
   npm run dev
   ```

3. **Verify CORS Settings:**
   ```bash
   # Check production.py
   grep "CORS_ALLOWED_ORIGIN_REGEXES" backend/config/settings/production.py
   ```

4. **Check Backend Logs:**
   ```bash
   # Look for CORS-related errors
   cd backend
   python manage.py runserver --verbosity 2
   ```

### Problem: Frame Options Blocking

**Symptoms:**
```
Refused to display 'http://localhost:3000' in a frame because it set 'X-Frame-Options' to 'deny'
```

**Solutions:**

1. **Set VS Code Flag:**
   ```bash
   # frontend/.env.local
   VSCODE_SIMPLE_BROWSER=true
   ```

2. **Verify Next.js Config:**
   ```javascript
   // frontend/next.config.mjs
   const isVSCode = process.env.VSCODE_SIMPLE_BROWSER === 'true';
   ```

3. **Restart Frontend Dev Server**

### Problem: WebSocket Connection Failed

**Symptoms:**
```
WebSocket connection to 'ws://localhost:8000/ws/party/...' failed
```

**Solutions:**

1. **Check WebSocket URL:**
   ```typescript
   // Should be ws:// for development, wss:// for production
   const wsUrl = isDevelopment 
     ? 'ws://localhost:8000/ws/...'
     : 'wss://be-watch-party.brahim-elhouss.me/ws/...';
   ```

2. **Verify Backend is Running:**
   ```bash
   curl http://localhost:8000/api/health/
   ```

3. **Check Django Channels:**
   ```bash
   # Backend should show:
   # Daphne running on http://0.0.0.0:8000
   ```

### Problem: Authentication Not Working

**Symptoms:**
- Login succeeds but redirects back to login
- Cookies not being set
- Session not persisting

**Solutions:**

1. **Check Cookie Domain:**
   ```python
   # backend/config/settings/base.py
   SESSION_COOKIE_DOMAIN = None  # or specific domain
   SESSION_COOKIE_HTTPONLY = True
   SESSION_COOKIE_SAMESITE = 'Lax'
   ```

2. **Verify CSRF Settings:**
   ```python
   # backend/config/settings/production.py
   CSRF_TRUSTED_ORIGINS = [
       'http://localhost:3000',
       'http://127.0.0.1:3000',
   ]
   ```

3. **Check Browser Console:**
   - Look for cookie warnings
   - Check if cookies are being set in DevTools > Application > Cookies

---

## 📋 Verification Checklist

After configuration, verify these items:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] VS Code Simple Browser opens `localhost:3000`
- [ ] No CORS errors in browser console
- [ ] Login form appears and works
- [ ] Session persists after page reload
- [ ] WebSocket connection establishes
- [ ] Real-time features work (chat, video sync)
- [ ] File uploads work
- [ ] All API calls succeed

---

## 🎨 Development Workflow

### Recommended Setup:

```
+------------------+
|   VS Code        |
|                  |
|  +-----------+   |
|  | Terminal  |   |  <- Backend running
|  +-----------+   |
|                  |
|  +-----------+   |
|  | Terminal  |   |  <- Frontend running
|  +-----------+   |
|                  |
|  +-----------+   |
|  | Browser   |   |  <- Simple Browser
|  | localhost |   |
|  +-----------+   |
|                  |
+------------------+
```

### Commands:

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate  # if using venv
python manage.py runserver 0.0.0.0:8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Terminal 3: Testing
curl http://localhost:8000/api/health/
wscat -c ws://localhost:8000/ws/test/
```

---

## 🔒 Security Notes

### Development vs Production

**Development (VS Code Simple Browser):**
- ✅ Allow all origins (convenient)
- ✅ Allow framing (necessary)
- ✅ Relaxed CSP (debugging)
- ✅ No HTTPS required

**Production:**
- ✅ Specific allowed origins only
- ✅ Strict X-Frame-Options
- ✅ Full CSP headers
- ✅ HTTPS required
- ✅ Secure cookies only

### Best Practices

1. **Never** use `CORS_ALLOW_ALL_ORIGINS = True` in production
2. **Always** use environment variables for configuration
3. **Test** in VS Code Simple Browser during development
4. **Verify** production settings before deploying
5. **Monitor** CORS errors in production logs

---

## 📚 Additional Resources

### VS Code Documentation
- [Simple Browser](https://code.visualstudio.com/docs/editor/custom-layout#_simple-browser)
- [Live Preview](https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server)

### Django CORS
- [django-cors-headers](https://github.com/adamchainz/django-cors-headers)
- [Django Security Settings](https://docs.djangoproject.com/en/stable/topics/security/)

### Next.js Security
- [Security Headers](https://nextjs.org/docs/app/building-your-application/configuring/headers)
- [Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check this guide** for common problems
2. **Run verification script:** `./scripts/verify-setup.sh`
3. **Check logs:**
   - Backend: Terminal output
   - Frontend: Terminal output
   - Browser: DevTools Console
4. **Test in regular browser** to isolate VS Code-specific issues
5. **Review CORS settings** in both backend and frontend

---

**Last Updated:** November 11, 2025  
**Version:** 1.0.0  
**Tested With:**
- VS Code 1.94+
- Python 3.11+
- Node.js 20+
- Chrome 120+
- Firefox 121+

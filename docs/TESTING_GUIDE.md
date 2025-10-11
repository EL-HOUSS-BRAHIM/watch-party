# Testing Guide for Playwright Fixes

This guide helps verify that all fixes from the Playwright test report are working correctly.

## Quick Test Commands

```bash
# Navigate to frontend directory
cd /workspaces/watch-party/frontend

# Install dependencies (if needed)
pnpm install

# Start development server
pnpm dev

# Or build and start production
pnpm build
pnpm start
```

## Manual Testing Checklist

### 1. Header Navigation Test
- [ ] Visit homepage
- [ ] Click "Sign in" button in header
- [ ] **Expected:** Navigate to `/auth/login` (Login page)
- [ ] Go back to homepage
- [ ] Click "Start hosting" button in header
- [ ] **Expected:** Navigate to `/auth/register` (Registration page)

### 2. Support Page Test
- [ ] Visit homepage
- [ ] Scroll to footer
- [ ] Click "Support" under "Company" section
- [ ] **Expected:** Load `/support` page (no 404)
- [ ] **Expected:** See comprehensive support documentation
- [ ] **Expected:** All sections load: Getting Started, Features, Troubleshooting, Account

### 3. Footer Links Test
- [ ] Visit homepage
- [ ] Scroll to footer
- [ ] Under "Resources" section:
  - [ ] Click "Pricing" → Should go to `/pricing`
  - [ ] Click "Support" → Should go to `/support`
  - [ ] Click "GitHub" → Should open GitHub repository in new tab
- [ ] **Expected:** No broken links, no 404 errors, no DNS errors

### 4. Favicon Test
- [ ] Visit any page on the site
- [ ] Look at browser tab
- [ ] **Expected:** See WatchParty logo icon in tab
- [ ] Open browser DevTools → Network tab
- [ ] Refresh page
- [ ] Search for "favicon.ico"
- [ ] **Expected:** Status 200 (not 404)

### 5. Anchor Link Test
- [ ] Visit homepage
- [ ] Click "Preview the toolkit" or any link with `#features`
- [ ] **Expected:** Page scrolls to Features section
- [ ] **Expected:** URL changes to `/#features`

### 6. Security Headers Test (Advanced)

Open browser DevTools → Network tab → Click on main document → Headers tab:

```
Expected Response Headers:
✓ content-security-policy: present
✓ strict-transport-security: present
✓ x-frame-options: DENY
✓ x-content-type-options: nosniff
✓ x-xss-protection: present
✓ referrer-policy: present
```

### 7. Console Warnings Test
- [ ] Visit any page
- [ ] Open browser DevTools → Console tab
- [ ] **Expected:** No CSP violation warnings (or significantly reduced)
- [ ] **Expected:** No script-src violations for Next.js chunks

## Automated Testing

### Using curl to test endpoints

```bash
# Test support page exists (should return 200)
curl -I https://watch-party.brahim-elhouss.me/support

# Test favicon exists (should return 200)
curl -I https://watch-party.brahim-elhouss.me/favicon.ico

# Test security headers
curl -I https://watch-party.brahim-elhouss.me/ | grep -i "content-security-policy\|x-frame-options\|strict-transport"
```

### Using wget

```bash
# Download and check support page
wget -O - https://watch-party.brahim-elhouss.me/support | grep -i "support center"

# Check favicon
wget --spider https://watch-party.brahim-elhouss.me/favicon.ico
```

## Expected Results Summary

| Test | Before | After |
|------|--------|-------|
| Support page | 404 Error | ✅ Loads correctly |
| Status link | DNS Error | ✅ Removed/replaced |
| Press Kit link | 403 Error | ✅ Removed/replaced |
| "Sign in" button | Goes to `/join` | ✅ Goes to `/auth/login` |
| Favicon | 404 Error | ✅ Displays correctly |
| CSP warnings | Many violations | ✅ Configured properly |
| #features anchor | N/A | ✅ Already working |

## Troubleshooting

### If support page shows 404:
1. Ensure file exists: `frontend/app/support/page.tsx`
2. Rebuild the application: `pnpm build`
3. Clear Next.js cache: `rm -rf .next`

### If favicon doesn't show:
1. Hard refresh browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Check file exists: `frontend/public/favicon.ico`
4. Verify metadata in `frontend/app/layout.tsx`

### If navigation is still wrong:
1. Clear browser cache
2. Check `frontend/components/layout/marketing-header.tsx`
3. Ensure the file has correct href values:
   - "Sign in": `/auth/login`
   - "Start hosting": `/auth/register`

### If CSP warnings persist:
1. Check `frontend/next.config.mjs` has headers configuration
2. Verify server is using the updated config
3. Restart development server
4. Some warnings may be normal in development mode

## Browser Compatibility

Test on multiple browsers to ensure consistency:
- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Mobile Testing

- [ ] Test on mobile device or browser DevTools mobile emulation
- [ ] Verify favicon shows on mobile
- [ ] Check navigation works on touch devices
- [ ] Verify support page is responsive

## Performance Testing

```bash
# Use Lighthouse (Chrome DevTools)
# Check for:
# - SEO score (favicon should improve this)
# - Best Practices score (security headers should improve this)
# - No broken links
```

---

**Note:** All tests should pass after deploying the fixes. If any test fails, refer to the troubleshooting section or check the PLAYWRIGHT_TEST_FIXES_SUMMARY.md document.

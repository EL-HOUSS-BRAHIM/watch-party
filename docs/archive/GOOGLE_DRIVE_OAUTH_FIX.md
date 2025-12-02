# Google Drive OAuth Connection Fix

## Issue
Unable to connect Google Drive account. OAuth flow is failing.

## Root Cause
The redirect URI configured in your Google Cloud Console doesn't match the one used by the application.

## Current Configuration

### Backend Configuration
- **Frontend URL**: `https://watch-party.brahim-elhouss.me`
- **OAuth Callback Path**: `/dashboard/integrations/callback/google-drive`
- **Full Redirect URI**: `https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive`

### Code Location
- File: `backend/apps/integrations/views.py` (line 254)
- Code: `redirect_uri = f"{frontend_url}/dashboard/integrations/callback/google-drive"`

## Fix Steps

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project (the one with your OAuth credentials)
3. Navigate to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID (the one used for Watch Party)
5. Under **Authorized redirect URIs**, add the following URIs:

   ```
   https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive
   http://localhost:3000/dashboard/integrations/callback/google-drive
   ```

6. Click **Save**

### 2. Verify Environment Variables

Check that your backend `.env` file has:
```bash
FRONTEND_URL=https://watch-party.brahim-elhouss.me
```

### 3. Restart Backend Services

After updating the Google Cloud Console configuration:

```bash
# SSH into your server
ssh deploy@35.181.116.57

# Navigate to project
cd /home/deploy/watch-party

# Restart backend services
docker-compose -f docker-compose.prod.yml restart backend
```

### 4. Clear Browser Session

In your browser:
1. Open DevTools (F12)
2. Go to **Application** tab
3. Under **Storage**, clear:
   - Cookies for `watch-party.brahim-elhouss.me`
   - Session Storage
   - Local Storage
4. Close and reopen your browser

### 5. Test the Connection

1. Go to `https://watch-party.brahim-elhouss.me/dashboard/integrations`
2. Click **Connect** on Google Drive
3. You should be redirected to Google's OAuth page
4. After granting permissions, you should be redirected back to your app
5. Check that you see "Google Drive connected successfully!"

## OAuth Flow Explanation

### Current Flow:
1. User clicks "Connect Google Drive"
2. Frontend calls: `GET /api/integrations/google-drive/auth-url/`
3. Backend generates OAuth URL with redirect_uri: `https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive`
4. User is redirected to Google OAuth consent screen
5. After consent, Google redirects to: `https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive?code=...&state=...`
6. Frontend callback page (`frontend/app/dashboard/integrations/callback/google-drive/page.tsx`) receives the code
7. Frontend sends code to backend: `GET /api/integrations/google-drive/oauth-callback/?code=...&state=...`
8. Backend exchanges code for tokens and saves to database
9. User is redirected to Videos page with success message

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch" Error
**Solution**: The redirect URI in Google Cloud Console must **exactly match** the one used in the app:
- Must include `https://` or `http://` 
- Must match the domain exactly (including subdomain)
- Must include the full path: `/dashboard/integrations/callback/google-drive`
- No trailing slashes

### Issue: "Invalid state parameter"
**Solution**: Clear browser cookies/session and try again. The state parameter is stored in Django session.

### Issue: Connection works but videos don't load
**Solution**: This is a separate issue related to token refresh. The OAuth connection should work first.

### Issue: "Authorization code is required"
**Solution**: Check browser console for errors. The code parameter might not be reaching the backend.

## Verification Checklist

- [ ] Redirect URI added to Google Cloud Console (exact match)
- [ ] FRONTEND_URL environment variable is correct
- [ ] Backend services restarted
- [ ] Browser session/cookies cleared
- [ ] Can initiate OAuth flow (redirected to Google)
- [ ] Can complete OAuth flow (redirected back to app)
- [ ] Connection status shows "Connected" in Integrations page
- [ ] Can see "Watch Party" folder in Google Drive
- [ ] Can import videos from the Videos page

## Additional Notes

### Multiple Redirect URIs
You can have multiple redirect URIs in Google Cloud Console:
- Production: `https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive`
- Local Dev: `http://localhost:3000/dashboard/integrations/callback/google-drive`

This allows testing in both environments with the same OAuth client.

### Required Scopes
The app requests these Google Drive scopes:
- `https://www.googleapis.com/auth/drive.readonly` - Read files
- `https://www.googleapis.com/auth/drive.file` - Create/modify app-created files (Watch Party folder)

### Watch Party Folder
After successful connection, the backend automatically creates a "Watch Party" folder in the user's Google Drive. Only videos placed in this folder will be available for import.

## Support

If issues persist after following these steps:
1. Check backend logs: `docker logs watchparty-backend`
2. Check browser console for JavaScript errors
3. Verify OAuth credentials are correct in backend `.env`
4. Test with a different Google account

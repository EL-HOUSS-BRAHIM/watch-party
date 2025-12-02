# Google OAuth Setup - URGENT FIX NEEDED

## Error Message You're Seeing
```
Error 400: redirect_uri_mismatch
```

## The Problem
The redirect URI in your application does NOT match what's configured in Google Cloud Console.

## What Your App Is Using
```
https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive
```

## Fix Steps (Do This Now)

### 1. Go to Google Cloud Console
https://console.cloud.google.com/

### 2. Select Your Project
Select the project that has your OAuth credentials for Watch Party

### 3. Navigate to Credentials
- Click on "APIs & Services" in the left menu
- Click on "Credentials"

### 4. Find Your OAuth 2.0 Client ID
Look for the OAuth client you're using for Watch Party (it should have the client ID that matches your `GOOGLE_CLIENT_ID` in `.env`)

### 5. Click "Edit" (pencil icon)

### 6. Add Authorized Redirect URIs
In the "Authorized redirect URIs" section, click "+ ADD URI" and add this EXACT URI:

```
https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive
```

**IMPORTANT**: 
- Must be EXACT - including `https://`
- No trailing slash
- Must match the domain exactly

### 7. Also Add (for local development)
```
http://localhost:3000/dashboard/integrations/callback/google-drive
```

### 8. Click "SAVE"

### 9. Wait 5 Minutes
Google needs a few minutes to propagate the changes.

## Verify Your Setup

After adding the redirect URI, check that:

1. ✅ The redirect URI is: `https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive`
2. ✅ No typos in the domain
3. ✅ Using `https://` not `http://`
4. ✅ No trailing slash at the end
5. ✅ You clicked "SAVE" in Google Cloud Console

## Then Test Again

1. Clear your browser cache and cookies
2. Go to https://watch-party.brahim-elhouss.me/dashboard/integrations
3. Click "Connect" on Google Drive
4. It should now work!

## Common Mistakes to Avoid

❌ **Wrong**: `http://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive` (http instead of https)
❌ **Wrong**: `https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive/` (trailing slash)
❌ **Wrong**: `https://www.watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive` (added www)
❌ **Wrong**: `https://be-watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive` (backend domain instead of frontend)

✅ **Correct**: `https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/google-drive`

## Where to Find Your OAuth Client

In your `.env` file, look for:
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
```

Use the project that has this client ID.

## Still Not Working?

If it still doesn't work after adding the redirect URI:

1. Check that you're editing the CORRECT OAuth client (match the client ID)
2. Wait 5-10 minutes for Google to update
3. Clear browser cache completely
4. Try in an incognito/private window
5. Check the error details in Google's error message - it will show you what redirect URI it received vs what's allowed

## Screenshot of Google Cloud Console

When you open your OAuth client, it should look like:

```
Authorized redirect URIs
┌─────────────────────────────────────────────────────────────────────────┐
│ https://watch-party.brahim-elhouss.me/dashboard/integrations/callback/  │
│ google-drive                                                             │
│                                                                          │
│ http://localhost:3000/dashboard/integrations/callback/google-drive      │
│                                                                          │
│ [+ ADD URI]                                                              │
└─────────────────────────────────────────────────────────────────────────┘
```

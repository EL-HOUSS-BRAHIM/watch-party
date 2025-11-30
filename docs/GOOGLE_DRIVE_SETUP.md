# 🔗 Google Drive Integration Setup Guide

This guide explains how to set up Google Drive integration for the Watch Party platform, allowing users to connect their Google Drive and stream videos directly.

## Overview

The Google Drive integration allows users to:
- **Connect their Google Drive account** via OAuth 2.0
- **Browse videos** stored in their Drive
- **Import videos** to their Watch Party library
- **Stream videos directly** from Google Drive without downloading
- **Use videos in Watch Parties** with friends

## Required Secrets

Add these environment variables to your backend `.env` file:

```bash
# Google Drive OAuth Credentials
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here

# Optional: Service account for server-to-server operations
GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service-account.json
```

## Setting Up Google Cloud Console

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your Project ID

### 2. Enable the Google Drive API

1. Go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click **Enable**

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **External** (or Internal if using Google Workspace)
3. Fill in the required fields:
   - **App name**: Watch Party
   - **User support email**: your email
   - **App logo**: (optional)
   - **Application homepage**: `https://your-frontend-domain.com`
   - **Privacy policy link**: `https://your-frontend-domain.com/privacy`
   - **Terms of service link**: `https://your-frontend-domain.com/terms`
4. Add scopes:
   - `https://www.googleapis.com/auth/drive.readonly` (View files)
   - `https://www.googleapis.com/auth/drive.file` (Manage files created by the app)
5. Add test users (during development)

### 4. Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: Watch Party Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:3000
     https://your-frontend-domain.com
     ```
   - **Authorized redirect URIs** (IMPORTANT: use frontend URLs):
     ```
     http://localhost:3000/dashboard/integrations/callback/google-drive
     https://your-frontend-domain.com/dashboard/integrations/callback/google-drive
     ```
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

> ⚠️ **Important**: The redirect URI must point to the **frontend** callback page, not the backend. Google will redirect the user's browser there, and the frontend will complete the OAuth flow by calling the backend API.

### 5. Update Environment Variables

Add the credentials to your backend `.env`:

```bash
GOOGLE_DRIVE_CLIENT_ID=123456789-abc123.apps.googleusercontent.com
GOOGLE_DRIVE_CLIENT_SECRET=GOCSPX-your-secret-here

# Frontend URL for OAuth redirects (must match Google Console)
FRONTEND_URL=https://your-frontend-domain.com
```

## Frontend Configuration

The frontend is already configured to use Google Drive. Ensure these variables are set:

```bash
# frontend/.env.local
NEXT_PUBLIC_ENABLE_GOOGLE_DRIVE=true
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

## Testing the Integration

### Development Testing

1. Start the backend: `python manage.py runserver`
2. Start the frontend: `npm run dev`
3. Navigate to `/dashboard/videos`
4. Click the "Google Drive" tab
5. Click "Connect Google Drive"
6. Complete the OAuth flow
7. Your videos should appear!

### Production Checklist

- [ ] Google Cloud project is in production mode (not testing)
- [ ] OAuth consent screen is verified (if using sensitive scopes)
- [ ] HTTPS is configured for all redirect URIs
- [ ] Environment variables are set in production
- [ ] CORS is configured to allow your domains

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/google-drive/auth-url/` | GET | Get OAuth authorization URL |
| `/api/integrations/google-drive/oauth-callback/` | GET | Complete OAuth flow |
| `/api/integrations/google-drive/files/` | GET | List user's video files |
| `/api/integrations/google-drive/files/{file_id}/streaming-url/` | GET | Get streaming URL |
| `/api/integrations/google-drive/proxy/{file_id}/` | GET | Proxy stream (CORS-safe) |

## User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER FLOW                                │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Connect Google Drive" on Videos page
         │
         ▼
2. Frontend calls GET /api/integrations/google-drive/auth-url/
         │
         ▼
3. Backend generates OAuth URL with state token
         │
         ▼
4. User is redirected to Google login/consent page
         │
         ▼
5. User authorizes Watch Party to access Drive
         │
         ▼
6. Google redirects to frontend callback URL with authorization code
         │
         ▼
7. Frontend sends code to backend: GET /api/integrations/google-drive/oauth-callback/
         │
         ▼
8. Backend exchanges code for access/refresh tokens
         │
         ▼
8. Backend creates "Watch Party" folder in user's Drive
         │
         ▼
9. User is redirected to Videos page with success message
         │
         ▼
10. User can now browse and import videos from Drive!
```

## Troubleshooting

### "Google Drive not connected" error
- Ensure the user has completed the OAuth flow
- Check if tokens have expired (automatic refresh should handle this)
- Verify the user profile has `google_drive_connected = True`

### "Authorization URL not provided" error
- Check GOOGLE_DRIVE_CLIENT_ID is set correctly
- Verify the redirect URI matches exactly in Google Console

### Videos not appearing
- Videos must be in the "Watch Party" folder created by the app
- Only video files (mp4, avi, mkv, etc.) are shown
- Check browser console for API errors

### Streaming not working
- Verify the file exists in Google Drive
- Check if the file is a supported video format
- The proxy endpoint handles CORS issues automatically

## Security Notes

1. **Never commit secrets** - Use environment variables
2. **Refresh tokens** are stored encrypted in the database
3. **Access tokens** are short-lived and refreshed automatically
4. **User consent** is required before accessing any files
5. **Limited scopes** - We only request necessary permissions

## Support

For issues with Google Drive integration:
1. Check the [integration docs](/docs/development/integrations.md)
2. Review backend logs for detailed error messages
3. Test with a fresh Google account to isolate issues

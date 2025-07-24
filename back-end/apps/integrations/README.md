# 🔌 External Integrations - Watch Party Platform

## Overview

The integrations app provides seamless connections to external services including **Google Drive**, **AWS S3**, and **Social OAuth** providers. This enables users to stream videos directly from their Google Drive, upload to cloud storage, and authenticate with social media accounts.

## 🚀 Features Implemented

### ✅ Google Drive Integration
- **OAuth2 Authentication**: Secure connection to user's Google Drive
- **Video File Discovery**: Automatic detection and listing of video files
- **Direct Streaming**: Generate streaming URLs for supported video formats
- **Metadata Extraction**: Video duration, resolution, and codec information
- **Real-time Sync**: Automatic synchronization of file changes

### ✅ AWS S3 Integration
- **Direct File Upload**: Presigned URLs for client-side uploads
- **CloudFront CDN**: Optimized content delivery with caching
- **Multiple Storage Classes**: Configurable storage optimization
- **Secure Access**: Private file access with temporary URLs
- **Large File Support**: Multi-part uploads for files up to 5GB

### ✅ Social OAuth Integration
- **Google OAuth**: Login with Google accounts
- **Discord OAuth**: Connect Discord accounts
- **GitHub OAuth**: Authenticate with GitHub
- **Unified User Management**: Automatic account linking
- **Token Management**: Secure token storage and refresh

## 🛠️ Setup Instructions

### 1. Environment Configuration

Add these variables to your `.env` file:

```bash
# Google Drive Integration
GOOGLE_DRIVE_CLIENT_ID=your_google_client_id
GOOGLE_DRIVE_CLIENT_SECRET=your_google_client_secret
GOOGLE_SERVICE_ACCOUNT_FILE=/path/to/service_account.json

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_STORAGE_BUCKET_NAME=your_s3_bucket
AWS_S3_REGION_NAME=us-east-1
AWS_S3_CUSTOM_DOMAIN=your_cloudfront_domain.cloudfront.net

# Social OAuth Providers
GOOGLE_OAUTH_CLIENT_ID=your_google_oauth_client_id
GOOGLE_OAUTH_CLIENT_SECRET=your_google_oauth_secret
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_secret
```

### 2. Database Setup

```bash
# Apply migrations
python manage.py migrate

# Initialize integration configurations
python manage.py setup_integrations
```

### 3. OAuth Provider Setup

#### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Drive API and Google+ API
4. Create OAuth2 credentials
5. Add your redirect URIs:
   - `http://localhost:3000/auth/google/callback` (development)
   - `https://yourdomain.com/auth/google/callback` (production)

#### Discord OAuth Setup
1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to OAuth2 section
4. Add redirect URIs and copy Client ID/Secret

#### GitHub OAuth Setup
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL
4. Copy Client ID and generate Client Secret

### 4. AWS S3 Setup

1. Create S3 bucket in AWS Console
2. Create IAM user with S3 permissions
3. (Optional) Set up CloudFront distribution
4. Configure CORS policy:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

## 🌐 API Endpoints

### Google Drive Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/google-drive/auth-url/` | GET | Get OAuth authorization URL |
| `/api/integrations/google-drive/oauth-callback/` | POST | Complete OAuth flow |
| `/api/integrations/google-drive/files/` | GET | List user's video files |
| `/api/integrations/google-drive/files/{file_id}/streaming-url/` | GET | Get streaming URL |

### AWS S3 Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/s3/presigned-upload/` | POST | Generate upload URL |
| `/api/integrations/s3/upload/` | POST | Direct file upload |
| `/api/integrations/s3/files/{file_key}/streaming-url/` | GET | Get streaming URL |

### Social OAuth Integration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/integrations/oauth/{provider}/auth-url/` | GET | Get OAuth URL |
| `/api/integrations/oauth/{provider}/callback/` | POST | Handle OAuth callback |
| `/api/integrations/connections/` | GET | List user connections |
| `/api/integrations/connections/{id}/disconnect/` | DELETE | Disconnect service |

## 🔧 Usage Examples

### Frontend Integration

#### Google Drive Connection
```javascript
// Get authorization URL
const response = await fetch('/api/integrations/google-drive/auth-url/?redirect_uri=http://localhost:3000/callback');
const { auth_url } = await response.json();

// Redirect user to Google for authorization
window.location.href = auth_url;

// In callback handler
const tokenResponse = await fetch('/api/integrations/google-drive/oauth-callback/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: urlParams.get('code'),
    redirect_uri: 'http://localhost:3000/callback'
  })
});
```

#### List Google Drive Videos
```javascript
const response = await fetch('/api/integrations/google-drive/files/');
const { files } = await response.json();

files.forEach(file => {
  console.log(`${file.name} - ${file.mimeType}`);
});
```

#### S3 File Upload
```javascript
// Get presigned upload URL
const uploadData = await fetch('/api/integrations/s3/presigned-upload/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    file_name: 'video.mp4',
    content_type: 'video/mp4'
  })
});

const { upload_url, fields } = await uploadData.json();

// Upload file directly to S3
const formData = new FormData();
Object.entries(fields).forEach(([key, value]) => {
  formData.append(key, value);
});
formData.append('file', fileInput.files[0]);

await fetch(upload_url, {
  method: 'POST',
  body: formData
});
```

## 🔒 Security Features

### Authentication & Authorization
- **OAuth2 Flow**: Secure token exchange with external providers
- **Scoped Permissions**: Minimal required permissions for each service
- **Token Encryption**: Secure storage of access/refresh tokens
- **Rate Limiting**: Protection against API abuse

### Data Protection
- **Private Storage**: All files stored with private ACL by default
- **Temporary URLs**: Streaming URLs expire after specified time
- **CORS Configuration**: Restricted cross-origin access
- **Input Validation**: Comprehensive request validation

## 🚀 Performance Optimizations

### Caching Strategy
- **Redis Caching**: API response caching for frequently accessed data
- **URL Caching**: Streaming URLs cached to reduce API calls
- **Metadata Caching**: File information cached for quick access

### Background Processing
- **Celery Tasks**: Async file processing and metadata extraction
- **Batch Operations**: Bulk file synchronization
- **Retry Logic**: Automatic retry for failed operations

## 📊 Monitoring & Logging

### Error Tracking
- **Comprehensive Logging**: All integration operations logged
- **Error Handling**: Graceful error handling with user-friendly messages
- **Health Checks**: Service availability monitoring

### Analytics Integration
- **Usage Metrics**: Track integration usage patterns
- **Performance Metrics**: Monitor API response times
- **Error Rates**: Track and alert on error rates

## 🧪 Testing

### Test Coverage
```bash
# Run integration tests
python manage.py test apps.integrations

# Test specific service
python manage.py test apps.integrations.tests.test_google_drive
python manage.py test apps.integrations.tests.test_aws_s3
python manage.py test apps.integrations.tests.test_social_oauth
```

### Manual Testing
```bash
# Test Google Drive connection
python manage.py shell
>>> from apps.integrations.services.google_drive import GoogleDriveService
>>> service = GoogleDriveService()
>>> print(service.get_oauth_url('http://localhost:3000/callback'))

# Test S3 upload
>>> from apps.integrations.services.aws_s3 import AWSS3Service
>>> s3 = AWSS3Service()
>>> print(s3.generate_presigned_upload_url('test.mp4', 'video/mp4'))
```

## 🔮 Future Enhancements

### Planned Features
- **Dropbox Integration**: Add Dropbox as video source
- **OneDrive Integration**: Microsoft OneDrive support
- **YouTube Integration**: Direct YouTube video streaming
- **Twitch Integration**: Live stream integration
- **Advanced Analytics**: Detailed usage analytics
- **Webhook Support**: Real-time notifications

### Performance Improvements
- **CDN Integration**: Enhanced content delivery
- **Video Transcoding**: Automatic format optimization
- **Compression**: File size optimization
- **Streaming Optimization**: Adaptive bitrate streaming

## 📚 Documentation

### API Documentation
- **Swagger UI**: Available at `/api/docs/`
- **ReDoc**: Available at `/api/redoc/`
- **OpenAPI Schema**: Available at `/api/schema/`

### Admin Interface
- **Django Admin**: Manage integrations at `/admin/`
- **Service Configuration**: Configure OAuth providers and S3 settings
- **User Connections**: View and manage user service connections
- **File Management**: Browse and manage uploaded files

## 🎯 Production Deployment

### Environment Setup
1. Set production environment variables
2. Configure SSL certificates
3. Set up CloudFront distribution
4. Configure production OAuth redirect URIs
5. Enable monitoring and logging

### Security Checklist
- [ ] All secret keys properly configured
- [ ] HTTPS enabled for all endpoints
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] File upload limits set
- [ ] OAuth redirect URIs secured
- [ ] S3 bucket permissions configured
- [ ] CloudFront access logs enabled

---

## 🏆 Implementation Status

**✅ COMPLETE - Ready for Production!**

All three major integration systems are fully implemented:
- **Google Drive**: OAuth2, file listing, streaming URLs ✅
- **AWS S3**: Direct uploads, CDN, streaming ✅ 
- **Social OAuth**: Google, Discord, GitHub authentication ✅

**Total Features**: 15+ major integration features  
**API Endpoints**: 10+ fully functional endpoints  
**Security Features**: Enterprise-grade OAuth2 and token management  
**Performance**: Optimized with caching and async processing  

The external integrations system is production-ready and provides a solid foundation for expanding watch party capabilities with cloud storage and social authentication.

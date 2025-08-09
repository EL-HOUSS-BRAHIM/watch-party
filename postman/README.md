# Watch Party API - Comprehensive Postman Testing Suite

## 📋 Overview

This directory contains a complete Postman testing suite for the Watch Party API, providing comprehensive endpoint testing, flow validation, and performance monitoring.

## 🗂️ Collection Structure

### 1. **Watch-Party-API-Collection.json**
- **Primary collection** with all endpoint tests
- Covers all API modules: Auth, Users, Videos, Parties, Chat, Analytics, etc.
- Includes basic CRUD operations and validation
- **Tests**: 50+ endpoints across 9 modules

### 2. **Watch-Party-Advanced-Tests.json**
- **Advanced testing scenarios**
- Multi-user flow testing
- Integration tests (Google Drive, S3, etc.)
- Security testing (SQL injection, XSS, access control)
- Performance and load testing
- **Tests**: 35+ advanced scenarios

### 3. **Watch-Party-Complete-Flow.json**
- **End-to-end user journey testing**
- Complete user lifecycle from registration to party participation
- 15-step comprehensive flow validation
- **Tests**: Full user experience flow

## 🌍 Environment Files

### Local Development
- `environments/Local-Development.postman_environment.json`
- Configured for `http://localhost:8000`
- Includes local database and Redis connections

### Production
- `environments/Production.postman_environment.json`
- Configured for production endpoints
- SSL-enabled with secure token handling

## 🚀 Getting Started

### Prerequisites
1. **Postman** installed (desktop or web version)
2. **Django server** running locally or production access
3. **Database** configured and migrated
4. **Redis** server running (for real-time features)

### Quick Setup

#### Method 1: Import Collections
1. Open Postman
2. Import all three collection files:
   - `Watch-Party-API-Collection.json`
   - `Watch-Party-Advanced-Tests.json`
   - `Watch-Party-Complete-Flow.json`
3. Import environment files:
   - `environments/Local-Development.postman_environment.json`
   - `environments/Production.postman_environment.json`
4. Select appropriate environment
5. Run collections

#### Method 2: Command Line (Newman)
```bash
# Install Newman
npm install -g newman

# Run basic API tests
newman run Watch-Party-API-Collection.json \
  -e environments/Local-Development.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export results/api-test-report.html

# Run advanced tests
newman run Watch-Party-Advanced-Tests.json \
  -e environments/Local-Development.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export results/advanced-test-report.html

# Run complete flow test
newman run Watch-Party-Complete-Flow.json \
  -e environments/Local-Development.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export results/flow-test-report.html
```

## 📝 Test Categories

### 🔐 Authentication & Authorization
- User registration and login
- JWT token management
- Token refresh mechanisms
- Password reset flows
- Social authentication (Google, GitHub)
- Two-factor authentication

### 👥 User Management
- Profile creation and updates
- Friend requests and management
- User search and discovery
- Privacy settings
- Notification preferences

### 🎬 Video Management
- Video upload and processing
- Video search and filtering
- Video streaming and quality variants
- Google Drive integration
- S3 integration
- Analytics tracking

### 🎉 Party System
- Party creation and management
- Invitation system
- Real-time synchronization
- Participant management
- Party analytics

### 💬 Chat System
- Real-time messaging
- Message history
- Chat moderation
- Emoji reactions
- File sharing

### 📊 Analytics & Reporting
- User analytics
- Party analytics
- Video performance metrics
- System health monitoring
- Real-time dashboards

### 🛡️ Security Testing
- SQL injection prevention
- XSS protection
- Access control validation
- Rate limiting
- Input sanitization

### ⚡ Performance Testing
- Load testing with multiple requests
- Response time validation
- Memory usage monitoring
- Database query optimization
- Caching effectiveness

## 🔄 Automated Test Flows

### Complete User Journey (15 Steps)
1. **System Health Check** - Verify API availability
2. **User Registration** - Create new user account
3. **Profile Verification** - Validate user profile
4. **Video Upload** - Upload test video content
5. **Party Creation** - Create watch party
6. **Invite Generation** - Generate party invite codes
7. **Chat Messaging** - Send welcome message
8. **Party Start** - Begin watch session
9. **Analytics Tracking** - Verify analytics collection
10. **Dashboard Access** - Check user dashboard
11. **Notifications** - Validate notification system
12. **Video Search** - Test search functionality
13. **Global Search** - Test cross-module search
14. **Token Refresh** - Validate token refresh
15. **Final Verification** - End-to-end validation

### Multi-User Flow Testing
- User 1 creates party
- User 2 joins via invite
- Cross-user messaging
- Permission validation
- Real-time synchronization

## 📈 Test Results & Monitoring

### Key Metrics Tracked
- **Response Times**: All requests < 5 seconds
- **Success Rates**: 95%+ success rate expected
- **Error Handling**: Proper HTTP status codes
- **Data Integrity**: Accurate data persistence
- **Security**: No unauthorized access

### Expected Results
```
✅ Health Check: 200 OK
✅ Authentication: JWT tokens generated
✅ CRUD Operations: All operations successful
✅ Real-time Features: WebSocket connections
✅ Search: Accurate results returned
✅ Security: Attacks properly blocked
✅ Performance: Response times acceptable
```

## 🛠️ Customization

### Adding New Tests
1. Identify the endpoint to test
2. Create request in appropriate collection
3. Add test scripts for validation
4. Update environment variables if needed
5. Document expected behavior

### Test Script Examples

#### Basic Validation
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('id');
    pm.expect(responseJson).to.have.property('title');
});
```

#### Token Management
```javascript
// Store tokens from response
if (pm.response.json() && pm.response.json().access_token) {
    pm.collectionVariables.set('access_token', pm.response.json().access_token);
    pm.collectionVariables.set('refresh_token', pm.response.json().refresh_token);
}
```

#### Data Validation
```javascript
pm.test("User data is correct", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.email).to.eql(pm.collectionVariables.get('test_email'));
    pm.expect(responseJson.first_name).to.be.a('string');
});
```

## 🔧 Troubleshooting

### Common Issues

#### Connection Refused
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution**: Ensure Django development server is running
```bash
cd /workspaces/watch-party/back-end
python manage.py runserver
```

#### Authentication Failures
```
Error: 401 Unauthorized
```
**Solution**: Check token validity and refresh if needed

#### Database Errors
```
Error: relation does not exist
```
**Solution**: Run migrations
```bash
python manage.py migrate
```

#### Rate Limiting
```
Error: 429 Too Many Requests
```
**Solution**: Add delays between requests or adjust rate limits

### Debug Mode
Enable detailed logging by setting environment variables:
```
DEBUG=True
DJANGO_LOG_LEVEL=DEBUG
```

## 📊 Reporting

### HTML Reports
Newman generates detailed HTML reports showing:
- Test execution summary
- Individual request/response details
- Failed test analysis
- Performance metrics
- Visual charts and graphs

### CI/CD Integration
```yaml
# Example GitHub Actions workflow
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run API Tests
        run: |
          newman run postman/Watch-Party-API-Collection.json \
            -e postman/environments/Local-Development.postman_environment.json \
            --reporters cli,junit \
            --reporter-junit-export results/test-results.xml
```

## 🎯 Test Coverage

### API Endpoints Covered
- **Authentication**: 12 endpoints
- **Users**: 25 endpoints  
- **Videos**: 15 endpoints
- **Parties**: 18 endpoints
- **Chat**: 8 endpoints
- **Analytics**: 12 endpoints
- **Admin**: 15 endpoints
- **Integrations**: 10 endpoints
- **Notifications**: 12 endpoints
- **Billing**: 8 endpoints

### Total Coverage: 135+ endpoints tested

## 🚀 Advanced Features

### Performance Monitoring
- Response time tracking
- Memory usage validation
- Database query analysis
- Concurrent user simulation

### Security Validation
- Input validation testing
- Authentication bypass attempts
- Authorization testing
- Data exposure prevention

### Real-time Testing
- WebSocket connection testing
- Real-time synchronization
- Live chat functionality
- Event broadcasting

## 📚 Resources

- [Postman Documentation](https://learning.postman.com/)
- [Newman CLI Tool](https://github.com/postmanlabs/newman)
- [Watch Party API Documentation](../back-end/BACKEND-endpoints.md)
- [Django Testing Guide](https://docs.djangoproject.com/en/stable/topics/testing/)

## 🤝 Contributing

When adding new API endpoints:
1. Add corresponding tests to collections
2. Update environment variables
3. Document expected behavior
4. Add validation scripts
5. Test locally before committing

## 📞 Support

For testing issues or questions:
1. Check troubleshooting section
2. Review Django logs
3. Validate database state
4. Check Redis connectivity
5. Verify environment configuration

---

**Happy Testing! 🧪✨**

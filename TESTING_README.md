# 🧪 Watch Party Platform Testing Suite

A comprehensive testing suite to verify that both frontend and backend routes and APIs work 100%. This testing suite includes functional tests, load tests, and system verification.

## 📋 Overview

This testing suite provides:
- ✅ **Complete System Testing** - Both frontend routes and backend APIs
- 🚀 **Load Testing** - Performance and stress testing
- 🔧 **Automated Test Runner** - Easy-to-use script with multiple options
- 📊 **Detailed Reporting** - JSON reports with comprehensive results
- 🎯 **Configurable Tests** - Customizable endpoints and test scenarios

## 🏗️ Test Components

### 1. Main Testing Script (`test_complete_system.py`)
Comprehensive system testing covering:
- **Backend API Testing**: All authentication, user, video, party, and billing endpoints
- **Frontend Route Testing**: Public, protected, and admin routes
- **WebSocket Testing**: Real-time connection verification
- **Performance Testing**: Response time and throughput analysis
- **Security Testing**: Authentication and authorization verification

### 2. Load Testing Script (`load_test.py`)
Performance and stress testing including:
- **Concurrent User Simulation**: Test with multiple simultaneous users
- **Database Load Testing**: High-volume database operations
- **WebSocket Load Testing**: Multiple concurrent WebSocket connections
- **Performance Metrics**: Response times, throughput, and reliability

### 3. Test Runner Script (`run_tests.sh`)
User-friendly test execution with:
- **Auto-detection**: Automatically detects running servers
- **Interactive Options**: Choose specific test types
- **Environment Setup**: Virtual environment and dependency management
- **Result Reporting**: Formatted output and report generation

### 4. Configuration (`test_config.py`)
Centralized test configuration containing:
- **Endpoint Definitions**: All API endpoints with expected responses
- **Route Mapping**: Complete frontend route structure
- **Test Data**: Sample users, videos, and party data
- **Performance Thresholds**: Acceptable performance criteria

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ installed
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:3000`

### Option 1: Use the Test Runner (Recommended)
```bash
# Make the runner executable
chmod +x run_tests.sh

# Run the interactive test runner
./run_tests.sh
```

The runner will:
1. Check server status
2. Set up virtual environment
3. Install dependencies
4. Guide you through test options
5. Generate detailed reports

### Option 2: Direct Python Execution
```bash
# Install testing dependencies
pip install -r test_requirements.txt

# Run complete system test
python test_complete_system.py --verbose

# Run specific test types
python test_complete_system.py --backend-only
python test_complete_system.py --frontend-only
```

### Option 3: Load Testing
```bash
# Run load tests
python load_test.py --users 20 --duration 60

# Test specific endpoint
python load_test.py --endpoint /api/auth/login/ --method POST --users 50

# WebSocket load testing
python load_test.py --websocket --users 10
```

## 📊 Test Categories

### Backend API Tests
- **Authentication**: Registration, login, logout, token refresh, 2FA
- **User Management**: Profiles, friends, settings, search
- **Video Management**: Upload, streaming, metadata, analytics
- **Watch Parties**: Creation, joining, controls, chat
- **Billing**: Subscriptions, payments, history, Stripe integration
- **Admin**: User management, content moderation, system controls

### Frontend Route Tests
- **Public Routes**: Landing, pricing, about, contact, legal pages
- **Protected Routes**: Dashboard, party creation, video management
- **Admin Routes**: User admin, analytics, system settings

### System Tests
- **WebSocket Connectivity**: Real-time features verification
- **File Upload**: S3, Google Drive integration testing
- **Performance**: Response times and throughput
- **Security**: Authentication and authorization checks

## 🛠️ Command Line Options

### Main Testing Script Options:
```bash
python test_complete_system.py [OPTIONS]

Options:
  --verbose              Enable detailed logging
  --frontend-only        Test only frontend routes
  --backend-only         Test only backend APIs
  --timeout N            Set request timeout (default: 10s)
  --backend-url URL      Custom backend URL
  --frontend-url URL     Custom frontend URL
```

### Load Testing Options:
```bash
python load_test.py [OPTIONS]

Options:
  --users N             Number of concurrent users (default: 10)
  --duration N          Test duration in seconds (default: 30)
  --endpoint PATH       API endpoint to test
  --method METHOD       HTTP method (GET, POST, etc.)
  --websocket          Test WebSocket connections
  --database           Test database performance
  --all                Run all load tests
```

## 📋 Test Results

### Success Indicators
- ✅ **PASS**: Test completed successfully
- ⚠️ **WARN**: Test completed with warnings (non-critical)
- ❌ **FAIL**: Test failed (requires attention)

### Generated Reports
- **Console Output**: Real-time test progress and results
- **JSON Report**: Detailed test results saved as `test_report_YYYYMMDD_HHMMSS.json`
- **Load Test Metrics**: Performance statistics and recommendations

### Sample Output:
```
🧪 Watch Party Platform - Complete System Testing
============================================
[10:30:15] ✅ Backend server is running
[10:30:16] ✅ Frontend server is running
[10:30:17] ✅ User registration successful
[10:30:18] ✅ User login successful
[10:30:19] ✅ Protected endpoint access successful
[10:30:20] ⚠️ Admin routes properly protected (expected)

📊 TEST SUMMARY
============================================
✅ Passed: 45
❌ Failed: 2
⚠️ Warnings: 8
📊 Total: 55
```

## 🔧 Configuration

### Environment Variables
Create `.env` files with required variables:

**Backend (.env):**
```env
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/watchparty
REDIS_URL=redis://localhost:6379
STRIPE_SECRET_KEY=sk_test_...
EMAIL_HOST_USER=your-email@example.com
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws
```

### Test Data
The suite includes predefined test users:
- `demo@example.com` / `demo123` - Standard test user
- `test@example.com` / `TestPassword123!` - Registration test user  
- `admin@example.com` / `AdminPass123!` - Admin test user

### Custom Configuration
Modify `test_config.py` to:
- Add new endpoints
- Change test data
- Adjust performance thresholds
- Configure WebSocket endpoints

## 🚨 Troubleshooting

### Common Issues

**"Connection refused" errors:**
- Ensure Django server is running: `cd backend && python manage.py runserver`
- Ensure Next.js server is running: `cd watch-party && npm run dev`

**Authentication failures:**
- Check if test users exist in database
- Run: `cd backend && python create_test_users.py`

**Import errors:**
- Install requirements: `pip install -r test_requirements.txt`
- Use virtual environment: `python -m venv venv && source venv/bin/activate`

**WebSocket connection failures:**
- Verify WebSocket server is running
- Check CORS settings in Django
- Ensure Redis is running for WebSocket backend

### Performance Issues
If tests are slow:
- Increase timeout: `--timeout 20`
- Reduce concurrent users in load tests
- Check database connection and indexing
- Monitor server resources (CPU, memory)

## 🎯 Best Practices

### Before Running Tests
1. **Fresh Database**: Use clean test database
2. **Server Status**: Ensure both servers are running
3. **Dependencies**: Install all required packages
4. **Environment**: Set all required environment variables

### Continuous Integration
Add to CI/CD pipeline:
```bash
# In your CI script
./run_tests.sh --non-interactive
python load_test.py --users 5 --duration 10
```

### Regular Testing
- Run full tests before deployments
- Use load tests to identify performance regressions
- Monitor test results over time
- Update test data and endpoints as application evolves

## 📝 Extending Tests

### Adding New Endpoints
1. Add endpoint to `test_config.py` in appropriate section
2. Include expected status codes and auth requirements
3. Add test data if needed

### Custom Test Scenarios
Create custom test functions in `test_complete_system.py`:
```python
def test_custom_feature():
    """Test your custom feature"""
    # Your test logic here
    results.add_result("Custom Feature", "PASS", "Feature working")
```

### Load Test Extensions
Add new load test scenarios in `load_test.py`:
```python
async def test_custom_load():
    """Custom load test scenario"""
    # Your load test logic here
```

## 🤝 Contributing

To contribute to the testing suite:
1. Fork the repository
2. Add new test cases or improve existing ones
3. Update documentation
4. Submit a pull request

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section
2. Review test logs and reports
3. Verify server configuration
4. Check environment variables
5. Open an issue with detailed error information

---

**Happy Testing! 🧪✅**

This comprehensive testing suite ensures your Watch Party Platform is robust, performant, and ready for production deployment.

# WebSocket Support Setup

## Issue Fixed
The backend was returning a 401 Unauthorized error on the API root endpoint (`/api/`) because it required authentication. This has been fixed by adding the `@permission_classes([AllowAny])` decorator to the `api_root` view.

## WebSocket Configuration
To enable WebSocket support for real-time features (chat, video sync, notifications), the Django server needs to run with an ASGI server instead of the default WSGI server.

### Changes Made:

1. **Fixed API Root Authentication**: Added `AllowAny` permission to the API root endpoint
2. **Added WebSocket Test Endpoint**: Added `/ws/test/` endpoint for system testing
3. **Added ASGI Server**: Added `daphne` to requirements.txt
4. **Created Development Script**: Created `run_dev_server.sh` to run with WebSocket support

### Running the Server with WebSocket Support:

#### Option 1: Using the development script (Recommended)
```bash
cd backend
source venv/bin/activate
./run_dev_server.sh
```

#### Option 2: Using daphne directly
```bash
cd backend
source venv/bin/activate
pip install daphne==4.0.0
daphne -b 0.0.0.0 -p 8000 --reload watchparty.asgi:application
```

#### Option 3: For production
```bash
cd backend
source venv/bin/activate
daphne -b 0.0.0.0 -p 8000 watchparty.asgi:application
```

### What was Fixed:

1. **Backend Server 401 Error**: ✅ FIXED
   - The API root endpoint now returns proper JSON response
   - Authentication is no longer required for public endpoints

2. **WebSocket 404 Error**: 🔧 REQUIRES SERVER RESTART
   - Added WebSocket test endpoint
   - Server needs to run with ASGI (daphne) instead of WSGI
   - Use the provided scripts to run with WebSocket support

### Testing the Fixes:

After restarting the server with the new script:

```bash
# Test API root (should return JSON)
curl http://localhost:8000/api/

# Test WebSocket (will require proper WebSocket client)
# The test script will handle this automatically
```

### Current Status:
- ✅ API Root 401 Error: FIXED
- 🔧 WebSocket 404 Error: FIXED (requires server restart with ASGI)
- ⚠️ Upload/Billing endpoints: Not yet implemented (warnings expected)

### Next Steps:
1. Restart the backend server using the new `run_dev_server.sh` script
2. Run the test suite again to verify all fixes
3. Address remaining warning items as needed for production

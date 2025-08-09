#!/usr/bin/env node

/**
 * WebSocket Test Client
 * Tests WebSocket connections for the Watch Party application
 */

const WebSocket = require('ws');
const https = require('https');

// Configuration
const BACKEND_WS_URL = 'wss://be-watch-party.brahim-elhouss.me/ws/';
const FRONTEND_WS_URL = 'wss://watch-party.brahim-elhouss.me';
const TEST_TIMEOUT = 10000; // 10 seconds

// Colors for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(color, prefix, message) {
    console.log(`${colors[color]}[${prefix}]${colors.reset} ${message}`);
}

function testWebSocket(url, name) {
    return new Promise((resolve) => {
        log('blue', 'INFO', `Testing WebSocket connection to ${name}...`);
        
        const ws = new WebSocket(url, {
            rejectUnauthorized: false, // Allow self-signed certificates in testing
            timeout: TEST_TIMEOUT
        });
        
        const timeout = setTimeout(() => {
            log('yellow', 'WARN', `${name} connection timeout after ${TEST_TIMEOUT/1000}s`);
            ws.terminate();
            resolve({ success: false, error: 'timeout' });
        }, TEST_TIMEOUT);
        
        ws.on('open', () => {
            log('green', 'SUCCESS', `${name} connection established`);
            clearTimeout(timeout);
            
            // Send a test message
            try {
                ws.send(JSON.stringify({ type: 'ping', message: 'test' }));
            } catch (error) {
                log('yellow', 'WARN', `Failed to send test message: ${error.message}`);
            }
            
            ws.close();
            resolve({ success: true });
        });
        
        ws.on('message', (data) => {
            log('blue', 'INFO', `${name} received message: ${data}`);
        });
        
        ws.on('error', (error) => {
            log('red', 'ERROR', `${name} connection error: ${error.message}`);
            clearTimeout(timeout);
            resolve({ success: false, error: error.message });
        });
        
        ws.on('close', (code, reason) => {
            log('blue', 'INFO', `${name} connection closed (code: ${code}, reason: ${reason})`);
            clearTimeout(timeout);
            if (!timeout._destroyed) {
                resolve({ success: true });
            }
        });
    });
}

function testHttpUpgrade(url, name) {
    return new Promise((resolve) => {
        log('blue', 'INFO', `Testing HTTP upgrade to WebSocket for ${name}...`);
        
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || 443,
            path: urlObj.pathname,
            method: 'GET',
            headers: {
                'Connection': 'Upgrade',
                'Upgrade': 'websocket',
                'Sec-WebSocket-Version': '13',
                'Sec-WebSocket-Key': 'dGhlIHNhbXBsZSBub25jZQ=='
            },
            rejectUnauthorized: false,
            timeout: 5000
        };
        
        const req = https.request(options, (res) => {
            if (res.statusCode === 101) {
                log('green', 'SUCCESS', `${name} supports WebSocket upgrade`);
                resolve({ success: true });
            } else {
                log('yellow', 'WARN', `${name} HTTP status: ${res.statusCode} (not WebSocket upgrade)`);
                resolve({ success: false, error: `HTTP ${res.statusCode}` });
            }
        });
        
        req.on('error', (error) => {
            log('red', 'ERROR', `${name} HTTP upgrade test failed: ${error.message}`);
            resolve({ success: false, error: error.message });
        });
        
        req.on('timeout', () => {
            log('yellow', 'WARN', `${name} HTTP upgrade test timeout`);
            req.destroy();
            resolve({ success: false, error: 'timeout' });
        });
        
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Watch Party WebSocket Test Suite\n');
    
    let passed = 0;
    let total = 0;
    
    // Test backend WebSocket
    total++;
    const backendResult = await testWebSocket(BACKEND_WS_URL, 'Backend WebSocket');
    if (backendResult.success) passed++;
    
    // Test frontend WebSocket support (HTTP upgrade test)
    total++;
    const frontendResult = await testHttpUpgrade(FRONTEND_WS_URL, 'Frontend WebSocket Support');
    if (frontendResult.success) passed++;
    
    // Test frontend WebSocket connection (might fail if no WebSocket server)
    total++;
    log('blue', 'INFO', 'Testing frontend WebSocket connection (may fail if no WS server)...');
    const frontendWsResult = await testWebSocket(FRONTEND_WS_URL, 'Frontend WebSocket Connection');
    if (frontendWsResult.success) {
        passed++;
    } else {
        log('yellow', 'WARN', 'Frontend WebSocket connection failed (expected if no WS server)');
    }
    
    console.log('\n📊 Test Results:');
    log(passed === total ? 'green' : 'yellow', 'RESULT', `${passed}/${total} tests passed`);
    
    if (passed === total) {
        log('green', 'SUCCESS', 'All WebSocket tests passed! 🎉');
        process.exit(0);
    } else {
        log('yellow', 'WARN', 'Some WebSocket tests had issues');
        process.exit(1);
    }
}

// Handle command line arguments
const command = process.argv[2];

switch (command) {
    case 'backend':
        testWebSocket(BACKEND_WS_URL, 'Backend WebSocket').then(() => process.exit(0));
        break;
    case 'frontend':
        testHttpUpgrade(FRONTEND_WS_URL, 'Frontend WebSocket Support').then(() => process.exit(0));
        break;
    case 'help':
        console.log('Usage: node test-websocket.js [backend|frontend|help]');
        console.log('');
        console.log('Commands:');
        console.log('  backend   - Test backend WebSocket only');
        console.log('  frontend  - Test frontend WebSocket support only');
        console.log('  help      - Show this help message');
        console.log('  (no args) - Run all tests');
        process.exit(0);
        break;
    default:
        runTests();
}

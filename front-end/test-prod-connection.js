#!/usr/bin/env node

/**
 * Simple script to test connection to production backend
 */

const https = require('https');

const BACKEND_URL = 'https://be-watch-party.brahim-elhouss.me';

function testConnection(url, path = '/health/') {
  return new Promise((resolve, reject) => {
    const fullUrl = url + path;
    console.log(`Testing connection to: ${fullUrl}`);
    
    const req = https.get(fullUrl, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function main() {
  console.log('🔍 Testing connection to production backend...\n');
  
  try {
    // Test health endpoint
    const healthResult = await testConnection(BACKEND_URL, '/health/');
    console.log('✅ Health check passed!');
    console.log(`   Status: ${healthResult.status}`);
    console.log(`   Response: ${healthResult.data.substring(0, 200)}...\n`);
    
    // Test API root
    const apiResult = await testConnection(BACKEND_URL, '/api/');
    console.log('✅ API root accessible!');
    console.log(`   Status: ${apiResult.status}`);
    console.log(`   Response: ${apiResult.data.substring(0, 200)}...\n`);
    
    console.log('🎉 Production backend is accessible!');
    console.log('\n📝 Environment configuration:');
    console.log(`   NEXT_PUBLIC_API_URL=https://be-watch-party.brahim-elhouss.me`);
    console.log(`   NEXT_PUBLIC_WS_URL=wss://be-watch-party.brahim-elhouss.me/ws`);
    
  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error(`   Error: ${error.message}`);
    console.error('\n🔧 Please check:');
    console.error('   1. Backend is running and accessible');
    console.error('   2. SSL certificate is valid');
    console.error('   3. CORS configuration allows frontend domain');
    console.error('   4. Network connectivity');
  }
}

main();

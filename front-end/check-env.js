#!/usr/bin/env node

/**
 * Check frontend environment configuration
 */

// Read the .env.local file
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');

console.log('🔍 Checking frontend environment configuration...\n');

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('✅ .env.local file exists!');
  console.log('📄 Contents:');
  console.log(envContent);
} else {
  console.log('❌ .env.local file not found!');
}

console.log('\n🔧 To start the frontend with production backend:');
console.log('   pnpm dev');
console.log('\n🏗️  To build for production:');
console.log('   pnpm build');
console.log('\n🚀 To start production server:');
console.log('   pnpm start');

console.log('\n📝 Note: TypeScript errors need to be fixed before building.');
console.log('   Run "npx next lint" to see all issues.');

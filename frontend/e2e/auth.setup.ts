import { test as setup } from '@playwright/test';

/**
 * Authentication setup for Playwright tests
 * 
 * This file can be used to create a pre-authenticated state
 * that can be reused across multiple tests to avoid repeated logins.
 * 
 * To use this:
 * 1. Run: npx playwright test auth.setup.ts --project=chromium
 * 2. This will create an auth.json file with the authenticated session
 * 3. Configure your tests to use this state:
 *    test.use({ storageState: 'e2e/auth.json' });
 */

const authFile = 'e2e/auth.json';

setup('authenticate with Google', async ({ page }) => {
  // Go to login page
  await page.goto('/login');
  
  // Click on Google login button
  const googleButton = page.getByRole('button', { name: /continue with google|sign in with google/i });
  await googleButton.click();
  
  // Wait for Google OAuth page
  await page.waitForURL(/accounts.google.com/, { timeout: 10000 });
  
  console.log('⚠️  Please complete Google OAuth login in the browser...');
  console.log('⏱️  Waiting up to 60 seconds for authentication...');
  
  // Wait for redirect back to app after successful auth
  await page.waitForURL(/.*dashboard.*/i, { timeout: 60000 });
  
  console.log('✅ Authentication successful!');
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  
  console.log(`💾 Saved authentication state to ${authFile}`);
});

/**
 * Alternative: Programmatic authentication (if your backend supports it)
 */
setup('authenticate with test credentials', async ({ page, request }) => {
  // This assumes you have a test endpoint that can create sessions
  // without going through OAuth flow (useful for CI/CD)
  
  const response = await request.post('/api/auth/test-login', {
    data: {
      email: 'admin@watchparty.local',
      password: 'admin123!'
    }
  });
  
  if (response.ok()) {
    // Navigate to dashboard to establish session
    await page.goto('/dashboard');
    
    // Verify we're logged in
    await page.waitForURL(/.*dashboard.*/i);
    
    // Save the session state
    await page.context().storageState({ path: authFile });
    
    console.log('✅ Test authentication successful!');
  } else {
    throw new Error('Test authentication failed');
  }
});

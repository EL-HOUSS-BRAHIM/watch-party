import { test, expect } from '@playwright/test';

/**
 * E2E Test: Google OAuth Login → Dashboard → Google Drive Integration
 * 
 * This test simulates:
 * 1. Logging in with Google OAuth
 * 2. Navigating to the dashboard
 * 3. Going to the integrations page
 * 4. Connecting Google Drive
 * 
 * Note: For Google OAuth to work in tests, you'll need to either:
 * - Use a test Google account with saved credentials
 * - Mock the OAuth flow
 * - Use Playwright's authentication state persistence
 */

test.describe('Google Drive Integration Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the home page
    await page.goto('/');
  });

  test('should login with Google and connect Google Drive', async ({ page, context }) => {
    // Step 1: Click on the login/sign-in button
    await test.step('Navigate to login', async () => {
      // Look for login button - adjust selector based on your actual UI
      const loginButton = page.getByRole('link', { name: /sign in|login/i });
      await expect(loginButton).toBeVisible();
      await loginButton.click();
      
      // Wait for navigation to login page
      await page.waitForURL(/.*\/(login|auth|signin).*/i);
    });

    // Step 2: Login with Google OAuth
    await test.step('Login with Google OAuth', async () => {
      // Find and click the "Sign in with Google" button
      const googleButton = page.getByRole('button', { name: /continue with google|sign in with google/i });
      await expect(googleButton).toBeVisible();
      
      // Click Google login button - this will open OAuth popup/redirect
      await googleButton.click();
      
      // Wait for Google OAuth page to load
      // Note: In a real scenario, you'd need to handle the OAuth flow
      // For automated testing, consider using saved authentication state
      // or a test user with pre-authorized access
      
      // Wait for potential popup or redirect
      await page.waitForTimeout(2000);
      
      // Check if we're on Google's OAuth page
      const currentUrl = page.url();
      
      if (currentUrl.includes('accounts.google.com')) {
        console.log('Google OAuth page detected. Manual intervention may be required.');
        console.log('For automated testing, consider:');
        console.log('1. Using Playwright auth storage with a pre-authenticated session');
        console.log('2. Mocking the OAuth endpoints');
        console.log('3. Using a test OAuth provider');
        
        // Wait longer for manual OAuth completion in development
        await page.waitForTimeout(30000);
      }
      
      // Wait for successful redirect back to the app
      await page.waitForURL(/.*dashboard.*/i, { timeout: 60000 });
    });

    // Step 3: Verify we're logged in and on dashboard
    await test.step('Verify dashboard access', async () => {
      await expect(page).toHaveURL(/.*dashboard.*/i);
      
      // Look for dashboard indicators (adjust based on your UI)
      const dashboardHeading = page.getByRole('heading', { name: /dashboard|welcome/i });
      await expect(dashboardHeading).toBeVisible({ timeout: 10000 });
    });

    // Step 4: Navigate to integrations page
    await test.step('Navigate to integrations', async () => {
      // Look for integrations link in navigation
      // Try multiple possible selectors
      const integrationsLink = page.locator('a[href*="integration"]').first()
        .or(page.getByRole('link', { name: /integration/i }))
        .or(page.getByText(/integration/i));
      
      await expect(integrationsLink).toBeVisible({ timeout: 10000 });
      await integrationsLink.click();
      
      // Wait for integrations page to load
      await page.waitForURL(/.*integration.*/i);
    });

    // Step 5: Connect Google Drive
    await test.step('Connect Google Drive', async () => {
      // Look for Google Drive connection button
      const driveConnectButton = page.getByRole('button', { name: /connect.*google drive|authorize.*google drive/i })
        .or(page.locator('button:has-text("Google Drive")').filter({ hasText: /connect|authorize/i }));
      
      await expect(driveConnectButton).toBeVisible({ timeout: 10000 });
      await driveConnectButton.click();
      
      // Wait for OAuth flow (might open new window/popup)
      await page.waitForTimeout(2000);
      
      // Check if we need to handle Google Drive OAuth
      const pages = context.pages();
      console.log(`Active pages: ${pages.length}`);
      
      // If a new popup opened, handle it
      if (pages.length > 1) {
        const popup = pages[pages.length - 1];
        await popup.waitForLoadState();
        
        // Handle Google Drive permissions page
        if (popup.url().includes('accounts.google.com')) {
          console.log('Google Drive OAuth popup detected. Manual intervention may be required.');
          await popup.waitForTimeout(30000);
        }
      }
      
      // Wait for success indication
      await page.waitForTimeout(3000);
      
      // Verify Google Drive is connected
      // Look for success message or connected status
      const successIndicator = page.getByText(/connected|authorized|successfully/i)
        .or(page.locator('[data-status="connected"]'))
        .or(page.getByRole('status', { name: /connected/i }));
      
      await expect(successIndicator).toBeVisible({ timeout: 15000 });
      
      console.log('✅ Google Drive integration successful!');
    });
  });

  test('should handle Google Drive integration with saved auth state', async ({ page, context }) => {
    /**
     * This test uses a pre-authenticated session to bypass OAuth.
     * To use this approach:
     * 
     * 1. First, authenticate manually and save the state:
     *    npx playwright codegen --save-storage=auth.json
     * 
     * 2. Then use it in your test configuration:
     *    test.use({ storageState: 'auth.json' });
     */
    
    test.skip(!process.env.USE_AUTH_STATE, 'Requires pre-authenticated state');
    
    // With saved auth state, you should already be logged in
    await page.goto('/dashboard');
    
    // Verify we're logged in
    await expect(page).toHaveURL(/.*dashboard.*/i);
    
    // Navigate to integrations
    const integrationsLink = page.getByRole('link', { name: /integration/i });
    await integrationsLink.click();
    await page.waitForURL(/.*integration.*/i);
    
    // Connect Google Drive
    const driveConnectButton = page.getByRole('button', { name: /connect.*google drive/i });
    await driveConnectButton.click();
    
    // Wait for connection success
    const successIndicator = page.getByText(/connected|success/i);
    await expect(successIndicator).toBeVisible({ timeout: 15000 });
  });
});

test.describe('Alternative: Mock OAuth Flow', () => {
  test('should connect Google Drive with mocked OAuth', async ({ page, context }) => {
    /**
     * This approach mocks the OAuth flow to avoid actual Google authentication.
     * Useful for CI/CD pipelines.
     */
    
    // Mock the OAuth callback endpoint
    await page.route('**/api/auth/google/callback**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          user: {
            email: 'test@example.com',
            name: 'Test User'
          }
        })
      });
    });
    
    // Mock the Google Drive authorization endpoint
    await page.route('**/api/integrations/google-drive/authorize**', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Google Drive connected successfully'
        })
      });
    });
    
    // Now run the flow with mocked endpoints
    await page.goto('/login');
    
    // Click Google login (will be intercepted)
    const googleButton = page.getByRole('button', { name: /google/i });
    await googleButton.click();
    
    // Should redirect to dashboard after mock auth
    await page.waitForURL(/.*dashboard.*/i);
    
    // Navigate to integrations
    await page.goto('/dashboard/integrations');
    
    // Click Google Drive connect (will be intercepted)
    const driveButton = page.getByRole('button', { name: /google drive/i });
    await driveButton.click();
    
    // Verify success
    const successMessage = page.getByText(/successfully|connected/i);
    await expect(successMessage).toBeVisible();
  });
});

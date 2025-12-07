# E2E Tests

This directory contains end-to-end tests using Playwright.

## Running Tests

```bash
# Install Playwright browsers (first time only)
npm run playwright:install

# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive)
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/google-drive-integration.spec.ts
```

## Authentication Setup

### Option 1: Manual OAuth (Development)
The test will pause at OAuth screens, allowing you to manually authenticate. This is useful for development but not suitable for CI/CD.

### Option 2: Saved Authentication State
1. Authenticate once and save the session:
   ```bash
   npx playwright test e2e/auth.setup.ts
   ```
2. This creates `e2e/auth.json` with your session
3. Tests can reuse this session to skip login

### Option 3: Test Credentials (Recommended for CI)
Use the debug account from AGENT_ONBOARDING.md:
- Email: `admin@watchparty.local`
- Password: `admin123!`

The test can authenticate programmatically using these credentials.

### Option 4: Mock OAuth Flow
For CI/CD, mock the OAuth endpoints to avoid real Google authentication.

## Test Files

- `google-drive-integration.spec.ts` - Tests Google OAuth login and Google Drive connection flow
- `auth.setup.ts` - Helper for creating reusable authentication sessions

## Environment Variables

Create `frontend/.env.local` with:
```
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8001
USE_AUTH_STATE=true  # To use saved auth state
```

## Troubleshooting

**OAuth timeouts**: Increase timeout in the test or use saved auth state.

**Browser not installed**: Run `npm run playwright:install`

**Session expired**: Delete `e2e/auth.json` and re-authenticate.

## CI/CD Integration

For automated testing in CI:
1. Use mocked OAuth endpoints (see `Alternative: Mock OAuth Flow` in the test)
2. Or use test credentials with backend test authentication endpoint
3. Or run Playwright with `--project=chromium --headed=false`

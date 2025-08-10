# Frontend Fix Todo List

Based on the frontend analysis, here are the critical steps to make the frontend production-ready:

## Step 1: Fix Build Configuration & Errors
**Priority: CRITICAL**
- [ ] Remove `ignoreBuildErrors: true` and `ignoreDuringBuilds: true` from `next.config.mjs`
- [ ] Fix TypeScript import/export errors:
  - [ ] Fix `integrationsAPI` import error
  - [ ] Fix `VideoAnalyticsView` missing export
  - [ ] Resolve any other build warnings that appear
- [ ] Re-enable ESLint build blocking
- [ ] Run `npm run build` to ensure clean build

## Step 2: Dependency Management & Security
**Priority: HIGH**
- [ ] Pin all `latest` dependencies to exact versions in `package.json`
- [ ] Remove unused dependencies (audit with `npm ls` and remove unused imports)
- [ ] Add missing error monitoring:
  - [ ] Install and configure Sentry for frontend error tracking
  - [ ] Add error boundary components for graceful failure handling

## Step 3: API Endpoint Alignment & Error Handling
**Priority: HIGH**
- [ ] Review and fix API endpoint mismatches:
  - [ ] Remove or implement `events` endpoints (no backend support found)
  - [ ] Verify all API endpoints in `lib/api/endpoints.ts` match backend
- [ ] Improve error handling:
  - [ ] Add global error boundary
  - [ ] Implement 401 token refresh logic in auth context
  - [ ] Add network failure fallback UI states

## Step 4: Performance Optimization
**Priority: MEDIUM**
- [ ] Implement code splitting for heavy pages:
  - [ ] Add dynamic imports for admin dashboard components
  - [ ] Add dynamic imports for analytics visualization components
  - [ ] Use React.lazy for large modals and rarely-used components
- [ ] Bundle analysis:
  - [ ] Add `analyze` script to package.json using webpack-bundle-analyzer
  - [ ] Optimize largest route bundles (target <180kB first-load JS)

## Step 5: Testing & Quality Assurance
**Priority: MEDIUM**
- [ ] Add essential tests:
  - [ ] Unit tests for auth context and API client error handling
  - [ ] Component tests for party joining flow and video upload forms
  - [ ] End-to-end tests for core user flows (login, create party, join party)
- [ ] Add test scripts to package.json:
  - [ ] `test:ci` with coverage thresholds
  - [ ] `type-check` script for CI validation

## Step 6: Security & Accessibility
**Priority: MEDIUM**
- [ ] Security improvements:
  - [ ] Review token storage (prefer httpOnly cookies over localStorage)
  - [ ] Add content sanitization for any user-generated HTML
  - [ ] Coordinate with backend team on CSP headers
- [ ] Accessibility:
  - [ ] Add axe testing integration for automated a11y checks
  - [ ] Add skip-to-content link for keyboard navigation
  - [ ] Audit color contrast in dark theme

## Verification Checklist
After completing the above steps:
- [ ] `npm run build` completes without errors or warnings
- [ ] `npm run type-check` passes (add this script if missing)
- [ ] All API calls work without 404 errors
- [ ] Core user flows work in development
- [ ] Bundle size is optimized (check with analyzer)
- [ ] Error monitoring is capturing issues
- [ ] Tests pass and provide adequate coverage

## Quick Wins (Can be done in parallel)
- [ ] Add `.env.example` file for environment variable documentation
- [ ] Update README with current setup instructions
- [ ] Add bundle analyzer npm script for ongoing monitoring
- [ ] Set up Renovate or Dependabot for dependency updates

---

**Note**: Focus on Steps 1-3 first as they are blocking issues for production deployment. Steps 4-6 are important for long-term maintainability but not deployment blockers.

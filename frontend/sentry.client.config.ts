/**
 * Sentry Client Configuration
 * Error tracking and performance monitoring for browser
 */

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing.
  // Adjust this value in production
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Capture Replay for 10% of all sessions,
  // plus 100% of sessions with an error
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],

  // Debug mode
  debug: process.env.NODE_ENV === 'development',

  // Environment
  environment: process.env.NODE_ENV || 'development',

  // Ignore specific errors
  ignoreErrors: [
    'ResizeObserver loop',
    'Non-Error promise rejection',
  ],

  // Custom breadcrumbs for video sync events
  beforeBreadcrumb(breadcrumb, hint) {
    // Add custom breadcrumbs for WebSocket events
    if (breadcrumb.category === 'console') {
      const message = breadcrumb.message || '';
      if (message.includes('[WebSocket]') || message.includes('[VideoPlayer]') || message.includes('[SyncedVideoPlayer]')) {
        breadcrumb.level = 'info';
        breadcrumb.category = 'app.sync';
      }
    }
    return breadcrumb;
  },
});

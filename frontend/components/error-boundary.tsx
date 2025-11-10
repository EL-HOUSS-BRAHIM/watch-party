/**
 * Error Boundary Components
 * Wraps components to catch and report errors to Sentry
 */

'use client';

import React, { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  context?: string;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic Error Boundary
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { context, onError } = this.props;

    // Log to Sentry with context
    Sentry.withScope((scope) => {
      scope.setContext('errorBoundary', {
        component: context || 'unknown',
        componentStack: errorInfo.componentStack,
      });
      Sentry.captureException(error);
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    console.error(`[ErrorBoundary ${context || ''}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong</h2>
            <p className="text-white/60 mb-4">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-brand-blue rounded-lg text-white font-medium hover:bg-brand-blue-dark transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Video Player Error Boundary
 */
export function VideoPlayerErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Add video player specific context
    Sentry.withScope((scope) => {
      scope.setTag('component', 'video-player');
      scope.setContext('video', {
        error: error.message,
        stack: errorInfo.componentStack,
      });
      
      // Check for common video errors
      if (error.message.includes('codec') || error.message.includes('format')) {
        scope.setTag('error_type', 'codec_unsupported');
      } else if (error.message.includes('network') || error.message.includes('load')) {
        scope.setTag('error_type', 'network_error');
      }
    });
  };

  return (
    <ErrorBoundary
      context="VideoPlayer"
      onError={handleError}
      fallback={
        <div className="flex items-center justify-center h-full bg-black/80">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📹</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Video Player Error</h3>
            <p className="text-white/60 mb-4">
              Unable to load the video player. This might be due to:
            </p>
            <ul className="text-white/50 text-sm text-left max-w-sm mx-auto mb-4 space-y-1">
              <li>• Unsupported video format</li>
              <li>• Network connection issues</li>
              <li>• Browser compatibility problems</li>
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-blue rounded-lg text-white font-medium hover:bg-brand-blue-dark transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * WebSocket Error Boundary
 */
export function WebSocketErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    Sentry.withScope((scope) => {
      scope.setTag('component', 'websocket');
      scope.setContext('websocket', {
        error: error.message,
        stack: errorInfo.componentStack,
      });
      
      // Check for WebSocket specific errors
      if (error.message.includes('connection') || error.message.includes('connect')) {
        scope.setTag('error_type', 'connection_failed');
      } else if (error.message.includes('token') || error.message.includes('auth')) {
        scope.setTag('error_type', 'authentication_failed');
      }
    });
  };

  return (
    <ErrorBoundary
      context="WebSocket"
      onError={handleError}
      fallback={
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">🔌</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Connection Error</h3>
            <p className="text-white/60 mb-4">
              Unable to establish real-time connection.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-brand-blue rounded-lg text-white font-medium hover:bg-brand-blue-dark transition-colors"
            >
              Retry Connection
            </button>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

/**
 * Party Layout Error Boundary
 */
export function PartyErrorBoundary({ children }: { children: ReactNode }) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    Sentry.withScope((scope) => {
      scope.setTag('component', 'party-layout');
      scope.setContext('party', {
        error: error.message,
        stack: errorInfo.componentStack,
      });
    });
  };

  return (
    <ErrorBoundary
      context="PartyLayout"
      onError={handleError}
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Party Error</h3>
            <p className="text-white/60 mb-4">
              Something went wrong while loading the party.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-brand-blue rounded-lg text-white font-medium hover:bg-brand-blue-dark transition-colors"
              >
                Reload Party
              </button>
              <button
                onClick={() => window.location.href = '/dashboard/parties'}
                className="px-4 py-2 bg-white/10 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
              >
                Back to Parties
              </button>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ErrorBoundary>
  );
}

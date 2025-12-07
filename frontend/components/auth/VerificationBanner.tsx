'use client';

import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { useState } from 'react';
import { authApi } from '@/lib/api-client';

export default function VerificationBanner() {
  const { user } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if user is verified or banner is dismissed
  if (!user || user.is_verified || isDismissed) {
    return null;
  }

  const handleResend = async () => {
    if (!user.email) return;

    setIsResending(true);
    setMessage('');

    try {
      const response = await authApi.resendVerificationOTP({ email: user.email });
      
      if (response.success) {
        setMessage('✓ Verification code sent! Check your email.');
      } else {
        setMessage('Failed to send code. Please try again.');
      }
    } catch (_error) {
      setMessage('Failed to send code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold">
                Email Verification Required
              </p>
              <p className="text-sm text-white/90">
                {message || 'Please verify your email to access all features'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/verify-email"
              className="bg-white text-orange-600 px-4 py-2 rounded-lg font-medium hover:bg-orange-50 transition-colors text-sm"
            >
              Verify Now
            </Link>
            
            <button
              onClick={handleResend}
              disabled={isResending}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="ml-2 p-1 hover:bg-white/20 rounded transition-colors"
              aria-label="Dismiss banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

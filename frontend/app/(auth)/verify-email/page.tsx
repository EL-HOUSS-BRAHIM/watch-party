'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { authApi } from '@/lib/api-client';
import Link from 'next/link';

export default function VerifyEmailPage() {
  const router = useRouter();
  const { user, refresh } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if already verified
  useEffect(() => {
    if (user?.is_verified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    
    setOtp(newOtp);
    
    // Focus last filled input or next empty one
    const lastFilledIndex = Math.min(pastedData.length - 1, 5);
    inputRefs.current[lastFilledIndex]?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    if (!user?.email) {
      setError('Email not found. Please log in again.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await authApi.verifyEmailOTP({
        email: user.email,
        otp_code: otpCode,
      });

      if (response.success) {
        setSuccess('Email verified successfully! Redirecting...');
        await refresh(); // Refresh user data
        setTimeout(() => router.push('/dashboard'), 1500);
      } else {
        setError(response.message || 'Verification failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      setError(err.message || 'Failed to verify email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !user?.email) return;

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const response = await authApi.resendVerificationOTP({
        email: user.email,
      });

      if (response.success) {
        setSuccess('Verification code sent! Please check your email.');
        setCanResend(false);
        setResendCountdown(60);
        setOtp(['', '', '', '', '', '']);
      } else {
        setError(response.message || 'Failed to resend code');
      }
    } catch (err: any) {
      console.error('Resend error:', err);
      setError(err.message || 'Failed to resend verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Please log in to verify your email.</p>
          <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Verify Your Email
        </h1>
        <p className="text-center text-gray-600 mb-8">
          We sent a 6-digit code to<br />
          <span className="font-medium text-gray-800">{user.email}</span>
        </p>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm text-center">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm text-center">{error}</p>
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                disabled={isSubmitting}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.join('').length !== 6}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center">
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isSubmitting}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm disabled:opacity-50"
            >
              Resend Code
            </button>
          ) : (
            <p className="text-gray-500 text-sm">
              Resend code in {resendCountdown}s
            </p>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Didn't receive the code? Check your spam folder or{' '}
            <Link href="/support" className="text-purple-600 hover:text-purple-700 font-medium">
              contact support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

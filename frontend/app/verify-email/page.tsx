"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"
import {
  Mail,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  RefreshCw
} from "lucide-react"

interface VerificationResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    isVerified: boolean
  }
}

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, refreshUser } = useAuth()
  const { toast } = useToast()

  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired' | 'invalid'>('loading')
  const [message, setMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(true)
  const [countdown, setCountdown] = useState(0)

  const token = searchParams.get('token')
  const email = searchParams.get('email')

  useEffect(() => {
    // If user is already verified, redirect to dashboard
    if (user?.isVerified) {
      router.push('/dashboard')
      return
    }

    // Verify email token if provided
    if (token) {
      verifyEmailToken(token)
    } else {
      setVerificationStatus('invalid')
      setMessage('No verification token provided. Please check your email for the verification link.')
    }
  }, [token, user])

  useEffect(() => {
    // Countdown timer for resend button
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [countdown])

  const verifyEmailToken = async (verificationToken: string) => {
    try {
      setVerificationStatus('loading')
      
      await authAPI.verifyEmail(verificationToken)

      setVerificationStatus('success')
      setMessage('Your email has been successfully verified!')
      
      // Refresh user data to update verification status
      await refreshUser()
      
      toast({
        title: "Email Verified",
        description: "Your email has been successfully verified. Welcome!",
      })

      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 3000)
    } catch (error: any) {
      console.error('Email verification error:', error)
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.detail || 
                          error?.message

      if (error?.response?.status === 400 || errorMessage?.includes('expired')) {
        setVerificationStatus('expired')
        setMessage('The verification link has expired.')
      } else {
        setVerificationStatus('error')
        setMessage(errorMessage || 'Failed to verify email. Please try again.')
      }
    }
  }

  const resendVerificationEmail = async () => {
    if (!canResend || isResending) return

    setIsResending(true)
    setCanResend(false)

    try {
      await authAPI.resendVerification(email || user?.email || '')

      toast({
        title: "Email Sent",
        description: "A new verification email has been sent to your inbox.",
      })
      setCountdown(60) // 60 second cooldown
    } catch (error: any) {
      console.error('Resend verification error:', error)
      
      const errorMessage = error?.response?.data?.message || 
                          error?.response?.data?.detail || 
                          error?.message || 
                          "Failed to send verification email. Please try again."

      toast({
        title: "Failed to Send",
        description: errorMessage,
        variant: "destructive",
      })
      setCanResend(true)
    } finally {
      setIsResending(false)
    }
  }

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-500" />
      case 'error':
      case 'expired':
      case 'invalid':
        return <AlertCircle className="h-16 w-16 text-red-500" />
      default:
        return <Mail className="h-16 w-16 text-gray-400" />
    }
  }

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying Your Email...'
      case 'success':
        return 'Email Verified!'
      case 'expired':
        return 'Verification Link Expired'
      case 'invalid':
        return 'Invalid Verification Link'
      case 'error':
      default:
        return 'Verification Failed'
    }
  }

  const getStatusDescription = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Please wait while we verify your email address.'
      case 'success':
        return 'Your email has been successfully verified. You will be redirected to your dashboard shortly.'
      case 'expired':
        return 'The verification link has expired. Please request a new one.'
      case 'invalid':
        return 'The verification link is invalid or malformed.'
      case 'error':
      default:
        return 'We encountered an error while verifying your email.'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Email Verification
          </h1>
          <p className="text-gray-600">
            {email ? `Verifying ${email}` : 'Verifying your email address'}
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <CardTitle className="text-xl">
              {getStatusTitle()}
            </CardTitle>
            <CardDescription>
              {getStatusDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {message && (
              <Alert variant={verificationStatus === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {verificationStatus === 'success' && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Redirecting to dashboard in 3 seconds...
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="w-full"
                >
                  Go to Dashboard Now
                </Button>
              </div>
            )}

            {(verificationStatus === 'expired' || verificationStatus === 'error') && (
              <div className="space-y-4">
                <Button
                  onClick={resendVerificationEmail}
                  disabled={!canResend || isResending}
                  className="w-full"
                  variant="outline"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Resend Verification Email
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={() => router.push('/login')}
                    className="text-sm"
                  >
                    Back to Login
                  </Button>
                </div>
              </div>
            )}

            {verificationStatus === 'invalid' && (
              <div className="text-center">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full"
                >
                  Back to Login
                </Button>
              </div>
            )}

            {verificationStatus === 'loading' && (
              <div className="text-center">
                <p className="text-sm text-gray-500">
                  This may take a few moments...
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-gray-600">
          <p>
            Didn't receive the email? Check your spam folder or{' '}
            <button
              onClick={resendVerificationEmail}
              disabled={!canResend || isResending}
              className="text-blue-600 hover:text-blue-500 underline"
            >
              request a new one
            </button>
            .
          </p>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}

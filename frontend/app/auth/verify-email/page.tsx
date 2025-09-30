"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api-client"

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing verification token")
      setLoading(false)
      return
    }

    const verifyEmail = async () => {
      try {
        await authApi.verifyEmail(token)
        setSuccess(true)
      } catch (error) {
        setError(error instanceof Error ? error.message : "Email verification failed")
      } finally {
        setLoading(false)
      }
    }

    verifyEmail()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h1 className="text-3xl font-bold text-white">Verifying Email</h1>
            <p className="mt-4 text-white/70">
              Please wait while we verify your email address...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-white">Email Verified!</h1>
            <p className="mt-4 text-white/70">
              Your email address has been successfully verified. You can now access all features of WatchParty.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/dashboard"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Dashboard
            </Link>
            
            <div>
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 text-sm">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white">Verification Failed</h1>
          <p className="mt-4 text-white/70">
            {error || "This verification link is invalid or has expired."}
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/auth/resend-verification"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Resend Verification Email
          </Link>
          
          <div className="space-y-2">
            <div>
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 text-sm">
                Back to Login
              </Link>
            </div>
            <div>
              <Link href="/support" className="text-white/70 hover:text-white text-xs">
                Need help? Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
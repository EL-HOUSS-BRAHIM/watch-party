"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Mail, CheckCircle, AlertCircle, RefreshCw, Sparkles, Clock, Send } from "lucide-react"
import Link from "next/link"

function EmailVerificationHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired">(&quot;loading")
  const [message, setMessage] = useState("")
  const [isResending, setIsResending] = useState(false)
  const [canResend, setCanResend] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  const token = searchParams.get("token")
  const email = searchParams.get("email")

  const verifyEmail = useCallback(async () => {
    setStatus("loading")

    try {
      const response = await fetch("/api/auth/verify-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus("success")
        setMessage("Email verified successfully! You can now log in.")

        toast({
          title: "Email Verified",
          description: "Your email has been verified successfully.",
        })

        setTimeout(() => {
          router.push("/login?verified=true")
        }, 2000)
      } else {
        if (data.error === "token_expired") {
          setStatus("expired")
          setMessage("This verification link has expired. Please request a new one.")
        } else {
          setStatus("error")
          setMessage(data.message || "Email verification failed. Please try again.")
        }
      }
    } catch (error) {
      console.error("Email verification error:", error)
      setStatus("error")
      setMessage("An unexpected error occurred. Please try again.")
    }
  }, [token, email, toast, router])

  useEffect(() => {
    if (!token || !email) {
      setStatus("error")
      setMessage("Invalid verification link. Please check your email and try again.")
      return
    }

    verifyEmail()
  }, [token, email, verifyEmail])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      setCanResend(true)
    }
  }, [resendCooldown])



  const resendVerificationEmail = async () => {
    setIsResending(true)
    setCanResend(false)
    setResendCooldown(60) // 60 second cooldown

    try {
      const response = await fetch("/api/auth/resend-verification/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Verification Email Sent",
          description: "A new verification email has been sent to your inbox.",
        })
      } else {
        throw new Error(data.message || "Failed to resend verification email")
      }
    } catch (error) {
      console.error("Resend verification error:", error)
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification email. Please try again later.",
        variant: "destructive",
      })
      setCanResend(true)
      setResendCooldown(0)
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                <Mail className="w-8 h-8 text-white" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-500 rounded-full animate-bounce flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h1>
              <p className="text-gray-400 mb-6">Please wait while we verify your email address...</p>

              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                <span className="text-purple-400">Processing verification...</span>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Validating email token</span>
                </div>
              </div>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">Email Verified Successfully!</h1>
              <p className="text-gray-400 mb-6">{message}</p>

              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-center space-x-2 text-green-300">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm">Your account is now active</span>
                </div>
              </div>

              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Welcome to WatchParty!
              </Badge>

              <div className="space-y-3">
                <Link href="/login">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Sign In to Your Account
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mt-4">
                <Clock className="w-4 h-4" />
                <span>Redirecting to sign in in 3 seconds...</span>
              </div>
            </>
          )}

          {status === "expired" && (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">Verification Link Expired</h1>
              <p className="text-gray-400 mb-6">{message}</p>

              <Alert className="bg-orange-500/10 border-orange-500/20 text-orange-300 mb-6">
                <Clock className="h-4 w-4" />
                <AlertDescription>Verification links expire after 24 hours for security reasons.</AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={resendVerificationEmail}
                  disabled={isResending || !canResend}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : !canResend ? (
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {resendCooldown}s
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Send className="w-4 h-4 mr-2" />
                      Send New Verification Email
                    </div>
                  )}
                </Button>

                <Link href="/login">
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
              <p className="text-gray-400 mb-6">{message}</p>

              <Alert className="bg-red-500/10 border-red-500/20 text-red-300 mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Button
                  onClick={resendVerificationEmail}
                  disabled={isResending || !canResend}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : !canResend ? (
                    <div className="flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Resend in {resendCooldown}s
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Send New Verification Email
                    </div>
                  )}
                </Button>

                <Link href="/register">
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                  >
                    Create New Account
                  </Button>
                </Link>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-2">Still having issues?</p>
                <Link href="/help" className="text-purple-300 hover:text-purple-200 text-sm transition-colors">
                  Contact Support
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Email Tips */}
        <div className="mt-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <h4 className="text-white font-medium mb-2 flex items-center">
              <Mail className="w-4 h-4 mr-2" />
              Email Verification Tips
            </h4>
            <ul className="space-y-1 text-sm text-gray-400">
              <li>• Check your spam/junk folder</li>
              <li>• Verification links expire after 24 hours</li>
              <li>• Make sure to click the link from the same device</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
            <p className="text-white">Loading verification...</p>
          </div>
        </div>
      }
    >
      <EmailVerificationHandler />
    </Suspense>
  )
}

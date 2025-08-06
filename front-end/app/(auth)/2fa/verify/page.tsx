"use client"

import type React from "react"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Shield,
  Smartphone,
  Key,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  HelpCircle,
  CheckCircle,
  Clock,
} from "lucide-react"
import Link from "next/link"

function TwoFactorVerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [verificationCode, setVerificationCode] = useState("")
  const [backupCode, setBackupCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [attemptsRemaining, setAttemptsRemaining] = useState(5)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
  const [isResendingCode, setIsResendingCode] = useState(false)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const email = searchParams.get("email")
  const tempToken = searchParams.get("temp_token")

  useEffect(() => {
    if (!email || !tempToken) {
      router.push("/login")
      return
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push("/login?error=2fa-expired")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [email, tempToken, router])

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const handleCodeChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return

    const newCode = verificationCode.split("")
    newCode[index] = value
    const updatedCode = newCode.join("")
    setVerificationCode(updatedCode)

    // Clear errors when user starts typing
    if (errors.code) {
      setErrors((prev) => ({ ...prev, code: "" }))
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all digits are entered
    if (updatedCode.length === 6 && /^\d{6}$/.test(updatedCode)) {
      handleVerify(updatedCode)
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    if (pastedData.length === 6) {
      setVerificationCode(pastedData)
      handleVerify(pastedData)
    }
  }

  const handleVerify = async (code?: string) => {
    const codeToVerify = code || verificationCode
    const backupCodeToVerify = useBackupCode ? backupCode : ""

    if (!useBackupCode && (!codeToVerify || codeToVerify.length !== 6)) {
      setErrors({ code: "Please enter a valid 6-digit code" })
      return
    }

    if (useBackupCode && !backupCodeToVerify) {
      setErrors({ backup: "Please enter a backup code" })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await fetch("/api/auth/2fa/verify/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          temp_token: tempToken,
          code: useBackupCode ? backupCodeToVerify : codeToVerify,
          is_backup_code: useBackupCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Store tokens
        localStorage.setItem("accessToken", data.access_token)
        localStorage.setItem("refreshToken", data.refresh_token)

        toast({
          title: "Login Successful",
          description: "You have been successfully authenticated.",
        })

        // Redirect to intended destination or dashboard
        const redirectTo = searchParams.get("redirect") || "/dashboard"
        router.push(redirectTo)
      } else {
        if (data.attempts_remaining !== undefined) {
          setAttemptsRemaining(data.attempts_remaining)
        }

        if (data.attempts_remaining === 0) {
          toast({
            title: "Account Locked",
            description: "Too many failed attempts. Please try again later.",
            variant: "destructive",
          })
          router.push("/login?error=account-locked")
        } else {
          setErrors({
            [useBackupCode ? "backup" : "code"]: data.message || "Invalid code. Please try again.",
          })
        }
      }
    } catch (error) {
      console.error("2FA verification error:", error)
      setErrors({
        [useBackupCode ? "backup" : "code"]: "Verification failed. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resendCode = async () => {
    setIsResendingCode(true)
    try {
      const response = await fetch("/api/auth/2fa/resend/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          temp_token: tempToken,
        }),
      })

      if (response.ok) {
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your authenticator app.",
        })
        setTimeRemaining(300) // Reset timer
        setAttemptsRemaining(5) // Reset attempts
      } else {
        throw new Error("Failed to resend code")
      }
    } catch (error) {
      console.error("Resend code error:", error)
      toast({
        title: "Resend Failed",
        description: "Failed to resend verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsResendingCode(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Two-Factor Authentication</h1>
            <p className="text-gray-400 mb-4">Enter the verification code from your authenticator app</p>

            {/* Timer */}
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400">Code expires in {formatTime(timeRemaining)}</span>
            </div>
          </div>

          {/* Attempts Warning */}
          {attemptsRemaining <= 2 && attemptsRemaining > 0 && (
            <Alert className="bg-yellow-500/10 border-yellow-500/20 text-yellow-300 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {attemptsRemaining} attempt{attemptsRemaining !== 1 ? "s" : ""} remaining before account lockout.
              </AlertDescription>
            </Alert>
          )}

          {/* Error Alert */}
          {(errors.code || errors.backup) && (
            <Alert className="bg-red-500/10 border-red-500/20 text-red-300 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.code || errors.backup}</AlertDescription>
            </Alert>
          )}

          {/* Verification Form */}
          <div className="space-y-6">
            {!useBackupCode ? (
              <div className="space-y-4">
                <div className="text-center">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 mb-4">
                    <Smartphone className="w-4 h-4 mr-2" />
                    Authenticator Code
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-white text-center block">Enter 6-digit code</Label>
                  <div className="flex justify-center space-x-2" onPaste={handlePaste}>
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={verificationCode[index] || ""}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center text-xl font-bold bg-white/5 border-white/20 text-white focus:border-blue-500/50"
                        disabled={isLoading}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Open your authenticator app and enter the 6-digit code
                  </p>
                </div>

                <Button
                  onClick={() => handleVerify()}
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Code
                    </div>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30 mb-4">
                    <Key className="w-4 h-4 mr-2" />
                    Backup Code
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backupCode" className="text-white">
                    Enter Backup Code
                  </Label>
                  <Input
                    id="backupCode"
                    type="text"
                    value={backupCode}
                    onChange={(e) => {
                      setBackupCode(e.target.value.toUpperCase())
                      if (errors.backup) setErrors((prev) => ({ ...prev, backup: "" }))
                    }}
                    className="text-center text-lg font-mono bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-orange-500/50"
                    placeholder="XXXXXXXX"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500 text-center">Use one of your saved backup codes</p>
                </div>

                <Button
                  onClick={() => handleVerify()}
                  disabled={isLoading || !backupCode}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verify Backup Code
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Toggle between code types */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setUseBackupCode(!useBackupCode)
                  setVerificationCode("")
                  setBackupCode("")
                  setErrors({})
                }}
                className="text-purple-300 hover:text-purple-200 text-sm transition-colors"
                disabled={isLoading}
              >
                {useBackupCode ? (
                  <>
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Use authenticator code instead
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4 inline mr-1" />
                    Use backup code instead
                  </>
                )}
              </button>
            </div>

            {/* Resend Code */}
            {!useBackupCode && (
              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={resendCode}
                  disabled={isResendingCode || timeRemaining > 240} // Allow resend after 1 minute
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  {isResendingCode ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400 mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Resend Code
                    </div>
                  )}
                </Button>
              </div>
            )}

            {/* Help Section */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start space-x-3">
                <HelpCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h4 className="text-white font-medium text-sm">Need Help?</h4>
                  <ul className="space-y-1 text-xs text-gray-400">
                    <li>• Make sure your device's time is synchronized</li>
                    <li>• Check if your authenticator app is up to date</li>
                    <li>• Use backup codes if you can't access your phone</li>
                    <li>• Contact support if you're still having issues</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-gray-400 hover:text-gray-300 text-sm transition-colors inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TwoFactorVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      }
    >
      <TwoFactorVerifyForm />
    </Suspense>
  )
}

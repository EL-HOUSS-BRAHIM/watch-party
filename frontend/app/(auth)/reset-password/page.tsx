"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { WatchPartyInput } from "@/components/ui/watch-party-input"
import { 
  WatchPartyCard,
  WatchPartyCardHeader,
  WatchPartyCardTitle,
  WatchPartyCardDescription,
  WatchPartyCardContent,
  WatchPartyCardFooter
} from "@/components/ui/watch-party-card"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState("")
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)
  const { toast } = useToast()

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    const validateToken = async () => {
      try {
        // Note: You may need to add a token validation endpoint to the AuthAPI
        // For now, we'll assume the token is valid and let the reset call handle validation
        setTokenValid(true)
      } catch (err) {
        setTokenValid(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await authAPI.resetPassword({ 
        token: token!, 
        new_password: password,
        confirm_password: confirmPassword 
      })
      
      setIsSuccess(true)
      toast({
        title: "Password reset successful!",
        description: "Your password has been successfully reset.",
      })
      
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 
                          err?.response?.data?.detail || 
                          err?.message || 
                          "Failed to reset password"
      setError(errorMessage)
      toast({
        title: "Reset failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md">
          <WatchPartyCardContent className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validating reset token...</p>
          </WatchPartyCardContent>
        </WatchPartyCard>
      </div>
    )
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md">
          <WatchPartyCardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <WatchPartyCardTitle className="text-2xl">Invalid or expired link</WatchPartyCardTitle>
              <WatchPartyCardDescription className="mt-2">
                This password reset link is invalid or has expired. Please request a new one.
              </WatchPartyCardDescription>
            </div>
          </WatchPartyCardHeader>

          <WatchPartyCardFooter className="space-y-2">
            <Link href="/forgot-password" className="w-full">
              <WatchPartyButton variant="gradient" className="w-full">
                Request new reset link
              </WatchPartyButton>
            </Link>
            <Link href="/login" className="w-full">
              <WatchPartyButton variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </WatchPartyButton>
            </Link>
          </WatchPartyCardFooter>
        </WatchPartyCard>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md">
          <WatchPartyCardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <WatchPartyCardTitle className="text-2xl">Password reset successful!</WatchPartyCardTitle>
              <WatchPartyCardDescription className="mt-2">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </WatchPartyCardDescription>
            </div>
          </WatchPartyCardHeader>

          <WatchPartyCardFooter>
            <Link href="/login" className="w-full">
              <WatchPartyButton variant="gradient" className="w-full">
                Continue to login
              </WatchPartyButton>
            </Link>
          </WatchPartyCardFooter>
        </WatchPartyCard>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <WatchPartyCard className="w-full max-w-md">
        <WatchPartyCardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <WatchPartyCardTitle className="text-2xl">Reset your password</WatchPartyCardTitle>
          <WatchPartyCardDescription>
            Enter your new password below. Make sure it's strong and secure.
          </WatchPartyCardDescription>
        </WatchPartyCardHeader>

        <WatchPartyCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <WatchPartyInput
              type="password"
              label="New password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              hint="Must be at least 8 characters long"
              required
            />

            <WatchPartyInput
              type="password"
              label="Confirm password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock className="h-4 w-4" />}
              showPasswordToggle
              error={confirmPassword && password !== confirmPassword ? "Passwords do not match" : ""}
              required
            />

            {error && (
              <div className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <WatchPartyButton
              type="submit"
              className="w-full"
              disabled={isLoading || !password || !confirmPassword}
              variant="gradient"
            >
              {isLoading ? "Resetting..." : "Reset password"}
            </WatchPartyButton>
          </form>
        </WatchPartyCardContent>

        <WatchPartyCardFooter className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </WatchPartyCardFooter>
      </WatchPartyCard>
    </div>
  )
}

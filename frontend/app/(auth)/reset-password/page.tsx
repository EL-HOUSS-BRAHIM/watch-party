"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, CheckCircle, AlertCircle } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { WatchPartyInput } from "@/components/ui/watch-party-input"
import { WatchPartyCard } from "@/components/ui/watch-party-card"

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

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setTokenValid(false)
      return
    }

    const validateToken = async () => {
      try {
        const response = await fetch(`/api/auth/reset-password/validate/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        setTokenValid(response.ok)
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
      const response = await fetch("/api/auth/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          confirmPassword,
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to reset password")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state while validating token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md" variant="elevated">
          <WatchPartyCard.Content className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validating reset token...</p>
          </WatchPartyCard.Content>
        </WatchPartyCard>
      </div>
    )
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md" variant="elevated">
          <WatchPartyCard.Header className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <WatchPartyCard.Title className="text-2xl">Invalid or expired link</WatchPartyCard.Title>
              <WatchPartyCard.Description className="mt-2">
                This password reset link is invalid or has expired. Please request a new one.
              </WatchPartyCard.Description>
            </div>
          </WatchPartyCard.Header>

          <WatchPartyCard.Footer className="space-y-2">
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
          </WatchPartyCard.Footer>
        </WatchPartyCard>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md" variant="elevated">
          <WatchPartyCard.Header className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <WatchPartyCard.Title className="text-2xl">Password reset successful!</WatchPartyCard.Title>
              <WatchPartyCard.Description className="mt-2">
                Your password has been successfully reset. You will be redirected to the login page shortly.
              </WatchPartyCard.Description>
            </div>
          </WatchPartyCard.Header>

          <WatchPartyCard.Footer>
            <Link href="/login" className="w-full">
              <WatchPartyButton variant="gradient" className="w-full">
                Continue to login
              </WatchPartyButton>
            </Link>
          </WatchPartyCard.Footer>
        </WatchPartyCard>
      </div>
    )
  }

  // Reset password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <WatchPartyCard className="w-full max-w-md" variant="elevated">
        <WatchPartyCard.Header className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <WatchPartyCard.Title className="text-2xl">Reset your password</WatchPartyCard.Title>
          <WatchPartyCard.Description>
            Enter your new password below. Make sure it's strong and secure.
          </WatchPartyCard.Description>
        </WatchPartyCard.Header>

        <WatchPartyCard.Content>
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
        </WatchPartyCard.Content>

        <WatchPartyCard.Footer className="text-center">
          <p className="text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
              Sign in
            </Link>
          </p>
        </WatchPartyCard.Footer>
      </WatchPartyCard>
    </div>
  )
}

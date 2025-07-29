"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Mail, CheckCircle } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { WatchPartyInput } from "@/components/ui/watch-party-input"
import { WatchPartyCard } from "@/components/ui/watch-party-card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const data = await response.json()
        setError(data.message || "Failed to send reset email")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md" variant="elevated">
          <WatchPartyCard.Header className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <WatchPartyCard.Title className="text-2xl">Check your email</WatchPartyCard.Title>
              <WatchPartyCard.Description className="mt-2">
                We've sent a password reset link to <strong>{email}</strong>
              </WatchPartyCard.Description>
            </div>
          </WatchPartyCard.Header>

          <WatchPartyCard.Content className="space-y-4">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Didn't receive the email? Check your spam folder or</p>
              <WatchPartyButton
                variant="ghost"
                size="sm"
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:text-primary/80"
              >
                try again
              </WatchPartyButton>
            </div>
          </WatchPartyCard.Content>

          <WatchPartyCard.Footer>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <WatchPartyCard className="w-full max-w-md" variant="elevated">
        <WatchPartyCard.Header className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <WatchPartyCard.Title className="text-2xl">Forgot your password?</WatchPartyCard.Title>
          <WatchPartyCard.Description>
            No worries! Enter your email address and we'll send you a link to reset your password.
          </WatchPartyCard.Description>
        </WatchPartyCard.Header>

        <WatchPartyCard.Content>
          <form onSubmit={handleSubmit} className="space-y-4">
            <WatchPartyInput
              type="email"
              label="Email address"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              icon={<Mail className="h-4 w-4" />}
              required
            />

            <WatchPartyButton type="submit" className="w-full" disabled={isLoading || !email} variant="gradient">
              {isLoading ? "Sending..." : "Send reset link"}
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

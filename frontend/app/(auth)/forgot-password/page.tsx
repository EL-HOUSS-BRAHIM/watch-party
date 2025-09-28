"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, CheckCircle, Mail } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { WatchPartyInput } from "@/components/ui/watch-party-input"
import {WatchPartyCard,WatchPartyCardHeader,WatchPartyCardTitle,WatchPartyCardDescription,WatchPartyCardContent,WatchPartyCardFooter
} from "@/components/ui/watch-party-card"
import { authAPI } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      await authAPI.forgotPassword({ email })
      setIsSubmitted(true)
      toast({
        title: "Reset link sent!",
        description: "Please check your email for the password reset link.",
      })
    } catch (err) {
      const errorMessage = (err as { response?: { data?: { message?: string; detail?: string } }; message?: string })?.response?.data?.message
                          || (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
                          || (err as { message?: string })?.message
                          || "Something went wrong. Please try again."
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <WatchPartyCard className="w-full max-w-md">
          <WatchPartyCardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <div>
              <WatchPartyCardTitle className="text-2xl">Check your email</WatchPartyCardTitle>
              <WatchPartyCardDescription className="mt-2">
                We&apos;ve sent a password reset link to <strong>{email}</strong>
              </WatchPartyCardDescription>
            </div>
          </WatchPartyCardHeader>

          <WatchPartyCardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Didn&apos;t receive the email? Check your spam folder or</p>
              <WatchPartyButton
                variant="ghost"
                size="sm"
                onClick={() => setIsSubmitted(false)}
                className="text-primary hover:text-primary/80"
              >
                try again
              </WatchPartyButton>
            </div>
          </WatchPartyCardContent>

          <WatchPartyCardFooter>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <WatchPartyCard className="w-full max-w-md">
        <WatchPartyCardHeader className="text-center space-y-2">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <WatchPartyCardTitle className="text-2xl">Forgot your password?</WatchPartyCardTitle>
          <WatchPartyCardDescription>
            Enter your email address and we&apos;ll send you a link to reset your password.
          </WatchPartyCardDescription>
        </WatchPartyCardHeader>

        <WatchPartyCardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <WatchPartyInput
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <WatchPartyButton type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Reset password"}
            </WatchPartyButton>
          </form>
        </WatchPartyCardContent>

        <WatchPartyCardFooter className="text-center">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Remember your password?{" "}
            <span className="text-primary font-medium hover:underline">Back to login</span>
          </Link>
        </WatchPartyCardFooter>
      </WatchPartyCard>
    </div>
  )
}

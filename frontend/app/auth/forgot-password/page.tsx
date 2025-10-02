"use client"

import { useState } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api-client"
import { FormError } from "@/components/ui/feedback"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authApi.requestPasswordReset({ email })
      if (response.success) {
        setSuccess("Check your inbox for a reset link. It expires in 30 minutes.")
      } else {
        setError(response.message || "We couldn’t send the reset email. Please try again.")
      }
    } catch (error) {
      console.error("Forgot password error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-brand-purple/20 bg-white/95 p-8 text-brand-navy shadow-[0_32px_90px_rgba(28,28,46,0.14)] sm:p-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand-magenta-dark">
            Reset access
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Forgot your password?</h1>
          <p className="mt-3 text-base text-brand-navy/70">
            Enter your email and we&apos;ll send a secure link to create a new password.
          </p>
        </div>

        {error && (
          <div className="mt-6">
            <FormError error={error} />
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-3 text-sm font-semibold text-brand-cyan-dark">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-[0.25em] text-brand-navy/60">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-navy/70">
          Remembered your password?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

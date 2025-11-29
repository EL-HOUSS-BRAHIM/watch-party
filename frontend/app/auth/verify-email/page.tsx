"use client"

import { useState } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api-client"
import { FormError } from "@/components/ui/feedback"

export default function VerifyEmailPage() {
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
      await authApi.resendVerification({ email })
      setSuccess("Verification email sent! Check your inbox for the latest link.")
    } catch (error) {
      console.error("Verify email error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-3 sm:px-4 py-8 sm:py-12 lg:py-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] lg:w-[800px] h-[500px] sm:h-[600px] lg:h-[800px] bg-gradient-radial from-brand-orange/10 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="glass-panel w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2xl sm:rounded-3xl lg:rounded-[40px] p-5 sm:p-8 lg:p-12 text-brand-navy relative z-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-brand-magenta-dark shadow-sm">
            Verify your email
          </span>
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-br from-brand-navy to-brand-purple bg-clip-text text-transparent">Resend verification link</h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-brand-navy/70 leading-relaxed">
            Didn&apos;t receive your confirmation email? Enter your address and we&apos;ll send a new one.
          </p>
        </div>

        {error && (
          <div className="mt-8">
            <FormError error={error} />
          </div>
        )}

        {success && (
          <div className="mt-6 sm:mt-8 rounded-xl sm:rounded-2xl border border-brand-cyan/30 bg-brand-cyan/10 px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-brand-cyan-dark">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 lg:mt-10 space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="email" className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-brand-navy/50 ml-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl sm:rounded-2xl border border-brand-navy/10 bg-white/50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all min-h-[48px] sm:min-h-[52px]"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-magenta to-brand-orange px-5 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/40 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 mt-2 min-h-[48px] sm:min-h-[56px]"
          >
            {loading ? "Sending..." : "Resend email"}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 lg:mt-10 text-center text-xs sm:text-sm text-brand-navy/60">
          Already confirmed?{" "}
          <Link href="/auth/login" className="font-bold text-brand-blue hover:text-brand-blue-dark hover:underline decoration-brand-blue/30 underline-offset-4 transition-all">
            Sign in now
          </Link>
        </div>
      </div>
    </div>
  )
}

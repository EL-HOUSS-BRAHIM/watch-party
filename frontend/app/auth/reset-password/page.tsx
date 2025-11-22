"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api-client"
import { FormError } from "@/components/ui/feedback"

export default function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      await authApi.resetPassword({ token, password })
      setSuccess("Password updated! You can now sign in with your new credentials.")
    } catch (error) {
      console.error("Reset password error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="glass-panel w-full max-w-xl rounded-[40px] p-8 text-brand-navy sm:p-12 relative z-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.4em] text-brand-magenta-dark shadow-sm">
            Secure reset
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-br from-brand-navy to-brand-purple bg-clip-text text-transparent">Set a new password</h1>
          <p className="mt-4 text-base text-brand-navy/70 leading-relaxed">
            Choose a strong password you haven&apos;t used before to keep your watch parties safe.
          </p>
        </div>

        {error && (
          <div className="mt-8">
            <FormError error={error} />
          </div>
        )}

        {success && (
          <div className="mt-8 rounded-2xl border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-3 text-sm font-semibold text-brand-cyan-dark">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.25em] text-brand-navy/50 ml-1">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-brand-navy/10 bg-white/50 px-5 py-4 text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
              placeholder="Create a secure password"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-[0.25em] text-brand-navy/50 ml-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-brand-navy/10 bg-white/50 px-5 py-4 text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/40 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 mt-2"
          >
            {loading ? "Saving..." : "Save new password"}
          </button>
        </form>

        <div className="mt-10 text-center text-sm text-brand-navy/60">
          <Link href="/auth/login" className="font-bold text-brand-blue hover:text-brand-blue-dark hover:underline decoration-brand-blue/30 underline-offset-4 transition-all">
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

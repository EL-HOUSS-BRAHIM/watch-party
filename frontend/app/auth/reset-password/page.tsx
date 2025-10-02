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
      const response = await authApi.resetPassword({ token, password })
      if (response.success) {
        setSuccess("Password updated! You can now sign in with your new credentials.")
      } else {
        setError(response.message || "We couldn’t update your password. Please try again.")
      }
    } catch (error) {
      console.error("Reset password error:", error)
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
            Secure reset
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Set a new password</h1>
          <p className="mt-3 text-base text-brand-navy/70">
            Choose a strong password you haven&apos;t used before to keep your watch parties safe.
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
            <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-[0.25em] text-brand-navy/60">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="Create a secure password"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold uppercase tracking-[0.25em] text-brand-navy/60">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="Repeat your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save new password"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-navy/70">
          <Link href="/auth/login" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
            Return to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

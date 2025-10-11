"use client"

import { useState } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api-client"
import { FormError } from "@/components/ui/feedback"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const data = await authApi.login(formData)

      if (data.success) {
        setSuccess(true)
        
        // Show success state briefly before redirecting
        setTimeout(() => {
          const urlParams = new URLSearchParams(window.location.search)
          const redirect = urlParams.get("redirect") || "/dashboard"
          window.location.href = decodeURIComponent(redirect)
        }, 800)
      } else {
        setError(data.message || "Login failed. Please check your credentials.")
        setLoading(false)
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-brand-purple/20 bg-white/95 p-8 text-brand-navy shadow-[0_32px_90px_rgba(28,28,46,0.14)] sm:p-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand-magenta-dark">
            Welcome back
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Sign in to WatchParty</h1>
          <p className="mt-3 text-base text-brand-navy/70">Host cinematic nights, collaborate with friends, and keep every screening on schedule.</p>
        </div>

        {error && (
          <div className="mt-6">
            <FormError error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold uppercase tracking-[0.25em] text-brand-navy/60">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold uppercase tracking-[0.25em] text-brand-navy/60">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {success ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Success! Redirecting...
              </span>
            ) : loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-3 text-center text-sm text-brand-navy/70">
          <Link href="/auth/forgot-password" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
            Forgot your password?
          </Link>
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-brand-magenta hover:text-brand-magenta-dark">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

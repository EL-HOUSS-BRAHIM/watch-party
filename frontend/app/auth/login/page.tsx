"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api-client"
import { FormError } from "@/components/ui/feedback"

export default function LoginPage() {
  const router = useRouter()
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
          
          // Use Next.js router instead of window.location for proper cookie handling
          router.push(decodeURIComponent(redirect))
          router.refresh() // Force refresh to pick up new cookies
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
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="glass-panel w-full max-w-xl rounded-[40px] p-8 text-brand-navy sm:p-12 relative z-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.4em] text-brand-magenta-dark shadow-sm">
            Welcome back
          </span>
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-br from-brand-navy to-brand-purple bg-clip-text text-transparent">Sign in to WatchParty</h1>
          <p className="mt-4 text-base text-brand-navy/70 leading-relaxed">Host cinematic nights, collaborate with friends, and keep every screening on schedule.</p>
        </div>

        {error && (
          <div className="mt-8">
            <FormError error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-[0.25em] text-brand-navy/50 ml-1">
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
              className="w-full rounded-2xl border border-brand-navy/10 bg-white/50 px-5 py-4 text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-bold uppercase tracking-[0.25em] text-brand-navy/50 ml-1">
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
              className="w-full rounded-2xl border border-brand-navy/10 bg-white/50 px-5 py-4 text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-2xl bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/40 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 mt-2"
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

        <div className="mt-10 flex flex-col gap-4 text-center text-sm text-brand-navy/60">
          <Link href="/auth/forgot-password" className="font-semibold text-brand-blue hover:text-brand-blue-dark hover:underline decoration-brand-blue/30 underline-offset-4 transition-all">
            Forgot your password?
          </Link>
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-bold text-brand-magenta hover:text-brand-magenta-dark hover:underline decoration-brand-magenta/30 underline-offset-4 transition-all">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

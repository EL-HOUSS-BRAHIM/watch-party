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
        
        // Store tokens in localStorage as fallback for embedded browsers
        // The API also returns tokens which we can use
        if ((data as any).access_token) {
          localStorage.setItem('access_token', (data as any).access_token)
        }
        if ((data as any).refresh_token) {
          localStorage.setItem('refresh_token', (data as any).refresh_token)
        }
        
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
    <div className="flex min-h-[80vh] items-center justify-center px-3 sm:px-4 py-8 sm:py-12 lg:py-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] lg:w-[800px] h-[500px] sm:h-[600px] lg:h-[800px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="glass-panel w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2xl sm:rounded-3xl lg:rounded-[40px] p-5 sm:p-8 lg:p-12 text-brand-navy relative z-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-brand-magenta-dark shadow-sm">
            Welcome back
          </span>
          <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-br from-brand-navy to-brand-purple bg-clip-text text-transparent">Sign in to WatchParty</h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-base text-brand-navy/70 leading-relaxed">Host cinematic nights, collaborate with friends, and keep every screening on schedule.</p>
        </div>

        {error && (
          <div className="mt-8">
            <FormError error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 lg:mt-10 space-y-4 sm:space-y-5 lg:space-y-6">
          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="email" className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-brand-navy/50 ml-1">
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
              className="w-full rounded-xl sm:rounded-2xl border border-brand-navy/10 bg-white/50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px] sm:min-h-[52px]"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <label htmlFor="password" className="block text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.25em] text-brand-navy/50 ml-1">
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
              className="w-full rounded-xl sm:rounded-2xl border border-brand-navy/10 bg-white/50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px] sm:min-h-[52px]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full rounded-xl sm:rounded-2xl bg-gradient-to-r from-brand-magenta to-brand-orange px-5 sm:px-6 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/40 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 mt-2 min-h-[48px] sm:min-h-[56px]"
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

        {/* Divider */}
        <div className="relative mt-6 sm:mt-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-navy/10"></div>
          </div>
          <div className="relative flex justify-center text-xs sm:text-sm">
            <span className="bg-white/80 px-3 sm:px-4 text-brand-navy/50 font-semibold">Or continue with</span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={async () => {
            try {
              setError(null)
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login/`)
              const data = await response.json()
              if (data.success && data.data?.authorization_url) {
                window.location.href = data.data.authorization_url
              } else {
                setError('Failed to initialize Google sign-in')
              }
            } catch (err) {
              console.error('Google OAuth error:', err)
              setError('Failed to connect to Google')
            }
          }}
          className="mt-4 sm:mt-6 w-full rounded-xl sm:rounded-2xl border-2 border-brand-navy/10 bg-white hover:bg-gray-50 px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-semibold text-brand-navy shadow-sm transition-all hover:border-brand-navy/20 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px] sm:min-h-[52px] flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>

        <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col gap-3 sm:gap-4 text-center text-xs sm:text-sm text-brand-navy/60">
          <Link href="/auth/forgot-password" className="font-semibold text-brand-blue hover:text-brand-blue-dark hover:underline decoration-brand-blue/30 underline-offset-4 transition-all min-h-[44px] inline-flex items-center justify-center">
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

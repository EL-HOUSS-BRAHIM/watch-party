"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function GoogleCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'profile_required'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [profileData, setProfileData] = useState<{
    email: string
    username_suggestion?: string
  } | null>(null)
  const [username, setUsername] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams?.get('code')
      const state = searchParams?.get('state')
      const errorParam = searchParams?.get('error')

      if (errorParam) {
        setStatus('error')
        setError('Authentication was cancelled or failed')
        return
      }

      if (!code || !state) {
        setStatus('error')
        setError('Invalid callback parameters')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login/callback/?code=${code}&state=${state}`)
        const data = await response.json()

        if (data.success) {
          if (data.profile_required) {
            // New user needs to complete profile
            setStatus('profile_required')
            setProfileData({
              email: data.email,
              username_suggestion: data.username_suggestion
            })
            setUsername(data.username_suggestion || '')
          } else {
            // Existing user or profile completed
            setStatus('success')
            
            // Store tokens if provided
            if (data.access_token) {
              localStorage.setItem('access_token', data.access_token)
            }
            if (data.refresh_token) {
              localStorage.setItem('refresh_token', data.refresh_token)
            }
            
            // Redirect to dashboard
            setTimeout(() => {
              router.push('/dashboard')
              router.refresh()
            }, 1000)
          }
        } else {
          setStatus('error')
          setError(data.message || 'Authentication failed')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setStatus('error')
        setError('Failed to complete authentication')
      }
    }

    handleCallback()
  }, [searchParams, router])

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const code = searchParams?.get('code')
      const state = searchParams?.get('state')

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/login/callback/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          state,
          username
        })
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        
        // Store tokens
        if (data.access_token) {
          localStorage.setItem('access_token', data.access_token)
        }
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token)
        }
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 1000)
      } else {
        setError(data.message || 'Failed to complete profile')
        setSubmitting(false)
      }
    } catch (err) {
      console.error('Profile completion error:', err)
      setError('Failed to complete profile')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-3 sm:px-4 py-8 sm:py-12 lg:py-16 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] sm:w-[600px] lg:w-[800px] h-[500px] sm:h-[600px] lg:h-[800px] bg-gradient-radial from-brand-blue/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="glass-panel w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2xl sm:rounded-3xl lg:rounded-[40px] p-5 sm:p-8 lg:p-12 text-brand-navy relative z-10">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="flex justify-center">
                <svg className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-brand-blue" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
              <h1 className="mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy">
                Completing sign in...
              </h1>
              <p className="mt-3 text-sm sm:text-base text-brand-navy/70">
                Please wait while we set up your account
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-green-100 p-4">
                  <svg className="h-12 w-12 sm:h-16 sm:w-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h1 className="mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy">
                Success!
              </h1>
              <p className="mt-3 text-sm sm:text-base text-brand-navy/70">
                Redirecting to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="flex justify-center">
                <div className="rounded-full bg-red-100 p-4">
                  <svg className="h-12 w-12 sm:h-16 sm:w-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h1 className="mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-brand-navy">
                Authentication Failed
              </h1>
              {error && (
                <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}
              <div className="mt-6">
                <Link 
                  href="/auth/login"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-3 text-base font-bold text-white shadow-lg hover:shadow-xl transition-all"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {status === 'profile_required' && profileData && (
            <>
              <span className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-brand-blue/20 bg-brand-blue/5 px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em] text-brand-blue-dark shadow-sm">
                Welcome!
              </span>
              <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-br from-brand-navy to-brand-blue bg-clip-text text-transparent">
                Complete Your Profile
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-brand-navy/70 leading-relaxed">
                Choose a username to finish setting up your account
              </p>

              {error && (
                <div className="mt-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <form onSubmit={handleProfileSubmit} className="mt-6 sm:mt-8 space-y-4">
                <div className="text-left space-y-2">
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-brand-navy/50 ml-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full rounded-xl border border-brand-navy/10 bg-gray-100 px-4 py-3 text-sm text-brand-navy/60 min-h-[48px]"
                  />
                </div>

                <div className="text-left space-y-2">
                  <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-brand-navy/50 ml-1">
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={submitting}
                    className="w-full rounded-xl border border-brand-navy/10 bg-white/50 px-4 py-3 text-sm text-brand-navy placeholder:text-brand-navy/30 focus:border-brand-blue/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-brand-blue/10 transition-all disabled:cursor-not-allowed disabled:opacity-60 min-h-[48px]"
                    placeholder="movienight"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !username.trim()}
                  className="w-full rounded-xl bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-3 text-base font-bold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/40 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 min-h-[52px]"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating account...
                    </span>
                  ) : (
                    "Complete Profile"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

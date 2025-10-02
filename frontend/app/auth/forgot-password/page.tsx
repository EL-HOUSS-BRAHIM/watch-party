"use client"

import { useState } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api-client"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await authApi.forgotPassword(email)
      setSent(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to send reset email")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Check Your Email</h1>
            <p className="mt-4 text-white/70">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="mt-2 text-white/70 text-sm">
              If you don't see it, check your spam folder.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/auth/login"
              className="inline-block bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Login
            </Link>
            
            <div>
              <button
                onClick={() => {
                  setSent(false)
                  setEmail("")
                }}
                className="text-brand-blue-light hover:text-brand-blue-light text-sm"
              >
                Try a different email
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white">Reset Password</h1>
          <p className="mt-2 text-white/70">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-brand-coral-light text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white/90">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-blue"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full bg-brand-blue hover:bg-brand-blue-dark disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center">
          <div className="text-white/70">
            Remember your password?{" "}
            <Link href="/auth/login" className="text-brand-blue-light hover:text-brand-blue-light">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
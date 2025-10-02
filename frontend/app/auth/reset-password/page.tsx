"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { authApi } from "@/lib/api-client"

export default function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token")
    }
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setError("Invalid or missing reset token")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)
    setError("")

    try {
      await authApi.resetPassword({
        token,
        password: formData.password,
      })
      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-bold text-white">Password Reset</h1>
            <p className="mt-4 text-white/70">
              Your password has been successfully reset.
            </p>
          </div>
          
          <Link 
            href="/auth/login"
            className="inline-block bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (!token || error.includes("Invalid or missing")) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Invalid Link</h1>
            <p className="mt-4 text-white/70">
              This password reset link is invalid or has expired.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link 
              href="/auth/forgot-password"
              className="inline-block bg-brand-blue hover:bg-brand-blue-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Request New Link
            </Link>
            
            <div>
              <Link href="/auth/login" className="text-brand-blue-light hover:text-brand-blue-light text-sm">
                Back to Login
              </Link>
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
          <h1 className="text-3xl font-bold text-white">Set New Password</h1>
          <p className="mt-2 text-white/70">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-brand-coral-light text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-white/90">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-blue"
              placeholder="Enter new password"
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-brand-blue"
              placeholder="Confirm new password"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.password || !formData.confirmPassword}
            className="w-full bg-brand-blue hover:bg-brand-blue-dark disabled:bg-blue-600/50 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/auth/login" className="text-brand-blue-light hover:text-brand-blue-light text-sm">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  )
}
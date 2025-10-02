"use client"

import { useState } from "react"
import Link from "next/link"
import { authApi } from "@/lib/api-client"
import { FormError } from "@/components/ui/feedback"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await authApi.register(formData)

      if (response.success) {
        setSuccess("Account created! Check your inbox to verify your email.")
      } else {
        setError(response.message || "Registration failed. Please try again.")
      }
    } catch (error) {
      console.error("Register error:", error)
      setError(error instanceof Error ? error.message : "Something went wrong. Please try again.")
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

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-brand-purple/20 bg-white/95 p-8 text-brand-navy shadow-[0_32px_90px_rgba(28,28,46,0.14)] sm:p-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-brand-magenta-dark">
            Create your account
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Host with WatchParty</h1>
          <p className="mt-3 text-base text-brand-navy/70">
            Bring friends together in vibrant watch rooms with live chat, reactions, and co-host controls.
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
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-semibold uppercase tracking-[0.25em] text-brand-navy/60">
              Username
            </label>
            <input
              id="username"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="movienight"
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
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-2xl border border-brand-blue/25 bg-brand-blue/5 px-5 py-3 text-base text-brand-navy focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              placeholder="Create a secure password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-magenta/25 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-brand-navy/70">
          Already part of the party?{" "}
          <Link href="/auth/login" className="font-semibold text-brand-blue hover:text-brand-blue-dark">
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  )
}

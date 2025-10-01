"use client"

import { useState } from "react"
import Link from "next/link"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      // TODO: Implement actual login API call
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect to dashboard
        window.location.href = "/dashboard"
      } else {
        alert(data.error || "Login failed. Please check your credentials.")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Something went wrong. Please try again.")
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
    <div className="min-h-[80vh] px-4 py-12 sm:py-16 flex items-center justify-center">
      <div className="w-full max-w-md space-y-10 rounded-2xl bg-white/5 p-6 shadow-lg backdrop-blur-sm sm:p-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">Welcome Back</h1>
          <p className="text-sm text-white/70 sm:text-base">
            Sign in to start hosting watch parties
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-white/90">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-white/90">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="block w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-base font-semibold text-white transition-colors duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-600/50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="space-y-4 text-center">
          <Link href="/auth/forgot-password" className="text-sm text-blue-300 transition-colors hover:text-blue-200">
            Forgot your password?
          </Link>

          <p className="text-sm text-white/70">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-blue-300 transition-colors hover:text-blue-200">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

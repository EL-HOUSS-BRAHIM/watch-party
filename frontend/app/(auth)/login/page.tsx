"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const { login, socialLogin, isLoading } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState("")

  useEffect(() => {
    const messageParam = searchParams.get("message")
    const errorParam = searchParams.get("error")

    if (messageParam) {
      setMessage(messageParam)
    }
    if (errorParam) {
      setErrors({ general: errorParam })
    }
  }, [searchParams])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setErrors({})

    try {
      await login(formData.email, formData.password)
      toast({
        title: "Welcome back!",
        description: "You&apos;ve been successfully logged in.",
        duration: 3000,
      })
    } catch {
      const errorMessage = (error as { message?: string })?.message || "Login failed. Please try again."
      setErrors({ general: errorMessage })
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      await socialLogin(provider)
    } catch {
      toast({
        title: "Social Login Failed",
        description: (error as { message?: string })?.message || `Failed to login with ${provider}`,
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: &quot;&quot; }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 animate-spin text-neon-red" />
            <div className="absolute inset-0 w-8 h-8 rounded-full border-2 border-neon-red/20" />
          </div>
          <div className="text-center">
            <div className="text-white font-medium">Checking authentication...</div>
            <div className="text-gray-400 text-sm">Please wait</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-red to-neon-purple flex items-center justify-center glow-red">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full animate-pulse flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400">Sign in to continue your cinema experience</p>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <Alert className="border-neon-blue/30 bg-neon-blue/10">
          <CheckCircle className="h-4 w-4 text-neon-blue" />
          <AlertDescription className="text-neon-blue">{message}</AlertDescription>
        </Alert>
      )}

      {errors.general && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Social Login */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin(&quot;google&quot;)}
            disabled={isSubmitting}
            className="glass-card border-white/20 hover:border-neon-blue/50 hover:bg-neon-blue/10 text-white transition-all duration-300"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin(&quot;github&quot;)}
            disabled={isSubmitting}
            className="glass-card border-white/20 hover:border-neon-purple/50 hover:bg-neon-purple/10 text-white transition-all duration-300"
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full bg-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-cinema-deep px-2 text-gray-400">Or continue with email</span>
          </div>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange(&quot;email&quot;, e.target.value)}
                className={`pl-10 glass-card border-white/20 focus:border-neon-red/50 focus:glow-red text-white placeholder-gray-400 transition-all duration-300 ${
                  errors.email ? "border-red-500/50 focus:border-red-500" : ""
                }`}
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-300 font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange(&quot;password&quot;, e.target.value)}
                className={`pl-10 pr-10 glass-card border-white/20 focus:border-neon-red/50 focus:glow-red text-white placeholder-gray-400 transition-all duration-300 ${
                  errors.password ? "border-red-500/50 focus:border-red-500" : ""
                }`}
                disabled={isSubmitting}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className=&quot;w-4 h-4&quot; />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </p>
            )}
          </div>
        </div>

        {/* Forgot Password Link */}
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-sm text-neon-blue hover:text-neon-purple transition-colors">
            Forgot your password?
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-neon-red to-neon-purple hover:from-neon-red/80 hover:to-neon-purple/80 text-white font-semibold py-3 rounded-xl transition-all duration-300 glow-red disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Signing In...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      {/* Register Link */}
      <div className="text-center">
        <p className="text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-neon-blue hover:text-neon-purple font-medium transition-colors">
            Create one now
          </Link>
        </p>
      </div>

      {/* Additional Links */}
      <div className="flex justify-center space-x-6 text-sm">
        <Link href="/help" className="text-gray-500 hover:text-gray-300 transition-colors">
          Help
        </Link>
        <Link href="/privacy" className="text-gray-500 hover:text-gray-300 transition-colors">
          Privacy
        </Link>
        <Link href="/terms" className="text-gray-500 hover:text-gray-300 transition-colors">
          Terms
        </Link>
      </div>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Lock, Shield, CheckCircle, AlertCircle, ArrowLeft, Key, Sparkles } from "lucide-react"
import Link from "next/link"
import { AuthAPI } from "@/lib/api/auth"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const authService = useMemo(() => new AuthAPI(), [])

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [passwordStrength, setPasswordStrength] = useState(0)

  const token = searchParams.get("token")
  const email = searchParams.get("email")
  const displayEmail = email ?? "your account"

  useEffect(() => {
    // Calculate password strength
    const strength = calculatePasswordStrength(formData.password)
    setPasswordStrength(strength)
  }, [formData.password])

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (/[a-z]/.test(password)) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 12.5
    if (/[^A-Za-z0-9]/.test(password)) strength += 12.5
    return Math.min(strength, 100)
  }

  const getPasswordStrengthColor = (strength: number): string => {
    if (strength < 25) return "bg-red-500"
    if (strength < 50) return "bg-orange-500"
    if (strength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = (strength: number): string => {
    if (strength < 25) return "Weak"
    if (strength < 50) return "Fair"
    if (strength < 75) return "Good"
    return "Strong"
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (passwordStrength < 50) {
      newErrors.password = "Password is too weak"
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!token) {
      setErrors({ submit: "This reset link is invalid or has expired." })
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      const response = await authService.resetPassword({
        token: token || "",
        new_password: formData.password,
        confirm_password: formData.password,
      })

      if (response?.success) {
        toast({
          title: "Password Reset Successful",
          description: "Your password has been updated. You can now sign in with your new password.",
        })

        // Redirect to login after a short delay
        setTimeout(() => {
          router.push("/login?message=password-reset-success")
        }, 2000)
      } else {
        setErrors({ submit: response?.message || "Failed to reset password" })
      }
    } catch (error: unknown) {
      console.error("Reset password error:", error)
      const message = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message 
        || (error as { message?: string })?.message 
        || "An unexpected error occurred. Please try again."
      setErrors({ submit: message })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: &quot;" }))
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h1>
            <p className="text-gray-400 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>

            <div className="space-y-3">
              <Link href="/forgot-password">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                  Request New Reset Link
                </Button>
              </Link>

              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Key className="w-8 h-8 text-white" />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Reset Your Password</h1>
            <p className="text-gray-400">
              Enter your new password for <span className="text-purple-300">{displayEmail}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <Alert className="bg-red-500/10 border-red-500/20 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-500/50"
                  placeholder="Enter your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className=&quot;w-4 h-4" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">Password Strength</span>
                    <span
                      className={`font-medium ${passwordStrength >= 75 ? &quot;text-green-400" : passwordStrength >= 50 ? "text-yellow-400" : "text-red-400"}`}
                    >
                      {getPasswordStrengthText(passwordStrength)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                </div>
              )}

              {errors.password && <p className="text-red-400 text-sm">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm New Password
              </Label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-purple-500/50"
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className=&quot;w-4 h-4" />}
                </button>
              </div>

              {/* Password Match Indicator */}
              {formData.confirmPassword && (
                <div className="flex items-center space-x-2 text-xs">
                  {formData.password === formData.confirmPassword ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}

              {errors.confirmPassword && <p className="text-red-400 text-sm">{errors.confirmPassword}</p>}
            </div>

            {/* Password Requirements */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <Shield className="w-4 h-4 mr-2" />
                Password Requirements
              </h4>
              <ul className="space-y-1 text-sm">
                <li
                  className={`flex items-center space-x-2 ${formData.password.length >= 8 ? &quot;text-green-400" : "text-gray-400"}`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>At least 8 characters</span>
                </li>
                <li
                  className={`flex items-center space-x-2 ${/[a-z]/.test(formData.password) ? "text-green-400" : "text-gray-400"}`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>One lowercase letter</span>
                </li>
                <li
                  className={`flex items-center space-x-2 ${/[A-Z]/.test(formData.password) ? "text-green-400" : "text-gray-400"}`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>One uppercase letter</span>
                </li>
                <li
                  className={`flex items-center space-x-2 ${/[0-9]/.test(formData.password) ? "text-green-400" : "text-gray-400"}`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>One number</span>
                </li>
                <li
                  className={`flex items-center space-x-2 ${/[^A-Za-z0-9]/.test(formData.password) ? "text-green-400" : "text-gray-400"}`}
                >
                  <CheckCircle className="w-3 h-3" />
                  <span>One special character</span>
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || passwordStrength < 50}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating Password...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Update Password
                </div>
              )}
            </Button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-purple-300 hover:text-purple-200 text-sm transition-colors inline-flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to Sign In
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}

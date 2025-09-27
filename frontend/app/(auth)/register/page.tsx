"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Loader2,
  Github,
  Chrome,
  AlertCircle,
  Sparkles,
  Play,
  Shield,
  Check,
} from "lucide-react"

export default function RegisterPage() {
  const { register, socialLogin, isLoading } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  const validatePassword = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/[0-9]/.test(password)) strength++
    if (/[^A-Za-z0-9]/.test(password)) strength++
    return strength
  }

  useEffect(() => {
    setPasswordStrength(validatePassword(formData.password))
  }, [formData.password])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    } else if (passwordStrength < 3) {
      newErrors.password = "Password is too weak. Include uppercase, lowercase, numbers, and symbols."
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!agreedToTerms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy"
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
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      })

      toast({
        title: "Account Created!",
        description: "Welcome to WatchParty! Your account has been created successfully.",
        duration: 5000,
      })
    } catch (error: unknown) {
      const errorMessage = (error as { message?: string })?.message || "Registration failed. Please try again."
      setErrors({ general: errorMessage })
      toast({
        title: "Registration Failed",
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
    } catch (error: unknown) {
      toast({
        title: "Social Registration Failed",
        description: (error as { message?: string })?.message || `Failed to register with ${provider}`,
        variant: "destructive",
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 1) return "bg-red-500"
    if (passwordStrength <= 2) return "bg-yellow-500"
    if (passwordStrength <= 3) return "bg-blue-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 1) return "Weak"
    if (passwordStrength <= 2) return "Fair"
    if (passwordStrength <= 3) return "Good"
    return "Strong"
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
            <div className="text-white font-medium">Setting up your account...</div>
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center glow-blue">
              <Play className="w-8 h-8 text-white fill-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full animate-pulse flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Join WatchParty</h1>
          <p className="text-gray-400">Create your account and start watching together</p>
        </div>
      </div>

      {/* Error Alert */}
      {errors.general && (
        <Alert className="border-red-500/30 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">{errors.general}</AlertDescription>
        </Alert>
      )}

      {/* Social Registration */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("google")}
            disabled={isSubmitting}
            className="glass-card border-white/20 hover:border-neon-blue/50 hover:bg-neon-blue/10 text-white transition-all duration-300"
          >
            <Chrome className="w-4 h-4 mr-2" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSocialLogin("github")}
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
            <span className="bg-cinema-deep px-2 text-gray-400">Or create with email</span>
          </div>
        </div>
      </div>

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-300 font-medium">
                First Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  className={`pl-10 glass-card border-white/20 focus:border-neon-blue/50 focus:glow-blue text-white placeholder-gray-400 transition-all duration-300 ${
                    errors.firstName ? "border-red-500/50 focus:border-red-500" : ""
                  }`}
                  disabled={isSubmitting}
                  autoComplete="given-name"
                  required
                />
              </div>
              {errors.firstName && (
                <p className="text-red-400 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.firstName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-300 font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className={`pl-10 glass-card border-white/20 focus:border-neon-blue/50 focus:glow-blue text-white placeholder-gray-400 transition-all duration-300 ${
                  errors.lastName ? "border-red-500/50 focus:border-red-500" : ""
                }`}
                disabled={isSubmitting}
                autoComplete="family-name"
                required
              />
              {errors.lastName && (
                <p className="text-red-400 text-xs flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-300 font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`pl-10 glass-card border-white/20 focus:border-neon-blue/50 focus:glow-blue text-white placeholder-gray-400 transition-all duration-300 ${
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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pl-10 pr-10 glass-card border-white/20 focus:border-neon-blue/50 focus:glow-blue text-white placeholder-gray-400 transition-all duration-300 ${
                  errors.password ? "border-red-500/50 focus:border-red-500" : ""
                }`}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Password strength:</span>
                  <span
                    className={`font-medium ${
                      passwordStrength <= 1
                        ? "text-red-400"
                        : passwordStrength <= 2
                          ? "text-yellow-400"
                          : passwordStrength <= 3
                            ? "text-blue-400"
                            : "text-green-400"
                    }`}
                  >
                    {getPasswordStrengthText()}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1">
                  <div
                    className={`h-1 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {errors.password && (
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-gray-300 font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className={`pl-10 pr-10 glass-card border-white/20 focus:border-neon-blue/50 focus:glow-blue text-white placeholder-gray-400 transition-all duration-300 ${
                  errors.confirmPassword ? "border-red-500/50 focus:border-red-500" : ""
                } ${
                  formData.confirmPassword && formData.password === formData.confirmPassword
                    ? "border-green-500/50"
                    : ""
                }`}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-red-400 text-sm flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={(checked) => {
                setAgreedToTerms(checked as boolean)
                if (errors.terms) {
                  setErrors((prev) => ({ ...prev, terms: "" }))
                }
              }}
              className="mt-1 border-white/20 data-[state=checked]:bg-neon-blue data-[state=checked]:border-neon-blue"
              disabled={isSubmitting}
            />
            <div className="text-sm text-gray-400 leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-neon-blue hover:text-neon-purple transition-colors">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-neon-blue hover:text-neon-purple transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
          {errors.terms && (
            <p className="text-red-400 text-sm flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              {errors.terms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !agreedToTerms}
          className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/80 hover:to-neon-purple/80 text-white font-semibold py-3 rounded-xl transition-all duration-300 glow-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-neon-blue hover:text-neon-purple font-medium transition-colors">
            Sign in here
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

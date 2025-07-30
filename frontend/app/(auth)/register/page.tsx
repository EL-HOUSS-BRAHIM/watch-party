"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Mail, Lock, User, Play } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import {
  WatchPartyCard,
  WatchPartyCardContent,
  WatchPartyCardDescription,
  WatchPartyCardHeader,
  WatchPartyCardTitle,
} from "@/components/ui/watch-party-card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { authAPI } from "@/lib/api"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { register } = useAuth()
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      })
      return
    }

    if (!agreeToTerms) {
      toast({
        title: "Terms required",
        description: "Please agree to the Terms of Service to continue.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      await register({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      })
      toast({
        title: "Welcome to WatchParty!",
        description: "Your account has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-watch-party-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8 animate-slide-in-cinema">
          <Link href="/" className="inline-flex items-center space-x-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-watch-party-gradient group-hover:shadow-watch-party-glow transition-all duration-200">
              <Play className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-watch-party-text-primary">WatchParty</span>
          </Link>
        </div>

        <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300 animate-slide-in-cinema">
          <WatchPartyCardHeader className="text-center">
            <WatchPartyCardTitle className="text-2xl">Join WatchParty</WatchPartyCardTitle>
            <WatchPartyCardDescription>Create your account to start watching with friends</WatchPartyCardDescription>
          </WatchPartyCardHeader>

          <WatchPartyCardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-watch-party-text-primary">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-watch-party-text-secondary" />
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="pl-10 bg-watch-party-surface border-watch-party-border text-watch-party-text-primary placeholder:text-watch-party-muted focus:border-watch-party-primary focus:ring-watch-party-primary"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-watch-party-text-primary">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-watch-party-surface border-watch-party-border text-watch-party-text-primary placeholder:text-watch-party-muted focus:border-watch-party-primary focus:ring-watch-party-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-watch-party-text-primary">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-watch-party-text-secondary" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-10 bg-watch-party-surface border-watch-party-border text-watch-party-text-primary placeholder:text-watch-party-muted focus:border-watch-party-primary focus:ring-watch-party-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-watch-party-text-primary">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-watch-party-text-secondary" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-watch-party-surface border-watch-party-border text-watch-party-text-primary placeholder:text-watch-party-muted focus:border-watch-party-primary focus:ring-watch-party-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-watch-party-text-secondary hover:text-watch-party-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-watch-party-text-primary">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-watch-party-text-secondary" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-10 pr-10 bg-watch-party-surface border-watch-party-border text-watch-party-text-primary placeholder:text-watch-party-muted focus:border-watch-party-primary focus:ring-watch-party-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-watch-party-text-secondary hover:text-watch-party-primary transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeToTerms}
                  onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
                  className="border-watch-party-border data-[state=checked]:bg-watch-party-primary data-[state=checked]:border-watch-party-primary"
                />
                <Label htmlFor="terms" className="text-sm text-watch-party-text-secondary">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-watch-party-primary hover:text-watch-party-secondary transition-colors"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-watch-party-primary hover:text-watch-party-secondary transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <WatchPartyButton type="submit" variant="gradient" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating Account..." : "Create Account"}
              </WatchPartyButton>
            </form>

            <div className="mt-6 text-center">
              <p className="text-watch-party-text-secondary">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-watch-party-primary hover:text-watch-party-secondary transition-colors font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Social Registration */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-watch-party-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-watch-party-surface text-watch-party-text-secondary">Or sign up with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <WatchPartyButton 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = authAPI.getSocialAuthUrl('google')}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Google
                </WatchPartyButton>
                <WatchPartyButton 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = authAPI.getSocialAuthUrl('github')}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.024-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.747 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                  GitHub
                </WatchPartyButton>
              </div>
            </div>
          </WatchPartyCardContent>
        </WatchPartyCard>
      </div>
    </div>
  )
}

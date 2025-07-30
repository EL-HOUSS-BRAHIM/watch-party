"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { AuthAPI } from "@/lib/api/auth"
import { UsersAPI } from "@/lib/api/users"
import type { User as APIUser, AuthResponse, RegisterData as APIRegisterData } from "@/lib/api/types"

// Initialize API instances directly
const authAPI = new AuthAPI()
const usersAPI = new UsersAPI()

// Extended user interface for the frontend context  
interface User extends Omit<APIUser, 'avatar'> {
  avatar?: string | null // Allow both null and undefined for compatibility
  role?: "user" | "admin" | "moderator"
  isEmailVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
  resendVerification: () => Promise<void>
  socialLogin: (provider: "google" | "github") => Promise<void>
  refreshToken: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  updateUser: (userData: Partial<User>) => void
  refreshUser: () => Promise<void>
}

interface RegisterData extends APIRegisterData {
  // Keep the same structure as API but allow for frontend-specific extensions
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const isAuthenticated = !!user

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Auto-refresh token
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(
        () => {
          refreshToken().catch(() => {
            // If refresh fails, logout user
            logout()
          })
        },
        14 * 60 * 1000,
      ) // Refresh every 14 minutes

      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const checkAuthStatus = async () => {
    try {
      // Check if we're in the browser environment
      if (typeof window === 'undefined') {
        setIsLoading(false)
        return
      }

      const token = localStorage.getItem("access_token")
      if (!token) {
        setIsLoading(false)
        return
      }

      const userData = await authAPI.getProfile()
      setUser({ ...userData, avatar: userData.avatar || undefined })
    } catch (error) {
      console.error("Auth check failed:", error)
      if (typeof window !== 'undefined') {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })

      if (typeof window !== 'undefined') {
        localStorage.setItem("access_token", response.access_token)
        localStorage.setItem("refresh_token", response.refresh_token)
      }
      
      const user = { 
        ...response.user, 
        avatar: response.user.avatar || undefined,
        role: ("user" as "user" | "admin" | "moderator") // Default role, could be determined from backend
      }
      setUser(user)

      // Redirect based on user role
      if (user.role === "admin") {
        router.push("/dashboard/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await authAPI.register(userData)

      // Auto-login after successful registration
      if (response.access_token && response.refresh_token) {
        if (typeof window !== 'undefined') {
          localStorage.setItem("access_token", response.access_token)
          localStorage.setItem("refresh_token", response.refresh_token)
        }
        setUser({ 
          ...response.user, 
          avatar: response.user.avatar || undefined,
          role: ("user" as "user" | "admin" | "moderator")
        })
        router.push("/dashboard")
      } else {
        // Email verification required
        router.push("/login?message=Please check your email to verify your account")
      }
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API call failed:", error)
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
      setUser(null)
      router.push("/login")
    }
  }

  const forgotPassword = async (email: string) => {
    try {
      await authAPI.forgotPassword({ email })
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      await authAPI.resetPassword({ 
        token, 
        new_password: password,
        confirm_password: password 
      })
    } catch (error) {
      throw error
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      await authAPI.verifyEmail(token)

      // Update user data
      if (user) {
        setUser({ ...user, isEmailVerified: true })
      }
    } catch (error) {
      throw error
    }
  }

  const resendVerification = async () => {
    try {
      // Note: This endpoint may need to be added to the backend
      await authAPI.verifyEmail("") // Placeholder - needs backend implementation
    } catch (error) {
      throw error
    }
  }

  const socialLogin = async (provider: "google" | "github") => {
    try {
      // Get OAuth redirect URL from backend
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
      const redirectUri = `${window.location.origin}/callback?provider=${provider}`
      
      const response = await fetch(`${baseURL}/api/auth/social/${provider}/redirect/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          redirect_uri: redirectUri,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get OAuth URL")
      }

      const data = await response.json()
      
      if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        throw new Error("No redirect URL received")
      }
    } catch (error) {
      console.error("Social login error:", error)
      throw error
    }
  }

  const refreshToken = async () => {
    try {
      if (typeof window === 'undefined') {
        throw new Error("Cannot refresh token on server side")
      }

      const refreshToken = localStorage.getItem("refresh_token")
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await authAPI.refreshToken()
      localStorage.setItem("access_token", response.access)

      // Get updated user data
      const userData = await authAPI.getProfile()
      setUser({ ...userData, avatar: userData.avatar || undefined })
    } catch (error) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
      setUser(null)
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      // Convert User data to UserProfile format for the API
      const profileData = {
        bio: (data as any).bio,
        timezone: (data as any).timezone,
        language: (data as any).language,
        // Add other profile fields as needed
      }
      
      const response = await usersAPI.updateProfile(profileData)
      setUser({ 
        ...response, 
        ...response.profile,
        avatar: response.avatar || undefined 
      })
    } catch (error) {
      throw error
    }
  }

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null)
  }

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem("access_token")
      if (token) {
        const userData = await authAPI.getProfile()
        setUser(userData)
      }
    } catch (error) {
      console.error("Failed to refresh user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    socialLogin,
    refreshToken,
    updateProfile,
    updateUser,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

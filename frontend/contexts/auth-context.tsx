"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  username: string
  firstName: string
  lastName: string
  avatar?: string
  role: "user" | "admin" | "moderator"
  isEmailVerified: boolean
  subscription?: {
    plan: string
    status: string
    expiresAt: string
  }
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
}

interface RegisterData {
  email: string
  password: string
  username: string
  firstName: string
  lastName: string
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
      const token = localStorage.getItem("accessToken")
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch("/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, try to refresh
        await refreshToken()
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      setUser(data.user)

      // Redirect based on user role
      if (data.user.role === "admin") {
        router.push("/dashboard/admin")
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      throw error
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      // Auto-login after successful registration
      if (data.access && data.refresh) {
        localStorage.setItem("accessToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)
        setUser(data.user)
        router.push("/dashboard")
      } else {
        // Email verification required
        router.push("/login?message=Please check your email to verify your account")
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("refreshToken")
    setUser(null)
    router.push("/login")
  }

  const forgotPassword = async (email: string) => {
    try {
      const response = await fetch("/api/auth/forgot-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email")
      }
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await fetch("/api/auth/reset-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password")
      }
    } catch (error) {
      throw error
    }
  }

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify-email/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Email verification failed")
      }

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
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/auth/resend-verification/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to resend verification email")
      }
    } catch (error) {
      throw error
    }
  }

  const socialLogin = async (provider: "google" | "github") => {
    try {
      // Redirect to social auth endpoint
      window.location.href = `/api/auth/social/${provider}/`
    } catch (error) {
      throw error
    }
  }

  const refreshToken = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (!refreshToken) {
        throw new Error("No refresh token available")
      }

      const response = await fetch("/api/auth/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error("Token refresh failed")
      }

      localStorage.setItem("accessToken", data.access)

      // Get updated user data
      const userResponse = await fetch("/api/auth/user/", {
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      })

      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData)
      }
    } catch (error) {
      localStorage.removeItem("accessToken")
      localStorage.removeItem("refreshToken")
      setUser(null)
      throw error
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to update profile")
      }

      setUser(responseData)
    } catch (error) {
      throw error
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

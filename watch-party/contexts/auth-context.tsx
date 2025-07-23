"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService } from "@/lib/api"

interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  avatar?: string
  is_staff: boolean
  is_verified: boolean
  subscription?: {
    plan: "free" | "premium"
    status: "active" | "cancelled" | "expired"
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("auth_token")
    if (token) {
      refreshUser()
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password)
      const { access_token, refresh_token, user } = response

      localStorage.setItem("auth_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      setUser(user)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Login failed")
    }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      const response = await authService.register(email, password, firstName, lastName)
      const { access_token, refresh_token, user } = response

      localStorage.setItem("auth_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)
      setUser(user)
    } catch (error: any) {
      throw new Error(error.response?.data?.detail || "Registration failed")
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (error) {
      // Even if logout fails on server, clear local storage
      console.error("Logout error:", error)
    } finally {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      setUser(null)
    }
  }

  const refreshUser = async () => {
    try {
      setIsLoading(true)
      const response = await authService.getProfile()
      setUser(response)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      localStorage.removeItem("auth_token")
      localStorage.removeItem("refresh_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

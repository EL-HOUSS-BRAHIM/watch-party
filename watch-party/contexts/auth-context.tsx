"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "user" | "admin"
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
  register: (name: string, email: string, password: string) => Promise<void>
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
    const response = await api.post("/auth/login", { email, password })
    const { token, user } = response

    localStorage.setItem("auth_token", token)
    setUser(user)
  }

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post("/auth/register", { name, email, password })
    const { token, user } = response

    localStorage.setItem("auth_token", token)
    setUser(user)
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    setUser(null)
  }

  const refreshUser = async () => {
    try {
      const user = await api.get("/auth/me")
      setUser(user)
    } catch (error) {
      localStorage.removeItem("auth_token")
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

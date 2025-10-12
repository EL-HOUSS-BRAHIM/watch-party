"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { authApi, type User } from "@/lib/api-client"

interface SessionResponse {
  isAuthenticated: boolean
  user: User | null
}

async function fetchSession(): Promise<SessionResponse> {
  try {
    // Use the session endpoint which checks cookies
    const response = await fetch('/api/auth/session', {
      credentials: 'include',
    })
    
    if (!response.ok) {
      return { isAuthenticated: false, user: null }
    }
    
    const data = await response.json()
    
    return {
      isAuthenticated: data.authenticated || false,
      user: data.user || null
    }
  } catch (error) {
    console.error("Failed to load session", error)
    return { isAuthenticated: false, user: null }
  }
}

async function performLogout(): Promise<void> {
  await authApi.logout()
}

export const session = {
  get: fetchSession,
  logout: performLogout,
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const loadSession = useCallback(async () => {
    setIsLoading(true)

    const sessionData = await fetchSession()
    setIsAuthenticated(sessionData.isAuthenticated)
    setUser(sessionData.user)

    setIsLoading(false)
  }, [])

  useEffect(() => {
    void loadSession()
  }, [loadSession])

  const logout = useCallback(async () => {
    try {
      await performLogout()
    } catch (error) {
      console.error("Failed to log out", error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
      router.push("/auth/login")
    }
  }, [router])

  return {
    user,
    isAuthenticated,
    isLoading,
    refresh: loadSession,
    logout,
  }
}

export function useRequireAuth(redirectUrl: string = "/auth/login") {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentPath = `${window.location.pathname}${window.location.search}`
      const redirectTo = encodeURIComponent(currentPath)
      router.push(`${redirectUrl}?redirect=${redirectTo}`)
    }
  }, [isAuthenticated, isLoading, redirectUrl, router])

  return { isAuthenticated, isLoading }
}


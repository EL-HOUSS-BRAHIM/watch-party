"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { User } from "@/lib/api-client"

interface SessionResponse {
  isAuthenticated: boolean
  user: User | null
}

async function fetchSession(): Promise<SessionResponse> {
  try {
    const response = await fetch("/api/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    })

    if (!response.ok) {
      if (response.status === 401) {
        return { isAuthenticated: false, user: null }
      }

      throw new Error("Unable to verify authentication status")
    }

    const data = await response.json()
    return {
      isAuthenticated: Boolean(data.authenticated),
      user: data.user ?? null,
    }
  } catch (error) {
    console.error("Failed to load session", error)
    return { isAuthenticated: false, user: null }
  }
}

async function performLogout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
    credentials: "include",
  })

  if (!response.ok) {
    throw new Error("Failed to sign out")
  }
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


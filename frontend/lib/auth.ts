'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Authentication utility functions
 */
export const auth = {
  /**
   * Check if user is authenticated (has valid access token)
   */
  isAuthenticated: (): boolean => {
    if (typeof window === 'undefined') return false
    const token = localStorage.getItem('access_token')
    return !!token
  },

  /**
   * Get access token
   */
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('access_token')
  },

  /**
   * Get refresh token
   */
  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  },

  /**
   * Clear all auth tokens (logout)
   */
  clearTokens: (): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  },

  /**
   * Set auth tokens (login)
   */
  setTokens: (accessToken: string, refreshToken?: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem('access_token', accessToken)
    if (refreshToken) {
      localStorage.setItem('refresh_token', refreshToken)
    }
  }
}

/**
 * Hook for authentication state
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication on mount and when storage changes
    const checkAuth = () => {
      const authenticated = auth.isAuthenticated()
      setIsAuthenticated(authenticated)
      setIsLoading(false)
    }

    checkAuth()

    // Listen for storage changes (logout from another tab)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token') {
        checkAuth()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = (accessToken: string, refreshToken?: string) => {
    auth.setTokens(accessToken, refreshToken)
    setIsAuthenticated(true)
  }

  const logout = () => {
    auth.clearTokens()
    setIsAuthenticated(false)
    router.push('/auth/login')
  }

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getAccessToken: auth.getAccessToken,
    getRefreshToken: auth.getRefreshToken,
  }
}

/**
 * Hook for protected routes - redirects to login if not authenticated
 */
export function useRequireAuth(redirectUrl: string = '/auth/login') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store the attempted URL to redirect back after login
      const currentPath = window.location.pathname
      const redirectTo = encodeURIComponent(currentPath)
      router.push(`${redirectUrl}?redirect=${redirectTo}`)
    }
  }, [isAuthenticated, isLoading, router, redirectUrl])

  return { isAuthenticated, isLoading }
}

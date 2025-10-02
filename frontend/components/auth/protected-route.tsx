'use client'

import { useRequireAuth } from '@/lib/auth'
import type { ReactNode } from 'react'

type ProtectedRouteProps = {
  children: ReactNode
  redirectTo?: string
}

/**
 * ProtectedRoute - Wraps components that require authentication
 * Automatically redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children, redirectTo = '/auth/login' }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useRequireAuth(redirectTo)

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand-purple border-t-transparent"></div>
          <p className="text-white/70">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Only render children if authenticated (otherwise useRequireAuth handles redirect)
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}

"use client"

import type * as React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent } from "@/components/ui/card"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallback?: React.ReactElement | null
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallback,
  redirectTo,
}: ProtectedRouteProps): React.ReactElement | null {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isLoading) return

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      const redirect = redirectTo || `/login?redirect=${encodeURIComponent(window.location.pathname)}`
      router.push(redirect)
      return
    }

    // If admin access is required but user is not admin
    if (requireAdmin && (!isAuthenticated || !isAdmin)) {
      router.push("/dashboard")
      return
    }

    // If user is authenticated but shouldn't be (e.g., login page)
    if (!requireAuth && isAuthenticated) {
      router.push("/dashboard")
      return
    }

    setShouldRender(true)
  }, [isLoading, isAuthenticated, isAdmin, requireAuth, requireAdmin, router, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Loading...</h3>
              <p className="text-muted-foreground">Please wait while we verify your authentication</p>
            </CardContent>
          </Card>
        </div>
      )
    )
  }

  // Don't render anything while redirecting
  if (!shouldRender) {
    return null
  }

  return <>{children}</>
}

// Higher-order component for easier usage
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, "children"> = {},
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Hook for checking auth status in components
export function useRequireAuth(requireAdmin = false) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoading) return

    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`)
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, isAdmin, isLoading, requireAdmin, router])

  return {
    isAuthenticated,
    isAdmin,
    loading: isLoading,
    canAccess: isAuthenticated && (!requireAdmin || isAdmin),
  }
}

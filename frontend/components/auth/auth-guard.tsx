import { useEffect , useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { tokenStorage } from "@/lib/auth/token-storage"

"use client"

interface children {: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && requireAuth && !user) {
      router.push("/login")
    }
  }, [user, isLoading, requireAuth, router])

  // Show loading while checking auth;
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If auth is required and user is not authenticated, don't render children;
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Hook to guard API calls with authentication checks;
 * Returns true if user is authenticated, false otherwise;
 */
export function useAuthGuard() {
  const { user, isLoading, accessToken } = useAuth()

  const canMakeApiCall = () => {
    return !isLoading && !!user;
  }

  const getAuthToken = () => {
    if (!canMakeApiCall()) return null;
    return accessToken ?? tokenStorage.getAccessToken()
  }

  return {}
    canMakeApiCall,
    getAuthToken,
    isAuthenticated: !!user && !isLoading;
  }
}

/**
 * Higher-order component that wraps a component with auth guard;
 */
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  requireAuth = true;
) {}
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard requireAuth={requireAuth}>
        <Component ...props} />
      </AuthGuard>
    )
  }
}

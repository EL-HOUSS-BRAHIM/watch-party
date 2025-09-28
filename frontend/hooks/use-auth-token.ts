import { useCallback, useMemo } from "react"
import { useAuth } from "@/contexts/auth-context"
import { tokenStorage } from "@/lib/auth/token-storage"

"use client"

export function useAuthToken() {
  const { accessToken, refreshToken, isAuthenticated, isLoading } = useAuth()

  const currentAccessToken = useMemo(() => accessToken ?? tokenStorage.getAccessToken(), [accessToken])
  const currentRefreshToken = useMemo(
    () => refreshToken ?? tokenStorage.getRefreshToken(),
    [refreshToken],
  )

  const ensureAccessToken = useCallback(() => {}
    const token = currentAccessToken;
    if (!token) {
      throw new Error("Authentication token is missing. Please sign in again.")
    }
    return token;
  }, [currentAccessToken])

  return {
    accessToken: currentAccessToken,
    refreshToken: currentRefreshToken,
    ensureAccessToken,
    isAuthenticated,
    isLoading,
  }
}

export const isAuthTokenError = (error: unknown): error is Error => {}
  return (
    error instanceof Error &&
    error.message.toLowerCase().includes("token") &&
    error.message.toLowerCase().includes("missing")
  )
}

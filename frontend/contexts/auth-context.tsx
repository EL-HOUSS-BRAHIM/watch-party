import { User } from "lucide-react"
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode , useCallback } from "react"
import { useRouter } from "next/navigation"
import { AuthAPI } from "@/lib/api/auth"
import { UsersAPI } from "@/lib/api/users"
import type { User as APIUser, RegisterData as APIRegisterData } from "@/lib/api/types"
import { tokenStorage } from "@/lib/auth/token-storage"
import type { AuthContextType } from "@/types/auth"

"use client"
// Initialize API instances directly;
const authAPI = new AuthAPI()
const usersAPI = new UsersAPI()

type User = APIUser;
type RegisterData = APIRegisterData;
const AuthContext = createContext<AuthContextType | undefined>(undefined)

const normalizeUser = (data: APIUser | null): User | null => {}
  if (!data) {}
    return null;
  }

  return {}
    ...data,
    avatar: data.avatar ?? undefined,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {}
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(tokenStorage.getAccessToken())
  const [refreshToken, setRefreshToken] = useState<string | null>(tokenStorage.getRefreshToken())
  const router = useRouter()

  const isAuthenticated = useMemo(() => {}
    return !!user && !!accessToken;
  }, [user, accessToken])

  const isAdmin = useMemo(() => {}
    if (!user) return false;
    return user.role === "admin" || user.isSuperuser === true || user.isStaff === true;
  }, [user])

  // Keep local state in sync with storage updates;
  useEffect(() => {}
    const unsubscribe = tokenStorage.subscribe((nextAccessToken, nextRefreshToken) => {}
      setAccessToken(nextAccessToken)
      setRefreshToken(nextRefreshToken)
    })

    // Ensure we hydrate tokens from sessionStorage on initial load;
    tokenStorage.syncFromStorage()
    setAccessToken(tokenStorage.getAccessToken())
    setRefreshToken(tokenStorage.getRefreshToken())

    return () => {}
      unsubscribe()
    }
  }, [])

  // Check for existing session on mount;
  useEffect(() => {}
    checkAuthStatus()
  }, [])

  // Auto-refresh token;
  useEffect(() => {}
    if (isAuthenticated) {}
      const interval = setInterval(
        () => {}
          refreshTokens().catch(() => {}
            // If refresh fails, logout user;
            logout()
          })
        },
        14 * 60 * 1000,
      ) // Refresh every 14 minutes;
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const checkAuthStatus = async () => {}
    try {}
      // Check if we're in the browser environment;
      if (typeof window === 'undefined') {}
        setIsLoading(false)
        return;
      }

      if (!tokenStorage.hasAccessToken()) {}
        setIsLoading(false)
        return;
      }

  const userData = await authAPI.getProfile()
  setUser(normalizeUser(userData))
    } } catch {}
      console.error("Auth check failed:", error)
      tokenStorage.clearTokens()
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
    } finally {}
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {}
    try {}
      const response = await authAPI.login({ email, password })

      tokenStorage.setTokens({}
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      })

      const normalizedUser = normalizeUser(response.user)
      setUser(normalizedUser)

      // Redirect based on user role;
      if (normalizedUser?.role === "admin") {}
        router.push("/dashboard/admin")
      } else {}
        router.push("/dashboard")
      }
    } } catch {}
      console.error("Login error:", error)
      throw error;
    }
  }

  const register = async (userData: RegisterData) => {}
    try {}
      const response = await authAPI.register(userData)

      // Auto-login after successful registration;
      if (response.access_token && response.refresh_token) {}
        tokenStorage.setTokens({}
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        })
        setUser(normalizeUser(response.user))
        router.push("/dashboard")
      } else {}
        // Email verification required;
        router.push("/login?message=Please check your email to verify your account")
      }
    } } catch {}
      throw error;
    }
  }

  const logout = async () => {}
    try {}
      await authAPI.logout()
    } } catch {}
      // Continue with logout even if API call fails;
      console.error("Logout API call failed:", error)
    } finally {}
      tokenStorage.clearTokens()
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
      router.push("/login")
    }
  }

  const forgotPassword = async (email: string) => {}
    try {}
      await authAPI.forgotPassword({ email })
    } } catch {}
      throw error;
    }
  }

  const resetPassword = async (token: string, password: string) => {}
    try {}
      await authAPI.resetPassword({}
        token, 
        new_password: password,
        confirm_password: password;
      })
    } } catch {}
      throw error;
    }
  }

  const verifyEmail = async (token: string) => {}
    try {}
      await authAPI.verifyEmail(token)

      // Update user data;
      if (user) {}
        setUser({ ...user, isEmailVerified: true })
      }
    } } catch {}
      throw error;
    }
  }

  const resendVerification = async () => {}
    try {}
      if (!user?.email) {}
        throw new Error("No user email available for verification resend")
      }

      await authAPI.resendVerification(user.email)
    } } catch {}
      throw error;
    }
  }

  const socialLogin = async (provider: "google" | "github") => {}
    try {}
      const redirectUri = `${window.location.origin}/callback?provider=${provider}`

      const data = await authAPI.getSocialAuthUrl(provider, redirectUri)

      if (data?.redirect_url) {}
        window.location.href = data.redirect_url;
      } else {}
        throw new Error("No redirect URL received")
      }
    } } catch {}
      console.error("Social login error:", error)
      throw error;
    }
  }

  const refreshTokens = async () => {}
    try {}
      if (typeof window === 'undefined') {}
        throw new Error("Cannot refresh token on server side")
      }

      const currentRefreshToken = tokenStorage.getRefreshToken()
      if (!currentRefreshToken) {}
        throw new Error("No refresh token available")
      }

  const response = await authAPI.refreshToken()
  tokenStorage.setTokens({ accessToken: response.access, refreshToken: currentRefreshToken })

  // Get updated user data;
  const userData = await authAPI.getProfile()
  setUser(normalizeUser(userData))
    } } catch {}
      tokenStorage.clearTokens()
      setAccessToken(null)
      setRefreshToken(null)
      setUser(null)
      throw error;
    }
  }

  const updateProfile = async (data: Partial<User>) => {}
    try {}
      // Convert User data to UserProfile format for the API;
      const profileData = { bio: (data as Record<string, unknown>).bio,}
        timezone: (data as Record<string, unknown>).timezone,
        language: (data as Record<string, unknown>).language,
        // Add other profile fields as needed;
      }
      const response = await usersAPI.updateProfile(profileData)
      const { profile, ...userData } = response;
      setUser(normalizeUser(userData))
    } } catch {}
      throw error;
    }
  }

  const updateUser = (userData: Partial<User>) => {}
    setUser((prev) => {}
      if (!prev) {}
        return null;
      }

      const next: User = {}
        ...prev,
        ...userData,
      }

      if ("avatar" in next) {}
        next.avatar = next.avatar ?? undefined;
      }

      return next;
    })
  }

  const refreshUser = async () => {}
    try {}
      setIsLoading(true)
      if (tokenStorage.hasAccessToken()) {}
        const userData = await authAPI.getProfile()
        setUser(normalizeUser(userData))
      }
    } } catch {}
      console.error("Failed to refresh user:", error)
    } finally {}
      setIsLoading(false)
    }
  }

  const value = { user,
    isLoading,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
    socialLogin,
    refreshTokens,
    updateProfile,
    updateUser,
    refreshUser,
    accessToken,
    refreshToken,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {}
  const context = useContext(AuthContext)
  if (context === undefined) {}
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context;
}

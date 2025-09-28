import { User } from "lucide-react"
import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { transformAuthResponse, transformTwoFactorVerifyResponse, transformUser } from "./transformers"
import { tokenStorage } from "@/lib/auth/token-storage"
import { environment, isBrowser } from "@/lib/config/env"
import type {}

/**
 * Enhanced Authentication API Service;
 * Handles all authentication-related API calls including social auth and session management;
 */

  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  RawAuthResponse,
  RawTwoFactorVerifyResponse,
  RawUser,
  User,
  APIResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse,
} from "./types"

export class AuthAPI {}
  /**
   * Register a new user;
   */
  async register(userData: RegisterData): Promise<AuthResponse> {}
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.register, userData)
    return transformAuthResponse(response)
  }

  /**
   * Login user with email and password;
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {}
    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.login, credentials)
    return transformAuthResponse(response)
  }

  /**
   * Logout user and blacklist refresh token;
   */
  async logout(): Promise<APIResponse> {}
    const refreshToken = tokenStorage.getRefreshToken()
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.logout, {}
      refresh_token: refreshToken,
    })
  }

  /**
   * Refresh access token;
   */
  async refreshToken(): Promise<{ access: string }> {}
    if (!isBrowser) {
      throw new Error("Cannot refresh token on server side")
    }

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    return apiClient.post<{ access: string }>(API_ENDPOINTS.auth.refresh, {}
      refresh: refreshToken,
    })
  }

  /**
   * Request password reset;
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.forgotPassword, data)
  }

  /**
   * Reset password with token;
   */
  async resetPassword(data: ResetPasswordRequest): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.resetPassword, data)
  }

  /**
   * Change password for authenticated user;
   */
  async changePassword(data: ChangePasswordRequest): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.changePassword, data)
  }

  /**
   * Verify email with token;
   */
  async verifyEmail(token: string): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.verifyEmail, { token })
  }

  /**
   * Get current user profile;
   */
  async getProfile(): Promise<User> {}
    const profile = await apiClient.get<RawUser>(API_ENDPOINTS.auth.profile)
    return transformUser(profile)
  }

  /**
   * Setup two-factor authentication;
   */
  async setup2FA(): Promise<TwoFactorSetupResponse> {}
    return apiClient.post<TwoFactorSetupResponse>(API_ENDPOINTS.auth.twoFactorSetup)
  }

  /**
   * Verify two-factor authentication code;
   */
  async verify2FA(
    code: string,
    options?: {}
      is_backup_code?: boolean;
      context?: string;
      temp_token?: string;
      email?: string;
    },
  ): Promise<TwoFactorVerifyResponse> {}
    const response = await apiClient.post<RawTwoFactorVerifyResponse>(
      API_ENDPOINTS.auth.twoFactorVerify,
      {}
        token: code,
        code,
        ...options,
      },
    )
    return transformTwoFactorVerifyResponse(response)
  }

  /**
   * Resend email verification;
   */
  async resendVerification(email: string): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.resendVerification, { email })
  }

  /**
   * Disable two-factor authentication;
   */
  async disable2FA(password?: string): Promise<APIResponse> {}
    return apiClient.delete<APIResponse>(API_ENDPOINTS.auth.twoFactorDisable, {}
      data: password ? { password } : undefined,
    })
  }

  /**
   * Get user sessions;
   */
  async getSessions(): Promise<Array<{}
    id: string;
    device: string;
    location: string;
    last_activity: string;
    is_current: boolean;
  }>> {}
    return apiClient.get(API_ENDPOINTS.auth.sessions)
  }

  /**
   * Delete specific session;
   */
  async deleteSession(sessionId: string): Promise<APIResponse> {}
    return apiClient.delete<APIResponse>(API_ENDPOINTS.auth.sessionDelete(sessionId))
  }

  /**
   * Revoke all other sessions;
   */
  async revokeAllSessions(): Promise<APIResponse> {}
    return apiClient.delete<APIResponse>(API_ENDPOINTS.users.revokeAllSessions)
  }

  /**
   * Social Authentication - Get auth URL;
   */
  async getSocialAuthUrl(provider: 'google' | 'github', redirectUri?: string): Promise<{ redirect_url: string }> {}
    const baseURL = environment.apiBaseUrl;
    const defaultRedirectUri = `${window.location.origin}/callback?provider=${provider}`

    const response = await fetch(`${baseURL}/api/auth/social/${provider}/redirect/`, {}
      method: "POST",
      headers: {}
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}
        redirect_uri: redirectUri || defaultRedirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get social auth URL")
    }

    return response.json()
  }

  /**
   * Complete social authentication;
   */
  async completeSocialAuth(provider: string, code: string, state?: string): Promise<AuthResponse> {}
    const redirectUri = `${window.location.origin}/callback?provider=${provider}`

    const response = await apiClient.post<RawAuthResponse>(API_ENDPOINTS.auth.socialAuth(provider), {}
      code,
      state,
      redirect_uri: redirectUri,
    })
    return transformAuthResponse(response)
  }

  /**
   * Generic social auth for any provider;
   */
  getSocialAuthUrlGeneric(provider: string): string {}
    return API_ENDPOINTS.auth.socialAuth(provider)
  }

  /**
   * Google Drive Authentication - Get auth URL;
   */
  async getGoogleDriveAuthUrl(): Promise<{ auth_url: string }> {}
    return apiClient.get(API_ENDPOINTS.auth.googleDriveAuth)
  }

  /**
   * Disconnect Google Drive;
   */
  async disconnectGoogleDrive(): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.googleDriveDisconnect)
  }

  /**
   * Get Google Drive connection status;
   */
  async getGoogleDriveStatus(): Promise<{}
    is_connected: boolean;
    email: string | null;
    permissions: string[]
  }> {}
    return apiClient.get(API_ENDPOINTS.auth.googleDriveStatus)
  }
}

// Export the class but don't instantiate it immediately;
// Instance will be created by the lazy loader in index.ts;
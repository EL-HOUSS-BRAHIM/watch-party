/**
 * Enhanced Authentication API Service
 * Handles all authentication-related API calls including social auth and session management
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  User,
  APIResponse,
} from "./types"

export class AuthAPI {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.register, userData)
  }

  /**
   * Login user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.login, credentials)
  }

  /**
   * Logout user and blacklist refresh token
   */
  async logout(): Promise<APIResponse> {
    // Only access localStorage on client side
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refresh_token") : null
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.logout, {
      refresh_token: refreshToken,
    })
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<{ access: string }> {
    // Only access localStorage on client side
    if (typeof window === 'undefined') {
      throw new Error("Cannot refresh token on server side")
    }

    const refreshToken = localStorage.getItem("refresh_token")
    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    return apiClient.post<{ access: string }>(API_ENDPOINTS.auth.refresh, {
      refresh: refreshToken,
    })
  }

  /**
   * Request password reset
   */
  async forgotPassword(data: ForgotPasswordRequest): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.forgotPassword, data)
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordRequest): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.resetPassword, data)
  }

  /**
   * Change password for authenticated user
   */
  async changePassword(data: ChangePasswordRequest): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.changePassword, data)
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.verifyEmail, { token })
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    return apiClient.get<User>(API_ENDPOINTS.auth.profile)
  }

  /**
   * Setup two-factor authentication
   */
  async setup2FA(): Promise<{
    success: boolean
    qr_code: string
    secret: string
    backup_codes: string[]
  }> {
    return apiClient.post(API_ENDPOINTS.auth.twoFactorSetup)
  }

  /**
   * Verify two-factor authentication code
   */
  async verify2FA(code: string): Promise<AuthResponse> {
    return apiClient.post<AuthResponse>(API_ENDPOINTS.auth.twoFactorVerify, { code })
  }

  /**
   * Resend email verification
   */
  async resendVerification(email: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.resendVerification, { email })
  }

  /**
   * Disable two-factor authentication
   */
  async disable2FA(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.twoFactorDisable)
  }

  /**
   * Get user sessions
   */
  async getSessions(): Promise<Array<{
    id: string
    device: string
    location: string
    last_activity: string
    is_current: boolean
  }>> {
    return apiClient.get(API_ENDPOINTS.auth.sessions)
  }

  /**
   * Delete specific session
   */
  async deleteSession(sessionId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.auth.sessionDelete(sessionId))
  }

  /**
   * Social Authentication - Get auth URL
   */
  async getSocialAuthUrl(provider: 'google' | 'github', redirectUri?: string): Promise<{ redirect_url: string }> {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const defaultRedirectUri = `${window.location.origin}/callback?provider=${provider}`
    
    const response = await fetch(`${baseURL}/api/auth/social/${provider}/redirect/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        redirect_uri: redirectUri || defaultRedirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to get social auth URL")
    }

    return response.json()
  }

  /**
   * Complete social authentication
   */
  async completeSocialAuth(provider: 'google' | 'github', code: string, state?: string): Promise<AuthResponse> {
    const redirectUri = `${window.location.origin}/callback?provider=${provider}`
    
    return apiClient.post<AuthResponse>(`/api/auth/social/${provider}/`, {
      code,
      state,
      redirect_uri: redirectUri,
    })
  }

  /**
   * Generic social auth for any provider
   */
  getSocialAuthUrlGeneric(provider: string): string {
    return API_ENDPOINTS.auth.socialAuth(provider)
  }

  /**
   * Google Drive Authentication - Get auth URL
   */
  async getGoogleDriveAuthUrl(): Promise<{ auth_url: string }> {
    return apiClient.get(API_ENDPOINTS.auth.googleDriveAuth)
  }

  /**
   * Disconnect Google Drive
   */
  async disconnectGoogleDrive(): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.auth.googleDriveDisconnect)
  }

  /**
   * Get Google Drive connection status
   */
  async getGoogleDriveStatus(): Promise<{
    is_connected: boolean
    email: string | null
    permissions: string[]
  }> {
    return apiClient.get(API_ENDPOINTS.auth.googleDriveStatus)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts

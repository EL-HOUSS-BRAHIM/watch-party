/**
 * Authentication API Service
 * Handles all authentication-related API calls
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
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem("refreshToken") : null
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

    const refreshToken = localStorage.getItem("refreshToken")
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
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts

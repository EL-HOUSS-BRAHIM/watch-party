import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from "axios"

// Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: number
}

export interface PaginatedResponse<T = any> {
  results: T[]
  count: number
  next?: string
  previous?: string
  page_size: number
  current_page: number
  total_pages: number
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
  status: number
  code?: string
}

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/ws"

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 30000

// Retry configuration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000

class ApiClient {
  private client: AxiosInstance
  private retryCount: Map<string, number> = new Map()

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // Add request timestamp for debugging
        config.metadata = { startTime: new Date() }

        return config
      },
      (error) => {
        return Promise.reject(this.handleError(error))
      },
    )

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        // Log response time in development
        if (process.env.NODE_ENV === "development") {
          const endTime = new Date()
          const startTime = response.config.metadata?.startTime
          if (startTime) {
            const duration = endTime.getTime() - startTime.getTime()
            console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`)
          }
        }

        return response
      },
      async (error) => {
        const originalRequest = error.config

        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            await this.refreshToken()
            const token = this.getAuthToken()
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`
              return this.client(originalRequest)
            }
          } catch (refreshError) {
            this.handleAuthError()
            return Promise.reject(this.handleError(error))
          }
        }

        // Handle retries for network errors
        if (this.shouldRetry(error) && !originalRequest._retry) {
          const retryKey = `${originalRequest.method}-${originalRequest.url}`
          const currentRetries = this.retryCount.get(retryKey) || 0

          if (currentRetries < MAX_RETRIES) {
            this.retryCount.set(retryKey, currentRetries + 1)
            originalRequest._retry = true

            // Exponential backoff
            const delay = RETRY_DELAY * Math.pow(2, currentRetries)
            await new Promise((resolve) => setTimeout(resolve, delay))

            return this.client(originalRequest)
          } else {
            this.retryCount.delete(retryKey)
          }
        }

        return Promise.reject(this.handleError(error))
      },
    )
  }

  private getAuthToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token")
    }
    return null
  }

  private async refreshToken(): Promise<void> {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null

    if (!refreshToken) {
      throw new Error("No refresh token available")
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/refresh/`, {
        refresh: refreshToken,
      })

      const { access, refresh } = response.data

      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", access)
        if (refresh) {
          localStorage.setItem("refresh_token", refresh)
        }
      }
    } catch (error) {
      // Clear tokens on refresh failure
      if (typeof window !== "undefined") {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
      }
      throw error
    }
  }

  private handleAuthError(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      // Redirect to login page
      window.location.href = "/login"
    }
  }

  private shouldRetry(error: AxiosError): boolean {
    // Retry on network errors or 5xx server errors
    return (
      !error.response ||
      error.code === "NETWORK_ERROR" ||
      error.code === "TIMEOUT" ||
      (error.response.status >= 500 && error.response.status < 600)
    )
  }

  private handleError(error: AxiosError): ApiError {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      return {
        message: data?.message || data?.detail || "An error occurred",
        errors: data?.errors,
        status,
        code: data?.code,
      }
    } else if (error.request) {
      // Network error
      return {
        message: "Network error. Please check your connection.",
        status: 0,
        code: "NETWORK_ERROR",
      }
    } else {
      // Request setup error
      return {
        message: error.message || "An unexpected error occurred",
        status: 0,
        code: "REQUEST_ERROR",
      }
    }
  }

  // HTTP Methods
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config)
    return response.data
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post(url, data, config)
    return response.data
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config)
    return response.data
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config)
    return response.data
  }

  // File upload with progress
  async upload<T = any>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>,
  ): Promise<T> {
    const formData = new FormData()
    formData.append("file", file)

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value)
      })
    }

    const response = await this.client.post<T>(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })

    return response.data
  }

  // Download file
  async download(url: string, filename?: string): Promise<void> {
    const response = await this.client.get(url, {
      responseType: "blob",
    })

    // Create download link
    const blob = new Blob([response.data])
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = filename || "download"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(downloadUrl)
  }

  // WebSocket connection
  createWebSocket(endpoint: string, protocols?: string[]): WebSocket {
    const token = this.getAuthToken()
    const wsUrl = `${WS_BASE_URL}${endpoint}${token ? `?token=${token}` : ""}`

    return new WebSocket(wsUrl, protocols)
  }

  // Utility methods
  setAuthToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("access_token", token)
    }
  }

  clearAuthToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.get("/health/")
      return true
    } catch {
      return false
    }
  }
}

// Create singleton instance
const apiClient = new ApiClient()

// Export specific API modules
export { apiClient }
export default apiClient

// Convenience exports for common patterns
export const api = {
  // Authentication
  auth: {
    login: (credentials: { username: string; password: string }) => apiClient.post("/auth/login/", credentials),
    register: (userData: any) => apiClient.post("/auth/register/", userData),
    logout: () => apiClient.post("/auth/logout/"),
    refreshToken: () => apiClient.post("/auth/refresh/"),
    forgotPassword: (email: string) => apiClient.post("/auth/forgot-password/", { email }),
    resetPassword: (token: string, password: string) => apiClient.post("/auth/reset-password/", { token, password }),
    verifyEmail: (token: string) => apiClient.post("/auth/verify-email/", { token }),
  },

  // Users
  users: {
    getProfile: () => apiClient.get("/users/profile/"),
    updateProfile: (data: any) => apiClient.patch("/users/profile/", data),
    uploadAvatar: (file: File, onProgress?: (progress: number) => void) =>
      apiClient.upload("/users/avatar/", file, onProgress),
    getFriends: (params?: any) => apiClient.get<PaginatedResponse>("/users/friends/", { params }),
    getFriendRequests: () => apiClient.get<PaginatedResponse>("/users/friend-requests/"),
    sendFriendRequest: (userId: string) => apiClient.post("/users/friend-requests/", { user_id: userId }),
    respondToFriendRequest: (requestId: string, action: "accept" | "decline") =>
      apiClient.post(`/users/friend-requests/${requestId}/${action}/`),
  },

  // Videos
  videos: {
    list: (params?: any) => apiClient.get<PaginatedResponse>("/videos/", { params }),
    get: (id: string) => apiClient.get(`/videos/${id}/`),
    upload: (file: File, metadata: any, onProgress?: (progress: number) => void) =>
      apiClient.upload("/videos/upload/", file, onProgress, metadata),
    update: (id: string, data: any) => apiClient.patch(`/videos/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/videos/${id}/`),
    like: (id: string) => apiClient.post(`/videos/${id}/like/`),
    dislike: (id: string) => apiClient.post(`/videos/${id}/dislike/`),
    getComments: (id: string, params?: any) => apiClient.get<PaginatedResponse>(`/videos/${id}/comments/`, { params }),
    addComment: (id: string, content: string) => apiClient.post(`/videos/${id}/comments/`, { content }),
  },

  // Parties
  parties: {
    list: (params?: any) => apiClient.get<PaginatedResponse>("/parties/", { params }),
    get: (id: string) => apiClient.get(`/parties/${id}/`),
    create: (data: any) => apiClient.post("/parties/", data),
    update: (id: string, data: any) => apiClient.patch(`/parties/${id}/`, data),
    delete: (id: string) => apiClient.delete(`/parties/${id}/`),
    join: (id: string) => apiClient.post(`/parties/${id}/join/`),
    leave: (id: string) => apiClient.post(`/parties/${id}/leave/`),
    joinByCode: (roomCode: string) => apiClient.post("/parties/join-by-code/", { room_code: roomCode }),
    getParticipants: (id: string) => apiClient.get(`/parties/${id}/participants/`),
    removeParticipant: (id: string, participantId: string) =>
      apiClient.delete(`/parties/${id}/participants/${participantId}/`),
    getJoinRequests: (id: string) => apiClient.get(`/parties/${id}/join-requests/`),
    handleJoinRequest: (id: string, requestId: string, action: "approve" | "reject") =>
      apiClient.post(`/parties/${id}/join-requests/${requestId}/${action}/`),
  },

  // Chat
  chat: {
    getConversations: (params?: any) => apiClient.get<PaginatedResponse>("/messages/conversations/", { params }),
    getMessages: (conversationId: string, params?: any) =>
      apiClient.get<PaginatedResponse>(`/messages/conversations/${conversationId}/messages/`, { params }),
    sendMessage: (conversationId: string, content: string, messageType?: string) =>
      apiClient.post(`/messages/conversations/${conversationId}/messages/`, {
        content,
        message_type: messageType || "text",
      }),
    markAsRead: (conversationId: string) => apiClient.post(`/messages/conversations/${conversationId}/mark-read/`),
  },

  // Notifications
  notifications: {
    list: (params?: any) => apiClient.get<PaginatedResponse>("/notifications/", { params }),
    markAsRead: (id: string) => apiClient.post(`/notifications/${id}/mark-read/`),
    markAllAsRead: () => apiClient.post("/notifications/mark-all-read/"),
    getPreferences: () => apiClient.get("/notifications/preferences/"),
    updatePreferences: (preferences: any) => apiClient.patch("/notifications/preferences/", preferences),
  },

  // Analytics
  analytics: {
    getDashboard: () => apiClient.get("/analytics/dashboard/"),
    getPartyAnalytics: (partyId: string) => apiClient.get(`/parties/${partyId}/analytics/`),
    getVideoAnalytics: (videoId: string) => apiClient.get(`/videos/${videoId}/analytics/`),
  },

  // Admin
  admin: {
    getDashboard: () => apiClient.get("/admin/dashboard/"),
    getUsers: (params?: any) => apiClient.get<PaginatedResponse>("/admin/users/", { params }),
    updateUser: (userId: string, data: any) => apiClient.patch(`/admin/users/${userId}/`, data),
    getReports: (params?: any) => apiClient.get<PaginatedResponse>("/admin/reports/", { params }),
    handleReport: (reportId: string, action: string, reason?: string) =>
      apiClient.post(`/admin/reports/${reportId}/handle/`, { action, reason }),
    getSystemHealth: () => apiClient.get("/admin/system-health/"),
  },

  // Billing
  billing: {
    getSubscription: () => apiClient.get("/billing/subscription/"),
    getPlans: () => apiClient.get("/billing/plans/"),
    subscribe: (planId: string, paymentMethodId: string) =>
      apiClient.post("/billing/subscribe/", { plan_id: planId, payment_method_id: paymentMethodId }),
    cancelSubscription: () => apiClient.post("/billing/cancel-subscription/"),
    getPaymentMethods: () => apiClient.get("/billing/payment-methods/"),
    addPaymentMethod: (paymentMethodId: string) =>
      apiClient.post("/billing/payment-methods/", { payment_method_id: paymentMethodId }),
    removePaymentMethod: (id: string) => apiClient.delete(`/billing/payment-methods/${id}/`),
    getBillingHistory: (params?: any) => apiClient.get<PaginatedResponse>("/billing/history/", { params }),
  },
}

// Error handling utilities
export const isApiError = (error: any): error is ApiError => {
  return error && typeof error.message === "string" && typeof error.status === "number"
}

export const getErrorMessage = (error: any): string => {
  if (isApiError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return "An unexpected error occurred"
}

export const getFieldErrors = (error: any): Record<string, string[]> => {
  if (isApiError(error) && error.errors) {
    return error.errors
  }
  return {}
}

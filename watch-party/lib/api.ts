/**
 * API Configuration for Watch Party Frontend
 * 
 * This file configures the API endpoints for the Django backend
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API Base URLs from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000'

// Create main API instance for Django backend
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Use JWT tokens instead of cookies
})

// Legacy exports for backward compatibility
export const djangoApi = api
export const phpApi = api // For components still using phpApi
export const pythonApi = api // For components still using pythonApi

// Request interceptor to add JWT authentication
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error) => {
    const originalRequest = error.config
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Try to refresh token
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token')
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
              refresh: refreshToken
            })
            
            const { access } = response.data
            localStorage.setItem('auth_token', access)
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`
            return api(originalRequest)
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('auth_token')
            localStorage.removeItem('refresh_token')
            window.location.href = '/login'
          }
        } else {
          // No refresh token, redirect to login
          localStorage.removeItem('auth_token')
          window.location.href = '/login'
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// Django API endpoint configurations
export const API_ENDPOINTS = {
  // Authentication endpoints
  auth: {
    login: '/api/auth/login/',
    register: '/api/auth/register/',
    logout: '/api/auth/logout/',
    refresh: '/api/auth/refresh/',
    profile: '/api/auth/profile/',
    resetPassword: '/api/auth/reset-password/',
    forgotPassword: '/api/auth/forgot-password/',
    changePassword: '/api/auth/change-password/',
    verifyEmail: '/api/auth/verify-email/',
    resendVerification: '/api/auth/resend-verification/',
  },
  
  // Party/Room management endpoints
  parties: {
    list: '/api/parties/',
    create: '/api/parties/',
    get: (id: string) => `/api/parties/${id}/`,
    update: (id: string) => `/api/parties/${id}/`,
    delete: (id: string) => `/api/parties/${id}/`,
    join: (id: string) => `/api/parties/${id}/join/`,
    leave: (id: string) => `/api/parties/${id}/leave/`,
    start: (id: string) => `/api/parties/${id}/start/`,
    control: (id: string) => `/api/parties/${id}/control/`,
    participants: (id: string) => `/api/parties/${id}/participants/`,
    invite: (id: string) => `/api/parties/${id}/invite/`,
    react: (id: string) => `/api/parties/${id}/react/`,
    joinByCode: '/api/parties/join-by-code/',
    search: '/api/parties/search/',
  },
  
  // Chat endpoints
  chat: {
    messages: (partyId: string) => `/api/parties/${partyId}/chat/`,
    send: (partyId: string) => `/api/parties/${partyId}/chat/`,
    history: (partyId: string) => `/api/parties/${partyId}/chat/history/`,
  },
  
  // User management endpoints
  users: {
    profile: '/api/users/profile/',
    update: '/api/users/profile/',
    settings: '/api/users/settings/',
    avatar: '/api/users/avatar/',
    friends: '/api/users/friends/',
    search: '/api/users/search/',
  },
  
  // Video/Media endpoints
  videos: {
    list: '/api/videos/',
    upload: '/api/videos/upload/',
    get: (id: string) => `/api/videos/${id}/`,
    update: (id: string) => `/api/videos/${id}/`,
    delete: (id: string) => `/api/videos/${id}/`,
    stream: (id: string) => `/api/videos/${id}/stream/`,
    process: (id: string) => `/api/videos/${id}/process/`,
  },
  
  // Billing endpoints
  billing: {
    plans: '/api/billing/plans/',
    subscription: '/api/billing/subscription/',
    subscribe: '/api/billing/subscribe/',
    cancel: '/api/billing/cancel/',
    invoices: '/api/billing/invoices/',
    methods: '/api/billing/methods/',
  },
  
  // Analytics endpoints
  analytics: {
    dashboard: '/api/analytics/dashboard/',
    parties: '/api/analytics/parties/',
    users: '/api/analytics/users/',
    engagement: '/api/analytics/engagement/',
  },
  
  // Notifications endpoints
  notifications: {
    list: '/api/notifications/',
    markRead: (id: string) => `/api/notifications/${id}/read/`,
    markAllRead: '/api/notifications/mark-all-read/',
    settings: '/api/notifications/settings/',
  },
  
  // Integration endpoints
  integrations: {
    google: {
      auth: '/api/integrations/google/auth/',
      callback: '/api/integrations/google/callback/',
      import: '/api/integrations/google/import/',
    },
    spotify: {
      auth: '/api/integrations/spotify/auth/',
      callback: '/api/integrations/spotify/callback/',
      playlists: '/api/integrations/spotify/playlists/',
    },
  },
  
  // Interactive features endpoints
  interactive: {
    reactions: {
      list: (partyId: string) => `/api/interactive/reactions/?party=${partyId}`,
      create: '/api/interactive/reactions/',
    },
    polls: {
      list: (partyId: string) => `/api/interactive/polls/?party=${partyId}`,
      create: '/api/interactive/polls/',
      vote: (id: string) => `/api/interactive/polls/${id}/vote/`,
      results: (id: string) => `/api/interactive/polls/${id}/results/`,
    },
    games: {
      list: '/api/interactive/games/',
      create: '/api/interactive/games/',
      join: (id: string) => `/api/interactive/games/${id}/join/`,
      start: (id: string) => `/api/interactive/games/${id}/start/`,
    },
  },
}

// Helper functions for API calls
export const apiCall = {
  get: (endpoint: string, config?: AxiosRequestConfig) => 
    api.get(endpoint, config),
  post: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    api.post(endpoint, data, config),
  put: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    api.put(endpoint, data, config),
  patch: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
    api.patch(endpoint, data, config),
  delete: (endpoint: string, config?: AxiosRequestConfig) => 
    api.delete(endpoint, config),
}

// WebSocket connection helper for Django Channels
export const createWebSocketConnection = (endpoint: string, token?: string) => {
  const wsUrl = WEBSOCKET_URL.replace(/^http/, 'ws') + endpoint
  const authUrl = token ? `${wsUrl}?token=${token}` : wsUrl
  return new WebSocket(authUrl)
}

// Specific API service functions
export const authService = {
  login: (email: string, password: string) => 
    api.post(API_ENDPOINTS.auth.login, { email, password }),
  
  register: (email: string, password: string, first_name: string, last_name: string) => 
    api.post(API_ENDPOINTS.auth.register, { email, password, first_name, last_name }),
  
  logout: () => 
    api.post(API_ENDPOINTS.auth.logout),
  
  refreshToken: (refresh: string) => 
    api.post(API_ENDPOINTS.auth.refresh, { refresh }),
  
  getProfile: () => 
    api.get(API_ENDPOINTS.auth.profile),
  
  forgotPassword: (email: string) => 
    api.post(API_ENDPOINTS.auth.forgotPassword, { email }),
  
  resetPassword: (token: string, password: string) => 
    api.post(API_ENDPOINTS.auth.resetPassword, { token, password }),
}

export const partyService = {
  list: (params?: any) => 
    api.get(API_ENDPOINTS.parties.list, { params }),
  
  create: (data: any) => 
    api.post(API_ENDPOINTS.parties.create, data),
  
  get: (id: string) => 
    api.get(API_ENDPOINTS.parties.get(id)),
  
  update: (id: string, data: any) => 
    api.patch(API_ENDPOINTS.parties.update(id), data),
  
  delete: (id: string) => 
    api.delete(API_ENDPOINTS.parties.delete(id)),
  
  join: (id: string, password?: string) => 
    api.post(API_ENDPOINTS.parties.join(id), { password }),
  
  leave: (id: string) => 
    api.post(API_ENDPOINTS.parties.leave(id)),
  
  getParticipants: (id: string) => 
    api.get(API_ENDPOINTS.parties.participants(id)),
  
  control: (id: string, action: string, data?: any) => 
    api.post(API_ENDPOINTS.parties.control(id), { action, ...data }),
}

// Export configuration constants
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  WEBSOCKET_URL,
  TIMEOUT: {
    DEFAULT: 30000,
    UPLOAD: 120000,
    VIDEO_PROCESSING: 300000,
  },
}

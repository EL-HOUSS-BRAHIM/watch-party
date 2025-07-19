/**
 * API Configuration for Watch Party Frontend
 * 
 * This file configures the API endpoints for both PHP and Python backends
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API Base URLs from environment variables
const PHP_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const PYTHON_API_URL = process.env.NEXT_PUBLIC_PYTHON_API_URL || 'http://localhost:5000'
const WEBSOCKET_URL = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8080'

// Create axios instances for each backend
export const phpApi: AxiosInstance = axios.create({
  baseURL: PHP_API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for session-based authentication
})

export const pythonApi: AxiosInstance = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 60000, // Longer timeout for video processing
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
})

// Legacy API for backward compatibility
export const api = phpApi

// Request interceptors to add authentication tokens
phpApi.interceptors.request.use(
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

pythonApi.interceptors.request.use(
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

// Response interceptors for error handling
phpApi.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

pythonApi.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// API endpoint configurations
export const API_ENDPOINTS = {
  // Authentication endpoints (PHP)
  auth: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    refresh: '/api/auth/refresh',
    profile: '/api/auth/profile',
    resetPassword: '/api/auth/reset-password',
    forgotPassword: '/api/auth/forgot-password',
  },
  
  // Room management endpoints (PHP)
  rooms: {
    list: '/api/rooms',
    create: '/api/rooms',
    get: (id: string) => `/api/rooms/${id}`,
    update: (id: string) => `/api/rooms/${id}`,
    delete: (id: string) => `/api/rooms/${id}`,
    join: (id: string) => `/api/rooms/${id}/join`,
    leave: (id: string) => `/api/rooms/${id}/leave`,
    participants: (id: string) => `/api/rooms/${id}/participants`,
  },
  
  // Chat endpoints (PHP)
  chat: {
    messages: (roomId: string) => `/api/rooms/${roomId}/messages`,
    send: (roomId: string) => `/api/rooms/${roomId}/messages`,
    history: (roomId: string) => `/api/rooms/${roomId}/messages/history`,
  },
  
  // User management endpoints (PHP)
  users: {
    profile: '/api/users/profile',
    update: '/api/users/profile',
    settings: '/api/users/settings',
    avatar: '/api/users/avatar',
    friends: '/api/users/friends',
  },
  
  // Video/Media endpoints (Python)
  media: {
    upload: '/api/media/upload',
    process: '/api/media/process',
    status: (jobId: string) => `/api/media/status/${jobId}`,
    download: (fileId: string) => `/api/media/download/${fileId}`,
    stream: (fileId: string) => `/api/media/stream/${fileId}`,
    transcode: '/api/media/transcode',
  },
  
  // Cloud storage endpoints (Python)
  storage: {
    gdrive: {
      auth: '/api/storage/gdrive/auth',
      callback: '/api/storage/gdrive/callback',
      files: '/api/storage/gdrive/files',
      upload: '/api/storage/gdrive/upload',
    },
    dropbox: {
      auth: '/api/storage/dropbox/auth',
      callback: '/api/storage/dropbox/callback',
      files: '/api/storage/dropbox/files',
      upload: '/api/storage/dropbox/upload',
    },
    aws: {
      upload: '/api/storage/aws/upload',
      files: '/api/storage/aws/files',
    },
  },
  
  // AI features endpoints (Python)
  ai: {
    transcribe: '/api/ai/transcribe',
    translate: '/api/ai/translate',
    summarize: '/api/ai/summarize',
    recommendations: '/api/ai/recommendations',
  },
  
  // Payment endpoints (PHP)
  payments: {
    plans: '/api/payments/plans',
    subscribe: '/api/payments/subscribe',
    cancel: '/api/payments/cancel',
    invoices: '/api/payments/invoices',
    methods: '/api/payments/methods',
  },
  
  // Admin endpoints (PHP)
  admin: {
    users: '/api/admin/users',
    rooms: '/api/admin/rooms',
    analytics: '/api/admin/analytics',
    settings: '/api/admin/settings',
  },
  
  // Live streaming endpoints (Python)
  streaming: {
    start: '/api/streaming/start',
    stop: '/api/streaming/stop',
    status: '/api/streaming/status',
    viewers: '/api/streaming/viewers',
  },
  
  // Mobile endpoints (Python)
  mobile: {
    notifications: '/api/mobile/notifications',
    register: '/api/mobile/register',
    unregister: '/api/mobile/unregister',
  },
}

// Helper functions for API calls
export const apiCall = {
  // PHP Backend calls
  php: {
    get: (endpoint: string, config?: AxiosRequestConfig) => 
      phpApi.get(endpoint, config),
    post: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      phpApi.post(endpoint, data, config),
    put: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      phpApi.put(endpoint, data, config),
    delete: (endpoint: string, config?: AxiosRequestConfig) => 
      phpApi.delete(endpoint, config),
  },
  
  // Python Backend calls
  python: {
    get: (endpoint: string, config?: AxiosRequestConfig) => 
      pythonApi.get(endpoint, config),
    post: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      pythonApi.post(endpoint, data, config),
    put: (endpoint: string, data?: any, config?: AxiosRequestConfig) => 
      pythonApi.put(endpoint, data, config),
    delete: (endpoint: string, config?: AxiosRequestConfig) => 
      pythonApi.delete(endpoint, config),
  },
}

// WebSocket connection helper
export const createWebSocketConnection = (roomId?: string) => {
  const wsUrl = roomId ? `${WEBSOCKET_URL}?room=${roomId}` : WEBSOCKET_URL
  return new WebSocket(wsUrl)
}

// Export configuration constants
export const API_CONFIG = {
  PHP_API_URL,
  PYTHON_API_URL,
  WEBSOCKET_URL,
  TIMEOUT: {
    DEFAULT: 30000,
    UPLOAD: 120000,
    VIDEO_PROCESSING: 300000,
  },
}

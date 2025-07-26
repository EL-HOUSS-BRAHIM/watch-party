/**
 * Main API Module
 * Exports all API services and types
 */

// Core client and configuration
export { apiClient } from "./client"
export { API_ENDPOINTS, WS_ENDPOINTS } from "./endpoints"

// API Services - Create getters to avoid instantiation during module loading
export { AuthAPI } from "./auth"
export { UsersAPI } from "./users"
export { VideosAPI } from "./videos"
export { PartiesAPI } from "./parties"
export { ChatAPI } from "./chat"
export { BillingAPI } from "./billing"
export { NotificationsAPI } from "./notifications"
export { AnalyticsAPI } from "./analytics"
export { AdminAPI } from "./admin"

// Lazy-loaded API instances
let _authAPI: any = null
let _usersAPI: any = null
let _videosAPI: any = null
let _partiesAPI: any = null
let _chatAPI: any = null
let _billingAPI: any = null
let _notificationsAPI: any = null
let _analyticsAPI: any = null
let _adminAPI: any = null

function getAuthAPI() {
  if (!_authAPI && typeof window !== 'undefined') {
    const { AuthAPI } = require("./auth")
    _authAPI = new AuthAPI()
  }
  return _authAPI
}

function getUsersAPI() {
  if (!_usersAPI && typeof window !== 'undefined') {
    const { UsersAPI } = require("./users")
    _usersAPI = new UsersAPI()
  }
  return _usersAPI
}

function getVideosAPI() {
  if (!_videosAPI && typeof window !== 'undefined') {
    const { VideosAPI } = require("./videos")
    _videosAPI = new VideosAPI()
  }
  return _videosAPI
}

function getPartiesAPI() {
  if (!_partiesAPI && typeof window !== 'undefined') {
    const { PartiesAPI } = require("./parties")
    _partiesAPI = new PartiesAPI()
  }
  return _partiesAPI
}

function getChatAPI() {
  if (!_chatAPI && typeof window !== 'undefined') {
    const { ChatAPI } = require("./chat")
    _chatAPI = new ChatAPI()
  }
  return _chatAPI
}

function getBillingAPI() {
  if (!_billingAPI && typeof window !== 'undefined') {
    const { BillingAPI } = require("./billing")
    _billingAPI = new BillingAPI()
  }
  return _billingAPI
}

function getNotificationsAPI() {
  if (!_notificationsAPI && typeof window !== 'undefined') {
    const { NotificationsAPI } = require("./notifications")
    _notificationsAPI = new NotificationsAPI()
  }
  return _notificationsAPI
}

function getAnalyticsAPI() {
  if (!_analyticsAPI && typeof window !== 'undefined') {
    const { AnalyticsAPI } = require("./analytics")
    _analyticsAPI = new AnalyticsAPI()
  }
  return _analyticsAPI
}

function getAdminAPI() {
  if (!_adminAPI && typeof window !== 'undefined') {
    const { AdminAPI } = require("./admin")
    _adminAPI = new AdminAPI()
  }
  return _adminAPI
}

// Export lazy-loaded instances
export const authAPI = new Proxy({}, {
  get(target, prop) {
    const api = getAuthAPI()
    return api?.[prop]
  }
})

export const usersAPI = new Proxy({}, {
  get(target, prop) {
    const api = getUsersAPI()
    return api?.[prop]
  }
})

export const videosAPI = new Proxy({}, {
  get(target, prop) {
    const api = getVideosAPI()
    return api?.[prop]
  }
})

export const partiesAPI = new Proxy({}, {
  get(target, prop) {
    const api = getPartiesAPI()
    return api?.[prop]
  }
})

export const chatAPI = new Proxy({}, {
  get(target, prop) {
    const api = getChatAPI()
    return api?.[prop]
  }
})

export const billingAPI = new Proxy({}, {
  get(target, prop) {
    const api = getBillingAPI()
    return api?.[prop]
  }
})

export const notificationsAPI = new Proxy({}, {
  get(target, prop) {
    const api = getNotificationsAPI()
    return api?.[prop]
  }
})

export const analyticsAPI = new Proxy({}, {
  get(target, prop) {
    const api = getAnalyticsAPI()
    return api?.[prop]
  }
})

export const adminAPI = new Proxy({}, {
  get(target, prop) {
    const api = getAdminAPI()
    return api?.[prop]
  }
})

// Types
export type * from "./types"

// Unified API object for convenience
export const api = {
  auth: authAPI,
  users: usersAPI,
  videos: videosAPI,
  parties: partiesAPI,
  chat: chatAPI,
  billing: billingAPI,
  notifications: notificationsAPI,
  analytics: analyticsAPI,
  admin: adminAPI,
} as const

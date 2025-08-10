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
export { StoreAPI } from "./store"
export { SearchAPI } from "./search"
export { SocialAPI } from "./social"
export { MessagingAPI } from "./messaging"
export { SupportAPI } from "./support"
export { MobileAPI } from "./mobile"
export { InteractiveAPI } from "./interactive"
export { ModerationAPI } from "./moderation"
export { IntegrationsAPI } from "./integrations"
export { EventsAPI } from "./events"

// Import types for proxy typing
import type { AuthAPI } from "./auth"
import type { UsersAPI } from "./users"
import type { VideosAPI } from "./videos"
import type { PartiesAPI } from "./parties"
import type { ChatAPI } from "./chat"
import type { BillingAPI } from "./billing"
import type { NotificationsAPI } from "./notifications"
import type { AnalyticsAPI } from "./analytics"
import type { AdminAPI } from "./admin"
import type { StoreAPI } from "./store"
import type { SearchAPI } from "./search"
import type { SocialAPI } from "./social"
import type { MessagingAPI } from "./messaging"
import type { SupportAPI } from "./support"
import type { MobileAPI } from "./mobile"
import type { InteractiveAPI } from "./interactive"
import type { ModerationAPI } from "./moderation"
import type { IntegrationsAPI } from "./integrations"
import type { EventsAPI } from "./events"

// Lazy-loaded API instances
let _authAPI: unknown = null
let _usersAPI: unknown = null
let _videosAPI: unknown = null
let _partiesAPI: unknown = null
let _chatAPI: unknown = null
let _billingAPI: unknown = null
let _notificationsAPI: unknown = null
let _analyticsAPI: unknown = null
let _adminAPI: unknown = null
let _storeAPI: unknown = null
let _searchAPI: unknown = null
let _socialAPI: unknown = null
let _messagingAPI: unknown = null
let _supportAPI: unknown = null
let _mobileAPI: unknown = null
let _interactiveAPI: unknown = null
let _moderationAPI: unknown = null
let _integrationsAPI: unknown = null
let _eventsAPI: unknown = null

async function getAuthAPI() {
  if (!_authAPI && typeof window !== 'undefined') {
    const { AuthAPI } = await import("./auth")
    _authAPI = new AuthAPI()
  }
  return _authAPI
}

async function getUsersAPI() {
  if (!_usersAPI && typeof window !== 'undefined') {
    const { UsersAPI } = await import("./users")
    _usersAPI = new UsersAPI()
  }
  return _usersAPI
}

async function getVideosAPI() {
  if (!_videosAPI && typeof window !== 'undefined') {
    const { VideosAPI } = await import("./videos")
    _videosAPI = new VideosAPI()
  }
  return _videosAPI
}

async function getPartiesAPI() {
  if (!_partiesAPI && typeof window !== 'undefined') {
    const { PartiesAPI } = await import("./parties")
    _partiesAPI = new PartiesAPI()
  }
  return _partiesAPI
}

async function getChatAPI() {
  if (!_chatAPI && typeof window !== 'undefined') {
    const { ChatAPI } = await import("./chat")
    _chatAPI = new ChatAPI()
  }
  return _chatAPI
}

async function getBillingAPI() {
  if (!_billingAPI && typeof window !== 'undefined') {
    const { BillingAPI } = await import("./billing")
    _billingAPI = new BillingAPI()
  }
  return _billingAPI
}

async function getNotificationsAPI() {
  if (!_notificationsAPI && typeof window !== 'undefined') {
    const { NotificationsAPI } = await import("./notifications")
    _notificationsAPI = new NotificationsAPI()
  }
  return _notificationsAPI
}

async function getAnalyticsAPI() {
  if (!_analyticsAPI && typeof window !== 'undefined') {
    const { AnalyticsAPI } = await import("./analytics")
    _analyticsAPI = new AnalyticsAPI()
  }
  return _analyticsAPI
}

async function getAdminAPI() {
  if (!_adminAPI && typeof window !== 'undefined') {
    const { AdminAPI } = await import("./admin")
    _adminAPI = new AdminAPI()
  }
  return _adminAPI
}

async function getStoreAPI() {
  if (!_storeAPI && typeof window !== 'undefined') {
    const { StoreAPI } = await import("./store")
    _storeAPI = new StoreAPI()
  }
  return _storeAPI
}

async function getSearchAPI() {
  if (!_searchAPI && typeof window !== 'undefined') {
    const { SearchAPI } = await import("./search")
    _searchAPI = new SearchAPI()
  }
  return _searchAPI
}

async function getSocialAPI() {
  if (!_socialAPI && typeof window !== 'undefined') {
    const { SocialAPI } = await import("./social")
    _socialAPI = new SocialAPI()
  }
  return _socialAPI
}

async function getMessagingAPI() {
  if (!_messagingAPI && typeof window !== 'undefined') {
    const { MessagingAPI } = await import("./messaging")
    _messagingAPI = new MessagingAPI()
  }
  return _messagingAPI
}

async function getSupportAPI() {
  if (!_supportAPI && typeof window !== 'undefined') {
    const { SupportAPI } = await import("./support")
    _supportAPI = new SupportAPI()
  }
  return _supportAPI
}

async function getMobileAPI() {
  if (!_mobileAPI && typeof window !== 'undefined') {
    const { MobileAPI } = await import("./mobile")
    _mobileAPI = new MobileAPI()
  }
  return _mobileAPI
}

async function getInteractiveAPI() {
  if (!_interactiveAPI && typeof window !== 'undefined') {
    const { InteractiveAPI } = await import("./interactive")
    _interactiveAPI = new InteractiveAPI()
  }
  return _interactiveAPI
}

async function getModerationAPI() {
  if (!_moderationAPI && typeof window !== 'undefined') {
    const { ModerationAPI } = await import("./moderation")
    _moderationAPI = new ModerationAPI()
  }
  return _moderationAPI
}

async function getIntegrationsAPI() {
  if (!_integrationsAPI && typeof window !== 'undefined') {
    const { IntegrationsAPI } = await import("./integrations")
    _integrationsAPI = new IntegrationsAPI()
  }
  return _integrationsAPI
}

async function getEventsAPI() {
  if (!_eventsAPI && typeof window !== 'undefined') {
    const { EventsAPI } = await import("./events")
    _eventsAPI = new EventsAPI()
  }
  return _eventsAPI
}

// Export lazy-loaded instances with proper typing
export const authAPI = new Proxy({} as AuthAPI, {
  get(target, prop) {
    const api = getAuthAPI()
    return api?.[prop]
  }
})

export const usersAPI = new Proxy({} as UsersAPI, {
  get(target, prop) {
    const api = getUsersAPI()
    return api?.[prop]
  }
})

export const videosAPI = new Proxy({} as VideosAPI, {
  get(target, prop) {
    const api = getVideosAPI()
    return api?.[prop]
  }
})

export const partiesAPI = new Proxy({} as PartiesAPI, {
  get(target, prop) {
    const api = getPartiesAPI()
    return api?.[prop]
  }
})

export const chatAPI = new Proxy({} as ChatAPI, {
  get(target, prop) {
    const api = getChatAPI()
    return api?.[prop]
  }
})

export const billingAPI = new Proxy({} as BillingAPI, {
  get(target, prop) {
    const api = getBillingAPI()
    return api?.[prop]
  }
})

export const notificationsAPI = new Proxy({} as NotificationsAPI, {
  get(target, prop) {
    const api = getNotificationsAPI()
    return api?.[prop]
  }
})

export const analyticsAPI = new Proxy({} as AnalyticsAPI, {
  get(target, prop) {
    const api = getAnalyticsAPI()
    return api?.[prop]
  }
})

export const adminAPI = new Proxy({} as AdminAPI, {
  get(target, prop) {
    const api = getAdminAPI()
    return api?.[prop]
  }
})

export const storeAPI = new Proxy({} as StoreAPI, {
  get(target, prop) {
    const api = getStoreAPI()
    return api?.[prop]
  }
})

export const searchAPI = new Proxy({} as SearchAPI, {
  get(target, prop) {
    const api = getSearchAPI()
    return api?.[prop]
  }
})

export const socialAPI = new Proxy({} as SocialAPI, {
  get(target, prop) {
    const api = getSocialAPI()
    return api?.[prop]
  }
})

export const messagingAPI = new Proxy({} as MessagingAPI, {
  get(target, prop) {
    const api = getMessagingAPI()
    return api?.[prop]
  }
})

export const supportAPI = new Proxy({} as SupportAPI, {
  get(target, prop) {
    const api = getSupportAPI()
    return api?.[prop]
  }
})

export const mobileAPI = new Proxy({} as MobileAPI, {
  get(target, prop) {
    const api = getMobileAPI()
    return api?.[prop]
  }
})

export const interactiveAPI = new Proxy({} as InteractiveAPI, {
  get(target, prop) {
    const api = getInteractiveAPI()
    return api?.[prop]
  }
})

export const moderationAPI = new Proxy({} as ModerationAPI, {
  get(target, prop) {
    const api = getModerationAPI()
    return api?.[prop]
  }
})

export const integrationsAPI = new Proxy({} as IntegrationsAPI, {
  get(target, prop) {
    const api = getIntegrationsAPI()
    return api?.[prop]
  }
})

export const eventsAPI = new Proxy({} as EventsAPI, {
  get(target, prop) {
    const api = getEventsAPI()
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
  store: storeAPI,
  search: searchAPI,
  social: socialAPI,
  messaging: messagingAPI,
  support: supportAPI,
  mobile: mobileAPI,
  interactive: interactiveAPI,
  moderation: moderationAPI,
  integrations: integrationsAPI,
  events: eventsAPI,
} as const

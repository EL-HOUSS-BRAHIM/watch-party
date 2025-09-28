import { AuthAPI } from "./auth"
import { UsersAPI } from "./users"
import { VideosAPI } from "./videos"
import { PartiesAPI } from "./parties"
import { ChatAPI } from "./chat"
import { BillingAPI } from "./billing"
import { NotificationsAPI } from "./notifications"
import { AnalyticsAPI } from "./analytics"
import { AdminAPI } from "./admin"
import { StoreAPI } from "./store"
import { SearchAPI } from "./search"
import { SocialAPI } from "./social"
import { MessagingAPI } from "./messaging"
import { SupportAPI } from "./support"
import { MobileAPI } from "./mobile"
import { InteractiveAPI } from "./interactive"
import { ModerationAPI } from "./moderation"
import { IntegrationsAPI } from "./integrations"
import { EventsAPI } from "./events"
import { DocsAPI } from "./docs"
import { DashboardAPI } from "./dashboard"
import { LocalizationAPI } from "./localization"

/**
 * Main API Module
 * Exports all API services and types
 */

// Core client and configuration
export { apiClient } from "./client"
export { API_ENDPOINTS, WS_ENDPOINTS } from "./endpoints"

// API Services - Direct imports for better type safety
// Export API classes
export { AuthAPI }
export { UsersAPI }
export { VideosAPI }
export { PartiesAPI }
export { ChatAPI }
export { BillingAPI }
export { NotificationsAPI }
export { AnalyticsAPI }
export { AdminAPI }
export { StoreAPI }
export { SearchAPI }
export { SocialAPI }
export { MessagingAPI }
export { SupportAPI }
export { MobileAPI }
export { InteractiveAPI }
export { ModerationAPI }
export { IntegrationsAPI }
export { EventsAPI }
export { DocsAPI }
export { DashboardAPI }
export { LocalizationAPI }

// Create singleton instances (only on client-side)
const createAPIInstance = <T>(APIClass: new () => T): T | null => {}
  if (typeof window === 'undefined') return null
  return new APIClass()
}

export const authAPI = createAPIInstance(AuthAPI)
export const usersAPI = createAPIInstance(UsersAPI)
export const videosAPI = createAPIInstance(VideosAPI)
export const partiesAPI = createAPIInstance(PartiesAPI)
export const chatAPI = createAPIInstance(ChatAPI)
export const billingAPI = createAPIInstance(BillingAPI)
export const notificationsAPI = createAPIInstance(NotificationsAPI)
export const analyticsAPI = createAPIInstance(AnalyticsAPI)
export const adminAPI = createAPIInstance(AdminAPI)
export const storeAPI = createAPIInstance(StoreAPI)
export const searchAPI = createAPIInstance(SearchAPI)
export const socialAPI = createAPIInstance(SocialAPI)
export const messagingAPI = createAPIInstance(MessagingAPI)
export const supportAPI = createAPIInstance(SupportAPI)
export const mobileAPI = createAPIInstance(MobileAPI)
export const interactiveAPI = createAPIInstance(InteractiveAPI)
export const moderationAPI = createAPIInstance(ModerationAPI)
export const integrationsAPI = createAPIInstance(IntegrationsAPI)
export const eventsAPI = createAPIInstance(EventsAPI)
export const docsAPI = createAPIInstance(DocsAPI)
export const dashboardAPI = createAPIInstance(DashboardAPI)
export const localizationAPI = createAPIInstance(LocalizationAPI)

// Types
export type * from "./types"

// Unified API object for convenience
export const api = { auth: authAPI,
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
  docs: docsAPI,
  dashboard: dashboardAPI,
  localization: localizationAPI,
} as const
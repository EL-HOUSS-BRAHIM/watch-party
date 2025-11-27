export type NavItem = {
  href: string
  label: string
  icon?: string
  description?: string
  badge?: string | null
  badgeKey?: string // Key to look up dynamic badge value
}

export type NavSection = {
  title: string
  items: NavItem[]
}

// Badge keys for dynamic values - these are used to look up counts from API data
export type DynamicBadges = {
  unreadMessages?: number
  friendRequests?: number
  upcomingEvents?: number
  unreadNotifications?: number
  activeParties?: number
  hasNewStoreItems?: boolean
}

// Helper to get badge value from dynamic data
export const getBadgeValue = (item: NavItem, dynamicBadges: DynamicBadges): string | null => {
  if (!item.badgeKey) return item.badge ?? null
  
  switch (item.badgeKey) {
    case 'unreadMessages':
      return dynamicBadges.unreadMessages && dynamicBadges.unreadMessages > 0 
        ? String(dynamicBadges.unreadMessages) 
        : null
    case 'friendRequests':
      return dynamicBadges.friendRequests && dynamicBadges.friendRequests > 0 
        ? String(dynamicBadges.friendRequests) 
        : null
    case 'upcomingEvents':
      return dynamicBadges.upcomingEvents && dynamicBadges.upcomingEvents > 0 
        ? String(dynamicBadges.upcomingEvents) 
        : null
    case 'unreadNotifications':
      return dynamicBadges.unreadNotifications && dynamicBadges.unreadNotifications > 0 
        ? String(dynamicBadges.unreadNotifications) 
        : null
    case 'activeParties':
      return dynamicBadges.activeParties && dynamicBadges.activeParties > 0 
        ? 'live' 
        : null
    case 'hasNewStoreItems':
      return dynamicBadges.hasNewStoreItems ? 'new' : null
    default:
      return item.badge ?? null
  }
}

// Centralized navigation used across dashboard and mobile menus
export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: "Core",
    items: [
      { href: "/dashboard", label: "Overview", icon: "🏠", description: "Dashboard home", badge: null },
      { href: "/dashboard/parties", label: "Watch Parties", icon: "🎬", description: "Host & join parties", badge: null, badgeKey: "activeParties" },
      { href: "/dashboard/videos", label: "Media Library", icon: "📱", description: "Your video collection", badge: null },
      { href: "/dashboard/chat", label: "Messages", icon: "💬", description: "Chat & communications", badge: null, badgeKey: "unreadMessages" },
    ]
  },
  {
    title: "Social",
    items: [
      { href: "/dashboard/friends", label: "Friends", icon: "👥", description: "Manage connections", badge: null, badgeKey: "friendRequests" },
      { href: "/dashboard/social", label: "Communities", icon: "🌟", description: "Groups & discussions", badge: null },
      { href: "/dashboard/events", label: "Events", icon: "📅", description: "Upcoming events", badge: null, badgeKey: "upcomingEvents" },
      { href: "/dashboard/notifications", label: "Notifications", icon: "🔔", description: "Your updates", badge: null, badgeKey: "unreadNotifications" },
    ]
  },
  {
    title: "Discover",
    items: [
      { href: "/dashboard/search", label: "Explore", icon: "🔍", description: "Find content & users", badge: null },
      { href: "/dashboard/analytics", label: "Insights", icon: "📊", description: "Your activity stats", badge: null },
      { href: "/dashboard/store", label: "Store", icon: "🛒", description: "Premium features", badge: null, badgeKey: "hasNewStoreItems" },
    ]
  },
  {
    title: "Tools",
    items: [
      { href: "/dashboard/integrations", label: "Connections", icon: "🔗", description: "Third-party services", badge: null },
      { href: "/dashboard/support", label: "Help Center", icon: "🎫", description: "Support & guides", badge: null },
      { href: "/dashboard/billing", label: "Billing", icon: "💳", description: "Billing & invoices", badge: null },
      { href: "/dashboard/admin", label: "Admin Panel", icon: "⚙️", description: "System management", badge: null },
      { href: "/dashboard/settings", label: "Settings", icon: "🔧", description: "Preferences", badge: null },
    ]
  }
]
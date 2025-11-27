export type NavItem = {
  href: string
  label: string
  icon?: string
  badge?: string | null
  badgeKey?: string // Key to look up dynamic badge value
}

export type NavSection = {
  title: string
  icon?: string // Section icon for visual grouping
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

// Simplified and better organized navigation
export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: "Main",
    icon: "📍",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: "🏠", badge: null },
      { href: "/dashboard/parties", label: "Watch Parties", icon: "🎬", badge: null, badgeKey: "activeParties" },
      { href: "/dashboard/videos", label: "My Videos", icon: "📹", badge: null },
    ]
  },
  {
    title: "Social",
    icon: "👥",
    items: [
      { href: "/dashboard/chat", label: "Messages", icon: "💬", badge: null, badgeKey: "unreadMessages" },
      { href: "/dashboard/friends", label: "Friends", icon: "🤝", badge: null, badgeKey: "friendRequests" },
      { href: "/dashboard/notifications", label: "Notifications", icon: "🔔", badge: null, badgeKey: "unreadNotifications" },
    ]
  },
  {
    title: "Explore",
    icon: "🔍",
    items: [
      { href: "/dashboard/search", label: "Discover", icon: "🌐", badge: null },
      { href: "/dashboard/events", label: "Events", icon: "📅", badge: null, badgeKey: "upcomingEvents" },
      { href: "/dashboard/analytics", label: "Analytics", icon: "📊", badge: null },
    ]
  },
  {
    title: "Account",
    icon: "⚙️",
    items: [
      { href: "/dashboard/settings", label: "Settings", icon: "⚙️", badge: null },
      { href: "/dashboard/billing", label: "Billing", icon: "💳", badge: null },
      { href: "/dashboard/support", label: "Help", icon: "❓", badge: null },
    ]
  }
]
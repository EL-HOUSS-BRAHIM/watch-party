export type NavItem = {
  href: string
  label: string
  icon?: string
  description?: string
  badge?: string | null
}

export type NavSection = {
  title: string
  items: NavItem[]
}

// Centralized navigation used across dashboard and mobile menus
export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    title: "Core",
    items: [
      { href: "/dashboard", label: "Overview", icon: "🏠", description: "Dashboard home", badge: null },
      { href: "/dashboard/parties", label: "Watch Parties", icon: "🎬", description: "Host & join parties", badge: "live" },
      { href: "/dashboard/videos", label: "Media Library", icon: "📱", description: "Your video collection", badge: null },
      { href: "/dashboard/chat", label: "Messages", icon: "💬", description: "Chat & communications", badge: "3" },
    ]
  },
  {
    title: "Social",
    items: [
      { href: "/dashboard/friends", label: "Friends", icon: "👥", description: "Manage connections", badge: "12" },
      { href: "/dashboard/social", label: "Communities", icon: "🌟", description: "Groups & discussions", badge: null },
      { href: "/dashboard/events", label: "Events", icon: "📅", description: "Upcoming events", badge: "2" },
      { href: "/dashboard/notifications", label: "Notifications", icon: "🔔", description: "Your updates", badge: "5" },
    ]
  },
  {
    title: "Discover",
    items: [
      { href: "/dashboard/search", label: "Explore", icon: "🔍", description: "Find content & users", badge: null },
      { href: "/dashboard/analytics", label: "Insights", icon: "📊", description: "Your activity stats", badge: null },
      { href: "/dashboard/store", label: "Store", icon: "🛒", description: "Premium features", badge: "new" },
    ]
  },
  {
    title: "Tools",
    items: [
      { href: "/dashboard/integrations", label: "Connections", icon: "🔗", description: "Third-party services", badge: null },
  { href: "/dashboard/support", label: "Help Center", icon: "🎫", description: "Support & guides", badge: null },
  { href: "/dashboard/billing", label: "Billing", icon: "💳", description: "Billing & invoices", badge: null },
      { href: "/dashboard/admin", label: "Admin Panel", icon: "⚙️", description: "System management", badge: null },
      { href: "/settings", label: "Settings", icon: "🔧", description: "Preferences", badge: null },
    ]
  }
]
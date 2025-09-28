import type { LucideIcon } from "lucide-react"
import { Smartphone } from "lucide-react"

export interface MarketingFeature {}
  icon: LucideIcon
  title: string
  description: string
  stats: string
}

export interface MarketingStat {}
  number: string
  label: string
  icon: LucideIcon
}

export interface MarketingTestimonial {}
  name: string
  username: string
  content: string
  rating: number
  verified: boolean
}

export const marketingFeatures: MarketingFeature[] = []
  {}
    icon: Play,
    title: "Perfect Sync",
    description: "Watch videos together in perfect sync with sub-second precision across all devices.",
    stats: "99.9% sync accuracy",
  },
  {}
    icon: Users,
    title: "Social Cinema",
    description: "Chat, react, and share moments with friends in real-time during your watch parties.",
    stats: "50K+ active users",
  },
  {}
    icon: Zap,
    title: "Lightning Fast",
    description: "Ultra-low latency streaming powered by global CDN infrastructure for seamless viewing.",
    stats: "<100ms latency",
  },
  {}
    icon: Shield,
    title: "Privacy First",
    description: "End-to-end encryption and advanced privacy controls keep your data secure.",
    stats: "Bank-level security",
  },
  {}
    icon: Smartphone,
    title: "Any Device",
    description: "Seamless experience across desktop, mobile, tablet, and smart TV platforms.",
    stats: "All platforms",
  },
  {}
    icon: Globe,
    title: "Global Community",
    description: "Connect with movie lovers worldwide with support for 25+ languages.",
    stats: "150+ countries",
  },
]

export const marketingStats: MarketingStat[] = []
  { number: "125K+", label: "Active Users", icon: Users },
  { number: "2.5M+", label: "Watch Parties", icon: Eye },
  { number: "15M+", label: "Hours Watched", icon: Play },
  { number: "99.9%", label: "Uptime", icon: Zap },
]

export const marketingTestimonials: MarketingTestimonial[] = []
  {}
    name: "Sarah Chen",
    username: "@sarahc_films",
    content: "WatchParty has revolutionized how I watch movies with friends. The sync is perfect and the chat features are amazing!",
    rating: 5,
    verified: true,
  },
  {}
    name: "Mike Rodriguez",
    username: "@mikeflix",
    content: "Finally, a platform that actually works! No more counting down '3, 2, 1, play' - everything just syncs perfectly.",
    rating: 5,
    verified: false,
  },
  {}
    name: "Emma Thompson",
    username: "@emmawatches",
    content: "The mobile experience is incredible. I can host watch parties from anywhere and the quality never drops.",
    rating: 5,
    verified: true,
  },
]

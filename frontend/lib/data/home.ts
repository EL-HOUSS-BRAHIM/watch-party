export type Feature = {
  title: string
  description: string
  highlight?: string
}

export type Metric = {
  label: string
  value: string
  description: string
}

export type Testimonial = {
  author: string
  role: string
  message: string
}

export const features: Feature[] = [
  {
    title: "Real-time Sync Engine",
    description:
      "Experience perfect synchronization across all devices. Our advanced sync technology ensures everyone watches together with minimal latency, even with network interruptions.",
    highlight: "±18ms precision",
  },
  {
    title: "Interactive Watch Parties",
    description:
      "Live reactions, polls, games, and voice chat create an immersive social experience. Express yourself with emoji reactions and participate in real-time trivia.",
    highlight: "Live engagement",
  },
  {
    title: "Multi-Source Content",
    description:
      "Upload videos, paste streaming URLs, or connect your Google Drive. Support for all major video formats with automatic quality optimization and transcoding.",
    highlight: "Universal support",
  },
  {
    title: "Smart Moderation Tools",
    description:
      "AI-powered content moderation, user reporting, and customizable chat filters keep your watch parties safe and enjoyable for everyone.",
    highlight: "AI-powered safety",
  },
  {
    title: "Event Scheduling",
    description:
      "Plan movie marathons, create recurring events, and send automated invitations. RSVP tracking and calendar integration make organizing effortless.",
    highlight: "Auto-scheduling",
  },
  {
    title: "Social Communities",
    description:
      "Join groups, make friends, and discover new content together. Build lasting connections around shared interests and favorite genres.",
    highlight: "Community-first",
  },
  {
    title: "Analytics & Insights",
    description:
      "Track engagement, watch time, and party metrics. Understand your audience and optimize your content for maximum engagement.",
    highlight: "Data-driven",
  },
  {
    title: "Cross-Platform Access",
    description:
      "Seamless experience across desktop, mobile, and tablet. Native apps with offline sync and push notifications keep you connected.",
    highlight: "Mobile-ready",
  },
]

export const metrics: Metric[] = [
  {
    label: "Active Communities",
    value: "50K+ users",
    description: "Movie clubs, friend groups, and content creators hosting watch parties daily across the globe.",
  },
  {
    label: "Sync Precision",
    value: "±18 ms",
    description: "Industry-leading synchronization accuracy ensures everyone stays perfectly in sync, even with network variations.",
  },
  {
    label: "Content Library",
    value: "1M+ videos",
    description: "Massive collection of user-uploaded content, streaming links, and integrated cloud storage from Google Drive.",
  },
]

export const testimonials: Testimonial[] = [
  {
    author: "Alex Chen",
    role: "Film Club President",
    message:
      "WatchParty transformed our weekly movie nights. The sync is flawless, reactions are hilarious, and managing our 200+ members is actually fun now!",
  },
  {
    author: "Maria Rodriguez",
    role: "Content Creator",
    message:
      "I host watch parties for my 10K followers and the engagement is incredible. Built-in polls, reactions, and analytics help me understand what my audience loves.",
  },
  {
    author: "David Kim",
    role: "Long-distance Couple",
    message:
      "Living in different time zones, WatchParty lets us share movie nights together. It feels like we're in the same room - the experience is magical.",
  },
  {
    author: "Sarah Johnson",
    role: "Educator",
    message:
      "Perfect for virtual film studies classes. Students engage through reactions and discussions while staying perfectly synced. Game-changing for remote education.",
  },
  {
    author: "Mike Thompson",
    role: "Gaming Community Leader",
    message:
      "We use WatchParty for esports viewing parties. 500+ members watching tournaments together with live chat creates an electric atmosphere.",
  },
  {
    author: "Emily Davis",
    role: "Family Organizer",
    message:
      "Keeps our scattered family connected. Grandparents, cousins, everyone joins our Sunday movie tradition no matter where they are in the world.",
  },
]

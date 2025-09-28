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
    title: "Crystal-clear synchronisation",
    description:
      "Enjoy films, series, and livestreams together with automatic playback syncing and resilient network recovery.",
    highlight: "Sync that never drifts",
  },
  {
    title: "Cinematic presentation",
    description:
      "A monochrome interface that keeps the focus on your content while surfacing party chat, polls, and reactions when you need them.",
  },
  {
    title: "Planning tools",
    description:
      "Coordinate across time zones, share curated playlists, and collect RSVP responses without leaving the experience.",
  },
]

export const metrics: Metric[] = [
  {
    label: "Monthly parties hosted",
    value: "12k+",
    description: "Communities rely on WatchParty to premiere episodes and host film clubs every week.",
  },
  {
    label: "Average satisfaction",
    value: "4.9 / 5",
    description: "Post-party surveys show consistently high ratings for video quality and ease of use.",
  },
  {
    label: "Set-up time",
    value: "< 2 minutes",
    description: "From invitation to start time, hosts launch an event faster than brewing popcorn.",
  },
]

export const testimonials: Testimonial[] = [
  {
    author: "Jordan Michaels",
    role: "Community manager, FlickStream",
    message:
      "The black and white aesthetic keeps our festivals feeling premium, and the sync tech just works even when viewers join late.",
  },
  {
    author: "Priya Das",
    role: "Indie filmmaker",
    message:
      "Hosting premieres with WatchParty means I can focus on chatting with fans instead of troubleshooting stream issues.",
  },
  {
    author: "Liam Chen",
    role: "Esports commentator",
    message:
      "We co-stream tournaments with zero playback drift. The real-time poll overlays are a huge hit with our audience.",
  },
]

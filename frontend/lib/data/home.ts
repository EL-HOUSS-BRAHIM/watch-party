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
    title: "Cinematic templates",
    description:
      "Start with sunrise lobbies, midnight encores, or festival premieres preloaded with lighting, chat, and overlay cues.",
    highlight: "Sunrise → encore",
  },
  {
    title: "Adaptive sync engine",
    description:
      "Keep every device within theatre-grade timing. Our adaptive mesh keeps drift below a frame even when networks fluctuate.",
    highlight: "±18 ms drift",
  },
  {
    title: "Atmosphere automation",
    description:
      "Trigger lighting scenes, soundscapes, and spoiler-safe chat modes exactly when your storyboard calls for them.",
    highlight: "Lighting + chat",
  },
  {
    title: "Collaborative hosting",
    description:
      "Assign co-host lanes, delegate polls, and spotlight commentary so your community feels curated—not chaotic.",
    highlight: "Multi-host",
  },
  {
    title: "Interactive layers",
    description:
      "Stack reactions, trivia, and polls that inherit your room ambience and keep audiences participating between scenes.",
    highlight: "Polls & reactions",
  },
  {
    title: "Encore replays",
    description:
      "Save highlight reels, chat moments, and time-coded notes for guests who want to relive the experience or catch up later.",
    highlight: "Auto highlight",
  },
  {
    title: "Insight dashboard",
    description:
      "Understand who stayed for the encore, what reactions landed, and which cues you should reuse next screening.",
    highlight: "Engagement pulse",
  },
  {
    title: "Device continuum",
    description:
      "Deliver the same cinematic feel on theatre screens, laptops, and phones thanks to responsive layouts and sensory cues.",
    highlight: "Every screen",
  },
]

export const metrics: Metric[] = [
  {
    label: "Sync precision",
    value: "±18 ms",
    description: "Theatre-grade timing keeps everyone watching the same frame, even across continents.",
  },
  {
    label: "Supported devices",
    value: "All screens",
    description: "Works seamlessly on phones, tablets, laptops, and smart TVs with no extra apps needed.",
  },
  {
    label: "Setup time",
    value: "< 30 sec",
    description: "Create a room, share a code, and start watching together in under half a minute.",
  },
]

// Testimonials will be added once we have real user feedback
export const testimonials: Testimonial[] = []

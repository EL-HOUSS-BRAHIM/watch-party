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
    label: "Communities hosted",
    value: "52K crews",
    description: "Film clubs, creator collectives, and classrooms run their rituals nightly across 143 countries.",
  },
  {
    label: "Average sync drift",
    value: "±18 ms",
    description: "Adaptive playback maintains frame-perfect timing even when guests swap devices mid-show.",
  },
  {
    label: "Scenes scheduled",
    value: "120K/night",
    description: "Automated cues orchestrate lighting, overlays, and guest permissions without manual juggling.",
  },
]

export const testimonials: Testimonial[] = [
  {
    author: "Alex Chen",
    role: "Film Society Curator",
    message:
      "Our 300-seat virtual cinema finally feels intentional. Guests rave about the ambience shifts and we end every screening with an encore poll that actually works.",
  },
  {
    author: "María Rodriguez",
    role: "Creator & Streamer",
    message:
      "WatchParty lets me run premieres with zero tech anxiety. I drag scenes into place and the platform handles sync, overlays, and highlight reels for my members.",
  },
  {
    author: "David Kim",
    role: "Long-distance partner",
    message:
      "We live 5,000 miles apart but the lighting cues, synced captions, and shared reactions make it feel like the same couch. It turned movie night into a ritual again.",
  },
  {
    author: "Sarah Johnson",
    role: "Media Studies Professor",
    message:
      "I can orchestrate lectures, screenings, and debates in one flow. Students stay engaged because WatchParty pairs every scene with discussion prompts and polls.",
  },
  {
    author: "Mike Thompson",
    role: "Esports community lead",
    message:
      "We host finals with 800 viewers and never miss a beat. Sync holds, reactions explode, and the encore recap is ready to post minutes after the match.",
  },
  {
    author: "Emily Davis",
    role: "Family archivist",
    message:
      "Grandparents on tablets, cousins on TVs, siblings on phones—WatchParty keeps everyone synced and saves the highlights for our family archive.",
  },
]

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
    title: "Ambient palette switcher",
    description:
      "Pair crisp daytime whites with twilight indigos using a single slider. WatchParty remembers which cues belong to sunrise lobbies or midnight encores and swaps them instantly.",
    highlight: "Sunrise → midnight",
  },
  {
    title: "Director’s stage manager",
    description:
      "Trigger countdowns, lighting changes, and spotlight transitions from one schedule. Every change respects captions and the primary frame, even during encore reactions.",
    highlight: "Live scripting",
  },
  {
    title: "Guided arrivals",
    description:
      "Pre-show soundtracks, host notes, and check-ins roll out automatically so guests join a polished lobby rather than a blank screen.",
    highlight: "Lobby rituals",
  },
  {
    title: "Community overlays",
    description:
      "Spoiler-safe chat lanes, timed polls, and reaction bursts fade with the next scene. Your audience stays expressive without losing sync.",
    highlight: "Quiet sync chat",
  },
]

export const metrics: Metric[] = [
  {
    label: "Rooms orchestrated monthly",
    value: "24k hosts",
    description: "Film clubs, classrooms, and creator collectives run sunrise briefings and midnight finales on the same dashboard.",
  },
  {
    label: "Average sync drift",
    value: "±18 ms",
    description: "Frame-perfect playback even when audiences scrub, pause, or rejoin after connection blips.",
  },
  {
    label: "Setup time saved",
    value: "72%",
    description: "Templates, ambience presets, and auto-invites get the show rolling before the trailers end.",
  },
]

export const testimonials: Testimonial[] = [
  {
    author: "Maya Castillo",
    role: "Festival host",
    message:
      "Our premieres glide from daylight Q&As to neon encores without rebuilding scenes. WatchParty keeps lighting, chat, and sync exactly where we need them.",
  },
  {
    author: "Arjun Patel",
    role: "University film society",
    message:
      "Students join from dorms at sunrise and stay for midnight retrospectives. Automations handle the transitions so we can focus on discussion.",
  },
  {
    author: "Sophie Lin",
    role: "Streaming curator",
    message:
      "Tens of thousands of fans react in the same beat. The dual ambience presets let us theme each act without sacrificing precision sync.",
  },
]

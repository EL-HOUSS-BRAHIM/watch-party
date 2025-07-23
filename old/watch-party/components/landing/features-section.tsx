"use client"

import { Video, Users, Zap, Shield, Globe, Smartphone } from "lucide-react"

const features = [
  {
    name: "HD Video Streaming",
    description: "Stream from Google Drive, S3, or any video source with crystal clear quality.",
    icon: Video,
  },
  {
    name: "Real-time Chat",
    description: "Chat with friends while watching. React with emojis and share your thoughts instantly.",
    icon: Users,
  },
  {
    name: "Perfect Sync",
    description: "Everyone watches together with millisecond-perfect synchronization.",
    icon: Zap,
  },
  {
    name: "Private Rooms",
    description: "Create private watch parties with invite-only access and moderation controls.",
    icon: Shield,
  },
  {
    name: "Global Access",
    description: "Watch from anywhere in the world with optimized streaming infrastructure.",
    icon: Globe,
  },
  {
    name: "Mobile Ready",
    description: "Full mobile experience with touch controls and responsive design.",
    icon: Smartphone,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 sm:py-32 bg-secondary">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything you need for the perfect watch party
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Built for football fans who want to share every moment, goal, and celebration with friends around the world.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-foreground">
                  <div className="rounded-lg bg-primary/10 p-2 ring-1 ring-primary/20">
                    <feature.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

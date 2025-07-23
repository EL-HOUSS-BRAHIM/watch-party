import { FeaturesSection } from "@/components/landing/features-section"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Video, Zap, Shield, MessageSquare } from "lucide-react"

const detailedFeatures = [
  {
    name: "Multi-Source Streaming",
    description:
      "Stream from Google Drive, Amazon S3, or direct video URLs. Support for all major video formats including MP4, WebM, and HLS streams.",
    icon: Video,
    details: [
      "Google Drive integration",
      "Amazon S3 support",
      "Direct URL streaming",
      "HLS and DASH support",
      "Automatic quality adjustment",
    ],
  },
  {
    name: "Real-Time Synchronization",
    description: "Advanced sync technology ensures everyone watches at exactly the same time, down to the millisecond.",
    icon: Zap,
    details: [
      "Sub-second synchronization",
      "Automatic drift correction",
      "Network latency compensation",
      "Host-controlled playback",
      "Seamless reconnection",
    ],
  },
  {
    name: "Interactive Chat",
    description:
      "Rich chat experience with emoji reactions, mentions, and moderation tools for the perfect social viewing experience.",
    icon: MessageSquare,
    details: ["Real-time messaging", "Emoji reactions", "User mentions", "Message moderation", "Chat history"],
  },
  {
    name: "Room Management",
    description:
      "Complete control over your watch parties with privacy settings, user management, and moderation tools.",
    icon: Shield,
    details: [
      "Private/public rooms",
      "Invite-only access",
      "User kick/ban controls",
      "Message moderation",
      "Room settings",
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <div className="py-24 sm:py-32">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Everything you need for the perfect <span className="text-gradient-primary">watch party</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Discover all the features that make Watch Party the ultimate platform for watching football games with
                friends.
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Features */}
        <div className="py-24 sm:py-32 bg-secondary">
          <div className="container px-4">
            <div className="mx-auto max-w-7xl">
              <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:gap-24">
                {detailedFeatures.map((feature, index) => (
                  <div
                    key={feature.name}
                    className={`flex flex-col ${index % 2 === 1 ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/20">
                          <feature.icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-foreground">{feature.name}</h3>
                      </div>
                      <p className="text-muted-foreground mb-6">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.details.map((detail) => (
                          <li key={detail} className="flex items-center gap-2 text-muted-foreground">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex-1">
                      <div className="aspect-video rounded-xl bg-card border border-border flex items-center justify-center">
                        <feature.icon className="h-16 w-16 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <FeaturesSection />
      </main>
      <Footer />
    </div>
  )
}

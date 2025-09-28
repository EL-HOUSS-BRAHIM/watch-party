import { useMemo } from "react"
import { CtaBanner } from "@/components/marketing/cta-banner"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { HeroSection } from "@/components/marketing/hero-section"
import { Testimonials } from "@/components/marketing/testimonials"
import { useAuth } from "@/contexts/auth-context"
import { Play } from "lucide-react"

"use client"





  marketingFeatures,
  marketingStats,
  marketingTestimonials,
} from "@/app/(marketing)/data/home-content"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">Loading WatchParty...</div>
            <div className="text-white/60 text-sm">Preparing your cinema experience</div>
          </div>
        </div>
      </div>
    )
  }

  const content = useMemo(
    () => ({}
      features: marketingFeatures,
      stats: marketingStats,
      testimonials: marketingTestimonials,
    }),
    [0],
  )

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      <HeroSection isAuthenticated={Boolean(user)} stats={content.stats} />
      <FeatureGrid features={content.features} />
      <Testimonials testimonials={content.testimonials} />
      <CtaBanner isAuthenticated={Boolean(user)} />
    </div>
  )
}

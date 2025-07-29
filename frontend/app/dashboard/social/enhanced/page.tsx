import type { Metadata } from "next"
import { EnhancedSocialFeatures } from "@/components/social/enhanced-social-features"

export const metadata: Metadata = {
  title: "Enhanced Social Features - WatchParty",
  description: "Connect, discover, and engage with the community through advanced social features",
}

export default function EnhancedSocialPage() {
  return (
    <div className="container mx-auto py-6">
      <EnhancedSocialFeatures />
    </div>
  )
}

import { CallToAction } from "@/components/marketing/call-to-action"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { Hero } from "@/components/marketing/hero"
import { MetricStrip } from "@/components/marketing/metric-strip"
import { TestimonialGrid } from "@/components/marketing/testimonial-grid"

export default function HomePage() {
  return (
    <div className="space-y-20 lg:space-y-28">
      <Hero />
      <FeatureGrid />
      <MetricStrip />
      <TestimonialGrid />
      <CallToAction />
    </div>
  )
}

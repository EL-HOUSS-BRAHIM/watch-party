import { PricingSection } from "@/components/landing/pricing-section"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <div className="py-24 sm:py-32">
          <div className="container px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
                Simple, transparent pricing
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Choose the plan that's right for you and your watch parties.
              </p>
            </div>
          </div>
        </div>
        <PricingSection />
      </main>
      <Footer />
    </div>
  )
}

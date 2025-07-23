"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const tiers = [
  {
    name: "Free",
    id: "tier-free",
    href: "/join",
    priceMonthly: "$0",
    description: "Perfect for casual viewing with friends.",
    features: [
      "Up to 5 participants per party",
      "720p video quality",
      "Basic chat features",
      "2 hour watch sessions",
      "Community support",
    ],
    featured: false,
  },
  {
    name: "Premium",
    id: "tier-premium",
    href: "/join",
    priceMonthly: "$9.99",
    description: "The ultimate watch party experience.",
    features: [
      "Unlimited participants",
      "4K video quality",
      "Advanced chat with reactions",
      "Unlimited watch time",
      "Priority support",
      "Custom room themes",
      "Video upload storage",
      "Advanced moderation tools",
    ],
    featured: true,
  },
]

export function PricingSection() {
  return (
    <section className="py-24 sm:py-32 bg-secondary">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Choose your plan</h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Start free and upgrade when you're ready for more features.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-center gap-y-6 sm:mt-20 sm:gap-y-0 lg:max-w-4xl lg:grid-cols-2">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`${
                tier.featured ? "relative bg-card shadow-2xl ring-1 ring-primary/20" : "bg-card/60 sm:mx-8 lg:mx-0"
              } rounded-3xl p-8 ${tier.featured ? "" : "lg:rounded-r-none"} ${tierIdx === 0 ? "lg:rounded-l-3xl" : ""}`}
            >
              {tier.featured && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-primary px-3 py-2 text-center text-sm font-medium text-white">
                  Most Popular
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3 className={`text-lg font-semibold leading-8 ${tier.featured ? "text-primary" : "text-foreground"}`}>
                  {tier.name}
                </h3>
              </div>

              <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>

              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
              </p>

              <Button asChild className={`mt-6 w-full ${tier.featured ? "btn-primary glow-primary" : "btn-secondary"}`}>
                <Link href={tier.href}>Get started</Link>
              </Button>

              <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

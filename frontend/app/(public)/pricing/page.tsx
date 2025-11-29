import Link from "next/link"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Matinee",
    price: "Free",
    description: "For casual crews hosting up to 15 guests.",
    perks: [
      "15 concurrent guests",
      "Day & night ambience presets",
      "Shared watchlist and chat",
      "2 automation cues per event",
    ],
    cta: "Start for free",
    href: "/dashboard",
  },
  {
    name: "Premiere",
    price: "$39/mo",
    description: "For clubs and classrooms with scripted rituals.",
    perks: [
      "250 concurrent guests",
      "Unlimited presets & transitions",
      "Timeline automation",
      "Co-host roles & polls",
    ],
    cta: "Upgrade to Premiere",
    href: "/dashboard",
    featured: true,
  },
  {
    name: "Marathon",
    price: "Custom",
    description: "For festivals and global premieres.",
    perks: [
      "10k+ concurrent guests",
      "Dedicated support engineer",
      "Custom branding & palettes",
      "Analytics & CRM integrations",
    ],
    cta: "Book a call",
    href: "mailto:hello@watchparty.tv",
  },
]

const faqs = [
  {
    q: "Can I switch ambience presets during an event?",
    a: "Yes! All plans let you drop cues in real time. Premiere and Marathon automate transitions based on your timeline."
  },
  {
    q: "Do you support custom branding?",
    a: "Premiere adds logo placement. Marathon unlocks bespoke palettes curated by our design team."
  },
  {
    q: "What happens if the host drops?",
    a: "Co-hosts automatically inherit controls and WatchParty keeps the stream running."
  },
  {
    q: "Is there an education discount?",
    a: "Yes—campus clubs receive 25% off Premiere. Email hello@watchparty.tv to apply."
  }
]

export default function PricingPage() {
  return (
    <div className="section-padding">
      <div className="container-width px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3 sm:mb-4">
            <span className="inline-flex items-center rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-cyan-dark">
              Pricing
            </span>
            <span className="inline-flex items-center rounded-full border border-brand-purple/20 bg-brand-purple/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-purple">
              Sunrise ↔ Midnight
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl lg:text-5xl">
            Plans that scale from matinees to{" "}
            <span className="bg-gradient-to-r from-brand-magenta to-brand-cyan bg-clip-text text-transparent">
              global premieres
            </span>
          </h1>
          <p className="mt-3 sm:mt-4 text-sm text-brand-navy/60 max-w-2xl mx-auto sm:text-base">
            Every tier includes precision sync, dual ambience presets, and spoiler-safe chat.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 mb-10 sm:mb-12 md:mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 transition-all duration-300 hover:-translate-y-1 ${
                plan.featured
                  ? "border-2 border-brand-magenta/30 bg-white shadow-lg"
                  : "border border-brand-purple/10 bg-white/70 backdrop-blur-sm"
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-magenta to-brand-purple px-3 py-1 text-[10px] font-semibold uppercase text-white whitespace-nowrap">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="space-y-2 sm:space-y-3 mb-5 sm:mb-6">
                <h3 className="text-lg font-bold text-brand-navy sm:text-xl">{plan.name}</h3>
                <p className="text-2xl font-bold text-brand-navy sm:text-3xl">{plan.price}</p>
                <p className="text-[13px] sm:text-sm text-brand-navy/60">{plan.description}</p>
              </div>
              <ul className="space-y-2.5 sm:space-y-3 mb-5 sm:mb-6">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 sm:gap-2.5 text-[13px] sm:text-sm text-brand-navy/70">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan-dark">
                      <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    {perk}
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.featured ? "primary" : "secondary"}
                size="lg"
                className={`w-full min-h-[48px] ${plan.featured ? "bg-gradient-to-r from-brand-magenta to-brand-purple" : ""}`}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-white/70 p-4 sm:p-6 md:p-10 backdrop-blur-sm">
          <div className="text-center mb-6 sm:mb-8">
            <span className="inline-flex items-center rounded-full border border-brand-orange/20 bg-brand-orange/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-orange-dark mb-2 sm:mb-3">
              FAQ
            </span>
            <h2 className="text-xl font-bold text-brand-navy sm:text-2xl">Common Questions</h2>
          </div>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-lg sm:rounded-xl border border-brand-navy/8 bg-white/60 p-4 sm:p-5 transition-all hover:border-brand-navy/15 hover:shadow-sm">
                <p className="text-[13px] font-semibold text-brand-navy sm:text-sm">{faq.q}</p>
                <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-brand-navy/60">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

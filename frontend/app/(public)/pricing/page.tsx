import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const plans = [
  {
    name: "Matinee",
    price: "Free",
    description: "For casual crews hosting up to 15 guests with day or night ambience presets.",
    perks: [
      "15 concurrent guests",
      "Daybreak & midnight ambience presets",
      "Shared watchlist and chat overlay",
      "Two automation cues per event",
    ],
    cta: "Start for free",
    href: "/dashboard",
  },
  {
    name: "Premiere",
    price: "$39 / month",
    description: "For clubs and classrooms that need scripted rituals and co-host collaboration.",
    perks: [
      "250 concurrent guests",
      "Unlimited ambience presets and transitions",
      "Stage manager with timeline automation",
      "Co-host roles, polls, and reaction bursts",
    ],
    cta: "Upgrade to Premiere",
    href: "/dashboard",
    featured: true,
  },
  {
    name: "Marathon",
    price: "Talk to us",
    description: "For festivals and creator collectives delivering global premieres and marathons.",
    perks: [
      "10k+ concurrent guests",
      "Dedicated success engineer",
      "Custom ambience palettes and sponsor loops",
      "Advanced analytics & CRM integrations",
    ],
    cta: "Book a call",
    href: "mailto:hello@watchparty.tv",
  },
]

export default function PricingPage() {
  return (
    <div className="space-y-20 relative">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-brand-cyan/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-brand-magenta/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="text-center relative z-10">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-cyan-dark shadow-sm">
              Pricing
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/25 bg-brand-purple/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-purple shadow-sm">
              Sunrise ↔ Midnight
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
            Plans that scale from intimate matinees to{" "}
            <span className="bg-gradient-to-r from-brand-magenta via-brand-orange to-brand-cyan bg-clip-text text-transparent">
              global midnight premieres
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-brand-navy/70 sm:text-xl">
            Every tier includes precision sync, dual ambience presets, and spoiler-safe chat. Upgrade when you want automated rituals, co-host orchestration, or dedicated support.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 relative z-10">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={
              plan.featured
                ? "glass-panel relative rounded-[40px] border-2 border-brand-magenta/30 p-8 shadow-2xl shadow-brand-magenta/10 transform hover:-translate-y-2 transition-all duration-300"
                : "glass-panel rounded-[40px] border-brand-navy/10 p-8 shadow-lg hover:-translate-y-1 transition-all duration-300"
            }
          >
            {plan.featured && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  Most Popular
                </span>
              </div>
            )}
            <div className="space-y-4 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-brand-navy">{plan.name}</h3>
                <p className="mt-4 text-4xl font-bold text-brand-navy">{plan.price}</p>
              </div>
              <p className="text-base leading-relaxed text-brand-navy/70">
                {plan.description}
              </p>
            </div>
            <div className="pb-8">
              <ul className="space-y-4">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3 text-sm font-medium text-brand-navy/80">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-cyan/10 text-brand-cyan-dark">
                      <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Button 
                variant={plan.featured ? "primary" : "secondary"} 
                size="lg" 
                className={`w-full rounded-xl text-lg font-bold h-14 ${
                  plan.featured 
                    ? "bg-gradient-to-r from-brand-magenta to-brand-orange shadow-lg shadow-brand-magenta/25 hover:shadow-xl hover:shadow-brand-magenta/40" 
                    : "bg-white/50 hover:bg-white border border-brand-navy/10"
                }`}
                asChild
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* FAQ Section */}
      <section className="glass-panel rounded-[40px] border-brand-navy/10 p-8 shadow-xl sm:p-12 relative z-10">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/25 bg-brand-orange/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-orange shadow-sm">
            FAQ
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-navy sm:text-4xl">Frequently Asked Questions</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-3xl border border-brand-navy/10 bg-white/40 p-8 shadow-sm backdrop-blur-sm transition-all hover:bg-white/60 hover:shadow-md">
            <p className="text-lg font-bold text-brand-navy">Can I switch between ambience presets during an event?</p>
            <p className="text-sm leading-relaxed text-brand-navy/70">
              Absolutely. All plans let you drop cues in real time. Premiere and Marathon automate the transitions based on your timeline.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-brand-navy/10 bg-white/40 p-8 shadow-sm backdrop-blur-sm transition-all hover:bg-white/60 hover:shadow-md">
            <p className="text-lg font-bold text-brand-navy">Do you support custom branding?</p>
            <p className="text-sm leading-relaxed text-brand-navy/70">
              Premiere adds logo placement and sponsor bumpers. Marathon unlocks bespoke ambience palettes curated by our design team.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-brand-navy/10 bg-white/40 p-8 shadow-sm backdrop-blur-sm transition-all hover:bg-white/60 hover:shadow-md">
            <p className="text-lg font-bold text-brand-navy">What happens if the host drops?</p>
            <p className="text-sm leading-relaxed text-brand-navy/70">
              Co-hosts automatically inherit controls and WatchParty keeps the stream running while the original host reconnects.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-brand-navy/10 bg-white/40 p-8 shadow-sm backdrop-blur-sm transition-all hover:bg-white/60 hover:shadow-md">
            <p className="text-lg font-bold text-brand-navy">Is there an education discount?</p>
            <p className="text-sm leading-relaxed text-brand-navy/70">
              Yes—campus clubs and classrooms receive 25% off Premiere. Reach out at hello@watchparty.tv to apply the discount.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

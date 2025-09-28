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
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[48px] border border-white/12 bg-[rgba(10,6,30,0.82)] px-8 py-16 shadow-[0_60px_150px_rgba(5,3,26,0.6)] sm:px-12 lg:px-20">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[conic-gradient(from_120deg_at_65%_25%,rgba(255,255,255,0.18),rgba(255,214,170,0.32),rgba(58,34,108,0.45),rgba(255,255,255,0.12))]" />
          <div className="grid-overlay" />
        </div>
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
              Pricing
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/60">
              Sunrise ↔ Midnight
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Plans that scale from intimate matinees to global midnight premieres
          </h1>
          <p className="max-w-3xl text-lg text-white/75">
            Every tier includes precision sync, dual ambience presets, and spoiler-safe chat. Upgrade when you want automated rituals, co-host orchestration, or dedicated support.
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            className={
              plan.featured
                ? "border-white/18 bg-[rgba(16,9,48,0.85)] shadow-[0_48px_130px_rgba(8,4,36,0.6)]"
                : "border-white/12 bg-[rgba(12,7,34,0.78)]"
            }
          >
            <CardHeader>
              <CardTitle className="text-2xl text-white">{plan.name}</CardTitle>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">{plan.featured ? "Most popular" : ""}</p>
              <p className="text-3xl font-semibold text-white">{plan.price}</p>
              <CardDescription className="text-base text-white/75">{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm text-white/80">
                {plan.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-[var(--color-accent-500)]" aria-hidden />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant={plan.featured ? "primary" : "secondary"} size="lg" asChild>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className="rounded-[38px] border border-white/12 bg-[rgba(15,9,44,0.75)] p-8 sm:p-12">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Frequently asked</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="space-y-3 rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
            <p className="text-sm font-semibold text-white">Can I switch between ambience presets during an event?</p>
            <p className="text-sm text-white/70">
              Absolutely. All plans let you drop cues in real time. Premiere and Marathon automate the transitions based on your timeline.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
            <p className="text-sm font-semibold text-white">Do you support custom branding?</p>
            <p className="text-sm text-white/70">
              Premiere adds logo placement and sponsor bumpers. Marathon unlocks bespoke ambience palettes curated by our design team.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
            <p className="text-sm font-semibold text-white">What happens if the host drops?</p>
            <p className="text-sm text-white/70">
              Co-hosts automatically inherit controls and WatchParty keeps the stream running while the original host reconnects.
            </p>
          </div>
          <div className="space-y-3 rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
            <p className="text-sm font-semibold text-white">Is there an education discount?</p>
            <p className="text-sm text-white/70">
              Yes—campus clubs and classrooms receive 25% off Premiere. Reach out at hello@watchparty.tv to apply the discount.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

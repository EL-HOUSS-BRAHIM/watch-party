import Link from "next/link"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    label: "Sync precision",
    value: "±18 ms",
    description: "Streamline lag across continents with adaptive sync."
  },
  {
    label: "Scene palettes",
    value: "42 presets",
    description: "Shift lighting, chat, and overlays with one cue."
  },
  {
    label: "Hosts onboarded",
    value: "11K/mo",
    description: "Communities, classrooms, and creators worldwide."
  }
]

const timeline = [
  {
    time: "18:30",
    title: "Welcome lobby",
    description: "Set the mood with warm lighting, intros, and RSVP roll call.",
    accent: "from-brand-magenta via-brand-orange to-brand-coral"
  },
  {
    time: "19:05",
    title: "Feature screening",
    description: "Perfect sync, live captions, and emoji-led reactions in real time.",
    accent: "from-brand-blue via-brand-cyan to-brand-purple"
  },
  {
    time: "21:10",
    title: "Encore lounge",
    description: "After-credits poll, highlight reels, and saved chat memories.",
    accent: "from-brand-purple via-brand-magenta to-brand-orange"
  }
]

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[52px] border border-brand-purple/15 bg-white/90 px-7 py-16 text-brand-navy shadow-[0_44px_140px_rgba(28,28,46,0.18)] sm:px-12 lg:px-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(233,64,138,0.16),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(45,156,219,0.18),transparent_60%),radial-gradient(circle_at_top_right,rgba(243,156,18,0.15),transparent_65%)]" />
      </div>
      <div className="relative grid gap-14 lg:grid-cols-[1.5fr,1fr] lg:items-center">
        <div className="space-y-10">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase tracking-[0.4em]">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-brand-magenta-dark">
              New brand system
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-4 py-1 text-brand-blue-dark">
              Day ↔ night flow
            </span>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Host cinematic watch parties from the first hello to the encore glow
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-brand-navy/70">
              WatchParty pairs precision sync with atmospheric controls so your community feels side-by-side. Script the lobby, automate cues, and celebrate together without touching the remote.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild className="px-7 py-4 text-base">
              <Link href="/auth/register">Start planning</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="px-7 py-4 text-base">
              <Link href="#experience">See the flow</Link>
            </Button>
          </div>
          <dl className="grid gap-5 sm:grid-cols-3">
            {highlights.map((item) => (
              <div key={item.label} className="rounded-3xl border border-brand-purple/15 bg-white/80 p-5 shadow-[0_22px_70px_rgba(28,28,46,0.14)]">
                <dt className="text-xs uppercase tracking-[0.32em] text-brand-navy/60">{item.label}</dt>
                <dd className="mt-2 text-3xl font-semibold text-brand-navy">{item.value}</dd>
                <dd className="mt-2 text-xs text-brand-navy/60">{item.description}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 -z-10 rounded-[44px] bg-brand-neutral/60 blur-3xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[44px] border border-brand-purple/20 bg-white/95 p-7 shadow-[0_44px_140px_rgba(74,46,160,0.18)]">
            <header className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.38em] text-brand-navy/60">
              <span>Evening agenda</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-brand-cyan-dark">
                Auto cue stack
              </span>
            </header>
            <div className="mt-8 space-y-6">
              {timeline.map((item) => (
                <div key={item.time} className="relative overflow-hidden rounded-[28px] border border-brand-purple/15 bg-white/85 p-5 shadow-[0_24px_70px_rgba(28,28,46,0.12)]">
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.accent} opacity-20`} />
                  <div className="relative space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-navy/55">{item.time}</p>
                    <p className="text-base font-semibold text-brand-navy">{item.title}</p>
                    <p className="text-sm text-brand-navy/70">{item.description}</p>
                  </div>
                </div>
              ))}
              <div className="rounded-[26px] border border-brand-magenta/20 bg-brand-magenta/5 p-5 text-sm text-brand-navy/75">
                <p className="text-xs uppercase tracking-[0.32em] text-brand-magenta-dark">Tonight&apos;s focus</p>
                <ul className="mt-3 space-y-2">
                  <li>• Dynamic lighting pairs with soundtrack cues automatically.</li>
                  <li>• Spotlight co-hosts and pin their commentary without latency.</li>
                  <li>• Encore recap and highlights saved instantly to the dashboard.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

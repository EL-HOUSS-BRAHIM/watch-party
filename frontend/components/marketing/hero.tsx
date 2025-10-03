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
    <section className="relative overflow-hidden rounded-[48px] border border-brand-purple/15 bg-white/90 px-7 py-16 text-brand-navy shadow-[0_40px_120px_rgba(28,28,46,0.18)] sm:px-12 lg:px-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(233,64,138,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(45,156,219,0.22),transparent_60%),radial-gradient(circle_at_top_right,rgba(243,156,18,0.16),transparent_60%)]" />
      </div>
      <div className="relative grid gap-14 lg:grid-cols-[1.5fr,1fr] lg:items-center">
        <div className="space-y-10">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-brand-magenta-dark">
              Cinema OS
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-brand-blue-dark">
              Sunrise ↔ Midnight
            </span>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Design sunrise premieres and midnight encores without rebuilding the room
            </h1>
            <p className="max-w-2xl text-lg text-brand-navy/70">
              WatchParty balances bright living rooms with twilight-ready ambience. Cue lighting, automate rituals, and keep every guest perfectly in sync no matter the timezone.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild className="px-7 py-4 text-base">
              <Link href="/pricing">Plan your night</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="px-7 py-4 text-base">
              <Link href="#features">Preview the toolkit</Link>
            </Button>
          </div>
          <dl className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-3xl border border-brand-purple/15 bg-white/80 p-5 shadow-[0_20px_60px_rgba(74,46,160,0.12)]">
              <dt className="text-xs uppercase tracking-[0.32em] text-brand-purple">Preset palettes</dt>
              <dd className="mt-2 text-3xl font-semibold text-brand-navy">42 scenes</dd>
              <dd className="mt-2 text-xs text-brand-navy/60">Sunrise, dusk, neon, and after-party lighting in one tap.</dd>
            </div>
            <div className="rounded-3xl border border-brand-cyan/20 bg-white/80 p-5 shadow-[0_20px_60px_rgba(59,198,232,0.15)]">
              <dt className="text-xs uppercase tracking-[0.32em] text-brand-cyan-dark">Sync drift</dt>
              <dd className="mt-2 text-3xl font-semibold text-brand-navy">±18 ms</dd>
              <dd className="mt-2 text-xs text-brand-navy/60">Frame-perfect playback even when guests jump between scenes.</dd>
            </div>
            <div className="rounded-3xl border border-brand-orange/20 bg-white/80 p-5 shadow-[0_20px_60px_rgba(243,156,18,0.18)]">
              <dt className="text-xs uppercase tracking-[0.32em] text-brand-orange-dark">Hosts onboarded</dt>
              <dd className="mt-2 text-3xl font-semibold text-brand-navy">11k / mo</dd>
              <dd className="mt-2 text-xs text-brand-navy/60">Festival crews, classrooms, and fandom clubs in 62 countries.</dd>
            </div>
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 -z-10 rounded-[40px] bg-brand-neutral/60 blur-3xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[40px] border border-brand-purple/20 bg-white p-7 text-brand-navy shadow-[0_40px_120px_rgba(28,28,46,0.16)]">
            <header className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.4em] text-brand-navy/60">
              <span>Scene timeline</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-3 py-1 text-brand-blue-dark">
                Dual ambience
              </span>
            </header>
            <div className="mt-7 space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-[28px] border border-brand-orange/30 bg-white text-brand-navy shadow-[0_20px_55px_rgba(243,156,18,0.18)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(243,156,18,0.35),transparent_65%)]" />
                  <div className="relative space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-orange-dark">08:15</p>
                    <p className="text-sm font-medium text-brand-purple">Sunrise premiere lobby</p>
                    <p className="text-xs text-brand-navy/60">Warm white lighting, stretch goals board, ambient vinyl.</p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[28px] border border-brand-purple/25 bg-brand-purple/90 text-white shadow-[0_28px_65px_rgba(74,46,160,0.35)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(233,64,138,0.4),transparent_60%)]" />
                  <div className="relative space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/75">23:45</p>
                    <p className="text-sm font-medium text-white">Midnight encore</p>
                    <p className="text-xs text-white/80">Neon accents, spoiler-safe reactions, spotlight co-host.</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 rounded-[28px] border border-brand-cyan/25 bg-brand-cyan/5 p-5 text-sm text-brand-navy/80">
                <p className="text-xs uppercase tracking-[0.32em] text-brand-cyan-dark">Tonight&apos;s rituals</p>
                <ul className="space-y-2 text-brand-navy/70">
                  <li>• Fade lobby soundtrack as countdown hits 30 seconds.</li>
                  <li>• Auto dim smart lights when film opens.</li>
                  <li>• Trigger midnight neon overlay for encore reactions.</li>
                </ul>
              </div>
              <div className="grid gap-3 rounded-[24px] border border-brand-magenta/25 bg-brand-magenta/5 p-5 text-xs uppercase tracking-[0.32em] text-brand-navy/60">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-brand-magenta/30 bg-brand-magenta/15 px-3 py-1 text-[11px] font-semibold text-brand-magenta-dark">
                    Auto cues
                  </span>
                  <span className="text-brand-navy font-semibold">Ready</span>
                </div>
                <div className="h-2 rounded-full bg-brand-magenta/20">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange" style={{ width: "86%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

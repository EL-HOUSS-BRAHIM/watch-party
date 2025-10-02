import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[56px] border border-brand-magenta/12 bg-brand-navy/70 px-7 py-16 shadow-[0_60px_160px_rgba(28,28,46,0.65)] sm:px-12 lg:px-16">
      <div className="absolute inset-0 -z-10 opacity-80">
        <div className="absolute inset-0 bg-[conic-gradient(from_120deg_at_65%_35%,rgba(233,64,138,0.2),rgba(243,156,18,0.35),rgba(74,46,160,0.45),rgba(59,198,232,0.12))]" />
        <div className="grid-overlay" />
      </div>
      <div className="relative grid gap-14 lg:grid-cols-[1.45fr,1fr] lg:items-center">
        <div className="space-y-10">
          <div className="flex flex-wrap items-center gap-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/70">
              Cinema OS
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/60">
              Sunrise ↔ Midnight
            </span>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Design sunrise premieres and midnight encores without rebuilding the room
            </h1>
            <p className="max-w-2xl text-lg text-white/75">
              WatchParty balances white room brightness with oklch(42% .18 15) twilight accents. Cue lighting, automate rituals, and keep every guest perfectly in sync no matter the timezone.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <Link href="/pricing">Plan your night</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="#features">Preview the toolkit</Link>
            </Button>
          </div>
          <dl className="grid gap-5 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
              <dt className="text-xs uppercase tracking-[0.32em] text-white/60">Preset palettes</dt>
              <dd className="mt-2 text-3xl font-semibold text-white">42 scenes</dd>
              <dd className="mt-2 text-xs text-white/60">Sunrise, dusk, neon, and after-party lighting in one tap.</dd>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
              <dt className="text-xs uppercase tracking-[0.32em] text-white/60">Sync drift</dt>
              <dd className="mt-2 text-3xl font-semibold text-white">±18 ms</dd>
              <dd className="mt-2 text-xs text-white/60">Frame-perfect playback even when guests jump between scenes.</dd>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 p-5 text-white/80">
              <dt className="text-xs uppercase tracking-[0.32em] text-white/60">Hosts onboarded</dt>
              <dd className="mt-2 text-3xl font-semibold text-white">11k / mo</dd>
              <dd className="mt-2 text-xs text-white/60">Festival crews, classrooms, and fandom clubs in 62 countries.</dd>
            </div>
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute inset-0 -z-10 rounded-[40px] bg-[rgba(255,255,255,0.08)] blur-3xl" aria-hidden />
          <div className="relative overflow-hidden rounded-[40px] border border-white/12 bg-[rgba(16,9,46,0.78)] p-7 text-white shadow-[0_45px_140px_rgba(6,3,30,0.6)]">
            <header className="flex items-center justify-between gap-4 text-xs uppercase tracking-[0.4em] text-white/60">
              <span>Scene timeline</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1">
                Dual ambience
              </span>
            </header>
            <div className="mt-7 space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white text-brand-navy shadow-[0_20px_55px_rgba(255,255,255,0.28)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgba(243,156,18,0.55),transparent_60%)]" />
                  <div className="relative space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em]">08:15</p>
                    <p className="text-sm font-medium text-brand-purple">Sunrise premiere lobby</p>
                    <p className="text-xs text-brand-purple-light">Warm white lighting, stretch goals board, ambient vinyl.</p>
                  </div>
                </div>
                <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-[radial-gradient(circle_at_top,rgba(74,46,160,0.85),rgba(28,28,46,0.95))] text-white shadow-[0_28px_65px_rgba(74,46,160,0.6)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(233,64,138,0.4),transparent_60%)]" />
                  <div className="relative space-y-3 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/70">23:45</p>
                    <p className="text-sm font-medium text-white/85">Midnight encore</p>
                    <p className="text-xs text-white/70">Neon accents, spoiler-safe reactions, spotlight co-host.</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 rounded-[28px] border border-white/12 bg-white/5 p-5 text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.32em] text-white/60">Tonight&apos;s rituals</p>
                <ul className="space-y-2">
                  <li>• Fade lobby soundtrack as countdown hits 30 seconds.</li>
                  <li>• Auto dim smart lights when film opens.</li>
                  <li>• Trigger midnight neon overlay for encore reactions.</li>
                </ul>
              </div>
              <div className="grid gap-3 rounded-[24px] border border-white/12 bg-white/5 p-5 text-xs uppercase tracking-[0.32em] text-white/60">
                <div className="flex items-center justify-between gap-3 text-[color:var(--color-text-muted)]">
                  <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] text-white/70">
                    Auto cues
                  </span>
                  <span className="text-white">Ready</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
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

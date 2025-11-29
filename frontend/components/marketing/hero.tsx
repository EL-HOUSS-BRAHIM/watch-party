import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative rounded-2xl sm:rounded-3xl border border-brand-purple/10 bg-white/80 px-4 py-8 text-brand-navy backdrop-blur-sm sm:px-8 sm:py-12 md:px-10 md:py-16 lg:px-14 lg:py-20">
      {/* Subtle background gradient */}
      <div className="pointer-events-none absolute inset-0 -z-10 rounded-2xl sm:rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(233,64,138,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(45,156,219,0.08),transparent_55%)]" />
      </div>

      <div className="grid gap-8 md:gap-12 lg:grid-cols-[1.4fr,1fr] lg:items-center lg:gap-16">
        {/* Left Content */}
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
          {/* Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-start">
            <span className="inline-flex items-center rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-magenta-dark">
              Cinema OS
            </span>
            <span className="inline-flex items-center rounded-full border border-brand-blue/20 bg-brand-blue/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-blue-dark">
              Sunrise ↔ Midnight
            </span>
          </div>

          {/* Headline */}
          <div className="space-y-3 sm:space-y-4">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl lg:text-5xl">
              Design sunrise premieres and midnight encores
            </h1>
            <p className="max-w-xl text-sm text-brand-navy/65 sm:text-base md:text-lg mx-auto lg:mx-0">
              WatchParty balances bright living rooms with twilight-ready ambience. Keep every guest perfectly in sync no matter the timezone.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <Button size="lg" asChild className="w-full sm:w-auto min-h-[48px]">
              <Link href="/pricing">Plan your night</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild className="w-full sm:w-auto min-h-[48px]">
              <Link href="#features">Preview toolkit</Link>
            </Button>
          </div>

          {/* Auth links */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:justify-start pt-1 sm:pt-2">
            <Link href="/auth/login" className="text-sm font-medium text-brand-navy/70 hover:text-brand-navy transition-colors px-3 py-2 min-h-[44px] flex items-center">
              Sign in
            </Link>
            <Button asChild size="sm" variant="secondary" className="min-h-[44px]">
              <Link href="/auth/register">Start hosting</Link>
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-3 pt-2 sm:pt-4 xs:grid-cols-3 sm:grid-cols-3 sm:gap-4">
            {[
              { label: "Preset palettes", value: "42 scenes", color: "brand-purple" },
              { label: "Sync drift", value: "±18 ms", color: "brand-cyan" },
              { label: "Hosts monthly", value: "11k+", color: "brand-orange" }
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl sm:rounded-2xl border border-brand-purple/8 bg-white/60 p-3 sm:p-4 text-center sm:text-left">
                <p className={`text-[10px] uppercase tracking-wider text-${stat.color}-dark font-medium`}>{stat.label}</p>
                <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-brand-navy">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Scene Timeline Card */}
        <div className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none">
          <div className="rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-white p-4 sm:p-6 shadow-sm">
            <header className="flex items-center justify-between text-[11px] sm:text-xs mb-4 sm:mb-6">
              <span className="uppercase tracking-wider text-brand-navy/50 font-medium">Scene timeline</span>
              <span className="rounded-full border border-brand-blue/20 bg-brand-blue/5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-brand-blue-dark font-medium">
                Dual ambience
              </span>
            </header>

            {/* Scene Cards */}
            <div className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 sm:gap-4 mb-4 sm:mb-5">
              <div className="rounded-lg sm:rounded-xl border border-brand-orange/15 bg-gradient-to-br from-brand-orange/5 to-transparent p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs font-semibold text-brand-orange-dark mb-0.5 sm:mb-1">08:15</p>
                <p className="text-sm font-medium text-brand-navy">Sunrise premiere</p>
                <p className="text-[11px] sm:text-xs text-brand-navy/55 mt-0.5 sm:mt-1">Warm lighting, ambient vinyl</p>
              </div>
              <div className="rounded-lg sm:rounded-xl border border-brand-purple/20 bg-gradient-to-br from-brand-purple/10 to-brand-purple/5 p-3 sm:p-4">
                <p className="text-[11px] sm:text-xs font-semibold text-brand-purple-light mb-0.5 sm:mb-1">23:45</p>
                <p className="text-sm font-medium text-brand-purple-dark">Midnight encore</p>
                <p className="text-[11px] sm:text-xs text-brand-navy/55 mt-0.5 sm:mt-1">Neon accents, spotlight host</p>
              </div>
            </div>

            {/* Rituals List */}
            <div className="rounded-lg sm:rounded-xl border border-brand-cyan/15 bg-brand-cyan/3 p-3 sm:p-4 mb-3 sm:mb-4">
              <p className="text-[11px] sm:text-xs uppercase tracking-wider text-brand-cyan-dark font-medium mb-1.5 sm:mb-2">Tonight&apos;s rituals</p>
              <ul className="space-y-1 sm:space-y-1.5 text-[13px] sm:text-sm text-brand-navy/65">
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-brand-cyan-dark shrink-0" />
                  Fade lobby as countdown hits 30s
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-brand-cyan-dark shrink-0" />
                  Auto dim lights when film opens
                </li>
              </ul>
            </div>

            {/* Progress Bar */}
            <div className="rounded-lg sm:rounded-xl border border-brand-magenta/15 bg-brand-magenta/3 p-3 sm:p-4">
              <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5 sm:mb-2">
                <span className="rounded-full bg-brand-magenta/10 px-2 py-0.5 text-brand-magenta-dark font-medium">
                  Auto cues
                </span>
                <span className="text-brand-navy font-medium">Ready</span>
              </div>
              <div className="h-1.5 rounded-full bg-brand-magenta/15 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange transition-all duration-500" style={{ width: "86%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

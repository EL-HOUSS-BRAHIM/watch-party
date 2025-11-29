import { metrics } from "@/lib/data/home"

export function MetricStrip() {
  return (
    <section id="metrics" className="rounded-xl sm:rounded-2xl border border-brand-purple/8 bg-white/70 p-4 sm:p-6 md:p-10 backdrop-blur-sm">
      <div className="grid gap-8 md:gap-10 lg:grid-cols-[1.2fr,1fr] lg:items-start">
        {/* Left Content */}
        <div className="space-y-4 sm:space-y-5">
          <div className="space-y-2 sm:space-y-3">
            <span className="inline-flex items-center rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-magenta-dark">
              Proof in the glow
            </span>
            <h2 className="text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl">
              Thousands of hosts rely on WatchParty for{" "}
              <span className="bg-gradient-to-r from-brand-magenta to-brand-coral bg-clip-text text-transparent">
                luminous nights
              </span>
            </h2>
          </div>
          <p className="text-sm text-brand-navy/60 max-w-lg sm:text-base">
            Our sync engine and ambience presets power film festivals, esports leagues, and classroom screenings worldwide.
          </p>

          {/* Feature Pills */}
          <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 pt-1 sm:pt-2">
            <div className="rounded-lg sm:rounded-xl border border-brand-purple/10 bg-brand-purple/3 p-3 sm:p-4 transition-all duration-300 hover:border-brand-purple/20">
              <p className="text-[11px] sm:text-xs font-medium text-brand-purple uppercase tracking-wider mb-0.5 sm:mb-1">Festival-ready</p>
              <p className="text-[13px] sm:text-sm text-brand-navy/65">Multi-night events schedule cues once and reuse them across screens.</p>
            </div>
            <div className="rounded-lg sm:rounded-xl border border-brand-orange/10 bg-brand-orange/3 p-3 sm:p-4 transition-all duration-300 hover:border-brand-orange/20">
              <p className="text-[11px] sm:text-xs font-medium text-brand-orange-dark uppercase tracking-wider mb-0.5 sm:mb-1">Global friendly</p>
              <p className="text-[13px] sm:text-sm text-brand-navy/65">Auto-translated chat, caption sync, and timezone smart invites.</p>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-1">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className="rounded-lg sm:rounded-xl border border-brand-blue/10 bg-white/80 p-4 sm:p-5 transition-all duration-300 hover:border-brand-blue/20 hover:shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-[10px] font-medium uppercase tracking-wider text-brand-blue/60">{metric.label}</p>
              <p className="mt-1 sm:mt-2 text-2xl sm:text-3xl font-bold text-brand-navy">{metric.value}</p>
              <p className="mt-1 sm:mt-2 text-[13px] sm:text-sm text-brand-navy/55">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

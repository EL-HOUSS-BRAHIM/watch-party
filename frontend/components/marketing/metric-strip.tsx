import { metrics } from "@/lib/data/home"

export function MetricStrip() {
  return (
    <section
      id="metrics"
      className="relative overflow-hidden rounded-[44px] border border-brand-magenta/12 bg-brand-navy/80 px-6 py-12 shadow-[0_55px_150px_rgba(28,28,46,0.6)] sm:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(243,156,18,0.45),transparent_65%)] opacity-60 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(74,46,160,0.55),transparent_60%)] opacity-60 blur-[140px]"
      />
      <div className="relative grid gap-12 lg:grid-cols-[1.2fr,1fr] lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
            Proof in the glow
          </span>
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Thousands of hosts rely on WatchParty to run seamless days that end in luminous nights
          </h2>
          <p className="text-base text-white/75">
            WatchParty&apos;s sync engine and ambience presets power film festivals, esports leagues, and classroom screenings. Here&apos;s what crews experience after switching from DIY setups.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-white/12 bg-white/5 p-6 text-white/80">
              <p className="text-xs uppercase tracking-[0.36em] text-white/60">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
              <p className="mt-3 text-sm text-white/70">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

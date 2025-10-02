import { metrics } from "@/lib/data/home"

export function MetricStrip() {
  return (
    <section
      id="metrics"
      className="relative overflow-hidden rounded-[44px] border border-brand-purple/15 bg-white/90 px-6 py-12 text-brand-navy shadow-[0_36px_110px_rgba(28,28,46,0.15)] sm:px-10"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,64,138,0.18),transparent_65%)] opacity-70 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(45,156,219,0.2),transparent_60%)] opacity-70 blur-[140px]"
      />
      <div className="relative grid gap-12 lg:grid-cols-[1.2fr,1fr] lg:items-center">
        <div className="space-y-5">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-brand-magenta-dark">
            Proof in the glow
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Thousands of hosts rely on WatchParty to run seamless days that end in luminous nights
          </h2>
          <p className="text-base text-brand-navy/70">
            WatchParty&apos;s sync engine and ambience presets power film festivals, esports leagues, and classroom screenings. Here&apos;s what crews experience after switching from DIY setups.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-brand-blue/20 bg-white/85 p-6 text-brand-navy shadow-[0_20px_65px_rgba(45,156,219,0.14)]">
              <p className="text-xs uppercase tracking-[0.36em] text-brand-blue-dark">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold text-brand-navy">{metric.value}</p>
              <p className="mt-3 text-sm text-brand-navy/70">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

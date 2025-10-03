import { metrics } from "@/lib/data/home"

export function MetricStrip() {
  return (
    <section
      id="metrics"
      className="relative overflow-hidden rounded-[48px] border border-brand-purple/15 bg-white/90 px-6 py-16 text-brand-navy shadow-[0_42px_130px_rgba(28,28,46,0.16)] sm:px-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,64,138,0.18),transparent_65%)] opacity-70 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-28 top-1/3 h-80 w-80 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(45,156,219,0.2),transparent_60%)] opacity-70 blur-[140px]"
      />
      <div className="relative grid gap-12 lg:grid-cols-[1.15fr,1fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.45em] text-brand-magenta-dark">
            Proof of the party
          </span>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Communities trade spreadsheets for rituals that feel like the theatre again
          </h2>
          <p className="text-base text-brand-navy/70">
            WatchParty hosts operate across time zones, devices, and content sources. They rely on the platform&apos;s sync, ambience, and storytelling tools to run their shows without friction.
          </p>
          <div className="grid gap-4 text-sm text-brand-navy/70 sm:grid-cols-2">
            <div className="rounded-3xl border border-brand-purple/20 bg-brand-purple/5 p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-brand-purple">Festival-ready</p>
              <p className="mt-2 leading-relaxed">Multi-night events schedule cues once and reuse them across screens and locations.</p>
            </div>
            <div className="rounded-3xl border border-brand-orange/25 bg-brand-orange/10 p-5">
              <p className="text-xs uppercase tracking-[0.32em] text-brand-orange-dark">Global friendly</p>
              <p className="mt-2 leading-relaxed">Auto-translated chat, caption sync, and timezone smart invites keep everyone aligned.</p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-3xl border border-brand-blue/20 bg-white/85 p-6 text-brand-navy shadow-[0_26px_85px_rgba(45,156,219,0.16)]">
              <p className="text-xs uppercase tracking-[0.38em] text-brand-blue-dark">{metric.label}</p>
              <p className="mt-4 text-3xl font-semibold text-brand-navy">{metric.value}</p>
              <p className="mt-4 text-sm leading-relaxed text-brand-navy/70">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

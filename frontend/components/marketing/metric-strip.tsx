import { metrics } from "@/lib/data/home"

export function MetricStrip() {
  return (
    <section
      id="metrics"
      className="relative overflow-hidden rounded-[44px] border border-brand-purple/10 bg-gradient-to-br from-white via-white to-brand-purple/5 px-8 py-16 text-brand-navy shadow-[0_32px_90px_rgba(28,28,46,0.12)] sm:px-12 lg:px-16"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(233,64,138,0.12),transparent_70%)] opacity-60 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(45,156,219,0.14),transparent_65%)] opacity-60 blur-[160px]"
      />
      <div className="relative grid gap-16 lg:grid-cols-[1.3fr,1fr] lg:items-start">
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/25 bg-brand-magenta/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-magenta-dark shadow-sm">
              Proof in the glow
            </span>
            <h2 className="text-3xl font-bold tracking-tight leading-[1.2] sm:text-4xl lg:text-[2.75rem]">
              Thousands of hosts rely on WatchParty to run seamless days that end in{" "}
              <span className="bg-gradient-to-r from-brand-magenta via-brand-orange to-brand-coral bg-clip-text text-transparent">
                luminous nights
              </span>
            </h2>
          </div>
          <p className="text-base leading-relaxed text-brand-navy/65 sm:text-lg">
            WatchParty&apos;s sync engine and ambience presets power film festivals, esports leagues, and classroom screenings. Here&apos;s what crews experience after switching from DIY setups.
          </p>
          <div className="grid gap-5 pt-2 sm:grid-cols-2">
            <div className="group rounded-3xl border border-brand-purple/15 bg-gradient-to-br from-brand-purple/5 to-brand-purple/8 p-6 transition-all duration-300 hover:border-brand-purple/25 hover:shadow-lg hover:shadow-brand-purple/10">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-brand-purple">Festival-ready</p>
              <p className="mt-3 text-sm leading-relaxed text-brand-navy/70">Multi-night events schedule cues once and reuse them across screens and locations.</p>
            </div>
            <div className="group rounded-3xl border border-brand-orange/15 bg-gradient-to-br from-brand-orange/8 to-brand-orange/12 p-6 transition-all duration-300 hover:border-brand-orange/25 hover:shadow-lg hover:shadow-brand-orange/10">
              <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-brand-orange-dark">Global friendly</p>
              <p className="mt-3 text-sm leading-relaxed text-brand-navy/70">Auto-translated chat, caption sync, and timezone smart invites keep everyone aligned.</p>
            </div>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-1 lg:pt-14">
          {metrics.map((metric, index) => (
            <div 
              key={metric.label} 
              className="group rounded-[28px] border border-brand-blue/15 bg-white/90 p-7 shadow-[0_16px_50px_rgba(45,156,219,0.1)] backdrop-blur-sm transition-all duration-300 hover:border-brand-blue/25 hover:shadow-[0_20px_60px_rgba(45,156,219,0.16)] hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-brand-blue/70">{metric.label}</p>
              <p className="mt-4 text-4xl font-black tracking-tight text-brand-navy lg:text-[2.5rem]">{metric.value}</p>
              <p className="mt-4 text-sm leading-relaxed text-brand-navy/65">{metric.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

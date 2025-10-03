import { features } from "@/lib/data/home"

const phases = [
  {
    title: "Before show",
    description: "Design arrivals with branded invites, lobby music, and countdown lighting that shifts as guests join.",
    accent: "from-brand-magenta/20 via-brand-orange/20 to-brand-coral/30"
  },
  {
    title: "During",
    description: "Automate cues, reactions, and spoiler-safe chat lanes while WatchParty maintains flawless sync for everyone.",
    accent: "from-brand-blue/20 via-brand-cyan/20 to-brand-purple/30"
  },
  {
    title: "After",
    description: "Spin up encore highlights, polls, and replay links instantly. Memories and analytics are saved to the dashboard.",
    accent: "from-brand-purple/20 via-brand-magenta/20 to-brand-orange/25"
  }
]

export function FeatureGrid() {
  return (
    <section id="features" className="space-y-16">
      <div className="mx-auto max-w-3xl space-y-5 text-center text-brand-navy">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.45em] text-brand-magenta-dark">
          WatchParty Flow
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          A single command center for every phase of your watch party ritual
        </h2>
        <p className="text-base text-brand-navy/70">
          From the first invite to the encore goodbye, WatchParty keeps ambience, content, and conversation aligned. Glide through the evening with preset arcs and live tools tuned to your audience.
        </p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.1fr,1.1fr] xl:grid-cols-[1.2fr,1fr]">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {phases.map((phase) => (
              <div key={phase.title} className="relative overflow-hidden rounded-3xl border border-brand-purple/15 bg-white/90 p-6 text-left shadow-[0_28px_90px_rgba(28,28,46,0.12)]">
                <div className={`absolute inset-0 bg-gradient-to-br ${phase.accent} opacity-70`} />
                <div className="relative space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-navy/60">{phase.title}</p>
                  <p className="text-sm text-brand-navy/75">{phase.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-[34px] border border-brand-blue/20 bg-white/95 p-8 shadow-[0_36px_110px_rgba(45,156,219,0.16)]">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-brand-blue-dark">Live control surface</p>
                <h3 className="text-2xl font-semibold text-brand-navy">Drag, cue, celebrate</h3>
                <p className="text-sm leading-relaxed text-brand-navy/70">
                  Snap rituals into a visual run of show. Lighting, media, overlays, and guest access move together without touching the stream.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-brand-navy/70 sm:grid-cols-2 lg:max-w-sm">
                <div className="rounded-3xl border border-brand-magenta/25 bg-brand-magenta/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-magenta-dark">Templates</p>
                  <p className="mt-2 font-semibold">Festival premiere</p>
                </div>
                <div className="rounded-3xl border border-brand-cyan/25 bg-brand-cyan/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-cyan-dark">Automation</p>
                  <p className="mt-2 font-semibold">Smart lighting</p>
                </div>
                <div className="rounded-3xl border border-brand-orange/25 bg-brand-orange/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-orange-dark">Engagement</p>
                  <p className="mt-2 font-semibold">Interactive polls</p>
                </div>
                <div className="rounded-3xl border border-brand-purple/20 bg-brand-purple/10 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-brand-purple">Permissions</p>
                  <p className="mt-2 font-semibold">Spotlight co-host</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-brand-purple/15 bg-white/90 p-6 text-brand-navy shadow-[0_26px_90px_rgba(28,28,46,0.12)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-lg font-semibold text-brand-navy">{feature.title}</p>
                {feature.highlight ? (
                  <span className="rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-[10px] uppercase tracking-[0.42em] text-brand-cyan-dark">
                    {feature.highlight}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-relaxed text-brand-navy/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

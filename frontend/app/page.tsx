import Link from "next/link"
import { Hero } from "@/components/marketing/hero"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { MetricStrip } from "@/components/marketing/metric-strip"
import { CallToAction } from "@/components/marketing/call-to-action"

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* Hero Section */}
      <section className="section-padding pt-6 sm:pt-10 md:pt-12 lg:pt-16">
        <div className="container-width">
          <Hero />
        </div>
      </section>

      {/* Metrics Section */}
      <section className="section-padding-sm">
        <div className="container-width">
          <MetricStrip />
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding">
        <div className="container-width">
          <FeatureGrid />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-gradient-to-b from-transparent via-white/50 to-transparent">
        <div className="container-width-sm">
          <div className="text-center mb-8 sm:mb-12 md:mb-16 px-1">
            <span className="inline-flex items-center rounded-full border border-brand-cyan/20 bg-brand-cyan/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-cyan-dark mb-3 sm:mb-4">
              How it works
            </span>
            <h2 className="text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl lg:text-4xl">
              Start watching together in{" "}
              <span className="bg-gradient-to-r from-brand-magenta to-brand-cyan bg-clip-text text-transparent">
                three steps
              </span>
            </h2>
            <p className="mt-3 sm:mt-4 text-sm text-brand-navy/60 max-w-xl mx-auto sm:text-base">
              Launch a room, add your content, and share a link. WatchParty keeps everyone in sync.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-6 grid-cols-1 xs:grid-cols-3 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create or join",
                description: "Start a new room or enter a party code to join.",
                icon: "🎬",
                accent: "brand-magenta"
              },
              {
                step: "02", 
                title: "Add content",
                description: "Upload a file, paste a link, or connect cloud storage.",
                icon: "📁",
                accent: "brand-blue"
              },
              {
                step: "03",
                title: "Watch together",
                description: "Chat, react, and enjoy like you are on the same couch.",
                icon: "✨",
                accent: "brand-orange"
              }
            ].map((item) => (
              <div
                key={item.step}
                className="group relative rounded-xl sm:rounded-2xl border border-brand-purple/8 bg-white/70 p-4 sm:p-6 md:p-8 text-center backdrop-blur-sm transition-all duration-300 hover:border-brand-purple/15 hover:bg-white hover:shadow-lg hover:-translate-y-1"
              >
                <div className="mx-auto mb-3 sm:mb-5 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-brand-purple/10 text-xl sm:text-2xl transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>
                <p className="text-[10px] sm:text-xs font-medium text-brand-navy/40 mb-1.5 sm:mb-2">{item.step}</p>
                <h3 className="text-base font-semibold text-brand-navy mb-1.5 sm:mb-2 sm:text-lg">{item.title}</h3>
                <p className="text-[13px] sm:text-sm text-brand-navy/60 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Room Preview Section */}
      <section className="section-padding">
        <div className="container-width-sm">
          <div className="rounded-2xl sm:rounded-3xl border border-brand-purple/10 bg-white/60 p-4 sm:p-6 md:p-10 backdrop-blur-sm">
            <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <h2 className="text-lg font-bold tracking-tight text-brand-navy sm:text-xl md:text-2xl">
                  Peek at the live room
                </h2>
                <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-brand-navy/60">
                  Real-time sync, reactions, and spotlight controls.
                </p>
              </div>
              <div className="flex gap-2 justify-center sm:justify-end">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-brand-magenta/8 text-base sm:text-lg transition-transform hover:scale-105">🎧</div>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-brand-blue/8 text-base sm:text-lg transition-transform hover:scale-105">💬</div>
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-brand-orange/8 text-base sm:text-lg transition-transform hover:scale-105">⚡</div>
              </div>
            </div>

            <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
              {/* Video Preview */}
              <div className="rounded-xl sm:rounded-2xl border border-brand-purple/8 bg-brand-purple/3 p-4 sm:p-5">
                <div className="flex items-center justify-between text-[13px] sm:text-sm mb-3 sm:mb-4">
                  <span className="flex items-center gap-2 font-medium text-brand-purple">
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-brand-purple animate-pulse" />
                    Friday Night Movies
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-brand-coral/10 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-medium text-brand-coral">
                    <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-brand-coral" />
                    Live
                  </span>
                </div>
                <div className="aspect-video rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-navy/5 to-brand-navy/10 flex items-center justify-center">
                  <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/80 flex items-center justify-center shadow-sm text-brand-purple">
                    ▶
                  </div>
                </div>
                <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { label: "Sync", value: "±18 ms" },
                    { label: "Reactions", value: "1.8k" },
                    { label: "Viewers", value: "24" }
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-md sm:rounded-lg bg-white/60 p-2 sm:p-3 text-center">
                      <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-brand-navy/50">{stat.label}</p>
                      <p className="mt-0.5 sm:mt-1 text-[13px] sm:text-sm font-semibold text-brand-navy">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Party Code & Checklist */}
              <div className="space-y-3 sm:space-y-4">
                <div className="rounded-xl sm:rounded-2xl border border-brand-cyan/10 bg-white/70 p-4 sm:p-5">
                  <p className="text-[11px] sm:text-xs uppercase tracking-wider text-brand-cyan-dark font-medium mb-2 sm:mb-3">Party code</p>
                  <div className="inline-flex items-center rounded-md sm:rounded-lg border border-brand-blue/15 bg-brand-blue/5 px-3 py-2 sm:px-4 sm:py-2.5 font-mono text-base sm:text-lg font-bold text-brand-blue-dark tracking-wider">
                    DEMO123
                  </div>
                  <p className="mt-2 sm:mt-3 text-[13px] sm:text-sm text-brand-navy/55">Share this code for instant access.</p>
                  <Link
                    href="/join"
                    className="mt-3 sm:mt-4 inline-flex items-center gap-2 text-[13px] sm:text-sm font-medium text-brand-blue-dark hover:text-brand-blue transition-colors min-h-[44px]"
                  >
                    Join the demo <span>→</span>
                  </Link>
                </div>

                <div className="rounded-xl sm:rounded-2xl border border-brand-purple/8 bg-white/70 p-4 sm:p-5">
                  <p className="text-[11px] sm:text-xs uppercase tracking-wider text-brand-purple font-medium mb-2 sm:mb-3">Host checklist</p>
                  <ul className="space-y-2 sm:space-y-2.5 text-[13px] sm:text-sm text-brand-navy/65">
                    {[
                      "Schedule lobby lighting and music",
                      "Enable spoiler-safe chat mode",
                      "Set up encore mode for bonus scenes"
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-purple/60 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="section-padding pb-16 sm:pb-20 md:pb-24 lg:pb-28">
        <div className="container-width">
          <CallToAction />
        </div>
      </section>
    </main>
  )
}

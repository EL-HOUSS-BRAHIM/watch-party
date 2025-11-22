import Link from "next/link"
import { Hero } from "@/components/marketing/hero"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { MetricStrip } from "@/components/marketing/metric-strip"
import { TestimonialGrid } from "@/components/marketing/testimonial-grid"
import { CallToAction } from "@/components/marketing/call-to-action"

const _blueprint = [
  {
    label: "Storyboard",
    title: "Plan every beat",
    copy: "Craft arrivals, intermissions, and encores with reusable cues and templates.",
    accent: "from-brand-magenta via-brand-orange to-brand-coral"
  },
  {
    label: "Host",
    title: "Control the moment",
    copy: "Switch scenes, spotlight commentary, and launch polls without leaving the stream.",
    accent: "from-brand-blue via-brand-cyan to-brand-purple"
  },
  {
    label: "Celebrate",
    title: "Save the memories",
    copy: "Share highlight reels, recap reactions, and deliver follow-up invites automatically.",
    accent: "from-brand-purple via-brand-magenta to-brand-orange"
  }
]

const _deviceHighlights = [
  {
    title: "Living room TV",
    body: "Hosts project the screening while WatchParty syncs captions and audio for every guest.",
    color: "border-brand-purple/20 bg-brand-purple/10"
  },
  {
    title: "Creator studio",
    body: "Stream deck-friendly shortcuts trigger lighting, overlays, and chat prompts instantly.",
    color: "border-brand-blue/20 bg-brand-blue/10"
  },
  {
    title: "Mobile watch",
    body: "Travelers stay in perfect sync with low-data mode, haptics, and emoji-led reactions.",
    color: "border-brand-magenta/20 bg-brand-magenta/10"
  }
]

export default function HomePage() {
  return (
    <>
      <section className="relative mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <Hero />
      </section>

      <section className="relative bg-gradient-to-b from-white to-brand-neutral/60 px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
        <div className="relative mx-auto max-w-6xl">
          <MetricStrip />
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FeatureGrid />
        </div>
      </section>

      <section className="relative bg-gradient-to-b from-brand-neutral/60 to-white px-4 py-24 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full bg-[radial-gradient(ellipse_at_top,rgba(74,46,160,0.05),transparent_50%)] pointer-events-none" />
        <div className="relative mx-auto max-w-5xl text-center text-brand-navy">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-cyan-dark shadow-sm backdrop-blur-sm">
            How it works
          </span>
          <h2 className="mt-6 text-3xl font-bold tracking-tight leading-[1.2] sm:text-4xl lg:text-5xl">
            Start watching together in
            <span className="bg-gradient-to-r from-brand-magenta via-brand-orange to-brand-cyan bg-clip-text text-transparent"> three simple steps</span>
          </h2>
          <p className="mt-5 text-base leading-relaxed text-brand-navy/65 sm:text-lg max-w-2xl mx-auto">
            Launch a room, add your content, and send a link—WatchParty keeps everyone perfectly in sync across every screen.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
          {[{
            step: "Step 1",
            title: "Create or join",
            description: "Spin up a new room or enter a party code to jump into the action.",
            accent: "from-brand-magenta to-brand-purple",
            icon: "🎬"
          }, {
            step: "Step 2",
            title: "Add your content",
            description: "Upload a file, paste a link, or connect cloud storage in seconds.",
            accent: "from-brand-blue to-brand-cyan",
            icon: "📁"
          }, {
            step: "Step 3",
            title: "Watch together",
            description: "Chat, react, and host like you're on the same couch—across any device.",
            accent: "from-brand-orange to-brand-coral",
            icon: "✨"
          }].map((item, index) => (
            <div 
              key={item.step} 
              className="group relative mx-auto flex max-w-sm flex-col items-center overflow-hidden rounded-[32px] border border-brand-purple/10 bg-white/80 p-10 text-center text-brand-navy shadow-[0_20px_70px_rgba(28,28,46,0.08)] backdrop-blur-md transition-all duration-500 hover:border-brand-purple/30 hover:bg-white hover:shadow-[0_30px_90px_rgba(28,28,46,0.12)] hover:-translate-y-2"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className={`relative mb-8 inline-flex h-24 w-24 items-center justify-center rounded-[28px] bg-gradient-to-br ${item.accent} text-5xl shadow-xl shadow-brand-purple/20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <div className="absolute inset-0 rounded-[28px] bg-white opacity-20 mix-blend-overlay" />
                {item.icon}
              </div>
              <p className="relative text-[10px] font-bold uppercase tracking-[0.5em] text-brand-navy/40 transition-colors group-hover:text-brand-navy/60">{item.step}</p>
              <h3 className="relative mt-4 text-2xl font-bold tracking-tight text-brand-navy">{item.title}</h3>
              <p className="relative mt-4 text-base leading-relaxed text-brand-navy/60 transition-colors group-hover:text-brand-navy/80">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <TestimonialGrid />
        </div>
      </section>

      <section className="bg-gradient-to-b from-white via-brand-neutral/70 to-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="glass-panel mx-auto mb-16 max-w-4xl rounded-[40px] p-10 text-brand-navy">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Peek at the live room</h2>
                <p className="text-base text-brand-navy/70 max-w-xl">
                  Real-time sync, emoji bursts, polls, and spotlight controls keep the party vibrant. Explore the interface before you host your first screening.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-magenta/10 text-brand-magenta transition-transform hover:scale-110">🎧</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-blue/10 text-brand-blue transition-transform hover:scale-110">💬</div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange-dark transition-transform hover:scale-110">⚡</div>
              </div>
            </div>
            <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-3xl border border-brand-purple/10 bg-brand-purple/5 p-6 shadow-inner">
                <div className="mb-4 flex items-center justify-between text-sm text-brand-navy/60">
                  <span className="font-semibold text-brand-purple flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-brand-purple animate-pulse" />
                    Friday Night Movies
                  </span>
                  <span className="flex items-center gap-2 rounded-full bg-brand-coral/10 px-3 py-1 text-xs font-semibold text-brand-coral border border-brand-coral/20">
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-coral animate-ping" />
                    Live
                  </span>
                </div>
                <div className="aspect-video rounded-2xl border border-brand-navy/5 bg-white/60 shadow-sm overflow-hidden relative group">
                  <div className="absolute inset-0 flex items-center justify-center bg-brand-navy/5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg text-brand-purple">▶</div>
                  </div>
                </div>
                <div className="mt-4 grid gap-3 text-sm text-brand-navy/70 sm:grid-cols-3">
                  <div className="rounded-2xl border border-brand-magenta/10 bg-white/50 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-brand-magenta-dark font-bold">Sync</p>
                    <p className="mt-1 text-base font-semibold text-brand-navy">±18 ms</p>
                  </div>
                  <div className="rounded-2xl border border-brand-blue/10 bg-white/50 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-brand-blue-dark font-bold">Reactions</p>
                    <p className="mt-1 text-base font-semibold text-brand-navy">1.8k</p>
                  </div>
                  <div className="rounded-2xl border border-brand-orange/10 bg-white/50 p-4 backdrop-blur-sm transition-transform hover:-translate-y-1">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-brand-orange-dark font-bold">Hosts</p>
                    <p className="mt-1 text-base font-semibold text-brand-navy">3 active</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-6">
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <span className="text-6xl">🎟️</span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-cyan-dark font-bold">Party code</p>
                  <div className="mt-4 inline-flex items-center gap-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 px-6 py-4 font-mono text-xl font-bold text-brand-blue-dark tracking-wider">
                    DEMO123
                  </div>
                  <p className="mt-4 text-sm text-brand-navy/60 leading-relaxed">Share this link and guests join instantly—no downloads required.</p>
                  <Link
                    href="/join"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-blue/10 px-6 py-2.5 text-sm font-semibold text-brand-blue-dark transition-all hover:bg-brand-blue/20 hover:gap-3"
                  >
                    Join the demo <span>→</span>
                  </Link>
                </div>
                <div className="glass-card rounded-3xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-6xl">📋</span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-purple font-bold">Host checklist</p>
                  <ul className="mt-5 space-y-4 text-sm text-brand-navy/70">
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-purple shrink-0" />
                      <span>Schedule lobby lighting and welcome soundtrack.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-purple shrink-0" />
                      <span>Enable spoiler-safe chat for first-time viewers.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-purple shrink-0" />
                      <span>Tap “Encore Mode” for bonus scenes after credits.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <CallToAction />
        </div>
      </section>
    </>
  )
}

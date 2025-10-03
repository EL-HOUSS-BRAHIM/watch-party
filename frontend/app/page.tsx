import Link from "next/link"
import { Hero } from "@/components/marketing/hero"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { MetricStrip } from "@/components/marketing/metric-strip"
import { TestimonialGrid } from "@/components/marketing/testimonial-grid"
import { CallToAction } from "@/components/marketing/call-to-action"

const blueprint = [
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

const deviceHighlights = [
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

      <section className="bg-gradient-to-b from-white to-brand-neutral/60 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <MetricStrip />
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FeatureGrid />
        </div>
      </section>

      <section className="bg-gradient-to-b from-brand-neutral/60 to-white px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center text-brand-navy">
          <span className="inline-block rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-brand-cyan-dark">
            How it works
          </span>
          <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
            Start watching together in
            <span className="bg-gradient-to-r from-brand-magenta via-brand-orange to-brand-cyan bg-clip-text text-transparent"> three simple steps</span>
          </h2>
          <p className="mt-4 text-lg text-brand-navy/70">
            Launch a room, add your content, and send a link—WatchParty keeps everyone perfectly in sync across every screen.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-6xl gap-6 md:grid-cols-3">
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
          }].map((item) => (
            <div key={item.step} className="relative overflow-hidden rounded-3xl border border-brand-purple/15 bg-white/90 p-8 text-brand-navy shadow-[0_24px_90px_rgba(28,28,46,0.12)]">
              <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.accent} text-3xl text-white shadow-lg`}>
                {item.icon}
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-brand-navy/60">{item.step}</p>
              <h3 className="mt-3 text-2xl font-bold text-brand-navy">{item.title}</h3>
              <p className="mt-3 text-base text-brand-navy/70">{item.description}</p>
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
          <div className="mx-auto mb-16 max-w-4xl rounded-[40px] border border-brand-blue/20 bg-white p-10 text-brand-navy shadow-[0_40px_120px_rgba(45,156,219,0.14)]">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Peek at the live room</h2>
                <p className="text-base text-brand-navy/70">
                  Real-time sync, emoji bursts, polls, and spotlight controls keep the party vibrant. Explore the interface before you host your first screening.
                </p>
              </div>
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-magenta/15 text-brand-magenta">🎧</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue">💬</div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange/15 text-brand-orange-dark">⚡</div>
              </div>
            </div>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-3xl border border-brand-purple/20 bg-brand-purple/5 p-6">
                <div className="mb-4 flex items-center justify-between text-sm text-brand-navy/60">
                  <span className="font-semibold text-brand-purple">Friday Night Movies</span>
                  <span className="flex items-center gap-2 rounded-full bg-brand-coral/10 px-3 py-1 text-xs font-semibold text-brand-coral">🔴 Live</span>
                </div>
                <div className="aspect-video rounded-2xl border border-brand-navy/10 bg-white/60 shadow-inner shadow-brand-navy/10"></div>
                <div className="mt-4 grid gap-3 text-sm text-brand-navy/70 sm:grid-cols-3">
                  <div className="rounded-2xl border border-brand-magenta/20 bg-brand-magenta/5 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-magenta-dark">Sync</p>
                    <p className="mt-1 text-base font-semibold text-brand-navy">±18 ms drift</p>
                  </div>
                  <div className="rounded-2xl border border-brand-blue/20 bg-brand-blue/5 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-blue-dark">Reactions</p>
                    <p className="mt-1 text-base font-semibold text-brand-navy">1.8k cheering</p>
                  </div>
                  <div className="rounded-2xl border border-brand-orange/25 bg-brand-orange/5 p-4">
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-orange-dark">Hosts</p>
                    <p className="mt-1 text-base font-semibold text-brand-navy">3 co-pilots</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-6">
                <div className="rounded-3xl border border-brand-cyan/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(59,198,232,0.18)]">
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-cyan-dark">Party code</p>
                  <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-brand-blue/20 bg-brand-blue/5 px-4 py-3 font-mono text-lg font-semibold text-brand-blue-dark">
                    DEMO123
                  </div>
                  <p className="mt-3 text-sm text-brand-navy/60">Share this link and guests join instantly—no downloads required.</p>
                  <Link
                    href="/join"
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-5 py-2 text-sm font-semibold text-brand-blue-dark transition-all hover:bg-brand-blue/20"
                  >
                    Join the demo →
                  </Link>
                </div>
                <div className="rounded-3xl border border-brand-purple/20 bg-white/90 p-6 shadow-[0_24px_80px_rgba(74,46,160,0.18)]">
                  <p className="text-xs uppercase tracking-[0.35em] text-brand-purple">Host checklist</p>
                  <ul className="mt-4 space-y-3 text-sm text-brand-navy/70">
                    <li>• Schedule lobby lighting and welcome soundtrack.</li>
                    <li>• Enable spoiler-safe chat for first-time viewers.</li>
                    <li>• Tap “Encore Mode” for bonus scenes after credits.</li>
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

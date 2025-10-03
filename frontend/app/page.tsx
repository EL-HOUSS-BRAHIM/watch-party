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
      <section className="relative mx-auto max-w-[min(100%,1440px)] px-4 pb-20 pt-10 sm:px-6 lg:px-10 xl:px-12">
        <Hero />
      </section>

      <section id="experience" className="bg-gradient-to-b from-white via-brand-neutral/50 to-white px-4 py-24 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[min(100%,1440px)] space-y-16">
          <div className="mx-auto max-w-4xl text-center text-brand-navy">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-5 py-2 text-sm font-semibold uppercase tracking-[0.45em] text-brand-cyan-dark">
              Experience blueprint
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
              Script a night that flows from the first hello to the encore toast
            </h2>
            <p className="mt-4 text-lg text-brand-navy/70">
              WatchParty makes it effortless to choreograph your timeline. Drag cues into place, then let automation keep the ambience and conversations aligned across every screen.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {blueprint.map((stage) => (
              <div key={stage.title} className="relative overflow-hidden rounded-3xl border border-brand-purple/15 bg-white/90 p-8 text-left shadow-[0_28px_95px_rgba(28,28,46,0.14)]">
                <div className={`absolute inset-0 bg-gradient-to-br ${stage.accent} opacity-30`} />
                <div className="relative space-y-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-brand-navy/55">{stage.label}</p>
                  <h3 className="text-2xl font-semibold text-brand-navy">{stage.title}</h3>
                  <p className="text-sm leading-relaxed text-brand-navy/70">{stage.copy}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-8 lg:grid-cols-[1.3fr,0.9fr] lg:items-center">
            <div className="rounded-[36px] border border-brand-purple/20 bg-white/95 p-10 text-brand-navy shadow-[0_36px_110px_rgba(74,46,160,0.16)]">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-purple">Live control room</p>
                  <h3 className="text-2xl font-semibold">Friday Night Premiere</h3>
                </div>
                <div className="flex gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-magenta/15 text-lg">🎬</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-blue/15 text-lg">💬</span>
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-orange/15 text-lg">✨</span>
                </div>
              </div>
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-3xl border border-brand-blue/20 bg-brand-blue/5 p-6">
                  <div className="mb-4 flex items-center justify-between text-sm text-brand-navy/60">
                    <span className="font-semibold text-brand-blue-dark">Scene timeline</span>
                    <span className="rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-brand-cyan-dark">Synced</span>
                  </div>
                  <div className="space-y-4">
                    {["Lobby intros", "Feature film", "Encore lounge"].map((segment, index) => (
                      <div key={segment} className="flex items-start justify-between gap-4 rounded-2xl border border-brand-purple/15 bg-white/90 p-4 shadow-[0_18px_50px_rgba(28,28,46,0.12)]">
                        <div>
                          <p className="text-xs uppercase tracking-[0.32em] text-brand-navy/55">{index === 0 ? "18:30" : index === 1 ? "19:05" : "21:10"}</p>
                          <p className="text-sm font-semibold text-brand-navy">{segment}</p>
                        </div>
                        <span className="rounded-full border border-brand-magenta/25 bg-brand-magenta/10 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-brand-magenta-dark">
                          Cue
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-3xl border border-brand-cyan/25 bg-white/95 p-6 shadow-[0_24px_80px_rgba(59,198,232,0.18)]">
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-cyan-dark">Party code</p>
                    <div className="mt-3 inline-flex items-center gap-3 rounded-2xl border border-brand-blue/25 bg-brand-blue/10 px-4 py-3 font-mono text-lg font-semibold text-brand-blue-dark">
                      DEMO123
                    </div>
                    <p className="mt-3 text-sm text-brand-navy/60">Share a link and guests join instantly—no downloads or setup.</p>
                    <Link
                      href="/join"
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-brand-blue/30 bg-brand-blue/10 px-5 py-2 text-sm font-semibold text-brand-blue-dark transition-all hover:bg-brand-blue/20"
                    >
                      Join the demo →
                    </Link>
                  </div>
                  <div className="rounded-3xl border border-brand-magenta/20 bg-white/95 p-6 shadow-[0_24px_80px_rgba(233,64,138,0.18)]">
                    <p className="text-xs uppercase tracking-[0.35em] text-brand-magenta-dark">Host checklist</p>
                    <ul className="mt-4 space-y-3 text-sm text-brand-navy/70">
                      <li>• Welcome playlist fades when countdown hits 30 seconds.</li>
                      <li>• Spotlight co-host for director commentary.</li>
                      <li>• Launch encore poll as credits roll.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-[36px] border border-brand-purple/15 bg-white/90 p-10 text-brand-navy shadow-[0_32px_100px_rgba(28,28,46,0.15)]">
              <div className="space-y-6">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-purple">Multi-device harmony</p>
                <h3 className="text-2xl font-semibold text-brand-navy">Whatever screen they join from, the story stays aligned</h3>
                <p className="text-sm leading-relaxed text-brand-navy/70">
                  Guests tap in from theatre projectors, laptops, or phones. WatchParty calibrates sync, captions, and reactions automatically so everyone experiences the same moment.
                </p>
                <div className="grid gap-4">
                  {deviceHighlights.map((item) => (
                    <div key={item.title} className={`rounded-3xl border ${item.color} p-5 text-sm text-brand-navy/75`}>
                      <p className="text-xs uppercase tracking-[0.32em] text-brand-navy/55">{item.title}</p>
                      <p className="mt-2 leading-relaxed">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-b from-white to-brand-neutral/60 px-4 py-24 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[min(100%,1440px)]">
          <MetricStrip />
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[min(100%,1440px)]">
          <FeatureGrid />
        </div>
      </section>

      <section className="bg-gradient-to-b from-brand-neutral/60 to-white px-4 py-24 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[min(100%,1440px)]">
          <TestimonialGrid />
        </div>
      </section>

      <section className="bg-gradient-to-b from-white via-brand-neutral/70 to-white px-4 py-24 sm:px-6 lg:px-10 xl:px-12">
        <div className="mx-auto max-w-[min(100%,1440px)]">
          <CallToAction />
        </div>
      </section>
    </>
  )
}

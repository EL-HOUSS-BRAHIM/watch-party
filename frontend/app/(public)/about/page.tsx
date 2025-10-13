import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const timeline = [
  {
    year: "2020",
    title: "Weekend experiments",
    description:
      "WatchParty started as a living room hack to sync film club meetups. Our first prototype dimmed Hue lights across four apartments and aligned captions perfectly.",
  },
  {
    year: "2021",
    title: "Festival debut",
    description:
      "Independent directors streamed premieres across time zones. The dual ambience engine was born so Q&As at sunrise flowed into neon midnight encores.",
  },
  {
    year: "2023",
    title: "Creator collectives",
    description:
      "Esports crews, classrooms, and fandom communities replaced screen shares with cinematic lobbies, spoiler-safe chat, and automated rituals.",
  },
]

export default function AboutPage() {
  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="text-center">
        <div className="mx-auto max-w-4xl space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-purple/25 bg-brand-purple/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-purple shadow-sm">
            About WatchParty
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
            We build a{" "}
            <span className="bg-gradient-to-r from-brand-magenta via-brand-purple to-brand-cyan bg-clip-text text-transparent">
              cinematic operating system
            </span>{" "}
            for crews who host from dawn through midnight
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-brand-navy/70 sm:text-xl">
            WatchParty combines precision sync with beautiful ambience presets. Automations handle the technical details so hosts can focus on creating unforgettable shared experiences.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/pricing">Explore plans</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/guides/watch-night">Read the watch night guide</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features and Stats Grid */}
      <section className="grid gap-8 lg:grid-cols-[1.1fr,1fr]">
        <Card className="border border-brand-navy/10 bg-white/80 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-brand-navy">Day-to-night design principles</CardTitle>
            <CardDescription className="text-base leading-relaxed text-brand-navy/70">
              Our product philosophy blends physical theatre cues with collaborative tooling. Every module respects the film while guiding conversation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/5 p-5">
                <p className="text-sm font-semibold text-brand-navy">Ambience without distraction</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">
                  Lighting, overlays, and sound cues complement the narrative—they never cover subtitles or the primary frame.
                </p>
              </div>
              <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/5 p-5">
                <p className="text-sm font-semibold text-brand-navy">Hosts stay in flow</p>
                <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">
                  Schedules, automation, and co-host permissions keep teams confident even when audiences scale into the thousands.
                </p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-magenta/20 bg-brand-magenta/5 p-6">
              <p className="text-sm font-semibold text-brand-navy">Community-first rituals</p>
              <p className="mt-2 text-sm leading-relaxed text-brand-navy/70">
                Pre-show lobbies, spoiler-safe threads, and reaction prompts transform remote screens into shared memories.
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-brand-navy/10 bg-gradient-to-br from-white to-brand-blue/5 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-brand-navy">Core stats</CardTitle>
            <CardDescription className="text-base leading-relaxed text-brand-navy/70">
              A quick snapshot of the rooms, events, and guests who rely on WatchParty each month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-brand-orange/20 bg-brand-orange/10 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-orange">Watch nights hosted</p>
                <p className="mt-2 text-3xl font-bold text-brand-navy">18,400+</p>
              </div>
              <div className="rounded-2xl border border-brand-cyan/20 bg-brand-cyan/10 p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-cyan-dark">Average guest rating</p>
                <p className="mt-2 text-3xl font-bold text-brand-navy">4.9 / 5</p>
              </div>
            </div>
            <div className="rounded-2xl border border-brand-purple/20 bg-brand-purple/10 p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-purple">Countries represented</p>
              <p className="mt-2 text-3xl font-bold text-brand-navy">62</p>
            </div>
            <p className="text-sm leading-relaxed text-brand-navy/70">
              These numbers grow as hosts bring new rituals to life—our roadmap stays focused on keeping those moments cinematic.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Timeline Section */}
      <section className="rounded-3xl border border-brand-navy/10 bg-gradient-to-br from-brand-neutral/50 to-white p-8 shadow-xl sm:p-12">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-blue/25 bg-brand-blue/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-blue shadow-sm">
            Our Journey
          </span>
          <h2 className="mt-4 text-3xl font-bold text-brand-navy sm:text-4xl">Timeline</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {timeline.map((item, index) => (
            <div 
              key={item.year} 
              className={`space-y-3 rounded-2xl border p-6 shadow-md transition-all hover:shadow-lg ${
                index === 0 
                  ? 'border-brand-magenta/20 bg-brand-magenta/5' 
                  : index === 1 
                  ? 'border-brand-blue/20 bg-brand-blue/5' 
                  : 'border-brand-cyan/20 bg-brand-cyan/5'
              }`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.4em] text-brand-navy/60">{item.year}</p>
              <p className="text-lg font-bold text-brand-navy">{item.title}</p>
              <p className="text-sm leading-relaxed text-brand-navy/70">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

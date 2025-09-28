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
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[48px] border border-white/12 bg-[rgba(12,7,34,0.78)] px-8 py-16 shadow-[0_55px_150px_rgba(5,3,24,0.6)] sm:px-12 lg:px-20">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[conic-gradient(from_120deg_at_60%_25%,rgba(255,255,255,0.18),rgba(255,214,170,0.32),rgba(58,34,108,0.45),rgba(255,255,255,0.12))]" />
          <div className="grid-overlay" />
        </div>
        <div className="relative space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
            About WatchParty
          </span>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            We build a cinematic operating system for crews who host from dawn through midnight
          </h1>
          <p className="max-w-3xl text-lg text-white/75">
            WatchParty pairs daylight-ready whites with twilight oklch(42% .18 15) tones. Automations handle ambience, sync, and collaboration so hosts can focus on storytelling.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" asChild>
              <Link href="/pricing">Explore plans</Link>
            </Button>
            <Button variant="secondary" size="lg" asChild>
              <Link href="/guides/watch-night">Read the watch night guide</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.1fr,1fr]">
        <Card className="border-white/12 bg-[rgba(14,8,40,0.78)]">
          <CardHeader>
            <CardTitle className="text-2xl">Day-to-night design principles</CardTitle>
            <CardDescription className="text-base text-white/75">
              Our product philosophy blends physical theatre cues with collaborative tooling. Every module respects the film while guiding conversation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
                <p className="text-sm font-semibold text-white">Ambience without distraction</p>
                <p className="mt-2 text-white/70">
                  Lighting, overlays, and sound cues complement the narrative—they never cover subtitles or the primary frame.
                </p>
              </div>
              <div className="rounded-3xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
                <p className="text-sm font-semibold text-white">Hosts stay in flow</p>
                <p className="mt-2 text-white/70">
                  Schedules, automation, and co-host permissions keep teams confident even when audiences scale into the thousands.
                </p>
              </div>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 text-sm text-white/80">
              <p className="text-sm font-semibold text-white">Community-first rituals</p>
              <p className="mt-2 text-white/70">
                Pre-show lobbies, spoiler-safe threads, and reaction prompts transform remote screens into shared memories.
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/12 bg-[rgba(12,7,34,0.82)]">
          <CardHeader>
            <CardTitle className="text-2xl">Core stats</CardTitle>
            <CardDescription className="text-base text-white/75">
              A quick snapshot of the rooms, events, and guests who rely on WatchParty each month.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 text-white/80">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">Watch nights hosted</p>
                <p className="mt-2 text-3xl font-semibold text-white">18,400+</p>
              </div>
              <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">Average guest rating</p>
                <p className="mt-2 text-3xl font-semibold text-white">4.9 / 5</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Countries represented</p>
              <p className="mt-2 text-3xl font-semibold text-white">62</p>
            </div>
            <p className="text-sm text-white/70">
              These numbers grow as hosts bring new rituals to life—our roadmap stays focused on keeping those moments cinematic.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="relative overflow-hidden rounded-[40px] border border-white/12 bg-[rgba(10,6,30,0.82)] p-8 sm:p-12">
        <div className="absolute inset-0 opacity-70">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_70%)]" />
          <div className="grid-overlay" />
        </div>
        <div className="relative space-y-8">
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">Timeline</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {timeline.map((item) => (
              <div key={item.year} className="space-y-3 rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/80">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">{item.year}</p>
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="text-white/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const highlights = [
  { label: "Upcoming watch nights", value: "3", description: "Brunch classics, esports finals, and midnight premiere" },
  { label: "Guests RSVP’d", value: "482", description: "Across six time zones" },
  { label: "Automation cues", value: "28", description: "Ready to trigger this week" },
]

const timeline = [
  {
    time: "08:30",
    title: "Brunch classics",
    description: "Daybreak ambience, latte chat, co-host Amy",
  },
  {
    time: "19:00",
    title: "Esports finals",
    description: "Neon pulse, hype panel, reaction burst at finale",
  },
  {
    time: "23:45",
    title: "Midnight premiere",
    description: "Indigo glow, director Q&A, encore lounge",
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-[36px] border border-white/12 bg-[rgba(16,9,46,0.75)] p-6 sm:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Today&apos;s focus</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Welcome back, host</h1>
            <p className="text-sm text-white/70">
              Dual ambience automation is standing by. Review your scheduled watch nights and confirm the cues you want to spotlight.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <div className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Ambience</p>
              <p className="mt-2 text-base font-semibold text-white">Auto cycle</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Sync drift</p>
              <p className="mt-2 text-base font-semibold text-white">±18 ms</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {highlights.map((item) => (
          <Card key={item.label} className="border-white/12 bg-[rgba(15,9,44,0.75)]">
            <CardHeader>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">{item.label}</p>
              <CardTitle className="text-3xl text-white">{item.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-white/70">{item.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Card className="border-white/12 bg-[rgba(18,10,52,0.78)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Today&apos;s timeline</CardTitle>
            <CardDescription className="text-sm text-white/70">
              All scheduled watch nights with ambience presets and spotlight notes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {timeline.map((event) => (
              <div key={event.time} className="flex items-start gap-4 rounded-3xl border border-white/12 bg-white/5 p-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/70">
                  {event.time}
                </div>
                <div className="space-y-1 text-sm text-white/80">
                  <p className="text-base font-semibold text-white">{event.title}</p>
                  <p>{event.description}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-white/12 bg-[rgba(15,9,44,0.75)]">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Crew notes</CardTitle>
            <CardDescription className="text-sm text-white/70">
              Shared reminders before you go live.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-white/75">
            <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Lighting</p>
              <p className="mt-2 text-white/80">Check bedroom lamp automation for sunrise screening.</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Co-hosts</p>
              <p className="mt-2 text-white/80">Amy leads Q&A; Ravi handles spoiler-safe chat moderation.</p>
            </div>
            <div className="rounded-3xl border border-white/12 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Sponsors</p>
              <p className="mt-2 text-white/80">Upload new bumper loop before midnight premiere.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

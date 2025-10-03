import { features } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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
    <section id="features" className="space-y-12">
      <div className="mx-auto max-w-3xl space-y-5 text-center text-brand-navy">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-brand-magenta-dark">
          Host toolkit
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Automate ambience, sync, and storytelling across sunrise briefings and midnight finales
        </h2>
        <p className="text-base text-brand-navy/70">
          WatchParty stitches lighting, automations, and co-host collaboration into a single control surface. Build rituals for
          every time of day and watch the room adapt while the film stays centre stage.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <Card className="relative overflow-hidden border-brand-purple/20 bg-white text-brand-navy shadow-[0_32px_90px_rgba(28,28,46,0.12)]">
          <div className="absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(233,64,138,0.14),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(45,156,219,0.16),transparent_60%)]" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">One schedule, two moods</CardTitle>
            <CardDescription className="text-base text-brand-navy/70">
              Craft a film-night run of show that glides from daylight warmth to nightfall glow. Drag-and-drop cues control lights, overlays, polls, and co-host permissions without touching the stream.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 text-sm text-brand-navy/80 lg:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-brand-purple/20 bg-white/80 p-5">
              <p className="text-sm font-semibold text-brand-purple">Scene designer</p>
              <p className="text-brand-navy/70">
                Lay out sunrise lobbies, intermissions, and encore fireworks. WatchParty automatically pairs each segment with matching ambience and chat settings.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-brand-blue/20 bg-white/80 p-5">
              <p className="text-sm font-semibold text-brand-blue">Collaborative hosting</p>
              <p className="text-brand-navy/70">
                Assign co-host lanes, grant spotlight access, and stage takeovers without breaking the flow. Perfect for panel discussions or creator premieres.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-brand-cyan/20 bg-white/80 p-5">
              <p className="text-sm font-semibold text-brand-cyan-dark">Automated rituals</p>
              <p className="text-brand-navy/70">
                Countdown cues, lobby soundtracks, and ambient fades trigger right on time so you can focus on the audience.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-brand-orange/25 bg-white/80 p-5">
              <p className="text-sm font-semibold text-brand-orange-dark">Audience orchestration</p>
              <p className="text-brand-navy/70">
                Keep viewers synced with spoiler-safe chat, timed reactions, and polls that inherit the room lighting.
              </p>
            </div>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {features.map((feature) => (
            <Card key={feature.title} className="border-brand-purple/15 bg-white/85 text-brand-navy shadow-[0_20px_60px_rgba(28,28,46,0.1)]">
              <CardHeader className="space-y-3">
                <CardTitle className="flex items-start justify-between gap-3 text-xl">
                  <span>{feature.title}</span>
                  {feature.highlight ? (
                    <span className="rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-[10px] uppercase tracking-[0.45em] text-brand-cyan-dark">
                      {feature.highlight}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-brand-navy/70">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

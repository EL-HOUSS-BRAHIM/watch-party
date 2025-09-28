import { features } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeatureGrid() {
  return (
    <section id="features" className="space-y-12">
      <div className="mx-auto max-w-3xl text-center space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
          Host toolkit
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          Automate ambience, sync, and storytelling across sunrise briefings and midnight finales
        </h2>
        <p className="text-base text-white/75">
          WatchParty stitches lighting, automations, and co-host collaboration into a single control surface. Build rituals for every time of day and watch the room adapt while the film stays centre stage.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <Card className="relative overflow-hidden border-white/12 bg-[rgba(14,8,40,0.75)]">
          <div className="absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]">
            <div className="h-full w-full bg-[conic-gradient(from_160deg_at_60%_0%,rgba(255,214,170,0.3),rgba(64,40,120,0.45),rgba(255,255,255,0.12))]" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">One schedule, two moods</CardTitle>
            <CardDescription className="text-base text-white/75">
              Craft a film-night run of show that glides from daylight warmth to nightfall glow. Drag-and-drop cues control lights, overlays, polls, and co-host permissions without touching the stream.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 text-sm text-white/80 lg:grid-cols-2">
            <div className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Scene designer</p>
              <p className="text-white/70">
                Lay out sunrise lobbies, intermissions, and encore fireworks. WatchParty automatically pairs each segment with matching ambience and chat settings.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Collaborative hosting</p>
              <p className="text-white/70">
                Assign co-host lanes, grant spotlight access, and stage takeovers without breaking the flow. Perfect for panel discussions or creator premieres.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Automated rituals</p>
              <p className="text-white/70">
                Countdown cues, lobby soundtracks, and ambient fades trigger right on time so you can focus on the audience.
              </p>
            </div>
            <div className="space-y-3 rounded-3xl border border-white/15 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">Audience orchestration</p>
              <p className="text-white/70">
                Keep viewers synced with spoiler-safe chat, timed reactions, and polls that inherit the room lighting.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
          {features.map((feature) => (
            <Card key={feature.title} className="border-white/12 bg-[rgba(12,7,36,0.78)]">
              <CardHeader>
                <CardTitle className="flex items-start justify-between gap-3 text-xl text-white">
                  <span>{feature.title}</span>
                  {feature.highlight ? (
                    <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.45em] text-white/65">
                      {feature.highlight}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-white/75">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

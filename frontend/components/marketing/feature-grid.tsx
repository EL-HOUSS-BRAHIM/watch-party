import { features } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const _phases = [
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
    <section id="features" className="space-y-14">
      <div className="mx-auto max-w-3xl space-y-6 text-center text-brand-navy">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/25 bg-brand-magenta/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-magenta-dark shadow-sm">
          Host toolkit
        </span>
        <h2 className="text-3xl font-bold tracking-tight leading-[1.2] sm:text-4xl lg:text-[2.75rem]">
          Automate ambience, sync, and storytelling across{" "}
          <span className="bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple bg-clip-text text-transparent">
            sunrise briefings
          </span>{" "}
          and{" "}
          <span className="bg-gradient-to-r from-brand-magenta via-brand-orange to-brand-coral bg-clip-text text-transparent">
            midnight finales
          </span>
        </h2>
        <p className="text-base leading-relaxed text-brand-navy/65 sm:text-lg">
          WatchParty stitches lighting, automations, and co-host collaboration into a single control surface. Build rituals for
          every time of day and watch the room adapt while the film stays centre stage.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.3fr,1fr]">
        <Card className="group relative overflow-hidden border-brand-purple/15 bg-gradient-to-br from-white via-white to-brand-purple/5 text-brand-navy shadow-[0_28px_80px_rgba(28,28,46,0.1)] transition-all duration-500 hover:shadow-[0_32px_90px_rgba(28,28,46,0.14)]">
          <div className="absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(233,64,138,0.1),transparent_60%),radial-gradient(circle_at_bottom_right,rgba(45,156,219,0.12),transparent_65%)]" />
          </div>
          <CardHeader className="relative space-y-4">
            <CardTitle className="text-2xl font-bold tracking-tight sm:text-3xl">One schedule, two moods</CardTitle>
            <CardDescription className="text-base leading-relaxed text-brand-navy/65 sm:text-lg">
              Craft a film-night run of show that glides from daylight warmth to nightfall glow. Drag-and-drop cues control lights, overlays, polls, and co-host permissions without touching the stream.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative grid gap-4 text-sm text-brand-navy/80 sm:gap-5 lg:grid-cols-2">
            <div className="space-y-3 rounded-[24px] border border-brand-purple/15 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-brand-purple/25 hover:shadow-md hover:shadow-brand-purple/10">
              <p className="text-sm font-bold text-brand-purple">Scene designer</p>
              <p className="text-sm leading-relaxed text-brand-navy/70">
                Lay out sunrise lobbies, intermissions, and encore fireworks. WatchParty automatically pairs each segment with matching ambience and chat settings.
              </p>
            </div>
            <div className="space-y-3 rounded-[24px] border border-brand-blue/15 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-brand-blue/25 hover:shadow-md hover:shadow-brand-blue/10">
              <p className="text-sm font-bold text-brand-blue">Collaborative hosting</p>
              <p className="text-sm leading-relaxed text-brand-navy/70">
                Assign co-host lanes, grant spotlight access, and stage takeovers without breaking the flow. Perfect for panel discussions or creator premieres.
              </p>
            </div>
            <div className="space-y-3 rounded-[24px] border border-brand-cyan/15 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-brand-cyan/25 hover:shadow-md hover:shadow-brand-cyan/10">
              <p className="text-sm font-bold text-brand-cyan-dark">Automated rituals</p>
              <p className="text-sm leading-relaxed text-brand-navy/70">
                Countdown cues, lobby soundtracks, and ambient fades trigger right on time so you can focus on the audience.
              </p>
            </div>
            <div className="space-y-3 rounded-[24px] border border-brand-orange/15 bg-white/90 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-brand-orange/25 hover:shadow-md hover:shadow-brand-orange/10">
              <p className="text-sm font-bold text-brand-orange-dark">Audience orchestration</p>
              <p className="text-sm leading-relaxed text-brand-navy/70">
                Keep viewers synced with spoiler-safe chat, timed reactions, and polls that inherit the room lighting.
              </p>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="group border-brand-purple/12 bg-white/90 text-brand-navy shadow-[0_18px_50px_rgba(28,28,46,0.08)] backdrop-blur-sm transition-all duration-300 hover:border-brand-purple/20 hover:shadow-[0_22px_60px_rgba(28,28,46,0.12)] hover:-translate-y-0.5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="flex items-start justify-between gap-3 text-lg font-bold tracking-tight sm:text-xl">
                  <span>{feature.title}</span>
                  {feature.highlight ? (
                    <span className="whitespace-nowrap rounded-full border border-brand-cyan/20 bg-brand-cyan/8 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.5em] text-brand-cyan-dark shadow-sm">
                      {feature.highlight}
                    </span>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed text-brand-navy/65 sm:text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

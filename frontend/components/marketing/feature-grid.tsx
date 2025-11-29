import { features } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeatureGrid() {
  return (
    <section id="features" className="space-y-8 sm:space-y-10">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4 px-1">
        <span className="inline-flex items-center rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-magenta-dark">
          Host toolkit
        </span>
        <h2 className="text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl">
          Automate ambience, sync, and storytelling
        </h2>
        <p className="text-sm text-brand-navy/60 sm:text-base">
          WatchParty stitches lighting, automations, and collaboration into one control surface for every time of day.
        </p>
      </div>

      {/* Feature Cards Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.3fr,1fr]">
        {/* Main Feature Card */}
        <Card className="border-brand-purple/10 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-2 sm:space-y-3 p-4 sm:p-6">
            <CardTitle className="text-lg font-bold text-brand-navy sm:text-xl">One schedule, two moods</CardTitle>
            <CardDescription className="text-sm text-brand-navy/60 sm:text-base">
              Craft a film-night run that glides from daylight warmth to nightfall glow. Drag-and-drop cues control lights, overlays, and permissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 p-4 pt-0 sm:p-6 sm:pt-0">
            {[
              { title: "Scene designer", description: "Lay out lobbies, intermissions, and encore fireworks with matching ambience.", color: "purple" },
              { title: "Collaborative hosting", description: "Assign co-host lanes, grant spotlight access, and stage takeovers seamlessly.", color: "blue" },
              { title: "Automated rituals", description: "Countdown cues, lobby soundtracks, and ambient fades trigger on time.", color: "cyan" },
              { title: "Audience orchestration", description: "Keep viewers synced with spoiler-safe chat, timed reactions, and polls.", color: "orange" }
            ].map((item) => (
              <div key={item.title} className={`rounded-lg sm:rounded-xl border border-brand-${item.color}/10 bg-white/60 p-3 sm:p-4 transition-all duration-300 hover:border-brand-${item.color}/20 hover:shadow-sm`}>
                <p className={`text-[13px] sm:text-sm font-semibold text-brand-${item.color === 'cyan' ? 'cyan-dark' : item.color === 'orange' ? 'orange-dark' : item.color} mb-0.5 sm:mb-1`}>{item.title}</p>
                <p className="text-[13px] sm:text-sm text-brand-navy/60">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Secondary Features */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-1">
          {features.map((feature, index) => (
            <Card
              key={feature.title}
              className="border-brand-purple/8 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-brand-purple/15 hover:shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="space-y-1.5 sm:space-y-2 pb-1.5 sm:pb-2 p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between text-sm font-semibold text-brand-navy sm:text-base">
                  <span>{feature.title}</span>
                  {feature.highlight && (
                    <span className="rounded-full border border-brand-cyan/15 bg-brand-cyan/5 px-2 py-0.5 text-[9px] sm:text-[10px] font-medium text-brand-cyan-dark">
                      {feature.highlight}
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
                <CardDescription className="text-[13px] sm:text-sm text-brand-navy/60">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

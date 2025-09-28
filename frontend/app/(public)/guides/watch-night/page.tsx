import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const steps = [
  {
    title: "Set the tone",
    description:
      "Choose a dual ambience preset and add timed cues for opening credits, intermission, and finale. Drop your soundtrack into the lobby playlist.",
  },
  {
    title: "Invite the crew",
    description:
      "Send personalized invites that include time-zone friendly start times and the ambience preset guests will join with.",
  },
  {
    title: "Stage your segments",
    description:
      "Stack polls, reaction prompts, and co-host spotlights on the timeline so you can stay focused on guiding discussion.",
  },
  {
    title: "Go live",
    description:
      "WatchParty keeps playback in sync within ±18 ms while the ambience engine adapts lighting for every guest simultaneously.",
  },
]

const tips = [
  {
    heading: "Dawn warm-up",
    body: "Host a pre-show stretch or coffee chat while the room slowly brightens to daybreak hues.",
  },
  {
    heading: "Intermission ritual",
    body: "Cue polls and highlight co-host commentary as lights rise slightly to keep conversation flowing.",
  },
  {
    heading: "Midnight encore",
    body: "Trigger neon accents during credits and fade into a spoiler-safe chat lounge for post-show debates.",
  },
]

export default function WatchNightGuidePage() {
  return (
    <div className="space-y-16">
      <section className="relative overflow-hidden rounded-[48px] border border-white/12 bg-[rgba(10,6,30,0.82)] px-8 py-16 shadow-[0_60px_150px_rgba(5,3,26,0.6)] sm:px-12 lg:px-20">
        <div className="absolute inset-0 opacity-80">
          <div className="absolute inset-0 bg-[conic-gradient(from_140deg_at_65%_25%,rgba(255,255,255,0.18),rgba(255,214,170,0.32),rgba(58,34,108,0.45),rgba(255,255,255,0.12))]" />
          <div className="grid-overlay" />
        </div>
        <div className="relative space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
              Host guide
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/60">
              Sunrise ↔ Midnight
            </span>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Craft a watch night ritual that glows from sunrise lobby to midnight encore
          </h1>
          <p className="max-w-3xl text-lg text-white/75">
            Follow these steps to turn remote screenings into cinematic events. The ambience engine and stage manager keep the room aligned while you lead the conversation.
          </p>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <Card key={step.title} className="border-white/12 bg-[rgba(16,9,46,0.72)]">
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-[0.4em] text-white/60">Step {index + 1}</CardTitle>
              <p className="text-lg font-semibold text-white">{step.title}</p>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm text-white/70">{step.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="rounded-[38px] border border-white/12 bg-[rgba(15,9,44,0.75)] p-8 sm:p-12">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Signature rituals</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {tips.map((tip) => (
            <div key={tip.heading} className="space-y-3 rounded-3xl border border-white/12 bg-white/5 p-5 text-sm text-white/80">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">{tip.heading}</p>
              <p className="text-white/70">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[38px] border border-white/12 bg-[rgba(15,9,44,0.75)] p-8 sm:p-12">
        <h2 className="text-2xl font-semibold text-white sm:text-3xl">Checklist</h2>
        <ul className="mt-6 space-y-3 text-sm text-white/80">
          <li>• Preview your ambience cues in the stage manager timeline.</li>
          <li>• Assign a co-host to manage chat reactions and polls.</li>
          <li>• Upload custom overlays or sponsor loops if you&apos;re running a premiere.</li>
          <li>• Schedule encore slots so guests can linger in a spoiler-safe lounge.</li>
        </ul>
      </section>
    </div>
  )
}

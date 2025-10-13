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
      <section className="relative overflow-hidden rounded-[48px] border border-brand-purple/20 bg-gradient-to-br from-white via-brand-neutral/30 to-white px-8 py-16 shadow-[0_60px_150px_rgba(74,46,160,0.12)] sm:px-12 lg:px-20">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(233,64,138,0.15),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(45,156,219,0.15),transparent_50%)]" />
        </div>
        <div className="relative space-y-6 text-brand-navy">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/25 bg-brand-cyan/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-cyan-dark shadow-sm">
              Host guide
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/25 bg-brand-magenta/8 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.5em] text-brand-magenta-dark shadow-sm">
              Sunrise ↔ Midnight
            </span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight leading-[1.2] sm:text-5xl lg:text-6xl">
            Craft a watch night ritual that glows from{" "}
            <span className="bg-gradient-to-r from-brand-orange via-brand-magenta to-brand-purple bg-clip-text text-transparent">
              sunrise lobby
            </span>{" "}
            to{" "}
            <span className="bg-gradient-to-r from-brand-blue via-brand-cyan to-brand-purple bg-clip-text text-transparent">
              midnight encore
            </span>
          </h1>
          <p className="max-w-3xl text-lg leading-relaxed text-brand-navy/70">
            Follow these steps to turn remote screenings into cinematic events. The ambience engine and stage manager keep the room aligned while you lead the conversation.
          </p>
        </div>
      </section>

      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step, index) => (
          <div 
            key={step.title} 
            className="group relative flex flex-col overflow-hidden rounded-[32px] border border-brand-purple/12 bg-white/90 p-8 text-brand-navy shadow-[0_20px_70px_rgba(28,28,46,0.1)] backdrop-blur-sm transition-all duration-300 hover:border-brand-purple/20 hover:shadow-[0_24px_80px_rgba(28,28,46,0.14)] hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-brand-navy/50">Step {index + 1}</p>
            <h3 className="mt-4 text-xl font-bold tracking-tight text-brand-navy">{step.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-brand-navy/65">{step.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[40px] border border-brand-blue/20 bg-white p-10 text-brand-navy shadow-[0_40px_120px_rgba(45,156,219,0.14)]">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Signature rituals</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {tips.map((tip, index) => (
            <div 
              key={tip.heading} 
              className={`group space-y-3 rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
                index === 0 ? 'border-brand-magenta/20 bg-brand-magenta/5' : 
                index === 1 ? 'border-brand-blue/20 bg-brand-blue/5' : 
                'border-brand-orange/20 bg-brand-orange/5'
              }`}
            >
              <p className={`text-xs font-semibold uppercase tracking-[0.4em] ${
                index === 0 ? 'text-brand-magenta-dark' : 
                index === 1 ? 'text-brand-blue-dark' : 
                'text-brand-orange-dark'
              }`}>{tip.heading}</p>
              <p className="text-sm leading-relaxed text-brand-navy/70">{tip.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[40px] border border-brand-purple/20 bg-white p-10 text-brand-navy shadow-[0_40px_120px_rgba(74,46,160,0.18)]">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-purple to-brand-magenta text-2xl shadow-lg">
            ✓
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Host checklist</h2>
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-brand-navy/70">
              <li className="flex items-start gap-3">
                <span className="text-brand-purple">•</span>
                <span>Preview your ambience cues in the stage manager timeline.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-purple">•</span>
                <span>Assign a co-host to manage chat reactions and polls.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-purple">•</span>
                <span>Upload custom overlays or sponsor loops if you&apos;re running a premiere.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-brand-purple">•</span>
                <span>Schedule encore slots so guests can linger in a spoiler-safe lounge.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}

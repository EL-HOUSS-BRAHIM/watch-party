import { testimonials } from "@/lib/data/home"

export function TestimonialGrid() {
  return (
    <section id="testimonials" className="space-y-12">
      <div className="mx-auto max-w-3xl space-y-5 text-center text-brand-navy">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-brand-magenta-dark">
          Community glow
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          From festival premieres to campus marathons, crews feel the theatre energy return
        </h2>
        <p className="text-base text-brand-navy/70">
          Hosts swap screen shares for rituals that respect the story. These testimonials cover the sunrise lobby greetings and midnight encore cheers that WatchParty now automates.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <Card className="relative overflow-hidden border-brand-purple/20 bg-white text-brand-navy shadow-[0_36px_110px_rgba(28,28,46,0.14)]">
          <div className="absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(233,64,138,0.14),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(243,156,18,0.16),transparent_60%)]" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">“We stopped troubleshooting and started hosting”</CardTitle>
            <CardDescription className="text-base text-brand-navy/70">
              WatchParty keeps lighting, sync, and chat rituals aligned. Clubs now focus on conversation while the ambience engine glides from daybreak intros to midnight finales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-brand-navy/80">
            <blockquote className="rounded-3xl border border-brand-purple/20 bg-white/85 p-6 text-base leading-relaxed text-brand-navy">
              “Guests swear they can feel the lighting change rooms with them. The lobby music fades, captions stay sharp, and the encore glow arrives right on time.”
            </blockquote>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.42em] text-brand-navy/60">
              <span className="rounded-full border border-brand-magenta/25 bg-brand-magenta/10 px-3 py-1">Festival hosts</span>
              <span className="rounded-full border border-brand-blue/25 bg-brand-blue/10 px-3 py-1">Campus clubs</span>
              <span className="rounded-full border border-brand-orange/25 bg-brand-orange/10 px-3 py-1">Creator premieres</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-brand-blue/20 bg-white/90 p-5 text-sm text-brand-navy/70">
                <p className="text-xs uppercase tracking-[0.32em] text-brand-blue-dark">Saved per event</p>
                <p className="mt-2 text-2xl font-semibold text-brand-navy">3 hrs</p>
                <p className="mt-2">No more last-minute overlays or audio troubleshooting.</p>
              </div>
              <div className="rounded-3xl border border-brand-magenta/20 bg-brand-magenta/10 p-5 text-sm text-brand-navy/75">
                <p className="text-xs uppercase tracking-[0.32em] text-brand-magenta-dark">Audience return</p>
                <p className="mt-2 text-2xl font-semibold text-brand-navy">92%</p>
                <p className="mt-2">Crews come back weekly for the ritual and community.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author} className="border-brand-purple/15 bg-white/85 text-brand-navy shadow-[0_24px_80px_rgba(28,28,46,0.12)]">
              <CardHeader>
                <CardTitle className="text-lg">{testimonial.author}</CardTitle>
                <p className="text-xs uppercase tracking-[0.42em] text-brand-navy/50">{testimonial.role}</p>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-brand-navy/70">{testimonial.message}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

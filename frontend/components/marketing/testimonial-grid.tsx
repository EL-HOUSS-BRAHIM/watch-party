import { testimonials } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TestimonialGrid() {
  return (
    <section id="testimonials" className="space-y-12">
      <div className="mx-auto max-w-3xl text-center space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-1 text-[11px] uppercase tracking-[0.45em] text-white/65">
          Community glow
        </span>
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          From festival premieres to campus marathons, crews feel the theatre energy return
        </h2>
        <p className="text-base text-white/75">
          Hosts swap screen shares for rituals that respect the story. These testimonials cover the sunrise lobby greetings and midnight encore cheers that WatchParty now automates.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <Card className="relative overflow-hidden border-brand-magenta/12 bg-brand-navy/78">
          <div className="absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,black,transparent)]">
            <div className="h-full w-full bg-[conic-gradient(from_180deg_at_70%_0%,rgba(243,156,18,0.28),rgba(74,46,160,0.45),rgba(59,198,232,0.12))]" />
          </div>
          <CardHeader>
            <CardTitle className="text-2xl">“We stopped troubleshooting and started hosting”</CardTitle>
            <CardDescription className="text-base text-white/75">
              WatchParty keeps lighting, sync, and chat rituals aligned. Clubs now focus on conversation while the ambience engine glides from daybreak intros to midnight finales.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-white/80">
            <blockquote className="rounded-3xl border border-white/15 bg-white/5 p-6 text-base leading-relaxed text-white/85">
              “Guests swear they can feel the lighting change rooms with them. The lobby music fades, captions stay sharp, and the encore glow arrives right on time.”
            </blockquote>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.42em] text-white/60">
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Festival hosts</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Campus clubs</span>
              <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1">Creator premieres</span>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-6">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.author} className="border-brand-purple/12 bg-brand-navy-light/78">
              <CardHeader>
                <CardTitle className="text-lg text-white">{testimonial.author}</CardTitle>
                <p className="text-xs uppercase tracking-[0.42em] text-white/60">{testimonial.role}</p>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base text-white/75">{testimonial.message}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

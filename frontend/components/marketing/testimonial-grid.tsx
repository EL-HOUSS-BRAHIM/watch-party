import { testimonials } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TestimonialGrid() {
  return (
    <section id="testimonials" className="space-y-8 sm:space-y-10">
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3 sm:space-y-4 px-1">
        <span className="inline-flex items-center rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-magenta-dark">
          Community glow
        </span>
        <h2 className="text-xl font-bold tracking-tight text-brand-navy sm:text-2xl md:text-3xl">
          Crews feel the theatre energy return
        </h2>
        <p className="text-sm text-brand-navy/60 sm:text-base">
          Hosts swap screen shares for rituals that respect the story. From festival premieres to campus marathons.
        </p>
      </div>

      {/* Testimonials Grid */}
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-[1.1fr,1fr]">
        {/* Featured Testimonial */}
        <Card className="border-brand-purple/10 bg-white/80 backdrop-blur-sm">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg font-bold text-brand-navy sm:text-xl">&ldquo;We stopped troubleshooting and started hosting&rdquo;</CardTitle>
            <CardDescription className="text-sm text-brand-navy/60 sm:text-base">
              WatchParty keeps lighting, sync, and chat rituals aligned. Clubs now focus on conversation while the ambience engine works.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-5 p-4 pt-0 sm:p-6 sm:pt-0">
            <blockquote className="rounded-lg sm:rounded-xl border border-brand-purple/10 bg-brand-purple/3 p-3 sm:p-4 text-[13px] sm:text-sm text-brand-navy/75 italic">
              &ldquo;Guests swear they can feel the lighting change rooms with them. The lobby music fades, captions stay sharp, and the encore glow arrives right on time.&rdquo;
            </blockquote>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 text-[11px] sm:text-xs">
              <span className="rounded-full border border-brand-magenta/15 bg-brand-magenta/5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-brand-magenta-dark">Festival hosts</span>
              <span className="rounded-full border border-brand-blue/15 bg-brand-blue/5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-brand-blue-dark">Campus clubs</span>
              <span className="rounded-full border border-brand-orange/15 bg-brand-orange/5 px-2 py-0.5 sm:px-2.5 sm:py-1 text-brand-orange-dark">Creator premieres</span>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-lg sm:rounded-xl border border-brand-blue/10 bg-white/60 p-3 sm:p-4">
                <p className="text-[10px] uppercase tracking-wider text-brand-blue-dark font-medium">Saved per event</p>
                <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-brand-navy">3 hrs</p>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-brand-navy/55">No more last-minute troubleshooting.</p>
              </div>
              <div className="rounded-lg sm:rounded-xl border border-brand-magenta/10 bg-brand-magenta/3 p-3 sm:p-4">
                <p className="text-[10px] uppercase tracking-wider text-brand-magenta-dark font-medium">Audience return</p>
                <p className="mt-0.5 sm:mt-1 text-xl sm:text-2xl font-bold text-brand-navy">92%</p>
                <p className="mt-0.5 sm:mt-1 text-[11px] sm:text-xs text-brand-navy/55">Crews come back weekly.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Individual Testimonials */}
        <div className="grid gap-3 sm:gap-4">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.author}
              className="border-brand-purple/8 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-brand-purple/15 hover:shadow-sm"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-1.5 sm:pb-2 p-4 sm:p-6">
                <CardTitle className="text-sm font-semibold text-brand-navy sm:text-base">{testimonial.author}</CardTitle>
                <p className="text-[11px] sm:text-xs text-brand-navy/50">{testimonial.role}</p>
              </CardHeader>
              <CardContent className="pt-0 p-4 sm:p-6 sm:pt-0">
                <CardDescription className="text-[13px] sm:text-sm text-brand-navy/65">{testimonial.message}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

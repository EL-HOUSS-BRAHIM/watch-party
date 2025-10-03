import { testimonials } from "@/lib/data/home"

export function TestimonialGrid() {
  return (
    <section id="testimonials" className="space-y-16">
      <div className="mx-auto max-w-3xl space-y-5 text-center text-brand-navy">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.45em] text-brand-magenta-dark">
          Community spotlight
        </span>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Hosts feel the shared theatre energy again—even from different time zones
        </h2>
        <p className="text-base text-brand-navy/70">
          Film clubs, classrooms, and creator communities use WatchParty to orchestrate nights that run smoother than in-person gatherings. Hear how they script unforgettable rituals.
        </p>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1.15fr,1fr]">
        <div className="relative overflow-hidden rounded-[36px] border border-brand-purple/20 bg-white/95 p-10 text-brand-navy shadow-[0_38px_120px_rgba(28,28,46,0.15)]">
          <div className="pointer-events-none absolute inset-0 opacity-80 [mask-image:linear-gradient(to_bottom,white,transparent)]">
            <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(233,64,138,0.18),transparent_55%),radial-gradient(circle_at_bottom_right,rgba(243,156,18,0.18),transparent_60%)]" />
          </div>
          <div className="relative space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-purple">Spotlight story</p>
            <h3 className="text-2xl font-semibold text-brand-navy">“We stopped troubleshooting and started curating experiences”</h3>
            <p className="text-base leading-relaxed text-brand-navy/70">
              “Guests swear they can feel the lighting change rooms with them. The lobby music fades, captions stay sharp, and the encore glow arrives right on time—every single week.”
            </p>
            <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.4em] text-brand-navy/55">
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
            <div key={testimonial.author} className="rounded-3xl border border-brand-purple/15 bg-white/90 p-6 text-brand-navy shadow-[0_28px_100px_rgba(28,28,46,0.14)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-brand-navy">{testimonial.author}</p>
                  <p className="text-xs uppercase tracking-[0.38em] text-brand-navy/55">{testimonial.role}</p>
                </div>
                <span className="rounded-full border border-brand-cyan/25 bg-brand-cyan/10 px-3 py-1 text-[10px] uppercase tracking-[0.4em] text-brand-cyan-dark">Story</span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-brand-navy/70">{testimonial.message}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

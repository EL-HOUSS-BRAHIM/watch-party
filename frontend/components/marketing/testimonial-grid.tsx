import { testimonials } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function TestimonialGrid() {
  return (
    <section id="testimonials" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Trusted for premiers, tournaments, and co-streams</h2>
        <p className="max-w-2xl text-sm text-zinc-400">
          Hear how creators keep their communities engaged with WatchParty&apos;s resilient streaming and elegant presentation.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {testimonials.map((item) => (
          <Card key={item.author}>
            <CardHeader>
              <CardTitle className="text-base font-semibold text-zinc-100">{item.author}</CardTitle>
              <span className="text-xs text-zinc-500">{item.role}</span>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm leading-relaxed text-zinc-300">
                “{item.message}”
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

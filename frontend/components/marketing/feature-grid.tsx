import { features } from "@/lib/data/home"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FeatureGrid() {
  return (
    <section id="features" className="space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">Designed for cinematic clarity</h2>
        <p className="max-w-2xl text-sm text-zinc-400">
          Every element is intentionally monochrome, letting bold typography and subtle motion guide guests through your party
          without distraction.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
              <CardTitle>{feature.title}</CardTitle>
              {feature.highlight ? <span className="text-xs uppercase tracking-[0.2em] text-zinc-400">{feature.highlight}</span> : null}
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}

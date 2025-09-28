import { metrics } from "@/lib/data/home"

export function MetricStrip() {
  return (
    <section id="metrics" className="rounded-3xl border border-zinc-800/70 bg-zinc-900/40 p-6">
      <div className="grid gap-6 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="space-y-2">
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{metric.label}</p>
            <p className="text-3xl font-semibold text-zinc-50">{metric.value}</p>
            <p className="text-sm text-zinc-400">{metric.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

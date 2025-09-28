import { Button } from "@/components/ui/button"

export function CallToAction() {
  return (
    <section className="rounded-3xl border border-zinc-800 bg-zinc-900/50 p-10 text-center">
      <h2 className="text-3xl font-semibold">Ready to host your next watch night?</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-zinc-400">
        Spin up a room, invite your community, and enjoy a premium cinematic experience in minutes.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
        <Button size="lg">Start for free</Button>
        <Button variant="ghost" size="lg">
          View pricing
        </Button>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-24 sm:py-32">
      <div className="container px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ready to start watching together?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            Join thousands of football fans who are already using Watch Party to share every game, goal, and
            celebration.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" className="btn-primary glow-primary" asChild>
              <Link href="/join">Start Your First Party</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/features">Learn more</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

const navigation = [
  { href: "#features", label: "Features" },
  { href: "#metrics", label: "Metrics" },
  { href: "#testimonials", label: "Voices" },
]

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          WatchParty
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 md:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-zinc-50">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            Sign in
          </Button>
          <Button size="sm">Launch demo</Button>
        </div>
      </div>
    </header>
  )
}

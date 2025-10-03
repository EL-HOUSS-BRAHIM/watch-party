import Link from "next/link"

const _navigation = [
  { href: "/#features", label: "Features" },
  { href: "/#experience", label: "Experience" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/join", label: "Join" }
]

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-navy/10 bg-brand-neutral/80 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-neutral/70">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 text-brand-navy lg:px-8">
        <Link href="/" className="flex items-center gap-3 group" aria-label="WatchParty home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-base font-bold text-white shadow-lg shadow-brand-magenta/20 group-hover:shadow-brand-magenta/40 transition-all group-hover:-translate-y-0.5">
            WP
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">WatchParty</span>
            <span className="text-lg font-bold bg-gradient-to-r from-brand-navy to-brand-purple bg-clip-text text-transparent">Watch Together</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/join"
            className="text-sm font-semibold text-brand-navy/80 transition-colors hover:text-brand-navy underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
          <Link
            href="/auth/login"
            className="rounded-xl bg-gradient-to-r from-brand-magenta to-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-magenta/30 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark hover:shadow-brand-magenta/40"
          >
            Start hosting
          </Link>
        </div>
      </div>
    </header>
  )
}

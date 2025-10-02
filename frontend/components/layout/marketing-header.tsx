import Link from "next/link"

/**
 * MarketingHeader - Header for landing page and public marketing pages
 * Features gradient logo, "Get Started" CTA, minimalist design
 */
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy-dark/80 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-navy-dark/60">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-3 group" aria-label="WatchParty home">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-magenta to-brand-purple text-base font-bold text-white shadow-lg shadow-brand-magenta/25 group-hover:shadow-brand-magenta/40 transition-shadow">
            WP
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-magenta-light">WatchParty</span>
            <span className="text-lg font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Watch Together</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link 
            href="/join" 
            className="text-white/90 hover:text-white text-sm font-semibold transition-colors hover:underline underline-offset-4"
          >
            Join Party
          </Link>
          <Link 
            href="/auth/login" 
            className="bg-gradient-to-r from-brand-magenta to-brand-orange hover:from-brand-magenta-dark hover:to-brand-orange-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-brand-magenta/25 hover:shadow-brand-magenta/40 hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  )
}

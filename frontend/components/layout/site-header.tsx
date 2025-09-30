import Link from "next/link"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-[rgba(5,4,18,0.9)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="WatchParty home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            WP
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-medium uppercase tracking-[0.35em] text-white/60">WatchParty</span>
            <span className="text-base font-semibold text-white">Watch together</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link 
            href="/join" 
            className="text-white/80 hover:text-white text-sm font-medium transition-colors"
          >
            Join Party
          </Link>
          <Link 
            href="/auth/login" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}

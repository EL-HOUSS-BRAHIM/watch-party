import Link from "next/link"

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-white/10 bg-[rgba(6,5,20,0.9)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 text-sm text-white/70 sm:px-8 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-base font-semibold text-white">WatchParty</p>
            <p className="mt-1 max-w-md text-sm text-white/65">
              A lightweight watch room for friends to stream movies, episodes, and live matches together.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.35em] text-white/55">
            <Link href="/dashboard/rooms" className="rounded-full border border-white/10 px-3 py-1 transition-colors duration-200 hover:border-white/30 hover:text-white">
              Join
            </Link>
            <Link href="/dashboard" className="rounded-full border border-white/10 px-3 py-1 transition-colors duration-200 hover:border-white/30 hover:text-white">
              Log in
            </Link>
          </div>
        </div>
        <div className="text-xs text-white/50">© {year} WatchParty. Built for crews that never miss a scene.</div>
      </div>
    </footer>
  )
}

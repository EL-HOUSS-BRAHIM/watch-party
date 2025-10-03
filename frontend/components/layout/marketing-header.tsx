import Image from "next/image"
import Link from "next/link"

const navigation = [
  { href: "/#features", label: "Features" },
  { href: "/#experience", label: "Experience" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/join", label: "Join" }
]

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-navy/10 bg-brand-neutral/75 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-neutral/65">
      <div className="mx-auto flex w-full max-w-[min(100%,1440px)] items-center justify-between gap-6 px-5 py-4 text-brand-navy lg:px-8 xl:px-12">
        <Link href="/" className="group flex items-center gap-3" aria-label="WatchParty home">
          <span className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-[0_12px_30px_rgba(74,46,160,0.2)] transition-transform duration-300 group-hover:-translate-y-0.5">
            <Image
              src="/watchparty-logo.svg"
              alt="WatchParty logo"
              width={44}
              height={44}
              priority
              className="h-full w-full object-contain"
            />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-bold uppercase tracking-[0.4em] text-brand-purple">WatchParty</span>
            <span className="text-lg font-semibold text-brand-navy">Host moments worth replaying</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-semibold text-brand-navy/70 lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1 transition-colors hover:bg-white/70 hover:text-brand-navy"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="hidden rounded-full border border-brand-blue/25 px-4 py-2 text-sm font-semibold text-brand-blue-dark transition-colors hover:border-brand-blue/50 hover:text-brand-blue lg:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="rounded-full bg-gradient-to-r from-brand-magenta to-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-magenta/30 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark hover:shadow-brand-magenta/45"
          >
            Start hosting
          </Link>
        </div>
      </div>
    </header>
  )
}

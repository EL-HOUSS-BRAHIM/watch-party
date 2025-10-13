import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

const _navigation = [
  { href: "/#features", label: "Features" },
  { href: "/#experience", label: "Experience" },
  { href: "/#testimonials", label: "Stories" },
  { href: "/join", label: "Join" }
]

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-brand-navy/10 bg-brand-neutral/80 backdrop-blur-xl supports-[backdrop-filter]:bg-brand-neutral/70">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 text-brand-navy sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group sm:gap-3" aria-label="WatchParty home">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden transition-all group-hover:-translate-y-0.5 sm:h-12 sm:w-12">
            <Image 
              src="/watchparty-logo.webp" 
              alt="WatchParty logo" 
              width={48} 
              height={48} 
              className="h-full w-full object-contain" 
              priority 
            />
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-purple">WatchParty</span>
            <span className="text-base font-bold bg-gradient-to-r from-brand-navy to-brand-purple bg-clip-text text-transparent sm:text-lg">Watch Together</span>
          </span>
        </Link>
        {/* Desktop navigation (hidden on small screens) */}
        <nav className="hidden md:flex items-center gap-6">
          {_navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-navy/75 hover:text-brand-navy transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sign in - larger tap target and explicit aria label for accessibility */}
          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login" aria-label="Sign in to WatchParty" className="px-3 py-2">
              Sign in
            </Link>
          </Button>

          {/* Primary CTA - use Button for consistent focus/hover behavior */}
          <Button asChild size="default" className="shadow-lg">
            <Link href="/auth/register" aria-label="Start hosting on WatchParty" className="flex items-center">
              <span className="hidden sm:inline">Start hosting</span>
              <span className="sm:hidden">Host</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}

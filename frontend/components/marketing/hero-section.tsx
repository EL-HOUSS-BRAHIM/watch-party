"use client"

import Link from "next/link"
import { ArrowRight, Award, Eye, Link, type LucideIcon } from "lucide-react"
import type { MarketingStat } from "@/app/(marketing)/data/home-content"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"




interface HeroSectionProps {}
  isAuthenticated: boolean
  stats: MarketingStat[]
}

interface CtaConfig {}
  href: string
  label: string
  icon: LucideIcon
}

export function HeroSection({ isAuthenticated, stats }: HeroSectionProps) {}
  const primaryCta = useMemo<CtaConfig>(() => {}
    if (isAuthenticated) {
      return {
        href: "/dashboard",
        label: "Go to Dashboard",
        icon: Play,
      }
    }

    return {
      href: "/register",
      label: "Start Watching Free",
      icon: Users,
    }
  }, [isAuthenticated])

  const secondaryCta = useMemo<CtaConfig | null>(() => {}
    if (isAuthenticated) {
      return null
    }

    return {
      href: "/login",
      label: "Sign In",
      icon: Eye,
    }
  }, [isAuthenticated])

  const PrimaryIcon = primaryCta.icon
  return (
    <section className="relative pt-20 pb-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center space-y-8 relative z-10">
          <div className="flex justify-center">
            <Badge className="bg-white/10 text-white border-white/20 px-6 py-2 text-sm font-medium backdrop-blur-sm">
              <Award className="w-4 h-4 mr-2" />
              Next-Gen Streaming Platform
            </Badge>
          </div>

          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Watch Together,{" "}
              <span className="text-white/80">Experience More</span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
              The ultimate cinematic platform for synchronized video watching. Stream movies, shows, and content together with
              friends in stunning quality and perfect sync.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href={primaryCta.href}>
              <Button
                className={cn(
                  "group rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-300",
                  "bg-white text-black hover:bg-white/90",
                )}
              >
                <PrimaryIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                {primaryCta.label}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>

            {secondaryCta && (
              <Link href={secondaryCta.href}>
                <Button
                  variant="outline"
                  className={cn(
                    "rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-300 backdrop-blur-sm",
                    "border-white/30 bg-transparent text-white hover:bg-white/10",
                  )}
                >
                  <Eye className="w-5 h-5 mr-2" />
                  {secondaryCta.label}
                </Button>
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
            {stats.map((stat) => {}
              const StatIcon = stat.icon
              return (
                <div key={stat.label} className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <div className="flex justify-center mb-2">
                    <StatIcon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import { memo } from "react"
import { Film, Play, Users, CheckCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CtaBannerProps {
  isAuthenticated: boolean
}

function CtaBannerComponent({ isAuthenticated }: CtaBannerProps) {
  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-12 border border-white/20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-lg bg-white/10 flex items-center justify-center">
                <Film className="w-10 h-10 text-white" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Ready for Your First
                <span className="text-white/80 block">Cinema Experience?</span>
              </h2>

              <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                Join thousands of users already enjoying synchronized viewing experiences. Create your first watch party in
                seconds and discover the future of social entertainment.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <Link href="/dashboard/parties/create">
                  <Button
                    className={cn(
                      "group rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-300",
                      "bg-white text-black hover:bg-white/90",
                    )}
                  >
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Create Watch Party
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button
                      className={cn(
                        "group rounded-lg px-8 py-4 text-lg font-semibold transition-all duration-300",
                        "bg-white text-black hover:bg-white/90",
                      )}
                    >
                      <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Get Started Free
                    </Button>
                  </Link>
                  <Link href="/about">
                    <Button
                      variant="outline"
                      className={cn(
                        "rounded-lg px-8 py-4 text-lg transition-all duration-300 backdrop-blur-sm",
                        "border-white/30 bg-transparent text-white hover:bg-white/10",
                      )}
                    >
                      Learn More
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
              {[
                "Free to start",
                "No credit card",
                "Instant setup",
                "24/7 support",
              ].map((highlight) => (
                <div key={highlight} className="flex items-center space-x-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export const CtaBanner = memo(CtaBannerComponent)

import type React from "react"
import Link from "next/link"
import { Play, Sparkles, Users, Video } from "lucide-react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-cinema-deep relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-red/10 via-transparent to-neon-blue/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-red/5 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-blue/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-neon-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            radial-gradient(circle at 25px 25px, rgba(255,255,255,0.1) 2px, transparent 0),
            radial-gradient(circle at 75px 75px, rgba(255,255,255,0.05) 2px, transparent 0)
          `,
          backgroundSize: '100px 100px'
        }} />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="hidden lg:block space-y-8">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-red to-neon-purple flex items-center justify-center glow-red">
                  <Play className="w-8 h-8 text-white fill-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-neon-green rounded-full animate-pulse flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold heading-lg">WatchParty</h1>
                <p className="text-neon-gold font-semibold">CINEMA EXPERIENCE</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">
                Stream Together, Experience More
              </h2>
              <div className="space-y-4">
                <FeatureItem
                  icon={Users}
                  title="Social Watching"
                  description="Watch movies and shows with friends in real-time sync"
                />
                <FeatureItem
                  icon={Video}
                  title="HD Streaming"
                  description="Crystal clear quality with adaptive streaming technology"
                />
                <FeatureItem
                  icon={Sparkles}
                  title="Interactive Features"
                  description="Live chat, reactions, and shared controls"
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <StatItem number="50K+" label="Active Users" />
              <StatItem number="10K+" label="Watch Parties" />
              <StatItem number="500+" label="Movies & Shows" />
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <Link href="/" className="inline-flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-neon-red to-neon-purple rounded-xl flex items-center justify-center glow-red">
                  <Play className="w-6 h-6 text-white fill-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-white">WatchParty</span>
                  <div className="text-sm text-neon-gold">CINEMA</div>
                </div>
              </Link>
            </div>

            {/* Auth Card */}
            <div className="glass-card p-8 rounded-2xl border border-white/20 shadow-cinema-xl">
              {children}
            </div>

            {/* Footer */}
            <div className="text-center mt-6 space-y-2">
              <p className="text-sm text-gray-400">
                By continuing, you agree to our{" "}
                <Link href="/terms" className="text-neon-blue hover:text-neon-purple transition-colors">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-neon-blue hover:text-neon-purple transition-colors">
                  Privacy Policy
                </Link>
              </p>
              <p className="text-xs text-gray-500">
                © 2025 WatchParty. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType
  title: string
  description: string 
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="p-2 rounded-lg bg-white/5 border border-white/10">
        <Icon className="w-5 h-5 text-neon-blue" />
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
    </div>
  )
}

function StatItem({ 
  number, 
  label 
}: { 
  number: string
  label: string 
}) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-neon-red">{number}</div>
      <div className="text-sm text-gray-400">{label}</div>
    </div>
  )
}

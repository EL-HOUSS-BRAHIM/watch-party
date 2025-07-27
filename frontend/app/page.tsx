import Link from "next/link"
import { Play, Users, Zap, Shield, Smartphone, Globe } from "lucide-react"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import {
  WatchPartyCard,
  WatchPartyCardContent,
  WatchPartyCardDescription,
  WatchPartyCardHeader,
  WatchPartyCardTitle,
} from "@/components/ui/watch-party-card"

export default function HomePage() {
  const features = [
    {
      icon: Play,
      title: "Synchronized Viewing",
      description: "Watch videos together in perfect sync with friends around the world.",
    },
    {
      icon: Users,
      title: "Social Experience",
      description: "Chat, react, and share moments with your watch party companions.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency streaming for seamless group watching experiences.",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data is secure with end-to-end encryption and privacy controls.",
    },
    {
      icon: Smartphone,
      title: "Multi-Platform",
      description: "Watch on any device - desktop, mobile, tablet, or smart TV.",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Connect with friends worldwide with our global CDN infrastructure.",
    },
  ]

  return (
    <div className="min-h-screen bg-watch-party-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-watch-party-gradient opacity-10"></div>
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-watch-party-text-primary mb-6 animate-slide-in-cinema">
              Watch Together,{" "}
              <span className="bg-watch-party-gradient bg-clip-text text-transparent animate-gradient-shift">
                Anywhere
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-watch-party-text-secondary mb-8 animate-slide-in-cinema">
              The next-generation platform for synchronized video watching with friends. Experience movies, shows, and
              content together in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-in-cinema">
              <Link href="/dashboard">
                <WatchPartyButton variant="gradient" size="lg" className="text-lg px-8 py-4">
                  <Play className="h-5 w-5" />
                  Start Watching
                </WatchPartyButton>
              </Link>
              <Link href="/about">
                <WatchPartyButton variant="outline" size="lg" className="text-lg px-8 py-4">
                  Learn More
                </WatchPartyButton>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-watch-party-surface">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-watch-party-text-primary mb-4">
              Why Choose WatchParty?
            </h2>
            <p className="text-xl text-watch-party-text-secondary max-w-2xl mx-auto">
              Built for the future of social entertainment with cutting-edge technology and user-first design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <WatchPartyCard key={index} className="hover:shadow-watch-party-glow transition-all duration-300">
                  <WatchPartyCardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-watch-party-gradient">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <WatchPartyCardTitle className="text-xl">{feature.title}</WatchPartyCardTitle>
                    </div>
                  </WatchPartyCardHeader>
                  <WatchPartyCardContent>
                    <WatchPartyCardDescription className="text-base">{feature.description}</WatchPartyCardDescription>
                  </WatchPartyCardContent>
                </WatchPartyCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-watch-party-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-watch-party-gradient opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-watch-party-text-primary mb-6">
            Ready to Start Your Watch Party?
          </h2>
          <p className="text-xl text-watch-party-text-secondary mb-8 max-w-2xl mx-auto">
            Join thousands of users already enjoying synchronized viewing experiences. Create your first watch party in
            seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <WatchPartyButton variant="glow" size="lg" className="text-lg px-8 py-4">
                <Users className="h-5 w-5" />
                Get Started Free
              </WatchPartyButton>
            </Link>
            <Link href="/discover">
              <WatchPartyButton variant="secondary" size="lg" className="text-lg px-8 py-4">
                Explore Parties
              </WatchPartyButton>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-watch-party-surface border-t border-watch-party-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-watch-party-gradient">
                <Play className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-watch-party-text-primary">WatchParty</span>
            </div>
            <div className="flex space-x-6 text-watch-party-text-secondary">
              <Link href="/privacy" className="hover:text-watch-party-primary transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-watch-party-primary transition-colors">
                Terms
              </Link>
              <Link href="/help" className="hover:text-watch-party-primary transition-colors">
                Help
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-watch-party-border text-center text-watch-party-text-secondary">
            <p>&copy; 2025 WatchParty. All rights reserved. Built for the future of social entertainment.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

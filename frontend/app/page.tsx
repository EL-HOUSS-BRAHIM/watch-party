import Link from "next/link"
import { 
  Play, 
  Users, 
  Zap, 
  Shield, 
  Smartphone, 
  Globe,
  ArrowRight,
  Star,
  Eye,
  MessageCircle,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HomePage() {
  const features = [
    {
      icon: Play,
      title: "Perfect Sync",
      description: "Watch videos together in perfect sync with sub-second precision.",
      gradient: "from-neon-red to-neon-purple"
    },
    {
      icon: Users,
      title: "Social Cinema",
      description: "Chat, react, and share moments with friends in real-time.",
      gradient: "from-neon-blue to-neon-purple"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency streaming powered by global CDN infrastructure.",
      gradient: "from-neon-gold to-neon-red"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "End-to-end encryption and advanced privacy controls.",
      gradient: "from-neon-green to-neon-blue"
    },
    {
      icon: Smartphone,
      title: "Any Device",
      description: "Seamless experience across desktop, mobile, tablet, and TV.",
      gradient: "from-neon-purple to-neon-gold"
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with movie lovers worldwide in any language.",
      gradient: "from-neon-blue to-neon-green"
    },
  ]

  const stats = [
    { number: "50K+", label: "Active Users", icon: Users },
    { number: "25K+", label: "Watch Parties", icon: Eye },
    { number: "1M+", label: "Hours Watched", icon: Play },
    { number: "99.9%", label: "Uptime", icon: Zap }
  ]

  return (
    <div className="min-h-screen bg-cinema-deep relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:ml-64">
        <div className="container-cinema">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Badge */}
            <Badge className="mb-6 bg-neon-red/20 text-neon-red border-neon-red/30 px-4 py-2 text-sm font-medium animate-fade-in">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Gen Streaming Platform
            </Badge>

            {/* Main Heading */}
            <h1 className="heading-xl mb-6 animate-slide-up">
              Watch Together,{" "}
              <span className="bg-neon-gradient bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_100%]">
                Experience More
              </span>
            </h1>

            {/* Subtitle */}
            <p className="body-large mb-8 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
              The ultimate cinematic platform for synchronized video watching. Stream movies, shows, and content 
              together with friends in stunning quality and perfect sync.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up" style={{ animationDelay: "0.4s" }}>
              <Link href="/dashboard">
                <Button className="btn-primary text-lg px-8 py-4 group">
                  <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                  Start Watching Now
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/discover">
                <Button className="btn-secondary text-lg px-8 py-4">
                  <Users className="w-5 h-5 mr-2" />
                  Browse Parties
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-5 h-5 text-neon-blue" />
                  </div>
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:ml-64 relative">
        <div className="container-cinema">
          <div className="text-center mb-16">
            <h2 className="heading-lg mb-4">
              Cinema-Grade Features
            </h2>
            <p className="body-large max-w-2xl mx-auto">
              Built with cutting-edge technology for the ultimate social viewing experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card 
                  key={index} 
                  className="glass-card border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} glow-red group-hover:scale-110 transition-transform`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-400 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="py-20 lg:ml-64 relative">
        <div className="container-cinema">
          <div className="glass-card p-12 rounded-3xl border border-white/20 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-red to-neon-purple flex items-center justify-center glow-purple">
                  <Star className="w-8 h-8 text-white" />
                </div>
              </div>
              
              <h2 className="heading-lg mb-6">
                Ready for Your First 
                <span className="text-neon-red"> Cinema Experience</span>?
              </h2>
              
              <p className="body-large mb-8 max-w-2xl mx-auto">
                Join thousands of users already enjoying synchronized viewing experiences. 
                Create your first watch party in seconds and discover the future of social entertainment.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button className="btn-primary text-lg px-8 py-4 group">
                    <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Get Started Free
                    <Sparkles className="w-4 h-4 ml-2 animate-pulse" />
                  </Button>
                </Link>
                <Link href="/about">
                  <Button className="btn-ghost text-lg px-8 py-4">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="lg:ml-64 border-t border-white/10 py-12 bg-cinema-dark/50 backdrop-blur-xl">
        <div className="container-cinema">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-red to-neon-purple flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-white">WatchParty</span>
                <div className="text-xs text-neon-gold">CINEMA</div>
              </div>
            </div>
            
            <div className="flex space-x-8 text-gray-400">
              <Link href="/privacy" className="hover:text-neon-blue transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-neon-blue transition-colors">
                Terms
              </Link>
              <Link href="/help" className="hover:text-neon-blue transition-colors">
                Support
              </Link>
              <Link href="/about" className="hover:text-neon-blue transition-colors">
                About
              </Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-white/10 text-center">
            <p className="text-gray-500 text-sm">
              © 2025 WatchParty Cinema. All rights reserved. Built for the future of social entertainment.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

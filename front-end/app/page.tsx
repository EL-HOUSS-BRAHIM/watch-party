"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  Award,
  CheckCircle,
  Film,
} from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()

  const features = [
    {
      icon: Play,
      title: "Perfect Sync",
      description: "Watch videos together in perfect sync with sub-second precision across all devices.",
      stats: "99.9% sync accuracy",
    },
    {
      icon: Users,
      title: "Social Cinema",
      description: "Chat, react, and share moments with friends in real-time during your watch parties.",
      stats: "50K+ active users",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Ultra-low latency streaming powered by global CDN infrastructure for seamless viewing.",
      stats: "<100ms latency",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "End-to-end encryption and advanced privacy controls keep your data secure.",
      stats: "Bank-level security",
    },
    {
      icon: Smartphone,
      title: "Any Device",
      description: "Seamless experience across desktop, mobile, tablet, and smart TV platforms.",
      stats: "All platforms",
    },
    {
      icon: Globe,
      title: "Global Community",
      description: "Connect with movie lovers worldwide with support for 25+ languages.",
      stats: "150+ countries",
    },
  ]

  const stats = [
    { number: "125K+", label: "Active Users", icon: Users },
    { number: "2.5M+", label: "Watch Parties", icon: Eye },
    { number: "15M+", label: "Hours Watched", icon: Play },
    { number: "99.9%", label: "Uptime", icon: Zap },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      username: "@sarahc_films",
      content: "WatchParty has revolutionized how I watch movies with friends. The sync is perfect and the chat features are amazing!",
      rating: 5,
      verified: true,
    },
    {
      name: "Mike Rodriguez",
      username: "@mikeflix",
      content: "Finally, a platform that actually works! No more counting down '3, 2, 1, play' - everything just syncs perfectly.",
      rating: 5,
      verified: false,
    },
    {
      name: "Emma Thompson",
      username: "@emmawatches",
      content: "The mobile experience is incredible. I can host watch parties from anywhere and the quality never drops.",
      rating: 5,
      verified: true,
    },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-2 border-white/20 rounded-full flex items-center justify-center animate-pulse">
              <Play className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">Loading WatchParty...</div>
            <div className="text-white/60 text-sm">Preparing your cinema experience</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center space-y-8 relative z-10">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-white/10 text-white border-white/20 px-6 py-2 text-sm font-medium backdrop-blur-sm">
                <Award className="w-4 h-4 mr-2" />
                Next-Gen Streaming Platform
              </Badge>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                Watch Together,{" "}
                <span className="text-white/80">
                  Experience More
                </span>
              </h1>

              <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed">
                The ultimate cinematic platform for synchronized video watching. Stream movies, shows, and content
                together with friends in stunning quality and perfect sync.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link href="/dashboard">
                  <Button className="bg-white text-black hover:bg-white/90 text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 group">
                    <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button className="bg-white text-black hover:bg-white/90 text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 group">
                      <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Start Watching Free
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                  <Link href="/discover">
                    <Button
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-lg font-semibold backdrop-blur-sm transition-all duration-300 bg-transparent"
                    >
                      <Eye className="w-5 h-5 mr-2" />
                      Browse Parties
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                >
                  <div className="flex justify-center mb-2">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 mb-6">
              <Award className="w-4 h-4 mr-2" />
              Cinema-Grade Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Built for the Future of
              <span className="text-white/80 block">
                Social Entertainment
              </span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Experience cutting-edge technology designed for seamless social viewing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm rounded-lg p-8 border border-white/10 hover:border-white/20 transition-all duration-500 hover:scale-105"
                >
                  <div className="flex items-start space-x-4">
                    <div className="p-4 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-300">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-white/90 transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-white/60 leading-relaxed mb-3">{feature.description}</p>
                      <div className="text-sm text-white/80 font-medium">{feature.stats}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <Badge className="bg-white/10 text-white border-white/20 px-4 py-2 mb-6">
              <Star className="w-4 h-4 mr-2" />
              Loved by Users
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">What Our Community Says</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Join thousands of satisfied users who've transformed their viewing experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center space-x-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-white fill-white" />
                  ))}
                </div>
                <p className="text-white/80 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-white/20 text-white">{testimonial.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{testimonial.name}</span>
                      {testimonial.verified && <CheckCircle className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-white/60 text-sm">{testimonial.username}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
                  <span className="text-white/80 block">
                    Cinema Experience?
                  </span>
                </h2>

                <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                  Join thousands of users already enjoying synchronized viewing experiences. Create your first watch
                  party in seconds and discover the future of social entertainment.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                {user ? (
                  <Link href="/dashboard/parties/create">
                    <Button className="bg-white text-black hover:bg-white/90 text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 group">
                      <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Create Watch Party
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/register">
                      <Button className="bg-white text-black hover:bg-white/90 text-lg px-8 py-4 rounded-lg font-semibold transition-all duration-300 group">
                        <Users className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Get Started Free
                      </Button>
                    </Link>
                    <Link href="/about">
                      <Button
                        variant="outline"
                        className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-lg backdrop-blur-sm transition-all duration-300 bg-transparent"
                      >
                        Learn More
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              {/* Feature highlights */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8">
                <div className="flex items-center space-x-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm">Free to start</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm">No credit card</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm">Instant setup</span>
                </div>
                <div className="flex items-center space-x-2 text-white/80">
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span className="text-sm">24/7 support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

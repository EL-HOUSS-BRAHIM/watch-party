"use client"

import { useState, useEffect } from "react"
import type { Metadata } from "next"
import {
  Heart,
  Users,
  Play,
  Github,
  Twitter,
  Mail,
  Zap,
  Globe,
  Shield,
  MessageCircle,
  Video,
  Sparkles,
  Calendar,
  Target,
  Rocket,
  Building,
  Loader2,
  TrendingUp
} from "lucide-react"
import { WatchPartyCard, WatchPartyCardContent } from "@/components/ui/watch-party-card"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface AboutPageData {
  platform_stats: {
    total_users: number
    active_parties: number
    videos_watched: number
    countries: number
    hours_streamed: number
    messages_sent: number
  }
  team_members: Array<{
    id: string
    name: string
    role: string
    bio: string
    avatar_url?: string
    social_links: {
      twitter?: string
      github?: string
      email?: string
    }
  }>
  milestones: Array<{
    id: string
    date: string
    title: string
    description: string
    icon: string
  }>
  features: Array<{
    id: string
    title: string
    description: string
    icon: string
    is_highlighted: boolean
  }>
  company_info: {
    founded_date: string
    mission: string
    vision: string
    values: Array<{
      title: string
      description: string
      icon: string
    }>
  }
  contact_info: {
    general_email: string
    support_email: string
    business_email: string
    social_links: {
      twitter?: string
      github?: string
      linkedin?: string
    }
  }
  testimonials: Array<{
    id: string
    user_name: string
    user_avatar?: string
    content: string
    rating: number
    date: string
  }>
}

export default function AboutPage() {
  const [aboutData, setAboutData] = useState<AboutPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadAboutData()
  }, [])

  const loadAboutData = async () => {
    try {
      const response = await fetch("/api/about/", {
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAboutData(data)
      } else {
        // Fallback to basic static data if API fails
        setAboutData(getStaticFallbackData())
      }
    } catch (error) {
      console.error("Failed to load about data:", error)
      // Fallback to basic static data
      setAboutData(getStaticFallbackData())
      toast({
        title: "Info",
        description: "Loading basic information. Some content may not be up to date.",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStaticFallbackData = (): AboutPageData => ({
    platform_stats: {
      total_users: 150000,
      active_parties: 2500,
      videos_watched: 2000000,
      countries: 50,
      hours_streamed: 500000,
      messages_sent: 10000000,
    },
    team_members: [
      {
        id: "1",
        name: "Alex Chen",
        role: "Founder & CEO",
        bio: "Passionate about creating meaningful connections through technology. Previously led product at streaming platforms.",
        social_links: {
          twitter: "alexchen",
          github: "alexchen",
          email: "alex@watchparty.com",
        },
      },
      {
        id: "2",
        name: "Sarah Johnson",
        role: "CTO",
        bio: "Full-stack engineer with 10+ years experience building scalable web applications and real-time systems.",
        social_links: {
          twitter: "sarahcodes",
          github: "sjohnson",
          email: "sarah@watchparty.com",
        },
      },
      {
        id: "3",
        name: "Marcus Williams",
        role: "Head of Design",
        bio: "UX designer focused on creating intuitive and delightful user experiences for community platforms.",
        social_links: {
          twitter: "marcusdesign",
          github: "mwilliams",
          email: "marcus@watchparty.com",
        },
      },
      {
        id: "4",
        name: "Elena Rodriguez",
        role: "Community Manager",
        bio: "Building and nurturing the WatchParty community. Passionate about bringing people together online.",
        social_links: {
          twitter: "elena_community",
          email: "elena@watchparty.com",
        },
      },
    ],
    milestones: [
      {
        id: "1",
        date: "2023-01-01",
        title: "WatchParty Founded",
        description: "Started with the vision of connecting people through shared entertainment",
        icon: "🚀",
      },
      {
        id: "2",
        date: "2023-06-01",
        title: "Beta Launch",
        description: "Released closed beta to 1,000 users for initial testing and feedback",
        icon: "🧪",
      },
      {
        id: "3",
        date: "2023-09-01",
        title: "Public Launch",
        description: "Opened WatchParty to the public with core features and integrations",
        icon: "🌍",
      },
      {
        id: "4",
        date: "2023-12-01",
        title: "10K Users",
        description: "Reached 10,000 registered users and 50,000 watch parties hosted",
        icon: "🎉",
      },
      {
        id: "5",
        date: "2024-03-01",
        title: "Mobile App",
        description: "Launched iOS and Android apps for watch parties on the go",
        icon: "📱",
      },
      {
        id: "6",
        date: "2024-06-01",
        title: "100K Users",
        description: "Celebrated 100,000 users and launched premium features",
        icon: "💯",
      },
    ],
    features: [
      {
        id: "1",
        title: "Synchronized Viewing",
        description: "Watch videos together in perfect sync with friends anywhere in the world",
        icon: "▶️",
        is_highlighted: true,
      },
      {
        id: "2",
        title: "Real-time Chat",
        description: "Share reactions and discuss content with built-in chat during watch parties",
        icon: "💬",
        is_highlighted: true,
      },
      {
        id: "3",
        title: "Community Building",
        description: "Create lasting connections with people who share your interests",
        icon: "👥",
        is_highlighted: false,
      },
      {
        id: "4",
        title: "Multiple Platforms",
        description: "Support for YouTube, Netflix, Disney+, and many other streaming services",
        icon: "📺",
        is_highlighted: false,
      },
      {
        id: "5",
        title: "Customization",
        description: "Personalize your experience with themes, emotes, and custom profiles",
        icon: "✨",
        is_highlighted: false,
      },
      {
        id: "6",
        title: "Safe Environment",
        description: "Moderated spaces with community guidelines to ensure positive experiences",
        icon: "🛡️",
        is_highlighted: true,
      },
    ],
    company_info: {
      founded_date: "2023-01-01",
      mission: "To create meaningful connections between people through shared entertainment experiences, making distance irrelevant when it comes to spending time with the people you care about.",
      vision: "A world where everyone can enjoy entertainment together, regardless of physical distance.",
      values: [
        {
          title: "Safety First",
          description: "We prioritize creating safe, welcoming spaces where everyone can enjoy entertainment together without harassment or toxicity.",
          icon: "🛡️",
        },
        {
          title: "Inclusivity",
          description: "We believe everyone deserves to belong and be represented in our community, regardless of background, identity, or location.",
          icon: "🌍",
        },
        {
          title: "Innovation",
          description: "We continuously push the boundaries of what's possible in shared entertainment, always looking for new ways to connect people.",
          icon: "⚡",
        },
        {
          title: "Community",
          description: "Our users are at the heart of everything we do. We listen, learn, and build features that truly serve our community's needs.",
          icon: "❤️",
        },
      ],
    },
    contact_info: {
      general_email: "hello@watchparty.com",
      support_email: "support@watchparty.com",
      business_email: "business@watchparty.com",
      social_links: {
        twitter: "@watchparty",
        github: "github.com/watchparty",
        linkedin: "linkedin.com/company/watchparty",
      },
    },
    testimonials: [
      {
        id: "1",
        user_name: "Jessica M.",
        content: "WatchParty has been amazing for staying connected with my friends during the pandemic. We have weekly movie nights now!",
        rating: 5,
        date: "2024-01-15",
      },
      {
        id: "2",
        user_name: "David L.",
        content: "The sync quality is incredible. It really feels like we're all watching together in the same room.",
        rating: 5,
        date: "2024-02-03",
      },
      {
        id: "3",
        user_name: "Maria S.",
        content: "Love the community features. I've made so many new friends through public watch parties!",
        rating: 4,
        date: "2024-01-28",
      },
    ],
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-watch-party-bg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-watch-party-primary" />
          <p className="text-watch-party-text-secondary">Loading about information...</p>
        </div>
      </div>
    )
  }

  if (!aboutData) {
    return (
      <div className="min-h-screen bg-watch-party-bg flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-watch-party-text-primary mb-4">Unable to Load Information</h2>
          <p className="text-watch-party-text-secondary mb-4">We're having trouble loading the about page.</p>
          <WatchPartyButton onClick={() => window.location.reload()}>
            Try Again
          </WatchPartyButton>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-watch-party-bg">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-slide-in-cinema">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-watch-party-gradient text-white px-6 py-3 rounded-full text-lg font-semibold shadow-watch-party-glow">
                <Heart className="h-6 w-6" />
                Made with love for community
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-6 bg-watch-party-gradient bg-clip-text text-transparent animate-gradient-shift">
              About WatchParty
            </h1>

            <p className="text-xl text-watch-party-text-secondary max-w-3xl mx-auto mb-8">
              {aboutData.company_info.mission}
            </p>

            <div className="flex justify-center gap-4 mb-12">
              <WatchPartyButton variant="gradient" size="lg">
                <Play className="h-5 w-5" />
                Start Watching Together
              </WatchPartyButton>
              <WatchPartyButton variant="outline" size="lg">
                <Users className="h-5 w-5" />
                Join Our Community
              </WatchPartyButton>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <WatchPartyCard className="text-center hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-4">
                  <div className="flex justify-center mb-2 text-watch-party-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-watch-party-text-primary mb-1">
                    {aboutData.platform_stats.total_users.toLocaleString()}+
                  </div>
                  <div className="text-xs text-watch-party-text-secondary">Active Users</div>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="text-center hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-4">
                  <div className="flex justify-center mb-2 text-watch-party-primary">
                    <Video className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-watch-party-text-primary mb-1">
                    {aboutData.platform_stats.active_parties.toLocaleString()}
                  </div>
                  <div className="text-xs text-watch-party-text-secondary">Active Parties</div>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="text-center hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-4">
                  <div className="flex justify-center mb-2 text-watch-party-primary">
                    <Play className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-watch-party-text-primary mb-1">
                    {(aboutData.platform_stats.videos_watched / 1000000).toFixed(1)}M
                  </div>
                  <div className="text-xs text-watch-party-text-secondary">Videos Watched</div>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="text-center hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-4">
                  <div className="flex justify-center mb-2 text-watch-party-primary">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-watch-party-text-primary mb-1">
                    {aboutData.platform_stats.countries}+
                  </div>
                  <div className="text-xs text-watch-party-text-secondary">Countries</div>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="text-center hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-4">
                  <div className="flex justify-center mb-2 text-watch-party-primary">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-watch-party-text-primary mb-1">
                    {(aboutData.platform_stats.hours_streamed / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-watch-party-text-secondary">Hours Streamed</div>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="text-center hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-4">
                  <div className="flex justify-center mb-2 text-watch-party-primary">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div className="text-lg font-bold text-watch-party-text-primary mb-1">
                    {(aboutData.platform_stats.messages_sent / 1000000).toFixed(0)}M
                  </div>
                  <div className="text-xs text-watch-party-text-secondary">Messages Sent</div>
                </WatchPartyCardContent>
              </WatchPartyCard>
            </div>
          </div>

          {/* Mission Section */}
          <section className="mb-16">
            <WatchPartyCard className="bg-gradient-to-r from-watch-party-primary/10 to-watch-party-secondary/10 hover:shadow-watch-party-glow transition-all duration-300">
              <WatchPartyCardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-watch-party-text-primary">
                    <Target className="h-8 w-8 text-watch-party-primary" />
                    Our Mission
                  </h2>
                  <p className="text-lg text-watch-party-text-secondary max-w-2xl mx-auto">
                    {aboutData.company_info.mission}
                  </p>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {aboutData.company_info.values.map((value, index) => (
                    <div key={index} className="text-center">
                      <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
                        <WatchPartyCardContent className="p-6">
                          <div className="text-4xl mb-4">{value.icon}</div>
                          <h3 className="text-lg font-semibold mb-2 text-watch-party-text-primary">{value.title}</h3>
                          <p className="text-sm text-watch-party-text-secondary">{value.description}</p>
                        </WatchPartyCardContent>
                      </WatchPartyCard>
                    </div>
                  ))}
                </div>
              </WatchPartyCardContent>
            </WatchPartyCard>
          </section>

          {/* Features Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-watch-party-text-primary">What Makes Us Special</h2>
              <p className="text-lg text-watch-party-text-secondary max-w-2xl mx-auto">
                We've built WatchParty with features that enhance connection and make watching together as seamless as
                being in the same room.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {aboutData.features.map((feature) => (
                <WatchPartyCard 
                  key={feature.id} 
                  className={`hover:shadow-watch-party-glow transition-all duration-300 ${
                    feature.is_highlighted ? 'border-watch-party-primary border-2' : ''
                  }`}
                >
                  <WatchPartyCardContent className="p-6">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-watch-party-text-primary">{feature.title}</h3>
                      {feature.is_highlighted && (
                        <Badge variant="secondary" className="text-xs">Popular</Badge>
                      )}
                    </div>
                    <p className="text-watch-party-text-secondary">{feature.description}</p>
                  </WatchPartyCardContent>
                </WatchPartyCard>
              ))}
            </div>
          </section>

          {/* Team Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-watch-party-text-primary">
                <Users className="h-8 w-8" />
                Meet Our Team
              </h2>
              <p className="text-lg text-watch-party-text-secondary max-w-2xl mx-auto">
                We're a passionate team of builders, designers, and community enthusiasts dedicated to creating the best
                shared viewing experience possible.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {aboutData.team_members.map((member) => (
                <WatchPartyCard key={member.id} className="hover:shadow-watch-party-glow transition-all duration-300">
                  <WatchPartyCardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-watch-party-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-watch-party-glow">
                      {member.avatar_url ? (
                        <img 
                          src={member.avatar_url} 
                          alt={member.name} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        member.name.split(' ').map(n => n[0]).join('')
                      )}
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-watch-party-text-primary">{member.name}</h3>
                    <p className="text-watch-party-primary font-medium mb-3">{member.role}</p>
                    <p className="text-watch-party-text-secondary text-sm mb-4">{member.bio}</p>

                    <div className="flex justify-center gap-2">
                      {member.social_links.twitter && (
                        <WatchPartyButton size="sm" variant="ghost">
                          <Twitter className="h-4 w-4" />
                        </WatchPartyButton>
                      )}
                      {member.social_links.github && (
                        <WatchPartyButton size="sm" variant="ghost">
                          <Github className="h-4 w-4" />
                        </WatchPartyButton>
                      )}
                      {member.social_links.email && (
                        <WatchPartyButton size="sm" variant="ghost">
                          <Mail className="h-4 w-4" />
                        </WatchPartyButton>
                      )}
                    </div>
                  </WatchPartyCardContent>
                </WatchPartyCard>
              ))}
            </div>
          </section>

          {/* Timeline Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2 text-watch-party-text-primary">
                <Calendar className="h-8 w-8" />
                Our Journey
              </h2>
              <p className="text-lg text-watch-party-text-secondary max-w-2xl mx-auto">
                From a simple idea to a thriving community - here's how WatchParty has evolved.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-watch-party-gradient h-full rounded-full"></div>

              <div className="space-y-8">
                {aboutData.milestones.map((milestone, index) => (
                  <div key={milestone.id} className={`flex items-center ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                      <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
                        <WatchPartyCardContent className="p-6">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{milestone.icon}</span>
                            <Badge className="bg-watch-party-primary/20 text-watch-party-primary border-watch-party-primary">
                              {new Date(milestone.date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                              })}
                            </Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2 text-watch-party-text-primary">
                            {milestone.title}
                          </h3>
                          <p className="text-watch-party-text-secondary">{milestone.description}</p>
                        </WatchPartyCardContent>
                      </WatchPartyCard>
                    </div>

                    <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-watch-party-primary rounded-full border-4 border-watch-party-bg shadow-watch-party-glow"></div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          {aboutData.testimonials.length > 0 && (
            <section className="mb-16">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-watch-party-text-primary">What Our Users Say</h2>
                <p className="text-lg text-watch-party-text-secondary max-w-2xl mx-auto">
                  Real feedback from our amazing community members.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {aboutData.testimonials.map((testimonial) => (
                  <WatchPartyCard key={testimonial.id} className="hover:shadow-watch-party-glow transition-all duration-300">
                    <WatchPartyCardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-watch-party-gradient rounded-full flex items-center justify-center text-white font-medium">
                          {testimonial.user_avatar ? (
                            <img 
                              src={testimonial.user_avatar} 
                              alt={testimonial.user_name} 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            testimonial.user_name[0]
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-watch-party-text-primary">{testimonial.user_name}</p>
                          <div className="flex gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-watch-party-text-secondary mb-3">"{testimonial.content}"</p>
                      <p className="text-xs text-watch-party-muted">
                        {new Date(testimonial.date).toLocaleDateString()}
                      </p>
                    </WatchPartyCardContent>
                  </WatchPartyCard>
                ))}
              </div>
            </section>
          )}

          {/* Contact Section */}
          <section className="mb-16">
            <WatchPartyCard className="bg-watch-party-gradient text-white hover:shadow-watch-party-glow transition-all duration-300">
              <WatchPartyCardContent className="p-8 md:p-12 text-center">
                <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
                <p className="text-lg mb-8 text-white/80">
                  Have questions, feedback, or just want to say hello? We'd love to hear from you!
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-colors">
                    <Mail className="h-8 w-8 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Email Us</h3>
                    <p className="text-white/80">{aboutData.contact_info.general_email}</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-colors">
                    <MessageCircle className="h-8 w-8 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Support</h3>
                    <p className="text-white/80">{aboutData.contact_info.support_email}</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-colors">
                    <Building className="h-8 w-8 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Business</h3>
                    <p className="text-white/80">{aboutData.contact_info.business_email}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <WatchPartyButton size="lg" variant="secondary">
                    <MessageCircle className="h-5 w-5" />
                    Contact Support
                  </WatchPartyButton>
                  <WatchPartyButton
                    size="lg"
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-watch-party-primary"
                  >
                    <Building className="h-5 w-5" />
                    Business Inquiries
                  </WatchPartyButton>
                </div>
              </WatchPartyCardContent>
            </WatchPartyCard>
          </section>

          {/* Final CTA */}
          <section className="text-center">
            <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
              <WatchPartyCardContent className="p-8 md:p-12">
                <h2 className="text-3xl font-bold mb-4 text-watch-party-text-primary">
                  Ready to Start Watching Together?
                </h2>
                <p className="text-lg text-watch-party-text-secondary mb-8 max-w-2xl mx-auto">
                  Join {aboutData.platform_stats.total_users.toLocaleString()}+ users who are already enjoying movies, shows, and videos together on WatchParty.
                  Your next great shared experience is just one click away.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <WatchPartyButton variant="gradient" size="lg">
                    <Rocket className="h-5 w-5" />
                    Get Started Free
                  </WatchPartyButton>
                  <WatchPartyButton variant="outline" size="lg">
                    <Play className="h-5 w-5" />
                    Watch Demo
                  </WatchPartyButton>
                </div>
              </WatchPartyCardContent>
            </WatchPartyCard>
          </section>
        </div>
      </div>
    </div>
  )
}

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
} from "lucide-react"
import { WatchPartyCard, WatchPartyCardContent } from "@/components/ui/watch-party-card"
import { WatchPartyButton } from "@/components/ui/watch-party-button"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "About WatchParty | Bringing People Together Through Shared Entertainment",
  description:
    "Learn about WatchParty - the platform that connects friends and communities through synchronized video watching experiences.",
}

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Passionate about creating meaningful connections through technology. Previously led product at streaming platforms.",
      initials: "AC",
      social: {
        twitter: "alexchen",
        github: "alexchen",
        email: "alex@watchparty.com",
      },
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      bio: "Full-stack engineer with 10+ years experience building scalable web applications and real-time systems.",
      initials: "SJ",
      social: {
        twitter: "sarahcodes",
        github: "sjohnson",
        email: "sarah@watchparty.com",
      },
    },
    {
      name: "Marcus Williams",
      role: "Head of Design",
      bio: "UX designer focused on creating intuitive and delightful user experiences for community platforms.",
      initials: "MW",
      social: {
        twitter: "marcusdesign",
        github: "mwilliams",
        email: "marcus@watchparty.com",
      },
    },
    {
      name: "Elena Rodriguez",
      role: "Community Manager",
      bio: "Building and nurturing the WatchParty community. Passionate about bringing people together online.",
      initials: "ER",
      social: {
        twitter: "elena_community",
        email: "elena@watchparty.com",
      },
    },
  ]

  const milestones = [
    {
      date: "2023-01",
      title: "WatchParty Founded",
      description: "Started with the vision of connecting people through shared entertainment",
    },
    {
      date: "2023-06",
      title: "Beta Launch",
      description: "Released closed beta to 1,000 users for initial testing and feedback",
    },
    {
      date: "2023-09",
      title: "Public Launch",
      description: "Opened WatchParty to the public with core features and integrations",
    },
    {
      date: "2023-12",
      title: "10K Users",
      description: "Reached 10,000 registered users and 50,000 watch parties hosted",
    },
    {
      date: "2024-03",
      title: "Mobile App",
      description: "Launched iOS and Android apps for watch parties on the go",
    },
    {
      date: "2024-06",
      title: "100K Users",
      description: "Celebrated 100,000 users and launched premium features",
    },
  ]

  const features = [
    {
      icon: <Play className="h-8 w-8" />,
      title: "Synchronized Viewing",
      description: "Watch videos together in perfect sync with friends anywhere in the world",
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Real-time Chat",
      description: "Share reactions and discuss content with built-in chat during watch parties",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Building",
      description: "Create lasting connections with people who share your interests",
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Multiple Platforms",
      description: "Support for YouTube, Netflix, Disney+, and many other streaming services",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Customization",
      description: "Personalize your experience with themes, emotes, and custom profiles",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safe Environment",
      description: "Moderated spaces with community guidelines to ensure positive experiences",
    },
  ]

  const stats = [
    { label: "Active Users", value: "150K+", icon: <Users className="h-6 w-6" /> },
    { label: "Watch Parties", value: "500K+", icon: <Play className="h-6 w-6" /> },
    { label: "Hours Watched", value: "2M+", icon: <Video className="h-6 w-6" /> },
    { label: "Countries", value: "50+", icon: <Globe className="h-6 w-6" /> },
  ]

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
              WatchParty is more than just a platform - it's a community that brings people together through the magic
              of shared entertainment. Whether you're watching with old friends or making new ones, we believe that the
              best experiences are the ones we share.
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

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <WatchPartyCard
                  key={index}
                  className="text-center hover:shadow-watch-party-glow transition-all duration-300"
                >
                  <WatchPartyCardContent className="p-6">
                    <div className="flex justify-center mb-2 text-watch-party-primary">{stat.icon}</div>
                    <div className="text-2xl font-bold text-watch-party-text-primary mb-1">{stat.value}</div>
                    <div className="text-sm text-watch-party-text-secondary">{stat.label}</div>
                  </WatchPartyCardContent>
                </WatchPartyCard>
              ))}
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
                    To create meaningful connections between people through shared entertainment experiences, making
                    distance irrelevant when it comes to spending time with the people you care about.
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
                      <WatchPartyCardContent className="p-6">
                        <Heart className="h-12 w-12 text-watch-party-error mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-watch-party-text-primary">Connection</h3>
                        <p className="text-watch-party-text-secondary">
                          Bringing people together regardless of physical distance
                        </p>
                      </WatchPartyCardContent>
                    </WatchPartyCard>
                  </div>

                  <div className="text-center">
                    <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
                      <WatchPartyCardContent className="p-6">
                        <Sparkles className="h-12 w-12 text-watch-party-warning mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-watch-party-text-primary">Experience</h3>
                        <p className="text-watch-party-text-secondary">
                          Creating magical moments through shared entertainment
                        </p>
                      </WatchPartyCardContent>
                    </WatchPartyCard>
                  </div>

                  <div className="text-center">
                    <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
                      <WatchPartyCardContent className="p-6">
                        <Users className="h-12 w-12 text-watch-party-secondary mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2 text-watch-party-text-primary">Community</h3>
                        <p className="text-watch-party-text-secondary">
                          Building inclusive spaces where everyone belongs
                        </p>
                      </WatchPartyCardContent>
                    </WatchPartyCard>
                  </div>
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
              {features.map((feature, index) => (
                <WatchPartyCard key={index} className="hover:shadow-watch-party-glow transition-all duration-300">
                  <WatchPartyCardContent className="p-6">
                    <div className="text-watch-party-primary mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-semibold mb-2 text-watch-party-text-primary">{feature.title}</h3>
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
              {teamMembers.map((member, index) => (
                <WatchPartyCard key={index} className="hover:shadow-watch-party-glow transition-all duration-300">
                  <WatchPartyCardContent className="p-6 text-center">
                    <div className="w-24 h-24 bg-watch-party-gradient rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-watch-party-glow">
                      {member.initials}
                    </div>
                    <h3 className="text-lg font-semibold mb-1 text-watch-party-text-primary">{member.name}</h3>
                    <p className="text-watch-party-primary font-medium mb-3">{member.role}</p>
                    <p className="text-watch-party-text-secondary text-sm mb-4">{member.bio}</p>

                    <div className="flex justify-center gap-2">
                      {member.social.twitter && (
                        <WatchPartyButton size="sm" variant="ghost">
                          <Twitter className="h-4 w-4" />
                        </WatchPartyButton>
                      )}
                      {member.social.github && (
                        <WatchPartyButton size="sm" variant="ghost">
                          <Github className="h-4 w-4" />
                        </WatchPartyButton>
                      )}
                      <WatchPartyButton size="sm" variant="ghost">
                        <Mail className="h-4 w-4" />
                      </WatchPartyButton>
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
                {milestones.map((milestone, index) => (
                  <div key={index} className={`flex items-center ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
                    <div className={`w-5/12 ${index % 2 === 0 ? "text-right pr-8" : "text-left pl-8"}`}>
                      <WatchPartyCard className="hover:shadow-watch-party-glow transition-all duration-300">
                        <WatchPartyCardContent className="p-6">
                          <Badge className="mb-2 bg-watch-party-primary/20 text-watch-party-primary border-watch-party-primary">
                            {new Date(milestone.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                            })}
                          </Badge>
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

          {/* Values Section */}
          <section className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-watch-party-text-primary">Our Values</h2>
              <p className="text-lg text-watch-party-text-secondary max-w-2xl mx-auto">
                These principles guide everything we do at WatchParty.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <WatchPartyCard className="border-l-4 border-l-watch-party-primary hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Shield className="h-6 w-6 text-watch-party-primary" />
                    <h3 className="text-xl font-semibold text-watch-party-text-primary">Safety First</h3>
                  </div>
                  <p className="text-watch-party-text-secondary">
                    We prioritize creating safe, welcoming spaces where everyone can enjoy entertainment together
                    without harassment or toxicity.
                  </p>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="border-l-4 border-l-watch-party-secondary hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Globe className="h-6 w-6 text-watch-party-secondary" />
                    <h3 className="text-xl font-semibold text-watch-party-text-primary">Inclusivity</h3>
                  </div>
                  <p className="text-watch-party-text-secondary">
                    We believe everyone deserves to belong and be represented in our community, regardless of
                    background, identity, or location.
                  </p>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="border-l-4 border-l-watch-party-success hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-6 w-6 text-watch-party-success" />
                    <h3 className="text-xl font-semibold text-watch-party-text-primary">Innovation</h3>
                  </div>
                  <p className="text-watch-party-text-secondary">
                    We continuously push the boundaries of what's possible in shared entertainment, always looking for
                    new ways to connect people.
                  </p>
                </WatchPartyCardContent>
              </WatchPartyCard>

              <WatchPartyCard className="border-l-4 border-l-watch-party-warning hover:shadow-watch-party-glow transition-all duration-300">
                <WatchPartyCardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="h-6 w-6 text-watch-party-warning" />
                    <h3 className="text-xl font-semibold text-watch-party-text-primary">Community</h3>
                  </div>
                  <p className="text-watch-party-text-secondary">
                    Our users are at the heart of everything we do. We listen, learn, and build features that truly
                    serve our community's needs.
                  </p>
                </WatchPartyCardContent>
              </WatchPartyCard>
            </div>
          </section>

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
                    <p className="text-white/80">hello@watchparty.com</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-colors">
                    <Twitter className="h-8 w-8 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Follow Us</h3>
                    <p className="text-white/80">@watchparty</p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm hover:bg-white/20 transition-colors">
                    <Github className="h-8 w-8 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Open Source</h3>
                    <p className="text-white/80">github.com/watchparty</p>
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
                  Join thousands of users who are already enjoying movies, shows, and videos together on WatchParty.
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

import { Metadata } from 'next'
import Link from 'next/link'
import { 
  Heart, 
  Users, 
  Play, 
  Star, 
  Github, 
  Twitter, 
  Mail, 
  MapPin,
  Coffee,
  Zap,
  Globe,
  Award,
  Code,
  Palette,
  Shield,
  Headphones,
  MessageCircle,
  Video,
  Sparkles,
  Calendar,
  Target,
  Rocket,
  Building
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'About WatchParty | Bringing People Together Through Shared Entertainment',
  description: 'Learn about WatchParty - the platform that connects friends and communities through synchronized video watching experiences.',
}

export default function AboutPage() {
  const teamMembers = [
    {
      name: "Alex Chen",
      role: "Founder & CEO",
      bio: "Passionate about creating meaningful connections through technology. Previously led product at streaming platforms.",
      image: "/api/placeholder/150/150",
      social: {
        twitter: "alexchen",
        github: "alexchen",
        email: "alex@watchparty.com"
      }
    },
    {
      name: "Sarah Johnson",
      role: "CTO",
      bio: "Full-stack engineer with 10+ years experience building scalable web applications and real-time systems.",
      image: "/api/placeholder/150/150",
      social: {
        twitter: "sarahcodes",
        github: "sjohnson",
        email: "sarah@watchparty.com"
      }
    },
    {
      name: "Marcus Williams",
      role: "Head of Design",
      bio: "UX designer focused on creating intuitive and delightful user experiences for community platforms.",
      image: "/api/placeholder/150/150",
      social: {
        twitter: "marcusdesign",
        github: "mwilliams",
        email: "marcus@watchparty.com"
      }
    },
    {
      name: "Elena Rodriguez",
      role: "Community Manager",
      bio: "Building and nurturing the WatchParty community. Passionate about bringing people together online.",
      image: "/api/placeholder/150/150",
      social: {
        twitter: "elena_community",
        email: "elena@watchparty.com"
      }
    }
  ]

  const milestones = [
    {
      date: "2023-01",
      title: "WatchParty Founded",
      description: "Started with the vision of connecting people through shared entertainment"
    },
    {
      date: "2023-06",
      title: "Beta Launch",
      description: "Released closed beta to 1,000 users for initial testing and feedback"
    },
    {
      date: "2023-09",
      title: "Public Launch",
      description: "Opened WatchParty to the public with core features and integrations"
    },
    {
      date: "2023-12",
      title: "10K Users",
      description: "Reached 10,000 registered users and 50,000 watch parties hosted"
    },
    {
      date: "2024-03",
      title: "Mobile App",
      description: "Launched iOS and Android apps for watch parties on the go"
    },
    {
      date: "2024-06",
      title: "100K Users",
      description: "Celebrated 100,000 users and launched premium features"
    }
  ]

  const features = [
    {
      icon: <Play className="h-8 w-8" />,
      title: "Synchronized Viewing",
      description: "Watch videos together in perfect sync with friends anywhere in the world"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Real-time Chat",
      description: "Share reactions and discuss content with built-in chat during watch parties"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Building",
      description: "Create lasting connections with people who share your interests"
    },
    {
      icon: <Video className="h-8 w-8" />,
      title: "Multiple Platforms",
      description: "Support for YouTube, Netflix, Disney+, and many other streaming services"
    },
    {
      icon: <Palette className="h-8 w-8" />,
      title: "Customization",
      description: "Personalize your experience with themes, emotes, and custom profiles"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Safe Environment",
      description: "Moderated spaces with community guidelines to ensure positive experiences"
    }
  ]

  const stats = [
    { label: "Active Users", value: "150K+", icon: <Users className="h-6 w-6" /> },
    { label: "Watch Parties", value: "500K+", icon: <Play className="h-6 w-6" /> },
    { label: "Hours Watched", value: "2M+", icon: <Video className="h-6 w-6" /> },
    { label: "Countries", value: "50+", icon: <Globe className="h-6 w-6" /> }
  ]

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold">
              <Heart className="h-6 w-6" />
              Made with love for community
            </div>
          </div>
          
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            About WatchParty
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            WatchParty is more than just a platform - it's a community that brings people together 
            through the magic of shared entertainment. Whether you're watching with old friends 
            or making new ones, we believe that the best experiences are the ones we share.
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Play className="h-5 w-5 mr-2" />
              Start Watching Together
            </Button>
            <Button size="lg" variant="outline">
              <Users className="h-5 w-5 mr-2" />
              Join Our Community
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-2 text-purple-600">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-8 md:p-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
                <Target className="h-8 w-8 text-purple-600" />
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                To create meaningful connections between people through shared entertainment experiences, 
                making distance irrelevant when it comes to spending time with the people you care about.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Connection</h3>
                  <p className="text-gray-600">
                    Bringing people together regardless of physical distance
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Sparkles className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Experience</h3>
                  <p className="text-gray-600">
                    Creating magical moments through shared entertainment
                  </p>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <Users className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Community</h3>
                  <p className="text-gray-600">
                    Building inclusive spaces where everyone belongs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">What Makes Us Special</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've built WatchParty with features that enhance connection and make 
              watching together as seamless as being in the same room.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="text-purple-600 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Users className="h-8 w-8" />
              Meet Our Team
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're a passionate team of builders, designers, and community enthusiasts 
              dedicated to creating the best shared viewing experience possible.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-purple-600 font-medium mb-3">{member.role}</p>
                  <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                  
                  <div className="flex justify-center gap-2">
                    {member.social.twitter && (
                      <Button size="sm" variant="outline" className="p-2">
                        <Twitter className="h-4 w-4" />
                      </Button>
                    )}
                    {member.social.github && (
                      <Button size="sm" variant="outline" className="p-2">
                        <Github className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="p-2">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center gap-2">
              <Calendar className="h-8 w-8" />
              Our Journey
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From a simple idea to a thriving community - here's how WatchParty has evolved.
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-gradient-to-b from-purple-600 to-blue-600 h-full"></div>
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-5/12 ${index % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <Badge className="mb-2 bg-purple-100 text-purple-800">
                          {new Date(milestone.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long' 
                          })}
                        </Badge>
                        <h3 className="text-lg font-semibold mb-2">{milestone.title}</h3>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-purple-600 rounded-full border-4 border-white shadow-lg"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at WatchParty.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-purple-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="h-6 w-6 text-purple-600" />
                  <h3 className="text-xl font-semibold">Safety First</h3>
                </div>
                <p className="text-gray-600">
                  We prioritize creating safe, welcoming spaces where everyone can enjoy 
                  entertainment together without harassment or toxicity.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-blue-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="h-6 w-6 text-blue-600" />
                  <h3 className="text-xl font-semibold">Inclusivity</h3>
                </div>
                <p className="text-gray-600">
                  We believe everyone deserves to belong and be represented in our community, 
                  regardless of background, identity, or location.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                  <h3 className="text-xl font-semibold">Innovation</h3>
                </div>
                <p className="text-gray-600">
                  We continuously push the boundaries of what's possible in shared entertainment, 
                  always looking for new ways to connect people.
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-600">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-orange-600" />
                  <h3 className="text-xl font-semibold">Community</h3>
                </div>
                <p className="text-gray-600">
                  Our users are at the heart of everything we do. We listen, learn, 
                  and build features that truly serve our community's needs.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg mb-8 text-purple-100">
              Have questions, feedback, or just want to say hello? We'd love to hear from you!
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <Mail className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-purple-100">hello@watchparty.com</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <Twitter className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Follow Us</h3>
                <p className="text-purple-100">@watchparty</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-6 backdrop-blur-sm">
                <Github className="h-8 w-8 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Open Source</h3>
                <p className="text-purple-100">github.com/watchparty</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary">
                <MessageCircle className="h-5 w-5 mr-2" />
                Contact Support
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-purple-600">
                <Building className="h-5 w-5 mr-2" />
                Business Inquiries
              </Button>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="text-center">
          <div className="bg-gray-50 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Watching Together?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already enjoying movies, shows, and videos 
              together on WatchParty. Your next great shared experience is just one click away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                <Rocket className="h-5 w-5 mr-2" />
                Get Started Free
              </Button>
              <Button size="lg" variant="outline">
                <Play className="h-5 w-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Users, MessageCircle, Zap, Shield, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background-secondary to-background">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold font-display">Watch Party</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="shadow-glow">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-6">
            🎉 Now supporting 10,000+ concurrent users
          </Badge>

          <h1 className="text-4xl md:text-6xl font-bold font-display mb-6 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            Stream Together,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">Watch as One</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create synchronized watch parties with friends. Stream videos together with real-time chat, reactions, and
            seamless video synchronization across all devices.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" asChild className="shadow-glow-lg">
              <Link href="/register">
                <Play className="w-5 h-5 mr-2" />
                Start Watching Together
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/demo">
                <Users className="w-5 h-5 mr-2" />
                View Demo
              </Link>
            </Button>
          </div>

          {/* Hero Image Placeholder */}
          <div className="relative max-w-4xl mx-auto">
            <div className="aspect-video bg-gradient-secondary rounded-xl border border-border/50 overflow-hidden shadow-2xl">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="Watch Party Interface"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent-primary/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-support-violet/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background-secondary/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Everything You Need for Perfect Watch Parties
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From real-time synchronization to advanced social features, we've built the ultimate platform for shared
              viewing experiences.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-accent-primary" />
                </div>
                <CardTitle>Real-time Sync</CardTitle>
                <CardDescription>
                  Perfect video synchronization with sub-second accuracy across all participants
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-success/20 rounded-lg flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-accent-success" />
                </div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>
                  Interactive chat with emoji reactions, mentions, and file sharing capabilities
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-support-violet/20 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-support-violet" />
                </div>
                <CardTitle>Social Features</CardTitle>
                <CardDescription>
                  Friend system, activity feeds, and community features for enhanced social interaction
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-warning/20 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-6 h-6 text-accent-warning" />
                </div>
                <CardTitle>Multi-Source Support</CardTitle>
                <CardDescription>
                  Upload from Google Drive, OneDrive, S3, or direct file upload with CDN optimization
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-accent-premium/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-accent-premium" />
                </div>
                <CardTitle>Enterprise Security</CardTitle>
                <CardDescription>
                  2FA, biometric auth, session management, and comprehensive security monitoring
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-support-pink/20 rounded-lg flex items-center justify-center mb-4">
                  <Play className="w-6 h-6 text-support-pink" />
                </div>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>
                  Detailed viewing metrics, engagement tracking, and business intelligence
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-accent-primary mb-2">10,000+</div>
              <div className="text-muted-foreground">Concurrent Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent-success mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-support-violet mb-2">50ms</div>
              <div className="text-muted-foreground">Sync Latency</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent-premium mb-2">24/7</div>
              <div className="text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-primary">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-white">
            Ready to Start Your Watch Party?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of users already enjoying synchronized streaming experiences with friends and family.
          </p>
          <Button size="lg" variant="secondary" asChild className="shadow-xl">
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Play className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold font-display">Watch Party</span>
              </div>
              <p className="text-muted-foreground">The ultimate platform for synchronized streaming experiences.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-foreground transition-colors">
                    Security
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Watch Party. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

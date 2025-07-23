import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Shield, Eye, Database, Lock, Cookie } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neo-background">
      {/* Header */}
      <div className="border-b border-neo-border bg-neo-surface/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/" className="text-neo-text-secondary hover:text-neo-text-primary">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-neo-text-primary">Privacy Policy</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-neo-text-primary flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              Privacy Policy
            </CardTitle>
            <p className="text-neo-text-secondary">Last updated: January 19, 2025</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4 flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                1. Information We Collect
              </h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>
                  We collect information you provide directly to us, such as when you create an account, upload content,
                  or contact us for support.
                </p>
                <div className="bg-neo-surface p-4 rounded-lg">
                  <h3 className="font-semibold text-neo-text-primary mb-2">Personal Information:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Name and email address</li>
                    <li>Profile picture and bio</li>
                    <li>Payment information (processed securely)</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>
                <div className="bg-neo-surface p-4 rounded-lg">
                  <h3 className="font-semibold text-neo-text-primary mb-2">Usage Information:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Watch history and preferences</li>
                    <li>Chat messages and interactions</li>
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                  </ul>
                </div>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* How We Use Information */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4 flex items-center gap-2">
                <Database className="w-6 h-6 text-primary" />
                2. How We Use Your Information
              </h2>
              <div className="space-y-4 text-neo-text-secondary">
                <ul className="list-disc list-inside space-y-2">
                  <li>Provide and improve our streaming services</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Process payments and manage subscriptions</li>
                  <li>Send important updates and notifications</li>
                  <li>Ensure platform security and prevent abuse</li>
                  <li>Analyze usage patterns to improve performance</li>
                </ul>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Information Sharing */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">3. Information Sharing</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>
                  We do not sell, trade, or rent your personal information to third parties. We may share information in
                  these limited circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li>With your consent</li>
                  <li>To comply with legal obligations</li>
                  <li>To protect our rights and safety</li>
                  <li>With service providers who help operate our platform</li>
                  <li>In connection with a business transfer</li>
                </ul>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4 flex items-center gap-2">
                <Lock className="w-6 h-6 text-primary" />
                4. Data Security
              </h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>We implement appropriate security measures to protect your information:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-neo-surface p-4 rounded-lg">
                    <h3 className="font-semibold text-neo-text-primary mb-2">Technical Safeguards:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Encryption in transit and at rest</li>
                      <li>Regular security audits</li>
                      <li>Access controls and monitoring</li>
                    </ul>
                  </div>
                  <div className="bg-neo-surface p-4 rounded-lg">
                    <h3 className="font-semibold text-neo-text-primary mb-2">Operational Safeguards:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Employee training and background checks</li>
                      <li>Incident response procedures</li>
                      <li>Regular backup and recovery testing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Cookies */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4 flex items-center gap-2">
                <Cookie className="w-6 h-6 text-primary" />
                5. Cookies and Tracking
              </h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>We use cookies and similar technologies to enhance your experience:</p>
                <div className="space-y-3">
                  <div className="bg-neo-surface p-3 rounded-lg">
                    <span className="font-semibold text-neo-text-primary">Essential Cookies:</span> Required for basic
                    functionality
                  </div>
                  <div className="bg-neo-surface p-3 rounded-lg">
                    <span className="font-semibold text-neo-text-primary">Analytics Cookies:</span> Help us understand
                    usage patterns
                  </div>
                  <div className="bg-neo-surface p-3 rounded-lg">
                    <span className="font-semibold text-neo-text-primary">Preference Cookies:</span> Remember your
                    settings and preferences
                  </div>
                </div>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">6. Your Rights</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>You have the right to:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <ul className="list-disc list-inside space-y-2">
                    <li>Access your personal information</li>
                    <li>Correct inaccurate information</li>
                    <li>Delete your account and data</li>
                  </ul>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Export your data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Restrict certain data processing</li>
                  </ul>
                </div>
                <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                  <p className="text-primary font-semibold">
                    To exercise these rights, contact us at privacy@watchparty.com
                  </p>
                </div>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">7. Contact Us</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>If you have questions about this Privacy Policy, please contact us:</p>
                <div className="bg-neo-surface p-4 rounded-lg">
                  <p>Email: privacy@watchparty.com</p>
                  <p>Address: 123 Stream Street, Video City, VC 12345</p>
                </div>
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

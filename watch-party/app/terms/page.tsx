import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Scale, Shield, Users, Globe } from "lucide-react"

export default function TermsPage() {
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
              <Scale className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold text-neo-text-primary">Terms of Service</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="card">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-neo-text-primary flex items-center gap-3">
              <Scale className="w-8 h-8 text-primary" />
              Terms of Service
            </CardTitle>
            <p className="text-neo-text-secondary">Last updated: January 19, 2025</p>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4 flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                1. Introduction
              </h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>
                  Welcome to Watch Party ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of our
                  video streaming and watch party platform located at watchparty.com (the "Service") operated by Watch
                  Party Inc.
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part
                  of these terms, then you may not access the Service.
                </p>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Account Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                2. Account Terms
              </h2>
              <div className="space-y-4 text-neo-text-secondary">
                <ul className="list-disc list-inside space-y-2">
                  <li>You must be 13 years or older to use this Service</li>
                  <li>You must provide accurate and complete registration information</li>
                  <li>You are responsible for maintaining the security of your account</li>
                  <li>You are responsible for all activities that occur under your account</li>
                  <li>You may not use the Service for any illegal or unauthorized purpose</li>
                </ul>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Acceptable Use */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                3. Acceptable Use Policy
              </h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>You agree not to:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Upload, stream, or share copyrighted content without permission</li>
                  <li>Harass, abuse, or harm other users</li>
                  <li>Spam or send unsolicited messages</li>
                  <li>Attempt to gain unauthorized access to the Service</li>
                  <li>Use the Service to distribute malware or viruses</li>
                  <li>Impersonate others or provide false information</li>
                </ul>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Content Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">4. Content Policy</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>
                  You retain ownership of content you upload, but grant us a license to use, display, and distribute it
                  through our Service. You are responsible for ensuring you have the right to share any content you
                  upload.
                </p>
                <p>We reserve the right to remove content that violates these Terms or our Community Guidelines.</p>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">5. Privacy</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>
                  Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the
                  Service, to understand our practices.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/privacy">Read Privacy Policy</Link>
                </Button>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Subscription Terms */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">6. Subscription Terms</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <ul className="list-disc list-inside space-y-2">
                  <li>Premium subscriptions are billed monthly or annually</li>
                  <li>You can cancel your subscription at any time</li>
                  <li>Refunds are provided according to our refund policy</li>
                  <li>Prices may change with 30 days notice</li>
                </ul>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">7. Termination</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>
                  We may terminate or suspend your account immediately, without prior notice, for conduct that we
                  believe violates these Terms or is harmful to other users, us, or third parties.
                </p>
              </div>
            </section>

            <Separator className="bg-neo-border" />

            {/* Contact */}
            <section>
              <h2 className="text-2xl font-semibold text-neo-text-primary mb-4">8. Contact Information</h2>
              <div className="space-y-4 text-neo-text-secondary">
                <p>If you have any questions about these Terms, please contact us at:</p>
                <div className="bg-neo-surface p-4 rounded-lg">
                  <p>Email: legal@watchparty.com</p>
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

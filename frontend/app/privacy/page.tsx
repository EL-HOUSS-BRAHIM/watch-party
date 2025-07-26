import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Eye, Database, Users, Lock, Globe, FileText, Mail } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | WatchParty',
  description: 'Privacy Policy and Data Protection information for WatchParty platform',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            Privacy Policy
          </h1>
          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p className="text-gray-700 mt-4">
            WatchParty is committed to protecting your privacy. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you use our platform.
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-blue-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Eye className="h-6 w-6" />
              Quick Overview
            </h2>
            <ul className="space-y-2">
              <li>✅ We only collect information necessary to provide our service</li>
              <li>✅ We never sell your personal data to third parties</li>
              <li>✅ You control your data and can delete your account anytime</li>
              <li>✅ We use industry-standard security measures to protect your information</li>
              <li>✅ We comply with GDPR, CCPA, and other privacy regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Database className="h-6 w-6" />
              1. Information We Collect
            </h2>
            
            <h3 className="text-xl font-medium mb-3">1.1 Information You Provide</h3>
            <p className="mb-4">When you use WatchParty, you may provide us with:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><strong>Account Information:</strong> Username, email address, password, profile picture</li>
              <li><strong>Profile Data:</strong> Display name, bio, preferences, timezone</li>
              <li><strong>Content:</strong> Messages, comments, shared videos, watch party descriptions</li>
              <li><strong>Communication:</strong> Support requests, feedback, survey responses</li>
              <li><strong>Payment Information:</strong> Billing details for premium features (processed securely by third-party providers)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">1.2 Information We Collect Automatically</h3>
            <p className="mb-4">When you use our platform, we automatically collect:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><strong>Usage Data:</strong> Pages visited, features used, time spent, click patterns</li>
              <li><strong>Device Information:</strong> Browser type, operating system, screen resolution, device identifiers</li>
              <li><strong>Technical Data:</strong> IP address, connection information, access times</li>
              <li><strong>Performance Data:</strong> Loading times, errors, crashes for service improvement</li>
              <li><strong>Location Data:</strong> General location (country/region) based on IP address</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">1.3 Information from Third Parties</h3>
            <p className="mb-4">We may receive information from:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Social Login:</strong> Profile information when you sign in with Google, Discord, etc.</li>
              <li><strong>Video Platforms:</strong> Metadata from YouTube, Twitch when sharing content</li>
              <li><strong>Analytics Services:</strong> Aggregated usage statistics and performance metrics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Users className="h-6 w-6" />
              2. How We Use Your Information
            </h2>
            
            <h3 className="text-xl font-medium mb-3">2.1 Primary Service Functions</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Create and manage your account</li>
              <li>Enable watch party creation and participation</li>
              <li>Facilitate real-time chat and communication</li>
              <li>Sync video playback across participants</li>
              <li>Provide personalized recommendations</li>
              <li>Enable social features and friend connections</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.2 Service Improvement</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Analyze usage patterns to improve features</li>
              <li>Debug technical issues and optimize performance</li>
              <li>Develop new features based on user behavior</li>
              <li>Conduct research to enhance user experience</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.3 Communication</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Send important service updates and notifications</li>
              <li>Respond to support requests and feedback</li>
              <li>Share platform news and feature announcements</li>
              <li>Send promotional content (with your consent)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">2.4 Safety and Security</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Detect and prevent fraud, abuse, and spam</li>
              <li>Enforce our Terms of Service and Community Guidelines</li>
              <li>Protect against security threats and unauthorized access</li>
              <li>Comply with legal obligations and law enforcement requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6" />
              3. Information Sharing and Disclosure
            </h2>
            
            <h3 className="text-xl font-medium mb-3">3.1 We DO NOT Sell Your Data</h3>
            <p className="mb-6 bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <strong>Important:</strong> WatchParty does not sell, rent, or trade your personal 
              information to third parties for marketing purposes.
            </p>

            <h3 className="text-xl font-medium mb-3">3.2 When We Share Information</h3>
            <p className="mb-4">We may share your information only in these circumstances:</p>
            
            <h4 className="text-lg font-medium mb-2">With Your Consent</h4>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>When you explicitly agree to share information</li>
              <li>When you connect third-party services to your account</li>
            </ul>

            <h4 className="text-lg font-medium mb-2">Service Providers</h4>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>Cloud hosting and storage providers</li>
              <li>Payment processors for premium features</li>
              <li>Email and communication services</li>
              <li>Analytics and performance monitoring tools</li>
            </ul>

            <h4 className="text-lg font-medium mb-2">Legal Requirements</h4>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>To comply with applicable laws and regulations</li>
              <li>To respond to lawful requests from government authorities</li>
              <li>To protect our rights, property, and safety</li>
              <li>To enforce our Terms of Service</li>
            </ul>

            <h4 className="text-lg font-medium mb-2">Business Transfers</h4>
            <p>In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Lock className="h-6 w-6" />
              4. Data Security
            </h2>
            
            <h3 className="text-xl font-medium mb-3">4.1 Security Measures</h3>
            <p className="mb-4">We implement comprehensive security measures including:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><strong>Encryption:</strong> Data encrypted in transit (HTTPS/TLS) and at rest</li>
              <li><strong>Access Controls:</strong> Strict employee access controls and authentication</li>
              <li><strong>Infrastructure:</strong> Secure cloud hosting with regular security audits</li>
              <li><strong>Monitoring:</strong> 24/7 security monitoring and threat detection</li>
              <li><strong>Updates:</strong> Regular security patches and system updates</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">4.2 Data Retention</h3>
            <p className="mb-4">We retain your information only as long as necessary to:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Provide our services to you</li>
              <li>Comply with legal obligations</li>
              <li>Resolve disputes and enforce agreements</li>
              <li>Improve our services (in anonymized form)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">4.3 Account Deletion</h3>
            <p>
              When you delete your account, we remove your personal information within 30 days. 
              Some information may be retained in anonymized form for analytics or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <FileText className="h-6 w-6" />
              5. Your Privacy Rights
            </h2>
            
            <h3 className="text-xl font-medium mb-3">5.1 General Rights</h3>
            <p className="mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Portability:</strong> Export your data in a standard format</li>
              <li><strong>Objection:</strong> Object to certain types of data processing</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">5.2 GDPR Rights (EU Residents)</h3>
            <p className="mb-4">If you're in the EU, you have additional rights under GDPR:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Right to restriction of processing</li>
              <li>Right to data portability</li>
              <li>Right to withdraw consent</li>
              <li>Right to lodge a complaint with supervisory authorities</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">5.3 CCPA Rights (California Residents)</h3>
            <p className="mb-4">California residents have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Know what personal information we collect and how it's used</li>
              <li>Delete personal information (subject to certain exceptions)</li>
              <li>Opt-out of the sale of personal information (we don't sell data)</li>
              <li>Non-discrimination for exercising privacy rights</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">5.4 How to Exercise Your Rights</h3>
            <p className="mb-4">To exercise your privacy rights:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Email us at privacy@watchparty.com</li>
              <li>Use the privacy controls in your account settings</li>
              <li>Contact our support team through the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Cookies and Tracking</h2>
            
            <h3 className="text-xl font-medium mb-3">6.1 Cookies We Use</h3>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how you use our platform</li>
              <li><strong>Marketing Cookies:</strong> Used for targeted advertising (with consent)</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">6.2 Managing Cookies</h3>
            <p>
              You can control cookies through your browser settings. Note that disabling 
              certain cookies may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p className="mb-4">
              WatchParty is designed for users 13 years and older. We do not knowingly 
              collect personal information from children under 13. If we become aware 
              that we have collected such information, we will take steps to delete it.
            </p>
            <p>
              For users between 13-18, we recommend parental supervision and encourage 
              parents to review our privacy practices.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. International Data Transfers</h2>
            <p className="mb-4">
              WatchParty operates globally, and your information may be transferred to 
              and processed in countries other than your own. We ensure appropriate 
              safeguards are in place for international transfers, including:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>EU Standard Contractual Clauses</li>
              <li>Adequacy decisions by relevant authorities</li>
              <li>Other legally recognized transfer mechanisms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy periodically to reflect changes in our 
              practices or applicable laws. We will notify you of material changes through:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Email notification to your registered address</li>
              <li>Prominent notice on our platform</li>
              <li>In-app notifications</li>
            </ul>
            <p>
              Your continued use of WatchParty after changes constitutes acceptance 
              of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-6 w-6" />
              10. Contact Us
            </h2>
            <p className="mb-4">
              If you have questions, concerns, or requests regarding this Privacy Policy 
              or our data practices, please contact us:
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-3">
              <div>
                <strong>Data Protection Officer:</strong>
                <br />Email: privacy@watchparty.com
              </div>
              <div>
                <strong>General Support:</strong>
                <br />Email: support@watchparty.com
              </div>
              <div>
                <strong>Mailing Address:</strong>
                <br />[Your Company Name]
                <br />[Street Address]
                <br />[City, State, ZIP Code]
                <br />[Country]
              </div>
            </div>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4">Privacy by Design</h2>
            <p className="mb-4">
              WatchParty is built with privacy as a core principle. We believe in:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Data Minimization:</strong> We collect only what we need</li>
              <li><strong>Purpose Limitation:</strong> Data is used only for stated purposes</li>
              <li><strong>Transparency:</strong> Clear communication about our practices</li>
              <li><strong>User Control:</strong> You decide how your data is used</li>
              <li><strong>Security First:</strong> Protection is built into every system</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Your Trust Matters
          </h3>
          <p className="text-gray-700 mb-3">
            We take your privacy seriously and are committed to maintaining your trust. 
            If you have any questions about this policy or our privacy practices, 
            please don't hesitate to reach out.
          </p>
          <Link 
            href="/contact" 
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Contact our privacy team →
          </Link>
        </div>
      </div>
    </div>
  )
}

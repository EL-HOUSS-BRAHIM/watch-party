import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Terms of Service | WatchParty',
  description: 'Terms of Service and User Agreement for WatchParty platform',
}

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-gray-600 text-lg">
            Last updated: {new Date().toLocaleDateString('en-US', {}
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using WatchParty ("the Platform," "Service," "we," "us," or "our"), 
              you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
            <p>
              These Terms of Service constitute a legally binding agreement between you and WatchParty
              regarding your use of our platform and services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              WatchParty is a platform that enables users to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Create and join synchronized video watching sessions</li>
              <li>Chat with other participants during watch parties</li>
              <li>Share videos and media content with friends</li>
              <li>Customize their viewing experience with themes and features</li>
              <li>Connect with a community of video enthusiasts</li>
            </ul>
            <p>
              We reserve the right to modify, suspend, or discontinue any aspect of the service
              at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts and Eligibility</h2>
            <h3 className="text-xl font-medium mb-3">3.1 Account Creation</h3>
            <p className="mb-4">
              To use certain features of WatchParty, you must create an account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>

            <h3 className="text-xl font-medium mb-3">3.2 Age Requirements</h3>
            <p className="mb-4">
              You must be at least 13 years old to use WatchParty. If you are between 13 and 18
              years old, you represent that you have your parent's or guardian's permission to
              use the service.
            </p>

            <h3 className="text-xl font-medium mb-3">3.3 Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account at our discretion, 
              including for violations of these terms or community guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <h3 className="text-xl font-medium mb-3">4.1 Permitted Uses</h3>
            <p className="mb-4">
              You may use WatchParty for lawful purposes only. You agree to use the platform
              in accordance with all applicable laws and regulations.
            </p>

            <h3 className="text-xl font-medium mb-3">4.2 Prohibited Activities</h3>
            <p className="mb-4">You agree NOT to use WatchParty to:</p>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Upload, share, or stream copyrighted content without proper authorization</li>
              <li>Engage in harassment, bullying, or abusive behavior toward other users</li>
              <li>Share inappropriate, offensive, or harmful content</li>
              <li>Attempt to hack, disrupt, or compromise the platform's security</li>
              <li>Create multiple accounts to evade bans or restrictions</li>
              <li>Use automated tools or bots to access the service</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Impersonate others or misrepresent your identity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
            <h3 className="text-xl font-medium mb-3">5.1 User Content</h3>
            <p className="mb-4">
              You retain ownership of content you create and share on WatchParty. However, 
              by sharing content, you grant us a worldwide, non-exclusive, royalty-free license
              to use, reproduce, modify, and distribute your content in connection with the service.
            </p>

            <h3 className="text-xl font-medium mb-3">5.2 Copyright Compliance</h3>
            <p className="mb-4">
              WatchParty respects intellectual property rights. We respond to valid DMCA takedown
              notices and may terminate accounts of repeat infringers.
            </p>

            <h3 className="text-xl font-medium mb-3">5.3 Platform Content</h3>
            <p>
              All WatchParty branding, features, and original content are protected by copyright, 
              trademark, and other intellectual property laws. You may not copy, modify, or
              distribute our content without permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data</h2>
            <p className="mb-4">
              Your privacy is important to us. Our Privacy Policy explains how we collect, 
              use, and protect your information. By using WatchParty, you agree to our
              data practices as described in our Privacy Policy.
            </p>
            <p>
              We implement appropriate security measures to protect your personal information, 
              but cannot guarantee absolute security of data transmitted over the internet.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Payments and Subscriptions</h2>
            <h3 className="text-xl font-medium mb-3">7.1 Premium Features</h3>
            <p className="mb-4">
              Some features may require payment. All fees are non-refundable unless required by law. 
              We reserve the right to change pricing with reasonable notice.
            </p>

            <h3 className="text-xl font-medium mb-3">7.2 Subscriptions</h3>
            <p className="mb-4">
              Subscription services automatically renew unless cancelled. You can cancel anytime
              through your account settings. Cancellation takes effect at the end of the current billing period.
            </p>

            <h3 className="text-xl font-medium mb-3">7.3 Virtual Currency</h3>
            <p>
              Virtual currencies (points, coins, gems) have no real-world value and cannot be
              exchanged for cash. Virtual currency purchases are final and non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations</h2>
            <h3 className="text-xl font-medium mb-3">8.1 Service Availability</h3>
            <p className="mb-4">
              WatchParty is provided "as is" without warranties of any kind. We do not guarantee
              uninterrupted or error-free service. The platform may experience downtime for
              maintenance or unforeseen issues.
            </p>

            <h3 className="text-xl font-medium mb-3">8.2 Third-Party Content</h3>
            <p className="mb-4">
              We are not responsible for content shared by users or accessed through third-party
              integrations. Users are solely responsible for the content they share and view.
            </p>

            <h3 className="text-xl font-medium mb-3">8.3 Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by law, WatchParty shall not be liable for any
              indirect, incidental, special, consequential, or punitive damages arising from
              your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless WatchParty, its affiliates, officers, 
              agents, and employees from any claims, damages, or expenses arising from your
              use of the service or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Modifications to Terms</h2>
            <p className="mb-4">
              We reserve the right to modify these Terms of Service at any time. Material
              changes will be communicated through the platform or via email. Continued use
              of the service after changes constitutes acceptance of the new terms.
            </p>
            <p>
              We encourage you to review these terms periodically to stay informed of any updates.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Governing Law and Disputes</h2>
            <h3 className="text-xl font-medium mb-3">11.1 Governing Law</h3>
            <p className="mb-4">
              These terms are governed by the laws of [Your Jurisdiction] without regard to
              conflict of law principles.
            </p>

            <h3 className="text-xl font-medium mb-3">11.2 Dispute Resolution</h3>
            <p>
              Any disputes arising from these terms or your use of WatchParty will be resolved
              through binding arbitration, except where prohibited by law. You waive your right
              to participate in class action lawsuits.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Severability</h2>
            <p>
              If any provision of these terms is found to be unenforceable, the remaining
              provisions will continue in full force and effect. The unenforceable provision
              will be replaced with an enforceable provision that most closely matches the
              intent of the original.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Contact Information</h2>
            <p className="mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p><strong>Email:</strong> legal@watchparty.com</p>
              <p><strong>Address:</strong> [Your Company Address]</p>
              <p><strong>Phone:</strong> [Your Phone Number]</p>
            </div>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-2xl font-semibold mb-4">Community Guidelines</h2>
            <p className="mb-4">
              In addition to these Terms of Service, all users must follow our Community Guidelines:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Be respectful and kind to all community members</li>
              <li>Keep content appropriate for all audiences</li>
              <li>Respect copyright and intellectual property rights</li>
              <li>Report inappropriate behavior or content</li>
              <li>Help maintain a positive environment for everyone</li>
            </ul>
          </section>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Questions?</h3>
          <p className="text-gray-700">
            If you have any questions about these Terms of Service or need clarification
            on any section, please don't hesitate to contact our support team. We're here
            to help ensure you have a great experience on WatchParty.
          </p>
        </div>
      </div>
    </div>
  )
}

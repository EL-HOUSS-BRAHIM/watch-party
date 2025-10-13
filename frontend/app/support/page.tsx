import Link from "next/link"

export const metadata = {
  title: "Support | WatchParty",
  description: "Get help with WatchParty. Find answers to common questions and learn how to use our features."
}

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-brand-neutral/30 to-white">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:px-8">
          <div className="text-center">
            <span className="inline-block rounded-full border border-brand-magenta/30 bg-brand-magenta/10 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-brand-magenta-dark">
              Support Center
            </span>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-brand-navy sm:text-5xl">
              How can we help you?
            </h1>
            <p className="mt-4 text-lg text-brand-navy/70">
              Find answers to common questions and learn how to get the most out of WatchParty
            </p>
          </div>

          <div className="mt-16 space-y-12">
            {/* Getting Started */}
            <section className="rounded-3xl border border-brand-purple/20 bg-white/90 p-8 shadow-[0_24px_80px_rgba(28,28,46,0.12)]">
              <h2 className="text-2xl font-bold text-brand-navy">Getting Started</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">How do I create a watch party?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Sign up for an account, go to your dashboard, and click "Create Room". Add your content by uploading a file or pasting a link, then share the party code with friends.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">How do I join a party?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Click "Join Party" from the homepage or go directly to <Link href="/join" className="text-brand-magenta hover:underline">/join</Link>. Enter the party code provided by your host and you'll be connected instantly.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">Do I need to create an account to join?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    No! Guests can join any party with just the party code. However, creating an account allows you to host parties and access additional features.
                  </p>
                </div>
              </div>
            </section>

            {/* Features & Functionality */}
            <section className="rounded-3xl border border-brand-blue/20 bg-white/90 p-8 shadow-[0_24px_80px_rgba(45,156,219,0.12)]">
              <h2 className="text-2xl font-bold text-brand-navy">Features & Functionality</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">What content can I watch together?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    You can watch movies, TV shows, live sports, or any video content. Upload files directly or stream from supported platforms.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">How does synchronization work?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    WatchParty uses advanced real-time technology to keep all viewers in perfect sync (typically within ±18ms). The host controls playback and everyone's video stays synchronized automatically.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">Can I use WatchParty on mobile?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Yes! WatchParty works on all devices including smartphones, tablets, laptops, and smart TVs with a modern web browser.
                  </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section className="rounded-3xl border border-brand-orange/20 bg-white/90 p-8 shadow-[0_24px_80px_rgba(249,115,22,0.12)]">
              <h2 className="text-2xl font-bold text-brand-navy">Troubleshooting</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">The video won't play or keeps buffering</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Check your internet connection and try refreshing the page. If issues persist, try reducing video quality in the settings or switching to a different browser.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">I can't hear audio</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Make sure your device volume is up and the video isn't muted. Check your browser permissions to ensure WatchParty has access to audio.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">My party code isn't working</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Party codes are case-sensitive. Make sure you're entering it exactly as provided. If the party has ended or been deleted, the code will no longer work.
                  </p>
                </div>
              </div>
            </section>

            {/* Account & Billing */}
            <section className="rounded-3xl border border-brand-cyan/20 bg-white/90 p-8 shadow-[0_24px_80px_rgba(59,198,232,0.12)]">
              <h2 className="text-2xl font-bold text-brand-navy">Account & Billing</h2>
              <div className="mt-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">How much does WatchParty cost?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    WatchParty offers both free and premium plans. Check our <Link href="/pricing" className="text-brand-magenta hover:underline">pricing page</Link> for current plans and features.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">How do I cancel my subscription?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Go to your dashboard settings and navigate to the billing section. You can cancel your subscription at any time, and you'll retain access until the end of your billing period.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-brand-navy">How do I reset my password?</h3>
                  <p className="mt-2 text-brand-navy/70">
                    Visit the <Link href="/auth/forgot-password" className="text-brand-magenta hover:underline">forgot password page</Link> and enter your email. We'll send you a link to reset your password.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-16 rounded-3xl border border-brand-purple/20 bg-gradient-to-br from-brand-magenta/10 via-brand-orange/10 to-brand-purple/10 p-8 text-center">
            <h2 className="text-2xl font-bold text-brand-navy">Still need help?</h2>
            <p className="mt-4 text-brand-navy/70">
              Can't find the answer you're looking for? We're here to help!
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-brand-magenta to-brand-orange px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-magenta/30 transition-all hover:-translate-y-0.5 hover:from-brand-magenta-dark hover:to-brand-orange-dark hover:shadow-brand-magenta/40"
              >
                Go to Dashboard
              </Link>
              <a
                href="https://github.com/EL-HOUSS-BRAHIM"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-brand-navy/20 bg-white px-6 py-3 text-sm font-semibold text-brand-navy transition-all hover:border-brand-purple/40 hover:text-brand-purple"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
  )
}

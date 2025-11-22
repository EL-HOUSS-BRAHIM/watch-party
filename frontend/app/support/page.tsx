import Link from "next/link"

export const metadata = {
  title: "Support | WatchParty",
  description: "Get help with WatchParty. Find answers to common questions and learn how to use our features."
}

export default function SupportPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-gradient-radial from-brand-blue/10 via-transparent to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 sm:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.4em] text-brand-magenta-dark shadow-sm">
              Support Center
            </span>
            <h1 className="mt-8 text-4xl font-bold tracking-tight sm:text-6xl bg-gradient-to-br from-brand-navy to-brand-purple bg-clip-text text-transparent">
              How can we help you?
            </h1>
            <p className="mt-6 text-xl text-brand-navy/70 max-w-2xl mx-auto leading-relaxed">
              Find answers to common questions and learn how to get the most out of WatchParty
            </p>
          </div>

          <div className="space-y-8">
            {/* Getting Started */}
            <section className="glass-panel rounded-[40px] p-8 sm:p-10 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-brand-purple/5 to-transparent blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:from-brand-purple/10 transition-colors duration-500" />
              <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-3">
                <span className="text-3xl">🚀</span> Getting Started
              </h2>
              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">How do I create a watch party?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Sign up for an account, go to your dashboard, and click "Create Room". Add your content by uploading a file or pasting a link, then share the party code with friends.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">How do I join a party?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Click "Join Party" from the homepage or go directly to <Link href="/join" className="font-bold text-brand-magenta hover:text-brand-magenta-dark hover:underline decoration-brand-magenta/30 underline-offset-4 transition-all">/join</Link>. Enter the party code provided by your host and you'll be connected instantly.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">Do I need to create an account to join?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    No! Guests can join any party with just the party code. However, creating an account allows you to host parties and access additional features.
                  </p>
                </div>
              </div>
            </section>

            {/* Features & Functionality */}
            <section className="glass-panel rounded-[40px] p-8 sm:p-10 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-brand-blue/5 to-transparent blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:from-brand-blue/10 transition-colors duration-500" />
              <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-3">
                <span className="text-3xl">✨</span> Features & Functionality
              </h2>
              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">What content can I watch together?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    You can watch movies, TV shows, live sports, or any video content. Upload files directly or stream from supported platforms.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">How does synchronization work?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    WatchParty uses advanced real-time technology to keep all viewers in perfect sync (typically within ±18ms). The host controls playback and everyone's video stays synchronized automatically.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">Can I use WatchParty on mobile?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Yes! WatchParty works on all devices including smartphones, tablets, laptops, and smart TVs with a modern web browser.
                  </p>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section className="glass-panel rounded-[40px] p-8 sm:p-10 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-brand-orange/5 to-transparent blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:from-brand-orange/10 transition-colors duration-500" />
              <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-3">
                <span className="text-3xl">🔧</span> Troubleshooting
              </h2>
              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">The video won't play or keeps buffering</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Check your internet connection and try refreshing the page. If issues persist, try reducing video quality in the settings or switching to a different browser.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">I can't hear audio</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Make sure your device volume is up and the video isn't muted. Check your browser permissions to ensure WatchParty has access to audio.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">My party code isn't working</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Party codes are case-sensitive. Make sure you're entering it exactly as provided. If the party has ended or been deleted, the code will no longer work.
                  </p>
                </div>
              </div>
            </section>

            {/* Account & Billing */}
            <section className="glass-panel rounded-[40px] p-8 sm:p-10 relative overflow-hidden group hover:shadow-xl transition-all duration-500">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-brand-cyan/5 to-transparent blur-2xl -mr-16 -mt-16 pointer-events-none group-hover:from-brand-cyan/10 transition-colors duration-500" />
              <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-3">
                <span className="text-3xl">💳</span> Account & Billing
              </h2>
              <div className="mt-8 space-y-8">
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">How much does WatchParty cost?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    WatchParty offers both free and premium plans. Check our <Link href="/pricing" className="font-bold text-brand-magenta hover:text-brand-magenta-dark hover:underline decoration-brand-magenta/30 underline-offset-4 transition-all">pricing page</Link> for current plans and features.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">How do I cancel my subscription?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Go to your dashboard settings and navigate to the billing section. You can cancel your subscription at any time, and you'll retain access until the end of your billing period.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-navy">How do I reset my password?</h3>
                  <p className="mt-3 text-brand-navy/70 leading-relaxed">
                    Visit the <Link href="/auth/forgot-password" className="font-bold text-brand-magenta hover:text-brand-magenta-dark hover:underline decoration-brand-magenta/30 underline-offset-4 transition-all">forgot password page</Link> and enter your email. We'll send you a link to reset your password.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Contact Section */}
          <div className="mt-16 glass-panel rounded-[40px] p-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-magenta/5 via-brand-orange/5 to-brand-purple/5 opacity-50" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-brand-navy">Still need help?</h2>
              <p className="mt-4 text-brand-navy/70 text-lg">
                Can't find the answer you're looking for? We're here to help!
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-brand-magenta to-brand-orange px-8 py-4 text-lg font-bold text-white shadow-lg shadow-brand-magenta/30 transition-all hover:-translate-y-0.5 hover:shadow-brand-magenta/40 hover:shadow-xl"
                >
                  Go to Dashboard
                </Link>
                <a
                  href="https://github.com/EL-HOUSS-BRAHIM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-brand-navy/10 bg-white/50 px-8 py-4 text-lg font-bold text-brand-navy transition-all hover:bg-white hover:shadow-lg hover:border-brand-purple/20"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}

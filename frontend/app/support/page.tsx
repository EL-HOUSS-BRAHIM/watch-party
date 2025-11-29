import Link from "next/link"

export const metadata = {
  title: "Support | WatchParty",
  description: "Get help with WatchParty. Find answers to common questions and learn how to use our features."
}

const faqs = [
  {
    category: "Getting Started",
    icon: "��",
    questions: [
      {
        q: "How do I create a watch party?",
        a: "Sign up, go to your dashboard, and click 'Create Room'. Add your content and share the party code with friends."
      },
      {
        q: "How do I join a party?",
        a: "Click 'Join Party' from the homepage or go to /join. Enter the party code and you'll be connected instantly."
      },
      {
        q: "Do I need an account to join?",
        a: "No! Guests can join with just a party code. An account lets you host parties and access more features."
      }
    ]
  },
  {
    category: "Features",
    icon: "✨",
    questions: [
      {
        q: "What content can I watch together?",
        a: "Movies, TV shows, live sports, or any video. Upload files directly or stream from supported platforms."
      },
      {
        q: "How does synchronization work?",
        a: "WatchParty keeps all viewers in sync (within ±18ms). The host controls playback and everyone stays synchronized."
      },
      {
        q: "Does it work on mobile?",
        a: "Yes! WatchParty works on all devices with a modern web browser."
      }
    ]
  },
  {
    category: "Troubleshooting",
    icon: "🔧",
    questions: [
      {
        q: "Video won't play or keeps buffering?",
        a: "Check your internet connection, refresh the page, or try reducing video quality in settings."
      },
      {
        q: "Can't hear audio?",
        a: "Make sure your device volume is up and the video isn't muted. Check browser audio permissions."
      },
      {
        q: "Party code not working?",
        a: "Codes are case-sensitive. Enter it exactly as provided. Expired parties won't accept codes."
      }
    ]
  }
]

export default function SupportPage() {
  return (
    <div className="section-padding">
      <div className="container-width-sm px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <span className="inline-flex items-center rounded-full border border-brand-magenta/20 bg-brand-magenta/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-brand-magenta-dark mb-3 sm:mb-4">
            Support Center
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-brand-navy sm:text-3xl md:text-4xl">
            How can we help?
          </h1>
          <p className="mt-3 sm:mt-4 text-sm text-brand-navy/60 max-w-lg mx-auto sm:text-base">
            Find answers to common questions and get the most out of WatchParty.
          </p>
        </div>

        {/* FAQ Sections */}
        <div className="space-y-4 sm:space-y-6 md:space-y-8">
          {faqs.map((section) => (
            <div
              key={section.category}
              className="rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-white/70 p-4 sm:p-6 md:p-8 backdrop-blur-sm"
            >
              <h2 className="text-base font-bold text-brand-navy flex items-center gap-2 mb-4 sm:mb-6 sm:text-lg">
                <span>{section.icon}</span> {section.category}
              </h2>
              <div className="space-y-4 sm:space-y-5">
                {section.questions.map((item) => (
                  <div key={item.q}>
                    <h3 className="text-[13px] font-semibold text-brand-navy sm:text-sm">{item.q}</h3>
                    <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-brand-navy/60 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Account & Billing */}
        <div className="mt-4 sm:mt-6 md:mt-8 rounded-xl sm:rounded-2xl border border-brand-cyan/10 bg-white/70 p-4 sm:p-6 md:p-8 backdrop-blur-sm">
          <h2 className="text-base font-bold text-brand-navy flex items-center gap-2 mb-4 sm:mb-6 sm:text-lg">
            <span>💳</span> Account & Billing
          </h2>
          <div className="space-y-4 sm:space-y-5">
            <div>
              <h3 className="text-[13px] font-semibold text-brand-navy sm:text-sm">How much does WatchParty cost?</h3>
              <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-brand-navy/60 leading-relaxed">
                We offer free and premium plans. Check our{" "}
                <Link href="/pricing" className="text-brand-magenta hover:underline">pricing page</Link> for details.
              </p>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-brand-navy sm:text-sm">How do I cancel my subscription?</h3>
              <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-brand-navy/60 leading-relaxed">
                Go to dashboard settings → billing. You'll keep access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-[13px] font-semibold text-brand-navy sm:text-sm">How do I reset my password?</h3>
              <p className="mt-1 sm:mt-1.5 text-[13px] sm:text-sm text-brand-navy/60 leading-relaxed">
                Visit the{" "}
                <Link href="/auth/forgot-password" className="text-brand-magenta hover:underline">forgot password page</Link> and enter your email.
              </p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="mt-8 sm:mt-12 text-center rounded-xl sm:rounded-2xl border border-brand-purple/10 bg-gradient-to-br from-white to-brand-purple/5 p-6 sm:p-8">
          <h2 className="text-lg font-bold text-brand-navy sm:text-xl">Still need help?</h2>
          <p className="mt-1.5 sm:mt-2 text-[13px] sm:text-sm text-brand-navy/60">
            We're here to help you create unforgettable watch parties.
          </p>
          <div className="mt-5 sm:mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-r from-brand-magenta to-brand-purple px-5 sm:px-6 py-3 text-[13px] sm:text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md min-h-[48px]"
            >
              Go to Dashboard
            </Link>
            <a
              href="https://github.com/EL-HOUSS-BRAHIM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-brand-navy/10 bg-white/60 px-5 sm:px-6 py-3 text-[13px] sm:text-sm font-semibold text-brand-navy transition-all hover:bg-white hover:shadow-sm min-h-[48px]"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
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

import Link from "next/link"
import { Hero } from "@/components/marketing/hero"
import { FeatureGrid } from "@/components/marketing/feature-grid"
import { MetricStrip } from "@/components/marketing/metric-strip"
import { TestimonialGrid } from "@/components/marketing/testimonial-grid"
import { CallToAction } from "@/components/marketing/call-to-action"

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center space-y-8 px-6">
          {/* Hero Content */}
          <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
              <span className="animate-pulse">✨</span>
              <span>The future of social viewing is here</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Watch
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent"> Together</span>
              <br />
              <span className="text-3xl md:text-5xl text-white/80">Anywhere, Anytime</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 leading-relaxed max-w-3xl">
              Create magical movie nights with friends across the globe. Share your screen, sync your vibes, 
              and turn any video into an unforgettable social experience.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <Link
              href="/auth/register"
              className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex-1 text-center shadow-lg hover:shadow-purple-500/25"
            >
              <span className="relative z-10">Start Your Journey 🚀</span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link
              href="/join"
              className="relative group border-2 border-white/20 hover:border-white/40 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex-1 text-center backdrop-blur-sm hover:bg-white/5"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Join a Party</span>
                <span className="text-xl">🎉</span>
              </span>
            </Link>
          </div>

          {/* Quick Demo */}
          <div className="mt-8">
            <p className="text-white/50 text-sm mb-2">Try it instantly:</p>
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="px-3 py-1 bg-white/10 rounded-full text-white/70">Party Code:</span>
              <code className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-lg font-mono tracking-wider">DEMO123</code>
              <button className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors">
                Join Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <MetricStrip />

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Everything you need for the
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> perfect watch party</span>
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              From instant sync to interactive features, we've built every tool you need to create magical moments with friends.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-16">
            Start watching in <span className="text-purple-400">3 simple steps</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create or Join",
                description: "Start a new party or join friends with a simple code",
                icon: "🎬",
                color: "from-purple-500 to-pink-500"
              },
              {
                step: "02", 
                title: "Add Your Content",
                description: "Upload videos, paste URLs, or connect your cloud storage",
                icon: "📱",
                color: "from-blue-500 to-cyan-500"
              },
              {
                step: "03",
                title: "Watch Together",
                description: "Enjoy perfect sync, live chat, and interactive features",
                icon: "✨",
                color: "from-green-500 to-teal-500"
              }
            ].map((item, index) => (
              <div key={index} className="relative group">
                <div className="relative z-10 bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-2xl mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  <div className="text-sm font-mono text-purple-400 mb-2">{item.step}</div>
                  <h3 className="text-xl font-semibold text-white mb-4">{item.title}</h3>
                  <p className="text-white/70">{item.description}</p>
                </div>
                
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-8 h-0.5 bg-gradient-to-r from-white/20 to-transparent transform translate-x-full -translate-y-1/2 z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <TestimonialGrid />

      {/* Interactive Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            See the magic in action
          </h2>
          
          <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 overflow-hidden">
            {/* Simulated Interface */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-4 text-white/50 text-sm">watch-party.app/party/DEMO123</div>
              </div>
              
              <div className="bg-black/20 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Friday Night Movies 🍿</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-400 text-sm">LIVE</span>
                  </div>
                </div>
                
                <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-4xl mb-2">▶️</div>
                    <p className="text-white/70">Video playing in perfect sync</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-white/60">👥 4 watching</span>
                    <span className="text-white/60">💬 12 messages</span>
                  </div>
                  <div className="flex gap-2">
                    {["😂", "❤️", "🔥", "👏"].map((emoji, i) => (
                      <button key={i} className="hover:scale-125 transition-transform">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-white/60 text-sm">
                Real-time sync • Live reactions • Voice & video chat • And so much more
              </p>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <CallToAction />

      {/* Footer CTA */}
      <section className="py-16 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-cyan-600/20 border border-purple-500/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to revolutionize your movie nights?
            </h3>
            <p className="text-white/70 mb-6">
              Join thousands of friends already creating magical moments together.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/auth/register"
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200"
              >
                Get Started Free ✨
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-3 text-white border border-white/20 rounded-xl font-medium hover:bg-white/5 transition-all duration-200"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

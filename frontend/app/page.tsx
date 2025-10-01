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
      <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '0.5s' }}></div>
        </div>

        <div className="relative min-h-[92vh] flex flex-col items-center justify-center text-center space-y-10 px-6 py-20">
          {/* Hero Content */}
          <div className="space-y-8 max-w-5xl">
            <div className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-purple-300 bg-purple-500/10 px-5 py-2.5 rounded-full border border-purple-500/30 backdrop-blur-sm shadow-lg shadow-purple-500/10">
              <span className="animate-pulse text-lg">✨</span>
              <span>The Future of Social Viewing</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.1] tracking-tight">
              Watch{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">Together</span>
              <br />
              <span className="text-4xl md:text-6xl text-white/90 font-bold">Anywhere, Anytime</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 leading-relaxed max-w-3xl mx-auto font-medium">
              Create magical movie nights with friends across the globe. Perfect sync, live reactions, 
              and an unforgettable social experience.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 w-full max-w-xl">
            <Link
              href="/auth/register"
              className="relative group overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-5 px-10 rounded-2xl transition-all duration-300 flex-1 text-center text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                Start Your Journey <span className="text-2xl">🚀</span>
              </span>
            </Link>
            <Link
              href="/join"
              className="relative group border-2 border-white/30 hover:border-white/50 text-white font-bold py-5 px-10 rounded-2xl transition-all duration-300 flex-1 text-center text-lg backdrop-blur-sm hover:bg-white/10 hover:-translate-y-1 shadow-lg"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Join a Party</span>
                <span className="text-2xl">🎉</span>
              </span>
            </Link>
          </div>

          {/* Quick Demo */}
          <div className="mt-6">
            <p className="text-white/60 text-base font-semibold mb-3">Try it instantly:</p>
            <div className="inline-flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
              <span className="text-sm font-semibold text-white/70">Party Code:</span>
              <code className="px-4 py-2 bg-purple-500/20 text-purple-300 rounded-xl font-mono text-lg font-bold tracking-wider border border-purple-500/30">DEMO123</code>
              <button className="px-5 py-2 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 transition-all font-semibold border border-blue-500/30 hover:border-blue-500/50">
                Join Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics Strip */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <MetricStrip />
        </div>
      </div>

      {/* Features Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block mb-4 text-sm font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20">
              Features
            </span>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
              Everything you need for the{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">perfect watch party</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/70 max-w-4xl mx-auto leading-relaxed">
              From instant sync to interactive features, we've built every tool you need to create magical moments with friends.
            </p>
          </div>
          <FeatureGrid />
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-6xl mx-auto text-center">
          <span className="inline-block mb-4 text-sm font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-full border border-cyan-500/20">
            How It Works
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-20">
            Start watching in{" "}
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">3 simple steps</span>
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
                <div className="relative z-10 bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-3xl p-10 hover:bg-white/15 hover:border-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-2">
                  <div className={`w-20 h-20 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-3xl mb-8 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {item.icon}
                  </div>
                  <div className="text-base font-bold text-purple-300 mb-3 tracking-wider">{item.step}</div>
                  <h3 className="text-2xl font-black text-white mb-4">{item.title}</h3>
                  <p className="text-white/80 text-lg leading-relaxed">{item.description}</p>
                </div>
                
                {/* Connection line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 right-0 w-12 h-1 bg-gradient-to-r from-purple-500/50 to-transparent transform translate-x-full -translate-y-1/2 z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto">
          <TestimonialGrid />
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-5xl mx-auto text-center">
          <span className="inline-block mb-4 text-sm font-bold uppercase tracking-wider text-pink-400 bg-pink-500/10 px-4 py-2 rounded-full border border-pink-500/20">
            Live Demo
          </span>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-12">
            See the{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">magic</span>
            {" "}in action
          </h2>
          
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-3xl p-10 overflow-hidden shadow-2xl">
            {/* Simulated Interface */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 bg-black/30 px-4 py-3 rounded-xl">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div className="ml-4 text-white/60 text-sm font-mono">watch-party.app/party/DEMO123</div>
              </div>
              
              <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-white/10">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white text-2xl font-bold">Friday Night Movies 🍿</h3>
                  <div className="flex items-center gap-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <span className="text-red-300 text-sm font-bold">LIVE</span>
                  </div>
                </div>
                
                <div className="aspect-video bg-gradient-to-br from-purple-900/60 to-blue-900/60 rounded-2xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">▶️</div>
                    <p className="text-white/80 text-lg font-semibold">Video playing in perfect sync</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-6">
                    <span className="text-white/70 font-semibold">👥 4 watching</span>
                    <span className="text-white/70 font-semibold">💬 12 messages</span>
                  </div>
                  <div className="flex gap-3">
                    {["😂", "❤️", "🔥", "👏"].map((emoji, i) => (
                      <button key={i} className="text-2xl hover:scale-125 transition-transform bg-white/10 p-2 rounded-lg hover:bg-white/20">
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <p className="text-white/70 text-lg font-semibold">
                Real-time sync • Live reactions • Voice & video chat • And so much more
              </p>
            </div>
            
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <CallToAction />
        </div>
      </div>

      {/* Footer CTA */}
      <section className="py-20 px-6 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-purple-600/20 via-blue-600/20 to-cyan-600/20 border-2 border-purple-500/30 rounded-3xl p-12 shadow-2xl overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-4xl md:text-5xl font-black text-white mb-6">
                Ready to revolutionize your movie nights?
              </h3>
              <p className="text-xl text-white/80 mb-10 font-medium">
                Join thousands of friends already creating magical moments together.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-2xl font-bold text-lg transition-all duration-200 shadow-xl hover:shadow-2xl hover:-translate-y-1"
                >
                  Get Started Free ✨
                </Link>
                <Link
                  href="/pricing"
                  className="px-10 py-4 text-white border-2 border-white/30 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all duration-200 hover:-translate-y-1 backdrop-blur-sm"
                >
                  View Pricing
                </Link>
              </div>
            </div>
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>
    </>
  )
}

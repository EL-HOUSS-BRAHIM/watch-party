import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center space-y-8">
      {/* Hero Section */}
      <div className="space-y-6 max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white">
          Watch Together
        </h1>
        <p className="text-lg md:text-xl text-white/80 leading-relaxed">
          Join friends to watch movies, episodes, and football matches in perfect sync. 
          Share your screen or connect your drive - it's that simple.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link
          href="/auth/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex-1 text-center"
        >
          Login
        </Link>
        <Link
          href="/join"
          className="border border-white/30 hover:border-white/50 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex-1 text-center"
        >
          Join Party
        </Link>
      </div>

      {/* Quick Features */}
      <div className="grid md:grid-cols-3 gap-8 max-w-4xl pt-12">
        <div className="text-center space-y-2">
          <div className="text-2xl">🎬</div>
          <h3 className="font-semibold text-white">Add Movie Links</h3>
          <p className="text-sm text-white/70">Paste any streaming URL and watch together</p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl">☁️</div>
          <h3 className="font-semibold text-white">Connect Your Drive</h3>
          <p className="text-sm text-white/70">Link Google Drive and browse your movies</p>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl">⚡</div>
          <h3 className="font-semibold text-white">Instant Sync</h3>
          <p className="text-sm text-white/70">Everyone stays perfectly in sync</p>
        </div>
      </div>
    </div>
  )
}

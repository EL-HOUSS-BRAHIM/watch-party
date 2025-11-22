export default function Loading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-brand-purple/10 via-transparent to-transparent blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center gap-8 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-brand-purple/20 border-t-brand-purple animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-brand-purple/10 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.5em] text-brand-purple">Priming the ambience engine</p>
          <p className="max-w-sm text-sm font-medium text-brand-navy/60">
            Blending crisp white matinee light with twilight glow…
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-[color:var(--color-text-primary)]">
      <div className="loading-reel" role="presentation" />
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-[0.5em] text-white/65">Priming the ambience engine</p>
        <p className="mt-2 max-w-sm text-sm text-white/75">
          Blending crisp white matinee light with oklch(42% .18 15) twilight glow…
        </p>
      </div>
    </div>
  )
}

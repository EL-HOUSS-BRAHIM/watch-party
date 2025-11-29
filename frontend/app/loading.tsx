export default function Loading() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        {/* Modern minimal spinner */}
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-2 border-brand-purple/10" />
          <div className="absolute inset-0 h-12 w-12 rounded-full border-2 border-transparent border-t-brand-purple animate-spin" />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm font-medium text-brand-navy/80">Loading</p>
          <p className="text-xs text-brand-navy/50">
            Setting up your experience...
          </p>
        </div>
      </div>
    </div>
  )
}

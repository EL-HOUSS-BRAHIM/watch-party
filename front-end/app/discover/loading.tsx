import { Skeleton } from "@/components/ui/skeleton"
import { Compass } from "lucide-react"

export default function DiscoverLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Skeleton className="h-8 w-32 bg-white/20" />
                  <Skeleton className="h-4 w-64 bg-white/20 mt-2" />
                </div>
              </div>
            </div>

            {/* Search and Filters Skeleton */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Skeleton className="h-10 w-full sm:w-64 bg-white/20" />
              <Skeleton className="h-10 w-full sm:w-32 bg-white/20" />
              <Skeleton className="h-10 w-full sm:w-40 bg-white/20" />
            </div>
          </div>

          {/* Stats Skeleton */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="w-5 h-5 bg-white/20" />
                  <Skeleton className="w-12 h-5 bg-white/20" />
                </div>
                <Skeleton className="h-8 w-20 bg-white/20 mb-1" />
                <Skeleton className="h-4 w-16 bg-white/20" />
              </div>
            ))}
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-1">
            <div className="grid grid-cols-4 gap-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-10 bg-white/20" />
              ))}
            </div>
          </div>

          {/* Content Grid Skeleton */}
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Skeleton className="w-6 h-6 bg-white/20" />
                <Skeleton className="h-8 w-48 bg-white/20" />
                <Skeleton className="w-12 h-6 bg-white/20" />
              </div>
              <Skeleton className="h-8 w-20 bg-white/20" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20">
                  <Skeleton className="h-48 w-full bg-white/20" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full bg-white/20" />
                    <Skeleton className="h-4 w-3/4 bg-white/20" />
                    <div className="flex items-center space-x-2">
                      <Skeleton className="w-6 h-6 rounded-full bg-white/20" />
                      <Skeleton className="h-3 w-20 bg-white/20" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-3 w-16 bg-white/20" />
                      <Skeleton className="h-3 w-12 bg-white/20" />
                    </div>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-12 bg-white/20" />
                      <Skeleton className="h-5 w-16 bg-white/20" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

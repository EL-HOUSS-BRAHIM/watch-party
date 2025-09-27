"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Skeleton */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="space-y-3">
            <Skeleton className="h-10 w-80 bg-white/10" />
            <Skeleton className="h-6 w-64 bg-white/10" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-32 bg-white/10" />
            <Skeleton className="h-10 w-36 bg-white/10" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24 bg-white/10" />
                <Skeleton className="h-8 w-8 rounded-lg bg-white/10" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2 bg-white/10" />
                <Skeleton className="h-3 w-20 bg-white/10" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-md border-white/20 p-1 rounded-lg w-fit">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 bg-white/10" />
            ))}
          </div>

          {/* Content Grid Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <Card className="lg:col-span-2 bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-48 bg-white/10" />
                    <Skeleton className="h-4 w-36 bg-white/10" />
                  </div>
                  <Skeleton className="h-8 w-20 bg-white/10" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <Skeleton className="w-20 h-12 rounded-lg bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-48 bg-white/10" />
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-3 w-20 bg-white/10" />
                        <Skeleton className="h-3 w-16 bg-white/10" />
                        <Skeleton className="h-5 w-16 bg-white/10" />
                      </div>
                    </div>
                    <Skeleton className="h-8 w-16 bg-white/10" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sidebar */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <Skeleton className="h-6 w-32 bg-white/10" />
                <Skeleton className="h-4 w-40 bg-white/10" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <Skeleton className="w-8 h-8 rounded-full bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-3 w-full bg-white/10" />
                      <Skeleton className="h-3 w-16 bg-white/10" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6 text-center space-y-4">
                  <Skeleton className="w-16 h-16 rounded-2xl mx-auto bg-white/10" />
                  <Skeleton className="h-6 w-32 mx-auto bg-white/10" />
                  <Skeleton className="h-4 w-48 mx-auto bg-white/10" />
                  <Skeleton className="h-10 w-full bg-white/10" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

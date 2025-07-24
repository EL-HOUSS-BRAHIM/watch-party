import { lazy } from "react"

// Lazy load heavy components
export const LazyAdminDashboard = lazy(() =>
  import("@/components/admin/admin-dashboard").then((module) => ({
    default: module.AdminDashboard,
  })),
)

export const LazyAnalyticsDashboard = lazy(() =>
  import("@/components/admin/analytics-dashboard").then((module) => ({
    default: module.AnalyticsDashboard,
  })),
)

export const LazyVideoPlayer = lazy(() =>
  import("@/components/video/video-player").then((module) => ({
    default: module.VideoPlayer,
  })),
)

export const LazyVideoUploader = lazy(() =>
  import("@/components/video/video-uploader").then((module) => ({
    default: module.VideoUploader,
  })),
)

export const LazyChatInterface = lazy(() =>
  import("@/components/chat/chat-interface").then((module) => ({
    default: module.ChatInterface,
  })),
)

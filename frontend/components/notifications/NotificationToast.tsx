"use client"

import { useState, useEffect } from "react"
import type { Notification } from "@/lib/api-client"

interface NotificationToastProps {
  notification: Notification & { toastId?: string }
  onClose: () => void
  onAction?: () => void
  duration?: number
}

export default function NotificationToast({ 
  notification, 
  onClose, 
  onAction, 
  duration = 5000 
}: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Animate in
    setTimeout(() => setIsVisible(true), 100)

    // Auto-dismiss
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  const notificationType = notification.template_type || notification.type

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "party_invite": return "🎬"
      case "friend_request": return "👋"
      case "message": return "💬"
      case "video_processed": return "📹"
      case "party_started": return "▶️"
      case "system": return "🔔"
      default: return "📢"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "party_invite": return "border-brand-blue bg-brand-blue/10"
      case "friend_request": return "border-brand-cyan bg-brand-cyan/10"
      case "message": return "border-brand-orange bg-brand-orange/10"
      case "video_processed": return "border-brand-purple bg-brand-purple/10"
      case "party_started": return "border-brand-coral bg-brand-coral/10"
      case "system": return "border-gray-500 bg-gray-500/10"
      default: return "border-white/20 bg-white/10"
    }
  }

  return (
    <div
      className={`fixed top-4 right-4 w-80 z-50 transition-all duration-300 ${
        isVisible && !isLeaving
          ? "transform translate-x-0 opacity-100"
          : "transform translate-x-full opacity-0"
      }`}
    >
      <div className={`bg-gray-900 border rounded-lg shadow-lg backdrop-blur-sm ${
        getNotificationColor(notificationType)
      }`}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg">
                {getNotificationIcon(notificationType)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-white mb-1">
                {notification.title}
              </h4>
              <p className="text-white/80 text-sm mb-3 line-clamp-2">
                {notification.content ?? notification.message}
              </p>
              
              {/* Actions */}
              <div className="flex items-center gap-3">
                {onAction && (
                  <button
                    onClick={onAction}
                    className="text-brand-blue-light hover:text-brand-blue-light text-sm font-medium transition-colors"
                  >
                    View
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="text-white/60 hover:text-white/80 text-sm transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="text-white/60 hover:text-white transition-colors flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/10 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all"
            style={{
              animation: `toast-progress ${duration}ms linear`,
              transformOrigin: "left center"
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes toast-progress {
          from {
            transform: scaleX(1);
          }
          to {
            transform: scaleX(0);
          }
        }
      `}</style>
    </div>
  )
}
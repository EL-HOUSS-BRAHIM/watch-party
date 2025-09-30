"use client"

import { useState } from "react"

interface SubscriptionStatusProps {
  subscription?: {
    id: string
    plan: {
      name: string
      price: number
      interval: "month" | "year"
    }
    status: "active" | "canceled" | "past_due" | "unpaid"
    current_period_start: string
    current_period_end: string
    cancel_at_period_end: boolean
  }
  onCancel: () => void
  onReactivate: () => void
}

export default function SubscriptionStatus({ subscription, onCancel, onReactivate }: SubscriptionStatusProps) {
  const [actionLoading, setActionLoading] = useState(false)

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await onCancel()
    } catch (error) {
      console.error("Failed to cancel subscription:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const handleReactivate = async () => {
    setActionLoading(true)
    try {
      await onReactivate()
    } catch (error) {
      console.error("Failed to reactivate subscription:", error)
    } finally {
      setActionLoading(false)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400"
      case "canceled": return "bg-red-500/20 text-red-400"
      case "past_due": return "bg-yellow-500/20 text-yellow-400"
      case "unpaid": return "bg-red-500/20 text-red-400"
      default: return "bg-white/20 text-white/60"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return "✅"
      case "canceled": return "❌"
      case "past_due": return "⚠️"
      case "unpaid": return "💳"
      default: return "❓"
    }
  }

  if (!subscription) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⭐</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Active Subscription</h3>
          <p className="text-white/60 text-sm mb-6">
            Subscribe to unlock premium features and enhanced experience
          </p>
          <a
            href="/dashboard/billing"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            View Plans
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Subscription Status</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
          <span className="mr-1">{getStatusIcon(subscription.status)}</span>
          {subscription.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-white/60">Plan:</span>
          <span className="text-white font-medium">{subscription.plan.name}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/60">Price:</span>
          <span className="text-white font-medium">
            {formatPrice(subscription.plan.price)}/{subscription.plan.interval}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/60">Current Period:</span>
          <span className="text-white font-medium">
            {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-white/60">Next Billing:</span>
          <span className="text-white font-medium">
            {subscription.cancel_at_period_end 
              ? "Canceled (access until " + formatDate(subscription.current_period_end) + ")"
              : formatDate(subscription.current_period_end)
            }
          </span>
        </div>
      </div>

      {/* Status-specific messages */}
      {subscription.status === "past_due" && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <span>⚠️</span>
            <span className="font-medium">Payment Past Due</span>
          </div>
          <p className="text-yellow-400/80 text-sm">
            Your payment is overdue. Please update your payment method to continue your subscription.
          </p>
        </div>
      )}

      {subscription.status === "unpaid" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <span>💳</span>
            <span className="font-medium">Payment Failed</span>
          </div>
          <p className="text-red-400/80 text-sm">
            Your subscription payment failed. Please update your payment method to reactivate your subscription.
          </p>
        </div>
      )}

      {subscription.cancel_at_period_end && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <span>📅</span>
            <span className="font-medium">Subscription Ending</span>
          </div>
          <p className="text-red-400/80 text-sm">
            Your subscription will end on {formatDate(subscription.current_period_end)}. You can reactivate it anytime before then.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {subscription.cancel_at_period_end ? (
          <button
            onClick={handleReactivate}
            disabled={actionLoading}
            className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {actionLoading ? "Processing..." : "Reactivate Subscription"}
          </button>
        ) : (
          <>
            <a
              href="/dashboard/billing"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors text-center"
            >
              Change Plan
            </a>
            <button
              onClick={handleCancel}
              disabled={actionLoading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
            >
              {actionLoading ? "Processing..." : "Cancel"}
            </button>
          </>
        )}
      </div>

      {/* Next billing info */}
      {subscription.status === "active" && !subscription.cancel_at_period_end && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <span>💡</span>
            <span>
              Your next payment of {formatPrice(subscription.plan.price)} will be charged on {formatDate(subscription.current_period_end)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
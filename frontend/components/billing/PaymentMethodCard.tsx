"use client"

import { useState } from "react"

interface PaymentMethodCardProps {
  paymentMethod?: {
    id: string
    type: "card"
    card: {
      brand: string
      last4: string
      exp_month: number
      exp_year: number
    }
    is_default: boolean
  }
  onUpdate: () => void
  onRemove?: () => void
}

export default function PaymentMethodCard({ paymentMethod, onUpdate, onRemove }: PaymentMethodCardProps) {
  const [removing, setRemoving] = useState(false)

  const handleRemove = async () => {
    if (!paymentMethod || !onRemove) return
    
    if (!confirm("Are you sure you want to remove this payment method?")) {
      return
    }

    setRemoving(true)
    try {
      await onRemove()
    } catch (error) {
      console.error("Failed to remove payment method:", error)
    } finally {
      setRemoving(false)
    }
  }

  const getCardIcon = (brand: string) => {
    switch (brand?.toLowerCase()) {
      case "visa": return "💳"
      case "mastercard": return "💳"
      case "amex": return "💳"
      case "discover": return "💳"
      default: return "💳"
    }
  }

  const formatCardBrand = (brand: string) => {
    return brand?.charAt(0).toUpperCase() + brand?.slice(1) || "Card"
  }

  if (!paymentMethod) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💳</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No Payment Method</h3>
          <p className="text-white/60 text-sm mb-6">
            Add a payment method to make purchases and manage subscriptions
          </p>
          <button
            onClick={onUpdate}
            className="px-6 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-medium transition-colors"
          >
            Add Payment Method
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Payment Method</h3>
        {paymentMethod.is_default && (
          <span className="px-2 py-1 bg-green-500/20 text-brand-cyan-light rounded text-xs font-medium">
            Default
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-8 bg-gradient-to-r from-brand-blue to-brand-purple rounded flex items-center justify-center">
          <span className="text-white text-xs font-bold">
            {formatCardBrand(paymentMethod.card.brand).slice(0, 4).toUpperCase()}
          </span>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getCardIcon(paymentMethod.card.brand)}</span>
            <span className="text-white font-medium">
              {formatCardBrand(paymentMethod.card.brand)} •••• {paymentMethod.card.last4}
            </span>
          </div>
          <p className="text-white/60 text-sm">
            Expires {paymentMethod.card.exp_month.toString().padStart(2, '0')}/{paymentMethod.card.exp_year}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onUpdate}
          className="flex-1 px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm font-medium transition-colors"
        >
          Update
        </button>
        
        {onRemove && !paymentMethod.is_default && (
          <button
            onClick={handleRemove}
            disabled={removing}
            className="px-4 py-2 bg-brand-coral hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
          >
            {removing ? "Removing..." : "Remove"}
          </button>
        )}
      </div>

      {/* Security Info */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/60 text-xs">
          <span>🔒</span>
          <span>Your payment information is securely encrypted and processed by Stripe</span>
        </div>
      </div>
    </div>
  )
}
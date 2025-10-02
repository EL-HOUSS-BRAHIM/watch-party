"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import api from "@/lib/api-client"

interface BillingPlan {
  id: string
  name: string
  description: string
  price: number
  interval: "month" | "year"
  features: string[]
  is_popular?: boolean
  stripe_price_id?: string
}

interface Subscription {
  id: string
  plan: BillingPlan
  status: "active" | "canceled" | "past_due" | "unpaid"
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export default function BillingPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<BillingPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null)
  const [billingHistory, setBillingHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      const [plansResponse, subscriptionResponse, historyResponse] = await Promise.all([
        api.get("/billing/plans/"),
        api.get("/billing/subscription/").catch(() => null),
        api.get("/billing/history/").catch(() => ({ results: [] }))
      ])

      setPlans(plansResponse.results || plansResponse || [])
      setCurrentSubscription(subscriptionResponse)
      setBillingHistory(historyResponse.results || historyResponse || [])
    } catch (error) {
      console.error("Failed to load billing data:", error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToPlan = async (planId: string) => {
    setProcessing(planId)
    try {
      const response = await api.post("/billing/subscribe/", { plan_id: planId })
      
      if (response.checkout_url) {
        // Redirect to Stripe Checkout
        window.location.href = response.checkout_url
      } else {
        // Subscription successful
        await loadBillingData()
        alert("Subscription activated successfully!")
      }
    } catch (error) {
      alert("Failed to subscribe: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setProcessing(null)
    }
  }

  const cancelSubscription = async () => {
    if (!currentSubscription) return
    
    if (!confirm("Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.")) {
      return
    }

    try {
      await api.post("/billing/cancel/")
      await loadBillingData()
      alert("Subscription will be canceled at the end of your current billing period.")
    } catch (error) {
      alert("Failed to cancel subscription: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const reactivateSubscription = async () => {
    if (!currentSubscription) return

    try {
      await api.post("/billing/reactivate/")
      await loadBillingData()
      alert("Subscription reactivated successfully!")
    } catch (error) {
      alert("Failed to reactivate subscription: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const updatePaymentMethod = async () => {
    try {
      const response = await api.post("/billing/update-payment-method/")
      if (response.setup_url) {
        window.location.href = response.setup_url
      }
    } catch (error) {
      alert("Failed to update payment method: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await api.get(`/billing/invoice/${invoiceId}/download/`)
      if (response.download_url) {
        window.open(response.download_url, '_blank')
      }
    } catch (error) {
      alert("Failed to download invoice: " + (error instanceof Error ? error.message : "Unknown error"))
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white/60">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* Header */}
      <div className="bg-black/20 border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-white/60 hover:text-white transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
                <p className="text-white/60 text-sm">Manage your subscription and billing information</p>
              </div>
            </div>
            
            {currentSubscription && (
              <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
                currentSubscription.status === "active" 
                  ? "bg-green-500/20 text-brand-cyan-light"
                  : "bg-red-500/20 text-brand-coral-light"
              }`}>
                {currentSubscription.status.replace('_', ' ').toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Current Subscription */}
        {currentSubscription && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-6">Current Subscription</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {currentSubscription.plan.name}
                </h3>
                <p className="text-white/60 mb-4">{currentSubscription.plan.description}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Price:</span>
                    <span className="text-white">
                      {formatPrice(currentSubscription.plan.price)}/{currentSubscription.plan.interval}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Current Period:</span>
                    <span className="text-white">
                      {formatDate(currentSubscription.current_period_start)} - {formatDate(currentSubscription.current_period_end)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Next Billing:</span>
                    <span className="text-white">
                      {currentSubscription.cancel_at_period_end 
                        ? "Canceled" 
                        : formatDate(currentSubscription.current_period_end)
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={updatePaymentMethod}
                  className="w-full px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Update Payment Method
                </button>
                
                {currentSubscription.cancel_at_period_end ? (
                  <button
                    onClick={reactivateSubscription}
                    className="w-full px-4 py-2 bg-brand-cyan hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Reactivate Subscription
                  </button>
                ) : (
                  <button
                    onClick={cancelSubscription}
                    className="w-full px-4 py-2 bg-brand-coral hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">
            {currentSubscription ? "Change Plan" : "Choose Your Plan"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white/5 border rounded-lg p-6 ${
                  plan.is_popular 
                    ? "border-brand-blue ring-2 ring-blue-500/20" 
                    : "border-white/10"
                } ${
                  currentSubscription?.plan.id === plan.id
                    ? "bg-green-500/10 border-brand-cyan"
                    : ""
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-brand-blue text-white px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {currentSubscription?.plan.id === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-brand-cyan text-white px-3 py-1 rounded-full text-xs font-medium">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-white/60 text-sm mb-4">{plan.description}</p>
                  <div className="text-3xl font-bold text-white">
                    {formatPrice(plan.price)}
                    <span className="text-lg text-white/60">/{plan.interval}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/80 text-sm">
                      <span className="text-brand-cyan-light">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => subscribeToPlan(plan.id)}
                  disabled={processing === plan.id || currentSubscription?.plan.id === plan.id}
                  className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentSubscription?.plan.id === plan.id
                      ? "bg-green-600/20 text-brand-cyan-light cursor-not-allowed"
                      : plan.is_popular
                      ? "bg-brand-blue hover:bg-brand-blue-dark text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                  }`}
                >
                  {processing === plan.id 
                    ? "Processing..." 
                    : currentSubscription?.plan.id === plan.id
                    ? "Current Plan"
                    : currentSubscription
                    ? "Change to this Plan"
                    : "Get Started"
                  }
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Billing History */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Billing History</h2>
          
          {billingHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No billing history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 text-white/80 font-medium">Date</th>
                    <th className="text-left py-3 text-white/80 font-medium">Description</th>
                    <th className="text-left py-3 text-white/80 font-medium">Amount</th>
                    <th className="text-left py-3 text-white/80 font-medium">Status</th>
                    <th className="text-left py-3 text-white/80 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-white/5">
                      <td className="py-4 text-white/80 text-sm">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="py-4 text-white/80 text-sm">
                        {invoice.description}
                      </td>
                      <td className="py-4 text-white text-sm font-medium">
                        {formatPrice(invoice.amount)}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "paid"
                            ? "bg-green-500/20 text-brand-cyan-light"
                            : invoice.status === "pending"
                            ? "bg-yellow-500/20 text-brand-orange-light"
                            : "bg-red-500/20 text-brand-coral-light"
                        }`}>
                          {invoice.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        {invoice.status === "paid" && (
                          <button
                            onClick={() => downloadInvoice(invoice.id)}
                            className="text-brand-blue-light hover:text-brand-blue-light text-sm transition-colors"
                          >
                            Download
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Payment Method</h2>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                <span className="text-white/60 text-xs">****</span>
              </div>
              <div>
                <p className="text-white">•••• •••• •••• 4242</p>
                <p className="text-white/60 text-sm">Expires 12/25</p>
              </div>
            </div>
            
            <button
              onClick={updatePaymentMethod}
              className="px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-sm font-medium transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
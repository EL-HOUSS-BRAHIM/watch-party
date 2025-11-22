"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { billingApi } from "@/lib/api-client"

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
        billingApi.getPlans(),
        billingApi.getCurrentSubscription().catch(() => null),
        billingApi.getBillingHistory().catch(() => ({ results: [] }))
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
      const response = await billingApi.subscribe(planId)
      
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
      await billingApi.cancelSubscription()
      await loadBillingData()
      alert("Subscription will be canceled at the end of your current billing period.")
    } catch (error) {
      alert("Failed to cancel subscription: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const reactivateSubscription = async () => {
    if (!currentSubscription) return

    try {
      await billingApi.reactivateSubscription()
      await loadBillingData()
      alert("Subscription reactivated successfully!")
    } catch (error) {
      alert("Failed to reactivate subscription: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const updatePaymentMethod = async () => {
    try {
      const response = await billingApi.updatePaymentMethod()
      if (response.setup_url) {
        window.location.href = response.setup_url
      }
    } catch (error) {
      alert("Failed to update payment method: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  const downloadInvoice = async (invoiceId: string) => {
    try {
      const response = await billingApi.downloadInvoice(invoiceId)
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
      <div className="min-h-screen bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-brand-navy/60">Loading billing information...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-8 border-brand-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="text-brand-navy/60 hover:text-brand-navy transition-colors p-2 hover:bg-white/20 rounded-full"
            >
              ←
            </button>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Billing & Subscription</h1>
              <p className="text-brand-navy/60 text-sm font-medium mt-1">Manage your subscription and billing information</p>
            </div>
          </div>
          
          {currentSubscription && (
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${
              currentSubscription.status === "active" 
                ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
                : "bg-brand-coral/10 text-brand-coral border-brand-coral/30"
            }`}>
              {currentSubscription.status.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Current Subscription */}
        {currentSubscription && (
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2">
              <span className="text-2xl">💳</span> Current Subscription
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-brand-navy mb-2">
                  {currentSubscription.plan.name}
                </h3>
                <p className="text-brand-navy/60 mb-6 font-medium">{currentSubscription.plan.description}</p>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                    <span className="text-brand-navy/60 font-medium">Price</span>
                    <span className="text-brand-navy font-bold">
                      {formatPrice(currentSubscription.plan.price)}/{currentSubscription.plan.interval}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                    <span className="text-brand-navy/60 font-medium">Current Period</span>
                    <span className="text-brand-navy font-bold">
                      {formatDate(currentSubscription.current_period_start)} - {formatDate(currentSubscription.current_period_end)}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 rounded-xl bg-white/40 border border-white/50">
                    <span className="text-brand-navy/60 font-medium">Next Billing</span>
                    <span className="text-brand-navy font-bold">
                      {currentSubscription.cancel_at_period_end 
                        ? "Canceled" 
                        : formatDate(currentSubscription.current_period_end)
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 flex flex-col justify-center">
                <button
                  onClick={updatePaymentMethod}
                  className="w-full px-6 py-4 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-brand-purple/25 hover:-translate-y-0.5"
                >
                  Update Payment Method
                </button>
                
                {currentSubscription.cancel_at_period_end ? (
                  <button
                    onClick={reactivateSubscription}
                    className="w-full px-6 py-4 bg-brand-cyan hover:bg-brand-cyan-dark text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-brand-cyan/25 hover:-translate-y-0.5"
                  >
                    Reactivate Subscription
                  </button>
                ) : (
                  <button
                    onClick={cancelSubscription}
                    className="w-full px-6 py-4 border border-brand-coral/30 bg-brand-coral/10 hover:bg-brand-coral/20 text-brand-coral rounded-xl text-sm font-bold transition-all"
                  >
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing Plans */}
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-xl font-bold text-brand-navy mb-8 flex items-center gap-2">
            <span className="text-2xl">💎</span> {currentSubscription ? "Change Plan" : "Choose Your Plan"}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative glass-panel rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1 ${
                  plan.is_popular 
                    ? "border-brand-magenta/30 ring-2 ring-brand-magenta/10 bg-brand-magenta/5" 
                    : "border-brand-navy/10"
                } ${
                  currentSubscription?.plan.id === plan.id
                    ? "bg-brand-cyan/5 border-brand-cyan/30"
                    : ""
                }`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-brand-magenta to-brand-orange text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wide">
                      Most Popular
                    </span>
                  </div>
                )}
                
                {currentSubscription?.plan.id === plan.id && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-brand-cyan text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg uppercase tracking-wide">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="text-center mb-8 mt-2">
                  <h3 className="text-xl font-bold text-brand-navy mb-2">{plan.name}</h3>
                  <p className="text-brand-navy/60 text-sm mb-6 font-medium min-h-[40px]">{plan.description}</p>
                  <div className="text-4xl font-bold text-brand-navy">
                    {formatPrice(plan.price)}
                    <span className="text-lg text-brand-navy/40 font-medium">/{plan.interval}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3 text-brand-navy/80 text-sm font-medium">
                      <span className="text-brand-cyan font-bold mt-0.5">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => subscribeToPlan(plan.id)}
                  disabled={processing === plan.id || currentSubscription?.plan.id === plan.id}
                  className={`w-full px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                    currentSubscription?.plan.id === plan.id
                      ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 cursor-not-allowed"
                      : plan.is_popular
                      ? "bg-gradient-to-r from-brand-magenta to-brand-orange hover:from-brand-magenta-dark hover:to-brand-orange-dark text-white hover:-translate-y-0.5"
                      : "border border-brand-navy/10 bg-white hover:bg-brand-navy hover:text-white text-brand-navy hover:-translate-y-0.5"
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
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2">
            <span className="text-2xl">📜</span> Billing History
          </h2>
          
          {billingHistory.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border-2 border-dashed border-brand-navy/10 bg-white/20">
              <p className="text-brand-navy/40 font-bold">No billing history available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-brand-navy/10">
                    <th className="text-left py-4 px-4 text-brand-navy/40 font-bold uppercase tracking-wider text-xs">Date</th>
                    <th className="text-left py-4 px-4 text-brand-navy/40 font-bold uppercase tracking-wider text-xs">Description</th>
                    <th className="text-left py-4 px-4 text-brand-navy/40 font-bold uppercase tracking-wider text-xs">Amount</th>
                    <th className="text-left py-4 px-4 text-brand-navy/40 font-bold uppercase tracking-wider text-xs">Status</th>
                    <th className="text-left py-4 px-4 text-brand-navy/40 font-bold uppercase tracking-wider text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {billingHistory.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-brand-navy/5 hover:bg-white/40 transition-colors">
                      <td className="py-4 px-4 text-brand-navy/80 text-sm font-medium">
                        {formatDate(invoice.created_at)}
                      </td>
                      <td className="py-4 px-4 text-brand-navy/80 text-sm font-medium">
                        {invoice.description}
                      </td>
                      <td className="py-4 px-4 text-brand-navy text-sm font-bold">
                        {formatPrice(invoice.amount)}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                          invoice.status === "paid"
                            ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
                            : invoice.status === "pending"
                            ? "bg-brand-orange/10 text-brand-orange border-brand-orange/30"
                            : "bg-brand-coral/10 text-brand-coral border-brand-coral/30"
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {invoice.status === "paid" && (
                          <button
                            onClick={() => downloadInvoice(invoice.id)}
                            className="text-brand-blue hover:text-brand-blue-dark text-sm font-bold transition-colors hover:underline"
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
        <div className="glass-card rounded-3xl p-8">
          <h2 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2">
            <span className="text-2xl">💳</span> Payment Method
          </h2>
          
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/40 border border-white/50">
            <div className="flex items-center gap-4">
              <div className="w-14 h-10 bg-brand-navy/5 rounded-lg flex items-center justify-center border border-brand-navy/10">
                <span className="text-brand-navy/40 text-xs font-bold">****</span>
              </div>
              <div>
                <p className="text-brand-navy font-bold">•••• •••• •••• 4242</p>
                <p className="text-brand-navy/60 text-xs font-bold uppercase tracking-wide mt-0.5">Expires 12/25</p>
              </div>
            </div>
            
            <button
              onClick={updatePaymentMethod}
              className="px-5 py-2.5 bg-white border border-brand-navy/10 hover:bg-brand-navy hover:text-white text-brand-navy rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
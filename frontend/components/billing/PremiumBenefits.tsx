"use client"

import { useState, useEffect } from "react"
import api from "@/lib/api-client"

interface PremiumFeature {
  id: string
  name: string
  description: string
  icon: string
  is_available: boolean
  requires_subscription?: boolean
  requires_purchase?: boolean
}

interface PremiumBenefitsProps {
  userSubscription?: any
  userPurchases?: any[]
}

export default function PremiumBenefits({ userSubscription, userPurchases = [] }: PremiumBenefitsProps) {
  const [features, setFeatures] = useState<PremiumFeature[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPremiumFeatures()
  }, [])

  const loadPremiumFeatures = async () => {
    try {
      // This would normally come from the API
      const mockFeatures: PremiumFeature[] = [
        {
          id: "1",
          name: "HD Video Streaming",
          description: "Stream videos in full HD quality up to 1080p",
          icon: "🎥",
          is_available: !!userSubscription,
          requires_subscription: true
        },
        {
          id: "2",
          name: "Custom Themes",
          description: "Personalize your interface with exclusive themes",
          icon: "🎨",
          is_available: userPurchases.some(p => p.item.category === "cosmetic"),
          requires_purchase: true
        },
        {
          id: "3",
          name: "Priority Support",
          description: "Get faster response times for support requests",
          icon: "⚡",
          is_available: !!userSubscription,
          requires_subscription: true
        },
        {
          id: "4",
          name: "Advanced Party Controls",
          description: "More control options for hosting parties",
          icon: "🎛️",
          is_available: !!userSubscription,
          requires_subscription: true
        },
        {
          id: "5",
          name: "Custom Emoji",
          description: "Upload and use custom emoji in chat",
          icon: "😊",
          is_available: userPurchases.some(p => p.item.name.includes("Emoji")),
          requires_purchase: true
        },
        {
          id: "6",
          name: "Party Recording",
          description: "Record and save your watch parties",
          icon: "📹",
          is_available: !!userSubscription,
          requires_subscription: true
        },
        {
          id: "7",
          name: "Extended Watch History",
          description: "Keep track of more than 50 watched videos",
          icon: "📚",
          is_available: !!userSubscription,
          requires_subscription: true
        },
        {
          id: "8",
          name: "Ad-Free Experience",
          description: "Enjoy Watch Party without any advertisements",
          icon: "🚫",
          is_available: !!userSubscription,
          requires_subscription: true
        }
      ]
      
      setFeatures(mockFeatures)
    } catch (error) {
      console.error("Failed to load premium features:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Premium Features</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <div
            key={feature.id}
            className={`p-4 rounded-lg border transition-all ${
              feature.is_available
                ? "bg-green-500/10 border-green-500/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                feature.is_available ? "bg-green-500/20" : "bg-white/10"
              }`}>
                <span className="text-xl">{feature.icon}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`font-medium ${
                    feature.is_available ? "text-white" : "text-white/60"
                  }`}>
                    {feature.name}
                  </h4>
                  {feature.is_available && (
                    <span className="text-green-400 text-sm">✓</span>
                  )}
                </div>
                
                <p className={`text-sm ${
                  feature.is_available ? "text-white/80" : "text-white/50"
                }`}>
                  {feature.description}
                </p>
                
                {!feature.is_available && (
                  <div className="mt-2">
                    {feature.requires_subscription && (
                      <span className="inline-block px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">
                        Requires Subscription
                      </span>
                    )}
                    {feature.requires_purchase && (
                      <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-400 rounded text-xs">
                        Available in Store
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="text-center">
          {!userSubscription ? (
            <div>
              <p className="text-white/60 text-sm mb-4">
                Unlock all premium features with a subscription
              </p>
              <a
                href="/dashboard/billing"
                className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                View Subscription Plans
              </a>
            </div>
          ) : (
            <div>
              <p className="text-green-400 text-sm mb-2">
                ✓ You have access to all subscription features!
              </p>
              <a
                href="/dashboard/store"
                className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Browse Store Items
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
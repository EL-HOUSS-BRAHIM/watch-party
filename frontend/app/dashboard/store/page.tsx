"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { storeApi } from "@/lib/api-client"

interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  category: "premium" | "cosmetic" | "feature" | "bundle"
  image_url?: string
  features: string[]
  is_featured?: boolean
  discount_percentage?: number
  original_price?: number
}

interface Purchase {
  id: string
  item: StoreItem
  purchase_date: string
  amount_paid: number
  status: "completed" | "pending" | "failed"
}

export default function StorePage() {
  const router = useRouter()
  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  useEffect(() => {
    loadStoreData()
  }, [])

  const loadStoreData = async () => {
    try {
      const [itemsResponse, purchasesResponse] = await Promise.all([
        storeApi.getItems(),
        storeApi.getPurchases().catch(() => ({ results: [] }))
      ])

      setStoreItems(itemsResponse.results || itemsResponse || [])
      setPurchases(purchasesResponse.results || purchasesResponse || [])
    } catch (error) {
      console.error("Failed to load store data:", error)
    } finally {
      setLoading(false)
    }
  }

  const purchaseItem = async (itemId: string) => {
    setPurchasing(itemId)
    try {
      const response = await storeApi.purchaseItem(itemId)
      
      if (response.checkout_url) {
        // Redirect to payment processor
        window.location.href = response.checkout_url
      } else {
        // Purchase successful
        await loadStoreData()
        alert("Purchase completed successfully!")
      }
    } catch (error) {
      alert("Failed to complete purchase: " + (error instanceof Error ? error.message : "Unknown error"))
    } finally {
      setPurchasing(null)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100)
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "premium": return "⭐"
      case "cosmetic": return "🎨"
      case "feature": return "🚀"
      case "bundle": return "📦"
      default: return "🛍️"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "premium": return "bg-brand-orange/10 text-brand-orange border border-brand-orange/30"
      case "cosmetic": return "bg-brand-purple/10 text-brand-purple border border-brand-purple/30"
      case "feature": return "bg-brand-blue/10 text-brand-blue border border-brand-blue/30"
      case "bundle": return "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30"
      default: return "bg-brand-navy/5 text-brand-navy/60 border border-brand-navy/20"
    }
  }

  const isPurchased = (itemId: string) => {
    return purchases.some(purchase => 
      purchase.item.id === itemId && purchase.status === "completed"
    )
  }

  const filteredItems = selectedCategory === "all" 
    ? storeItems 
    : storeItems.filter(item => item.category === selectedCategory)

  const categories = [
    { id: "all", label: "All Items", count: storeItems.length },
    { id: "premium", label: "Premium", count: storeItems.filter(i => i.category === "premium").length },
    { id: "cosmetic", label: "Cosmetics", count: storeItems.filter(i => i.category === "cosmetic").length },
    { id: "feature", label: "Features", count: storeItems.filter(i => i.category === "feature").length },
    { id: "bundle", label: "Bundles", count: storeItems.filter(i => i.category === "bundle").length }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin w-12 h-12 border-4 border-brand-purple border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-brand-navy/60">Loading store...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-neutral via-white to-brand-neutral-light">
      {/* Header */}
      <div className="bg-white/80 border-b border-brand-navy/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/dashboard")}
                className="text-brand-navy/60 hover:text-brand-navy transition-colors"
              >
                ←
              </button>
              <div>
                <h1 className="text-2xl font-bold text-brand-navy">Store</h1>
                <p className="text-brand-navy/60 text-sm">Enhance your Watch Party experience</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push("/dashboard/billing")}
              className="px-4 py-2 bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white rounded-full text-sm font-medium transition-all shadow-lg"
            >
              View Billing
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white/60 border-b border-brand-navy/10 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8 overflow-x-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  selectedCategory === category.id
                    ? "text-brand-purple border-brand-purple"
                    : "text-brand-navy/60 border-transparent hover:text-brand-navy"
                }`}
              >
                <span>{getCategoryIcon(category.id)}</span>
                {category.label}
                {category.count > 0 && (
                  <span className="px-2 py-1 bg-brand-navy/10 rounded-full text-xs font-semibold">
                    {category.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Featured Items */}
        {selectedCategory === "all" && (
          <div className="mb-12">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Featured Items</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {storeItems.filter(item => item.is_featured).slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="relative bg-gradient-to-r from-brand-blue/10 to-brand-purple/10 border border-brand-blue/30 rounded-3xl p-6 overflow-hidden shadow-lg"
                >
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-brand-magenta to-brand-orange text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Featured
                    </span>
                  </div>

                  <div className="flex items-start gap-6">
                    <div className="w-20 h-20 bg-brand-neutral rounded-2xl flex items-center justify-center">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <span className="text-3xl">{getCategoryIcon(item.category)}</span>
                      )}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-brand-navy mb-2">{item.name}</h3>
                      <p className="text-brand-navy/70 text-sm mb-4">{item.description}</p>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-brand-navy">
                          {item.discount_percentage ? (
                            <>
                              <span className="text-brand-cyan">{formatPrice(item.price)}</span>
                              <span className="text-lg text-brand-navy/60 line-through ml-2">
                                {formatPrice(item.original_price || item.price)}
                              </span>
                            </>
                          ) : (
                            formatPrice(item.price)
                          )}
                        </div>
                        
                        <button
                          onClick={() => purchaseItem(item.id)}
                          disabled={purchasing === item.id || isPurchased(item.id)}
                          className={`px-6 py-2 rounded-full text-sm font-medium transition-all shadow-lg ${
                            isPurchased(item.id)
                              ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 cursor-not-allowed"
                              : "bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white"
                          }`}
                        >
                          {purchasing === item.id 
                            ? "Processing..." 
                            : isPurchased(item.id)
                            ? "Owned"
                            : "Purchase"
                          }
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Store Items Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-brand-navy mb-6">
            {selectedCategory === "all" ? "All Items" : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🛍️</div>
              <h3 className="text-xl font-semibold text-brand-navy mb-2">No items found</h3>
              <p className="text-brand-navy/60">
                {selectedCategory === "all" 
                  ? "The store is currently empty. Check back soon for new items!"
                  : `No items available in the ${categories.find(c => c.id === selectedCategory)?.label} category.`
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-brand-navy/10 rounded-3xl p-6 hover:shadow-lg transition-all shadow-[0_18px_45px_rgba(28,28,46,0.08)]"
                >
                  {/* Item Image */}
                  <div className="w-full h-32 bg-brand-neutral rounded-2xl mb-4 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-4xl">{getCategoryIcon(item.category)}</span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                      {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                    </span>
                  </div>

                  {/* Item Info */}
                  <h3 className="font-bold text-brand-navy mb-2">{item.name}</h3>
                  <p className="text-brand-navy/60 text-sm mb-4 line-clamp-2">{item.description}</p>

                  {/* Features */}
                  {item.features.length > 0 && (
                    <ul className="space-y-1 mb-4">
                      {item.features.slice(0, 3).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-brand-navy/80 text-xs">
                          <span className="text-brand-cyan">✓</span>
                          {feature}
                        </li>
                      ))}
                      {item.features.length > 3 && (
                        <li className="text-brand-navy/60 text-xs">
                          +{item.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Price and Purchase */}
                  <div className="flex items-center justify-between">
                    <div>
                      {item.discount_percentage ? (
                        <div>
                          <div className="text-lg font-bold text-brand-cyan">
                            {formatPrice(item.price)}
                          </div>
                          <div className="text-sm text-brand-navy/60 line-through">
                            {formatPrice(item.original_price || item.price)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-lg font-bold text-brand-navy">
                          {formatPrice(item.price)}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => purchaseItem(item.id)}
                      disabled={purchasing === item.id || isPurchased(item.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all shadow-lg ${
                        isPurchased(item.id)
                          ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 cursor-not-allowed"
                          : "bg-gradient-to-r from-brand-purple to-brand-blue hover:from-brand-purple-dark hover:to-brand-blue-dark text-white"
                      }`}
                    >
                      {purchasing === item.id 
                        ? "..."
                        : isPurchased(item.id)
                        ? "Owned"
                        : "Buy"
                      }
                    </button>
                  </div>

                  {/* Discount Badge */}
                  {item.discount_percentage && (
                    <div className="absolute top-2 left-2">
                      <span className="bg-brand-coral text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                        -{item.discount_percentage}%
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase History */}
        {purchases.length > 0 && (
          <div className="bg-white border border-brand-navy/10 rounded-3xl p-6 shadow-[0_18px_45px_rgba(28,28,46,0.08)]">
            <h2 className="text-xl font-bold text-brand-navy mb-6">Purchase History</h2>
            
            <div className="space-y-4">
              {purchases.slice(0, 5).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 bg-brand-neutral rounded-2xl"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                      <span className="text-xl">{getCategoryIcon(purchase.item.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-brand-navy">{purchase.item.name}</h4>
                      <p className="text-brand-navy/60 text-sm">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-medium text-brand-navy">
                      {formatPrice(purchase.amount_paid)}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      purchase.status === "completed"
                        ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/30"
                        : purchase.status === "pending"
                        ? "bg-brand-orange/10 text-brand-orange border-brand-orange/30"
                        : "bg-brand-coral/10 text-brand-coral border-brand-coral/30"
                    }`}>
                      {purchase.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
              
              {purchases.length > 5 && (
                <div className="text-center pt-4">
                  <button className="text-brand-blue-light hover:text-brand-blue-light text-sm transition-colors">
                    View All Purchases ({purchases.length})
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
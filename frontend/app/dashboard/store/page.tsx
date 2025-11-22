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
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-8 border-brand-navy/10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-brand-purple/10 to-brand-blue/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue transition-colors hover:text-brand-blue-dark group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
            </button>
            <div>
              <h1 className="text-3xl font-bold text-brand-navy">Store</h1>
              <p className="text-brand-navy/70 text-sm font-medium">Enhance your Watch Party experience</p>
            </div>
          </div>
          
          <button
            onClick={() => router.push("/dashboard/billing")}
            className="btn-gradient px-6 py-3 text-white rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-brand-purple/25 hover:-translate-y-0.5"
          >
            View Billing
          </button>
        </div>

        {/* Category Filter */}
        <div className="mt-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-bold transition-all duration-300 ${
                selectedCategory === category.id
                  ? "border-brand-purple/30 bg-brand-purple/10 text-brand-purple shadow-lg shadow-brand-purple/5 scale-105"
                  : "border-brand-navy/10 bg-white/40 text-brand-navy/60 hover:border-brand-navy/20 hover:text-brand-navy hover:bg-white/60"
              }`}
            >
              <span>{getCategoryIcon(category.id)}</span>
              {category.label}
              {category.count > 0 && (
                <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedCategory === category.id ? "bg-brand-purple/20 text-brand-purple" : "bg-brand-navy/10 text-brand-navy/60"
                }`}>
                  {category.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-12">
        {/* Featured Items */}
        {selectedCategory === "all" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
              <span className="text-2xl">✨</span> Featured Items
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {storeItems.filter(item => item.is_featured).slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="glass-card relative rounded-3xl p-8 overflow-hidden group hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-brand-purple/20 to-brand-blue/20 rounded-full blur-2xl -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-gradient-to-r from-brand-magenta to-brand-orange text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-lg">
                      Featured
                    </span>
                  </div>

                  <div className="relative z-10 flex items-start gap-6">
                    <div className="w-24 h-24 bg-white/50 rounded-2xl flex items-center justify-center shadow-inner border border-white/50">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      ) : (
                        <span className="text-4xl filter drop-shadow-md">{getCategoryIcon(item.category)}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-2xl font-bold text-brand-navy mb-2">{item.name}</h3>
                      <p className="text-brand-navy/70 text-sm font-medium mb-6 leading-relaxed">{item.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-2xl font-bold text-brand-navy">
                          {item.discount_percentage ? (
                            <div className="flex items-baseline gap-2">
                              <span className="text-brand-cyan">{formatPrice(item.price)}</span>
                              <span className="text-sm text-brand-navy/40 line-through font-medium">
                                {formatPrice(item.original_price || item.price)}
                              </span>
                            </div>
                          ) : (
                            formatPrice(item.price)
                          )}
                        </div>
                        
                        <button
                          onClick={() => purchaseItem(item.id)}
                          disabled={purchasing === item.id || isPurchased(item.id)}
                          className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-lg ${
                            isPurchased(item.id)
                              ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 cursor-not-allowed"
                              : "btn-gradient text-white hover:shadow-brand-purple/25 hover:-translate-y-0.5"
                          }`}
                        >
                          {purchasing === item.id 
                            ? "Processing..." 
                            : isPurchased(item.id)
                            ? "✓ Owned"
                            : "Purchase Now"
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
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-brand-navy flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            {selectedCategory === "all" ? "All Items" : categories.find(c => c.id === selectedCategory)?.label}
          </h2>
          
          {filteredItems.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border-dashed border-2 border-brand-navy/10">
              <div className="text-6xl mb-4 opacity-50">🛍️</div>
              <h3 className="text-xl font-bold text-brand-navy mb-2">No items found</h3>
              <p className="text-brand-navy/60 font-medium">
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
                  className="glass-card group relative rounded-3xl p-6 hover:border-brand-purple/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Discount Badge */}
                  {item.discount_percentage && (
                    <div className="absolute top-4 left-4 z-10">
                      <span className="bg-brand-coral text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-lg">
                        -{item.discount_percentage}%
                      </span>
                    </div>
                  )}

                  {/* Item Image */}
                  <div className="w-full h-40 bg-white/40 rounded-2xl mb-5 flex items-center justify-center border border-white/50 shadow-inner group-hover:scale-[1.02] transition-transform duration-300">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                    ) : (
                      <span className="text-5xl filter drop-shadow-md">{getCategoryIcon(item.category)}</span>
                    )}
                  </div>

                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getCategoryColor(item.category)}`}>
                      {item.category}
                    </span>
                  </div>

                  {/* Item Info */}
                  <h3 className="text-lg font-bold text-brand-navy mb-2 line-clamp-1">{item.name}</h3>
                  <p className="text-brand-navy/60 text-sm font-medium mb-5 line-clamp-2 h-10">{item.description}</p>

                  {/* Features */}
                  {item.features.length > 0 && (
                    <ul className="space-y-2 mb-5 bg-white/30 rounded-xl p-3 border border-white/40">
                      {item.features.slice(0, 2).map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-brand-navy/70 text-xs font-medium">
                          <span className="text-brand-cyan font-bold mt-0.5">✓</span>
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {item.features.length > 2 && (
                        <li className="text-brand-navy/50 text-[10px] font-bold uppercase tracking-wider pl-5">
                          +{item.features.length - 2} more features
                        </li>
                      )}
                    </ul>
                  )}

                  {/* Price and Purchase */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-brand-navy/5">
                    <div>
                      {item.discount_percentage ? (
                        <div>
                          <div className="text-lg font-bold text-brand-cyan">
                            {formatPrice(item.price)}
                          </div>
                          <div className="text-xs text-brand-navy/40 line-through font-bold">
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
                      className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md ${
                        isPurchased(item.id)
                          ? "bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 cursor-not-allowed"
                          : "btn-gradient text-white hover:shadow-brand-purple/25 hover:-translate-y-0.5"
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
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Purchase History */}
        {purchases.length > 0 && (
          <div className="glass-card rounded-3xl p-8">
            <h2 className="text-xl font-bold text-brand-navy mb-6 flex items-center gap-2">
              <span className="text-xl">📜</span> Purchase History
            </h2>
            
            <div className="space-y-3">
              {purchases.slice(0, 5).map((purchase) => (
                <div
                  key={purchase.id}
                  className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/50 hover:bg-white/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/50 rounded-xl flex items-center justify-center shadow-sm border border-white/50">
                      <span className="text-xl">{getCategoryIcon(purchase.item.category)}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-brand-navy">{purchase.item.name}</h4>
                      <p className="text-brand-navy/50 text-xs font-bold uppercase tracking-wider">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-brand-navy">
                      {formatPrice(purchase.amount_paid)}
                    </div>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                      purchase.status === "completed"
                        ? "bg-brand-cyan/10 text-brand-cyan border-brand-cyan/20"
                        : purchase.status === "pending"
                        ? "bg-brand-orange/10 text-brand-orange border-brand-orange/20"
                        : "bg-brand-coral/10 text-brand-coral border-brand-coral/20"
                    }`}>
                      {purchase.status}
                    </span>
                  </div>
                </div>
              ))}
              
              {purchases.length > 5 && (
                <div className="text-center pt-4">
                  <button className="text-brand-blue hover:text-brand-blue-dark text-sm font-bold transition-colors hover:underline">
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
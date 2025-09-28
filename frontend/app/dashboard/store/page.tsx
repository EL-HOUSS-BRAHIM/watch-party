"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

import { formatDistanceToNow, parseISO } from "date-fns"

} from "lucide-react"

  ShoppingCart,
  Star,
  Coins,
  Gem,
  Palette,
  Smile,
  Shield,
  Zap,
  Search,
  Check,
  Plus,
  Loader2,
  Clock,
  Camera,
  CreditCard,
  Package,
  ShoppingBag,
  Banknote
interface StoreItem {}
  id: string
  name: string
  description: string
  category: "themes" | "emotes" | "avatars" | "badges" | "features" | "bundles"
  type: "theme" | "emote_pack" | "avatar_frame" | "title" | "badge" | "premium_feature" | "bundle"
  price: {}
    currency: "points" | "coins" | "gems" | "usd"
    amount: number
  }
  preview_images: string[]
  icon: string
  owned: boolean
  featured: boolean
  new: boolean
  limited_time: boolean
  discount?: {}
    percentage: number
    original_price: number
    ends_at: string
  }
  requirements?: string[]
  bundle_items?: string[]
  rating: {}
    average: number
    count: number
  }
  popularity_rank: number
  release_date: string
  tags: string[]
}

interface UserInventory {}
  themes: Array<{ id: string; name: string; active: boolean }>
  emotes: Array<{ id: string; name: string; pack: string }>
  avatars: Array<{ id: string; name: string; active: boolean }>
  badges: Array<{ id: string; name: string; equipped: boolean }>
  features: Array<{ id: string; name: string; expires_at?: string }>
  currency: {}
    points: number
    coins: number
    gems: number
  }
}

interface CartItem {}
  item: StoreItem
  quantity: number
}

export default function StorePage() {
  const { toast } = useToast()

  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [inventory, setInventory] = useState<UserInventory | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")
  const [priceFilter, setPriceFilter] = useState<string>("all")
  const [showCart, setShowCart] = useState(false)
  const [processingPurchase, setProcessingPurchase] = useState(false)

  const loadStoreData = useCallback(async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const [storeRes, inventoryRes] = await Promise.all([]
        fetch("/api/store/items/", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/users/inventory/", { headers: { Authorization: `Bearer ${token}` } })
      ])

      if (storeRes.ok) {
        const data = await storeRes.json()
        setStoreItems(data.items || [])
      }

      if (inventoryRes.ok) {
        const data = await inventoryRes.json()
        setInventory(data)
      }
    } catch (err) {
      console.error("Failed to load store data:", error)
      toast({title: "Error",
        description: "Failed to load store data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadStoreData()
  }, [loadStoreData])

  const addToCart = (item: StoreItem) => {}
    if (item.owned) {
      toast({title: "Already Owned",
        description: "You already own this item.",
        variant: "destructive",
      })
      return
    }

    setCart(prev => {}
      const existing = prev.find(cartItem => cartItem.item.id === item.id)
      if (existing) {
        return prev.map(cartItem =>
          cartItem.item.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      }
      return [...prev, { item, quantity: 1 }]
    })

    toast({title: "Added to Cart",
      description: `${item.name} has been added to your cart.`,
    })
  }

  const removeFromCart = (itemId: string) => {}
    setCart(prev => prev.filter(cartItem => cartItem.item.id !== itemId))
  }

  const purchaseItem = async (item: StoreItem) => {}
    setProcessingPurchase(true)

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/store/purchase/`, {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({items: [{ item_id: item.id, quantity: 1 }]
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update item as owned
        setStoreItems(prev => 
          prev.map(storeItem => 
            storeItem.id === item.id
              ? { ...storeItem, owned: true }
              : storeItem
          )
        )
        // Update inventory
        if (inventory) {
          setInventory(data.updated_inventory)
        }
        toast({title: "Purchase Successful!",
          description: `You've successfully purchased ${item.name}!`,
        })
      } else {}
        const error = await response.json()
        throw new Error(error.message || "Purchase failed")
      }
    } catch (err) {
      console.error("Purchase error:", error)
      toast({title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to complete purchase.",
        variant: "destructive",
      })
    } finally {
      setProcessingPurchase(false)
    }
  }

  const purchaseCart = async () => {
    if (cart.length === 0) return
    setProcessingPurchase(true)

    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/store/purchase/`, {}
        method: "POST",
        headers: {}
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({items: cart.map(cartItem => ({}
            item_id: cartItem.item.id,
            quantity: cartItem.quantity
          }))
        }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update items as owned
        const purchasedIds = cart.map(item => item.item.id)
        setStoreItems(prev => 
          prev.map(storeItem => 
            purchasedIds.includes(storeItem.id) 
              ? { ...storeItem, owned: true }
              : storeItem
          )
        )
        // Clear cart and update inventory
        setCart([])
        if (inventory) {
          setInventory(data.updated_inventory)
        }
        toast({title: "Purchase Successful!",
          description: `You've successfully purchased ${cart.length} items!`,
        })
        setShowCart(false)
      } else {}
        const error = await response.json()
        throw new Error(error.message || "Purchase failed")
      }
    } catch (err) {
      console.error("Cart purchase error:", error)
      toast({title: "Purchase Failed",
        description: error instanceof Error ? error.message : "Failed to complete purchase.",
        variant: "destructive",
      })
    } finally {
      setProcessingPurchase(false)
    }
  }

  const getCategoryIcon = (category: string) => {}
    switch (category) {
      case "themes":
        return <Palette className="h-4 w-4" />
      case "emotes":
        return <Smile className="h-4 w-4" />
      case "avatars":
        return <Camera className="h-4 w-4" />
      case "badges":
        return <Shield className="h-4 w-4" />
      case "features":
        return <Zap className="h-4 w-4" />
      case "bundles":
        return <Package className="h-4 w-4" />
      default:
        return <ShoppingBag className="h-4 w-4" />
    }
  }

  const getCurrencyIcon = (currency: string) => {}
    switch (currency) {
      case "points":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "coins":
        return <Coins className="h-4 w-4 text-orange-500" />
      case "gems":
        return <Gem className="h-4 w-4 text-purple-500" />
      case "usd":
        return <Banknote className="h-4 w-4 text-green-500" />
      default:
        return <Star className="h-4 w-4" />
    }
  }

  const filteredItems = storeItems.filter(item => {}
    // Search filter
    if (searchQuery.trim()) {}
      const query = searchQuery.toLowerCase()
      if (!item.name.toLowerCase().includes(query) && 
          !item.description.toLowerCase().includes(query) &&
          !item.tags.some(tag => tag.toLowerCase().includes(query))) {}
        return false
      }
    }

    // Category filter
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false
    }

    // Price filter
    if (priceFilter !== "all") {
      const price = item.price.amount
      switch (priceFilter) {
        case "free":
          return price === 0
        case "low":
          return price > 0 && price <= 100
        case "medium":
          return price > 100 && price <= 500
        case "high":
          return price > 500
      }
    }

    return true
  }).sort((a, b) => {}
    switch (sortBy) {
      case "price_low":
        return a.price.amount - b.price.amount
      case "price_high":
        return b.price.amount - a.price.amount
      case "rating":
        return b.rating.average - a.rating.average
      case "popularity":
        return a.popularity_rank - b.popularity_rank
      case "newest":
        return new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
      case "featured":
      default:
        return Number(b.featured) - Number(a.featured)
    }
  })

  const getCartTotal = () => {}
    return cart.reduce((total, cartItem) => {}
      return total + (cartItem.item.price.amount * cartItem.quantity)
    }, 0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading store...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ShoppingCart className="h-8 w-8" />
              Store
            </h1>
            <p className="text-gray-600 mt-2">Customize your watch party experience</p>
          </div>
          <div className="flex items-center gap-4">
            {/* Currency Display */}
            {inventory && (
              <div className="flex items-center gap-4 bg-gray-50 rounded-lg px-4 py-2">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-medium">{inventory.currency.points.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Coins className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">{inventory.currency.coins.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Gem className="h-4 w-4 text-purple-500" />
                  <span className="font-medium">{inventory.currency.gems.toLocaleString()}</span>
                </div>
              </div>
            )}
            {/* Cart Button */}
            <Button
              variant="outline"
              onClick={() => setShowCart(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Cart
              {cart.length > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="store" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="store">Store</TabsTrigger>
            <TabsTrigger value="inventory">My Items</TabsTrigger>
          </TabsList>

          <TabsContent value="store" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search items..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Filter controls */}
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="themes">Themes</SelectItem>
                        <SelectItem value="emotes">Emotes</SelectItem>
                        <SelectItem value="avatars">Avatars</SelectItem>
                        <SelectItem value="badges">Badges</SelectItem>
                        <SelectItem value="features">Features</SelectItem>
                        <SelectItem value="bundles">Bundles</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Prices</SelectItem>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="low">1-100</SelectItem>
                        <SelectItem value="medium">101-500</SelectItem>
                        <SelectItem value="high">500+</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="featured">Featured</SelectItem>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="popularity">Popular</SelectItem>
                        <SelectItem value="rating">Top Rated</SelectItem>
                        <SelectItem value="price_low">Price: Low</SelectItem>
                        <SelectItem value="price_high">Price: High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Featured Items */}
            {filteredItems.some(item => item.featured) && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Featured Items
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredItems.filter(item => item.featured).slice(0, 3).map((item) => (
                    <Card key={item.id} className="border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-lg mb-2">{item.name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-yellow-500 text-white">
                                <Star className="h-3 w-3 mr-1" />
                                Featured
                              </Badge>
                              {item.new && (
                                <Badge className="bg-green-500 text-white">New</Badge>
                              )}
                              {item.limited_time && (
                                <Badge className="bg-red-500 text-white">
                                  <Clock className="h-3 w-3 mr-1" />
                                  Limited
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              {getCurrencyIcon(item.price.currency)}
                              <span className="font-bold text-lg">{item.price.amount.toLocaleString()}</span>
                            </div>
                            {item.discount && (
                              <div className="text-sm text-gray-500 line-through">
                                {item.discount.original_price.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3 text-yellow-500" />
                              <span>{item.rating.average.toFixed(1)}</span>
                            </div>
                            <span>•</span>
                            <span>{item.rating.count} reviews</span>
                          </div>
                          {item.owned ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Owned
                            </Badge>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => addToCart(item)}
                              >
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => purchaseItem(item)}
                                disabled={processingPurchase}
                              >
                                {processingPurchase ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Buy Now"
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* All Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className={item.featured ? "ring-2 ring-yellow-200" : ""}>
                  <CardContent className="p-4">
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(item.category)}
                        <Badge variant="outline" className="text-xs capitalize">
                          {item.category}
                        </Badge>
                      </div>
                      <h3 className="font-semibold mb-2">{item.name}</h3>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.featured && (
                          <Badge className="bg-yellow-500 text-white text-xs">Featured</Badge>
                        )}
                        {item.new && (
                          <Badge className="bg-green-500 text-white text-xs">New</Badge>
                        )}
                        {item.limited_time && (
                          <Badge className="bg-red-500 text-white text-xs">Limited</Badge>
                        )}
                        {item.discount && (
                          <Badge className="bg-orange-500 text-white text-xs">
                            -{item.discount.percentage}%
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1">
                          {getCurrencyIcon(item.price.currency)}
                          <span className="font-bold">{item.price.amount.toLocaleString()}</span>
                          {item.discount && (
                            <span className="text-sm text-gray-500 line-through ml-1">
                              {item.discount.original_price.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span>{item.rating.average.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    {item.owned ? (
                      <Badge className="w-full justify-center bg-green-100 text-green-800 py-2">
                        <Check className="h-3 w-3 mr-1" />
                        Owned
                      </Badge>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToCart(item)}
                          className="flex-1"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => purchaseItem(item)}
                          disabled={processingPurchase}
                          className="flex-1"
                        >
                          Buy
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filters to find what you're looking for.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            {inventory && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="h-5 w-5" />
                      Themes ({inventory.themes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {inventory.themes.length === 0 ? (
                        <p className="text-gray-600 text-sm">No themes owned</p>
                      ) : (
                        inventory.themes.map((theme) => (
                          <div key={theme.id} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm">{theme.name}</span>
                            {theme.active && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Emotes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smile className="h-5 w-5" />
                      Emotes ({inventory.emotes.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {inventory.emotes.length === 0 ? (
                        <p className="text-gray-600 text-sm">No emotes owned</p>
                      ) : (
                        inventory.emotes.map((emote) => (
                          <div key={emote.id} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm">{emote.name}</span>
                            <Badge variant="outline" className="text-xs">{emote.pack}</Badge>
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Badges */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Badges ({inventory.badges.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {inventory.badges.length === 0 ? (
                        <p className="text-gray-600 text-sm">No badges owned</p>
                      ) : (
                        inventory.badges.map((badge) => (
                          <div key={badge.id} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm">{badge.name}</span>
                            {badge.equipped && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">Equipped</Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Frames */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5" />
                      Avatar Frames ({inventory.avatars.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {inventory.avatars.length === 0 ? (
                        <p className="text-gray-600 text-sm">No avatar frames owned</p>
                      ) : (
                        inventory.avatars.map((avatar) => (
                          <div key={avatar.id} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm">{avatar.name}</span>
                            {avatar.active && (
                              <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Premium Features */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Premium Features ({inventory.features.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {inventory.features.length === 0 ? (
                        <p className="text-gray-600 text-sm">No premium features owned</p>
                      ) : (
                        inventory.features.map((feature) => (
                          <div key={feature.id} className="p-2 rounded border">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{feature.name}</span>
                              <Badge className="bg-purple-100 text-purple-800 text-xs">Premium</Badge>
                            </div>
                            {feature.expires_at && (
                              <p className="text-xs text-gray-600">
                                Expires {formatDistanceToNow(parseISO(feature.expires_at), { addSuffix: true })}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Shopping Cart Modal */}
        {showCart && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Shopping Cart ({cart.length})</h2>
                  <Button variant="ghost" onClick={() => setShowCart(false)}>
                    ×
                  </Button>
                </div>
              </div>

              <div className="p-6">
                {cart.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cart.map((cartItem) => (
                        <div key={cartItem.item.id} className="flex items-center justify-between p-4 border rounded">
                          <div>
                            <h3 className="font-medium">{cartItem.item.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              {getCurrencyIcon(cartItem.item.price.currency)}
                              <span className="text-sm">{cartItem.item.price.amount.toLocaleString()}</span>
                              <span className="text-sm text-gray-600">× {cartItem.quantity}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(cartItem.item.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-medium">Total:</span>
                        <span className="font-bold text-lg">{getCartTotal().toLocaleString()}</span>
                      </div>
                      <Button
                        onClick={purchaseCart}
                        disabled={processingPurchase}
                        className="w-full"
                      >
                        {processingPurchase ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Purchase All
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

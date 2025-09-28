"use client"

import { Eye, Filter, Gift, Search, ShoppingCart, Star, User } from "lucide-react"
import React, { useState, useEffect } from 'react'
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useApiToast } from "@/hooks/use-toast"

interface StoreItem {}
  id: string
  name: string
  description: string
  category: 'themes' | 'avatars' | 'frames' | 'emotes' | 'effects' | 'backgrounds' | 'sounds'
  subcategory?: string
  price: number
  currency: 'coins' | 'premium'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  preview: string
  images: string[]
  isOwned: boolean
  isPurchased: boolean
  isEquipped?: boolean
  isLimited: boolean
  isNew: boolean
  isFeatured: boolean
  discount?: number
  originalPrice?: number
  tags: string[]
  requirements?: {}
    level?: number
    achievements?: string[]
    items?: string[]
  }
  stats?: {}
    purchases: number
    rating: number
    reviews: number
  }
  releaseDate: string
  expiryDate?: string
}

interface UserCurrency {}
  coins: number
  premium: number
}

const CATEGORIES = []
  { id: 'themes', name: 'Themes', icon: Palette },
  { id: 'avatars', name: 'Avatars', icon: Crown },
  { id: 'frames', name: 'Frames', icon: ImageIcon },
  { id: 'emotes', name: 'Emotes', icon: Heart },
  { id: 'effects', name: 'Effects', icon: Sparkles },
  { id: 'backgrounds', name: 'Backgrounds', icon: ImageIcon },
  { id: 'sounds', name: 'Sounds', icon: Music }
]

const RARITIES = []
  { id: 'common', name: 'Common', color: 'bg-gray-500' },
  { id: 'rare', name: 'Rare', color: 'bg-blue-500' },
  { id: 'epic', name: 'Epic', color: 'bg-purple-500' },
  { id: 'legendary', name: 'Legendary', color: 'bg-yellow-500' }
]

export function StoreItems() {
  const [items, setItems] = useState<StoreItem[]>([])
  const [userCurrency, setUserCurrency] = useState<UserCurrency>({ coins: 0, premium: 0 })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('featured')
  const [showOwned, setShowOwned] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const { apiRequest, toastSuccess, toastError } = useApiToast()

  useEffect(() => {
    loadStoreItems()
    loadUserCurrency()
  }, [])

  const loadStoreItems = async () => {
    try {
      const response = await apiRequest(() => fetch('/api/store/items'))
      if (response) {
        setItems(response)
      }
    } catch (err) {
      toastError(error, 'Failed to load store items')
    } finally {
      setLoading(false)
    }
  }

  const loadUserCurrency = async () => {
    try {
      const response = await apiRequest(() => fetch('/api/store/currency'))
      if (response) {
        setUserCurrency(response)
      }
    } catch (err) {
      console.error('Failed to load user currency:', error)
    }
  }

  const handlePurchase = async (itemId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/store/items/${itemId}/purchase`, { method: 'POST' }),
      { successMessage: 'Item purchased successfully!', showSuccess: true }
    )

    if (success) {
      loadStoreItems()
      loadUserCurrency()
      setPreviewDialogOpen(false)
    }
  }

  const handleEquip = async (itemId: string) => {}
    const success = await apiRequest(
      () => fetch(`/api/store/items/${itemId}/equip`, { method: 'POST' }),
      { successMessage: 'Item equipped!', showSuccess: true }
    )

    if (success) {
      loadStoreItems()
    }
  }

  const filteredItems = items.filter(item => {}
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
    const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter
    const matchesOwned = !showOwned || item.isOwned
    return matchesSearch && matchesCategory && matchesRarity && matchesOwned
  }).sort((a, b) => {}
    switch (sortBy) {
      case 'name': return a.name.localeCompare(b.name)
      case 'price-low': return a.price - b.price
      case 'price-high': return b.price - a.price
      case 'rarity': return RARITIES.findIndex(r => r.id === b.rarity) - RARITIES.findIndex(r => r.id === a.rarity)
      case 'newest': return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()
      case 'popular': return (b.stats?.purchases || 0) - (a.stats?.purchases || 0)
      default: // featured
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || 
               (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)
    }
  })

  const getRarityColor = (rarity: string) => {}
    const rarityObj = RARITIES.find(r => r.id === rarity)
    return rarityObj?.color || 'bg-gray-500'
  }

  const canAfford = (item: StoreItem) => {}
    if (item.isOwned) return true
    return item.currency === 'coins' 
      ? userCurrency.coins >= item.price
      : userCurrency.premium >= item.price
  }

  const getDiscountedPrice = (item: StoreItem) => {}
    if (!item.discount) return item.price
    return Math.floor(item.price * (1 - item.discount / 100))
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Currency Display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold">{userCurrency.coins.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">Coins</span>
          </div>
          <div className="flex items-center space-x-2">
            <Crown className="h-5 w-5 text-purple-500" />
            <span className="font-semibold">{userCurrency.premium}</span>
            <span className="text-sm text-muted-foreground">Premium</span>
          </div>
        </div>
        <Button variant="outline">
          <Gift className="h-4 w-4 mr-2" />
          Get More
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                {RARITIES.map(rarity => (
                  <SelectItem key={rarity.id} value={rarity.id}>
                    {rarity.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Popular</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rarity">Rarity</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All Items ({items.length})
          </TabsTrigger>
          <TabsTrigger value="featured">
            Featured ({items.filter(i => i.isFeatured).length})
          </TabsTrigger>
          <TabsTrigger value="new">
            New ({items.filter(i => i.isNew).length})
          </TabsTrigger>
          <TabsTrigger value="limited">
            Limited ({items.filter(i => i.isLimited).length})
          </TabsTrigger>
          <TabsTrigger value="owned">
            Owned ({items.filter(i => i.isOwned).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ItemGrid
            items={filteredItems} 
            onPreview={(item) => {}
              setSelectedItem(item)
              setPreviewDialogOpen(true)
            }}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            canAfford={canAfford}
            getDiscountedPrice={getDiscountedPrice}
            getRarityColor={getRarityColor}
          />
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <ItemGrid
            items={filteredItems.filter(i => i.isFeatured)}
            onPreview={(item) => {}
              setSelectedItem(item)
              setPreviewDialogOpen(true)
            }}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            canAfford={canAfford}
            getDiscountedPrice={getDiscountedPrice}
            getRarityColor={getRarityColor}
          />
        </TabsContent>

        <TabsContent value="new" className="space-y-4">
          <ItemGrid
            items={filteredItems.filter(i => i.isNew)}
            onPreview={(item) => {}
              setSelectedItem(item)
              setPreviewDialogOpen(true)
            }}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            canAfford={canAfford}
            getDiscountedPrice={getDiscountedPrice}
            getRarityColor={getRarityColor}
          />
        </TabsContent>

        <TabsContent value="limited" className="space-y-4">
          <ItemGrid
            items={filteredItems.filter(i => i.isLimited)}
            onPreview={(item) => {}
              setSelectedItem(item)
              setPreviewDialogOpen(true)
            }}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            canAfford={canAfford}
            getDiscountedPrice={getDiscountedPrice}
            getRarityColor={getRarityColor}
          />
        </TabsContent>

        <TabsContent value="owned" className="space-y-4">
          <ItemGrid
            items={filteredItems.filter(i => i.isOwned)}
            onPreview={(item) => {}
              setSelectedItem(item)
              setPreviewDialogOpen(true)
            }}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            canAfford={canAfford}
            getDiscountedPrice={getDiscountedPrice}
            getRarityColor={getRarityColor}
          />
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-2xl">
          {selectedItem && (
            <ItemPreview
              item={selectedItem}
              onPurchase={handlePurchase}
              onEquip={handleEquip}
              canAfford={canAfford(selectedItem)}
              discountedPrice={getDiscountedPrice(selectedItem)}
              getRarityColor={getRarityColor}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ItemGrid({items,
  onPreview,
  onPurchase,
  onEquip,
  canAfford,
  getDiscountedPrice,
  getRarityColor
}: {}
  items: StoreItem[]
  onPreview: (item: StoreItem) => void
  onPurchase: (itemId: string) => void
  onEquip: (itemId: string) => void
  canAfford: (item: StoreItem) => boolean
  getDiscountedPrice: (item: StoreItem) => number
  getRarityColor: (rarity: string) => string
}) {}
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No items found</h3>
          <p className="text-muted-foreground text-center">
            Try adjusting your filters to see more items.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          onPreview={onPreview}
          onPurchase={onPurchase}
          onEquip={onEquip}
          canAfford={canAfford(item)}
          discountedPrice={getDiscountedPrice(item)}
          getRarityColor={getRarityColor}
        />
      ))}
    </div>
  )
}

function ItemCard({item,
  onPreview,
  onPurchase,
  onEquip,
  canAfford,
  discountedPrice,
  getRarityColor
}: {}
  item: StoreItem
  onPreview: (item: StoreItem) => void
  onPurchase: (itemId: string) => void
  onEquip: (itemId: string) => void
  canAfford: boolean
  discountedPrice: number
  getRarityColor: (rarity: string) => string
}) {}
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all">
      {/* Rarity Border */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getRarityColor(item.rarity)}`} />
      {/* Badges */}
      <div className="absolute top-2 right-2 flex flex-col space-y-1">
        {item.isNew && (
          <Badge className="bg-green-500 text-white">NEW</Badge>
        )}
        {item.isFeatured && (
          <Badge className="bg-purple-500 text-white">FEATURED</Badge>
        )}
        {item.isLimited && (
          <Badge className="bg-red-500 text-white">LIMITED</Badge>
        )}
        {item.discount && (
          <Badge className="bg-orange-500 text-white">-{item.discount}%</Badge>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="aspect-square bg-muted rounded-lg mb-3 relative overflow-hidden">
          <img
            src={item.preview} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onPreview(item)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
        <div>
          <h3 className="font-semibold truncate">{item.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {item.description}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className={`text-white ${getRarityColor(item.rarity)}`}>
            {item.rarity}
          </Badge>
          <div className="flex items-center space-x-1">
            {item.currency === 'coins' ? (
              <Coins className="h-4 w-4 text-yellow-500" />
            ) : (
              <Crown className="h-4 w-4 text-purple-500" />
            )}
            <div className="flex items-center space-x-1">
              {item.discount ? (
                <>
                  <span className="text-sm font-semibold">{discountedPrice}</span>
                  <span className="text-xs text-muted-foreground line-through">
                    {item.originalPrice || item.price}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold">{item.price}</span>
              )}
            </div>
          </div>
        </div>

        {item.stats && (
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-1">
              <Star className="h-3 w-3" />
              <span>{item.stats.rating.toFixed(1)}</span>
            </div>
            <span>{item.stats.purchases} purchased</span>
          </div>
        )}

        <div className="space-y-2">
          {item.isOwned ? (
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={item.isEquipped ? "default" : "outline"}
                onClick={() => onEquip(item.id)}
                className="flex-1"
                disabled={item.isEquipped}
              >
                {item.isEquipped ? 'Equipped' : 'Equip'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onPreview(item)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              onClick={() => onPurchase(item.id)}
              disabled={!canAfford}
              className="w-full"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {canAfford ? 'Purchase' : 'Can\'t Afford'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function ItemPreview({item,
  onPurchase,
  onEquip,
  canAfford,
  discountedPrice,
  getRarityColor
}: {}
  item: StoreItem
  onPurchase: (itemId: string) => void
  onEquip: (itemId: string) => void
  canAfford: boolean
  discountedPrice: number
  getRarityColor: (rarity: string) => string
}) {}
  return (
    <div className="space-y-6">
      <DialogHeader>
        <DialogTitle className="flex items-center space-x-2">
          <span>{item.name}</span>
          <Badge variant="outline" className={`text-white ${getRarityColor(item.rarity)}`}>
            {item.rarity}
          </Badge>
        </DialogTitle>
      </DialogHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="aspect-square bg-muted rounded-lg overflow-hidden">
            <img
              src={item.preview} 
              alt={item.name}
              className="w-full h-full object-cover"
            />
          </div>
          {item.images.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto">
              {item.images.slice(1, 4).map((image, index) => (
                <div key={index} className="flex-shrink-0 w-16 h-16 bg-muted rounded overflow-hidden">
                  <Image src="/placeholder.png" alt="" fill className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Price</h3>
            <div className="flex items-center space-x-2">
              {item.currency === 'coins' ? (
                <Coins className="h-5 w-5 text-yellow-500" />
              ) : (
                <Crown className="h-5 w-5 text-purple-500" />
              )}
              <div className="flex items-center space-x-2">
                {item.discount ? (
                  <>
                    <span className="text-lg font-semibold">{discountedPrice}</span>
                    <span className="text-sm text-muted-foreground line-through">
                      {item.originalPrice || item.price}
                    </span>
                    <Badge className="bg-orange-500 text-white">-{item.discount}%</Badge>
                  </>
                ) : (
                  <span className="text-lg font-semibold">{item.price}</span>
                )}
              </div>
            </div>
          </div>

          {item.tags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {item.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {item.stats && (
            <div>
              <h3 className="font-semibold mb-2">Stats</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{item.stats.rating.toFixed(1)}</span>
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Purchases:</span>
                  <div>{item.stats.purchases.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2 pt-4">
            {item.isOwned ? (
              <div className="flex space-x-2">
                <Button
                  onClick={() => onEquip(item.id)}
                  disabled={item.isEquipped}
                  className="flex-1"
                >
                  {item.isEquipped ? 'Equipped' : 'Equip'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => onPurchase(item.id)}
                disabled={!canAfford}
                className="w-full"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {canAfford ? `Purchase for ${discountedPrice}` : 'Can\'t Afford'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

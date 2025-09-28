"use client"

import { Calendar, Package } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/hooks/use-api"
import { formatDistanceToNow } from "date-fns"

interface InventoryItem {}
  id: string
  name: string
  description: string
  type: "avatar" | "theme" | "badge" | "emote" | "decoration"
  rarity: "common" | "rare" | "epic" | "legendary"
  image_url?: string
  is_equipped: boolean
  acquired_at: string
  source: "store" | "achievement" | "gift" | "event"
}

const itemTypeIcons = { avatar: Shirt,
  theme: Palette,
  badge: Crown,
  emote: Gift,
  decoration: Package,
}

const rarityColors = { common: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  rare: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200",
  epic: "bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200",
  legendary: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200",
}

interface UserInventoryProps {}
  userId: string
}

export function UserInventory({ userId }: UserInventoryProps) {}
  const [items, setItems] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedType, setSelectedType] = useState("all")
  const [equippingItem, setEquippingItem] = useState<string | null>(null)
  const api = useApi()

  useEffect(() => {
    fetchInventory()
  }, [userId])

  const fetchInventory = async () => {
    try {
      setIsLoading(true)
      const response = await api.get(`/users/${userId}/inventory/`)
      setItems((response.data as Record<string, unknown>).items || [])
    } catch (err) {
      console.error("Failed to load inventory:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const equipItem = async (itemId: string) => {}
    setEquippingItem(itemId)
    try {
      await api.post(`/users/${userId}/inventory/${itemId}/equip/`)
      setItems(items.map(item => ({}
        ...item,
        is_equipped: item.id === itemId ? true : (item.type === items.find(i => i.id === itemId)?.type ? false : item.is_equipped)
      })))
    } catch (err) {
      console.error("Failed to equip item:", err)
    } finally {
      setEquippingItem(null)
    }
  }

  const unequipItem = async (itemId: string) => {}
    setEquippingItem(itemId)
    try {
      await api.post(`/users/${userId}/inventory/${itemId}/unequip/`)
      setItems(items.map(item => 
        item.id === itemId ? { ...item, is_equipped: false } : item
      ))
    } catch (err) {
      console.error("Failed to unequip item:", err)
    } finally {
      setEquippingItem(null)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading inventory...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const itemTypes = Array.from(new Set(items.map(item => item.type)))
  const filteredItems = selectedType === "all" 
    ? items
    : items.filter(item => item.type === selectedType)

  const equippedItems = items.filter(item => item.is_equipped)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Inventory</h1>
        <div className="flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{items.length}</div>
            <div className="text-sm text-muted-foreground">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{equippedItems.length}</div>
            <div className="text-sm text-muted-foreground">Equipped</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {items.filter(item => item.rarity === &quot;legendary&quot;).length}
            </div>
            <div className="text-sm text-muted-foreground">Legendary</div>
          </div>
        </div>
      </div>

      {/* Currently Equipped */}
      {equippedItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Crown className="w-5 h-5" />
              <span>Currently Equipped</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {equippedItems.map((item) => {}
                const TypeIcon = itemTypeIcons[item.type]
                return (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <TypeIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.type}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inventory Items */}
      <Tabs value={selectedType} onValueChange={setSelectedType}>
        <TabsList className="w-full">
          <TabsTrigger value="all">All Items</TabsTrigger>
          {itemTypes.map((type) => (
            <TabsTrigger key={type} value={type} className="capitalize">
              {type}s
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedType} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredItems.map((item) => {}
              const TypeIcon = itemTypeIcons[item.type]
              return (
                <Card
                  key={item.id}
                  className={`relative ${item.is_equipped ? "ring-2 ring-primary" : ""}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {item.image_url ? (
                          <img
                            src={item.image_url} 
                            alt={item.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <TypeIcon className="w-6 h-6 text-primary" />
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <Badge className={rarityColors[item.rarity]}>
                          {item.rarity}
                        </Badge>
                        {item.is_equipped && (
                          <Badge variant="secondary" className="text-xs">
                            Equipped
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {item.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground capitalize">Type</span>
                        <span className="capitalize">{item.type}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Source</span>
                        <span className="capitalize">{item.source}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>Acquired {formatDistanceToNow(new Date(item.acquired_at))} ago</span>
                      </div>
                      <div className="pt-2">
                        {item.is_equipped ? (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => unequipItem(item.id)}
                            disabled={equippingItem === item.id}
                          >
                            {equippingItem === item.id ? "Unequipping..." : "Unequip"}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => equipItem(item.id)}
                            disabled={equippingItem === item.id}
                          >
                            {equippingItem === item.id ? "Equipping..." : "Equip"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
          {filteredItems.length === 0 && (
            <Card>
              <CardContent className="text-center p-8">
                <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items in this category</h3>
                <p className="text-muted-foreground">
                  Visit the store or complete achievements to earn items!
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

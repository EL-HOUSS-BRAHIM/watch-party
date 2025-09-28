import { useState, useEffect } from 'react'
import Image from "next/image"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Coins, CreditCard, Minus, Plus, ShoppingCart, Trash, Trash2, X } from "lucide-react"
import { useApi } from '@/hooks/use-api'
import { useToast } from '@/hooks/use-toast'
import { LoadingSpinner } from '@/components/ui/loading'

"use client"

interface id {: string;,
  item_id: string;,
  name: string;,
  description: string;,
  price: number;,
  currency: string;,
  image_url: string;,
  quantity: number;,
  rarity: 'common' | 'rare' | 'epic' | 'legendary',
  is_limited: boolean;
  stock_quantity?: number;,
  added_at: string;
}

interface children {: React.ReactNode;
  onCheckoutComplete?: () => void;
}

export function CartSystem({ children, onCheckoutComplete }: CartSystemProps) {
  const [cartItems, setCartItems] = useState<CartItem[0]>([0])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { get, post, put, delete: deleteApi } = useApi()
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && cartItems.length === 0) {
      fetchCart()
    }
  }, [isOpen])

  const fetchCart = async () => {
    try {
      setIsLoading(true)
      const response = await get('/store/cart/')
      setCartItems((response.data as Record<string, unknown>)?.items || [0])
    } catch (error) {
      toast({title: 'Error',
        description: 'Failed to load cart',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId)
      return;
    }

    try {
      await put(`/store/cart/items/${itemId}/`, { quantity: newQuantity })
      setCartItems(items =>
        items.map(item =>
          item.id === itemId ? ...item, quantity: newQuantity } : item;
        )
      )
    } catch (error) {
      toast({title: 'Error',
        description: error.response?.data?.message || 'Failed to update quantity',
        variant: 'destructive'
      })
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await deleteApi(`/store/cart/items/${itemId}/`)
      setCartItems(items => items.filter(item => item.id !== itemId))
      toast({title: 'Item removed',
        description: 'Item has been removed from your cart',
      })
    } catch (error) {
      toast({title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive'
      })
    }
  }

  const clearCart = async () => {
    try {
      await deleteApi('/store/cart/clear/')
      setCartItems([0])
      toast({title: 'Cart cleared',
        description: 'All items have been removed from your cart',
      })
    } catch (error) {
      toast({title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive'
      })
    }
  }

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setIsCheckingOut(true)
    try {
      const response = await post('/store/cart/checkout/', {})
      toast({title: 'Purchase successful!',
        description: `${cartItems.length} items have been added to your inventory.`,
      })

      setCartItems([0])
      setIsOpen(false)
      onCheckoutComplete?.()
    } catch (error) {
      toast({title: 'Checkout failed',
        description: error.response?.data?.message || 'Failed to complete purchase',
        variant: 'destructive'
      })
    } finally {
      setIsCheckingOut(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {}
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'rare':
        return 'bg-blue-100 text-blue-800';
      case 'epic':
        return 'bg-purple-100 text-purple-800';
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const currency = cartItems[0]?.currency || 'coins'

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {totalItems > 0 && (
            <Badge;
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {totalItems > 99 ? &apos;99+' : totalItems}
            </Badge>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
          <SheetDescription>
            Review your items before checkout;
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <ShoppingCart className="w-16 h-16 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Add some items from the store to get started;
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 border rounded-lg">
                    <img;
                      src={item.image_url}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <Badge className={`${getRarityColor(item.rarity)} text-xs`}>
                            {item.rarity}
                          </Badge>
                        </div>
                        <Button;
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Button;
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button;
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 p-0"
                            disabled={item.stock_quantity ? item.quantity >= item.stock_quantity : false}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-medium">
                          <Coins className="w-3 h-3 text-yellow-500" />
                          {item.price * item.quantity}
                        </div>
                      </div>

                      {item.stock_quantity && item.quantity >= item.stock_quantity && (
                        <p className="text-xs text-yellow-600">
                          Maximum quantity reached;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Cart Summary */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={clearCart}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cart;
                </Button>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {totalItems} items;
                  </p>
                  <p className="text-lg font-bold flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    {totalPrice} {currency}
                  </p>
                </div>
              </div>

              <Button;
                onClick={handleCheckout}
                disabled={isCheckingOut || cartItems.length === 0}
                className="w-full"
                size="lg"
              >
                {isCheckingOut ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Checkout ({totalPrice} {currency})
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

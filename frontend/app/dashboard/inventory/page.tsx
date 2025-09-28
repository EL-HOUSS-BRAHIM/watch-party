'use client'

import { useState } from 'react'
import Image from "next/image"
import { GiftIcon, StarIcon, TrophyIcon, ShoppingCartIcon } from '@heroicons/react/24/outline'

interface InventoryItem {
  id: string
  name: string
  type: 'avatar_frame' | 'emoji_pack' | 'theme' | 'badge' | 'achievement'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  acquiredAt: string
  description: string
  image: string
  isEquipped: boolean
  canEquip: boolean
}

const inventoryItems: InventoryItem[] = [
  {
    id: '1',
    name: 'Golden Crown Frame',
    type: 'avatar_frame',
    rarity: 'legendary',
    acquiredAt: '2024-01-15',
    description: 'Exclusive golden crown frame for premium users',
    image: '/placeholder.jpg',
    isEquipped: true,
    canEquip: true
  },
  {
    id: '2',
    name: 'Movie Night Emojis',
    type: 'emoji_pack',
    rarity: 'rare',
    acquiredAt: '2024-02-20',
    description: 'Special emoji pack for movie enthusiasts',
    image: '/placeholder.jpg',
    isEquipped: false,
    canEquip: true
  },
  {
    id: '3',
    name: 'First Party Host',
    type: 'achievement',
    rarity: 'common',
    acquiredAt: '2024-01-10',
    description: 'Achievement for hosting your first watch party',
    image: '/placeholder.jpg',
    isEquipped: false,
    canEquip: false
  },
  {
    id: '4',
    name: 'Neon Glow Theme',
    type: 'theme',
    rarity: 'epic',
    acquiredAt: '2024-03-05',
    description: 'Stunning neon theme for your watch party rooms',
    image: '/placeholder.jpg',
    isEquipped: false,
    canEquip: true
  }
]

const typeLabels = {
  avatar_frame: 'Avatar Frame',
  emoji_pack: 'Emoji Pack',
  theme: 'Theme',
  badge: 'Badge',
  achievement: 'Achievement'
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-orange-500'
}

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-400',
  epic: 'border-purple-400',
  legendary: 'border-yellow-400'
}

export default function InventoryPage() {
  const [filter, setFilter] = useState<'all' | 'equipped' | 'avatar_frame' | 'emoji_pack' | 'theme' | 'achievement'>(&apos;all')
  const [sortBy, setSortBy] = useState<'acquired' | 'rarity' | 'name'>(&apos;acquired')

  const filteredItems = inventoryItems
    .filter(item => {
      if (filter === 'all') return true
      if (filter === 'equipped') return item.isEquipped
      return item.type === filter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 }
          return rarityOrder[b.rarity] - rarityOrder[a.rarity]
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return new Date(b.acquiredAt).getTime() - new Date(a.acquiredAt).getTime()
      }
    })

  const toggleEquip = (id: string) => {
    // In real app, call API to equip/unequip item
    console.log('Toggling equip for item:', id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <GiftIcon className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">My Inventory</h1>
          </div>
          <p className="text-white/70 text-lg">
            Manage your collection of items, themes, and achievements
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All Items' },
              { key: 'equipped', label: 'Equipped' },
              { key: 'avatar_frame', label: 'Frames' },
              { key: 'emoji_pack', label: 'Emojis' },
              { key: 'theme', label: 'Themes' },
              { key: 'achievement', label: 'Achievements' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as Record<string, unknown>)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === key
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as Record<string, unknown>)}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-purple-400"
          >
            <option value="acquired">Recently Acquired</option>
            <option value="rarity">Rarity</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>

        {/* Inventory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className={`bg-white/10 backdrop-blur-sm rounded-lg border-2 overflow-hidden transition-all hover:scale-105 ${
                item.isEquipped
                  ? `${rarityBorders[item.rarity]} shadow-lg`
                  : 'border-white/20'
              }`}
            >
              {/* Item Header */}
              <div className={`p-4 bg-gradient-to-r ${rarityColors[item.rarity]} relative`}>
                <div className="aspect-square bg-black/30 rounded-lg flex items-center justify-center mb-2">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-black/80 text-center">
                  {item.rarity}
                </div>
                
                {/* Equipped Badge */}
                {item.isEquipped && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    EQUIPPED
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4">
                <div className="mb-2">
                  <span className="text-xs text-purple-400 font-medium">
                    {typeLabels[item.type]}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">
                  {item.name}
                </h3>
                <p className="text-white/70 text-sm mb-4 line-clamp-2">
                  {item.description}
                </p>

                {/* Acquired Date */}
                <div className="text-xs text-white/50 mb-4">
                  Acquired {new Date(item.acquiredAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                {item.canEquip ? (
                  <button
                    onClick={() => toggleEquip(item.id)}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-all ${
                      item.isEquipped
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {item.isEquipped ? 'Unequip' : 'Equip'}
                  </button>
                ) : (
                  <div className="w-full py-2 px-4 rounded-lg bg-white/10 text-white/50 text-center text-sm">
                    Achievement
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <GiftIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg mb-4">
              No items found in this category.
            </p>
            <p className="text-white/40">
              Visit the store to get new items and customize your experience!
            </p>
            <button className="mt-6 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2">
              <ShoppingCartIcon className="w-5 h-5" />
              Visit Store
            </button>
          </div>
        )}

        {/* Inventory Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {inventoryItems.length}
            </div>
            <div className="text-white/70">Total Items</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {inventoryItems.filter(i => i.isEquipped).length}
            </div>
            <div className="text-white/70">Equipped</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {inventoryItems.filter(i => i.rarity === &apos;legendary' || i.rarity === 'epic').length}
            </div>
            <div className="text-white/70">Rare Items</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {inventoryItems.filter(i => i.type === &apos;achievement').length}
            </div>
            <div className="text-white/70">Achievements</div>
          </div>
        </div>
      </div>
    </div>
  )
}

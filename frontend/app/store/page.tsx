'use client'

import { useState } from 'react'
import { ShoppingCartIcon, StarIcon, FunnelIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface StoreItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  rating: number
  reviews: number
  image: string
  isPremium: boolean
  isOwned: boolean
}

const storeItems: StoreItem[] = [
  {
    id: '1',
    name: 'Premium Avatar Frames',
    description: 'Exclusive animated frames for your profile avatar',
    price: 299,
    category: 'Avatar',
    rating: 4.8,
    reviews: 1250,
    image: '/placeholder.jpg',
    isPremium: true,
    isOwned: false
  },
  {
    id: '2',
    name: 'Custom Emoji Pack',
    description: 'Unique emoji reactions for watch parties',
    price: 199,
    category: 'Emojis',
    rating: 4.9,
    reviews: 890,
    image: '/placeholder.jpg',
    isPremium: false,
    isOwned: false
  },
  {
    id: '3',
    name: 'Party Themes Bundle',
    description: 'Beautiful themes for your watch party rooms',
    price: 499,
    category: 'Themes',
    rating: 4.7,
    reviews: 567,
    image: '/placeholder.jpg',
    isPremium: true,
    isOwned: false
  },
  {
    id: '4',
    name: 'Achievement Badges',
    description: 'Special badges to showcase your accomplishments',
    price: 149,
    category: 'Badges',
    rating: 4.6,
    reviews: 234,
    image: '/placeholder.jpg',
    isPremium: false,
    isOwned: true
  }
]

const categories = ['All', 'Avatar', 'Emojis', 'Themes', 'Badges', 'Premium']

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)

  const filteredItems = storeItems.filter(item => {
    if (selectedCategory === 'All') return true
    if (selectedCategory === 'Premium') return item.isPremium
    return item.category === selectedCategory
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'rating':
        return b.rating - a.rating
      default:
        return b.reviews - a.reviews
    }
  })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < Math.floor(rating) ? (
        <StarSolidIcon key={i} className="w-4 h-4 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="w-4 h-4 text-gray-400" />
      )
    ))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              Premium Store
            </span>
          </h1>
          <p className="text-white/70 text-lg">
            Enhance your WatchParty experience with exclusive items
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
                      : 'bg-white/10 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
              >
                <FunnelIcon className="w-4 h-4" />
                Filters
              </button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden hover:border-yellow-400/50 transition-all group"
            >
              {/* Item Image */}
              <div className="relative aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.isPremium && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-2 py-1 rounded-full text-xs font-bold">
                    PREMIUM
                  </div>
                )}
                {item.isOwned && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    OWNED
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 group-hover:text-yellow-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {renderStars(item.rating)}
                  </div>
                  <span className="text-sm text-white/70">
                    {item.rating} ({item.reviews})
                  </span>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between">
                  <div className="text-xl font-bold text-yellow-400">
                    {item.price} coins
                  </div>
                  <button
                    disabled={item.isOwned}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      item.isOwned
                        ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105'
                    }`}
                  >
                    {item.isOwned ? (
                      'Owned'
                    ) : (
                      <>
                        <ShoppingCartIcon className="w-4 h-4" />
                        Buy
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-white/50 text-lg">
              No items found in this category.
            </p>
          </div>
        )}

        {/* Coin Balance */}
        <div className="fixed bottom-6 right-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-6 py-3 rounded-full font-bold shadow-lg">
          💰 1,250 coins
        </div>
      </div>
    </div>
  )
}

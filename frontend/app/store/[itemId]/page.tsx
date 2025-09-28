"use client"

import { Heart, Share, ShoppingCart, Star } from "lucide-react"
import { useParams } from 'next/navigation'
import Image from "next/image"
import { useState } from 'react'
import { StarIcon, ShoppingCartIcon, HeartIcon, ShareIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface StoreItemDetail {}
  id: string
  name: string
  description: string
  longDescription: string
  price: number
  category: string
  rating: number
  reviews: number
  images: string[]
  isPremium: boolean
  isOwned: boolean
  features: string[]
  compatibility: string[]
}

// Mock data - in real app, fetch based on params.itemId
const itemDetail: StoreItemDetail = { id: '1',
  name: 'Premium Avatar Frames',
  description: 'Exclusive animated frames for your profile avatar',
  longDescription: 'Transform your profile with these stunning animated avatar frames. Each frame features smooth animations, premium effects, and exclusive designs that make your profile stand out in watch parties and across the platform.',
  price: 299,
  category: 'Avatar',
  rating: 4.8,
  reviews: 1250,
  images: ['/placeholder.jpg', '/placeholder.jpg', '/placeholder.jpg'],
  isPremium: true,
  isOwned: false,
  features: []
    'Smooth 60fps animations',
    'Multiple color variants',
    'Works in all party rooms',
    'Exclusive premium designs',
    'Auto-sync across devices'
  ],
  compatibility: ['Web Browser', 'Mobile App', 'Desktop App']
}

export default function StoreItemPage() {
  const params = useParams()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorited, setIsFavorited] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  const renderStars = (rating: number) => {}
    return Array.from({ length: 5 }, (_, i) => (
      i < Math.floor(rating) ? (
        <StarSolidIcon key={i} className="w-5 h-5 text-yellow-400" />
      ) : (
        <StarIcon key={i} className="w-5 h-5 text-gray-400" />
      )
    ))
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <span className="text-white/50">Store</span>
          <span className="text-white/50 mx-2">/</span>
          <span className="text-white/50">{itemDetail.category}</span>
          <span className="text-white/50 mx-2">/</span>
          <span className="text-white">{itemDetail.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg overflow-hidden">
              <img
                src={itemDetail.images[selectedImage]}
                alt={itemDetail.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Image Thumbnails */}
            <div className="flex gap-2">
              {itemDetail.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square w-20 rounded-lg overflow-hidden border-2 transition-all ${}
                    selectedImage === index
                      ? 'border-yellow-400'
                      : 'border-white/20 hover:border-white/40'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${itemDetail.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Item Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{itemDetail.name}</h1>
                {itemDetail.isPremium && (
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    PREMIUM
                  </span>
                )}
                {itemDetail.isOwned && (
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    OWNED
                  </span>
                )}
              </div>
              <p className="text-white/70 text-lg">{itemDetail.description}</p>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {renderStars(itemDetail.rating)}
                </div>
                <span className="font-semibold">{itemDetail.rating}</span>
              </div>
              <span className="text-white/70">
                ({itemDetail.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="text-3xl font-bold text-yellow-400">
              {itemDetail.price} coins
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                disabled={itemDetail.isOwned}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 rounded-lg font-bold text-lg transition-all ${}
                  itemDetail.isOwned
                    ? 'bg-green-500/20 text-green-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:scale-105'
                }`}
              >
                {itemDetail.isOwned ? (
                  'Already Owned'
                ) : (
                  <>
                    <ShoppingCartIcon className="w-5 h-5" />
                    Purchase Now
                  </>
                )}
              </button>
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className="p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {isFavorited ? (
                  <HeartSolidIcon className="w-6 h-6 text-red-500" />
                ) : (
                  <HeartIcon className="w-6 h-6" />
                )}
              </button>
              <button className="p-4 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
                <ShareIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-xl font-bold mb-4">Features</h3>
              <ul className="space-y-2">
                {itemDetail.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Compatibility */}
            <div>
              <h3 className="text-xl font-bold mb-4">Compatibility</h3>
              <div className="flex flex-wrap gap-2">
                {itemDetail.compatibility.map((platform, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Description</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <p className="text-white/80 leading-relaxed">
              {showFullDescription ? itemDetail.longDescription : itemDetail.longDescription.substring(0, 200) + '...'}
            </p>
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-yellow-400 hover:text-yellow-300 mt-4 font-medium"
            >
              {showFullDescription ? 'Show Less' : 'Read More'}
            </button>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Reviews</h2>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <p className="text-white/70">
              Reviews feature coming soon! Check back later to see what other users think.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

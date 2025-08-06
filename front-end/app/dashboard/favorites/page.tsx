'use client'

import { useState } from 'react'
import { HeartIcon, PlayIcon, StarIcon, CalendarIcon, ClockIcon, TrashIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid'

interface FavoriteItem {
  id: string
  title: string
  type: 'movie' | 'show' | 'video' | 'party'
  genre?: string
  rating?: number
  duration?: string
  addedAt: string
  thumbnail: string
  description: string
  year?: number
  host?: string
}

const favorites: FavoriteItem[] = [
  {
    id: '1',
    title: 'Inception',
    type: 'movie',
    genre: 'Sci-Fi',
    rating: 8.8,
    duration: '148 min',
    addedAt: '2024-01-15',
    thumbnail: '/placeholder.jpg',
    description: 'A thief who steals corporate secrets through dream-sharing technology...',
    year: 2010
  },
  {
    id: '2',
    title: 'Horror Movie Night',
    type: 'party',
    addedAt: '2024-02-20',
    thumbnail: '/placeholder.jpg',
    description: 'Amazing horror movie marathon with great friends',
    host: 'MovieMaster2024'
  },
  {
    id: '3',
    title: 'Breaking Bad',
    type: 'show',
    genre: 'Crime',
    rating: 9.5,
    duration: '5 seasons',
    addedAt: '2024-03-10',
    thumbnail: '/placeholder.jpg',
    description: 'A high school chemistry teacher turned methamphetamine manufacturer...',
    year: 2008
  },
  {
    id: '4',
    title: 'My Travel Vlog',
    type: 'video',
    genre: 'Travel',
    rating: 7.2,
    duration: '25 min',
    addedAt: '2024-03-25',
    thumbnail: '/placeholder.jpg',
    description: 'Personal travel video from last summer vacation...',
    year: 2024
  }
]

const typeColors = {
  movie: 'bg-blue-500',
  show: 'bg-purple-500',
  video: 'bg-green-500',
  party: 'bg-orange-500'
}

const typeLabels = {
  movie: 'Movie',
  show: 'TV Show',
  video: 'Video',
  party: 'Watch Party'
}

export default function DashboardFavoritesPage() {
  const [filter, setFilter] = useState<'all' | 'movie' | 'show' | 'video' | 'party'>('all')
  const [sortBy, setSortBy] = useState<'added' | 'rating' | 'title'>('added')

  const filteredFavorites = favorites
    .filter(item => filter === 'all' || item.type === filter)
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'title':
          return a.title.localeCompare(b.title)
        default:
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
      }
    })

  const removeFavorite = (id: string) => {
    // In real app, call API to remove favorite
    console.log('Removing favorite:', id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <HeartSolidIcon className="w-8 h-8 text-red-500" />
            <h1 className="text-4xl font-bold text-white">My Favorites</h1>
          </div>
          <p className="text-white/70 text-lg">
            Your collection of favorite content and watch parties
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-8">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: 'All' },
              { key: 'movie', label: 'Movies' },
              { key: 'show', label: 'TV Shows' },
              { key: 'video', label: 'Videos' },
              { key: 'party', label: 'Parties' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === key
                    ? 'bg-red-500 text-white'
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
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 bg-white/10 rounded-lg border border-white/20 text-white focus:outline-none focus:border-red-500"
          >
            <option value="added">Recently Added</option>
            <option value="rating">Highest Rated</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map(item => (
            <div
              key={item.id}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 overflow-hidden hover:border-red-500/50 transition-all group"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gradient-to-br from-purple-500/20 to-blue-500/20">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className={`absolute top-2 left-2 ${typeColors[item.type]} text-white px-2 py-1 rounded-full text-xs font-bold`}>
                  {typeLabels[item.type]}
                </div>
                <button
                  onClick={() => removeFavorite(item.id)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full hover:bg-red-500 transition-colors"
                >
                  <TrashIcon className="w-4 h-4 text-red-500 hover:text-white" />
                </button>
                
                {/* Play Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="p-4 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                    <PlayIcon className="w-8 h-8" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg group-hover:text-red-400 transition-colors text-white">
                    {item.title}
                  </h3>
                  {item.year && (
                    <span className="text-white/60 text-sm">{item.year}</span>
                  )}
                </div>

                <p className="text-white/70 text-sm mb-3 line-clamp-2">
                  {item.description}
                </p>

                {/* Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span>{item.rating}</span>
                      </div>
                    )}
                    {item.duration && (
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{item.duration}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    {item.genre && (
                      <span className="bg-white/10 px-2 py-1 rounded text-xs">
                        {item.genre}
                      </span>
                    )}
                    {item.host && (
                      <span className="bg-white/10 px-2 py-1 rounded text-xs">
                        by @{item.host}
                      </span>
                    )}
                  </div>
                </div>

                {/* Added Date */}
                <div className="flex items-center gap-2 text-xs text-white/50">
                  <CalendarIcon className="w-3 h-3" />
                  <span>Added {new Date(item.addedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredFavorites.length === 0 && (
          <div className="text-center py-12">
            <HeartIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <p className="text-white/50 text-lg mb-4">
              No favorites found in this category.
            </p>
            <p className="text-white/40">
              Start adding movies, shows, and parties to your favorites!
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-red-400 mb-2">
              {favorites.length}
            </div>
            <div className="text-white/70">Total Favorites</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {favorites.filter(f => f.type === 'movie').length}
            </div>
            <div className="text-white/70">Movies</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {favorites.filter(f => f.type === 'show').length}
            </div>
            <div className="text-white/70">TV Shows</div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">
              {favorites.filter(f => f.type === 'party').length}
            </div>
            <div className="text-white/70">Parties</div>
          </div>
        </div>
      </div>
    </div>
  )
}

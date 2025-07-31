'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Smile, 
  Image, 
  Gift, 
  TrendingUp,
  Search,
  Heart,
  Laugh,
  ThumbsUp,
  Fire
} from 'lucide-react'

interface EmojiGifPickerProps {
  onEmojiSelect: (emoji: string) => void
  onGifSelect: (gifUrl: string) => void
  isOpen: boolean
  onClose: () => void
}

const EMOJI_CATEGORIES = {
  recent: {
    name: 'Recently Used',
    emojis: ['😂', '❤️', '👍', '🔥', '😍', '😊', '👏', '🎉']
  },
  smileys: {
    name: 'Smileys & People',
    emojis: [
      '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣',
      '😊', '😇', '🙂', '😉', '😍', '🥰', '😘', '😗',
      '☺️', '😚', '😙', '😋', '😛', '😜', '🤪', '😝',
      '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐'
    ]
  },
  hearts: {
    name: 'Hearts',
    emojis: [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
      '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖',
      '💘', '💝', '💟', '♥️', '💯'
    ]
  },
  activities: {
    name: 'Activities',
    emojis: [
      '🎉', '🎊', '🎈', '🎁', '🎀', '🎂', '🎄', '🎃',
      '🎆', '🎇', '🧨', '✨', '🎋', '🎍', '🎎', '🎏',
      '🎐', '🎑', '🧧', '🎗️', '🎟️', '🎫', '🎖️', '🏆'
    ]
  }
}

const TRENDING_GIFS = [
  {
    id: '1',
    url: 'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
    title: 'Excited',
    tags: ['excited', 'happy', 'celebration']
  },
  {
    id: '2', 
    url: 'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
    title: 'Laughing',
    tags: ['laugh', 'funny', 'lol']
  },
  {
    id: '3',
    url: 'https://media.giphy.com/media/26BROrSHlmyzzHf3i/giphy.gif',
    title: 'Applause',
    tags: ['clap', 'applause', 'good job']
  },
  {
    id: '4',
    url: 'https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif',
    title: 'Mind Blown',
    tags: ['wow', 'amazing', 'shocked']
  }
]

export function EmojiGifPicker({ onEmojiSelect, onGifSelect, isOpen, onClose }: EmojiGifPickerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('emojis')
  const [selectedCategory, setSelectedCategory] = useState('recent')

  if (!isOpen) return null

  const filteredEmojis = searchTerm 
    ? Object.values(EMOJI_CATEGORIES).flatMap(cat => cat.emojis)
        .filter(emoji => emoji.includes(searchTerm))
    : EMOJI_CATEGORIES[selectedCategory as keyof typeof EMOJI_CATEGORIES]?.emojis || []

  const filteredGifs = searchTerm
    ? TRENDING_GIFS.filter(gif => 
        gif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        gif.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : TRENDING_GIFS

  return (
    <div className="absolute bottom-12 left-0 z-50">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Reactions</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search emojis or GIFs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mx-4 mb-4">
              <TabsTrigger value="emojis" className="flex items-center gap-2">
                <Smile className="w-4 h-4" />
                Emojis
              </TabsTrigger>
              <TabsTrigger value="gifs" className="flex items-center gap-2">
                <Image className="w-4 h-4" />
                GIFs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="emojis" className="mt-0">
              {!searchTerm && (
                <div className="flex gap-1 px-4 mb-3 overflow-x-auto">
                  {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                    <Button
                      key={key}
                      variant={selectedCategory === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedCategory(key)}
                      className="flex-shrink-0"
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-8 gap-1 p-4 max-h-64 overflow-y-auto">
                {filteredEmojis.map((emoji, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onEmojiSelect(emoji)
                      onClose()
                    }}
                    className="h-10 w-10 p-0 text-lg hover:bg-purple-100 dark:hover:bg-purple-900/20"
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="gifs" className="mt-0">
              <div className="px-4 mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Trending GIFs</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-4 max-h-64 overflow-y-auto">
                {filteredGifs.map((gif) => (
                  <div
                    key={gif.id}
                    className="relative cursor-pointer rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                    onClick={() => {
                      onGifSelect(gif.url)
                      onClose()
                    }}
                  >
                    <img
                      src={gif.url}
                      alt={gif.title}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1">
                      {gif.title}
                    </div>
                  </div>
                ))}
              </div>

              {filteredGifs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Image className="w-8 h-8 mx-auto mb-2" />
                  <p>No GIFs found</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

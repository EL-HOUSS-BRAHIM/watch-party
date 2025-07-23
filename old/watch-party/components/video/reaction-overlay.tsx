'use client'

import { useState, useEffect } from 'react'
import { Heart, ThumbsUp, Fire, Laugh, Wow, Sad } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Reaction {
  id: string
  type: 'heart' | 'thumbsup' | 'fire' | 'laugh' | 'wow' | 'sad'
  x: number
  y: number
  timestamp: number
}

interface ReactionOverlayProps {
  onReaction?: (type: Reaction['type']) => void
  className?: string
}

const reactionIcons = {
  heart: Heart,
  thumbsup: ThumbsUp,
  fire: Fire,
  laugh: Laugh,
  wow: Wow,
  sad: Sad,
}

const reactionColors = {
  heart: 'text-pink-500',
  thumbsup: 'text-primary',
  fire: 'text-orange-500',
  laugh: 'text-yellow-500',
  wow: 'text-purple-500',
  sad: 'text-blue-500',
}

export function ReactionOverlay({ onReaction, className }: ReactionOverlayProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])

  const addReaction = (type: Reaction['type'], event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top

    const newReaction: Reaction = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      x,
      y,
      timestamp: Date.now(),
    }

    setReactions(prev => [...prev, newReaction])
    onReaction?.(type)

    // Remove reaction after animation
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== newReaction.id))
    }, 2000)
  }

  useEffect(() => {
    // Clean up old reactions periodically
    const interval = setInterval(() => {
      const now = Date.now()
      setReactions(prev => prev.filter(r => now - r.timestamp < 2000))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Floating Reactions */}
      {reactions.map(reaction => {
        const Icon = reactionIcons[reaction.type]
        const colorClass = reactionColors[reaction.type]
        
        return (
          <div
            key={reaction.id}
            className="absolute pointer-events-none z-50"
            style={{
              left: reaction.x,
              top: reaction.y,
              animation: 'float-up 2s ease-out forwards',
            }}
          >
            <Icon className={`h-6 w-6 ${colorClass} drop-shadow-lg`} />
          </div>
        )
      })}

      {/* Reaction Buttons */}
      <div className="absolute bottom-20 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {Object.entries(reactionIcons).map(([type, Icon]) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm"
            onClick={(e) => addReaction(type as Reaction['type'], e)}
          >
            <Icon className={`h-4 w-4 ${reactionColors[type as Reaction['type']]}`} />
          </Button>
        ))}
      </div>

      <style jsx>{`
        @keyframes float-up {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-50px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-100px) scale(0.8);
          }
        }
      `}</style>
    </div>
  )
}

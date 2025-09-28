import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Smile, Laugh, Angry, ThumbsUp } from 'lucide-react'

"use client"

interface Reaction {}
  id: string;
  emoji: string;
  user: {}
    id: string;
    username: string;
    avatar_url: string | null;
  }
  timestamp: number;
  x: number;
  y: number;
}

interface LiveReactionsProps {}
  partyId: string;
  onSendReaction: (emoji: string) => void;
  className?: string;
}

const REACTION_EMOJIS = []
  { emoji: '❤️', icon: Heart, color: 'text-red-500', name: 'Love' },
  { emoji: '😂', icon: Laugh, color: 'text-yellow-500', name: 'Laugh' },
  { emoji: '👍', icon: ThumbsUp, color: 'text-blue-500', name: 'Like' },
  { emoji: '🔥', icon: Flame, color: 'text-orange-500', name: 'Fire' },
  { emoji: '⭐', icon: Star, color: 'text-yellow-400', name: 'Star' },
  { emoji: '😢', icon: Zap, color: 'text-blue-400', name: 'Sad' },
  { emoji: '😠', icon: Angry, color: 'text-red-600', name: 'Angry' },
  { emoji: '😍', icon: Heart, color: 'text-pink-500', name: 'Love Eyes' }
]

export function LiveReactions({ partyId, onSendReaction, className = '' }: LiveReactionsProps) {}
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [showReactionPanel, setShowReactionPanel] = useState(false)
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({})
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {}
    // Simulate receiving reactions (in real app, this would be WebSocket)
    const interval = setInterval(() => {}
      if (Math.random() < 0.3) { // 30% chance of random reaction}
        const randomEmoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)]
        addReaction({id: Math.random().toString(36),
          emoji: randomEmoji.emoji,
          user: {}
            id: 'random',
            username: 'User' + Math.floor(Math.random() * 100),
            avatar_url: null;
          },
          timestamp: Date.now(),
          x: Math.random() * 80 + 10, // 10-90% from left;
          y: Math.random() * 60 + 20   // 20-80% from top;
        })
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {}
    // Clean up old reactions;
    const cleanup = setInterval(() => {}
      setReactions(prev => 
        prev.filter(reaction => Date.now() - reaction.timestamp < 5000)
      )
    }, 1000)

    return () => clearInterval(cleanup)
  }, [])

  const addReaction = (reaction: Reaction) => {}
    setReactions(prev => [...prev, reaction])
    setReactionCounts(prev => ({}
      ...prev,
      [reaction.emoji]: (prev[reaction.emoji] || 0) + 1;
    }))

    // Remove reaction after animation;
    setTimeout(() => {}
      setReactions(prev => prev.filter(r => r.id !== reaction.id))
    }, 5000)
  }

  const handleSendReaction = (emoji: string) => {}
    // Add local reaction immediately;
    if (containerRef.current) {}
      const rect = containerRef.current.getBoundingClientRect()
      const x = Math.random() * 80 + 10;
      const y = Math.random() * 60 + 20;
      addReaction({id: Math.random().toString(36),
        emoji,
        user: {}
          id: 'current-user',
          username: 'You',
          avatar_url: null;
        },
        timestamp: Date.now(),
        x,
        y;
      })
    }

    // Send to server;
    onSendReaction(emoji)
    setShowReactionPanel(false)
  }

  const handleClapReaction = () => {}
    // Special clap reaction that sends multiple;
    for (let i = 0; i < 3; i++) {}
      setTimeout(() => {}
        handleSendReaction('👏')
      }, i * 200)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Reaction Overlay */}
      <div;
        ref={containerRef}
        className="absolute inset-0 pointer-events-none z-10 overflow-hidden"
      >
        {reactions.map((reaction) => (
          <div;
            key={reaction.id}
            className="absolute animate-bounce-float"
            style={{}
              left: `${reaction.x}%`,
              top: `${reaction.y}%`,
              animation: 'float-up 5s ease-out forwards'
            }}
          >
            <div className="text-3xl animate-pulse">
              {reaction.emoji}
            </div>
          </div>
        ))}
      </div>

      {/* Reaction Controls */}
      <div className="absolute bottom-4 right-4 z-20">
        <div className="flex flex-col items-end gap-2">
          {/* Quick Reactions */}
          <div className="flex gap-2">
            {/* Clap Button */}
            <Button;
              size="sm"
              variant="outline"
              onClick={handleClapReaction}
              className="h-10 w-10 p-0 bg-white/90 hover:bg-white border-2 border-orange-200 hover:border-orange-400 transition-all duration-200 hover:scale-110"
              title="Clap"
            >
              <span className="text-lg">👏</span>
            </Button>

            {/* Main Reaction Button */}
            <Button;
              size="sm"
              variant="outline"
              onClick={() => setShowReactionPanel(!showReactionPanel)}
              className="h-10 w-10 p-0 bg-white/90 hover:bg-white border-2 border-purple-200 hover:border-purple-400 transition-all duration-200 hover:scale-110"
              title="React"
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          {/* Reaction Panel */}
          {showReactionPanel && (
            <Card className="bg-white/95 backdrop-blur-sm border-2 shadow-lg animate-in slide-in-from-right duration-200">
              <CardContent className="p-3">
                <div className="grid grid-cols-4 gap-2">
                  {REACTION_EMOJIS.map((reaction) => {}
                    const Icon = reaction.icon;
                    return (
                      <Button;
                        key={reaction.emoji}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendReaction(reaction.emoji)}
                        className="h-12 w-12 p-0 hover:scale-110 transition-transform duration-200 flex flex-col items-center gap-1"
                        title={reaction.name}
                      >
                        <span className="text-xl">{reaction.emoji}</span>
                        {reactionCounts[reaction.emoji] && (
                          <Badge;
                            variant="secondary" 
                            className="text-xs h-4 min-w-[16px] px-1"
                          >
                            {reactionCounts[reaction.emoji]}
                          </Badge>
                        )}
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reaction Summary */}
          {Object.keys(reactionCounts).length > 0 && (
            <Card className="bg-black/70 text-white border-0">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 text-sm">
                  <span>Recent:</span>
                  {Object.entries(reactionCounts)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([emoji, count]) => (
                      <div key={emoji} className="flex items-center gap-1">
                        <span>{emoji}</span>
                        <span className="text-xs">{count}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`}
        @keyframes float-up {}
          0% {}
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {}
            transform: translateY(-50px) scale(1.2);
            opacity: 0.8;
          }
          100% {}
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
        }

        .animate-bounce-float {}
          animation: float-up 5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}

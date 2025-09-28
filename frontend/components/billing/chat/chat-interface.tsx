import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Edit, Heart, Paperclip, Reply, Search, Send, Shield, Smile, ThumbsUp, Trash, Trash2 } from "lucide-react"
import { useSocket } from "@/contexts/socket-context"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

"use client"

interface Message {}
  id: string;
  user: {}
    id: string;
    username: string;
    avatar?: string;
    role: "user" | "admin" | "moderator"
  }
  content: string;
  timestamp: string;
  type: "text" | "image" | "file"
  reactions?: { [emoji: string]: string[] }
  isEdited?: boolean;
  replyTo?: string;
}

interface ChatInterfaceProps {}
  roomId: string;
  className?: string;
}

export default function ChatInterface({ roomId, className }: ChatInterfaceProps) {}
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [replyingTo, setReplyingTo] = useState<Message | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const { sendMessage, onMessage } = useSocket()
  const { user } = useAuth()

  // Load chat history;
  useEffect(() => {}
    loadChatHistory()
  }, [roomId])

  // WebSocket message handler;
  useEffect(() => {}
    const unsubscribe = onMessage((message) => {}
      switch (message.type) {}
        case "chat_message":
          handleNewMessage(message.data)
          break;
        case "typing":
          handleTypingIndicator(message.data)
          break;
        case "message_reaction":
          handleMessageReaction(message.data)
          break;
        case "message_edit":
          handleMessageEdit(message.data)
          break;
        case "message_delete":
          handleMessageDelete(message.data)
          break;
      }
    })

    return unsubscribe;
  }, [onMessage])

  // Auto-scroll to bottom;
  useEffect(() => {}
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {}
    try {}
      const token = localStorage.getItem("accessToken")
      const response = await fetch(`/api/chat/${roomId}/messages/?page=${page}`, {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {}
        const data = await response.json()
        setMessages((prev) => (page === 1 ? data.results : [...data.results, ...prev]))
        setHasMore(!!data.next)
        setIsLoading(false)
      }
    } catch {}
      console.error("Failed to load chat history:", error)
      setIsLoading(false)
    }
  }

  const handleNewMessage = (messageData: Message) => {}
    setMessages((prev) => [...prev, messageData])
  }

  const handleTypingIndicator = (data: { user_id: string; username: string; is_typing: boolean }) => {}
    setIsTyping((prev) => {}
      if (data.is_typing) {}
        return prev.includes(data.username) ? prev : [...prev, data.username]
      } else {}
        return prev.filter((username) => username !== data.username)
      }
    })
  }

  const handleMessageReaction = (data: {}
    message_id: string;
    emoji: string;
    user_id: string;
    action: "add" | "remove"
  }) => {}
    setMessages((prev) =>
      prev.map((msg) => {}
        if (msg.id === data.message_id) {}
          const reactions = { ...msg.reactions }
          if (!reactions[data.emoji]) reactions[data.emoji] = []

          if (data.action === "add") {}
            if (!reactions[data.emoji].includes(data.user_id)) {}
              reactions[data.emoji].push(data.user_id)
            }
          } else {}
            reactions[data.emoji] = reactions[data.emoji].filter((id) => id !== data.user_id)
            if (reactions[data.emoji].length === 0) {}
              delete reactions[data.emoji]
            }
          }

          return { ...msg, reactions }
        }
        return msg;
      }),
    )
  }

  const handleMessageEdit = (data: { message_id: string; content: string }) => {}
    setMessages((prev) =>
      prev.map((msg) => (msg.id === data.message_id ? { ...msg, content: data.content, isEdited: true } : msg)),
    )
  }

  const handleMessageDelete = (data: { message_id: string }) => {}
    setMessages((prev) => prev.filter((msg) => msg.id !== data.message_id))
  }

  const sendChatMessage = async () => {}
    if (!newMessage.trim() || !user) return;
    const messageData = { room_id: roomId,
      content: newMessage.trim(),
      type: "text",
      reply_to: replyingTo?.id,
    }

    if (editingMessage) {}
      // Edit existing message;
      sendMessage("edit_message", {}
        message_id: editingMessage,
        content: newMessage.trim(),
      })
      setEditingMessage(null)
    } else {}
      // Send new message;
      sendMessage("chat_message", messageData)
    }

    setNewMessage("")
    setReplyingTo(null)
    inputRef.current?.focus()
  }

  const handleTyping = useCallback(() => {}
    sendMessage("typing", {}
      room_id: roomId,
      is_typing: true,
    })

    if (typingTimeoutRef.current) {}
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {}
      sendMessage("typing", {}
        room_id: roomId,
        is_typing: false,
      })
    }, 1000)
  }, [roomId, sendMessage])

  const addReaction = (messageId: string, emoji: string) => {}
    sendMessage("message_reaction", {}
      message_id: messageId,
      emoji,
      action: "add",
    })
  }

  const removeReaction = (messageId: string, emoji: string) => {}
    sendMessage("message_reaction", {}
      message_id: messageId,
      emoji,
      action: "remove",
    })
  }

  const deleteMessage = (messageId: string) => {}
    sendMessage("delete_message", { message_id: messageId })
  }

  const startEdit = (message: Message) => {}
    setEditingMessage(message.id)
    setNewMessage(message.content)
    inputRef.current?.focus()
  }

  const startReply = (message: Message) => {}
    setReplyingTo(message)
    inputRef.current?.focus()
  }

  const scrollToBottom = () => {}
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const filteredMessages = searchQuery;
    ? messages.filter(
        (msg) =>
          msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          msg.user.username.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : messages;
  const canModerate = user?.role === "admin" || user?.role === "moderator"

  return (
    <div className={cn("flex flex-col h-full bg-white border rounded-lg", className)}>
      {/* Chat header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Chat</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)}>
            <Search className="h-4 w-4" />
          </Button>
          {canModerate && (
            <Button variant="ghost" size="sm">
              <Shield className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search bar */}
      {showSearch && (
        <div className="p-4 border-b">
          <Input;
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Messages area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading messages...</div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
          ) : (
            filteredMessages.map((message) => (
              <div key={message.id} className="group">
                {/* Reply indicator */}
                {message.replyTo && <div className="text-xs text-gray-500 mb-1 ml-12">Replying to a message</div>}

                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{message.user.username.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{message.user.username}</span>
                      {message.user.role !== "user" && (
                        <Badge variant="secondary" className="text-xs">
                          {message.user.role}
                        </Badge>
                      )}
                      <span className="text-xs text-gray-500">{new Date(message.timestamp).toLocaleTimeString()}</span>
                      {message.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                    </div>

                    <div className="text-sm break-words">{message.content}</div>

                    {/* Reactions */}
                    {message.reactions && Object.keys(message.reactions).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(message.reactions).map(([emoji, userIds]) => (
                          <Button;
                            key={emoji}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => {}
                              if (userIds.includes(user?.id || "")) {}
                                removeReaction(message.id, emoji)
                              } else {}
                                addReaction(message.id, emoji)
                              }
                            }}
                          >
                            {emoji} {userIds.length}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Message actions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1">
                      <Button;
                        variant="ghost"
                        size="sm"
                        onClick={() => addReaction(message.id, &quot;👍")}
                        className="h-6 w-6 p-0"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button;
                        variant="ghost"
                        size="sm"
                        onClick={() => addReaction(message.id, &quot;❤️")}
                        className="h-6 w-6 p-0"
                      >
                        <Heart className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => startReply(message)} className=&quot;h-6 w-6 p-0">"
                        <Reply className="h-3 w-3" />
                      </Button>
                      {(message.user.id === user?.id || canModerate) && (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => startEdit(message)} className=&quot;h-6 w-6 p-0">"
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button;
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteMessage(message.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing indicators */}
          {isTyping.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
              </div>
              {isTyping.join(", ")} {isTyping.length === 1 ? "is" : "are"} typing...
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply indicator */}
      {replyingTo && (
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center justify-between">
          <div className="text-sm">
            <span className="text-gray-500">Replying to </span>
            <span className="font-medium">{replyingTo.user.username}</span>
            <span className="text-gray-500">: {replyingTo.content.substring(0, 50)}...</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
            ×
          </Button>
        </div>
      )}

      {/* Message input */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Paperclip className="h-4 w-4" />
          </Button>
          <div className="flex-1 relative">
            <Input;
              ref={inputRef}
              placeholder={editingMessage ? "Edit message..." : "Type a message..."}
              value={newMessage}
              onChange={(e) => {}
                setNewMessage(e.target.value)
                handleTyping()
              }}
              onKeyPress={(e) => {}
                if (e.key === "Enter" && !e.shiftKey) {}
                  e.preventDefault()
                  sendChatMessage()
                }
              }}
            />
            {editingMessage && (
              <Button;
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={() => {}
                  setEditingMessage(null)
                  setNewMessage("")
                }}
              >
                Cancel;
              </Button>
            )}
          </div>
          <Button variant="ghost" size="sm">
            <Smile className="h-4 w-4" />
          </Button>
          <Button onClick={sendChatMessage} disabled={!newMessage.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ChatInterface }

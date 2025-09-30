"use client"

import { useState, useEffect } from "react"
import { chatApi, ChatEmoji } from "@/lib/api-client"
// User type available for future features
// import { User } from "@/lib/api-client"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
  onClose: () => void
}

export default function EmojiPicker({ onEmojiSelect, onClose }: EmojiPickerProps) {
  const [customEmojis, setCustomEmojis] = useState<ChatEmoji[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<"default" | "custom">("default")

  // Default emoji categories
  const defaultEmojis = {
    smileys: ["😀", "😃", "😄", "😁", "😅", "😂", "🤣", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳"],
    people: ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝", "👍", "👎", "👊", "✊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏"],
    animals: ["🐶", "🐱", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮", "🐷", "🐽", "🐸", "🐵", "🙈", "🙉", "🙊", "🐒", "🐔", "🐧", "🐦", "🐤", "🐣", "🐥", "🦆", "🦅", "🦉", "🦇"],
    food: ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍈", "🍒", "🍑", "🥭", "🍍", "🥥", "🥝", "🍅", "🍆", "🥑", "🥦", "🥬", "🥒", "🌶", "🫑", "🌽", "🥕", "🫒", "🧄", "🧅", "🥔"],
    activities: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🎱", "🪀", "🏓", "🏸", "🏒", "🏑", "🥍", "🏏", "🪃", "🥅", "⛳", "🪁", "🏹", "🎣", "🤿", "🥊", "🥋", "🎽", "🛹", "🛷", "⛸"],
    travel: ["🚗", "🚕", "🚙", "🚌", "🚎", "🏎", "🚓", "🚑", "🚒", "🚐", "🛻", "🚚", "🚛", "🚜", "🏍", "🛵", "🚲", "🛴", "🛺", "🚨", "🚔", "🚍", "🚘", "🚖", "🚡", "🚠", "🚟", "🚃", "🚋", "🚞"]
  }

  useEffect(() => {
    loadCustomEmojis()
  }, [])

  const loadCustomEmojis = async () => {
    try {
      const emojis = await chatApi.getCustomEmojis()
      setCustomEmojis(emojis)
    } catch (error) {
      console.error("Failed to load custom emojis:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md max-h-[70vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">Choose Emoji</h3>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveCategory("default")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === "default"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            Default
          </button>
          <button
            onClick={() => setActiveCategory("custom")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === "custom"
                ? "text-blue-400 border-b-2 border-blue-400"
                : "text-white/60 hover:text-white"
            }`}
          >
            Custom ({customEmojis.length})
          </button>
        </div>

        {/* Emoji Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && activeCategory === "custom" ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <>
              {activeCategory === "default" && (
                <div className="space-y-6">
                  {Object.entries(defaultEmojis).map(([category, emojis]) => (
                    <div key={category}>
                      <h4 className="text-sm font-medium text-white/80 mb-3 capitalize">
                        {category}
                      </h4>
                      <div className="grid grid-cols-6 gap-2">
                        {emojis.map((emoji, index) => (
                          <button
                            key={index}
                            onClick={() => handleEmojiClick(emoji)}
                            className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-white/10 rounded-lg transition-colors"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeCategory === "custom" && (
                <div>
                  {customEmojis.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {customEmojis.map((emoji) => (
                        <button
                          key={emoji.id}
                          onClick={() => handleEmojiClick(`:${emoji.name}:`)}
                          className="flex flex-col items-center p-3 hover:bg-white/10 rounded-lg transition-colors"
                          title={emoji.name}
                        >
                          <img
                            src={emoji.image_url}
                            alt={emoji.name}
                            className="w-8 h-8 object-contain mb-1"
                          />
                          <span className="text-xs text-white/60 truncate w-full text-center">
                            :{emoji.name}:
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-white/60">No custom emojis available</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/60 text-center">
            Click an emoji to add it to your message
          </p>
        </div>
      </div>
    </div>
  )
}
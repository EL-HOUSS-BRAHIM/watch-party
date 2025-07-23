"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const emojis = [
    "😀",
    "😂",
    "😍",
    "🤔",
    "😮",
    "😢",
    "😡",
    "👍",
    "👎",
    "❤️",
    "🔥",
    "⚽",
    "🏆",
    "🎉",
    "👏",
    "💪",
    "😎",
    "🤩",
    "😱",
    "🙌",
    "⭐",
    "💯",
    "🚀",
    "⚡",
    "💥",
    "🎯",
    "🏅",
    "🎊",
    "🤝",
    "👌",
  ]

  return (
    <Card className="p-3 w-64">
      <div className="grid grid-cols-6 gap-1">
        {emojis.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => onEmojiSelect(emoji)}
            className="h-8 w-8 p-0 hover:bg-surface-hover"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </Card>
  )
}

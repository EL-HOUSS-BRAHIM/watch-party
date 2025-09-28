import { useState, useEffect , useCallback } from "react"
import {}
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

} from "lucide-react"
"use client"

  Play, 
  Pause, 
  Loader2, 
  Users, 
  Wifi, 
  WifiOff, 
  Eye,
  Crown,
  Clock;
interface PartyStatusIndicatorProps {}
  isPlaying: boolean;
  isBuffering: boolean;
  isConnected: boolean;
  participantCount: number;
  syncState: {}
    lastSyncedBy?: {}
      username: string;
      isHost: boolean;
    }
    lastSyncAt: string;
    action: "play" | "pause" | "seek" | "buffer"
  }
  className?: string;
}

export function PartyStatusIndicator({}
  isPlaying,
  isBuffering,
  isConnected,
  participantCount,
  syncState,
  className,
}: PartyStatusIndicatorProps) {}
  const [showSyncMessage, setShowSyncMessage] = useState(false)

  useEffect(() => {
    if (syncState.lastSyncedBy) {
      setShowSyncMessage(true)
      const timer = setTimeout(() => setShowSyncMessage(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [syncState.lastSyncAt])

  const getSyncMessage = () => {}
    const { lastSyncedBy, action } = syncState;
    if (!lastSyncedBy) return ""

    const prefix = lastSyncedBy.isHost ? "🎬 Host" : lastSyncedBy.username;
    switch (action) {
      case "play":
        return `${prefix} resumed playback`
      case "pause":
        return `${prefix} paused the video`
      case "seek":
        return `${prefix} jumped to a new position`
      case "buffer":
        return "Syncing playback..."
      default:
        return `${prefix} updated playback`
    }
  }

  const getStatusIcon = () => {}
    if (isBuffering) {
      return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
    }
    if (isPlaying) {
      return <Play className="h-4 w-4 text-green-500" />
    }
    return <Pause className="h-4 w-4 text-gray-500" />
  }

  const getConnectionStatus = () => {}
    if (!isConnected) {
      return (
        <Badge variant="destructive" className="text-xs">
          <WifiOff className="h-3 w-3 mr-1" />
          Disconnected;
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="text-xs">
        <Wifi className="h-3 w-3 mr-1" />
        Connected;
      </Badge>
    )
  }

  const formatTimeAgo = (timestamp: string) => {}
    const now = new Date()
    const syncTime = new Date(timestamp)
    const diffMs = now.getTime() - syncTime.getTime()
    const diffSeconds = Math.floor(diffMs / 1000)
    if (diffSeconds < 60) {
      return "just now"
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60)
      return `${minutes}m ago`
    } else {}
      const hours = Math.floor(diffSeconds / 3600)
      return `${hours}h ago`
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="text-sm font-medium">
            {isBuffering ? "Buffering..." : isPlaying ? "Playing" : "Paused"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Users className="h-3 w-3 mr-1" />
            {participantCount}
          </Badge>
          {getConnectionStatus()}
        </div>
      </div>

      {/* Sync Message */}
      {showSyncMessage && syncState.lastSyncedBy && (
        <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary/20 rounded-lg animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-1 flex-1">
            {syncState.lastSyncedBy.isHost && (
              <Crown className="h-3 w-3 text-yellow-500" />
            )}
            <span className="text-sm text-primary">{getSyncMessage()}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatTimeAgo(syncState.lastSyncAt)}
          </div>
        </div>
      )}

      {/* Buffering indicator for all participants */}
      {isBuffering && (
        <div className="flex items-center justify-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />
          <span className="text-sm text-yellow-700">
            Synchronizing with other participants...
          </span>
        </div>
      )}

      {/* Connection warning */}
      {!isConnected && (
        <div className="flex items-center justify-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
          <WifiOff className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700">
            Connection lost. Trying to reconnect...
          </span>
        </div>
      )}
    </div>
  )
}

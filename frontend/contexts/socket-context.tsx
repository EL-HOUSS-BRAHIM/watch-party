"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react"
import { useAuth } from "./auth-context"

interface SocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  connectionStatus: "connecting" | "connected" | "disconnected" | "error"
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
  sendMessage: (type: string, data: any) => void
  onMessage: (callback: (data: any) => void) => () => void
  reconnect: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [messageCallbacks, setMessageCallbacks] = useState<Set<(data: any) => void>>(new Set())
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const { user, isAuthenticated } = useAuth()

  const maxReconnectAttempts = 5
  const reconnectDelay = 1000

  const connect = useCallback(() => {
    if (!isAuthenticated || !user) return

    setConnectionStatus("connecting")

    const token = localStorage.getItem("accessToken")
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000"}/ws/?token=${token}`

    const newSocket = new WebSocket(wsUrl)

    newSocket.onopen = () => {
      console.log("WebSocket connected")
      setIsConnected(true)
      setConnectionStatus("connected")
      setReconnectAttempts(0)

      // Rejoin room if we were in one
      if (currentRoom) {
        sendMessage("join_room", { room_id: currentRoom })
      }
    }

    newSocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        messageCallbacks.forEach((callback) => callback(data))
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error)
      }
    }

    newSocket.onclose = (event) => {
      console.log("WebSocket disconnected:", event.code, event.reason)
      setIsConnected(false)
      setConnectionStatus("disconnected")

      // Attempt to reconnect if it wasn't a manual close
      if (event.code !== 1000 && reconnectAttempts < maxReconnectAttempts) {
        setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1)
          connect()
        }, reconnectDelay * Math.pow(2, reconnectAttempts))
      }
    }

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error)
      setConnectionStatus("error")
    }

    setSocket(newSocket)
  }, [isAuthenticated, user, reconnectAttempts, currentRoom, messageCallbacks])

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, "Manual disconnect")
      setSocket(null)
    }
  }, [socket])

  const reconnect = useCallback(() => {
    disconnect()
    setReconnectAttempts(0)
    connect()
  }, [disconnect, connect])

  useEffect(() => {
    if (isAuthenticated) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, connect, disconnect])

  const joinRoom = useCallback(
    (roomId: string) => {
      setCurrentRoom(roomId)
      if (socket && isConnected) {
        sendMessage("join_room", { room_id: roomId })
      }
    },
    [socket, isConnected],
  )

  const leaveRoom = useCallback(
    (roomId: string) => {
      setCurrentRoom(null)
      if (socket && isConnected) {
        sendMessage("leave_room", { room_id: roomId })
      }
    },
    [socket, isConnected],
  )

  const sendMessage = useCallback(
    (type: string, data: any) => {
      if (socket && isConnected) {
        const message = {
          type,
          data,
          timestamp: new Date().toISOString(),
        }
        socket.send(JSON.stringify(message))
      } else {
        console.warn("Cannot send message: WebSocket not connected")
      }
    },
    [socket, isConnected],
  )

  const onMessage = useCallback((callback: (data: any) => void) => {
    setMessageCallbacks((prev) => new Set([...prev, callback]))

    return () => {
      setMessageCallbacks((prev) => {
        const newSet = new Set(prev)
        newSet.delete(callback)
        return newSet
      })
    }
  }, [])

  const value = {
    socket,
    isConnected,
    connectionStatus,
    joinRoom,
    leaveRoom,
    sendMessage,
    onMessage,
    reconnect,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

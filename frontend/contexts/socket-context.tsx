"use client"

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback, useRef } from "react"
import { io, Socket } from "socket.io-client"
import { useAuth } from "./auth-context"
import { environment } from "@/lib/config/env"
import { tokenStorage } from "@/lib/auth/token-storage"
import { logger } from "@/lib/observability/logger"

interface SocketContextType {
  socket: Socket | null
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
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected",
  )
  const [messageCallbacks, setMessageCallbacks] = useState<Set<(data: any) => void>>(new Set())
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)
  const { user, isAuthenticated, accessToken } = useAuth()
  
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const maxReconnectAttempts = 5
  const reconnectDelay = 1000

  const connect = useCallback(() => {
    if (!isAuthenticated || !user || typeof window === 'undefined') return

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }

    // Close existing socket if any
    if (socketRef.current) {
      socketRef.current.disconnect()
    }

    setConnectionStatus("connecting")

    const token = accessToken || tokenStorage.getAccessToken()

    // Don't connect if no token is available
    if (!token) {
      logger.warn("websocket.auth_missing", { reason: "No access token available" })
      setConnectionStatus("disconnected")
      return
    }

    const wsUrl = (() => {
      try {
        return new URL(environment.websocketUrl).toString()
      } catch {
        return environment.websocketUrl
      }
    })()

    const newSocket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket']
    })
    socketRef.current = newSocket

    newSocket.on('connect', () => {
      logger.info("socket.connected")
      setIsConnected(true)
      setConnectionStatus("connected")
      setReconnectAttempts(0)
      setSocket(newSocket)

      // Rejoin room if we were in one
      if (currentRoom) {
        newSocket.emit("join_room", { room_id: currentRoom })
      }
    })

    newSocket.on('message', (data) => {
      setMessageCallbacks((currentCallbacks) => {
        currentCallbacks.forEach((callback) => callback(data))
        return currentCallbacks
      })
    })

    newSocket.on('disconnect', (reason) => {
      logger.warn("socket.disconnected", { reason })
      setIsConnected(false)
      setConnectionStatus("disconnected")
      setSocket(null)

      // Attempt to reconnect if it wasn't a manual close and we're still authenticated
      if (reason !== 'io client disconnect' && reconnectAttempts < maxReconnectAttempts && isAuthenticated) {
        const delay = Math.min(5000, reconnectDelay * Math.pow(2, reconnectAttempts))
        logger.info("socket.reconnect_scheduled", {
          attempt: reconnectAttempts + 1,
          delay,
        })

        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts((prev) => prev + 1)
          connect()
        }, delay)
      }
    })

    newSocket.on('connect_error', (error) => {
      logger.error("socket.error", { error: error.message })
      setConnectionStatus("error")
    })
  }, [isAuthenticated, user, reconnectAttempts, currentRoom, accessToken])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
    
    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }
    
    setSocket(null)
    setIsConnected(false)
    setConnectionStatus("disconnected")
  }, [])

  const reconnect = useCallback(() => {
    setReconnectAttempts(0)
    disconnect()
    // Small delay to ensure clean disconnect before reconnecting
    setTimeout(() => {
      connect()
    }, 100)
  }, [disconnect, connect])

  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      disconnect()
    }
  }, [isAuthenticated, user])

  const joinRoom = useCallback(
    (roomId: string) => {
      setCurrentRoom(roomId)
      if (socket && isConnected) {
        socket.emit("join_room", { room_id: roomId })
      }
    },
    [socket, isConnected],
  )

  const leaveRoom = useCallback(
    (roomId: string) => {
      setCurrentRoom(null)
      if (socket && isConnected) {
        socket.emit("leave_room", { room_id: roomId })
      }
    },
    [socket, isConnected],
  )

  const sendMessage = useCallback(
    (type: string, data: any) => {
      if (socket && isConnected) {
        socket.emit(type, data)
      } else {
        console.warn("Cannot send message: Socket not connected")
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

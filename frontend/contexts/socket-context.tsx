"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-context"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connect: (namespace?: string) => Socket | null
  disconnect: () => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  const connect = (namespace = "") => {
    if (socket?.connected) {
      return socket
    }

    // Don't connect if not authenticated
    if (!isAuthenticated) {
      return null
    }

    const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8000'
    const newSocket = io(`${wsUrl}${namespace}`, {
      auth: {
        token: localStorage.getItem("access_token"),
      },
      transports: ["websocket", "polling"],
      autoConnect: isAuthenticated,
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    })

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id)
      setIsConnected(true)
    })

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected")
      setIsConnected(false)
    })

    newSocket.on("connect_error", (error) => {
      console.warn("Socket connection error:", error.message)
      setIsConnected(false)
      // Don't spam the console with WebSocket errors during development
    })

    setSocket(newSocket)
    return newSocket
  }

  const disconnect = () => {
    if (socket && socket.connected) {
      socket.disconnect()
    }
    setSocket(null)
    setIsConnected(false)
  }

  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      connect()
    } else {
      disconnect()
    }

    return () => {
      // Only disconnect if socket exists
      if (socket) {
        disconnect()
      }
    }
  }, [isAuthenticated, user])

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect,
  }

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
}

export function useSocket(namespace?: string) {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }

  const { connect } = context

  // Connect to specific namespace if provided
  useEffect(() => {
    if (namespace) {
      const namespacedSocket = connect(namespace)
      return () => {
        // Only disconnect if socket exists and is still connected
        if (namespacedSocket && typeof namespacedSocket.disconnect === 'function') {
          try {
            namespacedSocket.disconnect()
          } catch (error) {
            console.warn('Error disconnecting socket:', error)
          }
        }
      }
    }
  }, [namespace, connect])

  return context
}

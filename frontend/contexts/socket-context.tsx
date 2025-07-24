"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-context"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  connect: (namespace?: string) => Socket
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

    const newSocket = io(`${process.env.NEXT_PUBLIC_WEBSOCKET_URL}${namespace}`, {
      auth: {
        token: localStorage.getItem("access_token"),
      },
      transports: ["websocket", "polling"],
      autoConnect: isAuthenticated,
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
      console.error("Socket connection error:", error)
      setIsConnected(false)
    })

    setSocket(newSocket)
    return newSocket
  }

  const disconnect = () => {
    if (socket) {
      socket.disconnect()
      setSocket(null)
      setIsConnected(false)
    }
  }

  // Auto-connect when authenticated
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
        namespacedSocket.disconnect()
      }
    }
  }, [namespace, connect])

  return context
}

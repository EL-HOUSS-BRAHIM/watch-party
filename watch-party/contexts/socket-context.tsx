"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useAuth } from "./auth-context"

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  joinRoom: (roomId: string) => void
  leaveRoom: (roomId: string) => void
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000", {
        auth: {
          token: localStorage.getItem("auth_token"),
        },
      })

      socketInstance.on("connect", () => {
        setIsConnected(true)
      })

      socketInstance.on("disconnect", () => {
        setIsConnected(false)
      })

      setSocket(socketInstance)

      return () => {
        socketInstance.disconnect()
      }
    }
  }, [isAuthenticated, user])

  const joinRoom = (roomId: string) => {
    if (socket) {
      socket.emit("join_room", roomId)
    }
  }

  const leaveRoom = (roomId: string) => {
    if (socket) {
      socket.emit("leave_room", roomId)
    }
  }

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinRoom,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}

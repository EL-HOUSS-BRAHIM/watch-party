"use client"

import type React from "react"
import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useAuth } from "./auth-context"
import { createWebSocketConnection } from "@/lib/api"

interface SocketContextType {
  socket: WebSocket | null
  isConnected: boolean
  joinParty: (partyId: string) => void
  leaveParty: () => void
  sendMessage: (message: any) => void
  currentParty: string | null
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [currentParty, setCurrentParty] = useState<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const reconnectAttempts = useRef(0)
  const maxReconnectAttempts = 5

  const connectWebSocket = (partyId?: string) => {
    if (!isAuthenticated || !user) return

    const token = localStorage.getItem("auth_token")
    if (!token) return

    try {
      const endpoint = partyId 
        ? `/ws/party/${partyId}/`
        : `/ws/notifications/`
      
      const ws = createWebSocketConnection(endpoint, token)
      
      ws.onopen = () => {
        console.log("WebSocket connected")
        setIsConnected(true)
        reconnectAttempts.current = 0
        
        // Send authentication
        ws.send(JSON.stringify({
          type: 'authenticate',
          token: token
        }))
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          handleWebSocketMessage(data)
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error)
        }
      }
      
      ws.onclose = (event) => {
        console.log("WebSocket disconnected:", event.code, event.reason)
        setIsConnected(false)
        setSocket(null)
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            console.log(`Reconnecting... Attempt ${reconnectAttempts.current}`)
            connectWebSocket(partyId)
          }, delay)
        }
      }
      
      ws.onerror = (error) => {
        console.error("WebSocket error:", error)
      }
      
      setSocket(ws)
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error)
    }
  }

  const handleWebSocketMessage = (data: any) => {
    // Handle different message types
    switch (data.type) {
      case 'chat_message':
        // Emit custom event for chat components to listen to
        window.dispatchEvent(new CustomEvent('chat_message', { detail: data }))
        break
      case 'party_update':
        window.dispatchEvent(new CustomEvent('party_update', { detail: data }))
        break
      case 'user_joined':
        window.dispatchEvent(new CustomEvent('user_joined', { detail: data }))
        break
      case 'user_left':
        window.dispatchEvent(new CustomEvent('user_left', { detail: data }))
        break
      case 'video_sync':
        window.dispatchEvent(new CustomEvent('video_sync', { detail: data }))
        break
      case 'reaction':
        window.dispatchEvent(new CustomEvent('reaction', { detail: data }))
        break
      case 'notification':
        window.dispatchEvent(new CustomEvent('notification', { detail: data }))
        break
      default:
        console.log("Unknown WebSocket message type:", data.type)
    }
  }

  const joinParty = (partyId: string) => {
    if (currentParty === partyId && socket && isConnected) return
    
    // Close existing connection
    if (socket) {
      socket.close(1000, "Joining new party")
    }
    
    setCurrentParty(partyId)
    connectWebSocket(partyId)
  }

  const leaveParty = () => {
    if (socket) {
      socket.close(1000, "Leaving party")
    }
    setCurrentParty(null)
    setSocket(null)
    setIsConnected(false)
    
    // Connect to general notifications
    if (isAuthenticated) {
      connectWebSocket()
    }
  }

  const sendMessage = (message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message))
    } else {
      console.warn("WebSocket not connected. Cannot send message:", message)
    }
  }

  // Connect/disconnect based on authentication status
  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to general notifications WebSocket
      connectWebSocket()
    } else {
      // Disconnect when not authenticated
      if (socket) {
        socket.close(1000, "User logged out")
      }
      setSocket(null)
      setIsConnected(false)
      setCurrentParty(null)
    }

    // Cleanup function
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (socket) {
        socket.close(1000, "Component unmounting")
      }
    }
  }, [isAuthenticated, user])

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinParty,
        leaveParty,
        sendMessage,
        currentParty,
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

/**
 * Hook for creating individual WebSocket connections
 */

import { useEffect, useRef, useState } from 'react'

interface UseWebSocketOptions {
  onMessage?: (data: any) => void
  onOpen?: () => void
  onClose?: (event: CloseEvent) => void
  onError?: (error: Event) => void
  reconnect?: boolean
  maxReconnectAttempts?: number
}

export const useWebSocket = (url: string, options: UseWebSocketOptions = {}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected')
  
  const reconnectAttempts = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  
  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnect = true,
    maxReconnectAttempts = 5
  } = options

  const connect = () => {
    if (socket?.readyState === WebSocket.OPEN) return

    setConnectionStatus('connecting')
    
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const wsUrl = `${protocol}//${window.location.host}${url}`
      
      const ws = new WebSocket(wsUrl)
      
      ws.onopen = (event) => {
        setIsConnected(true)
        setConnectionStatus('connected')
        reconnectAttempts.current = 0
        onOpen?.()
      }
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage?.(data)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }
      
      ws.onclose = (event) => {
        setIsConnected(false)
        setConnectionStatus('disconnected')
        setSocket(null)
        onClose?.(event)
        
        // Attempt reconnection
        if (reconnect && event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000 + Math.random() * 1000
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++
            connect()
          }, delay)
        }
      }
      
      ws.onerror = (error) => {
        onError?.(error)
      }
      
      setSocket(ws)
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      setConnectionStatus('disconnected')
    }
  }

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (socket) {
      socket.close(1000, 'Manual disconnect')
    }
    setSocket(null)
    setIsConnected(false)
    setConnectionStatus('disconnected')
  }

  const send = (data: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(data))
      return true
    }
    return false
  }

  useEffect(() => {
    connect()
    
    return () => {
      disconnect()
    }
  }, [url])

  return {
    socket,
    isConnected,
    connectionStatus,
    send,
    connect,
    disconnect
  }
}

export default useWebSocket

/**
 * WebSocket Service for Watch Party
 * 
 * Handles real-time communication for rooms, chat, and video synchronization
 */

import { API_CONFIG } from './api'

export interface WebSocketMessage {
  type: string
  data: any
  timestamp?: number
  userId?: string
  roomId?: string
}

export interface RoomMessage {
  id: string
  user: {
    id: string
    name: string
    avatar?: string
  }
  message: string
  timestamp: number
  type: 'text' | 'system' | 'media'
}

export interface VideoSyncData {
  action: 'play' | 'pause' | 'seek' | 'load'
  timestamp: number
  currentTime?: number
  videoUrl?: string
}

export interface RoomParticipant {
  id: string
  name: string
  avatar?: string
  isHost: boolean
  joinedAt: number
}

export class WebSocketService {
  private ws: WebSocket | null = null
  private roomId: string | null = null
  private userId: string | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private heartbeatInterval: NodeJS.Timeout | null = null
  private messageQueue: WebSocketMessage[] = []

  // Event listeners
  private listeners: { [key: string]: Function[] } = {}

  constructor() {
    this.setupEventListeners()
  }

  /**
   * Connect to WebSocket server
   */
  connect(roomId: string, userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.close()
      }

      this.roomId = roomId
      this.userId = userId
      
      const wsUrl = `${API_CONFIG.WEBSOCKET_URL}?room=${roomId}&user=${userId}`
      
      try {
        this.ws = new WebSocket(wsUrl)
        this.setupWebSocketHandlers(resolve, reject)
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.roomId = null
    this.userId = null
    this.reconnectAttempts = 0
    this.messageQueue = []
  }

  /**
   * Send message to WebSocket server
   */
  send(message: WebSocketMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      message.timestamp = Date.now()
      message.userId = this.userId || undefined
      message.roomId = this.roomId || undefined
      
      this.ws.send(JSON.stringify(message))
    } else {
      // Queue message for later sending
      this.messageQueue.push(message)
    }
  }

  /**
   * Send chat message
   */
  sendChatMessage(message: string): void {
    this.send({
      type: 'chat_message',
      data: {
        message,
        type: 'text'
      }
    })
  }

  /**
   * Send video sync action
   */
  sendVideoSync(syncData: VideoSyncData): void {
    this.send({
      type: 'video_sync',
      data: syncData
    })
  }

  /**
   * Send typing indicator
   */
  sendTyping(isTyping: boolean): void {
    this.send({
      type: 'typing',
      data: { isTyping }
    })
  }

  /**
   * Request room participants
   */
  requestParticipants(): void {
    this.send({
      type: 'request_participants',
      data: {}
    })
  }

  /**
   * Join room
   */
  joinRoom(): void {
    this.send({
      type: 'join_room',
      data: {}
    })
  }

  /**
   * Leave room
   */
  leaveRoom(): void {
    this.send({
      type: 'leave_room',
      data: {}
    })
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = []
    }
    this.listeners[event].push(callback)
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error)
        }
      })
    }
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(resolve: Function, reject: Function): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.reconnectAttempts = 0
      
      // Send queued messages
      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift()
        if (message) {
          this.send(message)
        }
      }

      // Join room automatically
      this.joinRoom()

      // Start heartbeat
      this.startHeartbeat()

      this.emit('connected', { roomId: this.roomId, userId: this.userId })
      resolve()
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Error parsing WebSocket message:', error)
      }
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason)
      this.emit('disconnected', { code: event.code, reason: event.reason })

      // Attempt to reconnect if it wasn't a clean close
      if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnect()
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.emit('error', error)
      reject(error)
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'chat_message':
        this.emit('chatMessage', message.data as RoomMessage)
        break
        
      case 'video_sync':
        this.emit('videoSync', message.data as VideoSyncData)
        break
        
      case 'user_joined':
        this.emit('userJoined', message.data as RoomParticipant)
        break
        
      case 'user_left':
        this.emit('userLeft', message.data as RoomParticipant)
        break
        
      case 'participants':
        this.emit('participants', message.data as RoomParticipant[])
        break
        
      case 'typing':
        this.emit('typing', message.data)
        break
        
      case 'room_updated':
        this.emit('roomUpdated', message.data)
        break
        
      case 'error':
        this.emit('error', message.data)
        break
        
      case 'pong':
        // Heartbeat response
        break
        
      default:
        console.warn('Unknown WebSocket message type:', message.type)
        this.emit('message', message)
    }
  }

  /**
   * Setup global event listeners
   */
  private setupEventListeners(): void {
    // Handle page visibility changes
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          // Page is hidden, pause heartbeat
          if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval)
            this.heartbeatInterval = null
          }
        } else {
          // Page is visible, resume heartbeat
          this.startHeartbeat()
        }
      })
    }

    // Handle page unload
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect()
      })
    }
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          data: {}
        })
      }
    }, 30000) // Send ping every 30 seconds
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnectFailed', { attempts: this.reconnectAttempts })
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff

    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${delay}ms`)
    
    setTimeout(() => {
      if (this.roomId && this.userId) {
        this.connect(this.roomId, this.userId)
          .then(() => {
            this.emit('reconnected', { attempts: this.reconnectAttempts })
          })
          .catch((error) => {
            console.error('Reconnection failed:', error)
            this.attemptReconnect()
          })
      }
    }, delay)
  }

  /**
   * Get connection status
   */
  getStatus(): string {
    if (!this.ws) return 'disconnected'
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting'
      case WebSocket.OPEN:
        return 'connected'
      case WebSocket.CLOSING:
        return 'disconnecting'
      case WebSocket.CLOSED:
        return 'disconnected'
      default:
        return 'unknown'
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false
  }
}

// Singleton instance
export const webSocketService = new WebSocketService()

export default webSocketService

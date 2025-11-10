/**
 * WebSocket Client with Auto-Reconnection and Heartbeat Support
 * Handles connection management, message queuing, and health monitoring
 */

import {
  WebSocketMessage,
  WebSocketConfig,
  ConnectionStatus,
  MessageHandler,
  ConnectionHandler,
  isHeartbeat,
  isPong,
} from '@/types/websocket';

interface EventHandlers {
  [key: string]: Set<MessageHandler>;
}

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private eventHandlers: EventHandlers = {};
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private messageQueue: WebSocketMessage[] = [];
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private heartbeatTimeoutTimer: NodeJS.Timeout | null = null;
  private lastHeartbeatTime: number = 0;
  private _status: ConnectionStatus = 'disconnected';
  private manualClose = false;

  constructor(config: WebSocketConfig) {
    // Set default configuration
    this.config = {
      url: config.url,
      protocols: config.protocols || [],
      reconnect: config.reconnect !== false,
      reconnectInterval: config.reconnectInterval || 1000,
      reconnectMaxInterval: config.reconnectMaxInterval || 30000,
      reconnectDecay: config.reconnectDecay || 2,
      maxReconnectAttempts: config.maxReconnectAttempts || Infinity,
      heartbeatInterval: config.heartbeatInterval || 15000,
      heartbeatTimeout: config.heartbeatTimeout || 45000, // 3 missed heartbeats
    };
  }

  /**
   * Get current connection status
   */
  get status(): ConnectionStatus {
    return this._status;
  }

  /**
   * Check if WebSocket is connected
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Set connection status and notify handlers
   */
  private setStatus(status: ConnectionStatus): void {
    if (this._status !== status) {
      this._status = status;
      this.notifyConnectionHandlers(status);
    }
  }

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.warn('[WebSocket] Already connected');
      return;
    }

    if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
      console.warn('[WebSocket] Connection already in progress');
      return;
    }

    this.manualClose = false;
    this.setStatus('connecting');

    try {
      console.log('[WebSocket] Connecting to:', this.config.url);
      this.ws = new WebSocket(this.config.url, this.config.protocols);
      this.setupEventListeners();
    } catch (error) {
      console.error('[WebSocket] Connection error:', error);
      this.setStatus('error');
      this.scheduleReconnect();
    }
  }

  /**
   * Setup WebSocket event listeners
   */
  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('[WebSocket] Connected');
      this.setStatus('connected');
      this.reconnectAttempts = 0;
      this.startHeartbeatMonitoring();
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('[WebSocket] Failed to parse message:', error);
      }
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error);
      this.setStatus('error');
    };

    this.ws.onclose = (event) => {
      console.log('[WebSocket] Closed:', event.code, event.reason);
      this.stopHeartbeatMonitoring();
      this.setStatus('disconnected');

      if (!this.manualClose && this.config.reconnect) {
        this.scheduleReconnect();
      }
    };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: WebSocketMessage): void {
    // Handle heartbeat messages
    if (isHeartbeat(message)) {
      this.lastHeartbeatTime = Date.now();
      this.resetHeartbeatTimeout();
      // Respond with pong
      this.send({ type: 'pong', timestamp: Date.now() });
      return;
    }

    // Dispatch message to registered handlers
    const handlers = this.eventHandlers[message.type];
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error(`[WebSocket] Handler error for ${message.type}:`, error);
        }
      });
    }

    // Dispatch to wildcard handlers
    const wildcardHandlers = this.eventHandlers['*'];
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('[WebSocket] Wildcard handler error:', error);
        }
      });
    }
  }

  /**
   * Start monitoring heartbeat messages
   */
  private startHeartbeatMonitoring(): void {
    this.lastHeartbeatTime = Date.now();
    this.resetHeartbeatTimeout();
  }

  /**
   * Reset heartbeat timeout timer
   */
  private resetHeartbeatTimeout(): void {
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
    }

    this.heartbeatTimeoutTimer = setTimeout(() => {
      const timeSinceLastHeartbeat = Date.now() - this.lastHeartbeatTime;
      console.warn(
        `[WebSocket] Heartbeat timeout: ${timeSinceLastHeartbeat}ms since last heartbeat`
      );
      
      // Close connection and trigger reconnection
      if (this.ws) {
        this.ws.close();
      }
    }, this.config.heartbeatTimeout);
  }

  /**
   * Stop heartbeat monitoring
   */
  private stopHeartbeatMonitoring(): void {
    if (this.heartbeatTimer) {
      clearTimeout(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }

    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer);
      this.heartbeatTimeoutTimer = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.manualClose) {
      return;
    }

    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('[WebSocket] Max reconnection attempts reached');
      this.setStatus('error');
      return;
    }

    this.setStatus('reconnecting');
    this.reconnectAttempts++;

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(this.config.reconnectDecay, this.reconnectAttempts - 1),
      this.config.reconnectMaxInterval
    );

    console.log(
      `[WebSocket] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Send message to server
   */
  send<T extends WebSocketMessage>(message: T): void {
    if (!this.isConnected) {
      console.warn('[WebSocket] Not connected, queuing message:', message.type);
      this.messageQueue.push(message);
      return;
    }

    try {
      this.ws!.send(JSON.stringify(message));
    } catch (error) {
      console.error('[WebSocket] Failed to send message:', error);
      this.messageQueue.push(message);
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`[WebSocket] Flushing ${this.messageQueue.length} queued messages`);
    
    const queue = [...this.messageQueue];
    this.messageQueue = [];

    queue.forEach((message) => {
      this.send(message);
    });
  }

  /**
   * Subscribe to message type
   */
  subscribe<T extends WebSocketMessage>(
    type: T['type'] | '*',
    handler: MessageHandler<T>
  ): () => void {
    if (!this.eventHandlers[type]) {
      this.eventHandlers[type] = new Set();
    }

    this.eventHandlers[type].add(handler as MessageHandler);

    // Return unsubscribe function
    return () => {
      this.unsubscribe(type, handler);
    };
  }

  /**
   * Unsubscribe from message type
   */
  unsubscribe<T extends WebSocketMessage>(
    type: T['type'] | '*',
    handler: MessageHandler<T>
  ): void {
    const handlers = this.eventHandlers[type];
    if (handlers) {
      handlers.delete(handler as MessageHandler);
    }
  }

  /**
   * Subscribe to connection status changes
   */
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler);

    // Return unsubscribe function
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  /**
   * Notify connection handlers
   */
  private notifyConnectionHandlers(status: ConnectionStatus): void {
    this.connectionHandlers.forEach((handler) => {
      try {
        handler(status);
      } catch (error) {
        console.error('[WebSocket] Connection handler error:', error);
      }
    });
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.manualClose = true;
    this.stopHeartbeatMonitoring();

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.setStatus('disconnected');
  }

  /**
   * Clear all message handlers
   */
  clearHandlers(): void {
    this.eventHandlers = {};
    this.connectionHandlers.clear();
  }

  /**
   * Destroy client and clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.clearHandlers();
    this.messageQueue = [];
  }
}

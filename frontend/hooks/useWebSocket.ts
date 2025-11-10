/**
 * React Hook for WebSocket Connection Management
 * Handles connection lifecycle, authentication, and message handling
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient } from '@/lib/websocket-client';
import {
  WebSocketMessage,
  ConnectionStatus,
  MessageHandler,
} from '@/types/websocket';

interface UseWebSocketOptions {
  partyId: string;
  autoConnect?: boolean;
  onConnectionChange?: (status: ConnectionStatus) => void;
}

interface UseWebSocketReturn {
  status: ConnectionStatus;
  isConnected: boolean;
  send: <T extends WebSocketMessage>(message: T) => void;
  subscribe: <T extends WebSocketMessage>(
    type: T['type'] | '*',
    handler: MessageHandler<T>
  ) => () => void;
  unsubscribe: <T extends WebSocketMessage>(
    type: T['type'] | '*',
    handler: MessageHandler<T>
  ) => void;
  connect: () => void;
  disconnect: () => void;
  reconnect: () => void;
}

/**
 * Get WebSocket URL from API URL
 */
function getWebSocketUrl(partyId: string, token: string): string {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  
  // Replace http(s):// with ws(s)://
  const wsUrl = apiUrl.replace(/^http/, 'ws');
  
  return `${wsUrl}/ws/party/${partyId}/?token=${encodeURIComponent(token)}`;
}

/**
 * Fetch WebSocket authentication token
 */
async function fetchWsToken(): Promise<string> {
  try {
    const response = await fetch('/api/ws-token');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch WS token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.wsToken;
  } catch (error) {
    console.error('[useWebSocket] Failed to fetch token:', error);
    throw error;
  }
}

/**
 * Custom hook for WebSocket connection
 */
export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const { partyId, autoConnect = true, onConnectionChange } = options;
  
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const clientRef = useRef<WebSocketClient | null>(null);
  const tokenRef = useRef<string | null>(null);
  const tokenExpiryRef = useRef<number>(0);

  /**
   * Initialize WebSocket client
   */
  const initializeClient = useCallback(async () => {
    try {
      // Fetch fresh token if needed (or if expired soon)
      if (!tokenRef.current || Date.now() >= tokenExpiryRef.current - 60000) {
        const token = await fetchWsToken();
        tokenRef.current = token;
        tokenExpiryRef.current = Date.now() + (5 * 60 * 1000); // 5 minutes
      }

      const wsUrl = getWebSocketUrl(partyId, tokenRef.current);

      // Create new client if it doesn't exist
      if (!clientRef.current) {
        clientRef.current = new WebSocketClient({
          url: wsUrl,
          reconnect: true,
          reconnectInterval: 1000,
          reconnectMaxInterval: 30000,
          reconnectDecay: 2,
          maxReconnectAttempts: 10,
          heartbeatInterval: 15000,
          heartbeatTimeout: 45000,
        });

        // Subscribe to connection changes
        clientRef.current.onConnectionChange((newStatus) => {
          setStatus(newStatus);
          onConnectionChange?.(newStatus);
        });
      }

      // Connect
      clientRef.current.connect();
    } catch (error) {
      console.error('[useWebSocket] Initialization error:', error);
      setStatus('error');
    }
  }, [partyId, onConnectionChange]);

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    initializeClient();
  }, [initializeClient]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  /**
   * Reconnect to WebSocket
   */
  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      connect();
    }, 100);
  }, [connect, disconnect]);

  /**
   * Send message
   */
  const send = useCallback(<T extends WebSocketMessage>(message: T) => {
    if (clientRef.current) {
      clientRef.current.send(message);
    } else {
      console.warn('[useWebSocket] Client not initialized');
    }
  }, []);

  /**
   * Subscribe to message type
   */
  const subscribe = useCallback(<T extends WebSocketMessage>(
    type: T['type'] | '*',
    handler: MessageHandler<T>
  ) => {
    if (!clientRef.current) {
      console.warn('[useWebSocket] Client not initialized');
      return () => {};
    }
    
    return clientRef.current.subscribe(type, handler);
  }, []);

  /**
   * Unsubscribe from message type
   */
  const unsubscribe = useCallback(<T extends WebSocketMessage>(
    type: T['type'] | '*',
    handler: MessageHandler<T>
  ) => {
    if (clientRef.current) {
      clientRef.current.unsubscribe(type, handler);
    }
  }, []);

  /**
   * Auto-connect on mount if enabled
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.destroy();
        clientRef.current = null;
      }
    };
  }, [autoConnect, connect]);

  /**
   * Refresh token before expiry
   */
  useEffect(() => {
    const checkTokenExpiry = setInterval(() => {
      // Refresh token if expiring in next 60 seconds
      if (tokenRef.current && Date.now() >= tokenExpiryRef.current - 60000) {
        console.log('[useWebSocket] Token expiring soon, refreshing connection...');
        reconnect();
      }
    }, 30000); // Check every 30 seconds

    return () => {
      clearInterval(checkTokenExpiry);
    };
  }, [reconnect]);

  return {
    status,
    isConnected: clientRef.current?.isConnected || false,
    send,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
    reconnect,
  };
}

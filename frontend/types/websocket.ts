/**
 * WebSocket Message Types
 * Matches backend message schemas from Django Channels consumers
 */

// Video control actions
export type VideoControlAction = 'play' | 'pause' | 'seek';

// Video control message - sent by host to control playback
export interface VideoControlMessage {
  type: 'video_control';
  action: VideoControlAction;
  timestamp?: number; // Current video timestamp in seconds
  playback_rate?: number; // Playback speed (1.0 = normal)
  user_id?: string;
  username?: string;
}

// Sync state message - broadcast to all participants
export interface SyncStateMessage {
  type: 'sync_state';
  is_playing: boolean;
  current_timestamp: number; // Video position in seconds
  video_duration: number;
  playback_rate?: number;
  quality?: string;
  last_update?: string; // ISO timestamp
}

// Sync request message - request current state
export interface SyncRequestMessage {
  type: 'sync_request';
}

// Chat message
export interface ChatMessage {
  type: 'chat_message';
  message: string;
  user_id: string;
  username: string;
  timestamp?: string;
  reply_to?: string; // Message ID this is replying to
}

// Reaction message - emoji reactions with video timestamp
export interface ReactionMessage {
  type: 'reaction';
  emoji: string;
  timestamp: number; // Video position when reaction was added
  user_id: string;
  username?: string;
  position?: number; // Optional: screen position for floating animation
}

// Typing indicator
export interface TypingMessage {
  type: 'typing';
  is_typing: boolean;
  user_id: string;
  username?: string;
}

// User joined party
export interface UserJoinedMessage {
  type: 'user_joined';
  user_id: string;
  username: string;
  avatar?: string;
  is_host?: boolean;
}

// User left party
export interface UserLeftMessage {
  type: 'user_left';
  user_id: string;
  username: string;
}

// Heartbeat from server
export interface HeartbeatMessage {
  type: 'heartbeat';
  timestamp?: number;
}

// Pong response to heartbeat
export interface PongMessage {
  type: 'pong';
  timestamp?: number;
}

// Error message from server
export interface ErrorMessage {
  type: 'error';
  message: string;
  code?: string;
}

// User promoted/demoted
export interface UserRoleMessage {
  type: 'user_role_updated';
  user_id: string;
  username: string;
  role: 'host' | 'moderator' | 'participant';
}

// Discriminated union of all possible messages
export type WebSocketMessage =
  | VideoControlMessage
  | SyncStateMessage
  | SyncRequestMessage
  | ChatMessage
  | ReactionMessage
  | TypingMessage
  | UserJoinedMessage
  | UserLeftMessage
  | HeartbeatMessage
  | PongMessage
  | ErrorMessage
  | UserRoleMessage;

// Type guards for message identification
export function isVideoControl(msg: WebSocketMessage): msg is VideoControlMessage {
  return msg.type === 'video_control';
}

export function isSyncState(msg: WebSocketMessage): msg is SyncStateMessage {
  return msg.type === 'sync_state';
}

export function isSyncRequest(msg: WebSocketMessage): msg is SyncRequestMessage {
  return msg.type === 'sync_request';
}

export function isChatMessage(msg: WebSocketMessage): msg is ChatMessage {
  return msg.type === 'chat_message';
}

export function isReaction(msg: WebSocketMessage): msg is ReactionMessage {
  return msg.type === 'reaction';
}

export function isTyping(msg: WebSocketMessage): msg is TypingMessage {
  return msg.type === 'typing';
}

export function isUserJoined(msg: WebSocketMessage): msg is UserJoinedMessage {
  return msg.type === 'user_joined';
}

export function isUserLeft(msg: WebSocketMessage): msg is UserLeftMessage {
  return msg.type === 'user_left';
}

export function isHeartbeat(msg: WebSocketMessage): msg is HeartbeatMessage {
  return msg.type === 'heartbeat';
}

export function isPong(msg: WebSocketMessage): msg is PongMessage {
  return msg.type === 'pong';
}

export function isError(msg: WebSocketMessage): msg is ErrorMessage {
  return msg.type === 'error';
}

export function isUserRole(msg: WebSocketMessage): msg is UserRoleMessage {
  return msg.type === 'user_role_updated';
}

// WebSocket connection status
export type ConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'reconnecting'
  | 'error';

// WebSocket event handler types
export type MessageHandler<T extends WebSocketMessage = WebSocketMessage> = (
  message: T
) => void;

export type ConnectionHandler = (status: ConnectionStatus) => void;

// WebSocket configuration
export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnect?: boolean;
  reconnectInterval?: number; // Initial reconnect delay in ms
  reconnectMaxInterval?: number; // Max reconnect delay in ms
  reconnectDecay?: number; // Exponential backoff multiplier
  maxReconnectAttempts?: number;
  heartbeatInterval?: number; // How often to expect heartbeats (ms)
  heartbeatTimeout?: number; // When to consider connection dead (ms)
}

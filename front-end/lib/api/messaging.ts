/**
 * Messaging API Service
 * Handles direct messaging and conversations
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  Conversation,
  Message,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class MessagingAPI {
  /**
   * Get user conversations
   */
  async getConversations(params?: {
    page?: number
    unread_only?: boolean
  }): Promise<PaginatedResponse<Conversation>> {
    return apiClient.get<PaginatedResponse<Conversation>>(API_ENDPOINTS.messaging.conversations, { params })
  }

  /**
   * Create new conversation
   */
  async createConversation(data: {
    type?: 'direct' | 'group'
    participants: string[]
    message?: string
  }): Promise<Conversation> {
    return apiClient.post<Conversation>(API_ENDPOINTS.messaging.conversations, data)
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: number | string, params?: {
    page?: number
    limit?: number
    before?: string
  }): Promise<PaginatedResponse<Message>> {
    const id = typeof conversationId === 'string' ? parseInt(conversationId, 10) : conversationId
    return apiClient.get<PaginatedResponse<Message>>(
      API_ENDPOINTS.messaging.messages(id), 
      { params }
    )
  }

  /**
   * Send message
   */
  async sendMessage(conversationId: number | string, data: {
    content: string
    type?: 'text' | 'image' | 'file'
    message_type?: 'text' | 'image' | 'file'
  }): Promise<Message> {
    const id = typeof conversationId === 'string' ? parseInt(conversationId, 10) : conversationId
    return apiClient.post<Message>(API_ENDPOINTS.messaging.messages(id), data)
  }

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: number | string): Promise<APIResponse> {
    const id = typeof conversationId === 'string' ? parseInt(conversationId, 10) : conversationId
    return apiClient.post<APIResponse>(`${API_ENDPOINTS.messaging.conversations}${id}/read/`)
  }

  /**
   * Get online friends for quick messaging
   */
  async getOnlineFriends(): Promise<any[]> {
    return apiClient.get<any[]>("/api/users/friends/?online_only=true")
  }
}

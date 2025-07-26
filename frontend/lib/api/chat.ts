/**
 * Chat API Service
 * Handles chat-related API calls
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  ChatMessage,
  ChatSettings,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class ChatAPI {
  /**
   * Get chat messages for a party
   */
  async getMessages(
    partyId: string,
    params?: {
      page?: number
      limit?: number
    }
  ): Promise<PaginatedResponse<ChatMessage>> {
    return apiClient.get<PaginatedResponse<ChatMessage>>(
      API_ENDPOINTS.chat.messages(partyId),
      params
    )
  }

  /**
   * Send a chat message
   */
  async sendMessage(
    partyId: string,
    data: {
      message: string
      message_type: 'text' | 'emoji'
    }
  ): Promise<ChatMessage> {
    return apiClient.post<ChatMessage>(API_ENDPOINTS.chat.send(partyId), data)
  }

  /**
   * Get chat room settings
   */
  async getChatSettings(roomId: string): Promise<ChatSettings> {
    return apiClient.get<ChatSettings>(API_ENDPOINTS.chat.settings(roomId))
  }

  /**
   * Update chat room settings
   */
  async updateChatSettings(
    roomId: string,
    settings: Partial<ChatSettings>
  ): Promise<ChatSettings> {
    return apiClient.put<ChatSettings>(API_ENDPOINTS.chat.settings(roomId), settings)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts

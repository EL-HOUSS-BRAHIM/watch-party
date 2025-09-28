import { User } from "lucide-react"
import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import { transformConversation, transformMessage, transformPaginatedResponse, transformUser } from "./transformers"
import type {}

/**
 * Messaging API Service
 * Handles direct messaging and conversations
 */

  Conversation,
  Message,
  PaginatedResponse,
  RawConversation,
  RawMessage,
  RawUser,
  User,
} from "./types"

export class MessagingAPI {}
  /**
   * Get user conversations
   */
  async getConversations(params?: {}
    page?: number
    unread_only?: boolean
  }): Promise<PaginatedResponse<Conversation>> {}
    const response = await apiClient.get<PaginatedResponse<RawConversation>>(
      API_ENDPOINTS.messaging.conversations,
      { params },
    )
    return transformPaginatedResponse(response, transformConversation)
  }

  /**
   * Create new conversation
   */
  async createConversation(data: {}
    type?: 'direct' | 'group'
    participants: string[]
    message?: string
  }): Promise<Conversation> {}
    const response = await apiClient.post<RawConversation>(API_ENDPOINTS.messaging.conversations, data)
    return transformConversation(response)
  }

  /**
   * Get conversation messages
   */
  async getMessages(conversationId: number | string, params?: {}
    page?: number
    limit?: number
    before?: string
  }): Promise<PaginatedResponse<Message>> {}
    const response = await apiClient.get<PaginatedResponse<RawMessage>>(
      API_ENDPOINTS.messaging.messages(Number(conversationId)),
      { params },
    )
    return transformPaginatedResponse(response, transformMessage)
  }

  /**
   * Send message
   */
  async sendMessage(conversationId: number | string, data: {}
    content: string
    type?: 'text' | 'image' | 'file'
    message_type?: 'text' | 'image' | 'file'
  }): Promise<Message> {}
    const response = await apiClient.post<RawMessage>(
      API_ENDPOINTS.messaging.messages(Number(conversationId)),
      data,
    )
    return transformMessage(response)
  }

  /**
   * Get online friends for quick messaging
   */
  async getOnlineFriends(): Promise<User[]> {}
    const response = await apiClient.get<PaginatedResponse<RawUser> | RawUser[]>(
      API_ENDPOINTS.users.friends,
      {}
        params: { online_only: true },
      },
    )

    if (Array.isArray(response)) {
      return response.map(transformUser)
    }

    return transformPaginatedResponse(response, transformUser).results
  }
}

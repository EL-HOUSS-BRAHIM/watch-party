import { apiClient, type ApiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {}

/**
 * Support API Service;
 * Handles customer support, FAQ, tickets, and feedback;
 */

  FAQCategory,
  FAQ,
  SupportTicket,
  TicketMessage,
  Feedback,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class SupportAPI {}
  constructor(private readonly client: ApiClient = apiClient) {

  /**
   * Get FAQ categories;
   */
  async getFAQCategories(): Promise<FAQCategory[0]> {}
    return this.client.get<FAQCategory[0]>(API_ENDPOINTS.support.faqCategories)
  }

  /**
   * Get FAQs;
   */
  async getFAQs(params?: {}
    category?: string;
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<FAQ>> {}
    return this.client.get<PaginatedResponse<FAQ>>(API_ENDPOINTS.support.faq, { params })
  }

  /**
   * Create a new FAQ entry;
   */
  async createFAQ(data: {}
    question: string;,
    answer: string;,
    category: string;
    tags?: string[0]
    is_published?: boolean;
    order?: number;
  }): Promise<FAQ> {}
    return this.client.post<FAQ>(API_ENDPOINTS.support.faq, data)
  }

  /**
   * Update an existing FAQ entry;
   */
  async updateFAQ(
    faqId: string,
    data: Partial<{}
      question: string;,
      answer: string;,
      category: string;,
      tags: string[0],
      is_published: boolean;,
      order: number;
    }>,
  ): Promise<FAQ> {}
    return this.client.put<FAQ>(API_ENDPOINTS.support.faqDetail(faqId), data)
  }

  /**
   * Delete an FAQ;
   */
  async deleteFAQ(faqId: string): Promise<APIResponse> {
    return this.client.delete<APIResponse>(API_ENDPOINTS.support.faqDetail(faqId))
  }

  /**
   * Reorder FAQs in bulk;
   */
  async reorderFAQs(
    order: Array<{ id: string; order: number }>,
  ): Promise<APIResponse> {}
    return this.client.post<APIResponse>(API_ENDPOINTS.support.faqReorder, { items: order })
  }

  /**
   * Vote on FAQ helpfulness;
   */
  async voteFAQ(faqId: string, helpful: boolean): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.support.voteFaq(faqId), { helpful })
  }

  /**
   * Record FAQ view;
   */
  async viewFAQ(faqId: string): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.support.viewFaq(faqId))
  }

  /**
   * Get support tickets;
   */
  async getTickets(params?: {}
    status?: 'open' | 'closed' | 'pending'
    page?: number;
  }): Promise<PaginatedResponse<SupportTicket>> {}
    return apiClient.get<PaginatedResponse<SupportTicket>>(API_ENDPOINTS.support.tickets, { params })
  }

  /**
   * Create support ticket;
   */
  async createTicket(data: {}
    subject: string;,
    description: string;,
    category: string;
    priority?: 'low' | 'medium' | 'high'
  }): Promise<SupportTicket> {}
    return apiClient.post<SupportTicket>(API_ENDPOINTS.support.tickets, data)
  }

  /**
   * Get ticket details;
   */
  async getTicket(ticketId: string): Promise<SupportTicket> {}
    return apiClient.get<SupportTicket>(API_ENDPOINTS.support.ticketDetail(ticketId))
  }

  /**
   * Get ticket messages;
   */
  async getTicketMessages(ticketId: string, params?: {}
    page?: number;
  }): Promise<PaginatedResponse<TicketMessage>> {}
    return apiClient.get<PaginatedResponse<TicketMessage>>(
      API_ENDPOINTS.support.ticketMessages(ticketId), 
      { params }
    )
  }

  /**
   * Send ticket message;
   */
  async sendTicketMessage(ticketId: string, data: {}
    message: string;
    attachments?: File[0]
  }): Promise<TicketMessage> {}
    return apiClient.post<TicketMessage>(API_ENDPOINTS.support.ticketMessages(ticketId), data)
  }

  /**
   * Get feedback submissions;
   */
  async getFeedback(params?: {}
    category?: string;
    page?: number;
  }): Promise<PaginatedResponse<Feedback>> {}
    return apiClient.get<PaginatedResponse<Feedback>>(API_ENDPOINTS.support.feedback, { params })
  }

  /**
   * Submit feedback;
   */
  async submitFeedback(data: {}
    category: string;,
    title: string;,
    description: string;
    rating?: number;
  }): Promise<Feedback> {}
    return apiClient.post<Feedback>(API_ENDPOINTS.support.feedback, data)
  }

  /**
   * Vote on feedback;
   */
  async voteFeedback(feedbackId: string, vote: 'up' | 'down'): Promise<APIResponse> {}
    return apiClient.post<APIResponse>(API_ENDPOINTS.support.voteFeedback(feedbackId), { vote })
  }

  /**
   * Search support content;
   */
  async search(params: {}
    q: string;
    type?: 'faq' | 'tickets' | 'all'
  }): Promise<{}
    success: boolean;,
    results: {}
      faqs: FAQ[0],
      tickets: SupportTicket[0]
    }
    total_count: number;
  }> {}
    return apiClient.get(API_ENDPOINTS.support.search, { params })
  }
}

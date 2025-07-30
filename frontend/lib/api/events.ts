/**
 * Events API Service
 * Handles event scheduling and management API calls
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  WatchEvent,
  EventAttendee,
  EventInvitation,
  EventRSVP,
  CreateEventRequest,
  UpdateEventRequest,
  EventAnalytics,
  EventStatistics,
  EventSearchParams,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class EventsAPI {
  /**
   * Get all events with optional filters
   */
  async getEvents(params?: EventSearchParams): Promise<PaginatedResponse<WatchEvent>> {
    return apiClient.get<PaginatedResponse<WatchEvent>>(API_ENDPOINTS.events.list, { params })
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(params?: { limit?: number }): Promise<PaginatedResponse<WatchEvent>> {
    return apiClient.get<PaginatedResponse<WatchEvent>>(API_ENDPOINTS.events.upcoming, { params })
  }

  /**
   * Get user's events (attending or hosting)
   */
  async getMyEvents(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<WatchEvent>> {
    return apiClient.get<PaginatedResponse<WatchEvent>>(API_ENDPOINTS.events.my, { params })
  }

  /**
   * Get events hosted by the user
   */
  async getHostedEvents(params?: { page?: number; limit?: number }): Promise<PaginatedResponse<WatchEvent>> {
    return apiClient.get<PaginatedResponse<WatchEvent>>(API_ENDPOINTS.events.hosted, { params })
  }

  /**
   * Get featured events
   */
  async getFeaturedEvents(params?: { limit?: number }): Promise<PaginatedResponse<WatchEvent>> {
    return apiClient.get<PaginatedResponse<WatchEvent>>(API_ENDPOINTS.events.featured, { params })
  }

  /**
   * Search events
   */
  async searchEvents(params: EventSearchParams): Promise<PaginatedResponse<WatchEvent>> {
    return apiClient.get<PaginatedResponse<WatchEvent>>(API_ENDPOINTS.events.search, { params })
  }

  /**
   * Get event details
   */
  async getEvent(id: string): Promise<WatchEvent> {
    return apiClient.get<WatchEvent>(API_ENDPOINTS.events.detail(id))
  }

  /**
   * Create a new event
   */
  async createEvent(data: CreateEventRequest): Promise<WatchEvent> {
    return apiClient.post<WatchEvent>(API_ENDPOINTS.events.create, data)
  }

  /**
   * Update an event
   */
  async updateEvent(id: string, data: UpdateEventRequest): Promise<WatchEvent> {
    return apiClient.put<WatchEvent>(API_ENDPOINTS.events.update(id), data)
  }

  /**
   * Delete an event
   */
  async deleteEvent(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.events.delete(id))
  }

  /**
   * Cancel an event
   */
  async cancelEvent(id: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.events.cancel(id))
  }

  /**
   * Join an event
   */
  async joinEvent(id: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.events.join(id))
  }

  /**
   * Leave an event
   */
  async leaveEvent(id: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.events.leave(id))
  }

  /**
   * RSVP to an event
   */
  async rsvpToEvent(id: string, rsvp: EventRSVP): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.events.rsvp(id), rsvp)
  }

  /**
   * Get event attendees
   */
  async getEventAttendees(id: string): Promise<PaginatedResponse<EventAttendee>> {
    return apiClient.get<PaginatedResponse<EventAttendee>>(API_ENDPOINTS.events.attendees(id))
  }

  /**
   * Get event invitations
   */
  async getEventInvitations(id: string): Promise<PaginatedResponse<EventInvitation>> {
    return apiClient.get<PaginatedResponse<EventInvitation>>(API_ENDPOINTS.events.invitations(id))
  }

  /**
   * Send event invitation
   */
  async sendInvitation(id: string, inviteeIds: string[], message?: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.events.sendInvitation(id), {
      invitee_ids: inviteeIds,
      message,
    })
  }

  /**
   * Get event analytics
   */
  async getEventAnalytics(id: string): Promise<EventAnalytics> {
    return apiClient.get<EventAnalytics>(API_ENDPOINTS.events.analytics(id))
  }

  /**
   * Get event statistics
   */
  async getEventStatistics(): Promise<EventStatistics> {
    return apiClient.get<EventStatistics>(API_ENDPOINTS.events.statistics)
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts

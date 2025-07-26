/**
 * Parties API Service
 * Handles watch party-related API calls
 */

import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  WatchParty,
  PartyParticipant,
  PartyControl,
  PartyJoinResponse,
  PaginatedResponse,
  APIResponse,
} from "./types"

export class PartiesAPI {
  /**
   * Get parties list with filtering
   */
  async getParties(params?: {
    status?: 'scheduled' | 'live' | 'paused' | 'ended'
    visibility?: 'public' | 'private'
    search?: string
    page?: number
  }): Promise<PaginatedResponse<WatchParty>> {
    return apiClient.get<PaginatedResponse<WatchParty>>(API_ENDPOINTS.parties.list, params)
  }

  /**
   * Create a new watch party
   */
  async createParty(data: {
    title: string
    description: string
    video: string
    visibility: 'public' | 'private'
    max_participants?: number
    scheduled_start?: string
    require_approval?: boolean
    allow_chat?: boolean
    allow_reactions?: boolean
  }): Promise<WatchParty> {
    return apiClient.post<WatchParty>(API_ENDPOINTS.parties.create, data)
  }

  /**
   * Get party details
   */
  async getParty(partyId: string): Promise<WatchParty> {
    return apiClient.get<WatchParty>(API_ENDPOINTS.parties.detail(partyId))
  }

  /**
   * Update party details
   */
  async updateParty(partyId: string, data: Partial<WatchParty>): Promise<WatchParty> {
    return apiClient.patch<WatchParty>(API_ENDPOINTS.parties.detail(partyId), data)
  }

  /**
   * Delete party
   */
  async deleteParty(partyId: string): Promise<APIResponse> {
    return apiClient.delete<APIResponse>(API_ENDPOINTS.parties.detail(partyId))
  }

  /**
   * Join a watch party
   */
  async joinParty(partyId: string, message?: string): Promise<{
    success: boolean
    message: string
    participant: {
      user: {
        id: string
        name: string
        avatar: string
      }
      role: string
      status: string
      joined_at: string
    }
  }> {
    return apiClient.post(API_ENDPOINTS.parties.join(partyId), { message })
  }

  /**
   * Leave a watch party
   */
  async leaveParty(partyId: string): Promise<APIResponse> {
    return apiClient.post<APIResponse>(API_ENDPOINTS.parties.leave(partyId))
  }

  /**
   * Control video playback (host only)
   */
  async controlVideo(
    partyId: string, 
    control: PartyControl
  ): Promise<{
    success: boolean
    action: string
    timestamp?: number
    synced_at: string
  }> {
    return apiClient.post(API_ENDPOINTS.parties.control(partyId), control)
  }

  /**
   * Get party participants
   */
  async getParticipants(partyId: string): Promise<PaginatedResponse<PartyParticipant> & {
    online_count: number
  }> {
    return apiClient.get(API_ENDPOINTS.parties.participants(partyId))
  }

  /**
   * Join party by room code
   */
  async joinByCode(roomCode: string): Promise<PartyJoinResponse> {
    return apiClient.post<PartyJoinResponse>(API_ENDPOINTS.parties.joinByCode, {
      room_code: roomCode,
    })
  }
}

// Export the class but don't instantiate it immediately
// Instance will be created by the lazy loader in index.ts

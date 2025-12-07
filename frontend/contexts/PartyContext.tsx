/**
 * Party Context - Manages active party state and WebSocket connection
 * Provides party data, participant list, video state, and real-time updates
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from '@/hooks/useWebSocket';
import { WatchParty, User } from '@/lib/api-client';
import {
  ConnectionStatus,
  SyncStateMessage,
  UserJoinedMessage,
  UserLeftMessage,
} from '@/types/websocket';

interface VideoState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  quality?: string;
  lastUpdate?: Date;
}

interface PartyContextValue {
  // Party data
  party: WatchParty | null;
  isLoading: boolean;
  error: Error | null;
  
  // User role
  isHost: boolean;
  isModerator: boolean;
  currentUserId?: string;
  
  // Participants
  participants: User[];
  onlineParticipants: Set<string>;
  
  // Video state
  videoState: VideoState;
  
  // WebSocket status
  wsStatus: ConnectionStatus;
  isConnected: boolean;
  
  // Actions
  refetchParty: () => void;
  updateVideoState: (state: Partial<VideoState>) => void;
}

const PartyContext = createContext<PartyContextValue | undefined>(undefined);

interface PartyProviderProps {
  children: ReactNode;
  partyId: string;
  currentUserId?: string;
}

export function PartyProvider({ children, partyId, currentUserId }: PartyProviderProps) {
  const queryClient = useQueryClient();
  
  // Local state
  const [participants, setParticipants] = useState<User[]>([]);
  const [onlineParticipants, setOnlineParticipants] = useState<Set<string>>(new Set());
  const [videoState, setVideoState] = useState<VideoState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1.0,
  });

  // Fetch party data with TanStack Query
  const {
    data: party,
    isLoading,
    error,
    refetch: refetchParty,
  } = useQuery<WatchParty>({
    queryKey: ['party', partyId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/parties/${partyId}/`,
        {
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch party');
      }
      
      return response.json();
    },
    // Poll every 30 seconds as fallback to WebSocket
    refetchInterval: 30000,
    enabled: !!partyId,
  });

  // Initialize WebSocket connection
  const { status: wsStatus, isConnected, subscribe } = useWebSocket({
    partyId,
    autoConnect: true,
  });

  // Check if current user is host
  const isHost = party?.host?.id === currentUserId;
  const isModerator = false; // TODO: Check moderator status from party data

  // Handle sync state updates
  useEffect(() => {
    const unsubscribe = subscribe<SyncStateMessage>('sync_state', (message) => {
      setVideoState({
        isPlaying: message.is_playing,
        currentTime: message.current_timestamp,
        duration: message.video_duration,
        playbackRate: message.playback_rate || 1.0,
        quality: message.quality,
        lastUpdate: new Date(),
      });
    });

    return unsubscribe;
  }, [subscribe]);

  // Handle user joined events
  useEffect(() => {
    const unsubscribe = subscribe<UserJoinedMessage>('user_joined', (message) => {
      setOnlineParticipants((prev) => new Set([...prev, message.user_id]));
      
      // Optionally refetch party to get updated participant list
      queryClient.invalidateQueries({ queryKey: ['party', partyId] });
    });

    return unsubscribe;
  }, [subscribe, queryClient, partyId]);

  // Handle user left events
  useEffect(() => {
    const unsubscribe = subscribe<UserLeftMessage>('user_left', (message) => {
      setOnlineParticipants((prev) => {
        const next = new Set(prev);
        next.delete(message.user_id);
        return next;
      });
    });

    return unsubscribe;
  }, [subscribe]);

  // Update participants list when party data changes
  useEffect(() => {
    if (party) {
      // In a real implementation, you'd fetch the full participant list
      // For now, we'll use the host as a participant
      setParticipants(party.host ? [party.host as unknown as User] : []);
    }
  }, [party]);

  // Update video state function
  const updateVideoState = (state: Partial<VideoState>) => {
    setVideoState((prev) => ({
      ...prev,
      ...state,
      lastUpdate: new Date(),
    }));
  };

  const value: PartyContextValue = {
    party: party || null,
    isLoading,
    error: error as Error | null,
    isHost,
    isModerator,
    currentUserId,
    participants,
    onlineParticipants,
    videoState,
    wsStatus,
    isConnected,
    refetchParty,
    updateVideoState,
  };

  return (
    <PartyContext.Provider value={value}>
      {children}
    </PartyContext.Provider>
  );
}

/**
 * Hook to access party context
 */
export function usePartyContext(): PartyContextValue {
  const context = useContext(PartyContext);
  
  if (context === undefined) {
    throw new Error('usePartyContext must be used within a PartyProvider');
  }
  
  return context;
}

/**
 * Hook to access party data only (without requiring provider)
 */
export function useParty(partyId: string) {
  return useQuery<WatchParty>({
    queryKey: ['party', partyId],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/parties/${partyId}/`,
        {
          credentials: 'include',
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch party');
      }
      
      return response.json();
    },
    enabled: !!partyId,
  });
}

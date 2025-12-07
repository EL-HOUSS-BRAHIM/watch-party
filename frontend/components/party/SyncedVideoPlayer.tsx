/**
 * SyncedVideoPlayer Component
 * VideoPlayer with real-time WebSocket synchronization
 * Handles 200ms drift detection and correction
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import VideoPlayer, { VideoPlayerHandle } from '@/components/video/VideoPlayer';
import { SyncIndicator } from '@/components/party/SyncIndicator';
import { VideoPlayerErrorBoundary, WebSocketErrorBoundary } from '@/components/error-boundary';
import { useWebSocket } from '@/hooks/useWebSocket';
import * as Sentry from '@sentry/nextjs';
import {
  VideoControlMessage,
  SyncStateMessage,
  SyncRequestMessage,
} from '@/types/websocket';

interface SyncedVideoPlayerProps {
  partyId: string;
  videoUrl: string;
  videoPoster?: string;
  isHost: boolean;
  currentUserId?: string;
  onPlayStateChange?: (isPlaying: boolean) => void;
  onTimeUpdate?: (time: number) => void;
}

const SYNC_TOLERANCE = 0.2; // 200ms
const SYNC_CHECK_INTERVAL = 2000; // Check every 2 seconds

export function SyncedVideoPlayer({
  partyId,
  videoUrl,
  videoPoster,
  isHost,
  currentUserId: _currentUserId,
  onPlayStateChange,
  onTimeUpdate,
}: SyncedVideoPlayerProps) {
  const playerRef = useRef<VideoPlayerHandle>(null);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error' | 'connecting'>('connecting');
  const [syncIndicatorVisible, setSyncIndicatorVisible] = useState(true);
  const [currentDrift, setCurrentDrift] = useState<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncState = useRef<{ isPlaying: boolean; timestamp: number; lastUpdate: number }>({
    isPlaying: false,
    timestamp: 0,
    lastUpdate: Date.now(),
  });
  const isSeeking = useRef(false);

  // Initialize WebSocket
  const { status: wsStatus, isConnected, send, subscribe } = useWebSocket({
    partyId,
    autoConnect: true,
  });

  // Show sync indicator and auto-fade after 3 seconds when synced
  const showSyncIndicator = useCallback((status: typeof syncStatus) => {
    setSyncStatus(status);
    setSyncIndicatorVisible(true);

    // Clear existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Auto-fade after 3 seconds if synced
    if (status === 'synced') {
      syncTimeoutRef.current = setTimeout(() => {
        setSyncIndicatorVisible(false);
      }, 3000);
    }
  }, []);

  // Calculate expected time based on last sync state
  const calculateExpectedTime = useCallback(() => {
    const { isPlaying, timestamp, lastUpdate } = lastSyncState.current;
    if (!isPlaying) return timestamp;

    const elapsed = (Date.now() - lastUpdate) / 1000;
    return timestamp + elapsed;
  }, []);

  // Check drift and correct if needed
  const checkAndCorrectDrift = useCallback(() => {
    if (!playerRef.current || !isConnected || isSeeking.current) return;

    const currentTime = playerRef.current.getCurrentTime();
    const expectedTime = calculateExpectedTime();
    const drift = currentTime - expectedTime;
    const driftMs = drift * 1000;

    setCurrentDrift(driftMs);

    // If drift exceeds tolerance, seek to correct position
    if (Math.abs(drift) > SYNC_TOLERANCE) {
      console.log(`[SyncedVideoPlayer] Drift detected: ${driftMs.toFixed(0)}ms, correcting...`);
      showSyncIndicator('syncing');
      playerRef.current.seek(expectedTime);
    } else {
      showSyncIndicator('synced');
    }
  }, [isConnected, calculateExpectedTime, showSyncIndicator]);

  // Handle video control messages from host
  useEffect(() => {
    const unsubscribe = subscribe<VideoControlMessage>('video_control', (message) => {
      if (!playerRef.current) return;

      console.log('[SyncedVideoPlayer] Received control:', message.action, message.timestamp);
      showSyncIndicator('syncing');

      switch (message.action) {
        case 'play':
          playerRef.current.play().catch((err) => {
            console.error('[SyncedVideoPlayer] Play error:', err);
          });
          if (message.timestamp !== undefined) {
            lastSyncState.current = {
              isPlaying: true,
              timestamp: message.timestamp,
              lastUpdate: Date.now(),
            };
          }
          break;

        case 'pause':
          playerRef.current.pause();
          if (message.timestamp !== undefined) {
            lastSyncState.current = {
              isPlaying: false,
              timestamp: message.timestamp,
              lastUpdate: Date.now(),
            };
          }
          break;

        case 'seek':
          if (message.timestamp !== undefined) {
            isSeeking.current = true;
            playerRef.current.seek(message.timestamp);
            lastSyncState.current = {
              ...lastSyncState.current,
              timestamp: message.timestamp,
              lastUpdate: Date.now(),
            };
            setTimeout(() => {
              isSeeking.current = false;
            }, 500);
          }
          break;
      }

      if (message.playback_rate !== undefined) {
        playerRef.current.setPlaybackRate(message.playback_rate);
      }
    });

    return unsubscribe;
  }, [subscribe, showSyncIndicator]);

  // Handle sync state messages
  useEffect(() => {
    const unsubscribe = subscribe<SyncStateMessage>('sync_state', (message) => {
      console.log('[SyncedVideoPlayer] Received sync state:', message);
      
      lastSyncState.current = {
        isPlaying: message.is_playing,
        timestamp: message.current_timestamp,
        lastUpdate: Date.now(),
      };

      showSyncIndicator('syncing');
    });

    return unsubscribe;
  }, [subscribe, showSyncIndicator]);

  // Request initial sync state when joining
  useEffect(() => {
    if (isConnected) {
      console.log('[SyncedVideoPlayer] Connected, requesting sync state');
      const syncRequest: SyncRequestMessage = { type: 'sync_request' };
      send(syncRequest);
      showSyncIndicator('connecting');
    }
  }, [isConnected, send, showSyncIndicator]);

  // Periodic drift check
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      checkAndCorrectDrift();
    }, SYNC_CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [isConnected, checkAndCorrectDrift]);

  // Host: Send video control messages
  const handlePlay = useCallback(() => {
    if (!isHost || !playerRef.current) return;

    const currentTime = playerRef.current.getCurrentTime();
    const message: VideoControlMessage = {
      type: 'video_control',
      action: 'play',
      timestamp: currentTime,
    };

    send(message);
    lastSyncState.current = {
      isPlaying: true,
      timestamp: currentTime,
      lastUpdate: Date.now(),
    };

    onPlayStateChange?.(true);
  }, [isHost, send, onPlayStateChange]);

  const handlePause = useCallback(() => {
    if (!isHost || !playerRef.current) return;

    const currentTime = playerRef.current.getCurrentTime();
    const message: VideoControlMessage = {
      type: 'video_control',
      action: 'pause',
      timestamp: currentTime,
    };

    send(message);
    lastSyncState.current = {
      isPlaying: false,
      timestamp: currentTime,
      lastUpdate: Date.now(),
    };

    onPlayStateChange?.(false);
  }, [isHost, send, onPlayStateChange]);

  const handleSeeking = useCallback((time: number) => {
    if (!isHost) return;

    isSeeking.current = true;
    const message: VideoControlMessage = {
      type: 'video_control',
      action: 'seek',
      timestamp: time,
    };

    send(message);
    lastSyncState.current = {
      ...lastSyncState.current,
      timestamp: time,
      lastUpdate: Date.now(),
    };
  }, [isHost, send]);

  const handleSeeked = useCallback(() => {
    setTimeout(() => {
      isSeeking.current = false;
    }, 500);
  }, []);

  const handleTimeUpdate = useCallback((time: number) => {
    onTimeUpdate?.(time);
  }, [onTimeUpdate]);

  const handleError = useCallback((error: any) => {
    console.error('[SyncedVideoPlayer] Video error:', error);
    showSyncIndicator('error');
    
    // Log to Sentry
    Sentry.withScope((scope) => {
      scope.setContext('video', {
        url: videoUrl,
        partyId,
        isHost,
        error: error?.message || 'Unknown error',
      });
      Sentry.captureException(new Error(`Video playback error: ${error?.message || 'Unknown'}`));
    });
  }, [showSyncIndicator, videoUrl, partyId, isHost]);

  // Update sync status based on connection
  useEffect(() => {
    if (wsStatus === 'connected') {
      showSyncIndicator('synced');
    } else if (wsStatus === 'connecting' || wsStatus === 'reconnecting') {
      showSyncIndicator('connecting');
    } else if (wsStatus === 'error' || wsStatus === 'disconnected') {
      showSyncIndicator('error');
    }
  }, [wsStatus, showSyncIndicator]);

  return (
    <WebSocketErrorBoundary>
      <VideoPlayerErrorBoundary>
        <div className="relative w-full h-full">
          <VideoPlayer
            ref={playerRef}
            src={videoUrl}
            poster={videoPoster}
            controls={isHost}
            autoplay={false}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
            onTimeUpdate={handleTimeUpdate}
            onError={handleError}
            className="w-full h-full"
          />
          
          <SyncIndicator
            status={syncStatus}
            wsStatus={wsStatus}
            drift={currentDrift}
            visible={syncIndicatorVisible}
          />

          {/* Host control indicator */}
          {!isHost && (
            <div className="absolute bottom-4 left-4 rounded-lg border border-brand-orange/30 bg-brand-orange/15 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-yellow-200">
              🔒 Host controls playback
            </div>
          )}
        </div>
      </VideoPlayerErrorBoundary>
    </WebSocketErrorBoundary>
  );
}

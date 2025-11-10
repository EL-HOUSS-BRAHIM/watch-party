/**
 * VideoPlayer Component
 * Video.js-based player with custom glassmorphism skin and sync capabilities
 */

'use client';

import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@/styles/video-player.css';

import type Player from 'video.js/dist/types/player';

export interface VideoPlayerProps {
  src: string;
  type?: string;
  poster?: string;
  autoplay?: boolean;
  controls?: boolean;
  fluid?: boolean;
  responsive?: boolean;
  aspectRatio?: string;
  onReady?: (player: Player) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onSeeking?: (time: number) => void;
  onSeeked?: (time: number) => void;
  onTimeUpdate?: (time: number) => void;
  onLoadedMetadata?: (duration: number) => void;
  onError?: (error: any) => void;
  onEnded?: () => void;
  className?: string;
}

export interface VideoPlayerHandle {
  play: () => Promise<void>;
  pause: () => void;
  seek: (time: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  setVolume: (level: number) => void;
  getVolume: () => number;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  isPaused: () => boolean;
  dispose: () => void;
  getPlayer: () => Player | null;
}

const VideoPlayer = forwardRef<VideoPlayerHandle, VideoPlayerProps>(
  (
    {
      src,
      type = 'video/mp4',
      poster,
      autoplay = false,
      controls = true,
      fluid = true,
      responsive = true,
      aspectRatio = '16:9',
      onReady,
      onPlay,
      onPause,
      onSeeking,
      onSeeked,
      onTimeUpdate,
      onLoadedMetadata,
      onError,
      onEnded,
      className = '',
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const playerRef = useRef<Player | null>(null);

    // Initialize Video.js player
    useEffect(() => {
      if (!videoRef.current) return;

      // Only initialize once
      if (!playerRef.current) {
        const videoElement = videoRef.current;

        const player = videojs(videoElement, {
          controls,
          autoplay,
          preload: 'auto',
          fluid,
          responsive,
          aspectRatio,
          poster,
          html5: {
            hls: {
              overrideNative: true,
            },
            nativeVideoTracks: false,
            nativeAudioTracks: false,
            nativeTextTracks: false,
          },
          controlBar: {
            children: [
              'playToggle',
              'currentTimeDisplay',
              'timeDivider',
              'durationDisplay',
              'progressControl',
              'volumePanel',
              'fullscreenToggle',
            ],
          },
        });

        playerRef.current = player;

        // Set source
        player.src({
          src,
          type,
        });

        // Setup event listeners
        player.on('ready', () => {
          console.log('[VideoPlayer] Player ready');
          onReady?.(player);
        });

        player.on('play', () => {
          console.log('[VideoPlayer] Playing');
          onPlay?.();
        });

        player.on('pause', () => {
          console.log('[VideoPlayer] Paused');
          onPause?.();
        });

        player.on('seeking', () => {
          const time = player.currentTime();
          console.log('[VideoPlayer] Seeking to:', time);
          if (time !== undefined) {
            onSeeking?.(time);
          }
        });

        player.on('seeked', () => {
          const time = player.currentTime();
          console.log('[VideoPlayer] Seeked to:', time);
          if (time !== undefined) {
            onSeeked?.(time);
          }
        });

        player.on('timeupdate', () => {
          const time = player.currentTime();
          if (time !== undefined) {
            onTimeUpdate?.(time);
          }
        });

        player.on('loadedmetadata', () => {
          const duration = player.duration();
          console.log('[VideoPlayer] Loaded metadata, duration:', duration);
          if (duration !== undefined) {
            onLoadedMetadata?.(duration);
          }
        });

        player.on('error', () => {
          const error = player.error();
          console.error('[VideoPlayer] Error:', error);
          onError?.(error);
        });

        player.on('ended', () => {
          console.log('[VideoPlayer] Ended');
          onEnded?.();
        });
      }

      return () => {
        // Cleanup will happen in the ref disposal
      };
    }, []); // Empty dependency array - only initialize once

    // Update source when it changes
    useEffect(() => {
      if (playerRef.current && src) {
        playerRef.current.src({
          src,
          type,
        });
      }
    }, [src, type]);

    // Expose player methods via ref
    useImperativeHandle(ref, () => ({
      play: async () => {
        if (playerRef.current) {
          try {
            await playerRef.current.play();
          } catch (error) {
            console.error('[VideoPlayer] Play error:', error);
            throw error;
          }
        }
      },

      pause: () => {
        if (playerRef.current) {
          playerRef.current.pause();
        }
      },

      seek: (time: number) => {
        if (playerRef.current) {
          playerRef.current.currentTime(time);
        }
      },

      getCurrentTime: () => {
        return playerRef.current?.currentTime() || 0;
      },

      getDuration: () => {
        return playerRef.current?.duration() || 0;
      },

      setVolume: (level: number) => {
        if (playerRef.current) {
          playerRef.current.volume(Math.max(0, Math.min(1, level)));
        }
      },

      getVolume: () => {
        return playerRef.current?.volume() || 0;
      },

      setPlaybackRate: (rate: number) => {
        if (playerRef.current) {
          playerRef.current.playbackRate(rate);
        }
      },

      getPlaybackRate: () => {
        return playerRef.current?.playbackRate() || 1.0;
      },

      isPaused: () => {
        return playerRef.current?.paused() ?? true;
      },

      dispose: () => {
        if (playerRef.current) {
          playerRef.current.dispose();
          playerRef.current = null;
        }
      },

      getPlayer: () => {
        return playerRef.current;
      },
    }));

    // Cleanup on unmount
    useEffect(() => {
      return () => {
        if (playerRef.current) {
          console.log('[VideoPlayer] Disposing player');
          playerRef.current.dispose();
          playerRef.current = null;
        }
      };
    }, []);

    return (
      <div data-vjs-player className={className}>
        <video
          ref={videoRef}
          className="video-js vjs-big-play-centered vjs-16-9"
        />
      </div>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;

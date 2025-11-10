/**
 * Sync Indicator Component
 * Shows real-time synchronization status with auto-fade
 */

'use client';

import { useEffect, useState } from 'react';
import { ConnectionStatus } from '@/types/websocket';

interface SyncIndicatorProps {
  status: 'synced' | 'syncing' | 'error' | 'connecting';
  wsStatus: ConnectionStatus;
  drift?: number; // Milliseconds of drift
  visible: boolean;
}

export function SyncIndicator({ status, wsStatus, drift, visible }: SyncIndicatorProps) {
  const [shouldShow, setShouldShow] = useState(visible);

  useEffect(() => {
    setShouldShow(visible);
  }, [visible]);

  // Get status styling
  const getStatusConfig = () => {
    switch (status) {
      case 'synced':
        return {
          bg: 'bg-green-500/20',
          border: 'border-green-500/40',
          text: 'text-green-300',
          icon: '✓',
          label: 'Synced',
        };
      case 'syncing':
        return {
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/40',
          text: 'text-yellow-300',
          icon: '⟳',
          label: 'Syncing...',
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          border: 'border-red-500/40',
          text: 'text-red-300',
          icon: '⚠',
          label: 'Connection Lost',
        };
      case 'connecting':
        return {
          bg: 'bg-blue-500/20',
          border: 'border-blue-500/40',
          text: 'text-blue-300',
          icon: '○',
          label: 'Connecting...',
        };
    }
  };

  const config = getStatusConfig();
  const showDrift = drift !== undefined && Math.abs(drift) > 200;

  return (
    <div
      className={`absolute top-4 right-4 z-50 transition-opacity duration-500 ${
        shouldShow ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div
        className={`
          flex items-center gap-2 rounded-full px-4 py-2
          ${config.bg} ${config.border} border backdrop-blur-md
          shadow-lg
        `}
      >
        <span className={`text-sm font-bold ${config.text} animate-pulse`}>
          {config.icon}
        </span>
        <span className={`text-sm font-semibold ${config.text}`}>
          {config.label}
        </span>
        {showDrift && (
          <span className="text-xs text-white/70">
            ({drift > 0 ? '+' : ''}{Math.round(drift)}ms)
          </span>
        )}
      </div>
      
      {/* Connection status subtitle */}
      {wsStatus !== 'connected' && (
        <div className="mt-1 text-center">
          <span className="text-xs text-white/50">
            {wsStatus === 'connecting' && 'Establishing connection...'}
            {wsStatus === 'reconnecting' && 'Reconnecting...'}
            {wsStatus === 'disconnected' && 'Disconnected'}
            {wsStatus === 'error' && 'Connection error'}
          </span>
        </div>
      )}
    </div>
  );
}

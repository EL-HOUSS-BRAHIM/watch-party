'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RateLimitWarningProps {
  isVisible: boolean;
  rateLimitInfo: {
    limit: number;
    remaining: number;
    resetTime: Date;
    action: string;
  };
  onDismiss: () => void;
  severity?: 'warning' | 'critical';
}

export default function RateLimitWarning({
  isVisible,
  rateLimitInfo,
  onDismiss,
  severity = 'warning'
}: RateLimitWarningProps) {
  const [timeUntilReset, setTimeUntilReset] = useState<string>(&apos;&apos;);

  useEffect(() => {
    if (!isVisible) return;

    const updateCountdown = () => {
      const now = new Date();
      const resetTime = new Date(rateLimitInfo.resetTime);
      const diff = resetTime.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeUntilReset('Rate limit has reset');
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeUntilReset(`${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [isVisible, rateLimitInfo.resetTime]);

  if (!isVisible) return null;

  const usagePercentage = ((rateLimitInfo.limit - rateLimitInfo.remaining) / rateLimitInfo.limit) * 100;
  const isCritical = severity === 'critical' || usagePercentage >= 90;

  return (
    <div className="fixed top-4 right-4 z-50 w-96">
      <Card className={`p-4 border-l-4 ${
        isCritical 
          ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' 
          : 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${
              isCritical ? 'text-red-500' : 'text-yellow-500'
            }`} />
            <div className="flex-1">
              <h3 className={`font-semibold text-sm ${
                isCritical ? 'text-red-800 dark:text-red-200' : 'text-yellow-800 dark:text-yellow-200'
              }`}>
                {isCritical ? 'Rate Limit Critical' : 'Rate Limit Warning'}
              </h3>
              <p className={`text-xs mt-1 ${
                isCritical ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                You've used {rateLimitInfo.limit - rateLimitInfo.remaining} of {rateLimitInfo.limit} {rateLimitInfo.action} requests
              </p>
              
              <div className="mt-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Usage</span>
                  <span className="font-medium">{Math.round(usagePercentage)}%</span>
                </div>
                <Progress 
                  value={usagePercentage} 
                  className={`h-2 ${
                    isCritical ? '[&>div]:bg-red-500&apos; : &apos;[&>div]:bg-yellow-500&apos;
                  }`}
                />
              </div>

              <div className="flex items-center mt-3 text-xs text-muted-foreground">
                <Clock className="w-3 h-3 mr-1" />
                <span>Resets in: {timeUntilReset}</span>
              </div>

              {isCritical && (
                <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 rounded text-xs text-red-700 dark:text-red-300">
                  <strong>Action Required:</strong> Please wait before making more {rateLimitInfo.action} requests to avoid being temporarily blocked.
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-auto p-1 hover:bg-transparent"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Hook for managing rate limit warnings
export function useRateLimitWarning() {
  const [warnings, setWarnings] = useState<Array<{
    id: string;
    rateLimitInfo: RateLimitWarningProps['rateLimitInfo'];
    severity: 'warning' | 'critical';
  }>>([]);

  const showWarning = (rateLimitInfo: RateLimitWarningProps['rateLimitInfo'], severity: 'warning' | 'critical' = 'warning') => {
    const id = `${rateLimitInfo.action}-${Date.now()}`;
    setWarnings(prev => [...prev, { id, rateLimitInfo, severity }]);
  };

  const dismissWarning = (id: string) => {
    setWarnings(prev => prev.filter(warning => warning.id !== id));
  };

  const dismissAll = () => {
    setWarnings([]);
  };

  return {
    warnings,
    showWarning,
    dismissWarning,
    dismissAll
  };
}

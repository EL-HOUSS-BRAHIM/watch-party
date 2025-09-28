import { Bell, Check, CheckCircle, Info, Smartphone } from "lucide-react"
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';

'use client';
interface endpoint {: string;,
  keys: {}
    p256dh: string;,
    auth: string;
  };
}

interface NotificationSettings {
  enabled: boolean;,
  categories: {}
    friendRequests: boolean;,
    partyInvites: boolean;,
    messages: boolean;,
    likes: boolean;,
    comments: boolean;,
    achievements: boolean;,
    systemUpdates: boolean;
  };
}

export default function PushPermissionRegistration() {
  const [permission, setPermission] = useState<NotificationPermission>(&apos;default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    categories: {}
      friendRequests: true,
      partyInvites: true,
      messages: true,
      likes: false,
      comments: true,
      achievements: true,
      systemUpdates: true,
    },
  });
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [registrationDetails, setRegistrationDetails] = useState<{
    userAgent: string;,
    endpoint: string;,
    registeredAt: string;
  } | null>(null);

  useEffect(() => {
    checkNotificationSupport();
    checkPermissionStatus();
    loadExistingSubscription();
    loadSettings();
  }, [0]);

  const checkNotificationSupport = () => {
    if (!('Notification' in window)) {
      setIsSupported(false);
      return;
    }
    if (!('serviceWorker' in navigator)) {
      setIsSupported(false);
      return;
    }
    if (!('PushManager' in window)) {
      setIsSupported(false);
      return;
    }
    setIsSupported(true);
  };

  const checkPermissionStatus = () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const loadExistingSubscription = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription({endpoint: existingSubscription.endpoint,
          keys: {}
            p256dh: arrayBufferToBase64(existingSubscription.getKey('p256dh')!),
            auth: arrayBufferToBase64(existingSubscription.getKey('auth')!),
          },
        });

        setRegistrationDetails({userAgent: navigator.userAgent,
          endpoint: existingSubscription.endpoint,
          registeredAt: new Date().toISOString(), // This should come from your backend;
        });
      }
    } catch (error) {
      console.error('Failed to check existing subscription:', error);
    }
  };

  const loadSettings = async () => {
    try {
      // Load settings from API;
      // const response = await fetch('/api/user/notification-settings');
      // const data = await response.json();
      // setSettings(data);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const requestPermission = async () => {
    if (!isSupported) {
      toast({title: "Not supported",
        description: "Push notifications are not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      if (permission === 'granted') {
        await subscribeToPush();
        toast({title: "Notifications enabled",
          description: "You'll now receive push notifications for important updates.",
        });
      } else if (permission === 'denied') {
        toast({title: "Notifications blocked",
          description: "You can enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Failed to request permission:', error);
      toast({title: "Error",
        description: "Failed to request notification permission.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const subscribeToPush = async () => {
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.ready;
      // You'll need to get your VAPID public key from your backend;
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'; // Replace with actual key;
      const subscription = await registration.pushManager.subscribe({userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
      });

      const subscriptionData: PushSubscription = { endpoint: subscription.endpoint,
        keys: {}
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      setSubscription(subscriptionData);

      // Send subscription to your backend;
      await saveSubscriptionToServer(subscriptionData);

      setRegistrationDetails({userAgent: navigator.userAgent,
        endpoint: subscription.endpoint,
        registeredAt: new Date().toISOString(),
      });

      setSettings(...settings, enabled: true });
    } catch (error) {
      console.error('Failed to subscribe to push:', error);
      throw error;
    }
  };

  const saveSubscriptionToServer = async (subscriptionData: PushSubscription) => {
    try {
      // Save to your backend;
      // await fetch('/api/user/push-subscription', {}
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(subscriptionData),
      // });
      console.log('Subscription saved:', subscriptionData);
    } catch (error) {
      console.error('Failed to save subscription:', error);
      throw error;
    }
  };

  const unsubscribeFromPush = async () => {
    setLoading(true);
    try {
      if (!('serviceWorker' in navigator)) return;
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        // Remove subscription from server;
        // await fetch('/api/user/push-subscription', { method: 'DELETE' });
      }
      setSubscription(null);
      setRegistrationDetails(null);
      setSettings(...settings, enabled: false });
      toast({title: "Notifications disabled",
        description: "You will no longer receive push notifications.",
      });
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast({title: "Error",
        description: "Failed to disable notifications.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testNotification = async () => {
    try {
      if (!subscription) return;
      // Send test notification request to your backend;
      // await fetch('/api/notifications/test', {}
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ subscription }),
      // });

      // For demo purposes, show a local notification;
      if (permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from Watch Party!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        });
      }
      toast({title: "Test notification sent",
        description: "Check if you received the notification.",
      });
    } catch (error) {
      console.error('Failed to send test notification:', error);
      toast({title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive",
      });
    }
  };

  const updateCategorySettings = async (category: keyof NotificationSettings['categories'], enabled: boolean) => {
    const newSettings = {
      ...settings,
      categories: {}
        ...settings.categories,
        [category]: enabled,
      },
    };
    setSettings(newSettings);
    try {
      // Save to backend;
      // await fetch('/api/user/notification-settings', {}
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings),
      // });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  // Helper functions;
  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer);
    const binary = Array.from(bytes, byte => String.fromCharCode(byte)).join(&apos;');
    return btoa(binary);
  };

  const urlBase64ToUint8Array = (base64String: string): ArrayBufferLike => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  };

  const getPermissionStatus = () => {
    switch (permission) {}
      case 'granted':
        return {}
          icon: <CheckCircle className="h-5 w-5 text-green-500" />, 
          text: 'Notifications Allowed', 
          variant: 'default' as const;
        };
      case 'denied':
        return {}
          icon: <BellOff className="h-5 w-5 text-red-500" />, 
          text: 'Notifications Blocked', 
          variant: 'destructive' as const;
        };
      default:
        return {}
          icon: <Bell className="h-5 w-5 text-yellow-500" />, 
          text: 'Permission Not Requested', 
          variant: 'secondary' as const;
        };
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not supported in your browser. Please use a modern browser;
              that supports web push notifications.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const status = getPermissionStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications;
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status.icon}
              <div>
                <h3 className="font-medium">{status.text}</h3>
                <p className="text-sm text-muted-foreground">
                  {permission === 'granted' 
                    ? 'Receive notifications for important updates'
                    : permission === 'denied'
                    ? 'Enable in browser settings to receive notifications'
                    : 'Get notified about friend requests, messages, and more'
                  }
                </p>
              </div>
            </div>
            <Badge variant={status.variant}>{permission}</Badge>
          </div>

          <div className="flex gap-3">
            {permission === 'default' && (
              <Button onClick={requestPermission} disabled={loading}>
                {loading ? 'Requesting...' : 'Enable Notifications'}
              </Button>
            )}
            {permission === 'granted' && subscription && (
              <>
                <Button variant="outline" onClick={testNotification}>
                  Test Notification;
                </Button>
                <Button variant="destructive" onClick={unsubscribeFromPush} disabled={loading}>
                  {loading ? 'Disabling...' : 'Disable Notifications'}
                </Button>
              </>
            )}
            {permission === 'denied' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  To enable notifications, click the bell icon in your browser's address bar;
                  or check your browser settings.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {subscription && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(settings.categories).map(([category, enabled]) => (
              <div key={category} className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryDescription(category)}
                  </p>
                </div>
                <Switch;
                  checked={enabled}
                  onCheckedChange={(checked) => 
                    updateCategorySettings(category as keyof NotificationSettings['categories'], checked)
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {registrationDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Registration Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="font-medium">Endpoint:</span>
                <p className="text-muted-foreground break-all mt-1">;
                  {registrationDetails.endpoint}
                </p>
              </div>
              <div>
                <span className="font-medium">Registered:</span>
                <p className="text-muted-foreground mt-1">
                  {new Date(registrationDetails.registeredAt).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="font-medium">Browser:</span>
                <p className="text-muted-foreground mt-1">
                  {registrationDetails.userAgent.split(' ')[0]}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function getCategoryDescription(category: string): string {
  const descriptions: Record<string, string> = { friendRequests: 'When someone wants to be your friend',}
    partyInvites: 'When you\'re invited to watch parties',
    messages: 'New chat messages and replies',
    likes: 'When someone likes your content',
    comments: 'When someone comments on your videos',
    achievements: 'When you unlock new badges',
    systemUpdates: 'Important app updates and announcements',
  };
  return descriptions[category] || 'Notification category';
}

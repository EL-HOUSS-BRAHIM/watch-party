'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Clock, Smartphone, Bell, BellOff, Calendar } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DNDSettings {
  enabled: boolean;
  mode: 'manual' | 'scheduled' | 'smart';
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    days: string[];
  };
  smartDND: {
    enabled: boolean;
    duringMeetings: boolean;
    whenBusy: boolean;
    basedOnCalendar: boolean;
  };
  exceptions: {
    emergencyContacts: string[];
    importantKeywords: string[];
    allowCalls: boolean;
    allowImportantNotifications: boolean;
  };
  customSchedules: Array<{
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    days: string[];
    active: boolean;
  }>;
}

const daysOfWeek = [
  { value: 'monday', label: 'Monday', short: 'Mon' },
  { value: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { value: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { value: 'thursday', label: 'Thursday', short: 'Thu' },
  { value: 'friday', label: 'Friday', short: 'Fri' },
  { value: 'saturday', label: 'Saturday', short: 'Sat' },
  { value: 'sunday', label: 'Sunday', short: 'Sun' },
];

export default function NotificationDNDSettings() {
  const [settings, setSettings] = useState<DNDSettings>({
    enabled: false,
    mode: 'manual',
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    },
    smartDND: {
      enabled: false,
      duringMeetings: true,
      whenBusy: true,
      basedOnCalendar: false,
    },
    exceptions: {
      emergencyContacts: [],
      importantKeywords: ['urgent', 'emergency', 'important'],
      allowCalls: true,
      allowImportantNotifications: true,
    },
    customSchedules: [
      {
        id: '1',
        name: 'Work Hours',
        startTime: '09:00',
        endTime: '17:00',
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        active: false,
      },
      {
        id: '2',
        name: 'Movie Time',
        startTime: '20:00',
        endTime: '23:00',
        days: ['friday', 'saturday', 'sunday'],
        active: false,
      },
    ],
  });

  const [loading, setSaving] = useState(false);
  const [isCurrentlyDND, setIsCurrentlyDND] = useState(false);

  useEffect(() => {
    checkCurrentDNDStatus();
    loadSettings();
  }, []);

  const checkCurrentDNDStatus = () => {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'lowercase' });

    // Check if we're in quiet hours
    if (settings.quietHours.enabled && settings.quietHours.days.includes(currentDay)) {
      const startTime = settings.quietHours.startTime;
      const endTime = settings.quietHours.endTime;
      
      // Handle overnight periods (e.g., 22:00 to 08:00)
      if (startTime > endTime) {
        setIsCurrentlyDND(currentTime >= startTime || currentTime <= endTime);
      } else {
        setIsCurrentlyDND(currentTime >= startTime && currentTime <= endTime);
      }
    } else {
      setIsCurrentlyDND(settings.enabled && settings.mode === 'manual');
    }
  };

  const loadSettings = async () => {
    try {
      // Load settings from API
      // const response = await fetch('/api/user/notification-settings/dnd');
      // const data = await response.json();
      // setSettings(data);
    } catch (error) {
      console.error('Failed to load DND settings:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      // Save to API
      // await fetch('/api/user/notification-settings/dnd', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings),
      // });

      toast({
        title: "Settings saved",
        description: "Your Do Not Disturb preferences have been updated.",
      });
    } catch (error) {
      console.error('Failed to save DND settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDND = () => {
    const newSettings = {
      ...settings,
      enabled: !settings.enabled,
      mode: 'manual' as const,
    };
    setSettings(newSettings);
    setIsCurrentlyDND(!settings.enabled);
  };

  const addCustomSchedule = () => {
    const newSchedule = {
      id: Date.now().toString(),
      name: 'New Schedule',
      startTime: '09:00',
      endTime: '17:00',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      active: false,
    };
    setSettings({
      ...settings,
      customSchedules: [...settings.customSchedules, newSchedule],
    });
  };

  const updateCustomSchedule = (id: string, updates: Partial<typeof settings.customSchedules[0]>) => {
    setSettings({
      ...settings,
      customSchedules: settings.customSchedules.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
    });
  };

  const deleteCustomSchedule = (id: string) => {
    setSettings({
      ...settings,
      customSchedules: settings.customSchedules.filter(schedule => schedule.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Do Not Disturb</h1>
          <p className="text-muted-foreground">
            Control when you receive notifications
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {isCurrentlyDND ? (
              <BellOff className="h-5 w-5 text-orange-500" />
            ) : (
              <Bell className="h-5 w-5 text-green-500" />
            )}
            <span className="text-sm">
              {isCurrentlyDND ? 'DND Active' : 'Notifications On'}
            </span>
          </div>
          <Button
            variant={isCurrentlyDND ? "destructive" : "default"}
            onClick={toggleDND}
          >
            {isCurrentlyDND ? 'Turn Off DND' : 'Turn On DND'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Settings</TabsTrigger>
          <TabsTrigger value="quiet-hours">Quiet Hours</TabsTrigger>
          <TabsTrigger value="smart">Smart DND</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Do Not Disturb Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Do Not Disturb</h3>
                  <p className="text-sm text-muted-foreground">
                    Temporarily silence all notifications
                  </p>
                </div>
                <Switch
                  checked={settings.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, enabled: checked })
                  }
                />
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">DND Mode</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card 
                    className={`cursor-pointer transition-colors ${
                      settings.mode === 'manual' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSettings({ ...settings, mode: 'manual' })}
                  >
                    <CardContent className="p-4 text-center">
                      <BellOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h5 className="font-medium">Manual</h5>
                      <p className="text-sm text-muted-foreground">
                        Turn on/off manually
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${
                      settings.mode === 'scheduled' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSettings({ ...settings, mode: 'scheduled' })}
                  >
                    <CardContent className="p-4 text-center">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h5 className="font-medium">Scheduled</h5>
                      <p className="text-sm text-muted-foreground">
                        Based on quiet hours
                      </p>
                    </CardContent>
                  </Card>

                  <Card 
                    className={`cursor-pointer transition-colors ${
                      settings.mode === 'smart' ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSettings({ ...settings, mode: 'smart' })}
                  >
                    <CardContent className="p-4 text-center">
                      <Smartphone className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <h5 className="font-medium">Smart</h5>
                      <p className="text-sm text-muted-foreground">
                        AI-powered detection
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quiet-hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Quiet Hours
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Quiet Hours</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically enable DND during specified times
                  </p>
                </div>
                <Switch
                  checked={settings.quietHours.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      quietHours: { ...settings.quietHours, enabled: checked },
                    })
                  }
                />
              </div>

              {settings.quietHours.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Time</label>
                      <Select
                        value={settings.quietHours.startTime}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            quietHours: { ...settings.quietHours, startTime: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={i} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Time</label>
                      <Select
                        value={settings.quietHours.endTime}
                        onValueChange={(value) =>
                          setSettings({
                            ...settings,
                            quietHours: { ...settings.quietHours, endTime: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 24 }, (_, i) => {
                            const hour = i.toString().padStart(2, '0');
                            return (
                              <SelectItem key={i} value={`${hour}:00`}>
                                {hour}:00
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days</label>
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek.map((day) => (
                        <Badge
                          key={day.value}
                          variant={settings.quietHours.days.includes(day.value) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => {
                            const newDays = settings.quietHours.days.includes(day.value)
                              ? settings.quietHours.days.filter(d => d !== day.value)
                              : [...settings.quietHours.days, day.value];
                            setSettings({
                              ...settings,
                              quietHours: { ...settings.quietHours, days: newDays },
                            });
                          }}
                        >
                          {day.short}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Custom Schedules</h4>
                  <Button variant="outline" size="sm" onClick={addCustomSchedule}>
                    Add Schedule
                  </Button>
                </div>

                <div className="space-y-3">
                  {settings.customSchedules.map((schedule) => (
                    <Card key={schedule.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Switch
                            checked={schedule.active}
                            onCheckedChange={(checked) =>
                              updateCustomSchedule(schedule.id, { active: checked })
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{schedule.name}</span>
                              <Badge variant="outline">
                                {schedule.startTime} - {schedule.endTime}
                              </Badge>
                            </div>
                            <div className="flex gap-1">
                              {schedule.days.map((day) => (
                                <Badge key={day} variant="secondary" className="text-xs">
                                  {daysOfWeek.find(d => d.value === day)?.short}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteCustomSchedule(schedule.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="smart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Smart Do Not Disturb
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Smart DND</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically detect when you shouldn't be disturbed
                  </p>
                </div>
                <Switch
                  checked={settings.smartDND.enabled}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      smartDND: { ...settings.smartDND, enabled: checked },
                    })
                  }
                />
              </div>

              {settings.smartDND.enabled && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">During meetings</h4>
                      <p className="text-sm text-muted-foreground">
                        Activate when you're in a video call or meeting
                      </p>
                    </div>
                    <Switch
                      checked={settings.smartDND.duringMeetings}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          smartDND: { ...settings.smartDND, duringMeetings: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">When busy</h4>
                      <p className="text-sm text-muted-foreground">
                        Activate when your status is set to busy
                      </p>
                    </div>
                    <Switch
                      checked={settings.smartDND.whenBusy}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          smartDND: { ...settings.smartDND, whenBusy: checked },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Based on calendar</h4>
                      <p className="text-sm text-muted-foreground">
                        Sync with your calendar events
                      </p>
                    </div>
                    <Switch
                      checked={settings.smartDND.basedOnCalendar}
                      onCheckedChange={(checked) =>
                        setSettings({
                          ...settings,
                          smartDND: { ...settings.smartDND, basedOnCalendar: checked },
                        })
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exceptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Allow calls</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow voice/video calls even during DND
                  </p>
                </div>
                <Switch
                  checked={settings.exceptions.allowCalls}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      exceptions: { ...settings.exceptions, allowCalls: checked },
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Important notifications</h3>
                  <p className="text-sm text-muted-foreground">
                    Allow notifications marked as important
                  </p>
                </div>
                <Switch
                  checked={settings.exceptions.allowImportantNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({
                      ...settings,
                      exceptions: { ...settings.exceptions, allowImportantNotifications: checked },
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Important keywords</label>
                <div className="flex flex-wrap gap-2">
                  {settings.exceptions.importantKeywords.map((keyword, index) => (
                    <Badge key={index} variant="secondary">
                      {keyword}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Notifications containing these words will bypass DND
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

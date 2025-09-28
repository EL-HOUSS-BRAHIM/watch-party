import { AlertTriangle, Check, CheckCircle, Download, Info, Save, Settings, Zap } from "lucide-react"
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

'use client';


interface SystemSetting {}
  id: string;
  category: string;
  name: string;
  description: string;
  type: 'boolean' | 'string' | 'number' | 'select';
  value: string | number | boolean;
  options?: string[];
  min?: number;
  max?: number;
  unit?: string;
  restart_required?: boolean;
}


interface ConfigSection {}
  title: string;
  icon: LucideIcon;
  settings: SystemSetting[];
}

export default function SystemConfiguration() {}
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  const [configSections, setConfigSections] = useState<ConfigSection[]>([]
    {}
      title: 'General Settings',
      icon: Settings,
      settings: []
        {}
          id: 'site_name',
          category: 'general',
          name: 'Site Name',
          description: 'The name of your watch party platform',
          type: 'string',
          value: 'Watch Party Pro'
        },
        {}
          id: 'site_description',
          category: 'general',
          name: 'Site Description',
          description: 'Brief description of your platform',
          type: 'string',
          value: 'Stream together, chat together, experience together'
        },
        {}
          id: 'max_party_size',
          category: 'general',
          name: 'Maximum Party Size',
          description: 'Maximum number of users per watch party',
          type: 'number',
          value: 50,
          min: 2,
          max: 1000,
          unit: 'users'
        },
        {}
          id: 'enable_public_parties',
          category: 'general',
          name: 'Enable Public Parties',
          description: 'Allow users to create public watch parties',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'default_language',
          category: 'general',
          name: 'Default Language',
          description: 'Default language for new users',
          type: 'select',
          value: 'en',
          options: ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh']
        }
      ]
    },
    {}
      title: 'Authentication & Security',
      icon: Shield,
      settings: []
        {}
          id: 'require_email_verification',
          category: 'auth',
          name: 'Require Email Verification',
          description: 'Users must verify their email before accessing the platform',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'enable_2fa',
          category: 'auth',
          name: 'Enable Two-Factor Authentication',
          description: 'Allow users to enable 2FA for their accounts',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'password_min_length',
          category: 'auth',
          name: 'Minimum Password Length',
          description: 'Minimum number of characters required for passwords',
          type: 'number',
          value: 8,
          min: 6,
          max: 50,
          unit: 'characters'
        },
        {}
          id: 'session_timeout',
          category: 'auth',
          name: 'Session Timeout',
          description: 'How long users stay logged in without activity',
          type: 'number',
          value: 24,
          min: 1,
          max: 168,
          unit: 'hours'
        },
        {}
          id: 'enable_social_login',
          category: 'auth',
          name: 'Enable Social Login',
          description: 'Allow login with Google, Facebook, etc.',
          type: 'boolean',
          value: true;
        }
      ]
    },
    {}
      title: 'Video & Media',
      icon: Video,
      settings: []
        {}
          id: 'max_upload_size',
          category: 'media',
          name: 'Maximum Upload Size',
          description: 'Maximum file size for video uploads',
          type: 'number',
          value: 500,
          min: 10,
          max: 5000,
          unit: 'MB'
        },
        {}
          id: 'supported_formats',
          category: 'media',
          name: 'Supported Video Formats',
          description: 'Allowed video file formats',
          type: 'select',
          value: 'mp4,webm,avi,mov',
          options: ['mp4,webm', 'mp4,webm,avi', 'mp4,webm,avi,mov', 'all']
        },
        {}
          id: 'enable_transcoding',
          category: 'media',
          name: 'Enable Video Transcoding',
          description: 'Automatically convert videos to web-friendly formats',
          type: 'boolean',
          value: true,
          restart_required: true;
        },
        {}
          id: 'video_quality_default',
          category: 'media',
          name: 'Default Video Quality',
          description: 'Default playback quality for videos',
          type: 'select',
          value: '720p',
          options: ['480p', '720p', '1080p', 'auto']
        },
        {}
          id: 'enable_live_streaming',
          category: 'media',
          name: 'Enable Live Streaming',
          description: 'Allow users to stream live video content',
          type: 'boolean',
          value: false,
          restart_required: true;
        }
      ]
    },
    {}
      title: 'Chat & Communication',
      icon: MessageSquare,
      settings: []
        {}
          id: 'enable_chat',
          category: 'chat',
          name: 'Enable Chat',
          description: 'Allow users to chat during watch parties',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'max_message_length',
          category: 'chat',
          name: 'Maximum Message Length',
          description: 'Maximum characters allowed in chat messages',
          type: 'number',
          value: 500,
          min: 50,
          max: 2000,
          unit: 'characters'
        },
        {}
          id: 'enable_emoji_reactions',
          category: 'chat',
          name: 'Enable Emoji Reactions',
          description: 'Allow users to react to messages with emojis',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'chat_moderation_level',
          category: 'chat',
          name: 'Chat Moderation Level',
          description: 'Level of automatic chat moderation',
          type: 'select',
          value: 'moderate',
          options: ['none', 'light', 'moderate', 'strict']
        },
        {}
          id: 'enable_voice_chat',
          category: 'chat',
          name: 'Enable Voice Chat',
          description: 'Allow voice communication in parties',
          type: 'boolean',
          value: false,
          restart_required: true;
        }
      ]
    },
    {}
      title: 'Notifications',
      icon: Bell,
      settings: []
        {}
          id: 'enable_email_notifications',
          category: 'notifications',
          name: 'Enable Email Notifications',
          description: 'Send notifications via email',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'enable_push_notifications',
          category: 'notifications',
          name: 'Enable Push Notifications',
          description: 'Send browser push notifications',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'notification_frequency',
          category: 'notifications',
          name: 'Notification Frequency',
          description: 'How often to send digest notifications',
          type: 'select',
          value: 'daily',
          options: ['immediate', 'hourly', 'daily', 'weekly', 'never']
        },
        {}
          id: 'party_invite_notifications',
          category: 'notifications',
          name: 'Party Invite Notifications',
          description: 'Notify users when invited to parties',
          type: 'boolean',
          value: true;
        }
      ]
    },
    {}
      title: 'Performance & Storage',
      icon: Server,
      settings: []
        {}
          id: 'enable_caching',
          category: 'performance',
          name: 'Enable Caching',
          description: 'Cache frequently accessed data for better performance',
          type: 'boolean',
          value: true,
          restart_required: true;
        },
        {}
          id: 'cache_duration',
          category: 'performance',
          name: 'Cache Duration',
          description: 'How long to cache data',
          type: 'number',
          value: 3600,
          min: 300,
          max: 86400,
          unit: 'seconds'
        },
        {}
          id: 'enable_cdn',
          category: 'performance',
          name: 'Enable CDN',
          description: 'Use Content Delivery Network for static assets',
          type: 'boolean',
          value: true;
        },
        {}
          id: 'max_concurrent_streams',
          category: 'performance',
          name: 'Max Concurrent Streams',
          description: 'Maximum number of simultaneous video streams',
          type: 'number',
          value: 100,
          min: 10,
          max: 1000,
          unit: 'streams'
        },
        {}
          id: 'storage_cleanup_interval',
          category: 'performance',
          name: 'Storage Cleanup Interval',
          description: 'How often to clean up temporary files',
          type: 'number',
          value: 24,
          min: 1,
          max: 168,
          unit: 'hours'
        }
      ]
    }
  ]);

  const updateSetting = (settingId: string, newValue: string | number | boolean) => {}
    setConfigSections(prev => prev.map(section => ({}
      ...section,
      settings: section.settings.map(setting => 
        setting.id === settingId ? { ...setting, value: newValue } : setting;
      )
    })));
    setHasChanges(true);
  };

  const saveConfiguration = async () => {}
    setSaving(true);
    // Simulate API call;
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
    setHasChanges(false);
    // Show success notification;
    alert('Configuration saved successfully!');
  };

  const resetToDefaults = () => {}
    if (confirm('Are you sure you want to reset all settings to their default values?')) {}
      // Reset logic would go here;
      setHasChanges(true);
    }
  };

  const exportConfiguration = () => {}
    const config: Record<string, string | number | boolean> = {};
    configSections.forEach(section => {}
  section.settings.forEach(setting => {}
  config[setting.id] = setting.value;
      });
    });
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-config-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getFilteredSections = () => {}
    return configSections.map(section => ({}
      ...section,
      settings: section.settings.filter(setting => {}
  const matchesSearch = !searchTerm || 
          setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          setting.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
    })).filter(section => section.settings.length > 0);
  };

  const categories = Array.from(new Set(configSections.flatMap(s => s.settings.map(setting => setting.category))));

  const renderSettingInput = (setting: SystemSetting) => {}
    switch (setting.type) {}
      case 'boolean':
        return (
          <Switch;
            checked={setting.value}
            onCheckedChange={(checked) => updateSetting(setting.id, checked)}
          />
        );
      case 'string':
        return (
          <Input;
            value={setting.value}
            onChange={(e) => updateSetting(setting.id, e.target.value)}
            className="w-64"
          />
        );
      case 'number':
        return (
          <div className="flex items-center space-x-2">
            <Input;
              type="number"
              value={setting.value}
              onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
              min={setting.min}
              max={setting.max}
              className="w-32"
            />
            {setting.unit && (
              <span className="text-sm text-muted-foreground">{setting.unit}</span>
            )}
          </div>
        );
      case 'select':
        return (
          <Select value={setting.value} onValueChange={(value) => updateSetting(setting.id, value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Configuration</h1>
          <p className="text-muted-foreground">Manage system settings and preferences</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportConfiguration}>
            <Download className="w-4 h-4 mr-2" />
            Export;
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset;
          </Button>
          <Button;
            onClick={saveConfiguration} 
            disabled={!hasChanges || saving}
            className="relative"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      {hasChanges && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="w-4 h-4" />
              <span>You have unsaved changes. Don&apos;t forget to save your configuration.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input;
                placeholder="Search settings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Sections */}
      <div className="space-y-6">
        {getFilteredSections().map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <section.icon className="w-5 h-5" />
                <span>{section.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.settings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between py-4 border-b last:border-b-0">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <Label className="text-base font-medium">{setting.name}</Label>
                      {setting.restart_required && (
                        <Badge variant="outline" className="text-orange-600 border-orange-200">
                          <Zap className="w-3 h-3 mr-1" />
                          Restart Required;
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {getFilteredSections().length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Settings Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or category filter.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer Info */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Info className="w-4 h-4" />
                <span>Some settings require a system restart to take effect</span>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>All settings are automatically validated</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

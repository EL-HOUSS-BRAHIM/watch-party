'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Bell, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX,
  Filter,
  Palette,
  Type,
  Clock,
  Users,
  Smile,
  Image,
  Link,
  X,
  Save
} from 'lucide-react'

interface ChatSettingsProps {
  partyId?: string
  isGlobal?: boolean
}

interface ChatPreferences {
  // Notifications
  messageNotifications: boolean
  mentionNotifications: boolean
  soundNotifications: boolean
  notificationSound: string
  notificationVolume: number
  
  // Display
  showTimestamps: boolean
  showAvatars: boolean
  compactMode: boolean
  fontSize: 'small' | 'medium' | 'large'
  theme: 'auto' | 'light' | 'dark'
  
  // Privacy & Filtering
  hideFromStrangers: boolean
  muteAll: boolean
  blockedUsers: string[]
  filteredWords: string[]
  showEmojis: boolean
  showImages: boolean
  showLinks: boolean
  
  // Auto-moderation
  filterProfanity: boolean
  filterSpam: boolean
  autoHideReported: boolean
  
  // Interaction
  autoCompleteEmojis: boolean
  sendOnEnter: boolean
  showTypingIndicators: boolean
  showOnlineStatus: boolean
}

export function ChatSettings({ partyId, isGlobal = false }: ChatSettingsProps) {
  const [preferences, setPreferences] = useState<ChatPreferences>({
    messageNotifications: true,
    mentionNotifications: true,
    soundNotifications: true,
    notificationSound: 'default',
    notificationVolume: 50,
    
    showTimestamps: true,
    showAvatars: true,
    compactMode: false,
    fontSize: 'medium',
    theme: 'auto',
    
    hideFromStrangers: false,
    muteAll: false,
    blockedUsers: [],
    filteredWords: [],
    showEmojis: true,
    showImages: true,
    showLinks: true,
    
    filterProfanity: true,
    filterSpam: true,
    autoHideReported: false,
    
    autoCompleteEmojis: true,
    sendOnEnter: true,
    showTypingIndicators: true,
    showOnlineStatus: true
  })
  
  const [newFilteredWord, setNewFilteredWord] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadPreferences()
  }, [partyId, isGlobal])

  const loadPreferences = async () => {
    try {
      const endpoint = isGlobal 
        ? '/api/chat/preferences' 
        : `/api/parties/${partyId}/chat/preferences`
      
      const response = await fetch(endpoint)
      if (response.ok) {
        const data = await response.json()
        setPreferences({ ...preferences, ...data.preferences })
      }
    } catch (error) {
      console.error('Failed to load chat preferences:', error)
    }
  }

  const savePreferences = async () => {
    try {
      setLoading(true)
      const endpoint = isGlobal 
        ? '/api/chat/preferences' 
        : `/api/parties/${partyId}/chat/preferences`
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences })
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (error) {
      console.error('Failed to save chat preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePreference = <K extends keyof ChatPreferences>(
    key: K, 
    value: ChatPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  const addFilteredWord = () => {
    if (newFilteredWord.trim() && !preferences.filteredWords.includes(newFilteredWord.trim())) {
      updatePreference('filteredWords', [...preferences.filteredWords, newFilteredWord.trim()])
      setNewFilteredWord('')
    }
  }

  const removeFilteredWord = (word: string) => {
    updatePreference('filteredWords', preferences.filteredWords.filter(w => w !== word))
  }

  const playTestSound = () => {
    const audio = new Audio(`/sounds/notifications/${preferences.notificationSound}.mp3`)
    audio.volume = preferences.notificationVolume / 100
    audio.play()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center space-x-2">
          <MessageSquare className="h-6 w-6" />
          <span>{isGlobal ? 'Global Chat Settings' : 'Party Chat Settings'}</span>
        </h1>
        <Button 
          onClick={savePreferences} 
          disabled={loading}
          className="flex items-center space-x-2"
        >
          {saved ? (
            <>
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </>
          )}
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="display">Display</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
          <TabsTrigger value="filtering">Filtering</TabsTrigger>
          <TabsTrigger value="interaction">Interaction</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Message Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified for all messages</p>
                  </div>
                  <Switch
                    checked={preferences.messageNotifications}
                    onCheckedChange={(checked) => updatePreference('messageNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mention Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified when mentioned</p>
                  </div>
                  <Switch
                    checked={preferences.mentionNotifications}
                    onCheckedChange={(checked) => updatePreference('mentionNotifications', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Sound Notifications</Label>
                    <p className="text-sm text-muted-foreground">Play sound for notifications</p>
                  </div>
                  <Switch
                    checked={preferences.soundNotifications}
                    onCheckedChange={(checked) => updatePreference('soundNotifications', checked)}
                  />
                </div>

                {preferences.soundNotifications && (
                  <div className="space-y-4 pl-4 border-l-2 border-muted">
                    <div className="space-y-2">
                      <Label>Notification Sound</Label>
                      <div className="flex items-center space-x-2">
                        <Select
                          value={preferences.notificationSound}
                          onValueChange={(value) => updatePreference('notificationSound', value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="default">Default</SelectItem>
                            <SelectItem value="chime">Chime</SelectItem>
                            <SelectItem value="ding">Ding</SelectItem>
                            <SelectItem value="pop">Pop</SelectItem>
                            <SelectItem value="whistle">Whistle</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={playTestSound}>
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Volume ({preferences.notificationVolume}%)</Label>
                      <Slider
                        value={[preferences.notificationVolume]}
                        onValueChange={([value]) => updatePreference('notificationVolume', value)}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="display" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Display Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Timestamps</Label>
                    <p className="text-sm text-muted-foreground">Display message timestamps</p>
                  </div>
                  <Switch
                    checked={preferences.showTimestamps}
                    onCheckedChange={(checked) => updatePreference('showTimestamps', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Avatars</Label>
                    <p className="text-sm text-muted-foreground">Display user avatars</p>
                  </div>
                  <Switch
                    checked={preferences.showAvatars}
                    onCheckedChange={(checked) => updatePreference('showAvatars', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Reduce message spacing</p>
                  </div>
                  <Switch
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) => updatePreference('compactMode', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={preferences.fontSize}
                    onValueChange={(value: 'small' | 'medium' | 'large') => updatePreference('fontSize', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={preferences.theme}
                    onValueChange={(value: 'auto' | 'light' | 'dark') => updatePreference('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="h-5 w-5" />
                <span>Privacy Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Hide from Strangers</Label>
                    <p className="text-sm text-muted-foreground">Only show messages from friends</p>
                  </div>
                  <Switch
                    checked={preferences.hideFromStrangers}
                    onCheckedChange={(checked) => updatePreference('hideFromStrangers', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mute All</Label>
                    <p className="text-sm text-muted-foreground">Hide all chat messages</p>
                  </div>
                  <Switch
                    checked={preferences.muteAll}
                    onCheckedChange={(checked) => updatePreference('muteAll', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Emojis</Label>
                    <p className="text-sm text-muted-foreground">Display emoji reactions</p>
                  </div>
                  <Switch
                    checked={preferences.showEmojis}
                    onCheckedChange={(checked) => updatePreference('showEmojis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Images</Label>
                    <p className="text-sm text-muted-foreground">Display embedded images</p>
                  </div>
                  <Switch
                    checked={preferences.showImages}
                    onCheckedChange={(checked) => updatePreference('showImages', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Links</Label>
                    <p className="text-sm text-muted-foreground">Display link previews</p>
                  </div>
                  <Switch
                    checked={preferences.showLinks}
                    onCheckedChange={(checked) => updatePreference('showLinks', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="filtering" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Content Filtering</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Filter Profanity</Label>
                    <p className="text-sm text-muted-foreground">Automatically hide inappropriate language</p>
                  </div>
                  <Switch
                    checked={preferences.filterProfanity}
                    onCheckedChange={(checked) => updatePreference('filterProfanity', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Filter Spam</Label>
                    <p className="text-sm text-muted-foreground">Hide messages identified as spam</p>
                  </div>
                  <Switch
                    checked={preferences.filterSpam}
                    onCheckedChange={(checked) => updatePreference('filterSpam', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-hide Reported Messages</Label>
                    <p className="text-sm text-muted-foreground">Hide messages that have been reported</p>
                  </div>
                  <Switch
                    checked={preferences.autoHideReported}
                    onCheckedChange={(checked) => updatePreference('autoHideReported', checked)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Custom Filtered Words</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add word to filter..."
                      value={newFilteredWord}
                      onChange={(e) => setNewFilteredWord(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addFilteredWord()}
                    />
                    <Button onClick={addFilteredWord}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {preferences.filteredWords.map((word) => (
                      <Badge key={word} variant="secondary" className="cursor-pointer">
                        {word}
                        <X 
                          className="h-3 w-3 ml-1" 
                          onClick={() => removeFilteredWord(word)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interaction" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Interaction Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-complete Emojis</Label>
                    <p className="text-sm text-muted-foreground">Suggest emojis while typing</p>
                  </div>
                  <Switch
                    checked={preferences.autoCompleteEmojis}
                    onCheckedChange={(checked) => updatePreference('autoCompleteEmojis', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Send on Enter</Label>
                    <p className="text-sm text-muted-foreground">Send message when pressing Enter</p>
                  </div>
                  <Switch
                    checked={preferences.sendOnEnter}
                    onCheckedChange={(checked) => updatePreference('sendOnEnter', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Typing Indicators</Label>
                    <p className="text-sm text-muted-foreground">See when others are typing</p>
                  </div>
                  <Switch
                    checked={preferences.showTypingIndicators}
                    onCheckedChange={(checked) => updatePreference('showTypingIndicators', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Online Status</Label>
                    <p className="text-sm text-muted-foreground">Display user online indicators</p>
                  </div>
                  <Switch
                    checked={preferences.showOnlineStatus}
                    onCheckedChange={(checked) => updatePreference('showOnlineStatus', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

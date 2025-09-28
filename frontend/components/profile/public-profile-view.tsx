'use client'

import { useState, useEffect } from 'react'
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserPlus, MessageCircle, Share2, Calendar, MapPin, Link as LinkIcon } from 'lucide-react'
import { useApi } from '@/hooks/use-api'
import { LoadingSpinner } from '@/components/ui/loading'

interface PublicProfile {
  id: string
  username: string
  display_name: string
  bio: string
  avatar_url: string | null
  banner_url: string | null
  location: string | null
  website: string | null
  joined_date: string
  is_verified: boolean
  privacy_settings: {
    show_email: boolean
    show_stats: boolean
    show_activity: boolean
    show_friends: boolean
  }
  stats: {
    total_watch_time: number
    parties_hosted: number
    friends_count: number
    videos_uploaded: number
  }
  badges: Array<{
    id: string
    name: string
    description: string
    icon_url: string
    earned_at: string
  }>
  recent_activity: Array<{
    id: string
    type: 'party_hosted' | 'video_uploaded' | 'achievement_earned'
    description: string
    created_at: string
  }>
}

interface PublicProfileViewProps {
  userId: string
}

export function PublicProfileView({ userId }: PublicProfileViewProps) {
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { get, post } = useApi()

  useEffect(() => {
    fetchProfile()
  }, [userId])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const response = await get(`/users/${userId}/public-profile/`)
      setProfile(response.data as PublicProfile)
    } catch (err: unknown) {
      setError(err.response?.data?.message || 'Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendFriendRequest = async () => {
    try {
      await post('/friends/requests/', { recipient_id: userId })
      // Show success toast
    } catch (err: unknown) {
      // Show error toast
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${userId}/public`
    if (navigator.share) {
      await navigator.share({
        title: `${profile?.display_name}'s Profile`,
        url
      })
    } else {
      await navigator.clipboard.writeText(url)
      // Show copied toast
    }
  }

  const formatWatchTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Profile Not Found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {error || 'This profile is private or does not exist.'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Banner */}
      <div className="relative h-48 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg overflow-hidden">
        {profile.banner_url && (
          <img 
            src={profile.banner_url} 
            alt="Profile banner"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </div>

      {/* Profile Header */}
      <Card className="relative -mt-24 mx-4">
        <CardContent className="pt-16">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="w-24 h-24 border-4 border-white dark:border-gray-800 -mt-12">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback>
                {profile.display_name?.charAt(0) || profile.username.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || profile.username}
                </h1>
                {profile.is_verified && (
                  <Badge variant="secondary">Verified</Badge>
                )}
              </div>
              
              <p className="text-gray-600 dark:text-gray-400">
                @{profile.username}
              </p>

              {profile.bio && (
                <p className="text-gray-700 dark:text-gray-300 max-w-2xl">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {new Date(profile.joined_date).toLocaleDateString()}
                </div>
                
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.location}
                  </div>
                )}

                {profile.website && (
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-purple-600"
                  >
                    <LinkIcon className="w-4 h-4" />
                    Website
                  </a>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-1" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button size="sm" onClick={handleSendFriendRequest}>
                <UserPlus className="w-4 h-4 mr-1" />
                Add Friend
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {profile.privacy_settings.show_stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatWatchTime(profile.stats.total_watch_time)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Watch Time</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {profile.stats.parties_hosted}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Parties Hosted</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-green-600">
                {profile.stats.friends_count}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Friends</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {profile.stats.videos_uploaded}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Videos</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Content Tabs */}
      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Public achievements and badges earned
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profile.badges.map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <img 
                      src={badge.icon_url} 
                      alt={badge.name}
                      className="w-10 h-10"
                    />
                    <div>
                      <h4 className="font-medium">{badge.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          {profile.privacy_settings.show_activity ? (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.recent_activity.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                      <div className="flex-1">
                        <p className="text-sm">{activity.description}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Activity is private
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="friends" className="space-y-4">
          {profile.privacy_settings.show_friends ? (
            <Card>
              <CardHeader>
                <CardTitle>Friends ({profile.stats.friends_count})</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  Friends list coming soon...
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-gray-600 dark:text-gray-400">
                  Friends list is private
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

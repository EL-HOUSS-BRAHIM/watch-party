"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { analyticsAPI, partiesAPI, searchAPI, usersAPI, videosAPI } from "@/lib/api"
import type { DiscoverContent, DiscoverRecommendation } from "@/lib/api"
import {
  Compass,
  TrendingUp,
  Star,
  Users,
  Video,
  Calendar,
  Eye,
  Heart,
  Play,
  UserPlus,
  Globe,
  Search,
  ChevronRight,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  Flame,
  Zap,
  Crown,
  MapPin,
  Sparkles,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"

type SuggestionReason =
  | "mutual_friends"
  | "common_interests"
  | "popular"
  | "new_user"
  | "recent_activity"
  | "similar_content"

interface TrendingVideoCard {
  id: string
  title: string
  description?: string
  thumbnail?: string | null
  durationLabel: string
  views: number
  likes: number
  createdAt: string
  uploader: {
    id: string
    name: string
    avatar?: string | null
    isVerified: boolean
  }
  tags: string[]
  trendingScore?: number
}

interface FeaturedPartyCard {
  id: string
  title: string
  description?: string
  thumbnail?: string | null
  host: {
    id: string
    name: string
    avatar?: string | null
    isVerified: boolean
  }
  scheduledFor?: string | null
  isActive: boolean
  participantCount: number
  maxParticipants?: number | null
  tags: string[]
  highlight?: "trending" | "recommended"
}

interface SuggestedUserCard {
  id: string
  username: string
  firstName: string
  lastName: string
  avatar?: string | null
  bio?: string
  location?: string
  isOnline: boolean
  isVerified: boolean
  mutualFriends: number
  commonInterests: string[]
  stats: {
    videosUploaded: number
    partiesHosted: number
    friendsCount: number
  }
  reasonForSuggestion: SuggestionReason
}

interface DiscoverCategoryCard {
  id: string
  name: string
  description?: string
  icon: string
  itemCount: number
  isGrowing: boolean
  colorClass: string
}

const FALLBACK_AVATAR = "/placeholder-user.jpg"
const FALLBACK_THUMBNAIL = "/placeholder.svg?height=200&width=350"

const CATEGORY_GRADIENTS = [
  "from-purple-500 to-blue-500",
  "from-pink-500 to-orange-500",
  "from-green-500 to-emerald-500",
  "from-indigo-500 to-purple-500",
  "from-rose-500 to-red-500",
  "from-sky-500 to-cyan-500",
  "from-amber-500 to-orange-500",
  "from-lime-500 to-green-500",
]

const CATEGORY_ICONS = ["🎬", "🎮", "🎵", "📺", "📚", "⚽", "😂", "🌐"]

const safeNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string") {
    const parsed = Number(value)
    if (!Number.isNaN(parsed)) {
      return parsed
    }
  }

  return fallback
}

const fallbackId = (prefix: string) =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `${prefix}-${crypto.randomUUID()}`
    : `${prefix}-${Math.random().toString(36).slice(2, 11)}`

const formatVideoDurationLabel = (duration: unknown): string => {
  if (duration === null || typeof duration === "undefined") {
    return "Live"
  }

  if (typeof duration === "number" && Number.isFinite(duration)) {
    const totalSeconds = Math.max(duration, 0)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = Math.floor(totalSeconds % 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }

    if (minutes > 0) {
      return `${minutes}m`
    }

    return `${seconds}s`
  }

  if (typeof duration === "string") {
    if (duration.includes(":")) {
      const parts = duration.split(":").map((part) => Number(part))
      if (parts.every((part) => Number.isFinite(part))) {
        const [hours = 0, minutes = 0, seconds = 0] = parts
        if (hours > 0) {
          return `${hours}h ${minutes}m`
        }
        if (minutes > 0) {
          return `${minutes}m`
        }
        return `${seconds}s`
      }
    }

    const parsed = Number(duration)
    if (!Number.isNaN(parsed)) {
      return formatVideoDurationLabel(parsed)
    }

    return duration
  }

  return "Live"
}

const extractTags = (entity: any): string[] => {
  if (!entity) {
    return []
  }

  if (Array.isArray(entity.tags)) {
    return entity.tags.map((tag: any) => String(tag))
  }

  if (Array.isArray(entity.categories)) {
    return entity.categories.map((tag: any) => String(tag))
  }

  if (Array.isArray(entity.genres)) {
    return entity.genres.map((tag: any) => String(tag))
  }

  if (Array.isArray(entity.topics)) {
    return entity.topics.map((tag: any) => String(tag))
  }

  if (Array.isArray(entity.metadata?.tags)) {
    return entity.metadata.tags.map((tag: any) => String(tag))
  }

  return []
}

const resolvePartyActive = (party: any): boolean => {
  if (typeof party?.is_active === "boolean") {
    return party.is_active
  }

  if (typeof party?.isActive === "boolean") {
    return party.isActive
  }

  const status = typeof party?.status === "string" ? party.status.toLowerCase() : ""
  return ["live", "active", "running"].includes(status)
}

const buildVideoCard = (video: any): TrendingVideoCard => {
  const id = video?.id ?? video?.video_id ?? fallbackId("video")
  const uploader = video?.uploader ?? video?.author ?? video?.creator ?? {}
  const tags = extractTags(video)
  const trendingScore = safeNumber(video?.trending_score ?? video?.score ?? Number.NaN, Number.NaN)

  return {
    id: String(id),
    title: video?.title ?? video?.name ?? "Untitled video",
    description: video?.description ?? video?.summary ?? undefined,
    thumbnail:
      video?.thumbnail ??
      video?.poster ??
      video?.preview_image ??
      video?.image ??
      video?.media?.thumbnail ??
      FALLBACK_THUMBNAIL,
    durationLabel: formatVideoDurationLabel(video?.duration ?? video?.runtime ?? video?.length),
    views: safeNumber(video?.view_count ?? video?.views ?? video?.metrics?.views, 0),
    likes: safeNumber(video?.like_count ?? video?.likes ?? video?.metrics?.likes, 0),
    createdAt: video?.created_at ?? video?.published_at ?? new Date().toISOString(),
    uploader: {
      id: String(uploader?.id ?? uploader?.user_id ?? uploader?.username ?? fallbackId("user")),
      name:
        uploader?.name ??
        uploader?.full_name ??
        uploader?.username ??
        uploader?.display_name ??
        "Creator",
      avatar:
        uploader?.avatar ??
        uploader?.avatar_url ??
        uploader?.image ??
        uploader?.profile_image ??
        uploader?.photo ??
        FALLBACK_AVATAR,
      isVerified: Boolean(uploader?.is_verified ?? uploader?.is_premium ?? uploader?.verified ?? uploader?.isVerified),
    },
    tags,
    trendingScore: Number.isFinite(trendingScore) ? trendingScore : undefined,
  }
}

const buildPartyCard = (party: any, highlight?: "trending" | "recommended"): FeaturedPartyCard => {
  const host = party?.host ?? party?.owner ?? party?.organizer ?? {}
  const id = party?.id ?? party?.room_code ?? fallbackId("party")

  return {
    id: String(id),
    title: party?.title ?? party?.name ?? "Watch Party",
    description: party?.description ?? party?.summary ?? undefined,
    thumbnail:
      party?.thumbnail ??
      party?.image ??
      party?.cover_image ??
      party?.video?.thumbnail ??
      FALLBACK_THUMBNAIL,
    host: {
      id: String(host?.id ?? host?.user_id ?? host?.username ?? fallbackId("host")),
      name:
        host?.name ??
        host?.full_name ??
        host?.username ??
        host?.display_name ??
        "Host",
      avatar:
        host?.avatar ??
        host?.avatar_url ??
        host?.image ??
        host?.profile_image ??
        FALLBACK_AVATAR,
      isVerified: Boolean(host?.is_verified ?? host?.is_premium ?? host?.verified),
    },
    scheduledFor: party?.scheduled_start ?? party?.starts_at ?? party?.scheduled_for ?? null,
    isActive: resolvePartyActive(party),
    participantCount: safeNumber(
      party?.participant_count ?? party?.participants ?? party?.member_count ?? party?.attendance,
      0,
    ),
    maxParticipants: party?.max_participants ?? party?.capacity ?? party?.max_attendees ?? null,
    tags: extractTags(party),
    highlight,
  }
}

const dedupePartyCards = (parties: FeaturedPartyCard[]): FeaturedPartyCard[] => {
  const byId = new Map<string, FeaturedPartyCard>()

  for (const party of parties) {
    const existing = byId.get(party.id)

    if (!existing) {
      byId.set(party.id, party)
      continue
    }

    byId.set(party.id, {
      ...existing,
      ...party,
      highlight: existing.highlight ?? party.highlight,
      tags: existing.tags.length >= party.tags.length ? existing.tags : party.tags,
      participantCount: Math.max(existing.participantCount, party.participantCount),
      maxParticipants:
        existing.maxParticipants && party.maxParticipants
          ? Math.max(existing.maxParticipants, party.maxParticipants)
          : existing.maxParticipants ?? party.maxParticipants ?? null,
    })
  }

  return Array.from(byId.values())
}

const buildSuggestedUserCard = (
  raw: any,
  fallbackReason: SuggestionReason = "popular",
): SuggestedUserCard => {
  const username =
    raw?.username ??
    raw?.handle ??
    raw?.user?.username ??
    raw?.slug ??
    String(raw?.id ?? fallbackId("user"))

  const fullName =
    raw?.full_name ??
    raw?.name ??
    raw?.display_name ??
    raw?.user?.full_name ??
    username

  const nameParts = fullName.trim().split(/\s+/)
  const firstName = nameParts[0] ?? username
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : firstName

  const mutualFriends = safeNumber(
    raw?.mutual_friends_count ?? raw?.mutual_friends ?? raw?.mutualFriends,
    0,
  )

  const commonInterests = extractTags(raw)

  let reason: SuggestionReason = fallbackReason
  if (mutualFriends > 0) {
    reason = "mutual_friends"
  } else if (commonInterests.length > 0) {
    reason = "common_interests"
  } else if (raw?.is_new_user) {
    reason = "new_user"
  } else if (raw?.recent_activity) {
    reason = "recent_activity"
  } else if (raw?.similar_content) {
    reason = "similar_content"
  }

  const stats = {
    videosUploaded: safeNumber(
      raw?.videos_uploaded ?? raw?.stats?.videos ?? raw?.video_count,
      0,
    ),
    partiesHosted: safeNumber(
      raw?.parties_hosted ?? raw?.stats?.parties ?? raw?.party_count,
      0,
    ),
    friendsCount: safeNumber(
      raw?.friends_count ?? raw?.stats?.friends ?? raw?.friend_count ?? mutualFriends,
      0,
    ),
  }

  const avatar =
    raw?.avatar ??
    raw?.avatar_url ??
    raw?.profile_image ??
    raw?.image ??
    raw?.user?.avatar ??
    FALLBACK_AVATAR

  return {
    id: String(raw?.id ?? username ?? fallbackId("user")),
    username,
    firstName,
    lastName,
    avatar,
    bio: raw?.bio ?? raw?.about ?? raw?.description,
    location: raw?.location ?? raw?.city ?? raw?.country ?? raw?.region,
    isOnline: Boolean(raw?.is_online ?? raw?.online ?? raw?.status === "online"),
    isVerified: Boolean(raw?.is_verified ?? raw?.isVerified ?? raw?.is_premium ?? raw?.verified),
    mutualFriends,
    commonInterests,
    stats,
    reasonForSuggestion: reason,
  }
}

const dedupeSuggestions = (suggestions: SuggestedUserCard[]): SuggestedUserCard[] => {
  const byId = new Map<string, SuggestedUserCard>()

  suggestions.forEach((suggestion) => {
    const existing = byId.get(suggestion.id)

    if (!existing) {
      byId.set(suggestion.id, suggestion)
      return
    }

    byId.set(suggestion.id, {
      ...existing,
      ...suggestion,
      commonInterests:
        existing.commonInterests.length >= suggestion.commonInterests.length
          ? existing.commonInterests
          : suggestion.commonInterests,
      stats: {
        videosUploaded: Math.max(
          existing.stats.videosUploaded,
          suggestion.stats.videosUploaded,
        ),
        partiesHosted: Math.max(
          existing.stats.partiesHosted,
          suggestion.stats.partiesHosted,
        ),
        friendsCount: Math.max(
          existing.stats.friendsCount,
          suggestion.stats.friendsCount,
        ),
      },
      reasonForSuggestion:
        existing.reasonForSuggestion === "mutual_friends"
          ? existing.reasonForSuggestion
          : suggestion.reasonForSuggestion,
    })
  })

  return Array.from(byId.values())
}

const buildCategoryCard = (category: any, index: number): DiscoverCategoryCard => {
  const id = category?.id ?? category?.slug ?? category?.name ?? fallbackId("category")
  const itemCount = safeNumber(
    category?.content_count ?? category?.video_count ?? category?.count,
    0,
  )

  const trendDirection =
    typeof category?.trend_direction === "string"
      ? category.trend_direction.toLowerCase()
      : undefined

  const isGrowing =
    typeof category?.is_growing === "boolean"
      ? category.is_growing
      : trendDirection
        ? trendDirection !== "down"
        : itemCount > 0

  return {
    id: String(id),
    name: category?.name ?? category?.title ?? "Category",
    description: category?.description ?? category?.summary ?? undefined,
    icon: String(category?.icon ?? CATEGORY_ICONS[index % CATEGORY_ICONS.length]),
    itemCount,
    isGrowing,
    colorClass: CATEGORY_GRADIENTS[index % CATEGORY_GRADIENTS.length],
  }
}

const formatStatValue = (value: number): string => {
  if (!Number.isFinite(value)) {
    return "0"
  }

  return Math.max(0, Math.round(value)).toLocaleString()
}

export default function DiscoverPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("trending")
  const [timeFilter, setTimeFilter] = useState("week")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [trendingVideos, setTrendingVideos] = useState<TrendingVideoCard[]>([])
  const [featuredParties, setFeaturedParties] = useState<FeaturedPartyCard[]>([])
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUserCard[]>([])
  const [trendingCategories, setTrendingCategories] = useState<DiscoverCategoryCard[]>([])
  const [defaultCollections, setDefaultCollections] = useState({
    videos: [] as TrendingVideoCard[],
    parties: [] as FeaturedPartyCard[],
    suggestions: [] as SuggestedUserCard[],
    categories: [] as DiscoverCategoryCard[],
  })

  const [stats, setStats] = useState({
    totalUsers: 0,
    activeParties: 0,
    videosWatched: 0,
    newUsersToday: 0,
  })

  const loadDiscoverData = useCallback(async () => {
    const categoryParam = categoryFilter === "all" ? undefined : categoryFilter
    const timeRangeParam = timeFilter === "all" ? undefined : timeFilter

    setIsLoading(true)

    try {
      const [
        discoverPayload,
        trendingVideosPayload,
        trendingPartiesPayload,
        recommendedPartiesPayload,
        userSuggestionsPayload,
        analyticsPayload,
      ] = await Promise.all([
        searchAPI.discover({
          category: categoryParam,
          trending: true,
          recommended: true,
        }),
        videosAPI.getTrending({ category: categoryParam, limit: 12 }),
        partiesAPI.getTrendingParties({ limit: 6, time_range: timeRangeParam }),
        partiesAPI.getRecommendations({ limit: 6 }),
        usersAPI.getUserSuggestions(),
        analyticsAPI.getDashboard(timeRangeParam),
      ])

      const discoverData: DiscoverContent =
        discoverPayload ?? {
          featured_videos: [],
          trending_parties: [],
          recommended_content: [],
          popular_categories: [],
        }

      const videosSource =
        Array.isArray(discoverData.featured_videos) && discoverData.featured_videos.length > 0
          ? discoverData.featured_videos
          : Array.isArray(trendingVideosPayload)
            ? trendingVideosPayload
            : []

      const normalizedVideos = Array.isArray(videosSource)
        ? videosSource.map((video) => buildVideoCard(video))
        : []

      const discoverParties: FeaturedPartyCard[] = Array.isArray(discoverData.trending_parties)
        ? discoverData.trending_parties.map((party) => buildPartyCard(party, "trending"))
        : []

      const trendingParties: FeaturedPartyCard[] = Array.isArray(trendingPartiesPayload)
        ? trendingPartiesPayload.map((party) => buildPartyCard(party, "trending"))
        : []

      const recommendedParties: FeaturedPartyCard[] = Array.isArray(recommendedPartiesPayload)
        ? recommendedPartiesPayload.map((party) => buildPartyCard(party, "recommended"))
        : []

      const normalizedParties = dedupePartyCards([
        ...discoverParties,
        ...trendingParties,
        ...recommendedParties,
      ])

      const recommendedUsers: SuggestedUserCard[] = Array.isArray(discoverData.recommended_content)
        ? discoverData.recommended_content
            .filter((item: DiscoverRecommendation) => item?.type === "user")
            .map((item: DiscoverRecommendation) =>
              buildSuggestedUserCard(
                (item?.metadata ?? item) as Record<string, any>,
                "popular",
              ),
            )
        : []

      const suggestionResults: SuggestedUserCard[] = Array.isArray(userSuggestionsPayload)
        ? userSuggestionsPayload.map((user: Record<string, any>) =>
            buildSuggestedUserCard(user, "mutual_friends"),
          )
        : []

      const normalizedSuggestions = dedupeSuggestions([...recommendedUsers, ...suggestionResults])

      const normalizedCategoryCards: DiscoverCategoryCard[] = Array.isArray(
        discoverData.popular_categories,
      )
        ? discoverData.popular_categories.map((category, index: number) =>
            buildCategoryCard(category, index),
          )
        : []

      const statsSource = {
        ...(discoverData.platform_stats ?? {}),
        ...(analyticsPayload?.overview ?? {}),
      }
      const computedStats = {
        totalUsers: safeNumber(
          statsSource?.total_users ?? statsSource?.totalUsers ?? statsSource?.user_count,
          0,
        ),
        activeParties: safeNumber(
          statsSource?.active_parties ?? statsSource?.total_parties ?? statsSource?.party_count,
          normalizedParties.length,
        ),
        videosWatched: safeNumber(
          statsSource?.videos_watched ??
            statsSource?.total_watch_time_hours ??
            statsSource?.total_watch_time ??
            statsSource?.watch_time,
          0,
        ),
        newUsersToday: safeNumber(
          statsSource?.new_users_today ??
            statsSource?.daily_new_users ??
            statsSource?.newUsers ??
            statsSource?.new_users,
          0,
        ),
      }

      setStats(computedStats)
      setDefaultCollections({
        videos: normalizedVideos,
        parties: normalizedParties,
        suggestions: normalizedSuggestions,
        categories: normalizedCategoryCards,
      })
    } catch (error) {
      console.error("Failed to load discover data:", error)
      toast({
        title: "Error",
        description: "Failed to load discover content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [categoryFilter, timeFilter, toast])

  useEffect(() => {
    void loadDiscoverData()
  }, [loadDiscoverData])

  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      return
    }

    setTrendingVideos(defaultCollections.videos)
    setFeaturedParties(defaultCollections.parties)
    setSuggestedUsers(defaultCollections.suggestions)
    setTrendingCategories(defaultCollections.categories)
  }, [defaultCollections, searchQuery])

  useEffect(() => {
    const query = searchQuery.trim()
    if (query.length < 2) {
      return
    }

    let ignore = false

    const runSearch = async () => {
      setIsLoading(true)
      try {
        const categoryParam = categoryFilter === "all" ? undefined : categoryFilter

        const [videoResults, partyResults, userResults] = await Promise.all([
          videosAPI.searchVideos({ q: query, category: categoryParam, ordering: "relevance" }),
          partiesAPI.searchParties({ q: query, page: 1 }),
          usersAPI.searchUsers({ q: query, limit: 12, sort: "relevance" }),
        ])

        if (ignore) {
          return
        }

        const normalizedVideos = Array.isArray(videoResults?.results)
          ? videoResults.results.map((video: any) => buildVideoCard(video))
          : []

        const normalizedParties = dedupePartyCards(
          Array.isArray(partyResults?.results)
            ? partyResults.results.map((party: any) => buildPartyCard(party, "trending"))
            : [],
        )

        const normalizedSuggestions = dedupeSuggestions(
          Array.isArray(userResults?.results)
            ? userResults.results.map((user: any) =>
                buildSuggestedUserCard(user, "common_interests"),
              )
            : [],
        )

        const normalizedCategories =
          Array.isArray(videoResults?.facets?.categories) &&
          videoResults.facets.categories.length > 0
            ? videoResults.facets.categories.map((facet: any, index: number) =>
                buildCategoryCard(
                  {
                    id: facet.name,
                    name: facet.name,
                    description: `${facet.count} videos available`,
                    content_count: facet.count,
                  },
                  index,
                ),
              )
            : defaultCollections.categories

        setTrendingVideos(normalizedVideos)
        setFeaturedParties(normalizedParties)
        setSuggestedUsers(normalizedSuggestions)
        setTrendingCategories(normalizedCategories)
      } catch (error) {
        if (!ignore) {
          console.error("Failed to search discover content:", error)
          toast({
            title: "Search failed",
            description: "We couldn't load results for your query. Please try again.",
            variant: "destructive",
          })
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void runSearch()

    return () => {
      ignore = true
    }
  }, [searchQuery, categoryFilter, defaultCollections.categories, toast])

  const handleSendFriendRequest = async (userId: string) => {
    try {
      await usersAPI.sendFriendRequestToUser(userId)

      setSuggestedUsers((prev) => prev.filter((user) => user.id !== userId))
      setDefaultCollections((prev) => ({
        ...prev,
        suggestions: prev.suggestions.filter((user) => user.id !== userId),
      }))

      toast({
        title: "Friend request sent",
        description: "Your connection request is on its way.",
      })
    } catch (error) {
      console.error("Failed to send friend request:", error)
      toast({
        title: "Unable to send request",
        description: "We couldn't send your friend request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getSuggestionReasonText = (reason: SuggestionReason) => {
    switch (reason) {
      case "mutual_friends":
        return "Mutual friends"
      case "common_interests":
        return "Common interests"
      case "popular":
        return "Popular user"
      case "new_user":
        return "New to platform"
      case "recent_activity":
        return "Recently active"
      case "similar_content":
        return "Similar to your interests"
      default:
        return "Suggested for you"
    }
  }

  const getSuggestionIcon = (reason: SuggestionReason) => {
    switch (reason) {
      case "mutual_friends":
        return <Users className="w-3 h-3" />
      case "common_interests":
        return <Heart className="w-3 h-3" />
      case "popular":
        return <Crown className="w-3 h-3" />
      case "new_user":
        return <Sparkles className="w-3 h-3" />
      case "recent_activity":
        return <Zap className="w-3 h-3" />
      case "similar_content":
        return <Globe className="w-3 h-3" />
      default:
        return <Star className="w-3 h-3" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto pt-20 pb-8 px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Compass className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Discover</h1>
                  <p className="text-gray-400">Explore trending content and connect with the community</p>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400 focus:border-purple-500/50"
                />
              </div>

              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-white/10 backdrop-blur-sm border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="gaming">Gaming</SelectItem>
                  <SelectItem value="movies">Movies</SelectItem>
                  <SelectItem value="music">Music</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="comedy">Comedy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-400" />
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  +12%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{formatStatValue(stats.totalUsers)}</div>
              <div className="text-sm text-gray-400">Total Users</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Video className="w-5 h-5 text-green-400" />
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 border-green-500/30">
                  Live
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{formatStatValue(stats.activeParties)}</div>
              <div className="text-sm text-gray-400">Active Parties</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  +8%
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{formatStatValue(stats.videosWatched)}</div>
              <div className="text-sm text-gray-400">Videos Watched</div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between mb-2">
                <Sparkles className="w-5 h-5 text-orange-400" />
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                  New
                </Badge>
              </div>
              <div className="text-2xl font-bold text-white">{formatStatValue(stats.newUsersToday)}</div>
              <div className="text-sm text-gray-400">New Today</div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="trending" className="data-[state=active]:bg-white/20 text-white">
              <Flame className="w-4 h-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="parties" className="data-[state=active]:bg-white/20 text-white">
              <Zap className="w-4 h-4 mr-2" />
              Parties
            </TabsTrigger>
            <TabsTrigger value="people" className="data-[state=active]:bg-white/20 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              People
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-white/20 text-white">
              <Globe className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
          </TabsList>

          {isLoading ? (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
                    <Skeleton className="h-48 w-full rounded-lg bg-white/20" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-3/4 bg-white/20" />
                      <Skeleton className="h-3 w-1/2 bg-white/20" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <TabsContent value="trending" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Flame className="w-6 h-6 text-red-500" />
                      <h2 className="text-2xl font-bold text-white">Trending Videos</h2>
                      <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Hot</Badge>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {trendingVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {trendingVideos.map((video, index) => (
                        <div
                          key={video.id}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <div className="relative aspect-video">
                            <img
                              src={video.thumbnail || "/placeholder.svg"}
                              alt={video.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
                              <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />#{index + 1}
                            </div>

                            <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                              {video.durationLabel}
                            </div>

                            <div className="absolute top-2 right-2">
                              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 bg-black/50 hover:bg-black/70">
                                <Bookmark className="w-3 h-3 text-white" />
                              </Button>
                            </div>
                          </div>

                          <div className="p-4 space-y-3">
                            <h3 className="font-semibold text-white line-clamp-2 group-hover:text-purple-300 transition-colors">
                              {video.title}
                            </h3>

                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={video.uploader.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs bg-purple-500 text-white">
                                  {video.uploader.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-300">{video.uploader.name}</span>
                              {video.uploader.isVerified && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-1">
                                  <Eye className="w-3 h-3" />
                                  <span>{video.views.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Heart className="w-3 h-3" />
                                  <span>{video.likes.toLocaleString()}</span>
                                </div>
                              </div>
                              <span>{formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
                            </div>

                            {video.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {video.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs border-white/30 text-gray-300">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex space-x-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                                >
                                  <MessageCircle className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="w-8 h-8 p-0 text-gray-400 hover:text-white"
                                >
                                  <Share2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-gray-400 hover:text-white">
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Trending Videos</h3>
                      <p className="text-gray-400">Check back later for trending content.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="parties" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Zap className="w-6 h-6 text-yellow-500" />
                      <h2 className="text-2xl font-bold text-white">Featured Parties</h2>
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Editor's Choice</Badge>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {featuredParties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredParties.map((party) => (
                        <div
                          key={party.id}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/20 hover:border-yellow-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          {party.thumbnail && (
                            <div className="relative aspect-video">
                              <img
                                src={party.thumbnail || "/placeholder.svg"}
                                alt={party.title}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />

                              {party.highlight === "recommended" && (
                                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full flex items-center gap-1 font-medium">
                                  <Crown className="w-3 h-3" />
                                  Recommended
                                </div>
                              )}

                              <div className="absolute top-2 right-2">
                                <Badge
                                  className={party.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}
                                >
                                  {party.isActive ? "Live" : "Scheduled"}
                                </Badge>
                              </div>
                            </div>
                          )}

                          <div className="p-6 space-y-4">
                            <div>
                              <h3 className="font-semibold text-lg text-white mb-2 group-hover:text-yellow-300 transition-colors">
                                {party.title}
                              </h3>
                              <p className="text-sm text-gray-400 line-clamp-2">{party.description}</p>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Avatar className="w-6 h-6">
                                <AvatarImage src={party.host.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs bg-yellow-500 text-black">
                                  {party.host.name.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm text-gray-300">Hosted by {party.host.name}</span>
                              {party.host.isVerified && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <div className="flex items-center justify-between text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Users className="w-4 h-4" />
                                <span>{party.participantCount} joined</span>
                                {party.maxParticipants && <span>/ {party.maxParticipants}</span>}
                              </div>
                              {party.scheduledFor && !party.isActive && (
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{formatDistanceToNow(new Date(party.scheduledFor), { addSuffix: true })}</span>
                                </div>
                              )}
                            </div>

                            {party.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {party.tags.slice(0, 3).map((tag) => (
                                  <Badge key={tag} variant="outline" className="text-xs border-white/30 text-gray-300">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <Button
                              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-medium"
                              onClick={() => router.push(`/watch/${party.id}`)}
                            >
                              {party.isActive ? "Join Party" : "RSVP"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Featured Parties</h3>
                      <p className="text-gray-400">Check back later for featured parties.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="people" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <UserPlus className="w-6 h-6 text-blue-500" />
                      <h2 className="text-2xl font-bold text-white">People You Might Know</h2>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {suggestedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {suggestedUsers.map((suggestedUser) => (
                        <div
                          key={suggestedUser.id}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
                        >
                          <div className="text-center mb-4">
                            <div className="relative inline-block mb-4">
                              <Avatar className="w-20 h-20">
                                <AvatarImage src={suggestedUser.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-lg bg-blue-500 text-white">
                                  {suggestedUser.firstName[0]}
                                  {suggestedUser.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div
                                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white ${
                                  suggestedUser.isOnline ? "bg-green-500" : "bg-gray-400"
                                }`}
                              />
                            </div>

                            <div className="flex items-center justify-center space-x-2 mb-2">
                              <h3 className="font-semibold text-white">
                                {suggestedUser.firstName} {suggestedUser.lastName}
                              </h3>
                              {suggestedUser.isVerified && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                            </div>

                            <p className="text-sm text-gray-400 mb-2">@{suggestedUser.username}</p>

                            {suggestedUser.bio && (
                              <p className="text-sm text-gray-300 mb-3 line-clamp-2">{suggestedUser.bio}</p>
                            )}

                            <div className="flex items-center justify-center space-x-1 text-xs text-gray-400 mb-3">
                              {getSuggestionIcon(suggestedUser.reasonForSuggestion)}
                              <span>{getSuggestionReasonText(suggestedUser.reasonForSuggestion)}</span>
                            </div>
                          </div>

                          <div className="space-y-3 mb-4">
                            {suggestedUser.mutualFriends > 0 && (
                              <div className="text-center text-sm text-gray-400">
                                {suggestedUser.mutualFriends} mutual friends
                              </div>
                            )}

                            {suggestedUser.location && (
                              <div className="flex items-center justify-center space-x-1 text-sm text-gray-400">
                                <MapPin className="w-3 h-3" />
                                <span>{suggestedUser.location}</span>
                              </div>
                            )}

                            {suggestedUser.commonInterests.length > 0 && (
                              <div className="text-center">
                                <div className="text-xs text-gray-500 mb-1">Common Interests</div>
                                <div className="flex flex-wrap justify-center gap-1">
                                  {suggestedUser.commonInterests.slice(0, 3).map((interest) => (
                                    <Badge
                                      key={interest}
                                      variant="outline"
                                      className="text-xs border-white/30 text-gray-300"
                                    >
                                      {interest}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="grid grid-cols-3 gap-2 text-center text-xs">
                              <div>
                                <div className="font-semibold text-white">{suggestedUser.stats.videosUploaded}</div>
                                <div className="text-gray-500">Videos</div>
                              </div>
                              <div>
                                <div className="font-semibold text-white">{suggestedUser.stats.partiesHosted}</div>
                                <div className="text-gray-500">Parties</div>
                              </div>
                              <div>
                                <div className="font-semibold text-white">{suggestedUser.stats.friendsCount}</div>
                                <div className="text-gray-500">Friends</div>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Button
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                              onClick={() => handleSendFriendRequest(suggestedUser.id)}
                            >
                              <UserPlus className="w-4 h-4 mr-2" />
                              Add Friend
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full border-white/30 text-gray-300 hover:bg-white/10 bg-transparent"
                              onClick={() => router.push(`/profile/${suggestedUser.id}`)}
                            >
                              View Profile
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Suggestions Available</h3>
                      <p className="text-gray-400">Check back later for people you might know.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="categories" className="space-y-8">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-6 h-6 text-green-500" />
                      <h2 className="text-2xl font-bold text-white">Trending Categories</h2>
                    </div>
                    <Button variant="ghost" className="text-purple-400 hover:text-purple-300">
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>

                  {trendingCategories.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {trendingCategories.map((category) => (
                        <div
                          key={category.id}
                          className="group bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:border-green-500/50 transition-all duration-300 hover:scale-105 cursor-pointer"
                        >
                          <div className="text-center space-y-4">
                            <div
                              className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${category.colorClass} flex items-center justify-center text-2xl`}
                            >
                              {category.icon}
                            </div>

                            <div>
                              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-green-300 transition-colors">
                                {category.name}
                              </h3>
                              <p className="text-gray-400 text-sm">{category.description}</p>
                            </div>

                            <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Video className="w-4 h-4" />
                                <span>{category.itemCount.toLocaleString()} videos</span>
                              </div>
                              {category.isGrowing && (
                                <div className="flex items-center space-x-1 text-green-400">
                                  <TrendingUp className="w-4 h-4" />
                                  <span>Growing</span>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="outline"
                              className="w-full border-white/30 text-gray-300 hover:bg-white/10 group-hover:border-green-500/50 group-hover:text-green-300 bg-transparent"
                              onClick={() => router.push(`/search?q=&type=videos&category=${category.id}`)}
                            >
                              Explore {category.name}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20 text-center">
                      <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2 text-white">No Categories Available</h3>
                      <p className="text-gray-400">Check back later for trending categories.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}

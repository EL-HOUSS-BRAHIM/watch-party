"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Heart,
  Users,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
  Star,
  Clock,
  Globe,
  Camera,
  Loader2,
  Sparkles,
  Target,
  UserPlus
} from "lucide-react"

// Step schemas
const profileSchema = z.object({
  displayName: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().max(500, "Bio must be under 500 characters").optional(),
  avatar: z.any().optional(),
  timezone: z.string().min(1, "Please select your timezone"),
  language: z.string().min(1, "Please select your language"),
})

const interestsSchema = z.object({
  genres: z.array(z.string()).min(1, "Please select at least one genre"),
  movieTypes: z.array(z.string()).min(1, "Please select at least one movie type"),
  watchingPreferences: z.array(z.string()).min(1, "Please select at least one preference"),
})

const socialSchema = z.object({
  allowFriendRequests: z.boolean().default(true),
  allowPartyInvites: z.boolean().default(true),
  shareWatchHistory: z.boolean().default(false),
  findByEmail: z.boolean().default(true),
})

type ProfileFormData = z.infer<typeof profileSchema>
type InterestsFormData = z.infer<typeof interestsSchema>
type SocialFormData = z.infer<typeof socialSchema>

interface OnboardingData {
  profile: ProfileFormData
  interests: InterestsFormData
  social: SocialFormData
}

const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Musical", "Mystery", "Romance",
  "Sci-Fi", "Thriller", "War", "Western", "Biography", "History"
]

const MOVIE_TYPES = [
  "Blockbusters", "Independent Films", "Foreign Films", "Classic Movies",
  "TV Series", "Mini-Series", "Anime", "Documentaries", "Short Films"
]

const WATCHING_PREFERENCES = [
  "Binge Watching", "Weekly Episodes", "Movie Marathons", "Short Sessions",
  "Late Night Viewing", "Weekend Movies", "Discussion After", "Silent Watching"
]

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "Europe/London", label: "Greenwich Mean Time" },
  { value: "Europe/Paris", label: "Central European Time" },
  { value: "Asia/Tokyo", label: "Japan Standard Time" },
  { value: "Australia/Sydney", label: "Australian Eastern Time" },
]

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "it", label: "Italiano" },
  { value: "ja", label: "日本語" },
  { value: "ko", label: "한국어" },
  { value: "zh", label: "中文" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const { user, updateUser } = useAuth()
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState<Partial<OnboardingData>>({})

  const totalSteps = 4

  // Form instances
  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.first_name || "",
      bio: "",
      timezone: "America/New_York",
      language: "en",
    }
  })

  const interestsForm = useForm<InterestsFormData>({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      genres: [],
      movieTypes: [],
      watchingPreferences: [],
    }
  })

  const socialForm = useForm<SocialFormData>({
    resolver: zodResolver(socialSchema),
    defaultValues: {
      allowFriendRequests: true,
      allowPartyInvites: true,
      shareWatchHistory: false,
      findByEmail: true,
    }
  })

  useEffect(() => {
    // Redirect if user has already completed onboarding
    if (user?.onboarding_completed) {
      router.push("/dashboard")
    }
  }, [user, router])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Avatar must be under 5MB.",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please upload an image file.",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    profileForm.setValue("avatar", file)
  }

  const onProfileSubmit = (data: ProfileFormData) => {
    setOnboardingData(prev => ({ ...prev, profile: data }))
    setCurrentStep(2)
  }

  const onInterestsSubmit = (data: InterestsFormData) => {
    setOnboardingData(prev => ({ ...prev, interests: data }))
    setCurrentStep(3)
  }

  const onSocialSubmit = (data: SocialFormData) => {
    setOnboardingData(prev => ({ ...prev, social: data }))
    setCurrentStep(4)
  }

  const completeOnboarding = async () => {
    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem("accessToken")
      const formData = new FormData()

      // Add all onboarding data
      if (onboardingData.profile) {
        formData.append("display_name", onboardingData.profile.displayName)
        formData.append("bio", onboardingData.profile.bio || "")
        formData.append("timezone", onboardingData.profile.timezone)
        formData.append("language", onboardingData.profile.language)
        
        if (onboardingData.profile.avatar) {
          formData.append("avatar", onboardingData.profile.avatar)
        }
      }

      if (onboardingData.interests) {
        formData.append("genres", JSON.stringify(onboardingData.interests.genres))
        formData.append("movie_types", JSON.stringify(onboardingData.interests.movieTypes))
        formData.append("watching_preferences", JSON.stringify(onboardingData.interests.watchingPreferences))
      }

      if (onboardingData.social) {
        formData.append("allow_friend_requests", onboardingData.social.allowFriendRequests.toString())
        formData.append("allow_party_invites", onboardingData.social.allowPartyInvites.toString())
        formData.append("share_watch_history", onboardingData.social.shareWatchHistory.toString())
        formData.append("find_by_email", onboardingData.social.findByEmail.toString())
      }

      formData.append("onboarding_completed", "true")

      const response = await fetch("/api/users/onboarding/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const updatedUser = await response.json()
        updateUser(updatedUser)
        
        toast({
          title: "Welcome to Watch Party! 🎉",
          description: "Your account has been set up successfully.",
        })
        
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        toast({
          title: "Setup Failed",
          description: errorData.message || "Failed to complete onboarding.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Onboarding error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const progress = (currentStep / totalSteps) * 100

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <User className="h-6 w-6" />
                Set Up Your Profile
              </CardTitle>
              <CardDescription>
                Tell us about yourself to personalize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                {/* Avatar Upload */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24">
                      <AvatarImage src={avatarPreview || user?.avatar || ""} />
                      <AvatarFallback className="text-2xl">
                        {user?.first_name?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full cursor-pointer hover:bg-primary/90"
                    >
                      <Camera className="h-4 w-4" />
                    </label>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Click to upload avatar</p>
                </div>

                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    {...profileForm.register("displayName")}
                    className={profileForm.formState.errors.displayName ? "border-red-500" : ""}
                    placeholder="How should others see you?"
                  />
                  {profileForm.formState.errors.displayName && (
                    <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.displayName.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...profileForm.register("bio")}
                    className={profileForm.formState.errors.bio ? "border-red-500" : ""}
                    placeholder="Tell us a bit about yourself..."
                    rows={3}
                  />
                  {profileForm.formState.errors.bio && (
                    <p className="text-sm text-red-500 mt-1">{profileForm.formState.errors.bio.message}</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {profileForm.watch("bio")?.length || 0}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone *</Label>
                    <select
                      id="timezone"
                      {...profileForm.register("timezone")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {TIMEZONES.map(tz => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="language">Language *</Label>
                    <select
                      id="language"
                      {...profileForm.register("language")}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      {LANGUAGES.map(lang => (
                        <option key={lang.value} value={lang.value}>{lang.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )

      case 2:
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Heart className="h-6 w-6" />
                Your Interests
              </CardTitle>
              <CardDescription>
                Help us recommend the perfect content for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={interestsForm.handleSubmit(onInterestsSubmit)} className="space-y-6">
                <div>
                  <Label className="text-base font-medium">Favorite Genres *</Label>
                  <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-3 gap-2">
                    {GENRES.map(genre => {
                      const isSelected = interestsForm.watch("genres")?.includes(genre)
                      return (
                        <Badge
                          key={genre}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer justify-center py-2"
                          onClick={() => {
                            const current = interestsForm.getValues("genres") || []
                            if (isSelected) {
                              interestsForm.setValue("genres", current.filter(g => g !== genre))
                            } else {
                              interestsForm.setValue("genres", [...current, genre])
                            }
                          }}
                        >
                          {genre}
                        </Badge>
                      )
                    })}
                  </div>
                  {interestsForm.formState.errors.genres && (
                    <p className="text-sm text-red-500 mt-1">{interestsForm.formState.errors.genres.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium">Content Types *</Label>
                  <p className="text-sm text-gray-600 mb-3">What do you like to watch?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {MOVIE_TYPES.map(type => {
                      const isSelected = interestsForm.watch("movieTypes")?.includes(type)
                      return (
                        <Badge
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer justify-center py-2"
                          onClick={() => {
                            const current = interestsForm.getValues("movieTypes") || []
                            if (isSelected) {
                              interestsForm.setValue("movieTypes", current.filter(t => t !== type))
                            } else {
                              interestsForm.setValue("movieTypes", [...current, type])
                            }
                          }}
                        >
                          {type}
                        </Badge>
                      )
                    })}
                  </div>
                  {interestsForm.formState.errors.movieTypes && (
                    <p className="text-sm text-red-500 mt-1">{interestsForm.formState.errors.movieTypes.message}</p>
                  )}
                </div>

                <div>
                  <Label className="text-base font-medium">Watching Preferences *</Label>
                  <p className="text-sm text-gray-600 mb-3">How do you prefer to watch?</p>
                  <div className="grid grid-cols-2 gap-2">
                    {WATCHING_PREFERENCES.map(pref => {
                      const isSelected = interestsForm.watch("watchingPreferences")?.includes(pref)
                      return (
                        <Badge
                          key={pref}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer justify-center py-2"
                          onClick={() => {
                            const current = interestsForm.getValues("watchingPreferences") || []
                            if (isSelected) {
                              interestsForm.setValue("watchingPreferences", current.filter(p => p !== pref))
                            } else {
                              interestsForm.setValue("watchingPreferences", [...current, pref])
                            }
                          }}
                        >
                          {pref}
                        </Badge>
                      )
                    })}
                  </div>
                  {interestsForm.formState.errors.watchingPreferences && (
                    <p className="text-sm text-red-500 mt-1">{interestsForm.formState.errors.watchingPreferences.message}</p>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit">
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )

      case 3:
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="h-6 w-6" />
                Privacy & Social
              </CardTitle>
              <CardDescription>
                Control how others can interact with you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={socialForm.handleSubmit(onSocialSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="allowFriendRequests" className="font-medium">Friend Requests</Label>
                      <p className="text-sm text-gray-600">Allow others to send you friend requests</p>
                    </div>
                    <input
                      id="allowFriendRequests"
                      type="checkbox"
                      {...socialForm.register("allowFriendRequests")}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="allowPartyInvites" className="font-medium">Party Invites</Label>
                      <p className="text-sm text-gray-600">Allow friends to invite you to watch parties</p>
                    </div>
                    <input
                      id="allowPartyInvites"
                      type="checkbox"
                      {...socialForm.register("allowPartyInvites")}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="shareWatchHistory" className="font-medium">Share Watch History</Label>
                      <p className="text-sm text-gray-600">Let friends see what you've been watching</p>
                    </div>
                    <input
                      id="shareWatchHistory"
                      type="checkbox"
                      {...socialForm.register("shareWatchHistory")}
                      className="h-4 w-4"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <Label htmlFor="findByEmail" className="font-medium">Discoverable by Email</Label>
                      <p className="text-sm text-gray-600">Allow others to find you by your email address</p>
                    </div>
                    <input
                      id="findByEmail"
                      type="checkbox"
                      {...socialForm.register("findByEmail")}
                      className="h-4 w-4"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <UserPlus className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Privacy Tip</p>
                      <p className="text-sm text-blue-800">
                        You can always change these settings later in your account preferences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit">
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )

      case 4:
        return (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6" />
                You're All Set!
              </CardTitle>
              <CardDescription>
                Review your setup and complete your onboarding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </h3>
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={avatarPreview || user?.avatar || ""} />
                    <AvatarFallback>
                      {onboardingData.profile?.displayName?.[0] || user?.first_name?.[0] || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{onboardingData.profile?.displayName}</p>
                    <p className="text-sm text-gray-600">
                      {TIMEZONES.find(tz => tz.value === onboardingData.profile?.timezone)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Interests Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Interests
                </h3>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Genres ({onboardingData.interests?.genres?.length || 0})</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {onboardingData.interests?.genres?.slice(0, 5).map(genre => (
                        <Badge key={genre} variant="secondary" className="text-xs">{genre}</Badge>
                      ))}
                      {(onboardingData.interests?.genres?.length || 0) > 5 && (
                        <Badge variant="outline" className="text-xs">
                          +{(onboardingData.interests?.genres?.length || 0) - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Summary */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Privacy Settings
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    {onboardingData.social?.allowFriendRequests ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span>Friend Requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onboardingData.social?.allowPartyInvites ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span>Party Invites</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onboardingData.social?.shareWatchHistory ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span>Share History</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {onboardingData.social?.findByEmail ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <span className="h-4 w-4" />
                    )}
                    <span>Email Discovery</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Target className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-900">Ready to Go!</p>
                    <p className="text-sm text-green-800">
                      Your account is configured and ready for your first watch party.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <Button onClick={completeOnboarding} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    <>
                      Complete Setup
                      <Sparkles className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome to Watch Party!</h1>
            <p className="text-gray-600">Let's set up your account in just a few steps</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          {renderStep()}
        </div>
      </div>
    </div>
  )
}

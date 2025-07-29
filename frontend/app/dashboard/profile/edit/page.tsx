"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Camera,
  X,
  Plus,
  ArrowLeft,
  Save,
  Loader2,
  Globe,
  Lock,
  LinkIcon,
  Github,
  Twitter,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  Star,
  Users,
} from "lucide-react"

// Validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio too long").optional(),
  location: z.string().max(100, "Location too long").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  dateOfBirth: z.string().optional(),
  occupation: z.string().max(100, "Occupation too long").optional(),
  education: z.string().max(100, "Education too long").optional(),
  interests: z.array(z.string()).max(20, "Maximum 20 interests allowed"),
  socialLinks: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    github: z.string().optional(),
    facebook: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  privacy: z.object({
    profileVisibility: z.enum(["public", "friends", "private"]),
    showEmail: z.boolean(),
    showLocation: z.boolean(),
    showDateOfBirth: z.boolean(),
    allowFriendRequests: z.boolean(),
    allowMessages: z.boolean(),
  }),
})

type ProfileFormData = z.infer<typeof profileSchema>

interface UserProfile extends ProfileFormData {
  id: string
  avatar?: string
  coverImage?: string
  isVerified: boolean
  joinedDate: string
  stats: {
    friendsCount: number
    videosCount: number
    partiesHosted: number
    partiesJoined: number
  }
}

export default function ProfileEditPage() {
  const { user, updateUser } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [newInterest, setNewInterest] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      interests: [],
      socialLinks: {},
      privacy: {
        profileVisibility: "public",
        showEmail: false,
        showLocation: true,
        showDateOfBirth: false,
        allowFriendRequests: true,
        allowMessages: true,
      },
    },
  })

  const watchedValues = watch()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const profileData = await response.json()
        setProfile(profileData)

        // Reset form with loaded data
        reset({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          username: profileData.username || "",
          email: profileData.email || "",
          bio: profileData.bio || "",
          location: profileData.location || "",
          website: profileData.website || "",
          dateOfBirth: profileData.dateOfBirth || "",
          occupation: profileData.occupation || "",
          education: profileData.education || "",
          interests: profileData.interests || [],
          socialLinks: profileData.socialLinks || {},
          privacy: profileData.privacy || {
            profileVisibility: "public",
            showEmail: false,
            showLocation: true,
            showDateOfBirth: false,
            allowFriendRequests: true,
            allowMessages: true,
          },
        })
      }
    } catch (error) {
      console.error("Failed to load profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          username: data.username,
          email: data.email,
          bio: data.bio,
          location: data.location,
          website: data.website,
          date_of_birth: data.dateOfBirth,
          occupation: data.occupation,
          education: data.education,
          interests: data.interests,
          social_links: data.socialLinks,
          privacy_settings: data.privacy,
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        updateUser(updatedProfile)
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Update Failed",
          description: errorData.message || "Failed to update profile.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const uploadAvatar = async (file: File) => {
    setIsUploadingAvatar(true)
    try {
      const token = localStorage.getItem("accessToken")
      const formData = new FormData()
      formData.append("avatar", file)

      const response = await fetch("/api/users/avatar/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile((prev) => (prev ? { ...prev, avatar: data.avatar } : null))
        setAvatarPreview(null)
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated.",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const uploadCoverImage = async (file: File) => {
    setIsUploadingCover(true)
    try {
      const token = localStorage.getItem("accessToken")
      const formData = new FormData()
      formData.append("cover_image", file)

      const response = await fetch("/api/users/cover-image/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setProfile((prev) => (prev ? { ...prev, coverImage: data.cover_image } : null))
        setCoverPreview(null)
        toast({
          title: "Cover Image Updated",
          description: "Your cover image has been updated.",
        })
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("Cover image upload error:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload cover image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploadingCover(false)
    }
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Avatar must be less than 5MB.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      uploadAvatar(file)
    }
  }

  const handleCoverChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Cover image must be less than 10MB.",
          variant: "destructive",
        })
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setCoverPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      uploadCoverImage(file)
    }
  }

  const addInterest = () => {
    if (
      newInterest.trim() &&
      !watchedValues.interests.includes(newInterest.trim()) &&
      watchedValues.interests.length < 20
    ) {
      setValue("interests", [...watchedValues.interests, newInterest.trim()], { shouldDirty: true })
      setNewInterest("")
    }
  }

  const removeInterest = (interest: string) => {
    setValue(
      "interests",
      watchedValues.interests.filter((i) => i !== interest),
      { shouldDirty: true },
    )
  }

  const socialPlatforms = [
    { key: "twitter", label: "Twitter", icon: Twitter, placeholder: "https://twitter.com/username" },
    { key: "instagram", label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/username" },
    { key: "github", label: "GitHub", icon: Github, placeholder: "https://github.com/username" },
    { key: "facebook", label: "Facebook", icon: Facebook, placeholder: "https://facebook.com/username" },
    { key: "youtube", label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@username" },
    { key: "linkedin", label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/in/username" },
  ]

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">Unable to load your profile data.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User className="h-8 w-8" />
              Edit Profile
            </h1>
            <p className="text-muted-foreground mt-2">Update your personal information and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Cover Image & Avatar */}
          <Card>
            <CardContent className="p-0">
              {/* Cover Image */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-t-lg overflow-hidden">
                {coverPreview || profile.coverImage ? (
                  <img
                    src={coverPreview || profile.coverImage || "/placeholder.svg"}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Camera className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}

                {/* Cover Upload Button */}
                <div className="absolute top-4 right-4">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => coverInputRef.current?.click()}
                    disabled={isUploadingCover}
                  >
                    {isUploadingCover ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Avatar */}
                <div className="absolute -bottom-12 left-8">
                  <div className="relative">
                    <Avatar className="w-24 h-24 border-4 border-background">
                      <AvatarImage src={avatarPreview || profile.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-2xl">
                        {profile.firstName?.[0]}
                        {profile.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>

                    {/* Avatar Upload Button */}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Camera className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="p-6 pt-16">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">
                    {profile.firstName} {profile.lastName}
                  </h2>
                  {profile.isVerified && (
                    <Badge variant="secondary" className="text-xs">
                      <Star className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>

                {/* Stats */}
                <div className="flex items-center gap-6 mt-4 text-sm">
                  <div>
                    <span className="font-medium">{profile.stats.friendsCount}</span>
                    <span className="text-muted-foreground ml-1">Friends</span>
                  </div>
                  <div>
                    <span className="font-medium">{profile.stats.videosCount}</span>
                    <span className="text-muted-foreground ml-1">Videos</span>
                  </div>
                  <div>
                    <span className="font-medium">{profile.stats.partiesHosted}</span>
                    <span className="text-muted-foreground ml-1">Parties Hosted</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register("firstName")}
                    className={errors.firstName ? "border-destructive" : ""}
                  />
                  {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register("lastName")}
                    className={errors.lastName ? "border-destructive" : ""}
                  />
                  {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  {...register("username")}
                  className={errors.username ? "border-destructive" : ""}
                />
                {errors.username && <p className="text-sm text-destructive mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  {...register("bio")}
                  className={`min-h-[100px] ${errors.bio ? "border-destructive" : ""}`}
                />
                {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>}
                <p className="text-xs text-muted-foreground mt-1">{watchedValues.bio?.length || 0}/500 characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    {...register("location")}
                    className={errors.location ? "border-destructive" : ""}
                  />
                  {errors.location && <p className="text-sm text-destructive mt-1">{errors.location.message}</p>}
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    {...register("dateOfBirth")}
                    className={errors.dateOfBirth ? "border-destructive" : ""}
                  />
                  {errors.dateOfBirth && <p className="text-sm text-destructive mt-1">{errors.dateOfBirth.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">
                    <Briefcase className="w-4 h-4 inline mr-2" />
                    Occupation
                  </Label>
                  <Input
                    id="occupation"
                    placeholder="Your job title"
                    {...register("occupation")}
                    className={errors.occupation ? "border-destructive" : ""}
                  />
                  {errors.occupation && <p className="text-sm text-destructive mt-1">{errors.occupation.message}</p>}
                </div>

                <div>
                  <Label htmlFor="education">
                    <GraduationCap className="w-4 h-4 inline mr-2" />
                    Education
                  </Label>
                  <Input
                    id="education"
                    placeholder="Your education background"
                    {...register("education")}
                    className={errors.education ? "border-destructive" : ""}
                  />
                  {errors.education && <p className="text-sm text-destructive mt-1">{errors.education.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="website">
                  <LinkIcon className="w-4 h-4 inline mr-2" />
                  Website
                </Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://yourwebsite.com"
                  {...register("website")}
                  className={errors.website ? "border-destructive" : ""}
                />
                {errors.website && <p className="text-sm text-destructive mt-1">{errors.website.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add an interest"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addInterest())}
                    disabled={watchedValues.interests.length >= 20}
                  />
                  <Button
                    type="button"
                    onClick={addInterest}
                    variant="outline"
                    disabled={watchedValues.interests.length >= 20}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {watchedValues.interests.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.interests.map((interest) => (
                      <Badge key={interest} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">{watchedValues.interests.length}/20 interests</p>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon
                return (
                  <div key={platform.key}>
                    <Label htmlFor={platform.key}>
                      <Icon className="w-4 h-4 inline mr-2" />
                      {platform.label}
                    </Label>
                    <Input
                      id={platform.key}
                      placeholder={platform.placeholder}
                      {...register(`socialLinks.${platform.key as keyof typeof watchedValues.socialLinks}`)}
                    />
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Privacy Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Profile Visibility</Label>
                <Select
                  value={watchedValues.privacy.profileVisibility}
                  onValueChange={(value) => setValue("privacy.profileVisibility", value as any, { shouldDirty: true })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        Public - Anyone can see your profile
                      </div>
                    </SelectItem>
                    <SelectItem value="friends">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Friends Only - Only friends can see your profile
                      </div>
                    </SelectItem>
                    <SelectItem value="private">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Private - Only you can see your profile
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Email Address</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your email</p>
                  </div>
                  <Switch
                    checked={watchedValues.privacy.showEmail}
                    onCheckedChange={(checked) => setValue("privacy.showEmail", checked, { shouldDirty: true })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Location</Label>
                    <p className="text-sm text-muted-foreground">Display your location on your profile</p>
                  </div>
                  <Switch
                    checked={watchedValues.privacy.showLocation}
                    onCheckedChange={(checked) => setValue("privacy.showLocation", checked, { shouldDirty: true })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show Date of Birth</Label>
                    <p className="text-sm text-muted-foreground">Display your birthday on your profile</p>
                  </div>
                  <Switch
                    checked={watchedValues.privacy.showDateOfBirth}
                    onCheckedChange={(checked) => setValue("privacy.showDateOfBirth", checked, { shouldDirty: true })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Friend Requests</Label>
                    <p className="text-sm text-muted-foreground">Let others send you friend requests</p>
                  </div>
                  <Switch
                    checked={watchedValues.privacy.allowFriendRequests}
                    onCheckedChange={(checked) =>
                      setValue("privacy.allowFriendRequests", checked, { shouldDirty: true })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Allow Messages</Label>
                    <p className="text-sm text-muted-foreground">Let others send you direct messages</p>
                  </div>
                  <Switch
                    checked={watchedValues.privacy.allowMessages}
                    onCheckedChange={(checked) => setValue("privacy.allowMessages", checked, { shouldDirty: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving || !isDirty} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Hidden file inputs */}
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
      </div>
    </div>
  )
}

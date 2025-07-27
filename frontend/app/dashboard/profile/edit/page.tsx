"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Camera,
  Upload,
  X,
  Save,
  Loader2,
  ArrowLeft,
  MapPin,
  Link,
  Twitter,
  Instagram,
  Facebook,
  Github,
  Eye,
  EyeOff,
  AlertTriangle
} from "lucide-react"

// Validation schema
const profileFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name too long"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name too long"),
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio too long").optional(),
  location: z.string().max(100, "Location too long").optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  birthday: z.string().optional(),
  isPublic: z.boolean(),
  showEmail: z.boolean(),
  showLocation: z.boolean(),
  showBirthday: z.boolean(),
  socialLinks: z.object({
    twitter: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    github: z.string().optional(),
  })
})

type ProfileFormData = z.infer<typeof profileFormSchema>

interface UserProfile extends ProfileFormData {
  id: string
  avatar?: string
  joinedDate: string
  isVerified: boolean
}

export default function ProfileEditPage() {
  const router = useRouter()
  const { user, updateProfile } = useAuth()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
    reset
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      bio: "",
      location: "",
      website: "",
      birthday: "",
      isPublic: true,
      showEmail: false,
      showLocation: true,
      showBirthday: true,
      socialLinks: {
        twitter: "",
        instagram: "",
        facebook: "",
        github: "",
      }
    }
  })

  const watchedValues = watch()

  useEffect(() => {
    loadProfile()
  }, [])

  useEffect(() => {
    setHasUnsavedChanges(isDirty || avatarFile !== null)
  }, [isDirty, avatarFile])

  const loadProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const profileData: UserProfile = await response.json()
        
        // Reset form with loaded data
        reset({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          username: profileData.username,
          email: profileData.email,
          bio: profileData.bio || "",
          location: profileData.location || "",
          website: profileData.website || "",
          birthday: profileData.birthday || "",
          isPublic: profileData.isPublic,
          showEmail: profileData.showEmail,
          showLocation: profileData.showLocation,
          showBirthday: profileData.showBirthday,
          socialLinks: profileData.socialLinks || {
            twitter: "",
            instagram: "",
            facebook: "",
            github: "",
          }
        })

        setAvatarPreview(profileData.avatar || "")
      } else {
        toast({
          title: "Error",
          description: "Failed to load profile data.",
          variant: "destructive",
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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB.",
          variant: "destructive",
        })
        return
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file.",
          variant: "destructive",
        })
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async () => {
    if (!avatarFile) return null

    setIsUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append("avatar", avatarFile)

      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/avatar/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        return data.avatar_url
      } else {
        throw new Error("Failed to upload avatar")
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      })
      return null
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const onSubmit = async (data: ProfileFormData) => {
    setIsSaving(true)
    try {
      let avatarUrl = avatarPreview

      // Upload avatar if changed
      if (avatarFile) {
        const uploadedAvatarUrl = await uploadAvatar()
        if (uploadedAvatarUrl) {
          avatarUrl = uploadedAvatarUrl
        }
      }

      // Update profile
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          avatar: avatarUrl,
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        
        // Update auth context
        await updateProfile(updatedProfile)
        
        // Reset form state
        reset(data)
        setAvatarFile(null)
        setHasUnsavedChanges(false)

        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })

        // Redirect to settings or stay on page
        router.push("/dashboard/settings")
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

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview("")
    setHasUnsavedChanges(true)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <User className="h-8 w-8" />
                Edit Profile
              </h1>
              <p className="text-gray-600">Update your personal information and preferences</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Unsaved Changes
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Edit' : 'Preview'}
            </Button>
          </div>
        </div>

        {/* Preview Mode */}
        {showPreview ? (
          <Card>
            <CardHeader>
              <CardTitle>Profile Preview</CardTitle>
              <CardDescription>This is how your profile will appear to others</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={avatarPreview || "/placeholder-user.jpg"} />
                  <AvatarFallback className="text-xl">
                    {watchedValues.firstName?.[0]}{watchedValues.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">
                    {watchedValues.firstName} {watchedValues.lastName}
                  </h2>
                  <p className="text-gray-600 mb-2">@{watchedValues.username}</p>
                  {watchedValues.bio && (
                    <p className="text-gray-700 mb-4">{watchedValues.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {watchedValues.showLocation && watchedValues.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {watchedValues.location}
                      </div>
                    )}
                    {watchedValues.website && (
                      <div className="flex items-center gap-1">
                        <Link className="h-4 w-4" />
                        <a href={watchedValues.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Edit Form */
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Avatar Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Profile Picture
                </CardTitle>
                <CardDescription>
                  Upload a profile picture. Recommended size: 400x400px (max 5MB)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview || "/placeholder-user.jpg"} />
                    <AvatarFallback className="text-xl">
                      {watchedValues.firstName?.[0]}{watchedValues.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload New
                      </Button>
                      
                      {avatarPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={removeAvatar}
                          disabled={isUploadingAvatar}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Remove
                        </Button>
                      )}
                    </div>
                    
                    {isUploadingAvatar && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </div>
                    )}
                  </div>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Your personal details and contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      {...register("firstName")}
                      className={errors.firstName ? "border-red-500" : ""}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500 mt-1">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      {...register("lastName")}
                      className={errors.lastName ? "border-red-500" : ""}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500 mt-1">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    className={errors.username ? "border-red-500" : ""}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell others about yourself..."
                    {...register("bio")}
                    className={`min-h-[100px] ${errors.bio ? "border-red-500" : ""}`}
                  />
                  {errors.bio && (
                    <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      {...register("location")}
                      className={errors.location ? "border-red-500" : ""}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-500 mt-1">{errors.location.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://yourwebsite.com"
                      {...register("website")}
                      className={errors.website ? "border-red-500" : ""}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-500 mt-1">{errors.website.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="birthday">Birthday</Label>
                  <Input
                    id="birthday"
                    type="date"
                    {...register("birthday")}
                    className={errors.birthday ? "border-red-500" : ""}
                  />
                  {errors.birthday && (
                    <p className="text-sm text-red-500 mt-1">{errors.birthday.message}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
                <CardDescription>Connect your social media profiles</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="twitter" className="flex items-center gap-2">
                      <Twitter className="h-4 w-4 text-blue-400" />
                      Twitter
                    </Label>
                    <Input
                      id="twitter"
                      placeholder="username"
                      {...register("socialLinks.twitter")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4 text-pink-500" />
                      Instagram
                    </Label>
                    <Input
                      id="instagram"
                      placeholder="username"
                      {...register("socialLinks.instagram")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="facebook" className="flex items-center gap-2">
                      <Facebook className="h-4 w-4 text-blue-600" />
                      Facebook
                    </Label>
                    <Input
                      id="facebook"
                      placeholder="username"
                      {...register("socialLinks.facebook")}
                    />
                  </div>
                  <div>
                    <Label htmlFor="github" className="flex items-center gap-2">
                      <Github className="h-4 w-4" />
                      GitHub
                    </Label>
                    <Input
                      id="github"
                      placeholder="username"
                      {...register("socialLinks.github")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control what information is visible to others</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isPublic">Public Profile</Label>
                    <p className="text-sm text-gray-600">Make your profile visible to other users</p>
                  </div>
                  <Switch
                    id="isPublic"
                    {...register("isPublic")}
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Show on Profile</h4>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showEmail">Email Address</Label>
                      <p className="text-sm text-gray-600">Allow others to see your email</p>
                    </div>
                    <Switch
                      id="showEmail"
                      {...register("showEmail")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showLocation">Location</Label>
                      <p className="text-sm text-gray-600">Show your location on your profile</p>
                    </div>
                    <Switch
                      id="showLocation"
                      {...register("showLocation")}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showBirthday">Birthday</Label>
                      <p className="text-sm text-gray-600">Show your birthday on your profile</p>
                    </div>
                    <Switch
                      id="showBirthday"
                      {...register("showBirthday")}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving || !hasUnsavedChanges}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

"use client"

import { Bell, Camera, Clock, File, Image, Save, Shield, Trash, Upload, User, X } from "lucide-react"
import { useState, useEffect , useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"

interface UserProfile {}
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  bio: string
  avatar: string
  coverImage: string
  location: string
  website: string
  birthDate: string
  phone: string
  timezone: string
  language: string
  theme: string
  isPublic: boolean
  showEmail: boolean
  showLocation: boolean
  showBirthDate: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  marketingEmails: boolean
  friendRequests: boolean
  partyInvites: boolean
  achievements: boolean
}

export default function ProfileEditPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>(&quot;&quot;)
  const [coverPreview, setCoverPreview] = useState<string>(&quot;&quot;)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }
    fetchProfile()
  }, [user, router])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {}
        headers: {}
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      } else {}
        throw new Error("Failed to fetch profile")
      }
    } catch (err) {
      console.error("Profile fetch error:", error)
      toast({title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserProfile, value: unknown) => {}
    if (!profile) return
    setProfile((prev) => ({}
      ...prev!,
      [field]: value,
    }))
    setHasChanges(true)

    // Clear field error
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: &quot;" }))
    }
  }

  const handleFileChange = (type: "avatar" | "cover", file: File | null) => {}
    if (!file) return
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      })
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {}
      toast({title: "Invalid File Type",
        description: "Please select an image file.",
        variant: "destructive",
      })
      return
    }

    if (type === "avatar") {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    } else {}
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
    setHasChanges(true)
  }

  const validateProfile = (): boolean => {}
    const newErrors: Record<string, string> = { if (!profile?.username?.trim()) {}
      newErrors.username = "Username is required"
    } else if (profile.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    } else if (!/^[a-zA-Z0-9_]+$/.test(profile.username)) {}
      newErrors.username = "Username can only contain letters, numbers, and underscores"
    }

    if (!profile?.email?.trim()) {}
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(profile.email)) {}
      newErrors.email = "Please enter a valid email address"
    }

    if (!profile?.displayName?.trim()) {}
      newErrors.displayName = "Display name is required"
    }

    if (profile?.bio && profile.bio.length > 500) {
      newErrors.bio = "Bio must be less than 500 characters"
    }

    if (profile?.website && !/^https?:\/\/.+/.test(profile.website)) {}
      newErrors.website = "Website must be a valid URL (include http:// or https://)"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const uploadFile = async (file: File, type: "avatar" | "cover"): Promise<string> => {}
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", type)

    const token = localStorage.getItem("accessToken")
    const response = await fetch("/api/users/upload-image/", {}
      method: "POST",
      headers: {}
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Failed to upload ${type}`)
    }

    const data = await response.json()
    return data.url
  }

  const handleSave = async () => {
    if (!profile || !validateProfile()) return
    setIsSaving(true)

    try {
      const updatedProfile = { ...profile }

      // Upload files if changed
      if (avatarFile) {
        updatedProfile.avatar = await uploadFile(avatarFile, "avatar")
      }
      if (coverFile) {
        updatedProfile.coverImage = await uploadFile(coverFile, "cover")
      }

      const token = localStorage.getItem("accessToken")
      const response = await fetch("/api/users/profile/", {}
        method: "PUT",
        headers: {}
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setHasChanges(false)
        setAvatarFile(null)
        setCoverFile(null)
        setAvatarPreview("")
        setCoverPreview("")

        toast({title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        })
      } else {}
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update profile")
      }
    } catch (err) {
      console.error("Profile update error:", error)
      toast({title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update profile.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {}
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to cancel?")) {}
        fetchProfile()
        setHasChanges(false)
        setAvatarFile(null)
        setCoverFile(null)
        setAvatarPreview("")
        setCoverPreview("")
        setErrors({)
      }
    } else {}
      router.push("/dashboard/profile")
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-8 rounded-2xl border border-white/20">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-white/10 rounded w-1/3"></div>
              <div className="space-y-4">
                <div className="h-4 bg-white/10 rounded w-full"></div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
        <div className="max-w-4xl mx-auto">
          <Alert className="glass-card border-red-500/30 bg-red-500/10">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">Failed to load profile data.</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-card p-6 rounded-2xl border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
              <p className="text-gray-400">Manage your account settings and preferences</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="glass-card border-white/20 hover:border-red-500/50 hover:bg-red-500/10 text-white bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {isSaving ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </div>
                )}
              </Button>
            </div>
          </div>

          {hasChanges && (
            <div className="mt-4">
              <Alert className="bg-yellow-500/10 border-yellow-500/20">
                <AlertCircle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400">
                  You have unsaved changes. Don't forget to save your updates.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>

        {/* Profile Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-card border border-white/20 bg-white/5 p-1">
            <TabsTrigger
              value="profile"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="privacy"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Shield className="w-4 h-4 mr-2" />
              Privacy
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger
              value="preferences"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300"
            >
              <Palette className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Cover Image */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Cover Image
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Upload a cover image for your profile (recommended: 1200x300px)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="w-full h-48 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg overflow-hidden">
                    {coverPreview || profile.coverImage ? (
                      <Image
                        src={coverPreview || profile.coverImage || "/placeholder.svg"}
                        alt="Cover"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-400">No cover image</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 right-4 flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => document.getElementById(&quot;cover-upload&quot;)?.click()}
                      className="bg-black/50 hover:bg-black/70 text-white"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                    {(coverPreview || profile.coverImage) && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {}
                          setCoverFile(null)
                          setCoverPreview("")
                          handleInputChange("coverImage", "")
                        }}
                        className="bg-red-500/80 hover:bg-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(&quot;cover&quot;, e.target.files?.[0] || null)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Basic Information
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Your basic profile information visible to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 p-1">
                      <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                        {avatarPreview || profile.avatar ? (
                          <Image
                            src={avatarPreview || profile.avatar || "/placeholder-user.jpg"}
                            alt="Avatar"
                            width={88}
                            height={88}
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => document.getElementById(&quot;avatar-upload&quot;)?.click()}
                      className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-purple-500 hover:bg-purple-600 text-white p-0"
                    >
                      <Camera className="w-4 h-4" />
                    </Button>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(&quot;avatar&quot;, e.target.files?.[0] || null)}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">Profile Picture</h3>
                    <p className="text-gray-400 text-sm">Upload a profile picture (recommended: 400x400px)</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        JPG, PNG, GIF
                      </Badge>
                      <Badge variant="outline" className="border-purple-500/30 text-purple-300">
                        Max 5MB
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-300">
                      Username *
                    </Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => handleInputChange(&quot;username&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="Enter username"
                    />
                    {errors.username && <p className="text-red-400 text-sm">{errors.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-300">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => handleInputChange(&quot;email&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="Enter email"
                    />
                    {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-gray-300">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => handleInputChange(&quot;firstName&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-gray-300">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => handleInputChange(&quot;lastName&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="Enter last name"
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="displayName" className="text-gray-300">
                      Display Name *
                    </Label>
                    <Input
                      id="displayName"
                      value={profile.displayName}
                      onChange={(e) => handleInputChange(&quot;displayName&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="Enter display name"
                    />
                    {errors.displayName && <p className="text-red-400 text-sm">{errors.displayName}</p>}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio" className="text-gray-300">
                      Bio
                    </Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => handleInputChange(&quot;bio&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400 min-h-[100px]"
                      placeholder="Tell us about yourself..."
                      maxLength={500}
                    />
                    <div className="flex justify-between text-sm">
                      {errors.bio && <p className="text-red-400">{errors.bio}</p>}
                      <p className="text-gray-400 ml-auto">{profile.bio?.length || 0}/500</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-300">
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={profile.location}
                      onChange={(e) => handleInputChange(&quot;location&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website" className="text-gray-300">
                      Website
                    </Label>
                    <Input
                      id="website"
                      value={profile.website}
                      onChange={(e) => handleInputChange(&quot;website&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="https://example.com"
                    />
                    {errors.website && <p className="text-red-400 text-sm">{errors.website}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="text-gray-300">
                      Birth Date
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      value={profile.birthDate}
                      onChange={(e) => handleInputChange(&quot;birthDate&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-gray-300">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => handleInputChange(&quot;phone&quot;, e.target.value)}
                      className="glass-card border-white/20 focus:border-purple-500/50 text-white placeholder-gray-400"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Privacy Settings
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Control who can see your information and how you appear to others
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Public Profile</h4>
                      <p className="text-gray-400 text-sm">Make your profile visible to everyone</p>
                    </div>
                    <Switch
                      checked={profile.isPublic}
                      onCheckedChange={(checked) => handleInputChange(&quot;isPublic&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Show Email</h4>
                      <p className="text-gray-400 text-sm">Display your email address on your profile</p>
                    </div>
                    <Switch
                      checked={profile.showEmail}
                      onCheckedChange={(checked) => handleInputChange(&quot;showEmail&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Show Location</h4>
                      <p className="text-gray-400 text-sm">Display your location on your profile</p>
                    </div>
                    <Switch
                      checked={profile.showLocation}
                      onCheckedChange={(checked) => handleInputChange(&quot;showLocation&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Show Birth Date</h4>
                      <p className="text-gray-400 text-sm">Display your birth date on your profile</p>
                    </div>
                    <Switch
                      checked={profile.showBirthDate}
                      onCheckedChange={(checked) => handleInputChange(&quot;showBirthDate&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Friend Requests</h4>
                      <p className="text-gray-400 text-sm">Allow others to send you friend requests</p>
                    </div>
                    <Switch
                      checked={profile.friendRequests}
                      onCheckedChange={(checked) => handleInputChange(&quot;friendRequests&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Party Invites</h4>
                      <p className="text-gray-400 text-sm">Allow others to invite you to watch parties</p>
                    </div>
                    <Switch
                      checked={profile.partyInvites}
                      onCheckedChange={(checked) => handleInputChange(&quot;partyInvites&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Show Achievements</h4>
                      <p className="text-gray-400 text-sm">Display your achievements on your profile</p>
                    </div>
                    <Switch
                      checked={profile.achievements}
                      onCheckedChange={(checked) => handleInputChange(&quot;achievements&quot;, checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Choose how you want to be notified about activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Email Notifications</h4>
                      <p className="text-gray-400 text-sm">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={profile.emailNotifications}
                      onCheckedChange={(checked) => handleInputChange(&quot;emailNotifications&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Push Notifications</h4>
                      <p className="text-gray-400 text-sm">Receive push notifications in your browser</p>
                    </div>
                    <Switch
                      checked={profile.pushNotifications}
                      onCheckedChange={(checked) => handleInputChange(&quot;pushNotifications&quot;, checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-white font-medium">Marketing Emails</h4>
                      <p className="text-gray-400 text-sm">Receive promotional emails and updates</p>
                    </div>
                    <Switch
                      checked={profile.marketingEmails}
                      onCheckedChange={(checked) => handleInputChange(&quot;marketingEmails&quot;, checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="glass-card border-white/20 bg-white/5">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Palette className="w-5 h-5 mr-2" />
                  App Preferences
                </CardTitle>
                <CardDescription className="text-gray-400">Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-300">
                      <Clock className="w-4 h-4 inline mr-2" />
                      Timezone
                    </Label>
                    <Select value={profile.timezone} onValueChange={(value) => handleInputChange(&quot;timezone&quot;, value)}>
                      <SelectTrigger className="glass-card border-white/20 focus:border-purple-500/50 text-white">
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20 bg-slate-800">
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-gray-300">
                      <Languages className="w-4 h-4 inline mr-2" />
                      Language
                    </Label>
                    <Select value={profile.language} onValueChange={(value) => handleInputChange(&quot;language&quot;, value)}>
                      <SelectTrigger className="glass-card border-white/20 focus:border-purple-500/50 text-white">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20 bg-slate-800">
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                        <SelectItem value="ja">日本語</SelectItem>
                        <SelectItem value="ko">한국어</SelectItem>
                        <SelectItem value="zh">中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="theme" className="text-gray-300">
                      <Sparkles className="w-4 h-4 inline mr-2" />
                      Theme
                    </Label>
                    <Select value={profile.theme} onValueChange={(value) => handleInputChange(&quot;theme&quot;, value)}>
                      <SelectTrigger className="glass-card border-white/20 focus:border-purple-500/50 text-white">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent className="glass-card border-white/20 bg-slate-800">
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                        <SelectItem value="cinema">Cinema</SelectItem>
                        <SelectItem value="neon">Neon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

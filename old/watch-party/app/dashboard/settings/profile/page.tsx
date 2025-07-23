"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ProfileSettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src="" />
              <AvatarFallback>DU</AvatarFallback>
            </Avatar>
            <Button variant="outline">Change Avatar</Button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" placeholder="First name" />
            </div>
            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" placeholder="Last name" />
            </div>
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Email address" />
          </div>
          
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input id="bio" placeholder="Tell us about yourself..." />
          </div>
          
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}

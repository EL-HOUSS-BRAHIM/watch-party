"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function CreatePartyPage() {
  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Watch Party</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Party Title</Label>
            <Input id="title" placeholder="Enter party title..." />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Describe your watch party..." />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="public" />
            <Label htmlFor="public">Make party public</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="chat" defaultChecked />
            <Label htmlFor="chat">Enable chat</Label>
          </div>
          
          <Button className="w-full">Create Watch Party</Button>
        </CardContent>
      </Card>
    </div>
  )
}

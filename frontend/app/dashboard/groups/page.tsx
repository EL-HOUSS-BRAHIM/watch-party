"use client"
import GroupManagementSystem from "@/components/groups/group-management-system"

interface GroupMember {
  id: string
  user: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
    isVerified: boolean
  }
  role: "owner" | "admin" | "moderator" | "member"
  joinedAt: string
  isOnline: boolean
  lastActive?: string
}

interface Group {
  id: string
  name: string
  description: string
  avatar?: string
  coverImage?: string
  isPrivate: boolean
  memberCount: number
  maxMembers: number
  owner: {
    id: string
    username: string
    firstName: string
    lastName: string
    avatar?: string
  }
  members: GroupMember[]
  tags: string[]
  createdAt: string
  updatedAt: string
  lastActivity?: string
  stats: {
    totalMessages: number
    totalParties: number
    activeMembers: number
    weeklyActivity: number
  }
  permissions: {
    canInvite: boolean
    canCreateParties: boolean
    canManageMembers: boolean
    canEditGroup: boolean
  }
}

interface CreateGroupData {
  name: string
  description: string
  isPrivate: boolean
  maxMembers: number
  tags: string[]
}

export default function GroupsPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <GroupManagementSystem />
      </div>
    </div>
  )
}

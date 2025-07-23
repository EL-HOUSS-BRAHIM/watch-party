'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  username: string
  plan: 'free' | 'premium'
  createdAt: Date
  isEmailVerified: boolean
  preferences: {
    notifications: boolean
    privateProfile: boolean
    autoPlay: boolean
  }
}

interface UseUserReturn {
  user: User | null
  updateUser: (updates: Partial<User>) => Promise<void>
  updatePreferences: (preferences: Partial<User['preferences']>) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  uploadAvatar: (file: File) => Promise<string>
  deleteAccount: () => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // TODO: Replace with actual API call
      const response = await fetch('/api/user/profile')
      if (!response.ok) throw new Error('Failed to fetch user')
      
      const userData = await response.json()
      setUser(userData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user')
    } finally {
      setIsLoading(false)
    }
  }

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to update user')

      const updatedUser = await response.json()
      setUser(updatedUser)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updatePreferences = async (preferences: Partial<User['preferences']>) => {
    if (!user) return

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      })

      if (!response.ok) throw new Error('Failed to update preferences')

      const updatedPreferences = await response.json()
      setUser(prev => prev ? {
        ...prev,
        preferences: { ...prev.preferences, ...updatedPreferences }
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preferences')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to change password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('avatar', file)

      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to upload avatar')

      const { avatarUrl } = await response.json()
      
      if (user) {
        setUser(prev => prev ? { ...prev, avatar: avatarUrl } : null)
      }

      return avatarUrl
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch('/api/user/delete', {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete account')

      setUser(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    user,
    updateUser,
    updatePreferences,
    changePassword,
    uploadAvatar,
    deleteAccount,
    isLoading,
    error,
  }
}

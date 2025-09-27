import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'

type Mock = ReturnType<typeof jest.fn>

const getGroupsMock: Mock = jest.fn()
const joinGroupMock: Mock = jest.fn()
const getFriendsMock: Mock = jest.fn()
const getFriendSuggestionsMock: Mock = jest.fn()
const getActivityMock: Mock = jest.fn()
const getAchievementsMock: Mock = jest.fn()
const sendFriendRequestMock: Mock = jest.fn()
const useToastMock: Mock = jest.fn()
const mockToast: Mock = jest.fn()

const EnhancedSocialFeatures = require('@/components/social/enhanced-social-features').EnhancedSocialFeatures as typeof import('@/components/social/enhanced-social-features').EnhancedSocialFeatures

jest.mock('@/lib/api', () => ({
  socialAPI: {
    getGroups: (...args: unknown[]) => getGroupsMock(...args),
    joinGroup: (...args: unknown[]) => joinGroupMock(...args),
  },
  usersAPI: {
    getFriends: (...args: unknown[]) => getFriendsMock(...args),
    getFriendSuggestions: (...args: unknown[]) => getFriendSuggestionsMock(...args),
    getActivity: (...args: unknown[]) => getActivityMock(...args),
    getAchievements: (...args: unknown[]) => getAchievementsMock(...args),
    sendFriendRequestToUser: (...args: unknown[]) => sendFriendRequestMock(...args),
  },
}))

jest.mock('@/hooks/use-toast', () => ({
  useToast: (...args: unknown[]) => useToastMock(...args),
}))

const mockFriendsResponse = {
  results: [
    {
      id: '1',
      username: 'testuser1',
      displayName: 'Test User 1',
      display_name: 'Test User 1',
      avatar: '/test-avatar1.jpg',
      avatar_url: '/test-avatar1.jpg',
      isOnline: true,
      is_online: true,
      lastSeen: '2025-01-01T00:00:00Z',
      last_seen: '2025-01-01T00:00:00Z',
    },
  ],
}

const mockSuggestionsResponse = [
  {
    id: '2',
    username: 'suggested1',
    displayName: 'Suggested User',
    display_name: 'Suggested User',
    avatar: '/suggested-avatar.jpg',
    avatar_url: '/suggested-avatar.jpg',
    isOnline: false,
    is_online: false,
    mutualFriends: 5,
    mutual_friends: 5,
  },
]

const mockCommunitiesResponse = {
  results: [
    {
      id: '1',
      name: 'Test Community',
      description: 'A test community',
      memberCount: 100,
      member_count: 100,
      isPublic: true,
      is_public: true,
      thumbnail: '/community-thumb.jpg',
    },
  ],
}

const mockActivityResponse = {
  results: [
    {
      id: '1',
      user: {
        id: '1',
        username: 'testuser1',
        displayName: 'Test User 1',
        display_name: 'Test User 1',
        avatar: '/test-avatar1.jpg',
        avatar_url: '/test-avatar1.jpg',
      },
      activityType: 'video_watch',
      activity_type: 'video_watch',
      metadata: {
        title: 'Test Video',
        videoId: 'vid123',
        video_id: 'vid123',
      },
      createdAt: '2025-01-01T00:00:00Z',
      created_at: '2025-01-01T00:00:00Z',
    },
  ],
}

const mockAchievementsResponse = [
  {
    id: '1',
    name: 'First Watch',
    description: 'Watched your first video',
    icon: '🎬',
    unlockedAt: '2025-01-01T00:00:00Z',
    unlocked_at: '2025-01-01T00:00:00Z',
  },
]

describe('EnhancedSocialFeatures', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getGroupsMock.mockReset()
    joinGroupMock.mockReset()
    getFriendsMock.mockReset()
    getFriendSuggestionsMock.mockReset()
    getActivityMock.mockReset()
    getAchievementsMock.mockReset()
    sendFriendRequestMock.mockReset()
    useToastMock.mockReset()
    mockToast.mockReset()

    useToastMock.mockReturnValue({ toast: mockToast })
    getFriendsMock.mockResolvedValue(mockFriendsResponse)
    getFriendSuggestionsMock.mockResolvedValue(mockSuggestionsResponse)
    getGroupsMock.mockResolvedValue(mockCommunitiesResponse)
    getActivityMock.mockResolvedValue(mockActivityResponse)
    getAchievementsMock.mockResolvedValue(mockAchievementsResponse)
    sendFriendRequestMock.mockResolvedValue({})
  })

  it('renders loading state initially', () => {
    render(<EnhancedSocialFeatures />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('fetches and displays social data on mount', async () => {
    render(<EnhancedSocialFeatures />)

    await waitFor(() => {
      expect(getFriendsMock).toHaveBeenCalledWith({ limit: 20 })
      expect(getFriendSuggestionsMock).toHaveBeenCalledWith({ limit: 20 })
      expect(getGroupsMock).toHaveBeenCalledWith({ page: 1, public_only: true })
      expect(getActivityMock).toHaveBeenCalledWith({ page: 1 })
      expect(getAchievementsMock).toHaveBeenCalled()
    })

    // Check that the data is displayed
    expect(screen.getByText('Test User 1')).toBeInTheDocument()
    expect(screen.getByText('Test Community')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    getFriendsMock.mockRejectedValue(new Error('API Error'))

    render(<EnhancedSocialFeatures />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to load social data. Please try again.',
        variant: 'destructive',
      })
    })
  })

  it('can send friend requests', async () => {
    sendFriendRequestMock.mockResolvedValue({})

    render(<EnhancedSocialFeatures />)

    await waitFor(() => {
      expect(screen.getByText('Suggested User')).toBeInTheDocument()
    })

    const addFriendButton = screen.getByRole('button', { name: /add friend/i })
    fireEvent.click(addFriendButton)

    await waitFor(() => {
      expect(sendFriendRequestMock).toHaveBeenCalledWith('2')
    })
  })

  it('handles empty responses gracefully', async () => {
    getFriendsMock.mockResolvedValue({ results: [] })
    getFriendSuggestionsMock.mockResolvedValue([])
    getGroupsMock.mockResolvedValue({ results: [] })
    getActivityMock.mockResolvedValue({ results: [] })
    getAchievementsMock.mockResolvedValue([])

    render(<EnhancedSocialFeatures />)

    await waitFor(() => {
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
    })

    // Should still render the UI structure without errors
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
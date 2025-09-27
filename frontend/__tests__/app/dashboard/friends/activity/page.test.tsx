import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import FriendsActivityFeed from '@/app/dashboard/friends/activity/page'
import { usersAPI } from '@/lib/api'

type Mock = ReturnType<typeof jest.fn>

const useToastMock: Mock = jest.fn()
const getActivityMock: Mock = jest.fn()

// Mock the API modules
jest.mock('@/lib/api', () => ({
  usersAPI: {
    getActivity: (...args: unknown[]) => getActivityMock(...args),
  },
}))

// Mock the toast hook
jest.mock('@/hooks/use-toast', () => ({
  useToast: (...args: unknown[]) => useToastMock(...args),
}))

const mockToast: Mock = jest.fn()

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
        isOnline: true,
        is_online: true,
      },
      activityType: 'video_watch',
      activity_type: 'video_watch',
      metadata: {
        title: 'Test Video',
        description: 'A great test video',
        thumbnail: '/test-thumb.jpg',
        videoId: 'vid123',
        video_id: 'vid123',
      },
      createdAt: '2025-01-01T12:00:00Z',
      created_at: '2025-01-01T12:00:00Z',
      privacy: 'public',
    },
    {
      id: '2',
      user: {
        id: '2',
        username: 'testuser2',
        displayName: 'Test User 2',
        display_name: 'Test User 2',
        avatar: '/test-avatar2.jpg',
        avatar_url: '/test-avatar2.jpg',
        isOnline: false,
        is_online: false,
      },
      activityType: 'party_join',
      activity_type: 'party_join',
      metadata: {
        title: 'Test Party',
        partyId: 'party456',
        party_id: 'party456',
      },
      createdAt: '2025-01-01T11:30:00Z',
      created_at: '2025-01-01T11:30:00Z',
      privacy: 'friends',
    },
    {
      id: '3',
      user: {
        id: '3',
        username: 'testuser3',
        displayName: 'Test User 3',
        display_name: 'Test User 3',
        avatar: '/test-avatar3.jpg',
        avatar_url: '/test-avatar3.jpg',
      },
      activityType: 'achievement_unlock',
      activity_type: 'achievement_unlock',
      metadata: {
        title: 'First Watch',
        achievementId: 'ach789',
        achievement_id: 'ach789',
      },
      createdAt: '2025-01-01T10:15:00Z',
      created_at: '2025-01-01T10:15:00Z',
      privacy: 'public',
    },
  ],
}

describe('FriendsActivityFeed', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useToastMock.mockReset()
    mockToast.mockReset()
    getActivityMock.mockReset()

    useToastMock.mockReturnValue({ toast: mockToast })
    getActivityMock.mockResolvedValue(mockActivityResponse)
  })

  it('fetches activities on mount', async () => {
    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(usersAPI.getActivity).toHaveBeenCalledWith({ page: 1 })
    })

    expect(screen.getByText('Test Video')).toBeInTheDocument()
    expect(screen.getByText('Test Party')).toBeInTheDocument()
    expect(screen.getByText('First Watch')).toBeInTheDocument()
  })

  it('applies activity type filter', async () => {
    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument()
    })

    const videosTab = screen.getByRole('tab', { name: /videos/i })
    fireEvent.click(videosTab)

    await waitFor(() => {
      expect(usersAPI.getActivity).toHaveBeenCalledWith({
        page: 1,
        type: 'video_watch'
      })
    })
  })

  it('applies timeframe filter', async () => {
    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument()
    })

    const timeframeSelect = screen.getByRole('combobox')
    fireEvent.click(timeframeSelect)

    const weekOption = screen.getByRole('option', { name: /this week/i })
    fireEvent.click(weekOption)

    await waitFor(() => {
      expect(usersAPI.getActivity).toHaveBeenCalledWith({
        page: 1,
        timeframe: 'week'
      })
    })
  })

  it('handles API errors gracefully', async () => {
    getActivityMock.mockRejectedValue(new Error('API Error'))

    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Could not load friend activity',
        description: 'Please try again later.',
        variant: 'destructive',
      })
    })
  })

  it('handles empty response gracefully', async () => {
    getActivityMock.mockResolvedValue({ results: [] })

    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText(/no recent activity/i)).toBeInTheDocument()
    })
  })

  it('displays loading state initially', () => {
    render(<FriendsActivityFeed />)
    expect(screen.getByTestId('activity-loading')).toBeInTheDocument()
  })

  it('normalizes malformed activity data', async () => {
    const malformedResponse = {
      results: [
        {
          id: '1',
          activity_type: null,
          user: null,
          metadata: null,
          created_at: 'invalid-date'
        }
      ]
    }

    getActivityMock.mockResolvedValue(malformedResponse)

    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(usersAPI.getActivity).toHaveBeenCalled()
    })

    expect(screen.getByText('Activity update')).toBeInTheDocument()
    expect(screen.getByText('Friend')).toBeInTheDocument()
  })

  it('filters activities locally based on selected type', async () => {
    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(screen.getByText('Test Video')).toBeInTheDocument()
      expect(screen.getByText('Test Party')).toBeInTheDocument()
      expect(screen.getByText('First Watch')).toBeInTheDocument()
    })

    const filterSelect = screen.getByRole('combobox', { name: /filter by type/i })
    fireEvent.click(filterSelect)
    const videoOption = screen.getByRole('option', { name: /video activities/i })
    fireEvent.click(videoOption)

    expect(screen.getByText('Test Video')).toBeInTheDocument()
    expect(screen.queryByText('Test Party')).not.toBeInTheDocument()
    expect(screen.queryByText('First Watch')).not.toBeInTheDocument()
  })

  it('refreshes data when filters change', async () => {
    render(<FriendsActivityFeed />)

    await waitFor(() => {
      expect(usersAPI.getActivity).toHaveBeenCalledTimes(1)
    })

    const timeframeSelect = screen.getByRole('combobox', { name: /timeframe/i })
    fireEvent.click(timeframeSelect)
    const weekOption = screen.getByRole('option', { name: /this week/i })
    fireEvent.click(weekOption)

    await waitFor(() => {
      expect(usersAPI.getActivity).toHaveBeenCalledTimes(2)
    })
  })
})

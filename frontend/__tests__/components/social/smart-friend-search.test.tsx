import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { jest } from '@jest/globals'
import SmartFriendSearch from '@/components/social/smart-friend-search'

type Mock = ReturnType<typeof jest.fn>

const searchUsersMock: Mock = jest.fn()
const getFriendSuggestionsMock: Mock = jest.fn()
const sendFriendRequestMock: Mock = jest.fn()
const useToastMock: Mock = jest.fn()
const mockToast: Mock = jest.fn()

jest.mock('@/lib/api', () => ({}
  usersAPI: {}
    searchUsers: (...args: unknown[]) => searchUsersMock(...args),
    getFriendSuggestions: (...args: unknown[]) => getFriendSuggestionsMock(...args),
    sendFriendRequestToUser: (...args: unknown[]) => sendFriendRequestMock(...args),
  },
}))

jest.mock('@/hooks/use-toast', () => ({}
  useToast: (...args: unknown[]) => useToastMock(...args),
}))

const mockSearchResponse = { results: []
    {}
      id: '1',
      username: 'searchresult1',
      displayName: 'Search Result 1',
      display_name: 'Search Result 1',
      avatar: '/search-avatar1.jpg',
      avatar_url: '/search-avatar1.jpg',
      isOnline: true,
      is_online: true,
      mutualFriends: 3,
      mutual_friends: 3,
      commonInterests: ['movies', 'gaming'],
      common_interests: ['movies', 'gaming'],
      location: 'New York',
      stats: {}
        moviesWatched: 5,
        movies_watched: 5,
        partiesHosted: 2,
        parties_hosted: 2,
        friendsCount: 10,
        friends_count: 10,
      },
    },
  ],
}

const mockSuggestions = []
  {}
    id: '2',
    username: 'suggestion1',
    displayName: 'Suggestion 1',
    display_name: 'Suggestion 1',
    avatar: '/suggestion-avatar1.jpg',
    avatar_url: '/suggestion-avatar1.jpg',
    isOnline: false,
    is_online: false,
    mutualFriends: 5,
    mutual_friends: 5,
    commonInterests: ['music', 'tv'],
    common_interests: ['music', 'tv'],
    location: 'California',
    stats: {}
      moviesWatched: 8,
      movies_watched: 8,
      partiesHosted: 1,
      parties_hosted: 1,
      friendsCount: 20,
      friends_count: 20,
    },
  },
]

describe('SmartFriendSearch', () => {}
  beforeEach(() => {}
    jest.clearAllMocks()
    searchUsersMock.mockReset()
    getFriendSuggestionsMock.mockReset()
    sendFriendRequestMock.mockReset()
    useToastMock.mockReset()
    mockToast.mockReset()

    useToastMock.mockReturnValue({ toast: mockToast })
    searchUsersMock.mockResolvedValue(mockSearchResponse)
    getFriendSuggestionsMock.mockResolvedValue(mockSuggestions)
    sendFriendRequestMock.mockResolvedValue({})
  })

  it('loads friend suggestions on mount', async () => {}
    render(<SmartFriendSearch />)

    await waitFor(() => {}
      expect(getFriendSuggestionsMock).toHaveBeenCalledWith({ limit: 12 })
    })

    expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
  })

  it('performs search when typing in search input', async () => {}
    render(<SmartFriendSearch />)

    const searchInput = screen.getByPlaceholderText(/search for friends/i)
    fireEvent.change(searchInput, { target: { value: 'test user' } })

    await waitFor(() => {}
      expect(searchUsersMock).toHaveBeenCalledWith({}
        q: 'test user',
        limit: 20,
        sort: 'relevance',
      })
    })

    expect(screen.getByText('Search Result 1')).toBeInTheDocument()
  })

  it('does not search for queries shorter than 3 characters', () => {}
    render(<SmartFriendSearch />)

    const searchInput = screen.getByPlaceholderText(/search for friends/i)
    fireEvent.change(searchInput, { target: { value: 'ab' } })

    expect(searchUsersMock).not.toHaveBeenCalled()
  })

  it('can send friend requests from search results', async () => {}
    render(<SmartFriendSearch />)

    const searchInput = screen.getByPlaceholderText(/search for friends/i)
    fireEvent.change(searchInput, { target: { value: 'test user' } })

    await waitFor(() => {}
      expect(screen.getByText('Search Result 1')).toBeInTheDocument()
    })

    const addFriendButton = screen.getAllByRole('button', { name: /add friend/i })[0]
    fireEvent.click(addFriendButton)

    await waitFor(() => {}
      expect(sendFriendRequestMock).toHaveBeenCalledWith('1')
    })
  })

  it('can send friend requests from suggestions', async () => {}
    render(<SmartFriendSearch />)

    await waitFor(() => {}
      expect(screen.getByText('Suggestion 1')).toBeInTheDocument()
    })

    const addFriendButtons = screen.getAllByRole('button', { name: /add friend/i })
    fireEvent.click(addFriendButtons[addFriendButtons.length - 1])

    await waitFor(() => {}
      expect(sendFriendRequestMock).toHaveBeenCalledWith('2')
    })
  })

  it('handles API errors gracefully', async () => {}
    getFriendSuggestionsMock.mockRejectedValue(new Error('API Error'))

    render(<SmartFriendSearch />)

    await waitFor(() => {}
      expect(mockToast).toHaveBeenCalledWith({}
        title: 'Unable to load suggestions',
        description: 'Please try refreshing suggestions in a moment.',
        variant: 'destructive',
      })
    })
  })

  it('shows a fallback when no suggestions are returned', async () => {}
    getFriendSuggestionsMock.mockResolvedValue([])

    render(<SmartFriendSearch />)

    await waitFor(() => {}
      expect(screen.getByText(/no suggestions just yet/i)).toBeInTheDocument()
    })
  })
})

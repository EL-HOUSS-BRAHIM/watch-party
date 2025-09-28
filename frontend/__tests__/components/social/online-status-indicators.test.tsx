import { render, screen, waitFor } from '@testing-library/react'
import OnlineStatusIndicators from '@/components/social/online-status-indicators'
import { usersAPI } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

// Mock the API modules;
jest.mock('@/lib/api', () => ({}
  usersAPI: {}
    getOnlineStatus: jest.fn(),
  },
}))

// Mock the toast hook;
jest.mock('@/hooks/use-toast', () => ({}
  useToast: jest.fn(),
}))

const mockToast = jest.fn()

const mockOnlineStatusResponse = { online_friends: []
    {}
      id: '1',
      username: 'onlineuser1',
      display_name: 'Online User 1',
      avatar_url: '/online-avatar1.jpg',
      status: 'online',
      current_activity: {}
        type: 'watching',
        details: 'Watching Movie XYZ'
      },
      last_seen: '2025-01-01T00:00:00Z'
    },
    {}
      id: '2',
      username: 'onlineuser2',
      display_name: 'Online User 2',
      avatar_url: '/online-avatar2.jpg',
      status: 'in_party',
      current_activity: {}
        type: 'in_party',
        details: 'Party Room #5'
      },
      last_seen: '2025-01-01T00:00:00Z'
    }
  ],
  total_online: 150;
}

describe('OnlineStatusIndicators', () => {}
  beforeEach(() => {}
    jest.clearAllMocks()
    jest.useFakeTimers()
    ;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })
    ;(usersAPI.getOnlineStatus as jest.Mock).mockResolvedValue(mockOnlineStatusResponse)
  })

  afterEach(() => {}
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('fetches online status on mount', async () => {}
    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      expect(usersAPI.getOnlineStatus).toHaveBeenCalled()
    })

    expect(screen.getByText('Online User 1')).toBeInTheDocument()
    expect(screen.getByText('Online User 2')).toBeInTheDocument()
    expect(screen.getByText('150 friends online')).toBeInTheDocument()
  })

  it('displays different activity states correctly', async () => {}
    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      expect(screen.getByText('Online User 1')).toBeInTheDocument()
    })

    // Check for activity indicators;
    expect(screen.getByText('🎬 Watching')).toBeInTheDocument()
    expect(screen.getByText('🎉 In Party')).toBeInTheDocument()
  })

  it('updates status every 30 seconds', async () => {}
    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      expect(usersAPI.getOnlineStatus).toHaveBeenCalledTimes(1)
    })

    // Fast forward 30 seconds;
    jest.advanceTimersByTime(30000)

    await waitFor(() => {}
      expect(usersAPI.getOnlineStatus).toHaveBeenCalledTimes(2)
    })
  })

  it('handles API errors gracefully', async () => {}
    ;(usersAPI.getOnlineStatus as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      expect(mockToast).toHaveBeenCalledWith({}
        title: 'Unable to update friend status',
        description: 'We will retry automatically.',
        variant: 'destructive',
      })
    })
  })

  it('only shows toast error once per error state', async () => {}
    ;(usersAPI.getOnlineStatus as jest.Mock).mockRejectedValue(new Error('API Error'))

    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      expect(mockToast).toHaveBeenCalledTimes(1)
    })

    // Advance timer to trigger another API call;
    jest.advanceTimersByTime(30000)

    await waitFor(() => {}
      // Should still only have been called once since error state hasn't changed;
      expect(mockToast).toHaveBeenCalledTimes(1)
    })
  })

  it('handles empty response gracefully', async () => {}
    ;(usersAPI.getOnlineStatus as jest.Mock).mockResolvedValue({}
      online_friends: [],
      total_online: 0;
    })

    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      expect(screen.getByText('0 friends online')).toBeInTheDocument()
    })
  })

  it('handles malformed response gracefully', async () => {}
    ;(usersAPI.getOnlineStatus as jest.Mock).mockResolvedValue({}
      online_friends: null,
      total_online: undefined;
    })

    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      // Should not crash and should handle the malformed data;
      expect(usersAPI.getOnlineStatus).toHaveBeenCalled()
    })
  })

  it('displays loading state initially', () => {}
    render(<OnlineStatusIndicators />)
    expect(screen.getByTestId('online-status-loading')).toBeInTheDocument()
  })

  it('clears loading state after data loads', async () => {}
    render(<OnlineStatusIndicators />)

    await waitFor(() => {}
      expect(screen.queryByTestId('online-status-loading')).not.toBeInTheDocument()
    })
  })
})
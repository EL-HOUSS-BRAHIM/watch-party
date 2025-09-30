/**
 * API Client for Watch Party Backend
 * Handles all API requests with proper error handling and authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://be-watch-party.brahim-elhouss.me';

interface ApiError {
  success: false;
  error: string;
  message: string;
  details?: Record<string, string[]>;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // Get JWT token from localStorage if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData: ApiError = await response.json().catch(() => ({
        success: false,
        error: 'network_error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));
      
      throw new Error(errorData.message || `API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

/**
 * Dashboard API
 */
export const dashboardApi = {
  /**
   * Get dashboard statistics for authenticated user
   * @returns Dashboard stats including parties, videos, and watch time
   */
  getStats: (): Promise<any> => apiFetch('/analytics/dashboard/'),
};

/**
 * Parties API
 */
export const partiesApi = {
  /**
   * List user's parties
   * @param params Optional query parameters (page, search, is_public, host)
   */
  list: (params?: { page?: number; search?: string; is_public?: boolean; host?: string }): Promise<any> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiFetch(`/parties/${queryString}`);
  },

  /**
   * Get party details by ID
   */
  getById: (partyId: string): Promise<any> => apiFetch(`/parties/${partyId}/`),

  /**
   * Create a new party
   */
  create: (data: {
    title: string;
    description?: string;
    video_id: string;
    visibility?: 'public' | 'friends' | 'private';
    max_participants?: number;
    scheduled_start?: string;
  }): Promise<any> => apiFetch('/parties/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  /**
   * Get recent parties
   */
  getRecent: (): Promise<any> => apiFetch('/parties/recent/'),

  /**
   * Get public parties
   */
  getPublic: (): Promise<any> => apiFetch('/parties/public/'),
};

/**
 * Videos API
 */
export const videosApi = {
  /**
   * List videos
   * @param params Optional query parameters (page, search, source_type, visibility)
   */
  list: (params?: { 
    page?: number; 
    search?: string; 
    source_type?: string; 
    visibility?: string;
  }): Promise<any> => {
    const queryString = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return apiFetch(`/videos/${queryString}`);
  },

  /**
   * Get video details by ID
   */
  getById: (videoId: string): Promise<any> => apiFetch(`/videos/${videoId}/`),

  /**
   * Create a new video
   */
  create: (data: {
    title: string;
    description?: string;
    source_type?: string;
    source_url?: string;
    visibility?: 'public' | 'friends' | 'private';
  }): Promise<any> => apiFetch('/videos/', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

/**
 * User/Profile API
 */
export const userApi = {
  /**
   * Get current user profile
   */
  getProfile: (): Promise<any> => apiFetch('/auth/profile/'),

  /**
   * Update user profile
   */
  updateProfile: (data: {
    first_name?: string;
    last_name?: string;
    is_premium?: boolean;
  }): Promise<any> => apiFetch('/auth/profile/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

/**
 * Analytics API
 */
export const analyticsApi = {
  /**
   * Get user analytics/stats
   */
  getUserStats: (): Promise<any> => apiFetch('/analytics/user-stats/'),

  /**
   * Get party analytics
   */
  getPartyStats: (partyId: string): Promise<any> => apiFetch(`/analytics/party-stats/${partyId}/`),
};

export default {
  dashboard: dashboardApi,
  parties: partiesApi,
  videos: videosApi,
  user: userApi,
  analytics: analyticsApi,
};

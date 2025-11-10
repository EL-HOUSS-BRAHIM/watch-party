/**
 * TanStack Query Client Configuration
 * Centralized configuration for React Query with optimized defaults
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

const queryConfig: DefaultOptions = {
  queries: {
    // Data is considered fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    
    // Keep unused data in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
    
    // Retry failed requests 3 times with exponential backoff
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus for real-time updates
    refetchOnWindowFocus: true,
    
    // Don't refetch on mount if data is fresh
    refetchOnMount: false,
    
    // Refetch on network reconnection
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
    retryDelay: 1000,
  },
};

/**
 * Create a new QueryClient instance
 * Use this for testing or creating multiple clients
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: queryConfig,
  });
}

/**
 * Global QueryClient instance
 * Use this in your application
 */
export const queryClient = createQueryClient();

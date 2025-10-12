import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://be-watch-party.brahim-elhouss.me'

export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'no_refresh_token',
          message: 'No refresh token available',
        },
        { status: 401 }
      )
    }

    // Forward request to Django backend
    const response = await fetch(`${BACKEND_URL}/api/auth/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      // Refresh token is invalid or expired
      const nextResponse = NextResponse.json(
        { 
          success: false,
          error: data.error || 'refresh_failed',
          message: data.message || 'Failed to refresh token',
        },
        { status: response.status }
      )
      
      // Clear invalid tokens
      nextResponse.cookies.delete('access_token')
      nextResponse.cookies.delete('refresh_token')
      
      return nextResponse
    }

    // Get new access token (backend might return 'access' or 'access_token')
    const newAccessToken = data.access_token || data.access

    if (!newAccessToken) {
      return NextResponse.json(
        { 
          success: false,
          error: 'invalid_response',
          message: 'Backend did not return new access token',
        },
        { status: 500 }
      )
    }

    // Create response
    const nextResponse = NextResponse.json({
      success: true,
      message: 'Token refreshed successfully',
    })

    // Update access token cookie
    nextResponse.cookies.set('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    })

    // If backend also sent a new refresh token, update it
    const newRefreshToken = data.refresh_token || data.refresh
    if (newRefreshToken && newRefreshToken !== refreshToken) {
      nextResponse.cookies.set('refresh_token', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return nextResponse
  } catch (error) {
    console.error('Token refresh proxy error:', error)
    
    const nextResponse = NextResponse.json(
      { 
        success: false,
        error: 'network_error',
        message: error instanceof Error ? error.message : 'Failed to refresh token',
      },
      { status: 500 }
    )
    
    // Clear tokens on error
    nextResponse.cookies.delete('access_token')
    nextResponse.cookies.delete('refresh_token')
    
    return nextResponse
  }
}

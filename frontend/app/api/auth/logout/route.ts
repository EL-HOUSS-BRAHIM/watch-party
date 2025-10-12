import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://be-watch-party.brahim-elhouss.me'

export async function POST(request: NextRequest) {
  try {
    // Get tokens from cookies
    const accessToken = request.cookies.get('access_token')?.value
    const refreshToken = request.cookies.get('refresh_token')?.value

    // Forward request to Django backend
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    // Add authorization header if we have an access token
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }

    const response = await fetch(`${BACKEND_URL}/api/auth/logout/`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ refresh_token: refreshToken }),
      credentials: 'include',
    })

    const data = await response.json().catch(() => ({ success: true, message: 'Logged out' }))

    // Create response
    const nextResponse = NextResponse.json({
      success: true,
      message: data.message || 'Logged out successfully',
    })

    // Clear cookies
    nextResponse.cookies.delete('access_token')
    nextResponse.cookies.delete('refresh_token')

    return nextResponse
  } catch (error) {
    console.error('Logout proxy error:', error)
    
    // Even if backend fails, clear cookies locally
    const nextResponse = NextResponse.json(
      { 
        success: true,
        message: 'Logged out successfully' 
      },
      { status: 200 }
    )
    
    nextResponse.cookies.delete('access_token')
    nextResponse.cookies.delete('refresh_token')
    
    return nextResponse
  }
}

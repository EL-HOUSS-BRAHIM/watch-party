import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://be-watch-party.brahim-elhouss.me'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward request to Django backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Check if backend sent tokens in JSON (direct backend call)
    // or if it set cookies (proper backend configuration)
    const setCookieHeaders = response.headers.getSetCookie()
    
    // Create response with user data only (no tokens)
    const nextResponse = NextResponse.json({
      success: true,
      user: data.user,
      message: data.message || 'Login successful',
    })

    // If backend sent cookies, forward them
    if (setCookieHeaders && setCookieHeaders.length > 0) {
      // Forward cookies from backend to frontend
      setCookieHeaders.forEach(cookie => {
        const cookieHeader = cookie.split(';')[0]
        const [name, value] = cookieHeader.split('=')
        
        // Re-set cookie on frontend domain
        nextResponse.cookies.set(name, value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: name === 'access_token' ? 60 * 60 : 60 * 60 * 24 * 7, // 1 hour for access, 7 days for refresh
        })
      })
    } else if (data.access_token && data.refresh_token) {
      // Backend sent tokens in JSON (fallback for old backend versions)
      // Set them as HTTP-only cookies
      nextResponse.cookies.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60, // 1 hour
      })

      nextResponse.cookies.set('refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return nextResponse
  } catch (error) {
    console.error('Login proxy error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'network_error',
        message: error instanceof Error ? error.message : 'Failed to connect to backend' 
      },
      { status: 500 }
    )
  }
}

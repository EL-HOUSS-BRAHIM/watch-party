import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://be-watch-party.brahim-elhouss.me'

export async function GET(request: NextRequest) {
  try {
    // Get access token from cookie
    const accessToken = request.cookies.get('access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { 
          authenticated: false,
          user: null,
        },
        { status: 401 }
      )
    }

    // Forward request to Django backend to get user profile
    const response = await fetch(`${BACKEND_URL}/api/auth/profile/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    if (!response.ok) {
      // Token might be expired, return unauthenticated
      return NextResponse.json(
        { 
          authenticated: false,
          user: null,
        },
        { status: 401 }
      )
    }

    const user = await response.json()

    return NextResponse.json({
      authenticated: true,
      user,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { 
        authenticated: false,
        user: null,
      },
      { status: 401 }
    )
  }
}

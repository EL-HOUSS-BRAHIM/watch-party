import { NextRequest, NextResponse } from 'next/server'

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://be-watch-party.brahim-elhouss.me'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Login route - BACKEND_URL:', BACKEND_URL)
    console.log('Login route - Request body:', body)
    
    // Forward request to Django backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    })

    console.log('Backend response status:', response.status)
    console.log('Backend response headers:', Object.fromEntries(response.headers.entries()))
    
    const contentType = response.headers.get('content-type')
    console.log('Content-Type:', contentType)
    
    // Check if response is JSON
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text()
      console.error('Backend returned non-JSON response:', text.substring(0, 500))
      return NextResponse.json(
        { 
          success: false, 
          error: 'invalid_response',
          message: 'Backend returned invalid response format' 
        },
        { status: 500 }
      )
    }

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Check if backend sent tokens in JSON (direct backend call)
    // or if it set cookies (proper backend configuration)
    
    // Create response with user data only (no tokens)
    const nextResponse = NextResponse.json({
      success: true,
      user: data.user,
      message: data.message || 'Login successful',
    })

    // If backend sent tokens in JSON, set them as HTTP-only cookies
    if (data.access_token && data.refresh_token) {
      // Backend sent tokens in JSON (fallback for old backend versions)
      // Set them as HTTP-only cookies with domain for cross-subdomain access
      nextResponse.cookies.set('access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: '.brahim-elhouss.me', // Allow cookies across subdomains
        maxAge: 60 * 60, // 1 hour
      })

      nextResponse.cookies.set('refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        domain: '.brahim-elhouss.me', // Allow cookies across subdomains
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

/**
 * WebSocket Token Generation API Route
 * Proxies to backend to generate JWT tokens for WebSocket authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // Get access token from httpOnly cookie
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Call backend WebSocket token endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/ws-token/`, {
        method: 'GET',
        headers: {
          'Cookie': `access_token=${accessToken}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: errorData.message || 'Failed to generate WebSocket token' },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Return JWT token from backend
      return NextResponse.json({
        wsToken: data.token,
        expiresIn: data.expires_in,
        success: data.success,
      });

    } catch (error) {
      console.error('[WS Token] Failed to fetch from backend:', error);
      return NextResponse.json(
        { error: 'Failed to generate WebSocket token' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('[WS Token] Error generating token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


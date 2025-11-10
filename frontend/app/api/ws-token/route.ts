/**
 * WebSocket Token Generation API Route
 * Generates short-lived tokens for WebSocket authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Short-lived token TTL (5 minutes)
const WS_TOKEN_TTL = 5 * 60 * 1000;

export async function GET(request: NextRequest) {
  try {
    // Get auth token from httpOnly cookie
    const cookieStore = await cookies();
    const authToken = cookieStore.get('auth_token')?.value;

    if (!authToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Validate token by checking with backend
    // In production, you might want to validate JWT expiry here
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    try {
      const response = await fetch(`${backendUrl}/api/auth/session/`, {
        headers: {
          'Cookie': `auth_token=${authToken}`,
        },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }

      const sessionData = await response.json();

      // Generate WebSocket token with embedded user info and expiry
      const wsToken = Buffer.from(JSON.stringify({
        authToken,
        userId: sessionData.user?.id,
        exp: Date.now() + WS_TOKEN_TTL,
      })).toString('base64');

      return NextResponse.json({
        wsToken,
        expiresIn: WS_TOKEN_TTL,
        userId: sessionData.user?.id,
      });

    } catch (error) {
      console.error('[WS Token] Failed to validate session:', error);
      return NextResponse.json(
        { error: 'Failed to validate session' },
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

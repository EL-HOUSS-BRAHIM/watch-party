import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "https://be-watch-party.brahim-elhouss.me"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

async function fetchProfile(accessToken: string) {
  return fetch(`${BACKEND_URL}/api/auth/profile/`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  })
}

async function refreshAccessToken(refreshToken: string) {
  return fetch(`${BACKEND_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })
}

export async function GET(request: NextRequest) {
  const accessTokenCookie = request.cookies.get("access_token")?.value
  const refreshTokenCookie = request.cookies.get("refresh_token")?.value

  console.log("[Session Check] Access token exists:", !!accessTokenCookie)
  console.log("[Session Check] Refresh token exists:", !!refreshTokenCookie)

  if (!accessTokenCookie && !refreshTokenCookie) {
    console.log("[Session Check] No tokens found, returning unauthenticated")
    return NextResponse.json({ authenticated: false, user: null })
  }

  let accessToken = accessTokenCookie

  try {
    if (accessToken) {
      const profileResponse = await fetchProfile(accessToken)

      if (profileResponse.ok) {
        const user = await profileResponse.json()
        console.log("[Session Check] Profile fetched successfully for user:", user.email)
        return NextResponse.json({ authenticated: true, user })
      }

      console.log("[Session Check] Profile fetch failed with status:", profileResponse.status)

      if (profileResponse.status !== 401 || !refreshTokenCookie) {
        return NextResponse.json({ authenticated: false, user: null }, { status: profileResponse.status })
      }
    }

    if (!refreshTokenCookie) {
      const response = NextResponse.json({ authenticated: false, user: null }, { status: 401 })
      response.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      return response
    }

    const refreshResponse = await refreshAccessToken(refreshTokenCookie)
    const refreshData = await refreshResponse.json().catch(() => ({}))

    if (!refreshResponse.ok) {
      const response = NextResponse.json({ authenticated: false, user: null }, { status: refreshResponse.status })
      response.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      if (refreshResponse.status === 401) {
        response.cookies.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      }
      return response
    }

    accessToken = refreshData.access_token ?? refreshData.access
    const newRefreshToken = refreshData.refresh_token ?? refreshData.refresh

    if (!accessToken) {
      const response = NextResponse.json({ authenticated: false, user: null }, { status: 401 })
      response.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      response.cookies.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      return response
    }

    const profileResponse = await fetchProfile(accessToken)

    if (!profileResponse.ok) {
      const response = NextResponse.json({ authenticated: false, user: null }, { status: profileResponse.status })
      response.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      if (profileResponse.status === 401) {
        response.cookies.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      }
      return response
    }

    const user = await profileResponse.json()
    const response = NextResponse.json({ authenticated: true, user })

    response.cookies.set("access_token", accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24,
    })

    if (newRefreshToken) {
      response.cookies.set("refresh_token", newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return response
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ authenticated: false, user: null }, { status: 500 })
  }
}


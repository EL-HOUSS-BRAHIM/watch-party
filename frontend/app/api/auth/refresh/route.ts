import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "https://be-watch-party.brahim-elhouss.me"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value

  if (!refreshToken) {
    const response = NextResponse.json({ error: "No refresh token" }, { status: 401 })
    response.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    response.cookies.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
    return response
  }

  try {
    const backendResponse = await fetch(`${BACKEND_URL}/api/auth/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    })

    const data = await backendResponse.json().catch(() => ({}))

    if (!backendResponse.ok) {
      const response = NextResponse.json(
        { error: data.detail || data.error || "Unable to refresh session" },
        { status: backendResponse.status }
      )

      if (backendResponse.status === 401) {
        response.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
        response.cookies.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      }

      return response
    }

    const newAccessToken = data.access_token ?? data.access
    const newRefreshToken = data.refresh_token ?? data.refresh

    const response = NextResponse.json({
      success: true,
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    })

    if (newAccessToken) {
      response.cookies.set("access_token", newAccessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24,
      })
    }

    if (newRefreshToken) {
      response.cookies.set("refresh_token", newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return response
  } catch (error) {
    console.error("Refresh token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


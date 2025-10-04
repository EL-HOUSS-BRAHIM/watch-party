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

  if (refreshToken) {
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      })
    } catch (error) {
      console.error("Failed to notify backend about logout", error)
    }
  }

  const response = NextResponse.json({ success: true, message: "Logged out" })
  response.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
  response.cookies.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })

  return response
}


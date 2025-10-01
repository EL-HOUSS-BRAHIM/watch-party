import { NextRequest, NextResponse } from "next/server"

// This should match your backend URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

function extractErrorMessage(data: any) {
  if (!data) {
    return "Login failed"
  }

  if (typeof data.detail === "string") {
    return data.detail
  }

  if (typeof data.message === "string") {
    return data.message
  }

  if (data.errors && typeof data.errors === "object") {
    const values = Object.values(data.errors as Record<string, unknown>)
    for (const value of values) {
      if (Array.isArray(value)) {
        const match = value.find(item => typeof item === "string")
        if (typeof match === "string") {
          return match
        }
      } else if (typeof value === "string") {
        return value
      }
    }
  }

  return "Login failed"
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Login endpoint ready. Submit credentials with a POST request.",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward the login request to the Django backend
    const response = await fetch(`${BACKEND_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      const accessToken = data.access_token ?? data.access
      const refreshToken = data.refresh_token ?? data.refresh

      // Set HTTP-only cookie with the JWT token for security
      const nextResponse = NextResponse.json({
        success: true,
        user: data.user
      })

      if (accessToken) {
        nextResponse.cookies.set("access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24 hours
        })
      }

      if (refreshToken) {
        nextResponse.cookies.set("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }

      return nextResponse
    } else {
      return NextResponse.json({ error: extractErrorMessage(data) }, { status: response.status })
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
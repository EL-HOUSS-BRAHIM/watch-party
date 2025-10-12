import { NextRequest, NextResponse } from "next/server"
import axios from "axios"

// Backend URL - uses environment variable or defaults to internal Docker network
const BACKEND_URL = process.env.BACKEND_URL || "http://backend:8000"

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

    console.log("[Login] Forwarding request to backend:", BACKEND_URL)
    const fullUrl = `${BACKEND_URL}/api/auth/login/`
    console.log("[Login] Full URL:", fullUrl)

    // Forward the login request to the Django backend using axios
    // This avoids the fetch body streaming issues in Node.js
    // Explicitly stringify the body to avoid content-length mismatch
    const jsonBody = JSON.stringify(body)
    const response = await axios.post(fullUrl, jsonBody, {
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(jsonBody).toString(),
      },
      validateStatus: () => true, // Don't throw on any status
    })

    const data = response.data

    console.log("[Login] Backend response status:", response.status)

    if (response.status === 200) {
      const accessToken = data.access_token ?? data.access
      const refreshToken = data.refresh_token ?? data.refresh

      console.log("[Login] Access token received:", !!accessToken)
      console.log("[Login] Refresh token received:", !!refreshToken)

      // Set HTTP-only cookie with the JWT token for security
      const nextResponse = NextResponse.json({
        success: true,
        user: data.user
      })

      if (accessToken) {
        console.log("[Login] Setting access_token cookie")
        nextResponse.cookies.set("access_token", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60, // 60 minutes (matches backend JWT_ACCESS_TOKEN_LIFETIME)
          path: "/",
        })
      }

      if (refreshToken) {
        console.log("[Login] Setting refresh_token cookie")
        nextResponse.cookies.set("refresh_token", refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days (matches backend JWT_REFRESH_TOKEN_LIFETIME)
          path: "/",
        })
      }

      console.log("[Login] Login successful, cookies set")
      return nextResponse
    } else {
      const message = extractErrorMessage(data)
      return NextResponse.json(
        {
          success: false,
          error: message,
          message,
        },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { success: false, error: "Internal server error", message: "Internal server error" },
      { status: 500 }
    )
  }
}
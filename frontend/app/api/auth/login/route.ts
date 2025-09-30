import { NextRequest, NextResponse } from "next/server"

// This should match your backend URL
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the login request to the Django backend
    const response = await fetch(`${BACKEND_URL}/v2/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      // Set HTTP-only cookie with the JWT token for security
      const nextResponse = NextResponse.json({ 
        success: true,
        user: data.user 
      })
      
      if (data.access) {
        nextResponse.cookies.set("access_token", data.access, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24, // 24 hours
        })
      }
      
      if (data.refresh) {
        nextResponse.cookies.set("refresh_token", data.refresh, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 7 days
        })
      }
      
      return nextResponse
    } else {
      return NextResponse.json(
        { error: data.detail || "Login failed" },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
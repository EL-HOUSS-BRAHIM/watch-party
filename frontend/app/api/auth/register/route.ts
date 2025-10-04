import { NextRequest, NextResponse } from "next/server"

// Backend URL - uses environment variable or defaults to production URL
// For local development, set BACKEND_URL=http://localhost:8000 in .env.local
const BACKEND_URL = process.env.BACKEND_URL || "https://be-watch-party.brahim-elhouss.me"

function extractErrorMessage(data: any) {
  if (!data) {
    return "Registration failed"
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

  return "Registration failed"
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Register endpoint ready. Submit details with a POST request.",
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Forward the registration request to the Django backend
    const response = await fetch(`${BACKEND_URL}/api/auth/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Registration successful! Please check your email to verify your account.",
        user: data.user
      })
    } else {
      return NextResponse.json({ error: extractErrorMessage(data) }, { status: response.status })
    }
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
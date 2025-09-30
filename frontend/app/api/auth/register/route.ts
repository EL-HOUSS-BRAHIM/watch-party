import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the registration request to the Django backend
    const response = await fetch(`${BACKEND_URL}/v2/auth/register/`, {
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
      return NextResponse.json(
        { error: data.detail || data.message || "Registration failed" },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Registration API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
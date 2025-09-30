import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token" },
        { status: 401 }
      )
    }

    // Forward request to Django backend
    const response = await fetch(`${BACKEND_URL}/v2/parties/`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch parties" },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Parties API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("access_token")?.value
    const body = await request.json()

    if (!accessToken) {
      return NextResponse.json(
        { error: "No access token" },
        { status: 401 }
      )
    }

    // Forward the create party request to Django backend
    const response = await fetch(`${BACKEND_URL}/v2/parties/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (response.ok) {
      return NextResponse.json(data)
    } else {
      return NextResponse.json(
        { error: data.detail || "Failed to create party" },
        { status: response.status }
      )
    }
  } catch (error) {
    console.error("Create party API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
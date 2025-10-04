import { NextRequest, NextResponse } from "next/server"

// Backend URL - uses environment variable or defaults to production URL
// For local development, set BACKEND_URL=http://localhost:8000 in .env.local
const BACKEND_URL = process.env.BACKEND_URL || "https://be-watch-party.brahim-elhouss.me"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code: roomCode } = await params

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/parties/public/${encodeURIComponent(roomCode)}/`,
      {
        method: "GET",
        headers: {
          "Accept": "application/json",
        },
        cache: "no-store",
      }
    )

    let data: unknown = null

    try {
      data = await response.json()
    } catch (error) {
      if (response.status !== 204) {
        console.warn("Failed to parse backend response as JSON", error)
      }
    }

    if (data === null) {
      return NextResponse.json({}, { status: response.status })
    }

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Public party proxy error:", error)
    return NextResponse.json(
      { error: "Unable to load party details" },
      { status: 500 }
    )
  }
}

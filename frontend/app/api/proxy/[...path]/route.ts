import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_URL || "https://be-watch-party.brahim-elhouss.me"

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

async function refreshAccessToken(refreshToken: string) {
  const response = await fetch(`${BACKEND_URL}/api/auth/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  })

  const data = await response.json().catch(() => ({}))
  return { response, data }
}

function copyHeaders(source: Headers, target: Headers) {
  source.forEach((value, key) => {
    const lowerKey = key.toLowerCase()
    if (["set-cookie", "content-length", "transfer-encoding"].includes(lowerKey)) {
      return
    }
    target.set(key, value)
  })
}

async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const { path } = await context.params
  const pathSegments = Array.isArray(path) ? path : []
  const backendPath = pathSegments.join("/")
  const url = new URL(request.url)
  const targetUrl = `${BACKEND_URL}/${backendPath}${url.search}`

  const requestBody =
    request.method === "GET" || request.method === "HEAD" ? undefined : await request.text()

  const accessToken = request.cookies.get("access_token")?.value
  const refreshToken = request.cookies.get("refresh_token")?.value

  const forwardRequest = async (token?: string) => {
    const headers = new Headers()

    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase()
      if (["host", "cookie", "content-length", "authorization"].includes(lowerKey)) {
        return
      }
      headers.set(key, value)
    })

    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }

    return fetch(targetUrl, {
      method: request.method,
      headers,
      body: requestBody,
      cache: "no-store",
    })
  }

  const initialResponse = await forwardRequest(accessToken)

  if (initialResponse.status !== 401 || !refreshToken) {
    const responseBody = await initialResponse.text()
    const nextResponse = new NextResponse(responseBody, {
      status: initialResponse.status,
    })
    copyHeaders(initialResponse.headers, nextResponse.headers)
    return nextResponse
  }

  try {
    const { response: refreshResponse, data: refreshData } = await refreshAccessToken(refreshToken)

    if (!refreshResponse.ok) {
      const responseBody = await initialResponse.text()
      const nextResponse = new NextResponse(responseBody, {
        status: initialResponse.status,
      })
      copyHeaders(initialResponse.headers, nextResponse.headers)
      if (refreshResponse.status === 401) {
        nextResponse.cookies.set("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
        nextResponse.cookies.set("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      }
      return nextResponse
    }

    const newAccessToken = refreshData.access_token ?? refreshData.access
    const newRefreshToken = refreshData.refresh_token ?? refreshData.refresh

    const retryResponse = await forwardRequest(newAccessToken)
    const responseBody = await retryResponse.text()
    const nextResponse = new NextResponse(responseBody, {
      status: retryResponse.status,
    })
    copyHeaders(retryResponse.headers, nextResponse.headers)

    if (newAccessToken) {
      nextResponse.cookies.set("access_token", newAccessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60, // 60 minutes (matches backend JWT_ACCESS_TOKEN_LIFETIME)
      })
    }

    if (newRefreshToken) {
      nextResponse.cookies.set("refresh_token", newRefreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60 * 24 * 7,
      })
    }

    return nextResponse
  } catch (error) {
    console.error("Proxy refresh error:", error)
    const body = await initialResponse.text()
    const nextResponse = new NextResponse(body, {
      status: initialResponse.status,
    })
    copyHeaders(initialResponse.headers, nextResponse.headers)
    return nextResponse
  }
}

export const GET = handleRequest
export const POST = handleRequest
export const PUT = handleRequest
export const PATCH = handleRequest
export const DELETE = handleRequest
export const HEAD = handleRequest
export const OPTIONS = handleRequest


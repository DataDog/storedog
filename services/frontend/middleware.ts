import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Read RUM credentials forwarded by nginx
  // Nginx reads from puppeteer custom headers or uses defaults
  const rumAppId = request.headers.get('x-rum-app-id')
  const rumClientToken = request.headers.get('x-rum-client-token')

  // Only set cookies if we have credentials (nginx should always provide these)
  if (rumAppId && rumClientToken) {
    // Set both cookies in the response
    response.cookies.set('rum_app_id', rumAppId, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // Must be readable by JavaScript
    })
    
    response.cookies.set('rum_client_token', rumClientToken, {
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // Must be readable by JavaScript
    })
  } else {
    console.warn('[Middleware] RUM credentials not found in headers from nginx')
  }

  return response
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
}


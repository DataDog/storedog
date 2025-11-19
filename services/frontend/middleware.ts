import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Middleware to convert RUM configuration from nginx request headers to cookies
 * 
 * Flow:
 * 1. Puppeteer sends X-RUM-App-ID and X-RUM-Client-Token headers
 * 2. Nginx reads these headers (or uses defaults for learner traffic)
 * 3. Nginx forwards headers to Next.js via proxy_set_header
 * 4. This middleware converts headers to cookies for the browser
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Read RUM config from headers (set by nginx)
  const rumAppId = request.headers.get('x-rum-app-id')
  const rumClientToken = request.headers.get('x-rum-client-token')

  // Set cookies if headers are present
  if (rumAppId) {
    response.cookies.set('rum_app_id', rumAppId, {
      path: '/',
      sameSite: 'lax',
      // Don't set httpOnly so JavaScript can read it
      httpOnly: false,
    })
  }

  if (rumClientToken) {
    response.cookies.set('rum_client_token', rumClientToken, {
      path: '/',
      sameSite: 'lax',
      // Don't set httpOnly so JavaScript can read it
      httpOnly: false,
    })
  }

  return response
}

// Apply middleware to all routes
export const config = {
  matcher: '/:path*',
}


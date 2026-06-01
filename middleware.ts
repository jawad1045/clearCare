import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 1. Grab the token or session identifier from the cookies
  // Replace 'session_token' with whatever cookie name your auth system sets
  const isAuthenticated = request.cookies.get('session_token')?.value

  const { pathname } = request.nextUrl

  // 2. If the user is trying to access protected routes without being logged in
  if (!isAuthenticated) {
    if (pathname.startsWith('/admin') || pathname.startsWith('/user')) {
      // Send them straight back to the login page
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // 3. Optional: Prevent logged-in users from going back to the login page
  if (isAuthenticated && pathname === '/') {
    // You could decode your token here to check roles, 
    // but for now, we'll just let them pass or default them
    return NextResponse.next()
  }

  return NextResponse.next()
}

// 4. Configure the matcher to only trigger on your protected dashboards
export const config = {
  matcher: [
    '/admin/:path*', 
    '/user/:path*'
  ],
}
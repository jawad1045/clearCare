import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value
  const currentUser = token ? verifySessionToken(token) : null
  // A token is present but failed verification (bad signature or past its expiry) — the
  // session has timed out, so send the user back to login with a flag to show that message.
  const sessionExpired = Boolean(token) && !currentUser

  if (pathname === '/') {
    if (currentUser) {
      const destination = currentUser.role === 'Admin' ? '/admin' : '/user'
      return NextResponse.redirect(new URL(destination, request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!currentUser || currentUser.role !== 'Admin') {
      const destination = !currentUser ? '/' : '/user'
      const url = new URL(destination, request.url)
      if (sessionExpired) url.searchParams.set('expired', '1')
      return NextResponse.redirect(url)
    }
  }

  if (pathname.startsWith('/user')) {
    if (!currentUser) {
      const url = new URL('/', request.url)
      if (sessionExpired) url.searchParams.set('expired', '1')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

// 4. Configure the matcher to only trigger on your protected dashboards
export const config = {
  matcher: [
    '/admin/:path*',
    '/user/:path*',
    '/',
  ],
}
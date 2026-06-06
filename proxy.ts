import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySessionToken } from '@/lib/auth'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('session_token')?.value
  const currentUser = token ? verifySessionToken(token) : null

  if (pathname === '/') {
    if (currentUser) {
      const destination = currentUser.role === 'Admin' ? '/admin' : '/user'
      return NextResponse.redirect(new URL(destination, request.url))
    }

    return NextResponse.next()
  }

  if (pathname.startsWith('/admin')) {
    if (!currentUser || currentUser.role !== 'Admin') {
      return NextResponse.redirect(new URL('/user', request.url))
    }
  }

  if (pathname.startsWith('/user')) {
    if (!currentUser) {
      return NextResponse.redirect(new URL('/', request.url))
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
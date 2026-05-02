import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require company authentication
const COMPANY_ROUTES = ['/company']
// Routes that require talent authentication
const TALENT_ROUTES = ['/talent']
// Routes that require admin authentication
const ADMIN_ROUTES = ['/admin', '/api/admin']
// Public routes (never redirect)
const PUBLIC_ROUTES = ['/auth', '/api/auth', '/api/health', '/api/pricing', '/api/jobs', '/_next', '/favicon']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ── Security headers on every response ───────────────────────────────────
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // ── Skip auth for public routes ───────────────────────────────────────────
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return response
  }

  // ── Admin route protection ────────────────────────────────────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
    // Admin pages use cookie-based password gate (handled client-side)
    // API admin routes are checked server-side in each route handler
    return response
  }

  // ── Company route protection ──────────────────────────────────────────────
  if (COMPANY_ROUTES.some((r) => pathname.startsWith(r))) {
    const token = request.cookies.get('tb-company-token')?.value
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('role', 'company')
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  // ── Talent route protection ────────────────────────────────────────────────
  if (TALENT_ROUTES.some((r) => pathname.startsWith(r))) {
    const token = request.cookies.get('tb-talent-token')?.value
    if (!token) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('role', 'talent')
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}

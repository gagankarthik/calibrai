import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

type SessionRole = 'company' | 'talent' | null

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const base64 = (input + pad).replace(/-/g, '+').replace(/_/g, '/')
  if (typeof atob === 'function') return atob(base64)
  return Buffer.from(base64, 'base64').toString('utf8')
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    return JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>
  } catch {
    return null
  }
}

function isValid(token: string | undefined | null): boolean {
  if (!token) return false
  const payload = decodeJwtPayload(token)
  if (!payload) return false
  const exp = typeof payload.exp === 'number' ? payload.exp : 0
  return exp > 0 && exp * 1000 > Date.now()
}

function readSessionRole(req: NextRequest): SessionRole {
  if (isValid(req.cookies.get('tb-company-token')?.value)) return 'company'
  if (isValid(req.cookies.get('tb-talent-token')?.value)) return 'talent'
  return null
}

function defaultDashboard(role: SessionRole): string {
  if (role === 'company') return '/company/dashboard'
  if (role === 'talent') return '/talent/dashboard'
  return '/'
}

function applySecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-XSS-Protection', '1; mode=block')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return res
}

function noCache(res: NextResponse): NextResponse {
  res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
  return res
}

function loginRedirect(req: NextRequest, role?: 'company' | 'talent'): NextResponse {
  const url = req.nextUrl.clone()
  url.pathname = '/auth/login'
  url.search = ''
  url.searchParams.set('redirect', req.nextUrl.pathname + req.nextUrl.search)
  if (role) url.searchParams.set('role', role)
  return noCache(applySecurityHeaders(NextResponse.redirect(url)))
}

export function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl
  const role = readSessionRole(req)

  // ── Protected app areas ─────────────────────────────────────────────────────
  if (pathname.startsWith('/talent')) {
    if (role === 'talent') return noCache(applySecurityHeaders(NextResponse.next()))
    if (role === 'company') {
      const url = req.nextUrl.clone()
      url.pathname = '/company/dashboard'
      url.search = ''
      return noCache(applySecurityHeaders(NextResponse.redirect(url)))
    }
    return loginRedirect(req, 'talent')
  }

  if (pathname.startsWith('/company')) {
    if (role === 'company') return noCache(applySecurityHeaders(NextResponse.next()))
    if (role === 'talent') {
      const url = req.nextUrl.clone()
      url.pathname = '/talent/dashboard'
      url.search = ''
      return noCache(applySecurityHeaders(NextResponse.redirect(url)))
    }
    return loginRedirect(req, 'company')
  }

  if (pathname.startsWith('/onboarding')) {
    if (role) return noCache(applySecurityHeaders(NextResponse.next()))
    return loginRedirect(req)
  }

  // ── Auth flow gating ────────────────────────────────────────────────────────
  if (pathname === '/auth/verify') {
    if (role) {
      const url = req.nextUrl.clone()
      url.pathname = defaultDashboard(role)
      url.search = ''
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    if (!searchParams.get('email')) {
      const url = req.nextUrl.clone()
      url.pathname = '/auth/register'
      url.search = ''
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    return applySecurityHeaders(NextResponse.next())
  }

  if (pathname === '/auth/login' || pathname === '/auth/register') {
    if (role) {
      const url = req.nextUrl.clone()
      const redirect = searchParams.get('redirect')
      url.pathname = redirect && redirect.startsWith('/') ? redirect : defaultDashboard(role)
      url.search = ''
      return applySecurityHeaders(NextResponse.redirect(url))
    }
    return applySecurityHeaders(NextResponse.next())
  }

  // ── Everything else (public, /api/*, /_next/*, etc.): just security headers ─
  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)',
  ],
}

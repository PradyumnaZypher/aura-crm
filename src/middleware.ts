import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

// Encode the secret once at module level (jose requires Uint8Array)
const getSecret = () => new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret'
)

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/auth/demo-login',
    '/api/health'
  ]

  // Check if the route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
                request.cookies.get('token')?.value

  if (!token) {
    // Redirect to login for protected routes
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    // Verify JWT token using jose (Edge Runtime compatible)
    const { payload: decoded } = await jwtVerify(token, getSecret())
    const role = decoded.role as string
    const userId = decoded.userId as string
    const email = decoded.email as string

    // Check if route requires specific role
    if (pathname.startsWith('/admin') && role !== 'ADMIN') {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url))
    }

    if (pathname.startsWith('/manager') && role !== 'MANAGER') {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url))
    }

    if (pathname.startsWith('/client') && role !== 'CLIENT') {
      return NextResponse.redirect(new URL(`/${role.toLowerCase()}/dashboard`, request.url))
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', userId)
    requestHeaders.set('x-user-email', email)
    requestHeaders.set('x-user-role', role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    // Invalid token - redirect to login
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
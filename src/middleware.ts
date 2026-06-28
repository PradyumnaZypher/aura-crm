import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
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
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Check if route requires specific role
    if (pathname.startsWith('/admin') && decoded.role !== 'ADMIN') {
      // Redirect to appropriate dashboard
      return NextResponse.redirect(new URL(`/${decoded.role.toLowerCase()}/dashboard`, request.url))
    }
    
    if (pathname.startsWith('/manager') && decoded.role !== 'MANAGER') {
      return NextResponse.redirect(new URL(`/${decoded.role.toLowerCase()}/dashboard`, request.url))
    }
    
    if (pathname.startsWith('/client') && decoded.role !== 'CLIENT') {
      return NextResponse.redirect(new URL(`/${decoded.role.toLowerCase()}/dashboard`, request.url))
    }

    // Add user info to request headers for downstream use
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', decoded.userId)
    requestHeaders.set('x-user-email', decoded.email)
    requestHeaders.set('x-user-role', decoded.role)

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
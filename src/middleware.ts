import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/jwt.edge'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const path = request.nextUrl.pathname

  // Skip middleware for auth routes
  if (path.startsWith('/api/auth') || path === '/login' || path === '/signup' || path === '/') {
    return NextResponse.next()
  }

  // Check if accessing protected routes
  if (path.startsWith('/dashboard') || path.startsWith('/api/domains') || path.startsWith('/api/email-users')) {
    
    if (!token) {
      console.log(`[Middleware] No token found for ${path}`)
      // Redirect to login for dashboard pages
      if (path.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      // Return 401 for API routes
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      // Verify token
      const payload = await verifyToken(token)
      console.log(`[Middleware] Token valid for user ${payload.email}, accessing ${path}`)
      return NextResponse.next()
    } catch (error: any) {
      console.log(`[Middleware] Token verification failed for ${path}:`, error.message)
      // Token invalid - clear the bad cookie
      const response = path.startsWith('/dashboard')
        ? NextResponse.redirect(new URL('/login', request.url))
        : NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      
      response.cookies.delete('token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

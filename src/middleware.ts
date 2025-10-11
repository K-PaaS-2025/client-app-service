import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { JwtData } from '@/types';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/', '/home', '/counseling'];

  // Static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const authToken = request.cookies.get('authToken')?.value;

  // If no token and trying to access protected route
  if (!authToken && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If token exists, verify it
  if (authToken) {
    try {
      const decoded: JwtData = jwtDecode(authToken);

      // Check if token is expired
      if (Date.now() >= decoded.exp * 1000) {
        // Token expired, clear cookie and redirect to login
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('authToken');
        return response;
      }

      // If authenticated user tries to access login/signup, redirect to home
      if (publicRoutes.includes(pathname) && pathname !== '/') {
        return NextResponse.redirect(new URL('/home', request.url));
      }

    } catch {
      // Invalid token, clear cookie and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('authToken');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - counseling (skip counseling page during build)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|counseling).*)',
  ],
};
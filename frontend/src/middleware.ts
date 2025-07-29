import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Check for token in both cookies and localStorage
  const cookieToken = request.cookies.get('musicPlayerToken')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicPaths = ['/login', '/signup'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // For API routes, just continue
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // If there's no token and the path is not public, redirect to login
  if (!cookieToken && !isPublicPath) {
    // Check if we're on the client side (where localStorage is available)
    if (typeof window !== 'undefined') {
      const localStorageToken = localStorage.getItem('musicPlayerToken');
      if (localStorageToken) {
        // If token exists in localStorage but not in cookies, set the cookie
        const response = NextResponse.next();
        response.cookies.set('musicPlayerToken', localStorageToken, {
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
        return response;
      }
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If there's a token and the user is on a public path, redirect to home
  if (cookieToken && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/signup',
    '/profile',
    '/playlists',
    '/liked-songs',
    '/api/:path*' // Include API routes to handle CORS and auth headers
  ],
};

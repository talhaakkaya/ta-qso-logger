import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // Set cache headers based on path patterns

  // 1. Next.js static assets - Immutable, cache for 1 year
  if (pathname.startsWith('/_next/static/')) {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // 2. Public static assets - Cache for 1 year
  else if (pathname === '/favicon.svg' || pathname === '/site.webmanifest') {
    response.headers.set(
      'Cache-Control',
      'public, max-age=31536000, immutable'
    );
  }

  // 3. Stats API - Public data, cache for 5 minutes
  else if (pathname === '/api/stats') {
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=600'
    );
  }

  // 4. All other API routes - No cache (user-specific data)
  else if (pathname.startsWith('/api/')) {
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  // 5. HTML pages - No cache (dynamic, auth-based content)
  else {
    response.headers.set(
      'Cache-Control',
      'private, no-cache, no-store, must-revalidate'
    );
  }

  return response;
}

// Configure which paths this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/image (image optimization files)
     * - _next/webpack-hmr (hot module replacement)
     */
    '/((?!_next/image|_next/webpack-hmr).*)',
  ],
};

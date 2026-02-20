import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

import { enforceRateLimit } from './lib/rate-limit/enforce';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/')) {
    return await enforceRateLimit(request);
  }

  // Auth checks...
  if (pathname.startsWith('/settings')) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
}

export const config = {
  matcher: [
    // API routes (except auth and static files) better-auth handles its own rate limiting
    '/api/((?!auth|_next/static|_next/image|favicon.ico).*)',

    // Protected pages
    '/settings/:path*',
  ],
};

import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { Ratelimit, type RatelimitConfig } from "@upstash/ratelimit";

import { rateLimiters } from "./lib/ratelimit";
import { getClientIp } from "./lib/http";
import type IError from "./types/error";

const ROUTE_PATTERNS = {
  threadLike: /\/api\/threads\/[^/]+\/like/,
  commentLike: /\/api\/threads\/[^/]+\/comments\/[^/]+\/like/,
} as const;

// Determine which rate limiter to use based on route and method
function getRateLimiter(pathname: string, method: string): RatelimitConfig {
  const upperMethod = method.toUpperCase();

  // Search endpoint
  if (pathname.startsWith("/api/search")) {
    return rateLimiters.get.search;
  }

  // Like/unlike endpoints (threads and comments)
  if (
    pathname.match(ROUTE_PATTERNS.threadLike) ||
    pathname.match(ROUTE_PATTERNS.commentLike)
  ) {
    return rateLimiters.interaction.like;
  }

  // Post/comment mutation endpoints
  if (
    pathname.startsWith("/api/threads") &&
    (upperMethod === "POST" ||
      upperMethod === "PUT" ||
      upperMethod === "DELETE")
  ) {
    return rateLimiters.mutate.content;
  }

  // Notification actions
  if (
    pathname.startsWith("/api/user/notifications") &&
    (upperMethod === "PUT" || upperMethod === "DELETE")
  ) {
    return rateLimiters.interaction.notificationUpdate;
  }

  // Standard GET requests
  if (upperMethod === "GET") {
    return rateLimiters.get.standard;
  }

  // Standard POST/PUT/DELETE requests
  if (
    upperMethod === "POST" ||
    upperMethod === "PUT" ||
    upperMethod === "DELETE"
  ) {
    return rateLimiters.mutate.standard;
  }

  // Default to global rate limiter
  return rateLimiters.global.api;
}

// Create rate limit exceeded response
function rateLimitResponse(reset: number): NextResponse {
  const retryAfter = Math.ceil((reset - Date.now()) / 1000);

  return NextResponse.json(
    {
      issues: [
        {
          code: "ratelimit/exceeded",
          message: "Rate limit exceeded. Please try again later.",
        },
      ],
    } satisfies IError,
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfter),
        "X-RateLimit-Reset": String(reset),
      },
    },
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const method = request.method;

  if (pathname.startsWith("/api/")) {
    const clientIp = getClientIp(request);
    const identifier = clientIp === "unknown" ? "fallback-limiter" : clientIp;

    const rateLimiterConfig = getRateLimiter(pathname, method);
    const rateLimiter = new Ratelimit(rateLimiterConfig);
    // const finalIdentifier = sessionCookie
    //   ? `${identifier}:${sessionCookie}`
    //   : identifier;

    try {
      const { success, reset, remaining } = await rateLimiter.limit(identifier);

      if (!success) {
        return rateLimitResponse(reset);
      }

      const response = NextResponse.next();
      response.headers.set("X-RateLimit-Remaining", String(remaining));
      response.headers.set("X-RateLimit-Reset", String(reset));
      return response;
    } catch (error) {
      console.error("Rate limiting error:", error);
      // Fail open - allow request but log error
      return NextResponse.next();
    }
  }

  // Auth checks...
  if (
    pathname.startsWith("/threads/submit") ||
    pathname.startsWith("/settings")
  ) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // API routes (except auth and static files) better-auth handles its own rate limiting
    "/api/((?!auth|_next/static|_next/image|favicon.ico).*)",

    // Protected pages
    "/threads/submit/:path*",
    "/settings/:path*",
  ],
};

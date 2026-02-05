import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import {
  type IRateLimiterRedisOptions,
  RateLimiterRedis,
  RateLimiterRes,
} from "rate-limiter-flexible";

import { getClientIp } from "./lib/http";
import { rateLimiters } from "./lib/ratelimit";
import IError from "./types/error";

const ROUTE_PATTERNS = {
  letterLike: /\/api\/letters\/[^/]+\/like/,
  replyLike: /\/api\/letters\/[^/]+\/replies\/[^/]+\/like/,
} as const;

// Determine which rate limiter to use based on route, method, and query params
function getRateLimiter(request: NextRequest): IRateLimiterRedisOptions {
  const { pathname, searchParams } = request.nextUrl;
  const upperMethod = request.method.toUpperCase();

  // Anonymous thought posts
  if (pathname === "/api/thoughts" && upperMethod === "POST") {
    return rateLimiters.mutate.thought;
  }

  // Search endpoint
  if (
    pathname === "/api/thoughts" &&
    upperMethod === "GET" &&
    searchParams.has("searchTerm")
  ) {
    return rateLimiters.get.search;
  }

  if (pathname.startsWith("/api/search")) {
    return rateLimiters.get.search;
  }

  // Like/unlike endpoints (letters and replies)
  if (
    pathname.match(ROUTE_PATTERNS.letterLike) ||
    pathname.match(ROUTE_PATTERNS.replyLike)
  ) {
    return rateLimiters.interaction.like;
  }

  // Post/reply mutation endpoints
  if (
    pathname.startsWith("/api/letters") &&
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
  return rateLimiters.get.standard;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const rateLimiterOptions = getRateLimiter(request);
    const rateLimiter = new RateLimiterRedis(rateLimiterOptions);

    const clientIp = getClientIp(request);
    const identifier = clientIp === "unknown" ? "fallback-limiter" : clientIp;

    try {
      const rateLimiterRes = await rateLimiter.consume(identifier);

      // Success - request allowed
      const response = NextResponse.next();
      response.headers.set(
        "X-RateLimit-Remaining",
        rateLimiterRes.remainingPoints.toString(),
      );
      response.headers.set(
        "X-RateLimit-Reset",
        (Date.now() + rateLimiterRes.msBeforeNext).toString(),
      );
      return response;
    } catch (error) {
      // Rate limit exceeded - consume() rejects with RateLimiterRes
      if (error instanceof RateLimiterRes) {
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
              "Retry-After": Math.ceil(error.msBeforeNext / 1000).toString(),
              "X-RateLimit-Remaining": error.remainingPoints.toString(),
            },
          },
        );
      }

      // Redis or other error - fail open (allow request)
      console.error("Rate limiter error:", error);
      return NextResponse.next();
    }
  }

  // Auth checks...
  if (
    pathname.startsWith("/letters/submit") ||
    pathname.startsWith("/settings")
  ) {
    const sessionCookie = getSessionCookie(request);
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: [
    // API routes (except auth and static files) better-auth handles its own rate limiting
    "/api/((?!auth|_next/static|_next/image|favicon.ico).*)",

    // Protected pages
    "/letters/submit/:path*",
    "/settings/:path*",
  ],
};

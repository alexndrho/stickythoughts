import { NextResponse, type NextRequest } from "next/server";
import { RateLimiterRes } from "rate-limiter-flexible";

import type IError from "@/types/error";
import { getClientIp } from "@/lib/http/get-client-ip";
import { buildRateLimitKey } from "./keys";
import { getTierLimiters } from "./limiters";
import { RATE_LIMITS, type RateLimitTier } from "./config";
import { consumeWithFallback } from "./core";

const ROUTE_PATTERNS = {
  letterLike: /\/api\/letters\/[^/]+\/like/,
  replyLike: /\/api\/letters\/[^/]+\/replies\/[^/]+\/like/,
} as const;

function pickTier(request: NextRequest): RateLimitTier {
  const { pathname, searchParams } = request.nextUrl;
  const upperMethod = request.method.toUpperCase();

  // Anonymous thought posts
  if (pathname === "/api/thoughts" && upperMethod === "POST") {
    return "mutate:thought";
  }

  // Search endpoint
  if (
    pathname === "/api/thoughts" &&
    upperMethod === "GET" &&
    searchParams.has("searchTerm")
  ) {
    return "get:search";
  }

  if (pathname.startsWith("/api/search")) {
    return "get:search";
  }

  // Like/unlike endpoints (letters and replies)
  if (
    pathname.match(ROUTE_PATTERNS.letterLike) ||
    pathname.match(ROUTE_PATTERNS.replyLike)
  ) {
    return "interaction:like";
  }

  // Post/reply mutation endpoints
  if (
    pathname.startsWith("/api/letters") &&
    (upperMethod === "POST" ||
      upperMethod === "PUT" ||
      upperMethod === "PATCH" ||
      upperMethod === "DELETE")
  ) {
    return "mutate:content";
  }

  // Notification actions
  if (
    pathname.startsWith("/api/user/notifications") &&
    (upperMethod === "PUT" ||
      upperMethod === "DELETE" ||
      upperMethod === "PATCH")
  ) {
    return "interaction:notificationUpdate";
  }

  // Standard reads
  if (upperMethod === "GET" || upperMethod === "HEAD") {
    return "get:standard";
  }

  // Standard writes
  if (
    upperMethod === "POST" ||
    upperMethod === "PUT" ||
    upperMethod === "PATCH" ||
    upperMethod === "DELETE"
  ) {
    return "mutate:standard";
  }

  // Default
  return "get:standard";
}

function resetSecondsFromNow(msBeforeNext: number): number {
  return Math.ceil((Date.now() + msBeforeNext) / 1000);
}

function rateLimitExceededResponse(
  res: RateLimiterRes,
  limitPoints: number,
): NextResponse<IError> {
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
        "Retry-After": Math.ceil(res.msBeforeNext / 1000).toString(),
        "X-RateLimit-Limit": limitPoints.toString(),
        "X-RateLimit-Remaining": res.remainingPoints.toString(),
        "X-RateLimit-Reset": resetSecondsFromNow(res.msBeforeNext).toString(),
      },
    },
  );
}

function rateLimitFailClosedResponse(
  limitPoints: number,
): NextResponse<IError> {
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
        "Retry-After": "1",
        "X-RateLimit-Limit": limitPoints.toString(),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": resetSecondsFromNow(1000).toString(),
      },
    },
  );
}

export async function enforceRateLimit(
  request: NextRequest,
  opts: { userId?: string } = {},
): Promise<NextResponse> {
  const ip = getClientIp(request);
  const key = buildRateLimitKey({ userId: opts.userId, ip });

  const tier = pickTier(request);
  const tierLimiters = getTierLimiters()[tier];
  const limitPoints = RATE_LIMITS[tier].points;

  try {
    const res = await consumeWithFallback(tierLimiters, key);
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", limitPoints.toString());
    response.headers.set(
      "X-RateLimit-Remaining",
      res.remainingPoints.toString(),
    );
    response.headers.set(
      "X-RateLimit-Reset",
      resetSecondsFromNow(res.msBeforeNext).toString(),
    );
    return response;
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      return rateLimitExceededResponse(err, limitPoints);
    }

    // Fail closed on any unexpected limiter error (Redis down, memory limiter failure, etc.)
    console.error("Rate limiter error (fail closed):", err);
    return rateLimitFailClosedResponse(limitPoints);
  }
}

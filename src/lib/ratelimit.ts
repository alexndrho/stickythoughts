import { Ratelimit, type RatelimitConfig } from "@upstash/ratelimit";

import { redis } from "./redis";

export const rateLimiters = {
  // Global rate limiters
  global: {
    // General API requests - 100 requests per 10 seconds
    api: {
      redis,
      limiter: Ratelimit.slidingWindow(100, "10 s"),
      prefix: "ratelimit:global:api",
      analytics: true,
    } satisfies RatelimitConfig,
  },

  // GET requests - token bucket allows bursts for natural browsing patterns
  get: {
    // Standard GET requests - 120 tokens max, refills 2 per second
    // Users can burst up to 120 requests, then sustain 2/s (120/min)
    standard: {
      redis,
      limiter: Ratelimit.tokenBucket(2, "1 s", 120),
      prefix: "ratelimit:get:standard",
      analytics: true,
    } satisfies RatelimitConfig,
    // Search requests - 60 tokens max, refills 1 per second
    // Allows quick successive searches, sustains 1/s (60/min)
    search: {
      redis,
      limiter: Ratelimit.tokenBucket(1, "1 s", 60),
      prefix: "ratelimit:get:search",
      analytics: true,
    } satisfies RatelimitConfig,
  },

  mutate: {
    // Standard POST/PUT/DELETE requests - 60 tokens max, refills 1 per second
    // Users can burst up to 60 requests, then sustain 1/s (60/min)
    standard: {
      redis,
      limiter: Ratelimit.tokenBucket(1, "1 s", 60),
      prefix: "ratelimit:mutate:standard",
      analytics: true,
    } satisfies RatelimitConfig,

    // Post/comment mutations - 30 tokens max, refills 1 every 3 seconds
    // Limits rapid posting while allowing some burstiness
    content: {
      redis,
      limiter: Ratelimit.tokenBucket(1, "3 s", 30),
      prefix: "ratelimit:mutate:content",
      analytics: true,
    } satisfies RatelimitConfig,
  },

  // Content interactions - token bucket for responsive UX
  interaction: {
    // Like/unlike actions - 100 tokens max, refills 2 per second
    // Users can rapidly like content, sustains 120/min
    like: {
      redis,
      limiter: Ratelimit.tokenBucket(2, "1 s", 100),
      prefix: "ratelimit:interaction:like",
      analytics: true,
    } satisfies RatelimitConfig,

    // Notification updates (mark read, delete) - 60 per minute
    notificationUpdate: {
      redis,
      limiter: Ratelimit.slidingWindow(60, "1 m"),
      prefix: "ratelimit:interaction:notifications",
      analytics: true,
    } satisfies RatelimitConfig,
  },
};

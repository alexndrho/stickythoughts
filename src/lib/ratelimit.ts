import { type IRateLimiterRedisOptions } from "rate-limiter-flexible";
import { getRedisClient } from "./redis";

const redis = getRedisClient();

export const rateLimiters = {
  // Global rate limiters
  get: {
    // Standard GET requests - 120 requests per 60 seconds
    standard: {
      storeClient: redis,
      points: 120,
      duration: 60,
      keyPrefix: "ratelimit:get:standard",
    } satisfies IRateLimiterRedisOptions,

    // Search requests - 60 requests per 60 seconds
    search: {
      storeClient: redis,
      points: 60,
      duration: 60,
      keyPrefix: "ratelimit:get:search",
    } satisfies IRateLimiterRedisOptions,
  },

  mutate: {
    // Standard POST/PUT/DELETE requests - 60 requests per 60 seconds
    standard: {
      storeClient: redis,
      points: 60,
      duration: 60,
      blockDuration: 30,
      keyPrefix: "ratelimit:mutate:standard",
    } satisfies IRateLimiterRedisOptions,

    // Post/comment mutations - 20 requests per 60 seconds
    content: {
      storeClient: redis,
      points: 20,
      duration: 60,
      blockDuration: 60,
      keyPrefix: "ratelimit:mutate:content",
    } satisfies IRateLimiterRedisOptions,
  },

  interaction: {
    // Like/unlike actions - 120 requests per 60 seconds
    like: {
      storeClient: redis,
      points: 120,
      duration: 60,
      blockDuration: 15,
      keyPrefix: "ratelimit:interaction:like",
    } satisfies IRateLimiterRedisOptions,

    // Notification updates (mark read, delete) - 60 per minute
    notificationUpdate: {
      storeClient: redis,
      points: 60,
      duration: 60,
      keyPrefix: "ratelimit:interaction:notifications",
    } satisfies IRateLimiterRedisOptions,
  },
};

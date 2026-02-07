import {
  RateLimiterMemory,
  RateLimiterRedis,
  type RateLimiterRes,
} from "rate-limiter-flexible";

import { getRedisClient } from "@/lib/redis";
import { RATE_LIMITS, RATE_LIMIT_TIERS, type RateLimitTier } from "./config";

export type Limiter = {
  consume: (key: string) => Promise<RateLimiterRes>;
};

export type TierLimiters = {
  primary: Limiter;
  fallback: Limiter;
};

let singleton: Record<RateLimitTier, TierLimiters> | null = null;

export function getTierLimiters(): Record<RateLimitTier, TierLimiters> {
  if (singleton) return singleton;

  const redis = getRedisClient();

  const limiters = {} as Record<RateLimitTier, TierLimiters>;

  for (const tier of RATE_LIMIT_TIERS) {
    const cfg = RATE_LIMITS[tier];

    const primary = new RateLimiterRedis({
      storeClient: redis,
      points: cfg.points,
      duration: cfg.duration,
      blockDuration: cfg.blockDuration,
      keyPrefix: cfg.keyPrefix,
    });

    const fallback = new RateLimiterMemory({
      points: cfg.points,
      duration: cfg.duration,
      blockDuration: cfg.blockDuration,
      keyPrefix: `${cfg.keyPrefix}:memory`,
    });

    limiters[tier] = { primary, fallback };
  }

  singleton = limiters;

  return singleton;
}

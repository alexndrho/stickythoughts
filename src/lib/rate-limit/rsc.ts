import 'server-only';

import { RateLimiterRes } from 'rate-limiter-flexible';
import { headers as nextHeaders } from 'next/headers';

import { getClientIp } from '@/lib/http/get-client-ip';
import { buildRateLimitKey } from './keys';
import { getTierLimiters } from './limiters';
import { RATE_LIMITS, type RateLimitTier } from './config';
import { consumeWithFallback } from './core';

export class RateLimitExceededError extends Error {
  name = 'RateLimitExceededError';
  readonly tier: RateLimitTier;
  readonly retryAfterSeconds: number;
  readonly limit: number;
  readonly remaining: number;
  readonly resetEpochSeconds: number;

  constructor(args: {
    tier: RateLimitTier;
    retryAfterSeconds: number;
    limit: number;
    remaining: number;
    resetEpochSeconds: number;
  }) {
    super('Rate limit exceeded.');
    this.tier = args.tier;
    this.retryAfterSeconds = args.retryAfterSeconds;
    this.limit = args.limit;
    this.remaining = args.remaining;
    this.resetEpochSeconds = args.resetEpochSeconds;
  }
}

function resetSecondsFromNow(msBeforeNext: number): number {
  return Math.ceil((Date.now() + msBeforeNext) / 1000);
}

async function safeHeaders(): Promise<Headers> {
  try {
    // Throws if called outside a request (e.g. during build-time execution).
    return await nextHeaders();
  } catch {
    return new Headers();
  }
}

export async function enforceRscRateLimit(opts: {
  tier: RateLimitTier;
  userId?: string | null;
  headers?: Headers;
}): Promise<void> {
  const headers = opts.headers ?? (await safeHeaders());
  const ip = getClientIp({ headers });
  const key = buildRateLimitKey({ userId: opts.userId, ip });

  const tierLimiters = getTierLimiters()[opts.tier];
  const limitPoints = RATE_LIMITS[opts.tier].points;

  try {
    await consumeWithFallback(tierLimiters, key);
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      throw new RateLimitExceededError({
        tier: opts.tier,
        retryAfterSeconds: Math.ceil(err.msBeforeNext / 1000),
        limit: limitPoints,
        remaining: err.remainingPoints,
        resetEpochSeconds: resetSecondsFromNow(err.msBeforeNext),
      });
    }
    throw err;
  }
}

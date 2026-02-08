import { RateLimiterRes } from "rate-limiter-flexible";

import type { TierLimiters } from "./limiters";

export class RateLimitInternalError extends Error {
  name = "RateLimitInternalError";
  constructor(message: string, cause?: unknown) {
    super(message);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (this as any).cause = cause;
  }
}

// Shared "primary (Redis) + fallback (memory)" consumption logic used by both
// middleware/route handlers and server-only (RSC / server actions) callers.
export async function consumeWithFallback(
  limiters: TierLimiters,
  key: string,
): Promise<RateLimiterRes> {
  try {
    return await limiters.primary.consume(key);
  } catch (err) {
    if (err instanceof RateLimiterRes) throw err; // exceeded on primary

    try {
      return await limiters.fallback.consume(key);
    } catch (fallbackErr) {
      if (fallbackErr instanceof RateLimiterRes) throw fallbackErr; // exceeded on fallback
      throw new RateLimitInternalError(
        "Rate limiter unavailable (fail closed).",
        fallbackErr,
      );
    }
  }
}


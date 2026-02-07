export type RateLimitTier =
  | "get:standard"
  | "get:search"
  | "mutate:standard"
  | "mutate:thought"
  | "mutate:content"
  | "interaction:like"
  | "interaction:notificationUpdate";

export const RATE_LIMIT_TIERS = [
  "get:standard",
  "get:search",
  "mutate:standard",
  "mutate:thought",
  "mutate:content",
  "interaction:like",
  "interaction:notificationUpdate",
] as const satisfies readonly RateLimitTier[];

export type RateLimitConfig = {
  points: number;
  duration: number;
  blockDuration?: number;
  keyPrefix: string;
};

// Fixed limits (no env overrides). These match the previous behavior from
// the old `src/lib/ratelimit.ts`.
export const RATE_LIMITS: Record<RateLimitTier, RateLimitConfig> = {
  "get:standard": {
    points: 120,
    duration: 60,
    keyPrefix: "ratelimit:get:standard",
  },
  "get:search": {
    points: 60,
    duration: 60,
    keyPrefix: "ratelimit:get:search",
  },

  "mutate:standard": {
    points: 60,
    duration: 60,
    blockDuration: 30,
    keyPrefix: "ratelimit:mutate:standard",
  },
  "mutate:thought": {
    points: 3,
    duration: 60,
    blockDuration: 300,
    keyPrefix: "ratelimit:mutate:thought",
  },
  "mutate:content": {
    points: 10,
    duration: 60,
    blockDuration: 120,
    keyPrefix: "ratelimit:mutate:content",
  },

  "interaction:like": {
    points: 120,
    duration: 60,
    blockDuration: 15,
    keyPrefix: "ratelimit:interaction:like",
  },
  "interaction:notificationUpdate": {
    points: 60,
    duration: 60,
    blockDuration: 60,
    keyPrefix: "ratelimit:interaction:notifications",
  },
};

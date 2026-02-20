type RateLimitKeyArgs = {
  userId?: string | null;
  ip: string;
};

export function buildRateLimitKey(args: RateLimitKeyArgs): string {
  // Primary dimension: authenticated user ID when available.
  if (args.userId) {
    return `u:${args.userId}:ip:${args.ip || 'unknown'}`;
  }

  // Anonymous fallback: always rate limit by IP, even if "unknown".
  return `ip:${args.ip || 'unknown'}`;
}

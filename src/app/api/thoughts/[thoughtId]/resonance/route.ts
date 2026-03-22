import { type NextRequest, NextResponse } from 'next/server';
import { RateLimiterRes } from 'rate-limiter-flexible';

import { jsonError, unknownErrorResponse } from '@/lib/http/api-responses';
import { getClientIp } from '@/lib/http/get-client-ip';
import { buildRateLimitKey } from '@/lib/rate-limit/keys';
import { getTierLimiters } from '@/lib/rate-limit/limiters';
import { consumeWithFallback } from '@/lib/rate-limit/core';
import { revalidateThoughtData } from '@/lib/cache/thought-revalidation';
import { resonateThought } from '@/server/thought/thoughts';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ thoughtId: string }> },
) {
  const { thoughtId } = await params;

  if (!thoughtId) {
    return jsonError(
      [{ code: 'validation/invalid-input', message: 'Thought ID is required' }],
      400,
    );
  }

  // Per-thought daily rate limit: 1 resonance per thought per user/IP per day
  const ip = getClientIp(request);
  const userKey = buildRateLimitKey({ ip });
  const resonanceKey = `${userKey}:thought:${thoughtId}`;
  const tierLimiters = getTierLimiters();

  try {
    await consumeWithFallback(tierLimiters['interaction:resonance'], resonanceKey);
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      return jsonError(
        [
          {
            code: 'ratelimit/resonance-exceeded',
            message: 'You have already resonated with this thought today.',
          },
        ],
        429,
        {
          headers: {
            'Retry-After': Math.ceil(err.msBeforeNext / 1000).toString(),
          },
        },
      );
    }

    console.error('Resonance rate limiter error (fail closed):', err);
    return jsonError(
      [{ code: 'ratelimit/exceeded', message: 'Rate limit exceeded. Please try again later.' }],
      429,
      { headers: { 'Retry-After': '1' } },
    );
  }

  try {
    const result = await resonateThought({ thoughtId });

    revalidateThoughtData();

    return NextResponse.json({ resonanceCount: result.resonanceCount }, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse('Something went wrong');
  }
}

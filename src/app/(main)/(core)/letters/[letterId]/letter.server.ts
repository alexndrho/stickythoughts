import 'server-only';

import { headers as nextHeaders } from 'next/headers';
import { cache } from 'react';

import { auth } from '@/lib/auth';
import { enforceRscRateLimit } from '@/lib/rate-limit/rsc';
import { getLetterPublic } from '@/server/letter/letters';
import { LetterNotFoundError } from '@/server/letter/letter-errors';
import type { Letter } from '@/types/letter';

export { LetterNotFoundError };

async function getLetterServerUncached(letterId: string): Promise<Letter> {
  const headers = await nextHeaders();
  const session = await auth.api.getSession({ headers });

  await enforceRscRateLimit({
    tier: 'get:standard',
    userId: session?.user?.id ?? null,
    headers,
  });

  return await getLetterPublic({
    letterId,
    sessionUserId: session?.user?.id ?? null,
  });
}

// Dedup within a single RSC render/request (e.g. `generateMetadata` + page render).
// This is intentionally request-scoped (unlike `unstable_cache`) so session-specific
// fields like "liked" don't leak across users/requests.
export const getLetterServer = cache(getLetterServerUncached);

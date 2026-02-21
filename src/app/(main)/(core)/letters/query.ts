import 'server-only';

import { auth } from '@/lib/auth';
import { enforceRscRateLimit } from '@/lib/rate-limit/rsc';
import { listLettersPublic } from '@/server/letter/letters';
import { headers } from 'next/headers';
import { formatLetters } from '@/utils/letter';
import type { Letter } from '@/types/letter';

export async function listLetters(): Promise<Letter[]> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  await enforceRscRateLimit({
    tier: 'get:standard',
    userId: session?.user?.id ?? null,
    headers: requestHeaders,
  });

  const letters = await listLettersPublic({
    viewerUserId: session?.user?.id,
  });

  return formatLetters({
    sessionUserId: session?.user?.id,
    letters,
  });
}

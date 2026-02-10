import "server-only";

import { headers as nextHeaders } from "next/headers";
import { cache } from "react";

import { auth } from "@/lib/auth";
import type { LetterType } from "@/types/letter";
import { enforceRscRateLimit } from "@/lib/rate-limit/rsc";
import { getLetterPublic, LetterNotFoundError } from "@/server/letter";

export { LetterNotFoundError };

async function getLetterServerUncached(letterId: string): Promise<LetterType> {
  const headers = await nextHeaders();
  const session = await auth.api.getSession({ headers });

  await enforceRscRateLimit({
    tier: "get:standard",
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

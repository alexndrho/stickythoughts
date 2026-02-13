import "server-only";

import { auth } from "@/lib/auth";
import { enforceRscRateLimit } from "@/lib/rate-limit/rsc";
import { listLetters as listLettersServer } from "@/server/letter";
import { headers } from "next/headers";
import { formatLetters } from "@/utils/letter";

export async function listLetters() {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

  await enforceRscRateLimit({
    tier: "get:standard",
    userId: session?.user?.id ?? null,
    headers: requestHeaders,
  });

  const letters = await listLettersServer({
    viewerUserId: session?.user?.id,
  });

  const formattedLetters = formatLetters({
    sessionUserId: session?.user?.id,
    letters,
  });

  return formattedLetters;
}

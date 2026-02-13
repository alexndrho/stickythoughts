import "server-only";

import { auth } from "@/lib/auth";
import { listLetters as listLettersServer } from "@/server/letter";
import { headers } from "next/headers";
import { formatLetters } from "@/utils/letter";

export async function listLetters() {
  const session = await auth.api.getSession({
    headers: await headers(),
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

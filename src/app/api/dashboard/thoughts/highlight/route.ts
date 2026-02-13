import { NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import { getHighlightedThought } from "@/server/dashboard/thought-service";
import { unknownErrorResponse } from "@/lib/http";
import type { PrivateHighlightedThoughtPayload } from "@/types/thought";

export async function GET() {
  try {
    const session = await guardSession({
      permission: {
        thought: ["list"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const highlightedThought = await getHighlightedThought();

    return NextResponse.json(
      highlightedThought satisfies PrivateHighlightedThoughtPayload | null,
    );
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

import { NextResponse } from "next/server";

import { getHighlightedThought } from "@/server/thought";
import { unknownErrorResponse } from "@/lib/http";

export async function GET() {
  try {
    const highlightedThought = await getHighlightedThought();

    if (!highlightedThought) {
      return new NextResponse(null, { status: 204 });
    }

    return NextResponse.json(highlightedThought);
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

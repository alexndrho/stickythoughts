import { type NextRequest, NextResponse } from "next/server";
import { checkBotId } from "botid/server";
import { ZodError } from "zod";

import { revalidateThoughts } from "@/lib/cache/thought-revalidation";
import { createThoughtInput } from "@/lib/validations/thought";
import type { PublicThoughtPayload } from "@/types/thought";
import { jsonError, unknownErrorResponse, zodInvalidInput } from "@/lib/http";
import { createThought, listPublicThoughts } from "@/server/thought";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchTerm = searchParams.get("searchTerm");
  const lastId = searchParams.get("lastId");

  try {
    const thoughts = await listPublicThoughts({ searchTerm, lastId });

    const typedThoughts = thoughts satisfies PublicThoughtPayload[];

    return NextResponse.json(typedThoughts, { status: 200 });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

export async function POST(request: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot) {
      return jsonError(
        [{ code: "botid/validation-failed", message: "Bot detected" }],
        403,
      );
    }

    const { author, message, color } = createThoughtInput.parse(
      await request.json(),
    );

    await createThought({ author, message, color });
    revalidateThoughts();

    return NextResponse.json(
      {
        message: "Thought submitted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return zodInvalidInput(error);
    }

    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

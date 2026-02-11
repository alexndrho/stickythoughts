import { type NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { checkBotId } from "botid/server";
import { ZodError } from "zod";

import { thoughtCacheTags } from "@/lib/cache-tags";
import { createThoughtInput } from "@/lib/validations/thought";
import type { PublicThoughtPayload } from "@/types/thought";
import { jsonError, unknownErrorResponse, zodInvalidInput } from "@/lib/http";
import { createThought, listPublicThoughts } from "@/server/thought";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
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

export async function POST(req: NextRequest) {
  try {
    const verification = await checkBotId();

    if (verification.isBot) {
      return jsonError(
        [{ code: "botid/validation-failed", message: "Bot detected" }],
        403,
      );
    }

    const { author, message, color } = createThoughtInput.parse(
      await req.json(),
    );

    await createThought({ author, message, color });
    revalidateTag(thoughtCacheTags.publicList, "max");
    revalidateTag(thoughtCacheTags.publicCount, "max");

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

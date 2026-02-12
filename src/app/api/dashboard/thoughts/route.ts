import { type NextRequest, NextResponse } from "next/server";

import { guardSession } from "@/lib/session-guard";
import type { PrivateThoughtPayload } from "@/types/thought";
import { unknownErrorResponse } from "@/lib/http";
import { listAdminThoughts } from "@/server/dashboard";

export async function GET(req: NextRequest) {
  try {
    const session = await guardSession({
      permission: {
        thought: ["list"],
      },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    const searchParams = req.nextUrl.searchParams;
    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const thoughts = await listAdminThoughts({ page });

    return NextResponse.json(thoughts satisfies PrivateThoughtPayload[], {
      status: 200,
    });
  } catch (error) {
    console.error(error);
    return unknownErrorResponse("Something went wrong");
  }
}

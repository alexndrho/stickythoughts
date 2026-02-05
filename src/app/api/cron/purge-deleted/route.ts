import { subMonths } from "date-fns";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import type IError from "@/types/error";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "config/missing-cron-secret",
              message: "CRON_SECRET is not configured",
            },
          ],
        } satisfies IError,
        { status: 500 },
      );
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        {
          issues: [{ code: "auth/unauthorized", message: "Unauthorized" }],
        } satisfies IError,
        { status: 401 },
      );
    }

    const cutoff = subMonths(new Date(), 1);

    const [replies, letters, thoughts] = await prisma.$transaction([
      prisma.letterReply.deleteMany({
        where: { deletedAt: { lte: cutoff } },
      }),
      prisma.letter.deleteMany({
        where: { deletedAt: { lte: cutoff } },
      }),
      prisma.thought.deleteMany({
        where: { deletedAt: { lte: cutoff } },
      }),
    ]);

    return NextResponse.json(
      {
        cutoff: cutoff.toISOString(),
        deleted: {
          replies: replies.count,
          letters: letters.count,
          thoughts: thoughts.count,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        issues: [
          {
            code: "unknown-error",
            message: "Something went wrong",
          },
        ],
      } satisfies IError,
      { status: 500 },
    );
  }
}

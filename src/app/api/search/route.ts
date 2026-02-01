import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import type { SearchAllType } from "@/types/search";
import type IError from "@/types/error";

const MAX_RESULTS = 10;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type"); // "all", "threads", "users"

  try {
    if (type === "users") {
      const users = await prisma.user.findMany({
        take: MAX_RESULTS,
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          name: true,
          displayUsername: true,
          username: true,
          image: true,
        },
      });

      return NextResponse.json(
        users.map((user) => ({ ...user, type: "users" as const })),
        { status: 200 },
      );
    } else if (type === "threads") {
      const threads = await prisma.thread.findMany({
        take: MAX_RESULTS,
        where: {
          title: { contains: q, mode: "insensitive" },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
        },
      });

      return NextResponse.json(
        threads.map((thread) => ({ ...thread, type: "threads" as const })),
        { status: 200 },
      );
    }

    const [users, threads] = await Promise.all([
      prisma.user.findMany({
        take: MAX_RESULTS / 2,
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { username: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          name: true,
          displayUsername: true,
          username: true,
          image: true,
        },
      }),
      prisma.thread.findMany({
        take: MAX_RESULTS / 2,
        where: {
          title: { contains: q, mode: "insensitive" },
          deletedAt: null,
        },
        select: {
          id: true,
          title: true,
        },
      }),
    ]);

    // Combine results (users first, then threads)
    const combinedResults: SearchAllType[] = [
      ...users.map((user) => ({ ...user, type: "users" as const })),
      ...threads.map((thread) => ({ ...thread, type: "threads" as const })),
    ];

    return NextResponse.json(combinedResults, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Something went wrong" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}

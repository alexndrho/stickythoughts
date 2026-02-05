import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import type { SearchAllType } from "@/types/search";
import type IError from "@/types/error";

const MAX_RESULTS = 10;

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type"); // "all", "letters", "users"

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
    } else if (type === "letters") {
      const letters = await prisma.letter.findMany({
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
        letters.map((letter) => ({ ...letter, type: "letters" as const })),
        { status: 200 },
      );
    }

    const [users, letters] = await Promise.all([
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
      prisma.letter.findMany({
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

    // Combine results (users first, then letters)
    const combinedResults: SearchAllType[] = [
      ...users.map((user) => ({ ...user, type: "users" as const })),
      ...letters.map((letter) => ({ ...letter, type: "letters" as const })),
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

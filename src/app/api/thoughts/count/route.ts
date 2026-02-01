import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import IError from "@/types/error";

export async function GET() {
  try {
    const count = await prisma.thought.count({
      where: { deletedAt: null },
    });

    return NextResponse.json({ count }, { status: 200 });
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

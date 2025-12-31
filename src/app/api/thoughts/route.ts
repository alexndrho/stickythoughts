import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/db";
import IError from "@/types/error";
import { THOUGHTS_PER_PAGE } from "@/config/thought";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const searchTerm = searchParams.get("searchTerm");
  const lastId = searchParams.get("lastId");

  try {
    const thoughts = await prisma.thought.findMany({
      take: THOUGHTS_PER_PAGE,
      ...(lastId && {
        skip: 1,
        cursor: {
          id: lastId,
        },
      }),
      where: searchTerm
        ? {
            author: {
              contains: searchTerm,
              mode: "insensitive",
            },
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(thoughts, { status: 200 });
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

export async function POST(req: Request) {
  try {
    const { author, message, color } = await req.json();

    await prisma.thought.create({
      data: {
        author,
        message,
        color,
      },
    });

    return NextResponse.json(
      {
        message: "Thought submitted successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const zodError: IError = {
        issues: error.issues.map((issue) => ({
          code: "validation/invalid-input",
          message: issue.message,
        })),
      };

      return NextResponse.json(zodError, { status: 400 });
    }

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

import { type NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/db";
import { getClientIp } from "@/lib/http";
import { createThoughtInput } from "@/lib/validations/thought";
import { validateTurnstile } from "@/lib/captcha";
import { THOUGHTS_PER_PAGE } from "@/config/thought";
import type IError from "@/types/error";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const searchTerm = searchParams.get("searchTerm");
  const lastId = searchParams.get("lastId");
  const page = Number(searchParams.get("page") || "1");

  try {
    const thoughts = await prisma.thought.findMany({
      take: THOUGHTS_PER_PAGE,
      ...(lastId
        ? {
            skip: 1,
            cursor: {
              id: lastId,
            },
          }
        : {
            skip: (page - 1) * THOUGHTS_PER_PAGE,
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
    const { author, message, color, turnstileToken } = createThoughtInput.parse(
      await req.json(),
    );

    const clientIp = await getClientIp();

    const turnstileResponse = await validateTurnstile({
      token: turnstileToken,
      secret: process.env.CLOUDFLARE_TURNSTILE_SECRET_THOUGHT_KEY!,
      ...(clientIp !== "unknown" && { remoteip: clientIp }), // Only include if valid
    });

    if (!turnstileResponse.success) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "captcha/validation-failed",
              message: "Captcha validation failed",
            },
          ],
        } satisfies IError,
        { status: 400 },
      );
    }

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

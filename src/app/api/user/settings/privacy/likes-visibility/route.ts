import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { prisma } from "@/lib/db";
import { updateUserLikesVisibilityInput } from "@/lib/validations/user";
import IError from "@/types/error";
import { guardSession } from "@/lib/session-guard";

export async function PUT(request: Request) {
  try {
    const { visibility } = updateUserLikesVisibilityInput.parse(
      await request.json(),
    );
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        settings: {
          upsert: {
            update: {
              privacySettings: {
                upsert: {
                  update: { likesVisibility: visibility },
                  create: { likesVisibility: visibility },
                },
              },
            },
            create: {
              privacySettings: {
                create: { likesVisibility: visibility },
              },
            },
          },
        },
      },
      select: {
        settings: {
          select: {
            privacySettings: {
              select: {
                likesVisibility: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedUser.settings?.privacySettings, {
      status: 200,
    });
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
    if (error instanceof Error) {
      console.error(
        "PUT /api/user/settings/privacy/likes-visibility error:",
        error.stack,
      );
    }

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

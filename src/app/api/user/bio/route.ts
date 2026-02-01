import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import IError from "@/types/error";
import { updateUserBioInput } from "@/lib/validations/user";
import z from "zod";
import { guardSession } from "@/lib/session-guard";

export async function PUT(request: Request) {
  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    const { bio } = updateUserBioInput.parse(await request.json());

    await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        bio,
      },
    });

    return NextResponse.json(
      {
        message: "User bio updated successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const zodError: IError = {
        issues: error.issues.map((issue) => ({
          code: "validation/invalid-input",
          message: issue.message,
        })),
      };
      return NextResponse.json(zodError, { status: 400 });
    }

    console.error("Error updating user bio:", error);
    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}

// allows admins to delete a user's bio. note: users can clear their own bio by setting it to an empty string.
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  try {
    if (!userId) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "validation/invalid-request",
              message: "User ID is required",
            },
          ],
        } satisfies IError,
        { status: 400 },
      );
    }

    const session = await guardSession({
      headers: await headers(),
      permission: { user: ["update"] },
    });

    if (session instanceof NextResponse) {
      return session;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { bio: null },
    });

    return NextResponse.json(
      {
        message: "User bio deleted successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error deleting user bio:", error);
    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "Unknown error" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}

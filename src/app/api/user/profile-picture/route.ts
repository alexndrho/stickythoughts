import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { Prisma } from "@/generated/prisma/client";
import { auth } from "@/lib/auth";
import IError from "@/types/error";
import { deleteFile, isUrlStorage, uploadFile } from "@/lib/storage";
import { extractKeyFromUrl } from "@/utils/text";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json(
      {
        issues: [{ code: "auth/unauthorized", message: "Unauthorized" }],
      } satisfies IError,
      { status: 401 },
    );
  }

  let newFileKey: string | null = null;
  let oldImageKey: string | null = null;

  try {
    const formData = await req.formData();
    const userImg = formData.get("user-image");

    if (!(userImg instanceof File)) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "validation/invalid-input",
              message: "Invalid or missing file",
            },
          ],
        } satisfies IError,
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(userImg.type)) {
      return NextResponse.json(
        {
          issues: [
            { code: "validation/invalid-input", message: "Invalid file type" },
          ],
        } satisfies IError,
        { status: 400 },
      );
    }

    if (userImg.size > maxSize) {
      return NextResponse.json(
        {
          issues: [
            {
              code: "validation/too-large",
              message: "File size exceeds limit",
            },
          ],
        } satisfies IError,
        { status: 400 },
      );
    }

    const arrayBuffer = await userImg.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const processedImage = await sharp(buffer)
      .resize(256, 256)
      .png({
        quality: 80,
      })
      .toBuffer();

    // Store old image key for cleanup if needed
    if (session.user.image && isUrlStorage(session.user.image)) {
      oldImageKey = extractKeyFromUrl(session.user.image);
    }

    // Upload new file first
    const fileName = `user/${session.user.id}/profile/${Date.now()}.png`;
    newFileKey = fileName;

    const imageUrl = await uploadFile({
      params: {
        Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME || "",
        Key: fileName,
        Body: processedImage,
        ContentType: "image/png",
        CacheControl: "no-cache",
      },
    });

    // Update database
    await auth.api.updateUser({
      headers: await headers(),
      body: {
        image: imageUrl,
      },
    });

    // Only delete old file after successful database update
    if (oldImageKey) {
      try {
        await deleteFile({
          params: {
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: oldImageKey,
          },
        });
      } catch (deleteError) {
        // Log but don't fail the request if old file deletion fails
        console.error("Failed to delete old profile picture:", deleteError);
      }
    }

    return NextResponse.json(
      {
        image: imageUrl,
      },
      { status: 200 },
    );
  } catch (error) {
    // Clean up uploaded file if database update failed
    if (newFileKey) {
      try {
        await deleteFile({
          params: {
            Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
            Key: newFileKey,
          },
        });
      } catch (cleanupError) {
        console.error("Failed to clean up uploaded file:", cleanupError);
      }
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2015") {
        return NextResponse.json(
          {
            issues: [{ code: "not-found", message: "User not found" }],
          } satisfies IError,
          { status: 404 },
        );
      }
    } else if (error instanceof Error) {
      console.error("Error message:", error.stack);
    } else {
      console.error("Error updating profile picture:", error);
    }

    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "An error occurred" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json(
        {
          issues: [{ code: "auth/unauthorized", message: "Unauthorized" }],
        } satisfies IError,
        { status: 401 },
      );
    }

    let userImage: string | null | undefined = null;

    if (userId) {
      // moderator deleting another user's profile picture
      const hasPermission = await auth.api.userHasPermission({
        body: {
          userId: session.user.id,
          permission: { user: ["delete"] },
        },
      });

      if (!hasPermission.success) {
        return NextResponse.json(
          {
            issues: [{ code: "auth/forbidden", message: "Forbidden" }],
          } satisfies IError,
          { status: 403 },
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true },
      });

      if (!user) {
        return NextResponse.json(
          {
            issues: [{ code: "not-found", message: "User not found" }],
          } satisfies IError,
          { status: 404 },
        );
      }

      userImage = user.image;
    } else {
      userImage = session.user.image;
    }

    if (!userImage) {
      return NextResponse.json(
        {
          issues: [
            { code: "validation/invalid-input", message: "No image to delete" },
          ],
        } satisfies IError,
        { status: 400 },
      );
    }

    const imageKey = isUrlStorage(userImage)
      ? extractKeyFromUrl(userImage)
      : null;

    try {
      // Update database first
      if (userId) {
        // Moderator path: update the target user's image
        await prisma.user.update({
          where: { id: userId },
          data: { image: null },
        });
      } else {
        // Self path: update the session user's image through auth API
        await auth.api.updateUser({
          headers: await headers(),
          body: {
            image: null,
          },
        });
      }

      // Delete from storage after successful database update
      if (imageKey) {
        try {
          await deleteFile({
            params: {
              Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME,
              Key: imageKey,
            },
          });
        } catch (deleteError) {
          // Log but don't fail the request if file deletion fails
          console.error(
            "Failed to delete profile picture from storage:",
            deleteError,
          );
        }
      }

      return NextResponse.json(
        {
          image: null,
        },
        { status: 200 },
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2015") {
          return NextResponse.json(
            {
              issues: [{ code: "not-found", message: "User not found" }],
            } satisfies IError,
            { status: 404 },
          );
        }
      } else if (error instanceof Error) {
        console.error("Error message:", error.stack);
      }

      console.error("Error deleting profile picture:", error);
      return NextResponse.json(
        {
          issues: [{ code: "unknown-error", message: "An error occurred" }],
        } satisfies IError,
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error processing delete request:", error);
    return NextResponse.json(
      {
        issues: [{ code: "unknown-error", message: "An error occurred" }],
      } satisfies IError,
      { status: 500 },
    );
  }
}

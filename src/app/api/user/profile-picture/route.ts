import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { auth } from "@/lib/auth";
import { deleteFile, isUrlStorage, uploadFile } from "@/lib/storage";
import { extractUserProfileImageKeyFromUrl } from "@/utils/text";
import { guardSession } from "@/lib/session-guard";
import { jsonError, unknownErrorResponse } from "@/lib/http";
import { isPrismaKnownRequestErrorCode } from "@/server/db";
import {
  getUserProfileImage,
} from "@/server/user";
import { UserNotFoundError } from "@/server/user";
import { removeUserProfilePicture } from "@/server/user";

export async function PUT(req: Request) {
  const session = await guardSession({ headers: await headers() });

  if (session instanceof NextResponse) {
    return session;
  }

  let newFileKey: string | null = null;
  let oldImageKey: string | null = null;

  try {
    const formData = await req.formData();
    const userImg = formData.get("user-image");

    if (!(userImg instanceof File)) {
      return jsonError(
        [
          {
            code: "validation/invalid-input",
            message: "Invalid or missing file",
          },
        ],
        400,
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(userImg.type)) {
      return jsonError(
        [{ code: "validation/invalid-input", message: "Invalid file type" }],
        400,
      );
    }

    if (userImg.size > maxSize) {
      return jsonError(
        [
          {
            code: "validation/too-large",
            message: "File size exceeds limit",
          },
        ],
        400,
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
      // Only delete keys that belong to this user.
      oldImageKey = extractUserProfileImageKeyFromUrl(
        session.user.image,
        session.user.id,
      );
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

    if (isPrismaKnownRequestErrorCode(error, "P2015")) {
      return jsonError([{ code: "not-found", message: "User not found" }], 404);
    } else if (error instanceof Error) {
      console.error("Error message:", error.stack);
    } else {
      console.error("Error updating profile picture:", error);
    }

    return unknownErrorResponse("An error occurred");
  }
}

export async function DELETE(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const userId = searchParams.get("userId");

  try {
    const session = await guardSession({ headers: await headers() });

    if (session instanceof NextResponse) {
      return session;
    }

    let userImage: string | null | undefined = null;
    const targetUserId = userId ?? session.user.id;

    if (userId) {
      // moderator deleting another user's profile picture
      const hasPermission = await auth.api.userHasPermission({
        body: {
          userId: session.user.id,
          permission: { user: ["update"] },
        },
      });

      if (!hasPermission.success) {
        return jsonError(
          [{ code: "auth/forbidden", message: "Forbidden" }],
          403,
        );
      }

      try {
        userImage = await getUserProfileImage({ userId });
      } catch (error) {
        if (error instanceof UserNotFoundError) {
          return jsonError(
            [{ code: "not-found", message: "User not found" }],
            404,
          );
        }
        throw error;
      }
    } else {
      userImage = session.user.image;
    }

    if (!userImage) {
      return jsonError(
        [{ code: "validation/invalid-input", message: "No image to delete" }],
        400,
      );
    }

    const imageKey = isUrlStorage(userImage)
      ? extractUserProfileImageKeyFromUrl(userImage, targetUserId)
      : null;

    // If the image is in our storage but doesn't match the expected per-user prefix,
    // treat it as non-deletable to avoid arbitrary object deletion.
    if (isUrlStorage(userImage) && !imageKey) {
      console.error(
        "Refusing to delete profile image: storage URL key does not match expected prefix.",
        { targetUserId },
      );
    }

	    try {
	      // Update database first
	      if (userId) {
	        // Moderator path: clear DB + storage cleanup via server-only helper.
	        await removeUserProfilePicture({
	          userId,
	          imageUrl: userImage,
	          bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
	        });

	        return NextResponse.json({ image: null }, { status: 200 });
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
      if (isPrismaKnownRequestErrorCode(error, "P2015")) {
        return jsonError(
          [{ code: "not-found", message: "User not found" }],
          404,
        );
      } else if (error instanceof Error) {
        console.error("Error message:", error.stack);
      }

      console.error("Error deleting profile picture:", error);
      return unknownErrorResponse("An error occurred");
    }
  } catch (error) {
    console.error("Error processing delete request:", error);
    return unknownErrorResponse("An error occurred");
  }
}

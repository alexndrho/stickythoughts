import 'server-only';

import { prisma } from '@/lib/db';
import { deleteFile, isUrlStorage } from '@/lib/storage';
import { extractUserProfileImageKeyFromUrl } from '@/utils/text';

export async function removeUserProfilePicture(args: {
  userId: string;
  imageUrl?: string | null;
  bucketName?: string;
}) {
  // Always clear DB state; storage deletion is best-effort.
  await prisma.user.update({
    where: { id: args.userId },
    data: { image: null },
  });

  if (!args.imageUrl || !isUrlStorage(args.imageUrl)) {
    return;
  }

  const key = extractUserProfileImageKeyFromUrl(args.imageUrl, args.userId);
  if (!key) {
    console.error(
      'Refusing to delete profile image: storage URL key does not match expected prefix.',
      { userId: args.userId },
    );
    return;
  }

  try {
    await deleteFile({
      params: {
        Bucket: args.bucketName,
        Key: key,
      },
    });
  } catch (error) {
    // Avoid failing auth flows on cleanup failure.
    console.error('Failed to delete profile picture from storage:', error);
  }
}

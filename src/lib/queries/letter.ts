import "server-only";

import { prisma } from "@/lib/db";
import { LetterNotFoundError } from "@/server/letter";
import type { LetterType } from "@/types/letter";
import { formatLetters } from "@/utils/letter";

export { LetterNotFoundError };

export async function getLetterPublic(args: {
  letterId: string;
  sessionUserId?: string | null;
}): Promise<LetterType> {
  const letter = await prisma.letter.findUnique({
    where: {
      id: args.letterId,
    },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      likes: args.sessionUserId
        ? {
            where: {
              userId: args.sessionUserId,
            },
            select: {
              userId: true,
            },
          }
        : false,
      _count: {
        select: {
          likes: true,
          replies: {
            where: {
              deletedAt: null,
            },
          },
        },
      },
    },
  });

  if (!letter || letter.deletedAt) {
    throw new LetterNotFoundError("Letter not found");
  }

  return formatLetters({
    sessionUserId: args.sessionUserId ?? undefined,
    letters: letter,
  });
}

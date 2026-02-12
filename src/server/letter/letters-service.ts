import "server-only";

import { LETTERS_PER_PAGE } from "@/config/letter";
import { prisma } from "@/lib/db";
import { LetterNotFoundError } from "./letter-errors";
import type { LetterType } from "@/types/letter";
import { formatLetters } from "@/utils/letter";

export async function createLetter(args: {
  authorId: string;
  title: string;
  body: string;
  isAnonymous?: boolean;
}) {
  return prisma.letter.create({
    data: {
      title: args.title,
      body: args.body,
      isAnonymous: args.isAnonymous,
      author: {
        connect: {
          id: args.authorId,
        },
      },
    },
    select: {
      id: true,
    },
  });
}

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

export async function listLetters(args: {
  lastId?: string | null;
  viewerUserId?: string;
}) {
  return prisma.letter.findMany({
    take: LETTERS_PER_PAGE,
    ...(args.lastId && {
      skip: 1,
      cursor: {
        id: args.lastId,
      },
    }),
    where: { deletedAt: null },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      likes: args.viewerUserId
        ? {
            where: {
              userId: args.viewerUserId,
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function updateLetter(args: {
  letterId: string;
  authorId: string;
  body: string;
}) {
  return prisma.letter.update({
    where: {
      id: args.letterId,
      authorId: args.authorId,
      deletedAt: null,
    },
    data: {
      body: args.body,
    },
    include: {
      author: {
        select: {
          name: true,
          username: true,
          image: true,
        },
      },
      likes: {
        where: {
          userId: args.authorId,
        },
        select: {
          userId: true,
        },
      },
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
}

export async function softDeleteLetter(args: {
  letterId: string;
  deletedById: string;
  authorId?: string;
}) {
  await prisma.letter.update({
    where: {
      id: args.letterId,
      deletedAt: null,
      ...(args.authorId ? { authorId: args.authorId } : {}),
    },
    data: {
      deletedAt: new Date(),
      deletedById: args.deletedById,
    },
  });
}

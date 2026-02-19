import "server-only";

import { auth } from "@/lib/auth";
import { LETTERS_PER_PAGE } from "@/config/letter";
import { prisma } from "@/lib/db";
import { LetterNotFoundError } from "./letter-errors";
import { formatLetters } from "@/utils/letter";
import type { Letter } from "@/types/letter";

export async function createLetter(args: {
  session?: Awaited<ReturnType<typeof auth.api.getSession>>;
  title: string;
  body: string;
  isAnonymous?: boolean;
}) {
  const isAuthenticated = Boolean(args.session);
  const isAutoApproved = Boolean(args.session?.user.emailVerified);
  const isAnonymous = isAuthenticated ? args.isAnonymous : true;

  return prisma.letter.create({
    data: {
      title: args.title,
      body: args.body,
      isAnonymous,
      ...(args.session && {
        author: {
          connect: {
            id: args.session.user.id,
          },
        },
      }),
      ...(isAutoApproved && { status: "APPROVED", postedAt: new Date() }),
    },
    select: {
      id: true,
    },
  });
}

export async function getLetterPublic(args: {
  letterId: string;
  sessionUserId?: string | null;
}): Promise<Letter> {
  const letter = await prisma.letter.findUnique({
    where: {
      deletedAt: null,
      id: args.letterId,
      status: "APPROVED",
    },
    include: {
      author: {
        select: {
          id: true,
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

export async function listLettersPublic(args: {
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
    where: { deletedAt: null, status: "APPROVED" },
    include: {
      author: {
        select: {
          id: true,
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
    orderBy: [
      { postedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
      { id: "desc" },
    ],
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
      contentUpdatedAt: new Date(),
    },
    include: {
      author: {
        select: {
          id: true,
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

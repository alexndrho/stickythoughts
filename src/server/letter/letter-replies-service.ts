import "server-only";

import { NotificationType } from "@/generated/prisma/enums";
import { LETTER_REPLIES_PER_PAGE } from "@/config/letter";
import { prisma } from "@/lib/db";
import { LetterNotFoundError } from "@/server/letter";

export async function createLetterReply(args: {
  letterId: string;
  authorId: string;
  body: string;
  isAnonymous?: boolean;
}) {
  const letterStatus = await prisma.letter.findUnique({
    where: { id: args.letterId },
    select: { deletedAt: true },
  });

  if (!letterStatus || letterStatus.deletedAt) {
    throw new LetterNotFoundError("Letter post not found");
  }

  const reply = await prisma.letterReply.create({
    data: {
      letter: { connect: { id: args.letterId } },
      author: { connect: { id: args.authorId } },
      body: args.body,
      isAnonymous: args.isAnonymous,
    },
    include: {
      letter: {
        select: {
          authorId: true,
          isAnonymous: true,
        },
      },
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
        },
      },
    },
  });

  if (reply.letter.authorId && reply.letter.authorId !== reply.authorId) {
    await prisma.notification.create({
      data: {
        user: { connect: { id: reply.letter.authorId } },
        type: NotificationType.LETTER_REPLY,
        actors: {
          create: {
            userId: reply.authorId,
          },
        },
        reply: { connect: { id: reply.id } },
      },
    });
  }

  return reply;
}

export async function listLetterReplies(args: {
  letterId: string;
  lastId?: string | null;
  viewerUserId?: string;
}) {
  return prisma.letterReply.findMany({
    take: LETTER_REPLIES_PER_PAGE,
    ...(args.lastId && {
      skip: 1,
      cursor: {
        id: args.lastId,
      },
    }),
    where: {
      letterId: args.letterId,
      deletedAt: null,
      letter: {
        deletedAt: null,
      },
    },
    include: {
      letter: {
        select: {
          authorId: true,
          isAnonymous: true,
        },
      },
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
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

export async function updateLetterReply(args: {
  letterId: string;
  replyId: string;
  authorId: string;
  body: string;
}) {
  return prisma.letterReply.update({
    where: {
      id: args.replyId,
      letterId: args.letterId,
      deletedAt: null,
      authorId: args.authorId,
      letter: {
        deletedAt: null,
      },
    },
    data: {
      body: args.body,
    },
    include: {
      letter: {
        select: {
          authorId: true,
          isAnonymous: true,
        },
      },
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
        },
      },
    },
  });
}

export async function softDeleteLetterReply(args: {
  letterId: string;
  replyId: string;
  deletedById: string;
  authorId?: string;
}) {
  const deletedReply = await prisma.letterReply.update({
    where: {
      id: args.replyId,
      letterId: args.letterId,
      deletedAt: null,
      ...(args.authorId ? { authorId: args.authorId } : {}),
    },
    data: {
      deletedAt: new Date(),
      deletedById: args.deletedById,
    },
    select: {
      authorId: true,
      letter: {
        select: {
          authorId: true,
        },
      },
    },
  });

  const recipientIds = [
    deletedReply.authorId,
    deletedReply.letter.authorId,
  ].filter((id): id is string => Boolean(id));

  // Delete notifications for both the reply author and the letter author
  if (recipientIds.length > 0) {
    await prisma.notification.deleteMany({
      where: {
        userId: {
          in: recipientIds,
        },
        replyId: args.replyId,
      },
    });
  }
}

import 'server-only';

import { LETTER_REPLIES_PER_PAGE } from '@/config/letter';
import { prisma } from '@/lib/db';
import { LetterNotFoundError } from '@/server/letter/letter-errors';
import {
  createLetterReplyNotification,
  removeLetterReplyNotifications,
} from '@/server/letter/letter-notifications';

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
    throw new LetterNotFoundError('Letter post not found');
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
          anonymousFrom: true,
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
    await createLetterReplyNotification({
      replyId: reply.id,
      letterId: args.letterId,
      actorUserId: reply.authorId,
      actorName: reply.isAnonymous ? 'Anonymous' : reply.author.name || reply.author.username,
      recipientUserId: reply.letter.authorId,
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
          anonymousFrom: true,
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
    orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
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
          anonymousFrom: true,
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

  const recipientIds = [deletedReply.authorId, deletedReply.letter.authorId].filter(
    (id): id is string => Boolean(id),
  );

  await removeLetterReplyNotifications({ replyId: args.replyId, recipientIds });
}

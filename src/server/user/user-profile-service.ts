import "server-only";

import { prisma } from "@/lib/db";
import { LETTERS_PER_PAGE, LETTER_REPLIES_PER_PAGE } from "@/config/letter";
import { UserNotFoundError } from "@/server/user/user-errors";

export async function getUserLikesVisibility(args: { username: string }) {
  const user = await prisma.user.findUnique({
    where: {
      username: args.username,
    },
    select: {
      username: true,
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

  if (!user) {
    throw new UserNotFoundError("User not found");
  }

  return {
    username: user.username,
    likesVisibility: user.settings?.privacySettings?.likesVisibility ?? null,
  };
}

export async function listUserLetters(args: {
  username: string;
  lastId?: string | null;
  viewerUsername?: string | null;
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
    where: {
      author: {
        username: args.username,
      },
      deletedAt: null,
      ...(args.viewerUsername !== args.username && {
        isAnonymous: false,
      }),
    },
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function listUserReplies(args: {
  username: string;
  lastId?: string | null;
  viewerUsername?: string | null;
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
      author: {
        username: args.username,
      },
      deletedAt: null,
      letter: {
        deletedAt: null,
      },
      ...(args.viewerUsername !== args.username && {
        isAnonymous: false,
      }),
    },
    include: {
      letter: {
        select: {
          title: true,
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
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function listUserLikedLetters(args: {
  username: string;
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
    where: {
      likes: {
        some: {
          user: {
            username: args.username,
          },
        },
      },
      deletedAt: null,
    },
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
    orderBy: {
      createdAt: "desc",
    },
  });
}


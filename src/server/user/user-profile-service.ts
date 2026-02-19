import "server-only";

import { prisma } from "@/lib/db";
import { LETTERS_PER_PAGE, LETTER_REPLIES_PER_PAGE } from "@/config/letter";
import { UserNotFoundError } from "@/server/user/user-errors";
import type { UserPublicAccount } from "@/types/user";

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

export async function getUserPublicAccount(args: {
  username: string;
  canSeeBanned: boolean;
}): Promise<UserPublicAccount> {
  const normalizedUsername = args.username.toLowerCase();

  const user = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
    select: {
      id: true,
      displayUsername: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      // Only staff should see this field; omit entirely otherwise.
      banned: args.canSeeBanned,
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

  const { settings, ...userRest } = user;

  return {
    ...userRest,
    isLikesPrivate: settings?.privacySettings?.likesVisibility === "PRIVATE",
  } satisfies UserPublicAccount;
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
}

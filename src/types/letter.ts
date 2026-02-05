import { type Prisma } from "@/generated/prisma/client";

type PrismaBaseLetter = Prisma.LetterGetPayload<{
  select: {
    id: true;
    title: true;
    body: true;
    authorId: true;
    isAnonymous: true;
    createdAt: true;
    updatedAt: true;
    author: {
      select: {
        name: true;
        username: true;
        image: true;
      };
    };
    likes?: {
      select: {
        userId: true;
      };
    };
    _count: {
      select: {
        likes: true;
        replies: true;
      };
    };
  };
}>;

export type BaseLetterType = Omit<PrismaBaseLetter, "likes" | "_count"> & {
  likes?: { userId: string }[];
  _count: { likes: number; replies: number };
};

export type LetterType = Omit<
  BaseLetterType,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: BaseLetterType["author"];
  isOwner: boolean;
  likes: {
    liked: boolean;
    count: number;
  };
  replies: {
    count: number;
  };
};

type PrismaBaseLetterReply = Prisma.LetterReplyGetPayload<{
  select: {
    id: true;
    body: true;
    authorId: true;
    isAnonymous: true;
    letterId: true;
    createdAt: true;
    updatedAt: true;
    letter: {
      select: {
        authorId: true;
        isAnonymous: true;
      };
    };
    author: {
      select: {
        id: true;
        name: true;
        username: true;
        image: true;
      };
    };
    likes?: {
      select: {
        userId: true;
      };
    };
    _count: {
      select: {
        likes: true;
      };
    };
  };
}>;

export type BaseLetterReplyType = Omit<
  PrismaBaseLetterReply,
  "likes" | "_count"
> & {
  likes?: { userId: string }[];
  _count: { likes: number };
};

export type LetterReplyType = Omit<
  BaseLetterReplyType,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: BaseLetterReplyType["author"];
  isOP: boolean;
  isSelf: boolean;
  anonymousLabel?: string;
  likes: {
    liked: boolean;
    count: number;
  };
};

type PrismaBaseUserLetterReply = Prisma.LetterReplyGetPayload<{
  select: {
    id: true;
    body: true;
    authorId: true;
    isAnonymous: true;
    letterId: true;
    createdAt: true;
    updatedAt: true;
    letter: {
      select: {
        title: true;
      };
    };
    author: {
      select: {
        id: true;
        name: true;
        username: true;
        image: true;
      };
    };
    likes?: {
      select: {
        userId: true;
      };
    };
    _count: {
      select: {
        likes: true;
      };
    };
  };
}>;

export type BaseUserLetterReplyType = Omit<
  PrismaBaseUserLetterReply,
  "likes" | "_count"
> & {
  likes?: { userId: string }[];
  _count: { likes: number };
};

export type UserLetterReplyType = Omit<
  BaseUserLetterReplyType,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: BaseUserLetterReplyType["author"];
  likes: {
    liked: boolean;
    count: number;
  };
};

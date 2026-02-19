import { type Prisma } from "@/generated/prisma/client";
import type { input } from "zod";
import type {
  createLetterReplyServerInput,
  createLetterServerInput,
  updateLetterReplyServerInput,
  updateLetterServerInput,
} from "@/lib/validations/letter";
import type { SerializeDates } from "./serialization";
import type { UserWithAvatarSummary } from "./user";

type PrismaBaseLetter = Prisma.LetterGetPayload<{
  select: {
    id: true;
    title: true;
    body: true;
    authorId: true;
    isAnonymous: true;
    postedAt: true;
    contentUpdatedAt: true;
    createdAt: true;
    updatedAt: true;
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
        replies: true;
      };
    };
  };
}>;

export type BaseLetter = Omit<PrismaBaseLetter, "likes" | "_count"> & {
  likes?: { userId: string }[];
  _count: { likes: number; replies: number };
};

export type Letter = Omit<
  BaseLetter,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: UserWithAvatarSummary;
  isOwner: boolean;
  likes: {
    liked: boolean;
    count: number;
  };
  replies: {
    count: number;
  };
};

export type LetterDTO = SerializeDates<Letter>;

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

export type BaseLetterReply = Omit<
  PrismaBaseLetterReply,
  "likes" | "_count"
> & {
  likes?: { userId: string }[];
  _count: { likes: number };
};

export type LetterReply = Omit<
  BaseLetterReply,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: UserWithAvatarSummary;
  isOP: boolean;
  isSelf: boolean;
  anonymousLabel?: string;
  likes: {
    liked: boolean;
    count: number;
  };
};

export type LetterReplyDTO = SerializeDates<LetterReply>;

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

export type BaseUserLetterReply = Omit<
  PrismaBaseUserLetterReply,
  "likes" | "_count"
> & {
  likes?: { userId: string }[];
  _count: { likes: number };
};

export type UserLetterReply = Omit<
  BaseUserLetterReply,
  "authorId" | "author" | "likes" | "_count"
> & {
  author?: UserWithAvatarSummary;
  likes: {
    liked: boolean;
    count: number;
  };
};

export type UserLetterReplyDTO = SerializeDates<UserLetterReply>;

export type SubmitLetterBody = input<typeof createLetterServerInput>;
export type UpdateLetterBody = input<typeof updateLetterServerInput>;
export type SubmitLetterReplyBody = input<typeof createLetterReplyServerInput>;
export type UpdateLetterReplyBody = input<typeof updateLetterReplyServerInput>;

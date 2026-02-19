import type { Letter, LetterReply, Thought } from "@/generated/prisma/client";
import type { UserSummary, UserWithAvatarSummary } from "./user";

export type DeletedThoughtFromServer = Omit<
  Thought,
  "highlightedAt" | "highlightedById" | "createdAt" | "deletedAt"
> & {
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: UserSummary | null;
};

export type DeletedLetterFromServer = Omit<
  Letter,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: UserWithAvatarSummary | null;
  deletedBy: UserSummary | null;
};

export type DeletedLetterReplyFromServer = Omit<
  LetterReply,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: UserWithAvatarSummary;
  deletedBy: UserSummary | null;
  letter: {
    id: string;
    title: string;
  };
};

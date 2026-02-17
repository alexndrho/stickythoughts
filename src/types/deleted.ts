import type { Letter, LetterReply, Thought } from "@/generated/prisma/client";

export type DeletedUserSummary = {
  id: string;
  name: string | null;
  username: string;
};

export type DeletedThoughtFromServer = Omit<
  Thought,
  "highlightedAt" | "highlightedById" | "createdAt" | "deletedAt"
> & {
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: DeletedUserSummary | null;
};

export type DeletedLetterFromServer = Omit<
  Letter,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    name: string | null;
    username: string;
    image: string | null;
  } | null;
  deletedBy: DeletedUserSummary | null;
};

export type DeletedLetterReplyFromServer = Omit<
  LetterReply,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    id: string;
    name: string | null;
    username: string;
    image: string | null;
  };
  deletedBy: DeletedUserSummary | null;
  letter: {
    id: string;
    title: string;
  };
};

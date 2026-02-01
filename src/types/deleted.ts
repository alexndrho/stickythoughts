import type { Thread, ThreadComment, Thought } from "@/generated/prisma/client";

export type DeletedUserSummary = {
  id: string;
  name: string | null;
  username: string;
};

export type DeletedThoughtFromServer = Omit<
  Thought,
  "createdAt" | "deletedAt"
> & {
  createdAt: Date;
  deletedAt: Date | null;
  deletedBy: DeletedUserSummary | null;
};

export type DeletedThought = Omit<
  DeletedThoughtFromServer,
  "createdAt" | "deletedAt"
> & {
  createdAt: Date;
  deletedAt: Date | null;
};

export type DeletedThreadFromServer = Omit<
  Thread,
  "createdAt" | "updatedAt" | "deletedAt"
> & {
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    name: string | null;
    username: string;
    image: string | null;
  };
  deletedBy: DeletedUserSummary | null;
};

export type DeletedThreadCommentFromServer = Omit<
  ThreadComment,
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
  thread: {
    id: string;
    title: string;
  };
};

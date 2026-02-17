import type { Letter, LetterStatus } from "@/generated/prisma/client";

export type SubmissionUserSummary = {
  id: string;
  name: string | null;
  username: string;
};

export type SubmissionLetterFromServer = Omit<
  Letter,
  "createdAt" | "updatedAt" | "deletedAt" | "status"
> & {
  status: LetterStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: {
    name: string | null;
    username: string;
    image: string | null;
  } | null;
  statusSetBy?: SubmissionUserSummary | null;
};

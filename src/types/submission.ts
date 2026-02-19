import type { Letter, LetterStatus } from "@/generated/prisma/client";
import type { UserSummary, UserWithAvatarSummary } from "./user";

export type SubmissionLetterFromServer = Omit<
  Letter,
  "createdAt" | "updatedAt" | "deletedAt" | "status"
> & {
  status: LetterStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  author: UserWithAvatarSummary | null;
  statusSetBy?: UserSummary | null;
};

import "server-only";

import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

export type HighlightedThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    createdAt: true;
  };
}>;

export async function getHighlightedThought(args: {
  highlightCutoff: Date;
}): Promise<HighlightedThought | null> {
  return prisma.thought.findFirst({
    where: {
      deletedAt: null,
      highlightedAt: { not: null, gte: args.highlightCutoff },
    },
    orderBy: {
      highlightedAt: "desc",
    },
    select: {
      id: true,
      author: true,
      message: true,
      color: true,
      createdAt: true,
    },
  });
}

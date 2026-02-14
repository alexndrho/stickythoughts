import "server-only";

import { prisma } from "@/lib/db";
import { subMonths } from "date-fns";

export async function purgeSoftDeletedContent() {
  const cutoff = subMonths(new Date(), 1);

  const [replies, letters, thoughts] = await prisma.$transaction([
    prisma.letterReply.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    }),
    prisma.letter.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    }),
    prisma.thought.deleteMany({
      where: { deletedAt: { lte: cutoff } },
    }),
  ]);

  return {
    cutoff,
    deleted: {
      replies: replies.count,
      letters: letters.count,
      thoughts: thoughts.count,
    },
  };
}

import 'server-only';

import { PURGE_AFTER_MONTHS } from '@/config/cron';
import { prisma } from '@/lib/db';
import { subMonths } from 'date-fns';

export async function purgeSoftDeletedContent() {
  const cutoff = subMonths(new Date(), PURGE_AFTER_MONTHS);

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

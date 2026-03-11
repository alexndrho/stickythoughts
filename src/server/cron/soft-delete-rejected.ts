import 'server-only';

import { subDays } from 'date-fns';

import { SOFT_DELETE_REJECTED_AFTER_DAYS } from '@/config/cron';
import { prisma } from '@/lib/db';

export async function softDeleteRejectedContent() {
  const cutoff = subDays(new Date(), SOFT_DELETE_REJECTED_AFTER_DAYS);

  const [thoughts, letters] = await prisma.$transaction([
    prisma.thought.updateMany({
      where: {
        status: 'REJECTED',
        deletedAt: null,
        statusSetAt: { lte: cutoff },
      },
      data: {
        deletedAt: new Date(),
      },
    }),
    prisma.letter.updateMany({
      where: {
        status: 'REJECTED',
        deletedAt: null,
        statusSetAt: { lte: cutoff },
      },
      data: {
        deletedAt: new Date(),
      },
    }),
  ]);

  return {
    cutoff,
    softDeleted: {
      thoughts: thoughts.count,
      letters: letters.count,
    },
  };
}

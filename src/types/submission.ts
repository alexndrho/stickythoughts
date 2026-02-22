import type { Prisma } from '@/generated/prisma/client';
import type { input } from 'zod';
import type { reviewLetterServerInput } from '@/lib/validations/letter';
import type { SerializeDates } from './serialization';
import type { UserSummary, UserWithAvatarSummary } from './user';

type BaseSubmissionLetter = Prisma.LetterGetPayload<{
  select: {
    id: true;
    recipient: true;
    body: true;
    authorId: true;
    status: true;
    statusSetById: true;
    anonymousFrom: true;
    postedAt: true;
    contentUpdatedAt: true;
    createdAt: true;
    updatedAt: true;
    deletedAt: true;
    author: {
      select: {
        id: true;
        name: true;
        username: true;
        image: true;
      };
    };
    statusSetBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
  };
}>;

export type SubmissionLetter = Omit<BaseSubmissionLetter, 'author' | 'statusSetBy'> & {
  author: UserWithAvatarSummary | null;
  statusSetBy?: UserSummary | null;
};

export type SubmissionLetterDTO = SerializeDates<SubmissionLetter>;

export type SetSubmissionLetterStatusBody = input<typeof reviewLetterServerInput>;

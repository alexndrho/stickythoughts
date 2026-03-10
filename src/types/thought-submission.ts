import type { Prisma } from '@/generated/prisma/client';
import type { input } from 'zod';
import type { reviewThoughtServerInput } from '@/lib/validations/thought';
import type { SerializeDates } from './serialization';
import type { UserSummary } from './user';

type BaseSubmissionThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    status: true;
    statusSetById: true;
    createdAt: true;
    deletedAt: true;
    statusSetBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
  };
}>;

export type SubmissionThought = Omit<BaseSubmissionThought, 'statusSetBy'> & {
  statusSetBy?: UserSummary | null;
};

export type SubmissionThoughtDTO = SerializeDates<SubmissionThought>;

export type SetSubmissionThoughtStatusBody = input<typeof reviewThoughtServerInput>;

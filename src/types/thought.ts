import type { Prisma } from '@/generated/prisma/client';
import type { input } from 'zod';
import type { createThoughtInput } from '@/lib/validations/thought';
import type { SerializeDates } from './serialization';
import type { UserSummary } from './user';
import { THOUGHTS_SORTS } from '@/config/thought';

export type ThoughtsSort = (typeof THOUGHTS_SORTS)[number];

export type PrivateThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    pattern: true;
    createdAt: true;
  };
}>;

export type PrivateThoughtDTO = SerializeDates<PrivateThought>;

export type BasePrivateHighlightedThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    pattern: true;
    createdAt: true;
    highlightedAt: true;
    highlightedBy: {
      select: {
        id: true;
        name: true;
        username: true;
      };
    };
  };
}>;

export type PrivateHighlightedThought = Omit<
  BasePrivateHighlightedThought,
  'highlightedAt' | 'highlightedBy'
> & {
  highlightedAt: NonNullable<BasePrivateHighlightedThought['highlightedAt']>;
  highlightedBy: UserSummary;
};

export type PrivateHighlightedThoughtDTO = SerializeDates<PrivateHighlightedThought>;

export type PublicThought = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    pattern: true;
    resonanceCount: true;
    createdAt: true;
  };
}>;

export type PublicThoughtDTO = SerializeDates<PublicThought>;

export type SubmitThoughtBody = input<typeof createThoughtInput>;

export type SubmitThoughtResponse = Prisma.ThoughtGetPayload<{
  select: {
    id: true;
    author: true;
    message: true;
    color: true;
    pattern: true;
    resonanceCount: true;
    status: true;
    createdAt: true;
  };
}>;

export type SubmitThoughtResponseDTO = SerializeDates<SubmitThoughtResponse>;

export function parseThoughtsSort(value: string | null): ThoughtsSort {
  if (!value) {
    return 'newest';
  }

  return THOUGHTS_SORTS.some((sort) => sort === value) ? (value as ThoughtsSort) : 'newest';
}

import { z } from 'zod';

import type { Prisma } from '@/generated/prisma/client';
import { ThoughtColor } from '@/generated/prisma/enums';
import { containsUrl, sanitizeString } from '@/utils/text';
import {
  THOUGHT_MAX_AUTHOR_LENGTH,
  THOUGHT_MAX_MESSAGE_LENGTH,
  THOUGHT_MIN_AUTHOR_LENGTH,
  THOUGHT_MIN_MESSAGE_LENGTH,
} from '@/config/thought';

export const thoughtColorZod = z.enum(Object.values(ThoughtColor));

export const createThoughtInput = z.object({
  author: z
    .string()
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(
          THOUGHT_MIN_AUTHOR_LENGTH,
          `Author name must be at least ${THOUGHT_MIN_AUTHOR_LENGTH} characters long`,
        )
        .max(
          THOUGHT_MAX_AUTHOR_LENGTH,
          `Author name must be at most ${THOUGHT_MAX_AUTHOR_LENGTH} characters long`,
        )
        .refine((val) => !containsUrl(val), {
          message: 'Message cannot contain URLs',
        }),
    ),
  message: z
    .string()
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(
          THOUGHT_MIN_MESSAGE_LENGTH,
          `Message must be at least ${THOUGHT_MIN_MESSAGE_LENGTH} characters long`,
        )
        .max(
          THOUGHT_MAX_MESSAGE_LENGTH,
          `Message must be at most ${THOUGHT_MAX_MESSAGE_LENGTH} characters long`,
        )
        .refine((val) => !containsUrl(val), {
          message: 'Message cannot contain URLs',
        }),
    ),
  color: thoughtColorZod,
}) satisfies z.Schema<Prisma.ThoughtCreateInput>;

export const randomSeedSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-]{1,36}$/)
  .nullable()
  .catch(null);

export const highlightThoughtInput = z.object({
  highlighted: z.boolean(),
});

const thoughtStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const reviewThoughtServerInput = z.object({
  status: thoughtStatusSchema.exclude(['PENDING']),
});

import { z } from 'zod';

import { sanitizeMultilineString, sanitizeString } from '@/utils/text';
import {
  LETTER_BODY_MAX_LENGTH,
  LETTER_BODY_MIN_LENGTH,
  LETTER_RECIPIENT_MAX_LENGTH,
  LETTER_RECIPIENT_MIN_LENGTH,
  LETTER_REPLY_MAX_LENGTH,
} from '@/config/letter';

export const createLetterServerInput = z.object({
  body: z
    .string('Body is required')
    .transform(sanitizeMultilineString)
    .pipe(
      z
        .string()
        .min(LETTER_BODY_MIN_LENGTH, 'Body is required')
        .max(
          LETTER_BODY_MAX_LENGTH,
          `Body must be at most ${LETTER_BODY_MAX_LENGTH.toLocaleString()} characters long`,
        ),
    ),
  isAnonymous: z.boolean().optional(),
  recipient: z
    .string('Recipient is required')
    .transform(sanitizeString)
    .pipe(
      z
        .string()
        .min(
          LETTER_RECIPIENT_MIN_LENGTH,
          `Recipient must be at least ${LETTER_RECIPIENT_MIN_LENGTH} characters long`,
        )
        .max(
          LETTER_RECIPIENT_MAX_LENGTH,
          `Recipient must be at most ${LETTER_RECIPIENT_MAX_LENGTH} characters long`,
        ),
    ),
});

export const updateLetterServerInput = createLetterServerInput.pick({
  body: true,
});

export const createLetterReplyServerInput = z.object({
  body: z
    .string('Reply is required')
    .transform(sanitizeMultilineString)
    .pipe(
      z
        .string()
        .min(
          LETTER_BODY_MIN_LENGTH,
          `Reply must be at least ${LETTER_BODY_MIN_LENGTH} characters long`,
        )
        .max(
          LETTER_REPLY_MAX_LENGTH,
          `Reply must be at most ${LETTER_REPLY_MAX_LENGTH.toLocaleString()} characters long`,
        ),
    ),
  isAnonymous: z.boolean().optional(),
});

export const updateLetterReplyServerInput = createLetterReplyServerInput.pick({
  body: true,
});

const letterStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const reviewLetterServerInput = z.object({
  status: letterStatusSchema.exclude(['PENDING']),
});

export const letterSubmissionsStatusQueryInput = letterStatusSchema.exclude(['APPROVED']);

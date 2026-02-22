import { z } from 'zod';

import { sanitizeMultilineString, sanitizeString } from '@/utils/text';
import {
  LETTER_BODY_MAX_LENGTH,
  LETTER_BODY_MIN_LENGTH,
  LETTER_NAME_MAX_LENGTH,
  LETTER_NAME_MIN_LENGTH,
  LETTER_REPLY_MAX_LENGTH,
} from '@/config/letter';

export const createLetterServerInput = z
  .object({
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
    shareMode: z.enum(['you', 'anonymous']).default('anonymous'),
    anonymousFrom: z.string().transform(sanitizeString).optional(),
    recipient: z
      .string('Recipient is required')
      .transform(sanitizeString)
      .pipe(
        z
          .string()
          .min(
            LETTER_NAME_MIN_LENGTH,
            `Recipient must be at least ${LETTER_NAME_MIN_LENGTH} characters long`,
          )
          .max(
            LETTER_NAME_MAX_LENGTH,
            `Recipient must be at most ${LETTER_NAME_MAX_LENGTH} characters long`,
          ),
      ),
  })
  .superRefine(({ shareMode, anonymousFrom }, ctx) => {
    if (shareMode !== 'anonymous') return;

    if (!anonymousFrom) {
      ctx.addIssue({
        code: 'custom',
        path: ['anonymousFrom'],
        message: 'From is required when sharing anonymously',
      });
      return;
    }

    if (anonymousFrom.length < LETTER_NAME_MIN_LENGTH) {
      ctx.addIssue({
        code: 'too_small',
        origin: 'string',
        minimum: LETTER_NAME_MIN_LENGTH,
        inclusive: true,
        path: ['anonymousFrom'],
        message: `Sender alias must be at least ${LETTER_NAME_MIN_LENGTH} characters long`,
      });
    }

    if (anonymousFrom.length > LETTER_NAME_MAX_LENGTH) {
      ctx.addIssue({
        code: 'too_big',
        origin: 'string',
        maximum: LETTER_NAME_MAX_LENGTH,
        inclusive: true,
        path: ['anonymousFrom'],
        message: `Sender alias must be at most ${LETTER_NAME_MAX_LENGTH} characters long`,
      });
    }
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

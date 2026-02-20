import z from 'zod';

import { USER_BIO_MAX_LENGTH } from '@/config/user';
import { VisibilityLevel } from '@/generated/prisma/enums';

export const updateUserBioInput = z.object({
  bio: z
    .string('Bio is required')
    .transform((val) => val.trim().replace(/\s+/g, ' '))
    .pipe(
      z
        .string()
        .max(USER_BIO_MAX_LENGTH, `Bio must be at most ${USER_BIO_MAX_LENGTH} characters long`),
    ),
});

export const userNotificationOpenedInput = z.object({
  opened: z.boolean('Opened is required'),
});

export const userNotificationMarkReadInput = z.object({
  isRead: z.boolean('isRead is required'),
});

// settings
export const updateUserLikesVisibilityInput = z.object({
  visibility: z.enum(VisibilityLevel),
});

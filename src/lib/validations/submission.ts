import { z } from 'zod';

export const submissionsTypeQueryInput = z.enum(['submitted', 'rejected']);

export const submissionTypeToStatuses = {
  submitted: ['PENDING', 'FLAGGED'],
  rejected: ['REJECTED'],
} as const;

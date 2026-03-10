import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys/admin';
import {
  getSubmissionThoughts,
  getSubmissionThoughtsCount,
} from '@/services/moderate/thought-submissions';
import { getSubmissionLetters, getSubmissionLettersCount } from '@/services/moderate/submissions';

export const submittedThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.submittedThoughtsPage(page),
    queryFn: () => getSubmissionThoughts({ page, type: 'submitted' }),
  });

export const submittedThoughtsCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.submittedThoughtsCount(),
    queryFn: () => getSubmissionThoughtsCount({ type: 'submitted' }),
  });

export const flaggedThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.flaggedThoughtsPage(page),
    queryFn: () => getSubmissionThoughts({ page, type: 'flagged' }),
  });

export const flaggedThoughtsCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.flaggedThoughtsCount(),
    queryFn: () => getSubmissionThoughtsCount({ type: 'flagged' }),
  });

export const rejectedThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.rejectedThoughtsPage(page),
    queryFn: () => getSubmissionThoughts({ page, type: 'rejected' }),
  });

export const rejectedThoughtsCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.rejectedThoughtsCount(),
    queryFn: () => getSubmissionThoughtsCount({ type: 'rejected' }),
  });

export const submittedLettersPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.submittedLettersPage(page),
    queryFn: () => getSubmissionLetters({ page, type: 'submitted' }),
  });

export const submittedLettersCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.submittedLettersCount(),
    queryFn: () => getSubmissionLettersCount({ type: 'submitted' }),
  });

export const flaggedLettersPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.flaggedLettersPage(page),
    queryFn: () => getSubmissionLetters({ page, type: 'flagged' }),
  });

export const flaggedLettersCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.flaggedLettersCount(),
    queryFn: () => getSubmissionLettersCount({ type: 'flagged' }),
  });

export const rejectedLettersPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.rejectedLettersPage(page),
    queryFn: () => getSubmissionLetters({ page, type: 'rejected' }),
  });

export const rejectedLettersCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.rejectedLettersCount(),
    queryFn: () => getSubmissionLettersCount({ type: 'rejected' }),
  });

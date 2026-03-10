import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys/admin';
import {
  getSubmissionThoughts,
  getSubmissionThoughtsCount,
} from '@/services/moderate/submissions/thought';
import {
  getSubmissionLetters,
  getSubmissionLettersCount,
} from '@/services/moderate/submissions/letter';

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

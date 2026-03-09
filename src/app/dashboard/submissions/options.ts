import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys/admin';
import { getSubmissionLetters, getSubmissionLettersCount } from '@/services/moderate/submissions';

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

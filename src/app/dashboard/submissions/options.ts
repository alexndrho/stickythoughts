import 'client-only';

import { queryOptions } from '@tanstack/react-query';

import { adminKeys } from '@/lib/query-keys/admin';
import { getSubmissionLetters, getSubmissionLettersCount } from '@/services/moderate/submissions';

export const submittedLettersPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.submittedLettersPage(page),
    queryFn: () => getSubmissionLetters({ page, status: 'PENDING' }),
  });

export const submittedLettersCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.submittedLettersCount(),
    queryFn: () => getSubmissionLettersCount({ status: 'PENDING' }),
  });

export const rejectedLettersPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.rejectedLettersPage(page),
    queryFn: () => getSubmissionLetters({ page, status: 'REJECTED' }),
  });

export const rejectedLettersCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.rejectedLettersCount(),
    queryFn: () => getSubmissionLettersCount({ status: 'REJECTED' }),
  });

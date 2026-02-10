import "client-only";

import { queryOptions } from "@tanstack/react-query";

import { adminKeys } from "@/lib/query-keys";
import {
  getDeletedThoughts,
  getDeletedLetters,
  getDeletedLetterReplies,
  getDeletedThoughtsCount,
  getDeletedLettersCount,
  getDeletedRepliesCount,
} from "@/services/moderate/deleted";

export const adminDeletedOptions = queryOptions({
  queryKey: adminKeys.deleted(),
});

export const deletedThoughtsOptions = queryOptions({
  queryKey: adminKeys.deletedThoughts(),
});

export const deletedLettersOptions = queryOptions({
  queryKey: adminKeys.deletedLetters(),
});

export const deletedRepliesOptions = queryOptions({
  queryKey: adminKeys.deletedReplies(),
});

export const deletedThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.deletedThoughtsPage(page),
    queryFn: () => getDeletedThoughts({ page }),
  });

export const deletedThoughtsCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.deletedThoughtsCount(),
    queryFn: () => getDeletedThoughtsCount(),
  });

export const deletedLettersPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.deletedLettersPage(page),
    queryFn: () => getDeletedLetters({ page }),
  });

export const deletedLettersCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.deletedLettersCount(),
    queryFn: () => getDeletedLettersCount(),
  });

export const deletedRepliesPageOptions = (page: number) =>
  queryOptions({
    queryKey: adminKeys.deletedRepliesPage(page),
    queryFn: () => getDeletedLetterReplies({ page }),
  });

export const deletedRepliesCountOptions = () =>
  queryOptions({
    queryKey: adminKeys.deletedRepliesCount(),
    queryFn: () => getDeletedRepliesCount(),
  });

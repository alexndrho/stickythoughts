import { queryOptions } from "@tanstack/react-query";

import { adminOptions } from "../options";
import {
  getDeletedThoughts,
  getDeletedLetters,
  getDeletedLetterReplies,
  getDeletedThoughtsCount,
  getDeletedLettersCount,
  getDeletedRepliesCount,
} from "@/services/moderate/deleted";

export const adminDeletedOptions = queryOptions({
  queryKey: [...adminOptions.queryKey, "deleted"],
});

export const deletedThoughtsOptions = queryOptions({
  queryKey: [...adminDeletedOptions.queryKey, "thoughts"],
});

export const deletedLettersOptions = queryOptions({
  queryKey: [...adminDeletedOptions.queryKey, "letters"],
});

export const deletedRepliesOptions = queryOptions({
  queryKey: [...adminDeletedOptions.queryKey, "replies"],
});

export const deletedThoughtsPageOptions = (page: number) =>
  queryOptions({
    queryKey: [...deletedThoughtsOptions.queryKey, page],
    queryFn: () => getDeletedThoughts({ page }),
  });

export const deletedThoughtsCountOptions = () =>
  queryOptions({
    queryKey: [...deletedThoughtsOptions.queryKey, "count"],
    queryFn: () => getDeletedThoughtsCount(),
  });

export const deletedLettersPageOptions = (page: number) =>
  queryOptions({
    queryKey: [...deletedLettersOptions.queryKey, page],
    queryFn: () => getDeletedLetters({ page }),
  });

export const deletedLettersCountOptions = () =>
  queryOptions({
    queryKey: [...deletedLettersOptions.queryKey, "count"],
    queryFn: () => getDeletedLettersCount(),
  });

export const deletedRepliesPageOptions = (page: number) =>
  queryOptions({
    queryKey: [...deletedRepliesOptions.queryKey, page],
    queryFn: () => getDeletedLetterReplies({ page }),
  });

export const deletedRepliesCountOptions = () =>
  queryOptions({
    queryKey: [...deletedRepliesOptions.queryKey, "count"],
    queryFn: () => getDeletedRepliesCount(),
  });

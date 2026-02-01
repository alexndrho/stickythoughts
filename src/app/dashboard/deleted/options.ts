import { queryOptions } from "@tanstack/react-query";

import { adminOptions } from "../options";
import {
  getDeletedThoughts,
  getDeletedThreads,
  getDeletedThreadComments,
  getDeletedThoughtsCount,
  getDeletedThreadsCount,
  getDeletedCommentsCount,
} from "@/services/moderate/deleted";

export const adminDeletedOptions = queryOptions({
  queryKey: [...adminOptions.queryKey, "deleted"],
});

export const deletedThoughtsOptions = queryOptions({
  queryKey: [...adminDeletedOptions.queryKey, "thoughts"],
});

export const deletedThreadsOptions = queryOptions({
  queryKey: [...adminDeletedOptions.queryKey, "threads"],
});

export const deletedCommentsOptions = queryOptions({
  queryKey: [...adminDeletedOptions.queryKey, "comments"],
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

export const deletedThreadsPageOptions = (page: number) =>
  queryOptions({
    queryKey: [...deletedThreadsOptions.queryKey, page],
    queryFn: () => getDeletedThreads({ page }),
  });

export const deletedThreadsCountOptions = () =>
  queryOptions({
    queryKey: [...deletedThreadsOptions.queryKey, "count"],
    queryFn: () => getDeletedThreadsCount(),
  });

export const deletedCommentsPageOptions = (page: number) =>
  queryOptions({
    queryKey: [...deletedCommentsOptions.queryKey, page],
    queryFn: () => getDeletedThreadComments({ page }),
  });

export const deletedCommentsCountOptions = () =>
  queryOptions({
    queryKey: [...deletedCommentsOptions.queryKey, "count"],
    queryFn: () => getDeletedCommentsCount(),
  });

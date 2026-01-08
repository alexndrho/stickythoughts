import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getThoughts, getThoughtsCount } from "@/services/thought";
import { THOUGHTS_PER_PAGE } from "@/config/thought";

// query options
export const thoughtsOptions = queryOptions({
  queryKey: ["thoughts"],
});

export const thoughtCountOptions = queryOptions({
  queryKey: [...thoughtsOptions.queryKey, "count"],
  queryFn: async () => {
    return await getThoughtsCount();
  },
});

export const thoughtPageOptions = (page: number) => {
  return queryOptions({
    queryKey: [...thoughtsOptions.queryKey, page],
    queryFn: () => getThoughts({ page }),
  });
};

// infinite query options
export const thoughtsInfiniteOptions = infiniteQueryOptions({
  queryKey: [...thoughtsOptions.queryKey, "infiniteThoughts"],
  initialPageParam: undefined,
  queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
    getThoughts({ lastId: pageParam }),
  getNextPageParam: (thoughts) => {
    if (thoughts.length < THOUGHTS_PER_PAGE) return undefined;

    return thoughts[thoughts.length - 1].id;
  },
});

export const thoughtsSearchInfiniteOptions = (search: string) => {
  return infiniteQueryOptions({
    queryKey: [...thoughtsInfiniteOptions.queryKey, "infiniteSearch", search],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (!search) return [];

      return getThoughts({ lastId: pageParam, searchTerm: search });
    },
    enabled: Boolean(search),
    getNextPageParam: (thoughts) => {
      if (thoughts.length < THOUGHTS_PER_PAGE) return undefined;

      return thoughts[thoughts.length - 1].id;
    },
  });
};

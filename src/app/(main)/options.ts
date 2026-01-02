import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getThoughts, getThoughtsCount } from "@/services/thought";
import { THOUGHTS_PER_PAGE } from "@/config/thought";

// query options
export const thoughtOptions = queryOptions({
  queryKey: ["thoughts"],
});

export const thoughtCountOptions = queryOptions({
  queryKey: [...thoughtOptions.queryKey, "count"],
  queryFn: async () => {
    return await getThoughtsCount();
  },
});

export const thoughtPageOptions = (page: number) => {
  return queryOptions({
    queryKey: [...thoughtOptions.queryKey, page],
    queryFn: () => getThoughts({ page }),
  });
};

// infinite query options
export const thoughtInfiniteOptions = infiniteQueryOptions({
  queryKey: [...thoughtCountOptions.queryKey, "infiniteThoughts"],
  initialPageParam: undefined,
  queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
    getThoughts({ lastId: pageParam }),
  getNextPageParam: (thoughts) => {
    if (thoughts.length < THOUGHTS_PER_PAGE) return undefined;

    return thoughts[thoughts.length - 1].id;
  },
});

export const thoughtSearchInfiniteOptions = (search: string) => {
  return infiniteQueryOptions({
    queryKey: [
      ...thoughtInfiniteOptions.queryKey,
      "thoughts",
      "search",
      search,
    ],
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

import 'client-only';

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getHighlightedThought, getThoughts, getThoughtsCount } from '@/services/thought';
import { THOUGHTS_PER_PAGE } from '@/config/thought';
import { thoughtKeys } from '@/lib/query-keys/thought';

// query options
export const thoughtsOptions = queryOptions({
  queryKey: thoughtKeys.all(),
});

export const thoughtCountOptions = queryOptions({
  queryKey: thoughtKeys.count(),
  queryFn: async () => {
    return await getThoughtsCount();
  },
});

export const highlightedThoughtOptions = queryOptions({
  queryKey: thoughtKeys.highlighted(),
  queryFn: async () => {
    return await getHighlightedThought();
  },
});

// infinite query options
export const thoughtsInfiniteOptions = infiniteQueryOptions({
  queryKey: thoughtKeys.infinite(),
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
    queryKey: thoughtKeys.infiniteSearch(search),
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

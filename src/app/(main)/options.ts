import 'client-only';

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getHighlightedThought, getThoughts, getThoughtsCount } from '@/services/thought';
import { THOUGHTS_PER_PAGE } from '@/config/thought';
import { thoughtKeys } from '@/lib/query-keys/thought';
import { ThoughtsSort } from '@/types/thought';

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
export const thoughtsInfiniteOptions = ({ sort, seed }: { sort: ThoughtsSort; seed?: string }) =>
  infiniteQueryOptions({
    queryKey: thoughtKeys.infinite({ sort, seed }),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getThoughts({ sort, lastId: pageParam, seed }),
    getNextPageParam: (thoughts) => {
      if (thoughts.length < THOUGHTS_PER_PAGE) return undefined;

      return thoughts[thoughts.length - 1].id;
    },
  });

export const thoughtsSearchInfiniteOptions = ({
  search,
  sort,
  seed,
}: {
  search: string;
  sort: ThoughtsSort;
  seed?: string;
}) => {
  return infiniteQueryOptions({
    queryKey: thoughtKeys.infiniteSearch({ search, sort, seed }),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) => {
      if (!search) return [];

      return getThoughts({ lastId: pageParam, searchTerm: search, sort, seed });
    },
    enabled: Boolean(search),
    getNextPageParam: (thoughts) => {
      if (thoughts.length < THOUGHTS_PER_PAGE) return undefined;

      return thoughts[thoughts.length - 1].id;
    },
  });
};

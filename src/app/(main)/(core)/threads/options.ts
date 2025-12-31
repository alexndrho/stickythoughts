import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";

import { getThreadComments, getThread, getThreads } from "@/services/thread";
import type { SearchSegmentType } from "@/types/search";
import { getSearchResults } from "@/services/search";
import { THREAD_COMMENTS_PER_PAGE, THREADS_PER_PAGE } from "@/config/thread";

// thread
export const threadBaseOptions = queryOptions({
  queryKey: ["thread"],
});

export const threadOptions = (id: string) => {
  return queryOptions({
    queryKey: [...threadBaseOptions.queryKey, id],
    queryFn: () => getThread(id),
  });
};

export const threadInfiniteOptions = infiniteQueryOptions({
  queryKey: ["infiniteThread"],
  initialPageParam: undefined,
  queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
    getThreads({ lastId: pageParam }),
  getNextPageParam: (posts) => {
    if (posts.length < THREADS_PER_PAGE) return undefined;

    return posts[posts.length - 1].id;
  },
});

// thread comments
export const threadCommentsInfiniteOptions = (threadId: string) => {
  return infiniteQueryOptions({
    queryKey: [...threadBaseOptions.queryKey, threadId, "comments"],
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getThreadComments({ id: threadId, lastId: pageParam }),
    getNextPageParam: (comments) => {
      if (comments.length < THREAD_COMMENTS_PER_PAGE) return undefined;

      return comments[comments.length - 1].id;
    },
  });
};

// search
export const searchBaseOptions = queryOptions({
  queryKey: ["search"],
});

export const searchOptions = ({
  query,
  type,
}: {
  query: string;
  type?: SearchSegmentType;
}) => {
  return queryOptions({
    queryKey: [...searchBaseOptions.queryKey, query, type],
    queryFn: () => getSearchResults(query, type),
  });
};

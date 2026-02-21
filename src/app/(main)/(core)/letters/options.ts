import 'client-only';

import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';

import { getLetterReplies, getLetter, getLetters } from '@/services/letter';
import type { SearchSegmentType } from '@/types/search';
import { getSearchResults } from '@/services/search';
import { LETTER_REPLIES_PER_PAGE, LETTERS_PER_PAGE } from '@/config/letter';
import { letterKeys } from '@/lib/query-keys/letter';
import { searchKeys } from '@/lib/query-keys/search';

// letter
export const letterBaseOptions = queryOptions({
  queryKey: letterKeys.all(),
});

export const letterOptions = (id: string) => {
  return queryOptions({
    queryKey: letterKeys.byId(id),
    queryFn: () => getLetter(id),
  });
};

export const lettersInfiniteOptions = infiniteQueryOptions({
  queryKey: letterKeys.infiniteList(),
  initialPageParam: undefined,
  queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
    getLetters({ lastId: pageParam }),
  getNextPageParam: (posts) => {
    if (posts.length < LETTERS_PER_PAGE) return undefined;

    return posts[posts.length - 1].id;
  },
});

// letter replies
export const letterRepliesInfiniteOptions = (letterId: string) => {
  return infiniteQueryOptions({
    queryKey: letterKeys.infiniteReplies(letterId),
    initialPageParam: undefined,
    queryFn: async ({ pageParam }: { pageParam: string | undefined }) =>
      getLetterReplies({ id: letterId, lastId: pageParam }),
    getNextPageParam: (replies) => {
      if (replies.length < LETTER_REPLIES_PER_PAGE) return undefined;

      return replies[replies.length - 1].id;
    },
  });
};

// search
export const searchBaseOptions = queryOptions({
  queryKey: searchKeys.all(),
});

export const searchOptions = ({ query, type }: { query: string; type?: SearchSegmentType }) => {
  return queryOptions({
    queryKey: searchKeys.results({ query, type }),
    queryFn: () => getSearchResults(query, type),
  });
};

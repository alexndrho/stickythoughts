import { type InfiniteData } from '@tanstack/react-query';

import { getQueryClient } from '@/lib/get-query-client';
import { thoughtKeys } from '@/lib/query-keys/thought';
import { THOUGHTS_PER_PAGE } from '@/config/thought';
import type { PublicThought } from '@/types/thought';
import { chunk } from '@/utils/array';

export const setSubmitThoughtQueryData = (thought: PublicThought) => {
  const queryClient = getQueryClient();

  queryClient.setQueryData<InfiniteData<PublicThought[]>>(
    thoughtKeys.infinite({ sort: 'newest' }),
    (oldData) => {
      if (!oldData) return oldData;

      // Flatten all pages, prepend the new thought, drop the last one,
      // then re-chunk so every page stays at THOUGHTS_PER_PAGE items.
      const all = [thought, ...oldData.pages.flat()].slice(
        0,
        THOUGHTS_PER_PAGE * oldData.pages.length,
      );
      const pages = chunk(all, THOUGHTS_PER_PAGE);

      return { ...oldData, pages };
    },
  );

  queryClient.setQueryData<number>(thoughtKeys.count(), (oldCount) =>
    oldCount !== undefined ? oldCount + 1 : oldCount,
  );

  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey;
      return key[0] === 'thoughts' && key[1] === 'infiniteThoughts' && key[2] !== 'newest';
    },
  });
};

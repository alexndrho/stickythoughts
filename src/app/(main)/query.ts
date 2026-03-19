import 'server-only';

import { unstable_cache } from 'next/cache';

import { CACHE_TAGS } from '@/config/cache-tags';
import { THOUGHT_HIGHLIGHT_MAX_AGE_MS } from '@/config/thought';
import {
  countPublicThoughts as countPublicThoughtsService,
  getHighlightedThought as getHighlightedThoughtService,
  listPublicThoughts as listPublicThoughtsService,
} from '@/server/thought/thoughts';
import { getQotd } from '@/utils/text';
import type { PublicThought } from '@/types/thought';

const listPublicThoughtsCached = unstable_cache(
  async () => {
    return listPublicThoughtsService({});
  },
  ['public-thought-list'],
  {
    tags: [CACHE_TAGS.PUBLIC_THOUGHT],
  },
);

const countPublicThoughtsCached = unstable_cache(
  async () => countPublicThoughtsService(),
  ['public-thought-count'],
  {
    tags: [CACHE_TAGS.PUBLIC_THOUGHT_COUNT],
  },
);

const getHighlightedThoughtCached = unstable_cache(
  async () => getHighlightedThoughtService(),
  ['public-thought-highlight'],
  {
    tags: [CACHE_TAGS.PUBLIC_THOUGHT_HIGHLIGHT],
    revalidate: THOUGHT_HIGHLIGHT_MAX_AGE_MS / 1000,
  },
);

const getQotdCached = unstable_cache(async () => getQotd(), ['qotd'], {
  tags: [CACHE_TAGS.QOTD],
});

export async function getQuestionOfTheDay(): Promise<string> {
  return getQotdCached();
}

export async function listPublicThoughts(): Promise<PublicThought[]> {
  return listPublicThoughtsCached();
}

export async function countPublicThoughts(): Promise<number> {
  return countPublicThoughtsCached();
}

export async function getHighlightedThought(): Promise<PublicThought | null> {
  return getHighlightedThoughtCached();
}

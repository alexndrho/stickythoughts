import "server-only";

import { unstable_cache } from "next/cache";

import { CACHE_TAGS } from "@/config/cache-tags";
import type { PublicThoughtPayload } from "@/types/thought";
import {
  countPublicThoughts as countPublicThoughtsService,
  listPublicThoughts as listPublicThoughtsService,
} from "@/server/thought/thoughts-service";
import {
  getHighlightedThought as getHighlightedThoughtService,
  type HighlightedThought,
} from "@/server/thought/thought-highlight-service";

const listPublicThoughtsCached = unstable_cache(
  async () => listPublicThoughtsService({}),
  ["public-thought-list"],
  {
    tags: [CACHE_TAGS.PUBLIC_THOUGHT],
  },
);

const countPublicThoughtsCached = unstable_cache(
  async () => countPublicThoughtsService(),
  ["public-thought-count"],
  {
    tags: [CACHE_TAGS.PUBLIC_THOUGHT_COUNT],
  },
);

const getHighlightedThoughtCached = unstable_cache(
  async () => getHighlightedThoughtService(),
  ["public-thought-highlight"],
  {
    tags: [CACHE_TAGS.PUBLIC_THOUGHT_HIGHLIGHT],
  },
);

export async function listPublicThoughts(): Promise<PublicThoughtPayload[]> {
  return listPublicThoughtsCached();
}

export async function countPublicThoughts(): Promise<number> {
  return countPublicThoughtsCached();
}

export async function getHighlightedThought(): Promise<HighlightedThought | null> {
  return getHighlightedThoughtCached();
}
